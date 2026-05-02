-- =============================================================================
-- Migration 035: Phase 5 Marketplace Trust Loops
-- =============================================================================
-- Reviews and disputes must be durable collaboration records, not direct client
-- table writes. This phase routes creation/resolution through audited RPCs,
-- recalculates public reputation, and keeps dispute counters current.
-- =============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname IN ('reviews_application_id_reviewer_id_key', 'reviews_one_review_per_reviewer')
  ) THEN
    ALTER TABLE reviews
      ADD CONSTRAINT reviews_one_review_per_reviewer UNIQUE(application_id, reviewer_id);
  END IF;
END $$;

ALTER TABLE disputes
  DROP CONSTRAINT IF EXISTS disputes_dispute_type_check;

ALTER TABLE disputes
  ADD CONSTRAINT disputes_dispute_type_check
  CHECK (dispute_type IN (
    'non_payment',
    'product_not_received',
    'no_content',
    'content_quality',
    'compliance_violation',
    'other'
  ));

CREATE INDEX IF NOT EXISTS idx_reviews_published_reputation
  ON reviews(reviewee_id, created_at DESC)
  WHERE review_status = 'published';

CREATE INDEX IF NOT EXISTS idx_disputes_open_counter
  ON disputes(filed_against, status)
  WHERE status IN ('open', 'under_review', 'escalated');

DROP POLICY IF EXISTS "Platform admins can read disputes" ON disputes;
CREATE POLICY "Platform admins can read disputes"
  ON disputes FOR SELECT
  USING (is_platform_admin(auth.uid()));

CREATE OR REPLACE FUNCTION recalculate_user_reputation(p_user_id UUID)
RETURNS users
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_average NUMERIC(2,1);
  v_count INTEGER;
  v_user users%ROWTYPE;
BEGIN
  SELECT
    ROUND(AVG(COALESCE(
      overall_score,
      (
        SELECT AVG(score)::NUMERIC
        FROM (VALUES
          (content_quality_score),
          (professionalism_score),
          (timeliness_score),
          (payment_speed_score),
          (communication_score),
          (product_quality_score)
        ) AS dimension_scores(score)
        WHERE score IS NOT NULL
      )
    ))::NUMERIC, 1),
    COUNT(*)::INTEGER
    INTO v_average, v_count
  FROM reviews
  WHERE reviewee_id = p_user_id
    AND review_status = 'published';

  UPDATE users
  SET
    review_score = v_average,
    review_count = COALESCE(v_count, 0),
    badges = CASE
      WHEN COALESCE(v_count, 0) >= 10 AND COALESCE(v_average, 0) >= 4.8 THEN
        array_append(array_remove(array_remove(badges, 'highly_rated'), 'top_rated'), 'top_rated')
      WHEN COALESCE(v_count, 0) >= 3 AND COALESCE(v_average, 0) >= 4.5 THEN
        array_append(array_remove(array_remove(badges, 'highly_rated'), 'top_rated'), 'highly_rated')
      ELSE
        array_remove(array_remove(badges, 'highly_rated'), 'top_rated')
    END,
    updated_at = NOW()
  WHERE id = p_user_id
  RETURNING * INTO v_user;

  RETURN v_user;
END;
$$;

CREATE OR REPLACE FUNCTION recalculate_user_dispute_counters(p_user_id UUID)
RETURNS users
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user users%ROWTYPE;
BEGIN
  UPDATE users
  SET
    dispute_count = (
      SELECT COUNT(*)::INTEGER
      FROM disputes
      WHERE filed_against = p_user_id
    ),
    unresolved_disputes = (
      SELECT COUNT(*)::INTEGER
      FROM disputes
      WHERE filed_against = p_user_id
        AND status IN ('open', 'under_review', 'escalated')
    ),
    updated_at = NOW()
  WHERE id = p_user_id
  RETURNING * INTO v_user;

  RETURN v_user;
END;
$$;

