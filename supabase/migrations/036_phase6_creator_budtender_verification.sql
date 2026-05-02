-- =============================================================================
-- Migration 036: Phase 6 Creator And Budtender Verification
-- =============================================================================
-- Add cannabis-native talent readiness fields and an admin-gated verification
-- workflow for creators and budtenders.
-- =============================================================================

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS creator_social_verification_status TEXT NOT NULL DEFAULT 'unverified',
  ADD COLUMN IF NOT EXISTS creator_platform_links JSONB NOT NULL DEFAULT '{}'::JSONB,
  ADD COLUMN IF NOT EXISTS audience_age_attested BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS cannabis_willingness TEXT NOT NULL DEFAULT 'unspecified',
  ADD COLUMN IF NOT EXISTS creator_content_categories TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS creator_markets TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS creator_availability TEXT NOT NULL DEFAULT 'open',
  ADD COLUMN IF NOT EXISTS budtender_experience BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS budtender_market TEXT,
  ADD COLUMN IF NOT EXISTS store_affiliation TEXT,
  ADD COLUMN IF NOT EXISTS store_affiliation_verified BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS budtender_education_experience BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS budtender_event_experience BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS sampling_recap_available BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS creator_verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS creator_verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS budtender_verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS budtender_verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS talent_verification_notes TEXT;

ALTER TABLE users
  DROP CONSTRAINT IF EXISTS users_creator_social_verification_status_check,
  DROP CONSTRAINT IF EXISTS users_cannabis_willingness_check,
  DROP CONSTRAINT IF EXISTS users_creator_availability_check;

ALTER TABLE users
  ADD CONSTRAINT users_creator_social_verification_status_check
  CHECK (creator_social_verification_status IN ('unverified', 'submitted', 'verified', 'rejected')),
  ADD CONSTRAINT users_cannabis_willingness_check
  CHECK (cannabis_willingness IN ('unspecified', 'yes', 'limited', 'no')),
  ADD CONSTRAINT users_creator_availability_check
  CHECK (creator_availability IN ('open', 'limited', 'unavailable'));

CREATE INDEX IF NOT EXISTS idx_users_creator_markets
  ON users USING GIN (creator_markets);

CREATE INDEX IF NOT EXISTS idx_users_creator_content_categories
  ON users USING GIN (creator_content_categories);

CREATE INDEX IF NOT EXISTS idx_users_cannabis_talent_filters
  ON users(user_type, cannabis_willingness, budtender_experience, creator_availability, review_score DESC)
  WHERE account_status = 'active';

CREATE OR REPLACE FUNCTION update_profile_rpc(
  p_user_type TEXT,
  p_name TEXT DEFAULT NULL,
  p_bio TEXT DEFAULT NULL,
  p_location TEXT DEFAULT NULL,
  p_avatar_url TEXT DEFAULT NULL,
  p_cover_url TEXT DEFAULT NULL,
  p_instagram TEXT DEFAULT NULL,
  p_tiktok TEXT DEFAULT NULL,
  p_youtube TEXT DEFAULT NULL,
  p_facebook TEXT DEFAULT NULL,
  p_linkedin TEXT DEFAULT NULL,
  p_x_profile TEXT DEFAULT NULL,
  p_company_name TEXT DEFAULT NULL,
  p_website TEXT DEFAULT NULL,
  p_portfolio_image_urls TEXT[] DEFAULT '{}',
  p_niches TEXT[] DEFAULT '{}',
  p_creator_platform_links JSONB DEFAULT '{}'::JSONB,
  p_audience_age_attested BOOLEAN DEFAULT FALSE,
  p_cannabis_willingness TEXT DEFAULT 'unspecified',
  p_creator_content_categories TEXT[] DEFAULT '{}',
  p_creator_markets TEXT[] DEFAULT '{}',
  p_creator_availability TEXT DEFAULT 'open',
  p_budtender_experience BOOLEAN DEFAULT FALSE,
  p_budtender_market TEXT DEFAULT NULL,
  p_store_affiliation TEXT DEFAULT NULL,
  p_budtender_education_experience BOOLEAN DEFAULT FALSE,
  p_budtender_event_experience BOOLEAN DEFAULT FALSE,
  p_sampling_recap_available BOOLEAN DEFAULT FALSE
)
RETURNS users
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_id UUID := auth.uid();
  v_email TEXT := COALESCE(NULLIF(auth.jwt() ->> 'email', ''), auth.uid()::TEXT || '@budcast.local');
  v_existing_type TEXT;
  v_profile users;
