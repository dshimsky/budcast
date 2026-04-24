-- ============================================================
-- Migration: 006_disputes
-- Dispute resolution with 7-day proof requirement and 3-strikes-to-ban enforcement.
-- ============================================================

CREATE TABLE disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE NOT NULL,
  filed_by UUID REFERENCES users(id) NOT NULL,
  filed_against UUID REFERENCES users(id) NOT NULL,

  dispute_type TEXT NOT NULL
    CHECK (dispute_type IN ('non_payment', 'no_content', 'content_quality', 'other')),
  description TEXT NOT NULL,

  -- Evidence — uploaded screenshots, receipts, transaction IDs
  evidence_urls TEXT[] DEFAULT '{}',

  -- Resolution
  status TEXT DEFAULT 'open'
    CHECK (status IN ('open', 'under_review', 'resolved', 'escalated', 'closed')),
  resolution TEXT,
  resolved_by UUID REFERENCES users(id),
  resolved_at TIMESTAMPTZ,

  -- Actions taken
  credits_refunded BOOLEAN DEFAULT false,
  account_suspended BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_disputes_application ON disputes(application_id);
CREATE INDEX idx_disputes_filed_against ON disputes(filed_against);
CREATE INDEX idx_disputes_filed_by ON disputes(filed_by);
CREATE INDEX idx_disputes_status ON disputes(status);

-- RLS
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Dispute parties can view their disputes"
  ON disputes FOR SELECT
  USING (auth.uid() = filed_by OR auth.uid() = filed_against);

CREATE POLICY "Users can file disputes"
  ON disputes FOR INSERT
  WITH CHECK (auth.uid() = filed_by);

CREATE POLICY "Dispute parties can add evidence"
  ON disputes FOR UPDATE
  USING (auth.uid() = filed_by OR auth.uid() = filed_against);

-- Trigger
CREATE TRIGGER disputes_updated_at
  BEFORE UPDATE ON disputes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