CREATE OR REPLACE FUNCTION trg_recalculate_review_reputation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP IN ('INSERT', 'UPDATE') THEN
    PERFORM recalculate_user_reputation(NEW.reviewee_id);
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.reviewee_id IS DISTINCT FROM NEW.reviewee_id THEN
    PERFORM recalculate_user_reputation(OLD.reviewee_id);
  END IF;

  IF TG_OP = 'DELETE' THEN
    PERFORM recalculate_user_reputation(OLD.reviewee_id);
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_reviews_recalculate_reputation ON reviews;
CREATE TRIGGER trg_reviews_recalculate_reputation
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION trg_recalculate_review_reputation();

CREATE OR REPLACE FUNCTION trg_recalculate_dispute_counters()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP IN ('INSERT', 'UPDATE') THEN
    PERFORM recalculate_user_dispute_counters(NEW.filed_against);
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.filed_against IS DISTINCT FROM NEW.filed_against THEN
    PERFORM recalculate_user_dispute_counters(OLD.filed_against);
  END IF;

  IF TG_OP = 'DELETE' THEN
    PERFORM recalculate_user_dispute_counters(OLD.filed_against);
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_disputes_recalculate_counters ON disputes;
CREATE TRIGGER trg_disputes_recalculate_counters
  AFTER INSERT OR UPDATE OR DELETE ON disputes
  FOR EACH ROW
  EXECUTE FUNCTION trg_recalculate_dispute_counters();

CREATE OR REPLACE FUNCTION create_marketplace_review(
  p_application_id UUID,
  p_review_text TEXT DEFAULT NULL,
  p_content_quality_score INTEGER DEFAULT NULL,
  p_professionalism_score INTEGER DEFAULT NULL,
  p_timeliness_score INTEGER DEFAULT NULL,
  p_payment_speed_score INTEGER DEFAULT NULL,
  p_communication_score INTEGER DEFAULT NULL,
  p_product_quality_score INTEGER DEFAULT NULL
)
RETURNS reviews
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_id UUID := auth.uid();
  v_application applications%ROWTYPE;
  v_opportunity opportunities%ROWTYPE;
  v_reviewee_id UUID;
  v_overall NUMERIC(2,1);
  v_review reviews%ROWTYPE;
BEGIN
  IF v_actor_id IS NULL THEN
    RAISE EXCEPTION 'NOT_SIGNED_IN';
  END IF;

  SELECT *
    INTO v_application
    FROM applications
    WHERE id = p_application_id
    FOR UPDATE;

  IF v_application.id IS NULL THEN
    RAISE EXCEPTION 'APPLICATION_NOT_FOUND';
  END IF;

  IF v_application.status IS DISTINCT FROM 'completed' THEN
    RAISE EXCEPTION 'Application must be completed before review';
  END IF;

  SELECT *
    INTO v_opportunity
    FROM opportunities
    WHERE id = v_application.opportunity_id;

  IF v_opportunity.id IS NULL THEN
    RAISE EXCEPTION 'CAMPAIGN_NOT_FOUND';
  END IF;

  IF v_actor_id = v_application.creator_id THEN
    v_reviewee_id := v_opportunity.brand_id;
  ELSIF has_brand_role(v_opportunity.brand_id, v_actor_id, ARRAY['owner', 'admin', 'campaign_manager']) THEN
    v_reviewee_id := v_application.creator_id;
  ELSE
    RAISE EXCEPTION 'NOT_AUTHORIZED_TO_REVIEW_APPLICATION';
  END IF;

  IF EXISTS (
    SELECT 1 FROM reviews
    WHERE application_id = p_application_id
      AND reviewer_id = v_actor_id
  ) THEN
    RAISE EXCEPTION 'REVIEW_ALREADY_EXISTS';
  END IF;

  SELECT ROUND(AVG(score)::NUMERIC, 1)
    INTO v_overall
  FROM (VALUES
    (p_content_quality_score),
    (p_professionalism_score),
    (p_timeliness_score),
    (p_payment_speed_score),
    (p_communication_score),
    (p_product_quality_score)
  ) AS dimension_scores(score)
  WHERE score IS NOT NULL;

  IF v_overall IS NULL THEN
    RAISE EXCEPTION 'REVIEW_SCORE_REQUIRED';
  END IF;

  INSERT INTO reviews (
    application_id,
    reviewer_id,
    reviewee_id,
    content_quality_score,
    professionalism_score,
    timeliness_score,
    payment_speed_score,
    communication_score,
    product_quality_score,
    overall_score,
    review_text,
    review_status
  ) VALUES (
    p_application_id,
    v_actor_id,
    v_reviewee_id,
    p_content_quality_score,
    p_professionalism_score,
    p_timeliness_score,
    p_payment_speed_score,
    p_communication_score,
    p_product_quality_score,
    v_overall,
    NULLIF(p_review_text, ''),
    'published'
  )
  RETURNING * INTO v_review;

  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    related_user_id,
    related_application_id,
    related_opportunity_id
  ) VALUES (
    v_reviewee_id,
    'review_received',
    'New collaboration review',
    'A completed BudCast collaboration received a marketplace review.',
    v_actor_id,
    p_application_id,
    v_application.opportunity_id
  );

  RETURN v_review;