BEGIN
  IF v_actor_id IS NULL THEN
    RAISE EXCEPTION 'NOT_SIGNED_IN';
  END IF;

  IF p_user_type NOT IN ('creator', 'brand', 'brand_team') THEN
    RAISE EXCEPTION 'INVALID_USER_TYPE';
  END IF;

  IF COALESCE(p_cannabis_willingness, 'unspecified') NOT IN ('unspecified', 'yes', 'limited', 'no') THEN
    RAISE EXCEPTION 'INVALID_CANNABIS_WILLINGNESS';
  END IF;

  IF COALESCE(p_creator_availability, 'open') NOT IN ('open', 'limited', 'unavailable') THEN
    RAISE EXCEPTION 'INVALID_CREATOR_AVAILABILITY';
  END IF;

  SELECT user_type INTO v_existing_type
  FROM users
  WHERE id = v_actor_id;

  IF FOUND AND v_existing_type IS NOT NULL AND v_existing_type IS DISTINCT FROM p_user_type THEN
    RAISE EXCEPTION 'USER_TYPE_IMMUTABLE';
  END IF;

  INSERT INTO users (
    id,
    email,
    user_type,
    name,
    bio,
    location,
    avatar_url,
    cover_url,
    instagram,
    tiktok,
    youtube,
    facebook,
    linkedin,
    x_profile,
    company_name,
    website,
    portfolio_image_urls,
    niches,
    creator_platform_links,
    audience_age_attested,
    cannabis_willingness,
    creator_content_categories,
    creator_markets,
    creator_availability,
    budtender_experience,
    budtender_market,
    store_affiliation,
    budtender_education_experience,
    budtender_event_experience,
    sampling_recap_available,
    creator_social_verification_status
  ) VALUES (
    v_actor_id,
    v_email,
    p_user_type,
    NULLIF(trim(COALESCE(p_name, '')), ''),
    NULLIF(trim(COALESCE(p_bio, '')), ''),
    NULLIF(trim(COALESCE(p_location, '')), ''),
    NULLIF(trim(COALESCE(p_avatar_url, '')), ''),
    NULLIF(trim(COALESCE(p_cover_url, '')), ''),
    NULLIF(trim(COALESCE(p_instagram, '')), ''),
    NULLIF(trim(COALESCE(p_tiktok, '')), ''),
    NULLIF(trim(COALESCE(p_youtube, '')), ''),
    NULLIF(trim(COALESCE(p_facebook, '')), ''),
    NULLIF(trim(COALESCE(p_linkedin, '')), ''),
    NULLIF(trim(COALESCE(p_x_profile, '')), ''),
    NULLIF(trim(COALESCE(p_company_name, '')), ''),
    NULLIF(trim(COALESCE(p_website, '')), ''),
    COALESCE(p_portfolio_image_urls, ARRAY[]::TEXT[]),
    COALESCE(p_niches, ARRAY[]::TEXT[]),
    COALESCE(p_creator_platform_links, '{}'::JSONB),
    COALESCE(p_audience_age_attested, FALSE),
    COALESCE(p_cannabis_willingness, 'unspecified'),
    COALESCE(p_creator_content_categories, ARRAY[]::TEXT[]),
    COALESCE(p_creator_markets, ARRAY[]::TEXT[]),
    COALESCE(p_creator_availability, 'open'),
    COALESCE(p_budtender_experience, FALSE),
    NULLIF(trim(COALESCE(p_budtender_market, '')), ''),
    NULLIF(trim(COALESCE(p_store_affiliation, '')), ''),
    COALESCE(p_budtender_education_experience, FALSE),
    COALESCE(p_budtender_event_experience, FALSE),
    COALESCE(p_sampling_recap_available, FALSE),
    CASE
      WHEN jsonb_array_length(jsonb_path_query_array(COALESCE(p_creator_platform_links, '{}'::JSONB), '$.* ? (@ != "")')) > 0
        THEN 'submitted'
      ELSE 'unverified'
    END
  )
  ON CONFLICT (id) DO UPDATE SET
    email = COALESCE(NULLIF(users.email, ''), EXCLUDED.email),
    user_type = COALESCE(users.user_type, EXCLUDED.user_type),
    name = EXCLUDED.name,
    bio = EXCLUDED.bio,
    location = EXCLUDED.location,
    avatar_url = EXCLUDED.avatar_url,
    cover_url = EXCLUDED.cover_url,
    instagram = EXCLUDED.instagram,
    tiktok = EXCLUDED.tiktok,
    youtube = EXCLUDED.youtube,
    facebook = EXCLUDED.facebook,
    linkedin = EXCLUDED.linkedin,
    x_profile = EXCLUDED.x_profile,
    company_name = EXCLUDED.company_name,
    website = EXCLUDED.website,
    portfolio_image_urls = EXCLUDED.portfolio_image_urls,
    niches = EXCLUDED.niches,
    creator_platform_links = EXCLUDED.creator_platform_links,
    audience_age_attested = EXCLUDED.audience_age_attested,
    cannabis_willingness = EXCLUDED.cannabis_willingness,
    creator_content_categories = EXCLUDED.creator_content_categories,
    creator_markets = EXCLUDED.creator_markets,
    creator_availability = EXCLUDED.creator_availability,
    budtender_experience = EXCLUDED.budtender_experience,
    budtender_market = EXCLUDED.budtender_market,
    store_affiliation = EXCLUDED.store_affiliation,
    budtender_education_experience = EXCLUDED.budtender_education_experience,
    budtender_event_experience = EXCLUDED.budtender_event_experience,
    sampling_recap_available = EXCLUDED.sampling_recap_available,
    creator_social_verification_status = CASE
      WHEN users.creator_social_verification_status = 'verified' THEN 'verified'
      ELSE EXCLUDED.creator_social_verification_status
    END,
    updated_at = NOW()
  RETURNING * INTO v_profile;

  RETURN v_profile;
