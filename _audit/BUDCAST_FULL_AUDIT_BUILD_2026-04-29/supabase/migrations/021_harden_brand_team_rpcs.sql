-- ============================================================
-- Migration: 021_harden_brand_team_rpcs
-- Adds auth.uid()-based brand/team role checks to security-definer
-- campaign RPCs and records actor attribution where columns exist.
-- ============================================================

CREATE OR REPLACE FUNCTION publish_campaign_rpc(
  p_brand_id UUID,
  p_opportunity JSONB,
  p_credits_to_deduct INTEGER,
  p_draft_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_id UUID := auth.uid();
  v_opportunity_id UUID;
  v_current_balance INTEGER;
  v_campaign_number TEXT;
  v_new_balance INTEGER;
BEGIN
  IF v_actor_id IS NULL THEN
    RAISE EXCEPTION 'NOT_SIGNED_IN';
  END IF;

  IF NOT has_brand_role(p_brand_id, v_actor_id, ARRAY['owner', 'admin', 'campaign_manager']) THEN
    RAISE EXCEPTION 'NOT_BRAND_CAMPAIGN_MANAGER';
  END IF;

  SELECT credits_balance INTO v_current_balance
    FROM users
    WHERE id = p_brand_id
      AND user_type = 'brand';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Brand account not found: %', p_brand_id;
  END IF;

  IF v_current_balance < p_credits_to_deduct THEN
    RAISE EXCEPTION 'Insufficient credits: have %, need %', v_current_balance, p_credits_to_deduct;
  END IF;

  INSERT INTO opportunities (
    brand_id,
    campaign_contact_id,
    created_by_user_id,
    updated_by_user_id,
    campaign_number,
    campaign_type,
    title,
    short_description,
    description,
    image_url,
    categories,
    cash_amount,
    product_description,
    payment_methods,
    content_types,
    brand_mention,
    required_hashtags,
    must_includes,
    off_limits,
    reference_image_urls,
    slots_available,
    application_deadline,
    approval_mode,
    credit_cost_per_slot,
    credits_reserved,
    status,
    published_at
  )
  SELECT
    p_brand_id,
    COALESCE(NULLIF(p_opportunity->>'campaign_contact_id', '')::UUID, v_actor_id),
    v_actor_id,
    v_actor_id,
    COALESCE(p_opportunity->>'campaign_number', ''),
    p_opportunity->>'campaign_type',
    p_opportunity->>'title',
    p_opportunity->>'short_description',
    p_opportunity->>'description',
    p_opportunity->>'image_url',
    COALESCE(ARRAY(SELECT jsonb_array_elements_text(p_opportunity->'categories')), ARRAY[]::TEXT[]),
    NULLIF(p_opportunity->>'cash_amount', '')::INTEGER,
    p_opportunity->>'product_description',
    COALESCE(ARRAY(SELECT jsonb_array_elements_text(p_opportunity->'payment_methods')), ARRAY[]::TEXT[]),
    COALESCE(ARRAY(SELECT jsonb_array_elements_text(p_opportunity->'content_types')), ARRAY[]::TEXT[]),
    p_opportunity->>'brand_mention',
    COALESCE(ARRAY(SELECT jsonb_array_elements_text(p_opportunity->'required_hashtags')), ARRAY[]::TEXT[]),
    COALESCE(ARRAY(SELECT jsonb_array_elements_text(p_opportunity->'must_includes')), ARRAY[]::TEXT[]),
    COALESCE(ARRAY(SELECT jsonb_array_elements_text(p_opportunity->'off_limits')), ARRAY[]::TEXT[]),
    COALESCE(ARRAY(SELECT jsonb_array_elements_text(p_opportunity->'reference_image_urls')), ARRAY[]::TEXT[]),
    NULLIF(p_opportunity->>'slots_available', '')::INTEGER,
    NULLIF(p_opportunity->>'application_deadline', '')::TIMESTAMPTZ,
    COALESCE(p_opportunity->>'approval_mode', 'manual'),
    NULLIF(p_opportunity->>'credit_cost_per_slot', '')::INTEGER,
    p_credits_to_deduct,
    'active',
    NOW()
  RETURNING id, campaign_number INTO v_opportunity_id, v_campaign_number;

  v_new_balance := v_current_balance - p_credits_to_deduct;
  UPDATE users
    SET credits_balance = v_new_balance,
        updated_at = NOW()
    WHERE id = p_brand_id;

  INSERT INTO credit_transactions (
    user_id,
    amount,
    transaction_type,
    opportunity_id,
    description
  ) VALUES (
    p_brand_id,
    -p_credits_to_deduct,
    'reservation',
    v_opportunity_id,
    COALESCE('Campaign published: ' || (p_opportunity->>'title'), 'Campaign published')
  );

  INSERT INTO brand_activity_log (
    brand_id,
    actor_id,
    actor_role,
    action_type,
    entity_type,
    entity_id,
    metadata
  ) VALUES (
    p_brand_id,
    v_actor_id,
    CASE WHEN v_actor_id = p_brand_id THEN 'owner' ELSE (
      SELECT role FROM brand_team_members
      WHERE brand_id = p_brand_id AND user_id = v_actor_id AND status = 'active'
      LIMIT 1
    ) END,
    'campaign_published',
    'opportunities',
    v_opportunity_id,
    jsonb_build_object('title', p_opportunity->>'title')
  );

  IF p_draft_id IS NOT NULL THEN
    DELETE FROM opportunity_drafts WHERE id = p_draft_id AND brand_id = p_brand_id;
  END IF;

  RETURN jsonb_build_object(
    'id', v_opportunity_id,
    'campaign_number', v_campaign_number,
    'credits_reserved', p_credits_to_deduct,
    'new_balance', v_new_balance
  );
END;
$$;

GRANT EXECUTE ON FUNCTION publish_campaign_rpc(UUID, JSONB, INTEGER, UUID) TO authenticated;

CREATE OR REPLACE FUNCTION review_application_rpc(
  p_application_id UUID,
  p_brand_id       UUID,
  p_decision       TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_id              UUID := auth.uid();
  v_actor_role            TEXT;
  v_opportunity_id        UUID;
  v_opportunity_owner     UUID;
  v_opportunity_title     TEXT;
  v_app_status            TEXT;
  v_app_creator_id        UUID;
  v_app_credits_spent     INTEGER;
  v_slots_available       INTEGER;
  v_new_slots_filled      INTEGER;
  v_campaign_closed       BOOLEAN := FALSE;
  v_auto_rejected_count   INTEGER := 0;
  v_auto_rejected_app     RECORD;
BEGIN
  IF v_actor_id IS NULL THEN
    RAISE EXCEPTION 'NOT_SIGNED_IN';
  END IF;

  IF p_decision NOT IN ('accept', 'reject') THEN
    RAISE EXCEPTION 'INVALID_DECISION';
  END IF;

  IF NOT has_brand_role(p_brand_id, v_actor_id, ARRAY['owner', 'admin', 'campaign_manager']) THEN
    RAISE EXCEPTION 'NOT_BRAND_REVIEWER';
  END IF;

  SELECT a.opportunity_id, a.status, a.creator_id, a.credits_spent,
         o.brand_id, o.title, o.slots_available
    INTO v_opportunity_id, v_app_status, v_app_creator_id, v_app_credits_spent,
         v_opportunity_owner, v_opportunity_title, v_slots_available
    FROM applications a
    JOIN opportunities o ON o.id = a.opportunity_id
    WHERE a.id = p_application_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'APPLICATION_NOT_FOUND';
  END IF;

  IF v_opportunity_owner IS DISTINCT FROM p_brand_id THEN
    RAISE EXCEPTION 'NOT_OPPORTUNITY_OWNER';
  END IF;

  IF v_app_status IS DISTINCT FROM 'pending' THEN
    RAISE EXCEPTION 'APPLICATION_NOT_PENDING';
  END IF;

  v_actor_role := CASE WHEN v_actor_id = p_brand_id THEN 'owner' ELSE (
    SELECT role FROM brand_team_members
    WHERE brand_id = p_brand_id AND user_id = v_actor_id AND status = 'active'
    LIMIT 1
  ) END;

  IF p_decision = 'accept' THEN
    PERFORM 1 FROM opportunities WHERE id = v_opportunity_id FOR UPDATE;

    UPDATE applications
      SET status = 'accepted',
          accepted_at = NOW(),
          reviewed_by_user_id = v_actor_id,
          completion_deadline = NOW() + INTERVAL '21 days'
      WHERE id = p_application_id;

    UPDATE opportunities
      SET slots_filled = slots_filled + 1,
          updated_by_user_id = v_actor_id,
          updated_at = NOW()
      WHERE id = v_opportunity_id
      RETURNING slots_filled INTO v_new_slots_filled;

    IF v_new_slots_filled >= v_slots_available THEN
      UPDATE opportunities
        SET status = 'closed',
            updated_by_user_id = v_actor_id,
            updated_at = NOW()
        WHERE id = v_opportunity_id;
      v_campaign_closed := TRUE;

      FOR v_auto_rejected_app IN
        SELECT id, creator_id, credits_spent
          FROM applications
          WHERE opportunity_id = v_opportunity_id
            AND status = 'pending'
            AND id <> p_application_id
      LOOP
        UPDATE applications
          SET status = 'rejected',
              rejected_at = NOW(),
              reviewed_by_user_id = v_actor_id
          WHERE id = v_auto_rejected_app.id;

        UPDATE users
          SET credits_balance = credits_balance + v_auto_rejected_app.credits_spent,
              updated_at = NOW()
          WHERE id = v_auto_rejected_app.creator_id;

        INSERT INTO credit_transactions (
          user_id, amount, transaction_type, opportunity_id, description
        ) VALUES (
          v_auto_rejected_app.creator_id,
          v_auto_rejected_app.credits_spent,
          'refund',
          v_opportunity_id,
          'Campaign full - auto-rejected: ' || v_opportunity_title
        );

        v_auto_rejected_count := v_auto_rejected_count + 1;
      END LOOP;
    END IF;

    INSERT INTO brand_activity_log (
      brand_id, actor_id, actor_role, action_type, entity_type, entity_id, metadata
    ) VALUES (
      p_brand_id,
      v_actor_id,
      v_actor_role,
      'application_accepted',
      'applications',
      p_application_id,
      jsonb_build_object('opportunity_id', v_opportunity_id)
    );

    RETURN jsonb_build_object(
      'decision', 'accept',
      'application_id', p_application_id,
      'new_status', 'accepted',
      'slots_filled', v_new_slots_filled,
      'campaign_closed', v_campaign_closed,
      'auto_rejected_count', v_auto_rejected_count
    );

  ELSE
    UPDATE applications
      SET status = 'rejected',
          rejected_at = NOW(),
          reviewed_by_user_id = v_actor_id
      WHERE id = p_application_id;

    UPDATE users
      SET credits_balance = credits_balance + v_app_credits_spent,
          updated_at = NOW()
      WHERE id = v_app_creator_id;

    INSERT INTO credit_transactions (
      user_id, amount, transaction_type, opportunity_id, description
    ) VALUES (
      v_app_creator_id,
      v_app_credits_spent,
      'refund',
      v_opportunity_id,
      'Application rejected: ' || v_opportunity_title
    );

    INSERT INTO brand_activity_log (
      brand_id, actor_id, actor_role, action_type, entity_type, entity_id, metadata
    ) VALUES (
      p_brand_id,
      v_actor_id,
      v_actor_role,
      'application_rejected',
      'applications',
      p_application_id,
      jsonb_build_object('opportunity_id', v_opportunity_id)
    );

    RETURN jsonb_build_object(
      'decision', 'reject',
      'application_id', p_application_id,
      'new_status', 'rejected',
      'credits_returned', v_app_credits_spent
    );
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION review_application_rpc(UUID, UUID, TEXT) TO authenticated;
