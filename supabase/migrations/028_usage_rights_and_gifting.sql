-- =============================================================================
-- Migration 028: Usage Rights + Gifting Workflow
-- =============================================================================
-- Adds two critical P0 features to campaigns (opportunities):
--
-- 1. USAGE RIGHTS — brands must select rights before approving content.
--    Covers: organic repost, paid ads, whitelisting, duration, territory,
--    exclusivity, AI training exclusion, revocation rules.
--
-- 2. GIFTING WORKFLOW — non-commerce collaboration tracker.
--    Tracks product-gifting status without facilitating cannabis sale,
--    delivery, or pickup. App never arranges commerce — it tracks
--    brand-creator collaboration status only.
--
-- 3. CAMPAIGN COMPLIANCE FIELDS — state eligibility, prohibited content
--    rules, disclosure enforcement, and platform publishing guidance.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Add usage rights columns to opportunities
-- ---------------------------------------------------------------------------
ALTER TABLE opportunities
  -- Rights scope (what the brand can do with approved content)
  ADD COLUMN IF NOT EXISTS rights_organic_repost    BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS rights_paid_ads          BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS rights_whitelisting      BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS rights_handle_licensing  BOOLEAN NOT NULL DEFAULT FALSE,

  -- Rights duration
  ADD COLUMN IF NOT EXISTS rights_duration_days     INTEGER,           -- NULL = perpetual
  ADD COLUMN IF NOT EXISTS rights_expires_at        TIMESTAMPTZ,

  -- Rights territory
  ADD COLUMN IF NOT EXISTS rights_territory         TEXT NOT NULL DEFAULT 'US',

  -- Exclusivity
  ADD COLUMN IF NOT EXISTS rights_exclusive         BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS rights_exclusivity_days  INTEGER,

  -- AI training restriction (creator protection)
  ADD COLUMN IF NOT EXISTS rights_no_ai_training    BOOLEAN NOT NULL DEFAULT TRUE,

  -- Revocation
  ADD COLUMN IF NOT EXISTS rights_revocable         BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS rights_revocation_notice_days INTEGER DEFAULT 30,

  -- Rights acceptance gate
  -- Brands cannot approve content until rights_confirmed = TRUE
  ADD COLUMN IF NOT EXISTS rights_confirmed         BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS rights_confirmed_at      TIMESTAMPTZ;

-- ---------------------------------------------------------------------------
-- 2. Add campaign compliance fields to opportunities
-- ---------------------------------------------------------------------------
ALTER TABLE opportunities
  -- Which states this campaign is eligible to run in.
  -- Empty array = all legal states. Populated = specific markets only.
  ADD COLUMN IF NOT EXISTS eligible_states          TEXT[] DEFAULT '{}',

  -- Platform publishing targets (where creators will post)
  ADD COLUMN IF NOT EXISTS target_platforms         TEXT[] DEFAULT '{}',  -- ['instagram','tiktok','youtube']

  -- Required FTC disclosure hashtags (in addition to required_hashtags)
  ADD COLUMN IF NOT EXISTS disclosure_tags          TEXT[] DEFAULT ARRAY['#ad', '#gifted'],

  -- Prohibited content rules for this campaign
  ADD COLUMN IF NOT EXISTS prohibited_content       TEXT[] DEFAULT ARRAY[
    'no_health_claims',
    'no_sale_language',
    'no_minors',
    'no_driving',
    'no_undisclosed_use'
  ],

  -- Compliance checklist completed by brand before publishing
  ADD COLUMN IF NOT EXISTS compliance_checklist_done BOOLEAN NOT NULL DEFAULT FALSE,

  -- Campaign-level min age for applicants (default 21)
  ADD COLUMN IF NOT EXISTS min_applicant_age        INTEGER NOT NULL DEFAULT 21;

-- ---------------------------------------------------------------------------
-- 3. Gifting workflow table
--    Tracks the product-gifting collaboration status between a brand
--    and an accepted creator. This is NOT commerce — it is a
--    collaboration tracker only. No purchase, pickup, or delivery
--    is facilitated by this table.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS gifting_workflow (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id      UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  application_id      UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  brand_id            UUID NOT NULL REFERENCES users(id),
  creator_id          UUID NOT NULL REFERENCES users(id),

  -- Product details (non-commerce — description only, no pricing)
  product_name        TEXT NOT NULL,
  product_category    TEXT NOT NULL
    CHECK (product_category IN (
      'flower', 'pre_rolls', 'edibles', 'vapes',
      'concentrates', 'topicals', 'accessories', 'merch', 'other'
    )),
  product_notes       TEXT,

  -- Market eligibility confirmation
  creator_state_confirmed   BOOLEAN NOT NULL DEFAULT FALSE,  -- creator is in an eligible state
  creator_age_confirmed     BOOLEAN NOT NULL DEFAULT FALSE,  -- creator is 21+

  -- Gifting status (collaboration only — never purchase/delivery)
  status              TEXT NOT NULL DEFAULT 'pending_brand_action'
    CHECK (status IN (
      'pending_brand_action',   -- brand needs to arrange how product gets to creator
      'brand_shipped',          -- brand has handled product logistics off-platform
      'creator_received',       -- creator confirmed product received
      'creator_declined',       -- creator declined product
      'substitution_requested', -- creator asked for different product
      'cancelled'
    )),

  -- Off-platform contact method (brand provides contact, not delivery logistics)
  brand_contact_method  TEXT,   -- e.g. 'email', 'phone', 'in_store_pickup_arranged_offplatform'
  brand_contact_at      TIMESTAMPTZ,

  -- Creator receipt confirmation
  creator_received_at   TIMESTAMPTZ,
  creator_feedback      TEXT,

  -- Substitution request
  substitution_notes    TEXT,

  -- Important: compliance note stored with record
  compliance_note TEXT NOT NULL DEFAULT
    'BudCast does not facilitate cannabis sale, delivery, or pickup. This record tracks brand-creator collaboration status only.',

  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (opportunity_id, application_id)
);

