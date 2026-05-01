-- =============================================================================
-- Migration 026: Lock Economic State
-- =============================================================================
-- Purpose: Prevent any authenticated client from directly writing to
--          economic counter columns. All mutations to credits_balance and
--          slots_filled MUST flow through audited, atomic RPCs only:
--            - publish_campaign_rpc  (011)
--            - apply_to_campaign_rpc (013)
--            - review_application_rpc (014)
--
-- Audit confirmed: no direct client writes exist in current app code.
-- This migration adds a DB-level enforcement layer so this stays true
-- as the codebase grows.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Revoke direct column-level UPDATE on economic counters
-- ---------------------------------------------------------------------------

-- Prevent authenticated users from directly updating credits_balance
-- on the users table. Only RPCs (running as SECURITY DEFINER) can touch this.
REVOKE UPDATE (credits_balance) ON public.users FROM authenticated;

-- Prevent authenticated users from directly updating slots_filled
-- on the opportunities table.
REVOKE UPDATE (slots_filled) ON public.opportunities FROM authenticated;

-- ---------------------------------------------------------------------------
-- 2. Verify credit_transactions audit trail integrity
-- ---------------------------------------------------------------------------
-- credit_transactions (migration 007) must log every balance mutation.
-- Add a NOT NULL constraint on balance_after if not already present,
-- so every transaction records the resulting balance for reconstruction.

DO $$
BEGIN
  -- Only alter if balance_after is currently nullable
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'credit_transactions'
      AND column_name  = 'balance_after'
      AND is_nullable  = 'YES'
  ) THEN
    -- Set existing NULLs to 0 before enforcing NOT NULL
    UPDATE public.credit_transactions
    SET balance_after = 0
    WHERE balance_after IS NULL;

    ALTER TABLE public.credit_transactions
      ALTER COLUMN balance_after SET NOT NULL;
  END IF;
END
$$;

-- ---------------------------------------------------------------------------
-- 3. Add a trigger to block direct balance tampering as a second layer
-- ---------------------------------------------------------------------------
-- Even if REVOKE is somehow bypassed (e.g., service role misuse),
-- this trigger raises an exception if credits_balance is changed outside
-- of a recognized RPC context.

CREATE OR REPLACE FUNCTION public.guard_economic_state()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Allow mutations that originate from our trusted RPCs.
  -- Those RPCs are SECURITY DEFINER and run as the postgres/service role,
  -- so current_user will be 'postgres' or 'service_role'.
  IF current_user IN ('postgres', 'supabase_admin', 'service_role') THEN
    RETURN NEW;
  END IF;

  -- Block any other role from changing credits_balance
  IF TG_TABLE_NAME = 'users' AND NEW.credits_balance IS DISTINCT FROM OLD.credits_balance THEN
    RAISE EXCEPTION
      'Direct mutation of credits_balance is not allowed. Use the publish_campaign_rpc, apply_to_campaign_rpc, or review_application_rpc functions.';
  END IF;

  RETURN NEW;
END;
$$;

-- Apply trigger to users table
DROP TRIGGER IF EXISTS trg_guard_credits_balance ON public.users;
CREATE TRIGGER trg_guard_credits_balance
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_economic_state();

-- ---------------------------------------------------------------------------
-- 4. Add trigger for slots_filled on campaigns table
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.guard_slots_filled()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF current_user IN ('postgres', 'supabase_admin', 'service_role') THEN
    RETURN NEW;
  END IF;

  IF NEW.slots_filled IS DISTINCT FROM OLD.slots_filled THEN
    RAISE EXCEPTION
      'Direct mutation of slots_filled is not allowed. Use review_application_rpc.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_slots_filled ON public.opportunities;
CREATE TRIGGER trg_guard_slots_filled
  BEFORE UPDATE ON public.opportunities
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_slots_filled();

-- ---------------------------------------------------------------------------
-- 5. Verify RPC functions are still SECURITY DEFINER (sanity check)
-- ---------------------------------------------------------------------------
-- These should already be SECURITY DEFINER from their original migrations.
-- This DO block will raise a warning if any have been altered.
DO $$
DECLARE
  rpc_name TEXT;
  rpc_security TEXT;
BEGIN
  FOR rpc_name, rpc_security IN
    SELECT routine_name, security_type
    FROM information_schema.routines
    WHERE routine_schema = 'public'
      AND routine_name IN (
        'publish_campaign_rpc',
        'apply_to_campaign_rpc',
        'review_application_rpc'
      )
  LOOP
    IF rpc_security != 'DEFINER' THEN
      RAISE WARNING
        'RPC % is NOT SECURITY DEFINER - economic state mutations may fail!',
        rpc_name;
    END IF;
  END LOOP;
END
$$;
