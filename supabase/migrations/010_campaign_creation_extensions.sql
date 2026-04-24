-- ============================================================
-- Migration: 010_campaign_creation_extensions
-- Adds fields surfaced in the campaign creation flow (Phase 2 Session 2):
--   • categories, brand_mention, must_includes, off_limits
--   • reference_image_urls, payment_methods
--   • application_deadline (separate from posting_deadline which is
--     auto-calculated 21 days from acceptance per platform policy)
-- Also creates opportunity_drafts table for autosaving in-progress
-- campaigns before the brand hits Publish.
-- Idempotent — uses IF NOT EXISTS / IF EXISTS guards throughout.
-- ============================================================

-- -----------------------------------------------------------
-- 1. Extend opportunities with new fields
-- -----------------------------------------------------------
ALTER TABLE opportunities
  ADD COLUMN IF NOT EXISTS categories TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS brand_mention TEXT,
  ADD COLUMN IF NOT EXISTS must_includes TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS off_limits TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS reference_image_urls TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS payment_methods TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS application_deadline TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

-- short_description was implicit in the existing `description` field,
-- but the sketch separates "short description" (200 char) from
-- "creative direction / brief" (2000 char). Add an explicit short field
-- and treat existing `description` as the brief/long-form.
ALTER TABLE opportunities
  ADD COLUMN IF NOT EXISTS short_description TEXT;

-- New index: filter Free Store by category
CREATE INDEX IF NOT EXISTS idx_opportunities_categories
  ON opportunities USING GIN (categories);

-- -----------------------------------------------------------
-- 2. opportunity_drafts — autosave for in-progress campaigns
-- -----------------------------------------------------------
-- One draft per brand at a time keeps the UX simple. Brand starting
-- a new campaign while another draft exists prompts: "Resume draft or
-- start fresh?" That UI is Session 2 part 2; this table just stores it.
CREATE TABLE IF NOT EXISTS opportunity_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,

  -- Whatever the brand has filled in so far. JSONB lets the form
  -- evolve without schema migrations every time we add a field.
  -- The publish step pulls from this and writes a real opportunities row.
  form_state JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Where they were when they last saved
  current_step INTEGER NOT NULL DEFAULT 1
    CHECK (current_step BETWEEN 1 AND 6),

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- A brand can have multiple drafts, but the dashboard surfaces them
  -- as "you have N unfinished drafts" — no uniqueness constraint on
  -- (brand_id) because the brand may want to draft multiple campaigns
  -- in parallel (e.g. one for 4/20 launch, one for end-of-month).
  CONSTRAINT opportunity_drafts_form_state_is_object
    CHECK (jsonb_typeof(form_state) = 'object')
);

CREATE INDEX IF NOT EXISTS idx_opportunity_drafts_brand
  ON opportunity_drafts(brand_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_drafts_updated
  ON opportunity_drafts(updated_at DESC);

-- RLS — drafts are private to the brand that created them
ALTER TABLE opportunity_drafts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Brands can read their own drafts" ON opportunity_drafts;
CREATE POLICY "Brands can read their own drafts"
  ON opportunity_drafts FOR SELECT
  USING (auth.uid() = brand_id);

DROP POLICY IF EXISTS "Brands can create their own drafts" ON opportunity_drafts;
CREATE POLICY "Brands can create their own drafts"
  ON opportunity_drafts FOR INSERT
  WITH CHECK (auth.uid() = brand_id);

DROP POLICY IF EXISTS "Brands can update their own drafts" ON opportunity_drafts;
CREATE POLICY "Brands can update their own drafts"
  ON opportunity_drafts FOR UPDATE
  USING (auth.uid() = brand_id);

DROP POLICY IF EXISTS "Brands can delete their own drafts" ON opportunity_drafts;
CREATE POLICY "Brands can delete their own drafts"
  ON opportunity_drafts FOR DELETE
  USING (auth.uid() = brand_id);

-- updated_at auto-bump trigger
DROP TRIGGER IF EXISTS opportunity_drafts_updated_at ON opportunity_drafts;
CREATE TRIGGER opportunity_drafts_updated_at
  BEFORE UPDATE ON opportunity_drafts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
