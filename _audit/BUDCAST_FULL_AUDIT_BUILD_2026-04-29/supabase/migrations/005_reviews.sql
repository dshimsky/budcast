-- ============================================================
-- Migration: 005_reviews
-- Category-based reviews with 1-5 star ratings per dimension
-- plus optional written text and moderation support.
-- ============================================================

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES users(id) NOT NULL,
  reviewee_id UUID REFERENCES users(id) NOT NULL,

  -- Brand reviewing creator
  content_quality_score INTEGER CHECK (content_quality_score BETWEEN 1 AND 5),
  professionalism_score INTEGER CHECK (professionalism_score BETWEEN 1 AND 5),
  timeliness_score INTEGER CHECK (timeliness_score BETWEEN 1 AND 5),

  -- Creator reviewing brand
  payment_speed_score INTEGER CHECK (payment_speed_score BETWEEN 1 AND 5),
  communication_score INTEGER CHECK (communication_score BETWEEN 1 AND 5),
  product_quality_score INTEGER CHECK (product_quality_score BETWEEN 1 AND 5),

  -- Overall calculated score
  overall_score DECIMAL(2,1),
  review_text TEXT CHECK (char_length(review_text) <= 500),

  -- Response (reviewee can respond once, within 30 days)
  response_text TEXT CHECK (char_length(response_text) <= 500),
  response_posted_at TIMESTAMPTZ,

  -- Moderation
  reported BOOLEAN DEFAULT false,
  report_reason TEXT,
  moderator_reviewed BOOLEAN DEFAULT false,
  review_status TEXT DEFAULT 'published'
    CHECK (review_status IN ('published', 'flagged', 'removed', 'pending')),

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  UNIQUE(application_id, reviewer_id)
);

-- Indexes
CREATE INDEX idx_reviews_reviewee ON reviews(reviewee_id);
CREATE INDEX idx_reviews_reviewer ON reviews(reviewer_id);
CREATE INDEX idx_reviews_application ON reviews(application_id);
CREATE INDEX idx_reviews_status ON reviews(review_status);

-- RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published reviews are publicly readable"
  ON reviews FOR SELECT
  USING (review_status = 'published');

CREATE POLICY "Users can create reviews for their completed applications"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Reviewers can update their own reviews within window"
  ON reviews FOR UPDATE
  USING (auth.uid() = reviewer_id AND created_at > NOW() - INTERVAL '7 days');

CREATE POLICY "Reviewees can add response to their reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() = reviewee_id);

-- Trigger
CREATE TRIGGER reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