END;
$$;

CREATE OR REPLACE FUNCTION verify_cannabis_talent(
  p_user_id UUID,
  p_verified_creator BOOLEAN DEFAULT FALSE,
  p_verified_budtender BOOLEAN DEFAULT FALSE,
  p_notes TEXT DEFAULT NULL
)
RETURNS users
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_id UUID := auth.uid();
  v_profile users%ROWTYPE;
BEGIN
  IF v_actor_id IS NULL THEN
    RAISE EXCEPTION 'NOT_SIGNED_IN';
  END IF;

  IF NOT is_platform_admin(auth.uid()) THEN
    RAISE EXCEPTION 'PLATFORM_ADMIN_REQUIRED';
  END IF;

  UPDATE users
  SET
    creator_social_verification_status = CASE WHEN p_verified_creator THEN 'verified' ELSE creator_social_verification_status END,
    creator_verified_at = CASE WHEN p_verified_creator THEN NOW() ELSE creator_verified_at END,
    creator_verified_by = CASE WHEN p_verified_creator THEN v_actor_id ELSE creator_verified_by END,
    budtender_verified_at = CASE WHEN p_verified_budtender THEN NOW() ELSE budtender_verified_at END,
    budtender_verified_by = CASE WHEN p_verified_budtender THEN v_actor_id ELSE budtender_verified_by END,
    store_affiliation_verified = CASE WHEN p_verified_budtender THEN TRUE ELSE store_affiliation_verified END,
    talent_verification_notes = COALESCE(NULLIF(p_notes, ''), talent_verification_notes),
    badges = (
      SELECT ARRAY(
        SELECT DISTINCT badge
        FROM unnest(
          badges
          || CASE WHEN p_verified_creator THEN ARRAY['verified_creator']::TEXT[] ELSE ARRAY[]::TEXT[] END
          || CASE WHEN p_verified_budtender THEN ARRAY['verified_budtender']::TEXT[] ELSE ARRAY[]::TEXT[] END
        ) AS badge
      )
    ),
    updated_at = NOW()
  WHERE id = p_user_id
    AND user_type = 'creator'
  RETURNING * INTO v_profile;

  IF v_profile.id IS NULL THEN
    RAISE EXCEPTION 'CREATOR_PROFILE_NOT_FOUND';
  END IF;

  RETURN v_profile;
END;
$$;

DROP VIEW IF EXISTS public_profiles;
CREATE OR REPLACE VIEW public_profiles AS
SELECT
  id,
  user_type,
  name,
  bio,
  location,
  avatar_url,
  cover_url,
  instagram,
  tiktok,
  youtube,
  facebook,
  linkedin,
  x_profile,
  portfolio_image_urls,
  niches,
  company_name,
  website,
  payment_rate,
  completion_rate,
  total_campaigns,
  successful_campaigns,
  review_score,
  review_count,
  reputation_score,
  badges,
  account_status,
  creator_social_verification_status,
  creator_platform_links,
  audience_age_attested,
  cannabis_willingness,
  creator_content_categories,
  creator_markets,
  creator_availability,
  budtender_experience,
  budtender_market,
  store_affiliation,
  store_affiliation_verified,
  budtender_education_experience,
  budtender_event_experience,
  sampling_recap_available,
  creator_verified_at,
  budtender_verified_at,
  created_at,
  updated_at
FROM users
WHERE account_status = 'active';

GRANT SELECT ON public_profiles TO anon, authenticated;

REVOKE EXECUTE ON FUNCTION update_profile_rpc(
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT[], TEXT[],
  JSONB, BOOLEAN, TEXT, TEXT[], TEXT[], TEXT, BOOLEAN, TEXT, TEXT, BOOLEAN, BOOLEAN, BOOLEAN
) FROM anon;
REVOKE EXECUTE ON FUNCTION update_profile_rpc(
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT[], TEXT[],
  JSONB, BOOLEAN, TEXT, TEXT[], TEXT[], TEXT, BOOLEAN, TEXT, TEXT, BOOLEAN, BOOLEAN, BOOLEAN
) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION update_profile_rpc(
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT[], TEXT[],
  JSONB, BOOLEAN, TEXT, TEXT[], TEXT[], TEXT, BOOLEAN, TEXT, TEXT, BOOLEAN, BOOLEAN, BOOLEAN
) TO authenticated;

REVOKE EXECUTE ON FUNCTION verify_cannabis_talent(UUID, BOOLEAN, BOOLEAN, TEXT) FROM anon;
REVOKE EXECUTE ON FUNCTION verify_cannabis_talent(UUID, BOOLEAN, BOOLEAN, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION verify_cannabis_talent(UUID, BOOLEAN, BOOLEAN, TEXT) TO authenticated;