END;
$$;

CREATE OR REPLACE FUNCTION file_marketplace_dispute(
  p_application_id UUID,
  p_dispute_type TEXT,
  p_description TEXT,
  p_evidence_urls TEXT[] DEFAULT ARRAY[]::TEXT[]
)
RETURNS disputes
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_id UUID := auth.uid();
  v_application applications%ROWTYPE;
  v_opportunity opportunities%ROWTYPE;
  v_filed_against UUID;
  v_dispute disputes%ROWTYPE;
BEGIN
  IF v_actor_id IS NULL THEN
    RAISE EXCEPTION 'NOT_SIGNED_IN';
  END IF;

  IF p_dispute_type NOT IN ('non_payment', 'product_not_received', 'no_content', 'content_quality', 'compliance_violation', 'other') THEN
    RAISE EXCEPTION 'INVALID_DISPUTE_TYPE';
  END IF;

  IF char_length(COALESCE(NULLIF(p_description, ''), '')) < 10 THEN
    RAISE EXCEPTION 'DISPUTE_DESCRIPTION_REQUIRED';
  END IF;

  SELECT *
    INTO v_application
    FROM applications
    WHERE id = p_application_id
    FOR UPDATE;

  IF v_application.id IS NULL THEN
    RAISE EXCEPTION 'APPLICATION_NOT_FOUND';
  END IF;

  SELECT *
    INTO v_opportunity
    FROM opportunities
    WHERE id = v_application.opportunity_id;

  IF v_opportunity.id IS NULL THEN
    RAISE EXCEPTION 'CAMPAIGN_NOT_FOUND';
  END IF;

  IF v_actor_id = v_application.creator_id THEN
    v_filed_against := v_opportunity.brand_id;
  ELSIF has_brand_role(v_opportunity.brand_id, v_actor_id, ARRAY['owner', 'admin', 'campaign_manager', 'content_reviewer']) THEN
    v_filed_against := v_application.creator_id;
  ELSE
    RAISE EXCEPTION 'NOT_AUTHORIZED_TO_FILE_DISPUTE';
  END IF;

  INSERT INTO disputes (
    application_id,
    filed_by,
    filed_against,
    dispute_type,
    description,
    evidence_urls,
    status,
    payment_issue_flag,
    product_not_received_flag,
    admin_flagged_at
  ) VALUES (
    p_application_id,
    v_actor_id,
    v_filed_against,
    p_dispute_type,
    p_description,
    COALESCE(p_evidence_urls, ARRAY[]::TEXT[]),
    'open',
    p_dispute_type = 'non_payment',
    p_dispute_type = 'product_not_received',
    CASE WHEN p_dispute_type IN ('non_payment', 'product_not_received', 'compliance_violation') THEN NOW() ELSE NULL END
  )
  RETURNING * INTO v_dispute;

  UPDATE applications
  SET status = 'disputed'
  WHERE id = p_application_id
    AND status IN ('accepted', 'completed');

  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    related_user_id,
    related_application_id,
    related_opportunity_id
  ) VALUES (
    v_filed_against,
    'dispute_opened',
    'Collaboration dispute opened',
    'A BudCast collaboration has been flagged for review.',
    v_actor_id,
    p_application_id,
    v_application.opportunity_id
  );

  RETURN v_dispute;
