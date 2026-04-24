-- ============================================================
-- Migration: 004_content_submissions
-- Creator content posted to external platforms (Instagram/TikTok),
-- verified by Claude API, then confirmed for payment by both parties.
-- ============================================================

CREATE TABLE content_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE NOT NULL,
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,

  -- Submitted content
  post_url TEXT NOT NULL,
  post_type TEXT
    CHECK (post_type IN (
      'instagram_post', 'instagram_story', 'instagram_reel',
      'tiktok_video', 'youtube_video', 'youtube_short'
    )),
  screenshot_url TEXT,

  -- AI verification
  verification_status TEXT DEFAULT 'pending'
    CHECK (verification_status IN ('pending', 'verified', 'needs_revision', 'failed')),
  verification_results JSONB,
  verification_feedback TEXT,
  verified_at TIMESTAMPTZ,

  -- Mutual payment confirmation
  payment_confirmed_by_brand BOOLEAN DEFAULT false,
  payment_confirmed_by_creator BOOLEAN DEFAULT false,
  payment_method TEXT,
  brand_confirmed_at TIMESTAMPTZ,
  creator_confirmed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_content_submissions_application ON content_submissions(application_id);
CREATE INDEX idx_content_submissions_verification ON content_submissions(verification_status);
CREATE INDEX idx_content_submissions_creator ON content_submissions(creator_id);

-- RLS
ALTER TABLE content_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Content submissions visible to creator and brand"
  ON content_submissions FOR SELECT
  USING (
    auth.uid() = creator_id
    OR auth.uid() IN (
      SELECT o.brand_id
      FROM applications a
      JOIN opportunities o ON a.opportunity_id = o.id
      WHERE a.id = content_submissions.application_id
    )
  );

CREATE POLICY "Creators submit their own content"
  ON content_submissions FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators and brands update their content submissions"
  ON content_submissions FOR UPDATE
  USING (
    auth.uid() = creator_id
    OR auth.uid() IN (
      SELECT o.brand_id
      FROM applications a
      JOIN opportunities o ON a.opportunity_id = o.id
      WHERE a.id = content_submissions.application_id
    )
  );

-- Trigger
CREATE TRIGGER content_submissions_updated_at
  BEFORE UPDATE ON content_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
