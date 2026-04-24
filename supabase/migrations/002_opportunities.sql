-- ============================================================
-- Migration: 002_opportunities
-- Campaigns posted by brands that creators can apply to.
-- ============================================================

CREATE TABLE opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,

  -- Campaign details
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  campaign_type TEXT NOT NULL
    CHECK (campaign_type IN ('gifting', 'paid', 'hybrid')),

  -- Compensation
  credit_cost INTEGER NOT NULL,
  cash_amount INTEGER,
  product_description TEXT,

  -- Content requirements
  content_types TEXT[] DEFAULT '{}',
  required_hashtags TEXT[] DEFAULT '{}',
  brief_requirements TEXT,

  -- Logistics
  location TEXT,
  deadline TIMESTAMPTZ,
  slots_available INTEGER NOT NULL DEFAULT 1,
  slots_filled INTEGER NOT NULL DEFAULT 0,

  -- Visuals
  image_url TEXT,

  -- Status
  status TEXT DEFAULT 'active'
    CHECK (status IN ('draft', 'active', 'closed', 'cancelled')),
  approval_mode TEXT DEFAULT 'manual'
    CHECK (approval_mode IN ('manual', 'auto')),

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_opportunities_brand ON opportunities(brand_id);
CREATE INDEX idx_opportunities_status ON opportunities(status);
CREATE INDEX idx_opportunities_type ON opportunities(campaign_type);
CREATE INDEX idx_opportunities_created ON opportunities(created_at DESC);

-- RLS
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active opportunities are publicly readable"
  ON opportunities FOR SELECT
  USING (status = 'active' OR auth.uid() = brand_id);

CREATE POLICY "Brands can create their own opportunities"
  ON opportunities FOR INSERT
  WITH CHECK (auth.uid() = brand_id);

CREATE POLICY "Brands can update their own opportunities"
  ON opportunities FOR UPDATE
  USING (auth.uid() = brand_id);

-- Trigger
CREATE TRIGGER opportunities_updated_at
  BEFORE UPDATE ON opportunities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
