-- ============================================================
-- Migration: 020_brand_team_profiles
-- Adds brand team profiles, memberships, invites, activity logging,
-- and role-aware RLS for brand-owned campaign surfaces.
-- ============================================================

-- -----------------------------------------------------------
-- 1. Extend user types
-- -----------------------------------------------------------
ALTER TABLE users
  DROP CONSTRAINT IF EXISTS users_user_type_check;

ALTER TABLE users
  ADD CONSTRAINT users_user_type_check
  CHECK (user_type IN ('creator', 'brand', 'brand_team'));

-- -----------------------------------------------------------
-- 2. Brand team tables
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS brand_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer'
    CHECK (role IN ('owner', 'admin', 'campaign_manager', 'content_reviewer', 'viewer')),
  title TEXT,
  public_display BOOLEAN DEFAULT true NOT NULL,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('invited', 'active', 'suspended', 'removed')),
  invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
  joined_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  suspended_at TIMESTAMPTZ,
  removed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT brand_team_members_brand_user_unique UNIQUE (brand_id, user_id),
  CONSTRAINT brand_team_members_no_self_membership CHECK (brand_id <> user_id)
);

CREATE TABLE IF NOT EXISTS brand_team_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer'
    CHECK (role IN ('admin', 'campaign_manager', 'content_reviewer', 'viewer')),
  title TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'revoked', 'expired')),
  invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
  accepted_by UUID REFERENCES users(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '14 days'),
  accepted_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT brand_team_invites_email_not_blank CHECK (char_length(trim(email)) > 0)
);

CREATE TABLE IF NOT EXISTS brand_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  actor_role TEXT
    CHECK (actor_role IS NULL OR actor_role IN ('owner', 'admin', 'campaign_manager', 'content_reviewer', 'viewer')),
  action_type TEXT NOT NULL CHECK (char_length(trim(action_type)) > 0),
  entity_type TEXT NOT NULL CHECK (char_length(trim(entity_type)) > 0),
  entity_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT brand_activity_log_metadata_is_object
    CHECK (jsonb_typeof(metadata) = 'object')
);

CREATE INDEX IF NOT EXISTS idx_brand_team_members_brand
  ON brand_team_members(brand_id);
CREATE INDEX IF NOT EXISTS idx_brand_team_members_user
  ON brand_team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_brand_team_members_brand_active
  ON brand_team_members(brand_id, user_id)
  WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_brand_team_members_brand_role
  ON brand_team_members(brand_id, role)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_brand_team_invites_brand_status
  ON brand_team_invites(brand_id, status);
CREATE INDEX IF NOT EXISTS idx_brand_team_invites_email
  ON brand_team_invites(LOWER(email));
