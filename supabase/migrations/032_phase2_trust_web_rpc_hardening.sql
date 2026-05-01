-- =============================================================================
-- Migration 032: Phase 2 Trust Web RPC Hardening
-- =============================================================================
-- Persist Phase 2 campaign trust fields during publish and keep gifting status
-- updates on the SECURITY DEFINER RPC path.
-- =============================================================================

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

  IF COALESCE((p_opportunity->>'rights_confirmed')::BOOLEAN, FALSE) IS NOT TRUE THEN
    RAISE EXCEPTION 'RIGHTS_CONFIRMATION_REQUIRED';
  END IF;

  IF COALESCE(JSONB_ARRAY_LENGTH(p_opportunity->'eligible_states'), 0) = 0 THEN
    RAISE EXCEPTION 'ELIGIBLE_STATES_REQUIRED';
  END IF;

  IF COALESCE(JSONB_ARRAY_LENGTH(p_opportunity->'target_platforms'), 0) = 0 THEN
    RAISE EXCEPTION 'TARGET_PLATFORMS_REQUIRED';
  END IF;

  IF COALESCE(JSONB_ARRAY_LENGTH(p_opportunity->'disclosure_tags'), 0) = 0 THEN
    RAISE EXCEPTION 'DISCLOSURE_TAGS_REQUIRED';
  END IF;

  IF COALESCE(JSONB_ARRAY_LENGTH(p_opportunity->'prohibited_content'), 0) = 0 THEN
    RAISE EXCEPTION 'PROHIBITED_CONTENT_REQUIRED';
  END IF;

  IF COALESCE((p_opportunity->>'compliance_checklist_done')::BOOLEAN, FALSE) IS NOT TRUE THEN
    RAISE EXCEPTION 'COMPLIANCE_CHECKLIST_REQUIRED';
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
    rights_organic_repost,
    rights_paid_ads,
    rights_whitelisting,
    rights_handle_licensing,
    rights_duration_days,
    rights_territory,
    rights_exclusive,
    rights_exclusivity_days,
    rights_no_ai_training,
    rights_revocable,
    rights_revocation_notice_days,
    rights_confirmed,
    rights_confirmed_at,
    eligible_states,
    target_platforms,
    disclosure_tags,
    prohibited_content,
    compliance_checklist_done,
    min_applicant_age,
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
    COALESCE(ARRAY(SELECT jsonb_array_elements_text(COALESCE(p_opportunity->'categories', '[]'::jsonb))), ARRAY[]::TEXT[]),
    NULLIF(p_opportunity->>'cash_amount', '')::INTEGER,
    p_opportunity->>'product_description',
    COALESCE(ARRAY(SELECT jsonb_array_elements_text(COALESCE(p_opportunity->'payment_methods', '[]'::jsonb))), ARRAY[]::TEXT[]),
    COALESCE(ARRAY(SELECT jsonb_array_elements_text(COALESCE(p_opportunity->'content_types', '[]'::jsonb))), ARRAY[]::TEXT[]),
    p_opportunity->>'brand_mention',
    COALESCE(ARRAY(SELECT jsonb_array_elements_text(COALESCE(p_opportunity->'required_hashtags', '[]'::jsonb))), ARRAY[]::TEXT[]),
    COALESCE(ARRAY(SELECT jsonb_array_elements_text(COALESCE(p_opportunity->'must_includes', '[]'::jsonb))), ARRAY[]::TEXT[]),
    COALESCE(ARRAY(SELECT jsonb_array_elements_text(COALESCE(p_opportunity->'off_limits', '[]'::jsonb))), ARRAY[]::TEXT[]),
    COALESCE(ARRAY(SELECT jsonb_array_elements_text(COALESCE(p_opportunity->'reference_image_urls', '[]'::jsonb))), ARRAY[]::TEXT[]),
    NULLIF(p_opportunity->>'slots_available', '')::INTEGER,
    NULLIF(p_opportunity->>'application_deadline', '')::TIMESTAMPTZ,
    COALESCE(p_opportunity->>'approval_mode', 'manual'),
    NULLIF(p_opportunity->>'credit_cost_per_slot', '')::INTEGER,
    COALESCE((p_opportunity->>'rights_organic_repost')::BOOLEAN, TRUE),
    COALESCE((p_opportunity->>'rights_paid_ads')::BOOLEAN, FALSE),
    COALESCE((p_opportunity->>'rights_whitelisting')::BOOLEAN, FALSE),
    COALESCE((p_opportunity->>'rights_handle_licensing')::BOOLEAN, FALSE),
    NULLIF(p_opportunity->>'rights_duration_days', '')::INTEGER,
    COALESCE(NULLIF(p_opportunity->>'rights_territory', ''), 'US'),
    COALESCE((p_opportunity->>'rights_exclusive')::BOOLEAN, FALSE),
    NULLIF(p_opportunity->>'rights_exclusivity_days', '')::INTEGER,
    COALESCE((p_opportunity->>'rights_no_ai_training')::BOOLEAN, TRUE),
    COALESCE((p_opportunity->>'rights_revocable')::BOOLEAN, FALSE),
    COALESCE(NULLIF(p_opportunity->>'rights_revocation_notice_days', '')::INTEGER, 30),
    TRUE,
    NOW(),
    COALESCE(ARRAY(SELECT jsonb_array_elements_text(COALESCE(p_opportunity->'eligible_states', '[]'::jsonb))), ARRAY[]::TEXT[]),
    COALESCE(ARRAY(SELECT jsonb_array_elements_text(COALESCE(p_opportunity->'target_platforms', '[]'::jsonb))), ARRAY[]::TEXT[]),
    COALESCE(ARRAY(SELECT jsonb_array_elements_text(COALESCE(p_opportunity->'disclosure_tags', '[]'::jsonb))), ARRAY['#ad', '#gifted']::TEXT[]),
    COALESCE(ARRAY(SELECT jsonb_array_elements_text(COALESCE(p_opportunity->'prohibited_content', '[]'::jsonb))), ARRAY[]::TEXT[]),
    TRUE,
    COALESCE(NULLIF(p_opportunity->>'min_applicant_age', '')::INTEGER, 21),
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

