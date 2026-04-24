-- ============================================================
-- Migration: 014_review_application_rpc
-- ============================================================
-- Atomic brand-reviews-application operation. Handles both accept
-- and reject decisions with all their side effects in a single txn.
--
-- ON ACCEPT:
--   1. Mark application 'accepted', set accepted_at + completion_deadline (+21d)
--   2. Increment opportunities.slots_filled
--   3. If now full: close the opportunity AND auto-reject all other
--      pending applications on it, refunding each rejected creator
--      (so slot-full losers get their credits back)
--
-- ON REJECT:
--   1. Mark application 'rejected', set rejected_at
--   2. Refund credits_spent to the creator's users.credits_balance
--   3. Write credit_transactions audit row (amount = +credits_spent)
--
-- Only the brand that owns the opportunity can review its applications.
-- Uses SELECT FOR UPDATE on the opportunity to serialize concurrent
-- accepts (prevents two accepts happening simultaneously and both
-- thinking they're the one that fills the last slot).
--
-- Error keys:
--   INVALID_DECISION          — p_decision not in ('accept','reject')
--   APPLICATION_NOT_FOUND     — no such application id
--   APPLICATION_NOT_PENDING   — already reviewed (accepted/rejected/etc)
--   NOT_OPPORTUNITY_OWNER     — calling brand doesn't own this opportunity
--
-- Returns JSON:
--   { decision: 'accept'|'reject',
--     application_id,
--     new_status,
--     slots_filled,            -- only set on accept
--     campaign_closed,         -- only set on accept, true if last slot filled
--     auto_rejected_count,     -- only set on accept, count of cascaded rejects
--     credits_returned }       -- set on reject OR for each auto-rejected creator
--
-- Idempotent: CREATE OR REPLACE.
-- ============================================================

CREATE OR REPLACE FUNCTION review_application_rpc(
  p_application_id UUID,
  p_brand_id       UUID,
  p_decision       TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
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
  -- ---------------------------------------------------------
  -- 1. Validate decision value
  -- ---------------------------------------------------------
  IF p_decision NOT IN ('accept', 'reject') THEN
    RAISE EXCEPTION 'INVALID_DECISION';
  END IF;

  -- ---------------------------------------------------------
  -- 2. Fetch application + validate pending + verify brand owns opportunity
  -- ---------------------------------------------------------
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

  -- ---------------------------------------------------------
  -- 3. Branch on decision
  -- ---------------------------------------------------------
  IF p_decision = 'accept' THEN
    -- Lock the opportunity row to serialize concurrent accepts
    PERFORM 1 FROM opportunities WHERE id = v_opportunity_id FOR UPDATE;

    -- Mark this application accepted
    UPDATE applications
      SET status = 'accepted',
          accepted_at = NOW(),
          completion_deadline = NOW() + INTERVAL '21 days'
      WHERE id = p_application_id;

    -- Increment slots_filled and check if now at capacity
    UPDATE opportunities
      SET slots_filled = slots_filled + 1,
          updated_at = NOW()
      WHERE id = v_opportunity_id
      RETURNING slots_filled INTO v_new_slots_filled;

    IF v_new_slots_filled >= v_slots_available THEN
      -- Campaign is full. Close it and cascade-reject other pending apps.
      UPDATE opportunities
        SET status = 'closed',
            updated_at = NOW()
        WHERE id = v_opportunity_id;
      v_campaign_closed := TRUE;

      -- Auto-reject each still-pending application (other than the one we
      -- just accepted). For each, refund credits and log a transaction.
      FOR v_auto_rejected_app IN
        SELECT id, creator_id, credits_spent
          FROM applications
          WHERE opportunity_id = v_opportunity_id
            AND status = 'pending'
            AND id <> p_application_id
      LOOP
        UPDATE applications
          SET status = 'rejected',
              rejected_at = NOW()
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
          'Campaign full — auto-rejected: ' || v_opportunity_title
        );

        v_auto_rejected_count := v_auto_rejected_count + 1;
      END LOOP;
    END IF;

    RETURN jsonb_build_object(
      'decision', 'accept',
      'application_id', p_application_id,
      'new_status', 'accepted',
      'slots_filled', v_new_slots_filled,
      'campaign_closed', v_campaign_closed,
      'auto_rejected_count', v_auto_rejected_count
    );

  ELSE
    -- p_decision = 'reject'
    UPDATE applications
      SET status = 'rejected',
          rejected_at = NOW()
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
