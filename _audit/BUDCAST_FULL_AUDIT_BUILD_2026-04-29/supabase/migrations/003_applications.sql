-- ============================================================
-- Migration: 003_applications
-- Creator applications to opportunities with credit tracking
-- and 21-day completion deadline enforcement.
-- ============================================================

CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE NOT NULL,
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,

  -- Application data
  message TEXT,
  credits_spent INTEGER NOT NULL,

  -- Status flow
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'rejected', 'expired', 'completed', 'disputed')),

  -- Timestamps
  applied_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  accepted_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- 21-day deadline from acceptance
  completion_deadline TIMESTAMPTZ,

  UNIQUE(opportunity_id, creator_id)
);

-- Indexes
CREATE INDEX idx_applications_opportunity ON applications(opportunity_id);
CREATE INDEX idx_applications_creator ON applications(creator_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_deadline
  ON applications(completion_deadline)
  WHERE status = 'accepted';

-- RLS
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Creators see their applications, brands see applications to their campaigns"
  ON applications FOR SELECT
  USING (
    auth.uid() = creator_id
    OR auth.uid() IN (
      SELECT brand_id FROM opportunities WHERE id = applications.opportunity_id
    )
  );

CREATE POLICY "Creators create their own applications"
  ON applications FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators update their own applications, brands update applications to their campaigns"
  ON applications FOR UPDATE
  USING (
    auth.uid() = creator_id
    OR auth.uid() IN (
      SELECT brand_id FROM opportunities WHERE id = applications.opportunity_id
    )
  );
