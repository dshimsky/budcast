-- ============================================================
-- Migration: 022_security_privacy_hardening
-- Launch-blocking security and privacy controls.
-- ============================================================

-- -----------------------------------------------------------
-- 1. Blocking and reporting primitives
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS profile_blocks (
  blocker_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  blocked_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  reason TEXT CHECK (reason IS NULL OR char_length(reason) <= 240),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (blocker_id, blocked_id),
  CONSTRAINT profile_blocks_no_self_block CHECK (blocker_id <> blocked_id)
);

CREATE INDEX IF NOT EXISTS idx_profile_blocks_blocked_id
  ON profile_blocks(blocked_id);

ALTER TABLE profile_blocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own block relationships" ON profile_blocks;
CREATE POLICY "Users can read their own block relationships"
  ON profile_blocks FOR SELECT
  TO authenticated
  USING (auth.uid() = blocker_id OR auth.uid() = blocked_id);

DROP POLICY IF EXISTS "Users can block profiles" ON profile_blocks;
CREATE POLICY "Users can block profiles"
  ON profile_blocks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = blocker_id AND blocker_id <> blocked_id);

DROP POLICY IF EXISTS "Users can unblock profiles" ON profile_blocks;
CREATE POLICY "Users can unblock profiles"
  ON profile_blocks FOR DELETE
  TO authenticated
  USING (auth.uid() = blocker_id);

CREATE TABLE IF NOT EXISTS safety_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  reported_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  target_type TEXT NOT NULL
    CHECK (target_type IN ('profile', 'feed_post', 'message', 'review', 'campaign', 'conversation')),
  target_id UUID,
  reason_type TEXT NOT NULL
    CHECK (reason_type IN ('spam', 'harassment', 'unsafe_content', 'misrepresentation', 'payment_issue', 'other')),
  description TEXT CHECK (description IS NULL OR char_length(description) <= 1000),
  status TEXT DEFAULT 'open' NOT NULL
    CHECK (status IN ('open', 'reviewing', 'actioned', 'dismissed')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT safety_reports_metadata_is_object CHECK (jsonb_typeof(metadata) = 'object')
);

