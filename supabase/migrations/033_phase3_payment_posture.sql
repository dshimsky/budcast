-- =============================================================================
-- Migration 033: Phase 3 Payment Posture
-- =============================================================================
-- Keep launch payments outside platform rails while preserving auditable manual
-- payout/product confirmation evidence and admin-visible issue flags.
-- =============================================================================

ALTER TABLE content_submissions
  ADD COLUMN IF NOT EXISTS brand_confirmed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS creator_confirmed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL;

UPDATE content_submissions
SET brand_confirmed_by_user_id = COALESCE(brand_confirmed_by_user_id, payment_confirmed_by_user_id)
WHERE payment_confirmed_by_brand IS TRUE;

CREATE INDEX IF NOT EXISTS idx_content_submissions_brand_confirmed_by_user
  ON content_submissions(brand_confirmed_by_user_id);

CREATE INDEX IF NOT EXISTS idx_content_submissions_creator_confirmed_by_user
  ON content_submissions(creator_confirmed_by_user_id);

ALTER TABLE safety_reports
  ADD COLUMN IF NOT EXISTS payment_issue_flag BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS product_not_received_flag BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE safety_reports
  DROP CONSTRAINT IF EXISTS safety_reports_reason_type_check;

ALTER TABLE safety_reports
  ADD CONSTRAINT safety_reports_reason_type_check
  CHECK (reason_type IN (
    'spam',
    'harassment',
    'unsafe_content',
    'misrepresentation',
    'payment_issue',
    'product_not_received',
    'other'
  ));

UPDATE safety_reports
SET
  payment_issue_flag = TRUE
WHERE reason_type = 'payment_issue'
   OR metadata->>'payment_issue_flag' = 'true';

UPDATE safety_reports
SET
  product_not_received_flag = TRUE
WHERE reason_type = 'product_not_received'
   OR metadata->>'product_not_received_flag' = 'true';

CREATE INDEX IF NOT EXISTS idx_safety_reports_payment_product_flags
  ON safety_reports(status, payment_issue_flag, product_not_received_flag, created_at DESC);

ALTER TABLE disputes
  ADD COLUMN IF NOT EXISTS payment_issue_flag BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS product_not_received_flag BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS admin_flagged_at TIMESTAMPTZ;

ALTER TABLE disputes
  DROP CONSTRAINT IF EXISTS disputes_dispute_type_check;

ALTER TABLE disputes
  ADD CONSTRAINT disputes_dispute_type_check
  CHECK (dispute_type IN ('non_payment', 'product_not_received', 'no_content', 'content_quality', 'other'));

UPDATE disputes
SET
  payment_issue_flag = TRUE,
  admin_flagged_at = COALESCE(admin_flagged_at, NOW())
WHERE dispute_type = 'non_payment';

UPDATE disputes
SET
  product_not_received_flag = TRUE,
  admin_flagged_at = COALESCE(admin_flagged_at, NOW())
WHERE dispute_type = 'product_not_received';

CREATE INDEX IF NOT EXISTS idx_disputes_payment_product_flags
  ON disputes(status, payment_issue_flag, product_not_received_flag, created_at DESC);

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
      WHERE id = p_submission_id;
  ELSIF has_brand_role(v_brand_id, v_actor_id, ARRAY['owner', 'admin', 'campaign_manager']) THEN
    UPDATE content_submissions
      SET payment_confirmed_by_brand = TRUE,
          brand_confirmed_at = NOW(),
          brand_confirmed_by_user_id = v_actor_id,
          payment_confirmed_by_user_id = v_actor_id,
          payment_method = COALESCE(NULLIF(p_payment_method, ''), payment_method)
      WHERE id = p_submission_id;
  ELSE
    RAISE EXCEPTION 'NOT_AUTHORIZED_TO_CONFIRM_FULFILLMENT';
  END IF;

  RETURN jsonb_build_object(
    'id', p_submission_id,
    'confirmed_by', v_actor_id,
    'side', CASE WHEN v_actor_id = v_submission.creator_id THEN 'creator' ELSE 'brand' END
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION confirm_submission_fulfillment(UUID, TEXT) FROM anon;
REVOKE EXECUTE ON FUNCTION confirm_submission_fulfillment(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION confirm_submission_fulfillment(UUID, TEXT) TO authenticated;