CREATE INDEX IF NOT EXISTS idx_gifting_opportunity   ON gifting_workflow(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_gifting_brand         ON gifting_workflow(brand_id);
CREATE INDEX IF NOT EXISTS idx_gifting_creator       ON gifting_workflow(creator_id);
CREATE INDEX IF NOT EXISTS idx_gifting_status        ON gifting_workflow(status);

CREATE TRIGGER gifting_updated_at
  BEFORE UPDATE ON gifting_workflow
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE gifting_workflow ENABLE ROW LEVEL SECURITY;

-- Brand can see all gifting records for their campaigns
CREATE POLICY "Brands can view their gifting records"
  ON gifting_workflow FOR SELECT
  USING (auth.uid() = brand_id);

-- Creator can see their own gifting records
CREATE POLICY "Creators can view their gifting records"
  ON gifting_workflow FOR SELECT
  USING (auth.uid() = creator_id);

-- Only brand or creator involved can update (via RPC guards below)
CREATE POLICY "Gifting parties can update their records"
  ON gifting_workflow FOR UPDATE
  USING (auth.uid() = brand_id OR auth.uid() = creator_id);

-- ---------------------------------------------------------------------------
-- 4. RPC: confirm_campaign_rights
--    Brand must call this before approving any content submissions.
--    Locks in the rights selection and timestamps the confirmation.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.confirm_campaign_rights(
  p_opportunity_id          UUID,
  p_rights_paid_ads         BOOLEAN DEFAULT FALSE,
  p_rights_whitelisting     BOOLEAN DEFAULT FALSE,
  p_rights_handle_licensing BOOLEAN DEFAULT FALSE,
  p_rights_duration_days    INTEGER DEFAULT NULL,
  p_rights_territory        TEXT    DEFAULT 'US',
  p_rights_exclusive        BOOLEAN DEFAULT FALSE,
  p_rights_no_ai_training   BOOLEAN DEFAULT TRUE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_brand_id UUID;
BEGIN
  -- Verify this user owns the campaign
  SELECT brand_id INTO v_brand_id
  FROM opportunities
  WHERE id = p_opportunity_id;

  IF v_brand_id IS NULL THEN
    RAISE EXCEPTION 'Campaign not found.';
  END IF;

  IF v_brand_id != v_user_id THEN
    RAISE EXCEPTION 'You do not own this campaign.';
  END IF;

  UPDATE opportunities SET
    rights_paid_ads          = p_rights_paid_ads,
    rights_whitelisting      = p_rights_whitelisting,
    rights_handle_licensing  = p_rights_handle_licensing,
    rights_duration_days     = p_rights_duration_days,
    rights_expires_at        = CASE
                                 WHEN p_rights_duration_days IS NOT NULL
                                 THEN NOW() + (p_rights_duration_days || ' days')::INTERVAL
                                 ELSE NULL
                               END,
    rights_territory         = p_rights_territory,
    rights_exclusive         = p_rights_exclusive,
    rights_no_ai_training    = p_rights_no_ai_training,
    rights_confirmed         = TRUE,
    rights_confirmed_at      = NOW()
  WHERE id = p_opportunity_id;

  RETURN jsonb_build_object(
    'success',          TRUE,
    'opportunity_id',   p_opportunity_id,
    'rights_confirmed', TRUE,
    'confirmed_at',     NOW()
  );
END;
$$;

-- ---------------------------------------------------------------------------
-- 5. RPC: update_gifting_status
--    Safe status transitions for the gifting workflow.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_gifting_status(
  p_gifting_id   UUID,
  p_new_status   TEXT,
  p_notes        TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id   UUID := auth.uid();
  v_record    gifting_workflow%ROWTYPE;
BEGIN
  SELECT * INTO v_record FROM gifting_workflow WHERE id = p_gifting_id;

  IF v_record.id IS NULL THEN
    RAISE EXCEPTION 'Gifting record not found.';
  END IF;

  -- Only the relevant party can make certain transitions
  IF p_new_status = 'brand_shipped' AND v_record.brand_id != v_user_id THEN
    RAISE EXCEPTION 'Only the brand can mark product as shipped/arranged.';
  END IF;

  IF p_new_status IN ('creator_received', 'creator_declined', 'substitution_requested')
     AND v_record.creator_id != v_user_id THEN
    RAISE EXCEPTION 'Only the creator can update receipt status.';
  END IF;

  UPDATE gifting_workflow SET
    status               = p_new_status,
    creator_feedback     = COALESCE(p_notes, creator_feedback),
    substitution_notes   = CASE WHEN p_new_status = 'substitution_requested' THEN p_notes ELSE substitution_notes END,
    creator_received_at  = CASE WHEN p_new_status = 'creator_received' THEN NOW() ELSE creator_received_at END,
    brand_contact_at     = CASE WHEN p_new_status = 'brand_shipped' THEN NOW() ELSE brand_contact_at END
  WHERE id = p_gifting_id;

  RETURN jsonb_build_object(
    'success',    TRUE,
    'gifting_id', p_gifting_id,
    'new_status', p_new_status
  );
END;
$$;

-- ---------------------------------------------------------------------------
-- 6. Indexes for compliance lookups on opportunities
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_opp_rights_confirmed ON opportunities(rights_confirmed);
CREATE INDEX IF NOT EXISTS idx_opp_eligible_states  ON opportunities USING GIN(eligible_states);
CREATE INDEX IF NOT EXISTS idx_opp_target_platforms ON opportunities USING GIN(target_platforms);
