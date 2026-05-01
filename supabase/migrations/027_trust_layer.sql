-- =============================================================================
-- Migration 027: Trust Layer — Age Gate, Jurisdiction, Terms Acceptance
-- =============================================================================
-- Adds cannabis-platform compliance fields to the users table:
--   - Date of birth / 21+ age attestation
--   - State/jurisdiction for market eligibility
--   - Signed brand and creator terms with policy version tracking
--   - Cannabis content willingness flag
--   - Budtender identity flag
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Policy versions table
--    Tracks every version of terms so we know exactly which version
--    each user accepted and when.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS policy_versions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_type TEXT NOT NULL CHECK (policy_type IN ('creator_terms', 'brand_terms', 'platform_rules')),
  version     TEXT NOT NULL,          -- e.g. '1.0', '1.1'
  summary     TEXT,                   -- human-readable changelog
  effective_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (policy_type, version)
);

-- Seed initial policy versions
INSERT INTO policy_versions (policy_type, version, summary) VALUES
  ('creator_terms',  '1.0', 'Initial creator terms — cannabis content, age, disclosure, no health claims'),
  ('brand_terms',    '1.0', 'Initial brand terms — no sale facilitation, gifting only, market eligibility'),
  ('platform_rules', '1.0', 'Platform community rules — FTC disclosure, age gate, prohibited content');

-- RLS
ALTER TABLE policy_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Policy versions are publicly readable"
  ON policy_versions FOR SELECT USING (true);

-- ---------------------------------------------------------------------------
-- 2. Add trust/compliance columns to users
-- ---------------------------------------------------------------------------

-- Age verification
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS date_of_birth         DATE,
  ADD COLUMN IF NOT EXISTS age_verified          BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS age_verified_at       TIMESTAMPTZ;

-- Jurisdiction / market eligibility
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS state_code            TEXT,    -- e.g. 'MI', 'CA', 'CO'
  ADD COLUMN IF NOT EXISTS country_code          TEXT NOT NULL DEFAULT 'US',
  ADD COLUMN IF NOT EXISTS market_eligible       BOOLEAN NOT NULL DEFAULT FALSE;

-- Terms acceptance
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS terms_accepted_at     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS terms_policy_version  TEXT,    -- FK-like ref to policy_versions.version
  ADD COLUMN IF NOT EXISTS terms_ip_address      TEXT;    -- for audit trail

-- Cannabis-specific flags
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS cannabis_willing      BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_budtender          BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS budtender_store_name  TEXT,    -- dispensary/store affiliation
  ADD COLUMN IF NOT EXISTS budtender_verified    BOOLEAN NOT NULL DEFAULT FALSE;

-- Onboarding gate — tracks which compliance steps are complete
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS compliance_step       TEXT NOT NULL DEFAULT 'incomplete'
    CHECK (compliance_step IN ('incomplete', 'age_verified', 'terms_accepted', 'complete'));

-- ---------------------------------------------------------------------------
-- 3. States where recreational/medical cannabis is legal
--    Used to gate campaign eligibility.
--    Update this list as laws change.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS legal_cannabis_states (
  state_code   TEXT PRIMARY KEY,
  state_name   TEXT NOT NULL,
  program_type TEXT NOT NULL CHECK (program_type IN ('recreational', 'medical', 'both')),
  notes        TEXT
);

