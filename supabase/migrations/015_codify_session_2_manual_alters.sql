-- ============================================================
-- Migration: 015_codify_session_2_manual_alters
-- ============================================================
-- Session 2's build session applied several DB alterations manually
-- (via the Supabase Studio SQL editor) that were never committed as
-- migration files. This migration codifies those changes so that
-- applying migrations from a clean slate reaches the same state.
--
-- Changes codified here:
--
-- 1. opportunities:
--    - Add campaign_number TEXT (human-readable "BC-YYMM-NNNN" identifier
--      used by publish RPC and shown in URLs/UI)
--    - Add credit_cost_per_slot INTEGER (per-slot credit cost — the new
--      model replaces the aggregate credit_cost column)
--    - Add credits_reserved INTEGER (total credits the brand committed
--      at publish time — decreases as slots close)
--    - credit_cost column made NULLABLE (new campaigns don't set it;
--      kept for backwards compatibility with Phase 1 data)
--
-- 2. credit_transactions:
--    - CHECK constraint on transaction_type extended to include
--      'reservation' (used when credits are reserved by publishing
--      a campaign — distinct from 'spent' which is the old semantic)
--    - Add opportunity_id column (flat FK used by 011/013/014 RPCs;
--      the original schema only had related_opportunity_id. Both
--      columns coexist — opportunity_id is what new RPCs write)
--
-- Idempotent — uses IF NOT EXISTS / DO blocks throughout.
-- ============================================================

-- -----------------------------------------------------------
-- 1. opportunities: new columns + relaxed credit_cost
-- -----------------------------------------------------------
ALTER TABLE opportunities
  ADD COLUMN IF NOT EXISTS campaign_number TEXT,
  ADD COLUMN IF NOT EXISTS credit_cost_per_slot INTEGER,
  ADD COLUMN IF NOT EXISTS credits_reserved INTEGER;

-- Relax the NOT NULL on credit_cost so new campaigns (which use
-- credit_cost_per_slot instead) can be inserted without it.
ALTER TABLE opportunities
  ALTER COLUMN credit_cost DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_opportunities_campaign_number
  ON opportunities(campaign_number)
  WHERE campaign_number IS NOT NULL;

-- -----------------------------------------------------------
-- 2. credit_transactions: extend transaction_type, add opportunity_id
-- -----------------------------------------------------------

-- Drop and recreate the CHECK constraint to allow 'reservation'.
-- Postgres doesn't support ALTER CONSTRAINT for CHECK, so we drop+add.
-- The name 'credit_transactions_transaction_type_check' is Postgres's
-- default generated name; we guard the drop.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'credit_transactions_transaction_type_check'
      AND conrelid = 'credit_transactions'::regclass
  ) THEN
    ALTER TABLE credit_transactions
      DROP CONSTRAINT credit_transactions_transaction_type_check;
  END IF;
END $$;

ALTER TABLE credit_transactions
  ADD CONSTRAINT credit_transactions_transaction_type_check
    CHECK (transaction_type IN (
      'allocation',
      'rollover',
      'spent',
      'refund',
      'completion',
      'purchase',
      'reservation'
    ));

-- Add the flat opportunity_id column. The original schema has
-- related_opportunity_id (for future-proof naming convention) but
-- the RPCs from Session 2 onward write to the shorter opportunity_id.
-- Keeping both means existing queries against related_opportunity_id
-- still work and new queries can use the shorter name.
ALTER TABLE credit_transactions
  ADD COLUMN IF NOT EXISTS opportunity_id UUID REFERENCES opportunities(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_credit_transactions_opportunity
  ON credit_transactions(opportunity_id);

-- balance_after was NOT NULL in migration 007, but 011/013/014 don't
-- populate it (they just UPDATE users.credits_balance and log the
-- delta via amount). Relax the NOT NULL so these RPCs work.
ALTER TABLE credit_transactions
  ALTER COLUMN balance_after DROP NOT NULL;