END;
$$;

CREATE OR REPLACE FUNCTION resolve_marketplace_dispute(
  p_dispute_id UUID,
  p_status TEXT,
  p_resolution TEXT DEFAULT NULL,
  p_credits_refunded BOOLEAN DEFAULT FALSE,
  p_account_suspended BOOLEAN DEFAULT FALSE
)
RETURNS disputes
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_id UUID := auth.uid();
  v_dispute disputes%ROWTYPE;
BEGIN
  IF v_actor_id IS NULL THEN
    RAISE EXCEPTION 'NOT_SIGNED_IN';
  END IF;

  IF NOT is_platform_admin(v_actor_id) THEN
    RAISE EXCEPTION 'PLATFORM_ADMIN_REQUIRED';
  END IF;

  IF p_status NOT IN ('under_review', 'resolved', 'escalated', 'closed') THEN
    RAISE EXCEPTION 'INVALID_DISPUTE_STATUS';
  END IF;

  UPDATE disputes
  SET
    status = p_status,
    resolution = COALESCE(NULLIF(p_resolution, ''), resolution),
    resolved_by = CASE WHEN p_status IN ('resolved', 'closed') THEN v_actor_id ELSE resolved_by END,
    resolved_at = CASE WHEN p_status IN ('resolved', 'closed') THEN NOW() ELSE resolved_at END,
    credits_refunded = CASE WHEN p_credits_refunded THEN TRUE ELSE credits_refunded END,
    account_suspended = CASE WHEN p_account_suspended THEN TRUE ELSE account_suspended END,
    admin_flagged_at = COALESCE(admin_flagged_at, NOW()),
    updated_at = NOW()
  WHERE id = p_dispute_id
  RETURNING * INTO v_dispute;

  IF v_dispute.id IS NULL THEN
    RAISE EXCEPTION 'DISPUTE_NOT_FOUND';
  END IF;

  IF p_account_suspended THEN
    UPDATE users
    SET account_status = 'suspended',
        updated_at = NOW()
    WHERE id = v_dispute.filed_against;
  END IF;

  IF p_status IN ('resolved', 'closed') THEN
    UPDATE applications
    SET status = 'completed'
    WHERE id = v_dispute.application_id
      AND status = 'disputed';

    INSERT INTO notifications (
      user_id,
      type,
      title,
      message,
      related_user_id,
      related_application_id
    ) VALUES
      (
        v_dispute.filed_by,
        'dispute_resolved',
        'Dispute resolved',
        'BudCast reviewed the collaboration dispute.',
        v_actor_id,
        v_dispute.application_id
      ),
      (
        v_dispute.filed_against,
        'dispute_resolved',
        'Dispute resolved',
        'BudCast reviewed the collaboration dispute.',
        v_actor_id,
        v_dispute.application_id
      );
  END IF;

  RETURN v_dispute;
END;
$$;

