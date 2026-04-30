-- Migration 011: publish_campaign_rpc
--
-- Atomic publish operation for the campaign wizard. Wraps in a single
-- transaction:
--   1. Insert into opportunities
--   2. Deduct credits from the brand's users.credits_balance
--   3. Write a credit_transactions audit row
--   4. Delete the opportunity_drafts row if a draft_id was provided
--
-- Called from the client via supabase.rpc('publish_campaign_rpc', {...}).
-- Returns JSON { id: uuid, campaign_number: text } on success.
--
-- Idempotent: safe to re-run this migration — uses CREATE OR REPLACE.

CREATE OR REPLACE FUNCTION publish_campaign_rpc(
  p_brand_id UUID,
  p_opportunity JSONB,
  p_credits_to_deduct INTEGER,
  p_draft_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_opportunity_id UUID;
  v_current_balance INTEGER;
  v_campaign_number TEXT;
  v_new_balance INTEGER;
BEGIN
  -- Guard: brand exists + is actually a brand account
  SELECT credits_balance INTO v_current_balance
    FROM users
    WHERE id = p_brand_id
      AND user_type = 'brand';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Brand account not found: %', p_brand_id;
  END IF;

  -- Guard: sufficient credits
  IF v_current_balance < p_credits_to_deduct THEN
    RAISE EXCEPTION 'Insufficient credits: have %, need %', v_current_balance, p_credits_to_deduct;
  END IF;

  -- 1. Insert opportunity. Let Postgres generate the id.
  INSERT INTO opportunities (
    brand_id,
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

  -- 2. Deduct credits
  v_new_balance := v_current_balance - p_credits_to_deduct;
  UPDATE users
    SET credits_balance = v_new_balance,
        updated_at = NOW()
    WHERE id = p_brand_id;

  -- 3. Write credit transaction
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

  -- 4. Delete draft if provided
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
