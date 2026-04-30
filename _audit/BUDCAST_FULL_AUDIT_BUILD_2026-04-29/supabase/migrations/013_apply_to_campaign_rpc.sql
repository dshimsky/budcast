-- ============================================================
-- Migration: 013_apply_to_campaign_rpc
-- ============================================================
-- Atomic creator-applies-to-campaign operation. Wraps in a single
-- transaction:
--   1. Validate the opportunity is open and the creator can apply
--   2. Validate the pitch message (required 50-500 chars for paid/hybrid)
--   3. Deduct credits from the creator's users.credits_balance
--   4. Insert the application row
--   5. Write a credit_transactions audit row
--
-- Called from the client via supabase.rpc('apply_to_campaign_rpc', {...}).
--
-- Uses SELECT ... FOR UPDATE on the opportunity row to serialize
-- concurrent applies against the same campaign — prevents the race
-- where two creators apply simultaneously and oversell slots.
--
-- Error keys (raised via RAISE EXCEPTION) — clients parse these:
--   USER_NOT_CREATOR          — auth user isn't a creator account
--   OPPORTUNITY_NOT_AVAILABLE — campaign doesn't exist or isn't active
--   OPPORTUNITY_FULL          — all slots are already filled
--   ALREADY_APPLIED           — creator has an existing application
--   PITCH_REQUIRED            — paid/hybrid needs a message, none given
--   PITCH_LENGTH_INVALID      — pitch outside 50-500 chars
--   INSUFFICIENT_CREDITS      — balance < credit_cost_per_slot
--
-- Returns JSON: { application_id, credits_spent, new_balance }
--
-- Idempotent: safe to re-run this migration — uses CREATE OR REPLACE.
-- ============================================================

CREATE OR REPLACE FUNCTION apply_to_campaign_rpc(
  p_creator_id    UUID,
  p_opportunity_id UUID,
  p_message       TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_type        TEXT;
  v_current_balance  INTEGER;
  v_campaign_type    TEXT;
  v_credit_cost      INTEGER;
  v_slots_available  INTEGER;
  v_slots_filled     INTEGER;
  v_opp_status       TEXT;
  v_opp_title        TEXT;
  v_existing_count   INTEGER;
  v_trimmed_len      INTEGER;
  v_new_balance      INTEGER;
  v_application_id   UUID;
BEGIN
  -- ---------------------------------------------------------
  -- 1. Validate creator
  -- ---------------------------------------------------------
  SELECT user_type, credits_balance
    INTO v_user_type, v_current_balance
    FROM users
    WHERE id = p_creator_id;

  IF NOT FOUND OR v_user_type IS DISTINCT FROM 'creator' THEN
    RAISE EXCEPTION 'USER_NOT_CREATOR';
  END IF;

  -- ---------------------------------------------------------
  -- 2. Lock + validate opportunity (FOR UPDATE serializes concurrent applies)
  -- ---------------------------------------------------------
  SELECT campaign_type, credit_cost_per_slot, slots_available, slots_filled, status, title
    INTO v_campaign_type, v_credit_cost, v_slots_available, v_slots_filled, v_opp_status, v_opp_title
    FROM opportunities
    WHERE id = p_opportunity_id
    FOR UPDATE;

  IF NOT FOUND OR v_opp_status IS DISTINCT FROM 'active' THEN
    RAISE EXCEPTION 'OPPORTUNITY_NOT_AVAILABLE';
  END IF;

  IF v_slots_filled >= v_slots_available THEN
    RAISE EXCEPTION 'OPPORTUNITY_FULL';
  END IF;

  -- ---------------------------------------------------------
  -- 3. Duplicate application check (unique constraint backs this up
  --    but we check first for a clean error)
  -- ---------------------------------------------------------
  SELECT COUNT(*) INTO v_existing_count
    FROM applications
    WHERE opportunity_id = p_opportunity_id
      AND creator_id = p_creator_id;

  IF v_existing_count > 0 THEN
    RAISE EXCEPTION 'ALREADY_APPLIED';
  END IF;

  -- ---------------------------------------------------------
  -- 4. Validate pitch message for paid/hybrid
  -- ---------------------------------------------------------
  IF v_campaign_type IN ('paid', 'hybrid') THEN
    IF p_message IS NULL THEN
      RAISE EXCEPTION 'PITCH_REQUIRED';
    END IF;

    v_trimmed_len := char_length(trim(p_message));
    IF v_trimmed_len < 50 OR v_trimmed_len > 500 THEN
      RAISE EXCEPTION 'PITCH_LENGTH_INVALID';
    END IF;
  END IF;

  -- ---------------------------------------------------------
  -- 5. Check sufficient credits
  -- ---------------------------------------------------------
  IF v_current_balance < v_credit_cost THEN
    RAISE EXCEPTION 'INSUFFICIENT_CREDITS';
  END IF;

  -- ---------------------------------------------------------
  -- 6. Deduct credits, insert application, log transaction — atomic
  -- ---------------------------------------------------------
  v_new_balance := v_current_balance - v_credit_cost;

  UPDATE users
    SET credits_balance = v_new_balance,
        updated_at = NOW()
    WHERE id = p_creator_id;

  -- For gifting campaigns we allow p_message to be non-null (some creators
  -- might voluntarily pitch even for gifting) — we store whatever was sent.
  INSERT INTO applications (
    opportunity_id,
    creator_id,
    credits_spent,
    message,
    status
  ) VALUES (
    p_opportunity_id,
    p_creator_id,
    v_credit_cost,
    p_message,
    'pending'
  )
  RETURNING id INTO v_application_id;

  INSERT INTO credit_transactions (
    user_id,
    amount,
    transaction_type,
    opportunity_id,
    description
  ) VALUES (
    p_creator_id,
    -v_credit_cost,
    'reservation',
    p_opportunity_id,
    'Applied to: ' || v_opp_title
  );

  RETURN jsonb_build_object(
    'application_id', v_application_id,
    'credits_spent', v_credit_cost,
    'new_balance', v_new_balance
  );
END;
$$;

GRANT EXECUTE ON FUNCTION apply_to_campaign_rpc(UUID, UUID, TEXT) TO authenticated;