REVOKE EXECUTE ON FUNCTION publish_campaign_rpc(UUID, JSONB, INTEGER, UUID) FROM anon;
REVOKE EXECUTE ON FUNCTION publish_campaign_rpc(UUID, JSONB, INTEGER, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION publish_campaign_rpc(UUID, JSONB, INTEGER, UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.update_gifting_status(
  p_gifting_id   UUID,
  p_new_status   TEXT,
  p_notes        TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id   UUID := auth.uid();
  v_record    gifting_workflow%ROWTYPE;
BEGIN
  SELECT * INTO v_record FROM gifting_workflow WHERE id = p_gifting_id;

  IF v_record.id IS NULL THEN
    RAISE EXCEPTION 'GIFTING_WORKFLOW_NOT_FOUND';
  END IF;

  IF p_new_status = 'brand_shipped' AND v_record.brand_id != v_user_id THEN
    RAISE EXCEPTION 'ONLY_BRAND_CAN_UPDATE_PRODUCT_STATUS';
  END IF;

  IF p_new_status IN ('creator_received', 'creator_declined', 'substitution_requested')
     AND v_record.creator_id != v_user_id THEN
    RAISE EXCEPTION 'ONLY_CREATOR_CAN_UPDATE_PRODUCT_STATUS';
  END IF;

  UPDATE gifting_workflow SET
    status               = p_new_status,
    brand_contact_method = CASE WHEN p_new_status = 'brand_shipped' THEN COALESCE(p_notes, brand_contact_method) ELSE brand_contact_method END,
    creator_feedback     = CASE WHEN p_new_status = 'creator_received' THEN COALESCE(p_notes, creator_feedback) ELSE creator_feedback END,
    substitution_notes   = CASE WHEN p_new_status = 'substitution_requested' THEN p_notes ELSE substitution_notes END,
    creator_received_at  = CASE WHEN p_new_status = 'creator_received' THEN NOW() ELSE creator_received_at END,
    brand_contact_at     = CASE WHEN p_new_status = 'brand_shipped' THEN NOW() ELSE brand_contact_at END
  WHERE id = p_gifting_id;

  RETURN jsonb_build_object(
    'success',    TRUE,
    'gifting_id', p_gifting_id,
    'new_status', p_new_status
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.update_gifting_status(UUID, TEXT, TEXT) FROM anon;
REVOKE EXECUTE ON FUNCTION public.update_gifting_status(UUID, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_gifting_status(UUID, TEXT, TEXT) TO authenticated;