INSERT INTO legal_cannabis_states (state_code, state_name, program_type) VALUES
  ('AK', 'Alaska',            'recreational'),
  ('AZ', 'Arizona',           'recreational'),
  ('CA', 'California',        'recreational'),
  ('CO', 'Colorado',          'recreational'),
  ('CT', 'Connecticut',       'recreational'),
  ('DE', 'Delaware',          'recreational'),
  ('IL', 'Illinois',          'recreational'),
  ('ME', 'Maine',             'recreational'),
  ('MD', 'Maryland',          'recreational'),
  ('MA', 'Massachusetts',     'recreational'),
  ('MI', 'Michigan',          'recreational'),
  ('MN', 'Minnesota',         'recreational'),
  ('MO', 'Missouri',          'recreational'),
  ('MT', 'Montana',           'recreational'),
  ('NV', 'Nevada',            'recreational'),
  ('NJ', 'New Jersey',        'recreational'),
  ('NM', 'New Mexico',        'recreational'),
  ('NY', 'New York',          'recreational'),
  ('OH', 'Ohio',              'recreational'),
  ('OR', 'Oregon',            'recreational'),
  ('RI', 'Rhode Island',      'recreational'),
  ('VT', 'Vermont',           'recreational'),
  ('VA', 'Virginia',          'recreational'),
  ('WA', 'Washington',        'recreational'),
  ('DC', 'Washington D.C.',   'recreational'),
  ('AL', 'Alabama',           'medical'),
  ('AR', 'Arkansas',          'medical'),
  ('FL', 'Florida',           'medical'),
  ('HI', 'Hawaii',            'medical'),
  ('LA', 'Louisiana',         'medical'),
  ('MS', 'Mississippi',       'medical'),
  ('NH', 'New Hampshire',     'medical'),
  ('ND', 'North Dakota',      'medical'),
  ('OK', 'Oklahoma',          'medical'),
  ('PA', 'Pennsylvania',      'medical'),
  ('SD', 'South Dakota',      'medical'),
  ('TX', 'Texas',             'medical'),
  ('UT', 'Utah',              'medical'),
  ('WV', 'West Virginia',     'medical'),
  ('WY', 'Wyoming',           'medical')
ON CONFLICT (state_code) DO NOTHING;

ALTER TABLE legal_cannabis_states ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Legal states are publicly readable"
  ON legal_cannabis_states FOR SELECT USING (true);

-- ---------------------------------------------------------------------------
-- 4. RPC: accept_terms
--    Called when a user completes the age gate + terms acceptance flow.
--    Validates age >= 21, records state, marks compliance complete.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.accept_terms(
  p_date_of_birth   DATE,
  p_state_code      TEXT,
  p_policy_version  TEXT,
  p_ip_address      TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id      UUID := auth.uid();
  v_age_years    INTEGER;
  v_is_legal     BOOLEAN;
BEGIN
  -- Must be authenticated
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Calculate age
  v_age_years := DATE_PART('year', AGE(NOW(), p_date_of_birth));

  IF v_age_years < 21 THEN
    RAISE EXCEPTION 'You must be 21 or older to use BudCast.';
  END IF;

  -- Check if state has any cannabis program
  SELECT EXISTS (
    SELECT 1 FROM legal_cannabis_states WHERE state_code = UPPER(p_state_code)
  ) INTO v_is_legal;

  -- Update user record
  UPDATE users SET
    date_of_birth        = p_date_of_birth,
    age_verified         = TRUE,
    age_verified_at      = NOW(),
    state_code           = UPPER(p_state_code),
    market_eligible      = v_is_legal,
    terms_accepted_at    = NOW(),
    terms_policy_version = p_policy_version,
    terms_ip_address     = p_ip_address,
    compliance_step      = 'complete'
  WHERE id = v_user_id;

  RETURN jsonb_build_object(
    'success',         TRUE,
    'age_verified',    TRUE,
    'state_code',      UPPER(p_state_code),
    'market_eligible', v_is_legal,
    'compliance_step', 'complete'
  );
END;
$$;

-- Revoke direct update of compliance fields from authenticated users
-- (they must go through accept_terms RPC)
REVOKE UPDATE (age_verified, age_verified_at, terms_accepted_at, compliance_step)
  ON public.users FROM authenticated;

-- ---------------------------------------------------------------------------
-- 5. Index for fast market-eligibility lookups
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_users_state_code       ON users(state_code);
CREATE INDEX IF NOT EXISTS idx_users_compliance_step  ON users(compliance_step);
CREATE INDEX IF NOT EXISTS idx_users_is_budtender     ON users(is_budtender);
CREATE INDEX IF NOT EXISTS idx_users_age_verified     ON users(age_verified);