CREATE INDEX IF NOT EXISTS idx_safety_reports_reporter
  ON safety_reports(reporter_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_safety_reports_target
  ON safety_reports(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_safety_reports_status
  ON safety_reports(status, created_at DESC);

ALTER TABLE safety_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Reporters can read their own safety reports" ON safety_reports;
CREATE POLICY "Reporters can read their own safety reports"
  ON safety_reports FOR SELECT
  TO authenticated
  USING (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Users can create safety reports" ON safety_reports;
CREATE POLICY "Users can create safety reports"
  ON safety_reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

DROP TRIGGER IF EXISTS safety_reports_updated_at ON safety_reports;
CREATE TRIGGER safety_reports_updated_at
  BEFORE UPDATE ON safety_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION is_blocked_between(p_user_a UUID, p_user_b UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN p_user_a IS NULL OR p_user_b IS NULL THEN FALSE
    WHEN p_user_a = p_user_b THEN FALSE
    ELSE EXISTS (
      SELECT 1
      FROM profile_blocks blocks
      WHERE (
        blocks.blocker_id = p_user_a
        AND blocks.blocked_id = p_user_b
      ) OR (
        blocks.blocker_id = p_user_b
        AND blocks.blocked_id = p_user_a
      )
    )
  END;
$$;

GRANT EXECUTE ON FUNCTION is_blocked_between(UUID, UUID) TO authenticated;

-- -----------------------------------------------------------
-- 2. Safe profile update path
-- -----------------------------------------------------------
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Profiles are RPC update only" ON users;
CREATE POLICY "Profiles are RPC update only"
  ON users FOR UPDATE
  TO authenticated
  USING (false)
  WITH CHECK (false);

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
  p_niches TEXT[] DEFAULT '{}'
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
    niches
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
    COALESCE(p_niches, ARRAY[]::TEXT[])
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
    updated_at = NOW()
  RETURNING * INTO v_profile;

  RETURN v_profile;
END;
$$;

GRANT EXECUTE ON FUNCTION update_profile_rpc(
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT[], TEXT[]
) TO authenticated;

-- -----------------------------------------------------------
-- 3. Harden creator application RPC
-- -----------------------------------------------------------
CREATE OR REPLACE FUNCTION apply_to_campaign_rpc(
  p_creator_id UUID,
  p_opportunity_id UUID,
  p_message TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_id UUID := auth.uid();
  v_user_type TEXT;
  v_current_balance INTEGER;
  v_campaign_type TEXT;
  v_credit_cost INTEGER;
  v_slots_available INTEGER;
  v_slots_filled INTEGER;
  v_opp_status TEXT;
  v_opp_title TEXT;
  v_existing_count INTEGER;
  v_trimmed_len INTEGER;
  v_new_balance INTEGER;
  v_application_id UUID;
BEGIN
  IF v_actor_id IS NULL THEN
    RAISE EXCEPTION 'NOT_SIGNED_IN';
  END IF;

  IF p_creator_id IS DISTINCT FROM v_actor_id THEN
    RAISE EXCEPTION 'CREATOR_ID_MISMATCH';
  END IF;

  SELECT user_type, credits_balance
    INTO v_user_type, v_current_balance
    FROM users
    WHERE id = p_creator_id
      AND account_status = 'active';

  IF NOT FOUND OR v_user_type IS DISTINCT FROM 'creator' THEN
    RAISE EXCEPTION 'USER_NOT_CREATOR';
  END IF;

  SELECT campaign_type, credit_cost_per_slot, slots_available, slots_filled, status, title
    INTO v_campaign_type, v_credit_cost, v_slots_available, v_slots_filled, v_opp_status, v_opp_title
    FROM opportunities
    WHERE id = p_opportunity_id
    FOR UPDATE;

  IF NOT FOUND OR v_opp_status IS DISTINCT FROM 'active' THEN
    RAISE EXCEPTION 'OPPORTUNITY_NOT_AVAILABLE';
  END IF;

  IF v_slots_filled >= v_slots_available THEN
    RAISE EXCEPTION 'OPPORTUNITY_FULL';
  END IF;

  SELECT COUNT(*) INTO v_existing_count
    FROM applications
    WHERE opportunity_id = p_opportunity_id
      AND creator_id = p_creator_id;

  IF v_existing_count > 0 THEN
    RAISE EXCEPTION 'ALREADY_APPLIED';
  END IF;

  IF v_campaign_type IN ('paid', 'hybrid') THEN
    IF p_message IS NULL THEN
      RAISE EXCEPTION 'PITCH_REQUIRED';
    END IF;

    v_trimmed_len := char_length(trim(p_message));
    IF v_trimmed_len < 50 OR v_trimmed_len > 500 THEN
      RAISE EXCEPTION 'PITCH_LENGTH_INVALID';
    END IF;
  END IF;

  IF v_current_balance < v_credit_cost THEN
    RAISE EXCEPTION 'INSUFFICIENT_CREDITS';
  END IF;

  v_new_balance := v_current_balance - v_credit_cost;

  UPDATE users
    SET credits_balance = v_new_balance,
        updated_at = NOW()
    WHERE id = p_creator_id;

  INSERT INTO applications (
    opportunity_id,
    creator_id,
    credits_spent,
    message,
    status
  ) VALUES (
    p_opportunity_id,
    p_creator_id,
    v_credit_cost,
    p_message,
    'pending'
  )
  RETURNING id INTO v_application_id;

  INSERT INTO credit_transactions (
    user_id,
    amount,
    transaction_type,
    opportunity_id,
    description
  ) VALUES (
    p_creator_id,
    -v_credit_cost,
    'reservation',
    p_opportunity_id,
    'Applied to: ' || v_opp_title
  );

  RETURN jsonb_build_object(
    'application_id', v_application_id,
    'credits_spent', v_credit_cost,
    'new_balance', v_new_balance
  );
END;
$$;

GRANT EXECUTE ON FUNCTION apply_to_campaign_rpc(UUID, UUID, TEXT) TO authenticated;

-- -----------------------------------------------------------
-- 4. Feed visibility and block-aware social policies
-- -----------------------------------------------------------
DROP POLICY IF EXISTS "Authenticated users can read public feed posts" ON feed_posts;
CREATE POLICY "Authenticated users can read public feed posts"
  ON feed_posts FOR SELECT
  TO authenticated
  USING (
    auth.uid() = author_id
    OR (
      NOT is_blocked_between(auth.uid(), author_id)
      AND (
        visibility = 'public'
        OR (
          visibility = 'followers'
          AND EXISTS (
            SELECT 1
            FROM profile_follows follows
            WHERE follows.follower_id = auth.uid()
              AND follows.following_id = feed_posts.author_id
          )
        )
      )
    )
  );

DROP POLICY IF EXISTS "Authors can create feed posts" ON feed_posts;
CREATE POLICY "Authors can create feed posts"
  ON feed_posts FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = author_id
    OR has_brand_role(author_id, auth.uid(), ARRAY['owner', 'admin', 'campaign_manager', 'content_reviewer'])
  );

DROP POLICY IF EXISTS "Authors can update their own feed posts" ON feed_posts;
CREATE POLICY "Authors can update their own feed posts"
  ON feed_posts FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = author_id
    OR has_brand_role(author_id, auth.uid(), ARRAY['owner', 'admin', 'campaign_manager', 'content_reviewer'])
  )
  WITH CHECK (
    auth.uid() = author_id
    OR has_brand_role(author_id, auth.uid(), ARRAY['owner', 'admin', 'campaign_manager', 'content_reviewer'])
  );

DROP POLICY IF EXISTS "Authors can delete their own feed posts" ON feed_posts;
CREATE POLICY "Authors can delete their own feed posts"
  ON feed_posts FOR DELETE
  TO authenticated
  USING (
    auth.uid() = author_id
    OR has_brand_role(author_id, auth.uid(), ARRAY['owner', 'admin', 'campaign_manager', 'content_reviewer'])
  );

DROP POLICY IF EXISTS "Users can follow profiles" ON profile_follows;
CREATE POLICY "Users can follow profiles"
  ON profile_follows FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = follower_id
    AND follower_id <> following_id
    AND NOT is_blocked_between(follower_id, following_id)
  );

DROP POLICY IF EXISTS "Participants can create conversations" ON conversations;
CREATE POLICY "Participants can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (
    auth.uid() = created_by
    AND NOT is_blocked_between(brand_id, creator_id)
    AND (
      auth.uid() = creator_id
      OR has_brand_role(brand_id, auth.uid(), ARRAY['owner', 'admin', 'campaign_manager', 'content_reviewer'])
    )
    AND EXISTS (
      SELECT 1 FROM users brand
      WHERE brand.id = conversations.brand_id
        AND brand.user_type = 'brand'
        AND brand.account_status = 'active'
    )
    AND EXISTS (
      SELECT 1 FROM users creator
      WHERE creator.id = conversations.creator_id
        AND creator.user_type = 'creator'
        AND creator.account_status = 'active'
    )
  );

DROP POLICY IF EXISTS "Participants can send messages" ON messages;
CREATE POLICY "Participants can send messages"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
        AND NOT is_blocked_between(conversations.brand_id, conversations.creator_id)
        AND (
          (
            auth.uid() = conversations.creator_id
            AND sender_brand_id IS NULL
          )
          OR (
            auth.uid() = conversations.brand_id
            AND (sender_brand_id IS NULL OR sender_brand_id = conversations.brand_id)
          )
          OR (
            sender_brand_id = conversations.brand_id
            AND has_brand_role(
              conversations.brand_id,
              auth.uid(),
              ARRAY['owner', 'admin', 'campaign_manager', 'content_reviewer']
            )
          )
        )
    )
  );
