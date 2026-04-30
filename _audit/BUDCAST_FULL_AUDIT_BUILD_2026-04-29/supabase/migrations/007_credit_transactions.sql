-- ============================================================
-- Migration: 007_credit_transactions
-- Audit log of every credit movement — allocation, rollover, spent,
-- refund, completion, purchase. Never truncated; balance calculations
-- can always be reconstructed from this log.
-- ============================================================

CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,

  transaction_type TEXT NOT NULL CHECK (transaction_type IN (
    'allocation',   -- Monthly credit refresh based on tier
    'rollover',     -- 50% of unused credits from prior month
    'spent',        -- Credits deducted for application
    'refund',       -- Campaign cancelled, credits returned
    'completion',   -- Campaign completed, credits returned
    'purchase'      -- Future: à la carte credit purchase
  )),

  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,

  -- Context
  related_application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
  related_opportunity_id UUID REFERENCES opportunities(id) ON DELETE SET NULL,
  description TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_credit_transactions_user ON credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_type ON credit_transactions(transaction_type);
CREATE INDEX idx_credit_transactions_created ON credit_transactions(created_at DESC);
CREATE INDEX idx_credit_transactions_user_created
  ON credit_transactions(user_id, created_at DESC);

-- RLS
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions"
  ON credit_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Only server-side functions should insert transactions
-- No INSERT policy for regular users; Edge Functions bypass RLS