CREATE UNIQUE INDEX IF NOT EXISTS idx_brand_team_invites_pending_unique
  ON brand_team_invites(brand_id, LOWER(email))
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_brand_activity_log_brand_created
  ON brand_activity_log(brand_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_brand_activity_log_actor
  ON brand_activity_log(actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_brand_activity_log_target
  ON brand_activity_log(entity_type, entity_id);

DROP TRIGGER IF EXISTS brand_team_members_updated_at ON brand_team_members;
CREATE TRIGGER brand_team_members_updated_at
  BEFORE UPDATE ON brand_team_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS brand_team_invites_updated_at ON brand_team_invites;
CREATE TRIGGER brand_team_invites_updated_at
  BEFORE UPDATE ON brand_team_invites
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- -----------------------------------------------------------
-- 3. Helper functions
-- -----------------------------------------------------------
CREATE OR REPLACE FUNCTION is_brand_team_member(p_brand_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM brand_team_members btm
    WHERE btm.brand_id = p_brand_id
      AND btm.user_id = p_user_id
      AND btm.status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION has_brand_role(p_brand_id UUID, p_user_id UUID, p_roles TEXT[])
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN p_brand_id IS NULL OR p_user_id IS NULL OR p_roles IS NULL THEN FALSE
    WHEN p_user_id = p_brand_id THEN EXISTS (
      SELECT 1
      FROM users brand
      WHERE brand.id = p_brand_id
        AND brand.user_type = 'brand'
        AND 'owner' = ANY(p_roles)
    )
    ELSE EXISTS (
      SELECT 1
      FROM brand_team_members btm
      WHERE btm.brand_id = p_brand_id
        AND btm.user_id = p_user_id
        AND btm.status = 'active'
        AND btm.role = ANY(p_roles)
    )
  END;
$$;

GRANT EXECUTE ON FUNCTION is_brand_team_member(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION has_brand_role(UUID, UUID, TEXT[]) TO authenticated;

-- -----------------------------------------------------------
-- 4. Add team attribution columns
-- -----------------------------------------------------------
ALTER TABLE opportunities
  ADD COLUMN IF NOT EXISTS campaign_contact_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS reviewed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE content_submissions
  ADD COLUMN IF NOT EXISTS reviewed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS payment_confirmed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS sender_brand_id UUID REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_opportunities_campaign_contact
  ON opportunities(campaign_contact_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_created_by_user
  ON opportunities(created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_updated_by_user
  ON opportunities(updated_by_user_id);
CREATE INDEX IF NOT EXISTS idx_applications_reviewed_by_user
  ON applications(reviewed_by_user_id);
CREATE INDEX IF NOT EXISTS idx_content_submissions_reviewed_by_user
  ON content_submissions(reviewed_by_user_id);
CREATE INDEX IF NOT EXISTS idx_content_submissions_payment_confirmed_by_user
  ON content_submissions(payment_confirmed_by_user_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_brand
  ON messages(sender_brand_id);

-- -----------------------------------------------------------
-- 5. RLS for new tables
-- -----------------------------------------------------------
ALTER TABLE brand_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_team_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_activity_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Brand owners and teams can read team members" ON brand_team_members;
CREATE POLICY "Brand owners and teams can read team members"
  ON brand_team_members FOR SELECT
  USING (
    auth.uid() = brand_id
    OR auth.uid() = user_id
    OR is_brand_team_member(brand_id, auth.uid())
  );

DROP POLICY IF EXISTS "Brand owners and admins can add team members" ON brand_team_members;
CREATE POLICY "Brand owners and admins can add team members"
  ON brand_team_members FOR INSERT
  WITH CHECK (
    has_brand_role(brand_id, auth.uid(), ARRAY['owner', 'admin'])
    AND (role <> 'owner' OR auth.uid() = brand_id)
    AND EXISTS (
      SELECT 1 FROM users brand
      WHERE brand.id = brand_id
        AND brand.user_type = 'brand'
    )
    AND EXISTS (
      SELECT 1 FROM users team_user
      WHERE team_user.id = user_id
        AND team_user.user_type = 'brand_team'
    )
  );

DROP POLICY IF EXISTS "Brand owners and admins can update team members" ON brand_team_members;
CREATE POLICY "Brand owners and admins can update team members"
  ON brand_team_members FOR UPDATE
  USING (has_brand_role(brand_id, auth.uid(), ARRAY['owner', 'admin']))
  WITH CHECK (
    has_brand_role(brand_id, auth.uid(), ARRAY['owner', 'admin'])
    AND (role <> 'owner' OR auth.uid() = brand_id)
    AND EXISTS (
      SELECT 1 FROM users brand
      WHERE brand.id = brand_id
        AND brand.user_type = 'brand'
    )
    AND EXISTS (
      SELECT 1 FROM users team_user
      WHERE team_user.id = user_id
        AND team_user.user_type = 'brand_team'
    )
  );

DROP POLICY IF EXISTS "Brand owners and admins can remove team members" ON brand_team_members;
CREATE POLICY "Brand owners and admins can remove team members"
  ON brand_team_members FOR DELETE
  USING (has_brand_role(brand_id, auth.uid(), ARRAY['owner', 'admin']));

DROP POLICY IF EXISTS "Brand invite managers can read invites" ON brand_team_invites;
CREATE POLICY "Brand invite managers can read invites"
  ON brand_team_invites FOR SELECT
  USING (
    has_brand_role(brand_id, auth.uid(), ARRAY['owner', 'admin'])
    OR EXISTS (
      SELECT 1
      FROM users invitee
      WHERE invitee.id = auth.uid()
        AND LOWER(invitee.email) = LOWER(brand_team_invites.email)
    )
  );

DROP POLICY IF EXISTS "Brand invite managers can create invites" ON brand_team_invites;
CREATE POLICY "Brand invite managers can create invites"
  ON brand_team_invites FOR INSERT
  WITH CHECK (
    has_brand_role(brand_id, auth.uid(), ARRAY['owner', 'admin'])
    AND invited_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM users brand
      WHERE brand.id = brand_id
        AND brand.user_type = 'brand'
    )
  );

DROP POLICY IF EXISTS "Brand invite managers can update invites" ON brand_team_invites;
CREATE POLICY "Brand invite managers can update invites"
  ON brand_team_invites FOR UPDATE
  USING (has_brand_role(brand_id, auth.uid(), ARRAY['owner', 'admin']))
  WITH CHECK (
    has_brand_role(brand_id, auth.uid(), ARRAY['owner', 'admin'])
    AND EXISTS (
      SELECT 1 FROM users brand
      WHERE brand.id = brand_id
        AND brand.user_type = 'brand'
    )
  );

DROP POLICY IF EXISTS "Brand invite managers can delete invites" ON brand_team_invites;
CREATE POLICY "Brand invite managers can delete invites"
  ON brand_team_invites FOR DELETE
  USING (has_brand_role(brand_id, auth.uid(), ARRAY['owner', 'admin']));

DROP POLICY IF EXISTS "Brand teams can read activity log" ON brand_activity_log;
CREATE POLICY "Brand teams can read activity log"
  ON brand_activity_log FOR SELECT
  USING (
    auth.uid() = brand_id
    OR is_brand_team_member(brand_id, auth.uid())
  );

DROP POLICY IF EXISTS "Brand actors can create activity log entries" ON brand_activity_log;
CREATE POLICY "Brand actors can create activity log entries"
  ON brand_activity_log FOR INSERT
  WITH CHECK (
    actor_id = auth.uid()
    AND has_brand_role(brand_id, auth.uid(), ARRAY['owner', 'admin', 'campaign_manager', 'content_reviewer'])
  );

-- -----------------------------------------------------------
-- 6. Role-aware RLS updates for brand-owned surfaces
-- -----------------------------------------------------------
DROP POLICY IF EXISTS "Active opportunities are publicly readable" ON opportunities;
CREATE POLICY "Active opportunities are publicly readable"
  ON opportunities FOR SELECT
  USING (
    status = 'active'
    OR auth.uid() = brand_id
    OR is_brand_team_member(brand_id, auth.uid())
  );

DROP POLICY IF EXISTS "Brands can create their own opportunities" ON opportunities;
CREATE POLICY "Brands can create their own opportunities"
  ON opportunities FOR INSERT
  WITH CHECK (
    has_brand_role(brand_id, auth.uid(), ARRAY['owner', 'admin', 'campaign_manager'])
  );

DROP POLICY IF EXISTS "Brands can update their own opportunities" ON opportunities;
CREATE POLICY "Brands can update their own opportunities"
  ON opportunities FOR UPDATE
  USING (
    has_brand_role(brand_id, auth.uid(), ARRAY['owner', 'admin', 'campaign_manager'])
  )
  WITH CHECK (
    has_brand_role(brand_id, auth.uid(), ARRAY['owner', 'admin', 'campaign_manager'])
  );

DROP POLICY IF EXISTS "Brands can read their own drafts" ON opportunity_drafts;
CREATE POLICY "Brands can read their own drafts"
  ON opportunity_drafts FOR SELECT
  USING (
    auth.uid() = brand_id
    OR is_brand_team_member(brand_id, auth.uid())
  );

DROP POLICY IF EXISTS "Brands can create their own drafts" ON opportunity_drafts;
CREATE POLICY "Brands can create their own drafts"
  ON opportunity_drafts FOR INSERT
  WITH CHECK (
    has_brand_role(brand_id, auth.uid(), ARRAY['owner', 'admin', 'campaign_manager'])
  );

DROP POLICY IF EXISTS "Brands can update their own drafts" ON opportunity_drafts;
CREATE POLICY "Brands can update their own drafts"
  ON opportunity_drafts FOR UPDATE
  USING (
    has_brand_role(brand_id, auth.uid(), ARRAY['owner', 'admin', 'campaign_manager'])
  )
  WITH CHECK (
    has_brand_role(brand_id, auth.uid(), ARRAY['owner', 'admin', 'campaign_manager'])
  );

DROP POLICY IF EXISTS "Brands can delete their own drafts" ON opportunity_drafts;
CREATE POLICY "Brands can delete their own drafts"
  ON opportunity_drafts FOR DELETE
  USING (
    has_brand_role(brand_id, auth.uid(), ARRAY['owner', 'admin', 'campaign_manager'])
  );

DROP POLICY IF EXISTS "Creators see their applications, brands see applications to their campaigns" ON applications;
CREATE POLICY "Creators see their applications, brands see applications to their campaigns"
  ON applications FOR SELECT
  USING (
    auth.uid() = creator_id
    OR EXISTS (
      SELECT 1
      FROM opportunities o
      WHERE o.id = applications.opportunity_id
        AND (
          auth.uid() = o.brand_id
          OR is_brand_team_member(o.brand_id, auth.uid())
        )
    )
  );

DROP POLICY IF EXISTS "Creators update their own applications, brands update applications to their campaigns" ON applications;
CREATE POLICY "Creators update their own applications, brands update applications to their campaigns"
  ON applications FOR UPDATE
  USING (
    auth.uid() = creator_id
    OR EXISTS (
      SELECT 1
      FROM opportunities o
      WHERE o.id = applications.opportunity_id
        AND has_brand_role(o.brand_id, auth.uid(), ARRAY['owner', 'admin', 'campaign_manager'])
    )
  )
  WITH CHECK (
    auth.uid() = creator_id
    OR EXISTS (
      SELECT 1
      FROM opportunities o
      WHERE o.id = applications.opportunity_id
        AND has_brand_role(o.brand_id, auth.uid(), ARRAY['owner', 'admin', 'campaign_manager'])
    )
  );

DROP POLICY IF EXISTS "Content submissions visible to creator and brand" ON content_submissions;
CREATE POLICY "Content submissions visible to creator and brand"
  ON content_submissions FOR SELECT
  USING (
    auth.uid() = creator_id
    OR EXISTS (
      SELECT 1
      FROM applications a
      JOIN opportunities o ON a.opportunity_id = o.id
      WHERE a.id = content_submissions.application_id
        AND (
          auth.uid() = o.brand_id
          OR is_brand_team_member(o.brand_id, auth.uid())
        )
    )
  );

DROP POLICY IF EXISTS "Creators and brands update their content submissions" ON content_submissions;
CREATE POLICY "Creators and brands update their content submissions"
  ON content_submissions FOR UPDATE
  USING (
    auth.uid() = creator_id
    OR EXISTS (
      SELECT 1
      FROM applications a
      JOIN opportunities o ON a.opportunity_id = o.id
      WHERE a.id = content_submissions.application_id
        AND has_brand_role(o.brand_id, auth.uid(), ARRAY['owner', 'admin', 'campaign_manager', 'content_reviewer'])
    )
  )
  WITH CHECK (
    auth.uid() = creator_id
    OR EXISTS (
      SELECT 1
      FROM applications a
      JOIN opportunities o ON a.opportunity_id = o.id
      WHERE a.id = content_submissions.application_id
        AND has_brand_role(o.brand_id, auth.uid(), ARRAY['owner', 'admin', 'campaign_manager', 'content_reviewer'])
    )
  );

DROP POLICY IF EXISTS "Participants can view their conversations" ON conversations;
CREATE POLICY "Participants can view their conversations"
  ON conversations FOR SELECT
  USING (
    auth.uid() = creator_id
    OR auth.uid() = brand_id
    OR is_brand_team_member(brand_id, auth.uid())
  );

DROP POLICY IF EXISTS "Participants can create conversations" ON conversations;
CREATE POLICY "Participants can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (
    auth.uid() = created_by
    AND (
      auth.uid() = creator_id
      OR has_brand_role(brand_id, auth.uid(), ARRAY['owner', 'admin', 'campaign_manager', 'content_reviewer'])
    )
    AND EXISTS (
      SELECT 1 FROM users brand
      WHERE brand.id = conversations.brand_id
        AND brand.user_type = 'brand'
    )
    AND EXISTS (
      SELECT 1 FROM users creator
      WHERE creator.id = conversations.creator_id
        AND creator.user_type = 'creator'
    )
  );

DROP POLICY IF EXISTS "Participants can update conversation metadata" ON conversations;
CREATE POLICY "Participants can update conversation metadata"
  ON conversations FOR UPDATE
  USING (
    auth.uid() = creator_id
    OR has_brand_role(brand_id, auth.uid(), ARRAY['owner', 'admin', 'campaign_manager', 'content_reviewer'])
  )
  WITH CHECK (
    auth.uid() = creator_id
    OR has_brand_role(brand_id, auth.uid(), ARRAY['owner', 'admin', 'campaign_manager', 'content_reviewer'])
  );

DROP POLICY IF EXISTS "Participants can view messages" ON messages;
CREATE POLICY "Participants can view messages"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
        AND (
          auth.uid() = conversations.brand_id
          OR auth.uid() = conversations.creator_id
          OR is_brand_team_member(conversations.brand_id, auth.uid())
        )
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

DROP POLICY IF EXISTS "Participants can mark messages read" ON messages;
CREATE POLICY "Participants can mark messages read"
  ON messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
        AND (
          auth.uid() = conversations.creator_id
          OR has_brand_role(
            conversations.brand_id,
            auth.uid(),
            ARRAY['owner', 'admin', 'campaign_manager', 'content_reviewer']
          )
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
        AND (
          auth.uid() = conversations.creator_id
          OR has_brand_role(
            conversations.brand_id,
            auth.uid(),
            ARRAY['owner', 'admin', 'campaign_manager', 'content_reviewer']
          )
        )
    )
  );
