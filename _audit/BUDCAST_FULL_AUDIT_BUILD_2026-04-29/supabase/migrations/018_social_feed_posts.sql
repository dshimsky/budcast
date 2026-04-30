-- ============================================================
-- Migration: 018_social_feed_posts
-- First-party social feed posts with reposts, media references,
-- and client-supplied link metadata.
-- ============================================================

CREATE TABLE IF NOT EXISTS feed_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  post_type TEXT NOT NULL
    CHECK (post_type IN ('text', 'media', 'link', 'repost')),
  body TEXT CHECK (body IS NULL OR char_length(body) <= 2000),
  media_urls TEXT[] DEFAULT '{}' NOT NULL,
  url TEXT,
  url_title TEXT,
  url_description TEXT,
  url_image TEXT,
  repost_of_id UUID REFERENCES feed_posts(id) ON DELETE SET NULL,
  visibility TEXT DEFAULT 'public' NOT NULL
    CHECK (visibility IN ('public', 'followers', 'private')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_feed_posts_created_at
  ON feed_posts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_feed_posts_author_id
  ON feed_posts(author_id);

CREATE INDEX IF NOT EXISTS idx_feed_posts_repost_of_id
  ON feed_posts(repost_of_id);

ALTER TABLE feed_posts ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'feed_posts'
      AND policyname = 'Authenticated users can read public feed posts'
  ) THEN
    CREATE POLICY "Authenticated users can read public feed posts"
      ON feed_posts FOR SELECT
      TO authenticated
      USING (visibility = 'public' OR auth.uid() = author_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'feed_posts'
      AND policyname = 'Authors can create feed posts'
  ) THEN
    CREATE POLICY "Authors can create feed posts"
      ON feed_posts FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = author_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'feed_posts'
      AND policyname = 'Authors can update their own feed posts'
  ) THEN
    CREATE POLICY "Authors can update their own feed posts"
      ON feed_posts FOR UPDATE
      TO authenticated
      USING (auth.uid() = author_id)
      WITH CHECK (auth.uid() = author_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'feed_posts'
      AND policyname = 'Authors can delete their own feed posts'
  ) THEN
    CREATE POLICY "Authors can delete their own feed posts"
      ON feed_posts FOR DELETE
      TO authenticated
      USING (auth.uid() = author_id);
  END IF;
END $$;

DROP TRIGGER IF EXISTS feed_posts_updated_at ON feed_posts;

CREATE TRIGGER feed_posts_updated_at
  BEFORE UPDATE ON feed_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
