-- ============================================================
-- Migration: 019_profile_follows
-- First-party follow graph for BudCast profiles.
-- ============================================================

CREATE TABLE IF NOT EXISTS profile_follows (
  follower_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (follower_id, following_id),
  CONSTRAINT profile_follows_no_self_follow CHECK (follower_id <> following_id)
);

CREATE INDEX IF NOT EXISTS idx_profile_follows_follower_id
  ON profile_follows(follower_id);

CREATE INDEX IF NOT EXISTS idx_profile_follows_following_id
  ON profile_follows(following_id);

ALTER TABLE profile_follows ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profile_follows'
      AND policyname = 'Authenticated users can read profile follows'
  ) THEN
    CREATE POLICY "Authenticated users can read profile follows"
      ON profile_follows FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profile_follows'
      AND policyname = 'Users can follow profiles'
  ) THEN
    CREATE POLICY "Users can follow profiles"
      ON profile_follows FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = follower_id AND follower_id <> following_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profile_follows'
      AND policyname = 'Users can unfollow profiles'
  ) THEN
    CREATE POLICY "Users can unfollow profiles"
      ON profile_follows FOR DELETE
      TO authenticated
      USING (auth.uid() = follower_id);
  END IF;
END $$;

CREATE OR REPLACE VIEW profile_follow_counts AS
WITH follower_counts AS (
  SELECT
    follows.following_id AS profile_id,
    COUNT(*) FILTER (WHERE follower.user_type = 'brand')::INTEGER AS brand_followers,
    COUNT(*) FILTER (WHERE follower.user_type = 'creator')::INTEGER AS creator_followers,
    COUNT(*)::INTEGER AS total_followers
  FROM profile_follows follows
  INNER JOIN users follower
    ON follower.id = follows.follower_id
  GROUP BY follows.following_id
),
following_counts AS (
  SELECT
    follower_id AS profile_id,
    COUNT(*)::INTEGER AS following_count
  FROM profile_follows
  GROUP BY follower_id
)
SELECT
  profile.id AS profile_id,
  COALESCE(follower_counts.brand_followers, 0)::INTEGER AS brand_followers,
  COALESCE(follower_counts.creator_followers, 0)::INTEGER AS creator_followers,
  COALESCE(follower_counts.total_followers, 0)::INTEGER AS total_followers,
  COALESCE(following_counts.following_count, 0)::INTEGER AS following_count
FROM users profile
LEFT JOIN follower_counts
  ON follower_counts.profile_id = profile.id
LEFT JOIN following_counts
  ON following_counts.profile_id = profile.id;