CREATE OR REPLACE FUNCTION confirm_submission_fulfillment(
  p_submission_id UUID,
  p_payment_method TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_id UUID := auth.uid();
  v_submission content_submissions%ROWTYPE;
  v_brand_id UUID;
  v_next_submission content_submissions%ROWTYPE;
BEGIN
  IF v_actor_id IS NULL THEN
    RAISE EXCEPTION 'NOT_SIGNED_IN';
  END IF;

  SELECT cs.*
    INTO v_submission
    FROM content_submissions cs
    WHERE cs.id = p_submission_id
    FOR UPDATE;

  IF v_submission.id IS NULL THEN
    RAISE EXCEPTION 'SUBMISSION_NOT_FOUND';
  END IF;

  IF v_submission.verification_status IS DISTINCT FROM 'verified' THEN
    RAISE EXCEPTION 'SUBMISSION_NOT_VERIFIED';
  END IF;

  SELECT o.brand_id
    INTO v_brand_id
    FROM applications a
    JOIN opportunities o ON o.id = a.opportunity_id
    WHERE a.id = v_submission.application_id;

  IF v_actor_id = v_submission.creator_id THEN
    UPDATE content_submissions
      SET payment_confirmed_by_creator = TRUE,
          creator_confirmed_at = NOW(),
          creator_confirmed_by_user_id = v_actor_id
      WHERE id = p_submission_id
      RETURNING * INTO v_next_submission;
  ELSIF has_brand_role(v_brand_id, v_actor_id, ARRAY['owner', 'admin', 'campaign_manager']) THEN
    UPDATE content_submissions
      SET payment_confirmed_by_brand = TRUE,
          brand_confirmed_at = NOW(),
          brand_confirmed_by_user_id = v_actor_id,
          payment_confirmed_by_user_id = v_actor_id,
          payment_method = COALESCE(NULLIF(p_payment_method, ''), payment_method)
      WHERE id = p_submission_id
      RETURNING * INTO v_next_submission;
  ELSE
    RAISE EXCEPTION 'NOT_AUTHORIZED_TO_CONFIRM_FULFILLMENT';
  END IF;

  IF v_next_submission.payment_confirmed_by_brand
     AND v_next_submission.payment_confirmed_by_creator THEN
    UPDATE applications
      SET status = 'completed',
          completed_at = COALESCE(completed_at, NOW())
      WHERE id = v_next_submission.application_id
        AND status IN ('accepted', 'disputed');
  END IF;

  RETURN jsonb_build_object(
    'id', p_submission_id,
    'confirmed_by', v_actor_id,
    'side', CASE WHEN v_actor_id = v_submission.creator_id THEN 'creator' ELSE 'brand' END
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION recalculate_user_reputation(UUID) FROM anon;
REVOKE EXECUTE ON FUNCTION recalculate_user_reputation(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION recalculate_user_dispute_counters(UUID) FROM anon;
REVOKE EXECUTE ON FUNCTION recalculate_user_dispute_counters(UUID) FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION create_marketplace_review(UUID, TEXT, INTEGER, INTEGER, INTEGER, INTEGER, INTEGER, INTEGER) FROM anon;
REVOKE EXECUTE ON FUNCTION create_marketplace_review(UUID, TEXT, INTEGER, INTEGER, INTEGER, INTEGER, INTEGER, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION create_marketplace_review(UUID, TEXT, INTEGER, INTEGER, INTEGER, INTEGER, INTEGER, INTEGER) TO authenticated;

REVOKE EXECUTE ON FUNCTION file_marketplace_dispute(UUID, TEXT, TEXT, TEXT[]) FROM anon;
REVOKE EXECUTE ON FUNCTION file_marketplace_dispute(UUID, TEXT, TEXT, TEXT[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION file_marketplace_dispute(UUID, TEXT, TEXT, TEXT[]) TO authenticated;

REVOKE EXECUTE ON FUNCTION resolve_marketplace_dispute(UUID, TEXT, TEXT, BOOLEAN, BOOLEAN) FROM anon;
REVOKE EXECUTE ON FUNCTION resolve_marketplace_dispute(UUID, TEXT, TEXT, BOOLEAN, BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION resolve_marketplace_dispute(UUID, TEXT, TEXT, BOOLEAN, BOOLEAN) TO authenticated;

REVOKE EXECUTE ON FUNCTION confirm_submission_fulfillment(UUID, TEXT) FROM anon;
REVOKE EXECUTE ON FUNCTION confirm_submission_fulfillment(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION confirm_submission_fulfillment(UUID, TEXT) TO authenticated;
