-- ============================================================
-- Migration: 023_public_profile_boundary
-- Field-limited profile read surface for public marketplace UI.
-- ============================================================

DROP VIEW IF EXISTS public_profiles;

CREATE OR REPLACE VIEW public_profiles
WITH (security_invoker = true)
AS
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
  created_at,
  updated_at
FROM users
WHERE account_status = 'active';

GRANT SELECT ON public_profiles TO anon, authenticated;

DROP POLICY IF EXISTS "Profiles are publicly readable" ON users;
CREATE POLICY "Profiles are publicly readable"
  ON users FOR SELECT
  USING (
    account_status = 'active'
    OR auth.uid() = id
    OR EXISTS (
      SELECT 1
      FROM brand_team_members team
      WHERE team.brand_id = users.id
        AND team.user_id = auth.uid()
        AND team.status = 'active'
    )
  );
