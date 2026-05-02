-- =============================================================================
-- Migration 037: Phase 7 Differentiators
-- =============================================================================
-- Adds cannabis-native campaign intelligence surfaces:
-- content library / rights vault, campaign recap analytics, and repeat
-- collaboration workflows.
-- =============================================================================

CREATE TABLE IF NOT EXISTS content_library_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES users(id) ON DELETE SET NULL,
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE SET NULL,
  application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
  submission_id UUID REFERENCES content_submissions(id) ON DELETE SET NULL UNIQUE,
  asset_url TEXT NOT NULL,
  asset_type TEXT NOT NULL DEFAULT 'post_url'
    CHECK (asset_type IN ('post_url', 'screenshot', 'image', 'video', 'document', 'other')),
  asset_title TEXT,
  usage_terms TEXT NOT NULL DEFAULT 'Organic repost only unless expanded rights are confirmed on the source campaign.',
  rights_expires_at TIMESTAMPTZ,
  approval_status TEXT NOT NULL DEFAULT 'approved'
    CHECK (approval_status IN ('approved', 'needs_review', 'expired', 'revoked')),
  market_tags TEXT[] NOT NULL DEFAULT '{}',
  product_category_tags TEXT[] NOT NULL DEFAULT '{}',
  platform_tags TEXT[] NOT NULL DEFAULT '{}',
  engagement_metrics JSONB NOT NULL DEFAULT '{}'::JSONB,
  source_metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_library_brand_created
  ON content_library_assets(brand_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_content_library_creator
  ON content_library_assets(creator_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_content_library_market_tags
  ON content_library_assets USING GIN (market_tags);

CREATE INDEX IF NOT EXISTS idx_content_library_product_category_tags
  ON content_library_assets USING GIN (product_category_tags);

CREATE INDEX IF NOT EXISTS idx_content_library_platform_tags
  ON content_library_assets USING GIN (platform_tags);

CREATE TRIGGER content_library_assets_updated_at
  BEFORE UPDATE ON content_library_assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE content_library_assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Brand teams can read content library assets" ON content_library_assets;
CREATE POLICY "Brand teams can read content library assets"
  ON content_library_assets FOR SELECT
  USING (has_brand_role(brand_id, auth.uid(), ARRAY['owner', 'admin', 'campaign_manager', 'content_reviewer', 'viewer']));

DROP POLICY IF EXISTS "Creators can read their approved library assets" ON content_library_assets;
CREATE POLICY "Creators can read their approved library assets"
  ON content_library_assets FOR SELECT
  USING (creator_id = auth.uid() AND approval_status = 'approved');

DROP POLICY IF EXISTS "Brand teams can manage content library assets" ON content_library_assets;
CREATE POLICY "Brand teams can manage content library assets"
  ON content_library_assets FOR ALL
  USING (has_brand_role(brand_id, auth.uid(), ARRAY['owner', 'admin', 'campaign_manager', 'content_reviewer']))
  WITH CHECK (has_brand_role(brand_id, auth.uid(), ARRAY['owner', 'admin', 'campaign_manager', 'content_reviewer']));

CREATE TABLE IF NOT EXISTS preferred_creator_pools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (brand_id, name)
);

CREATE INDEX IF NOT EXISTS idx_preferred_creator_pools_brand
  ON preferred_creator_pools(brand_id, created_at DESC);

CREATE TRIGGER preferred_creator_pools_updated_at
  BEFORE UPDATE ON preferred_creator_pools
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE preferred_creator_pools ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Brand teams can read preferred creator pools" ON preferred_creator_pools;
CREATE POLICY "Brand teams can read preferred creator pools"
  ON preferred_creator_pools FOR SELECT
  USING (has_brand_role(brand_id, auth.uid(), ARRAY['owner', 'admin', 'campaign_manager', 'content_reviewer', 'viewer']));

DROP POLICY IF EXISTS "Brand teams can manage preferred creator pools" ON preferred_creator_pools;
CREATE POLICY "Brand teams can manage preferred creator pools"
  ON preferred_creator_pools FOR ALL
  USING (has_brand_role(brand_id, auth.uid(), ARRAY['owner', 'admin', 'campaign_manager']))
  WITH CHECK (has_brand_role(brand_id, auth.uid(), ARRAY['owner', 'admin', 'campaign_manager']));

CREATE TABLE IF NOT EXISTS preferred_creator_pool_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id UUID NOT NULL REFERENCES preferred_creator_pools(id) ON DELETE CASCADE,
  brand_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source_opportunity_id UUID REFERENCES opportunities(id) ON DELETE SET NULL,
  notes TEXT,
  availability TEXT NOT NULL DEFAULT 'unknown'
    CHECK (availability IN ('open', 'limited', 'unavailable', 'unknown')),
  added_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (pool_id, creator_id)
);

CREATE INDEX IF NOT EXISTS idx_preferred_creator_pool_members_brand
  ON preferred_creator_pool_members(brand_id, creator_id);

ALTER TABLE preferred_creator_pool_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Brand teams can read preferred creator pool members" ON preferred_creator_pool_members;
CREATE POLICY "Brand teams can read preferred creator pool members"
  ON preferred_creator_pool_members FOR SELECT
  USING (has_brand_role(brand_id, auth.uid(), ARRAY['owner', 'admin', 'campaign_manager', 'content_reviewer', 'viewer']));

DROP POLICY IF EXISTS "Brand teams can manage preferred creator pool members" ON preferred_creator_pool_members;
CREATE POLICY "Brand teams can manage preferred creator pool members"
  ON preferred_creator_pool_members FOR ALL
  USING (has_brand_role(brand_id, auth.uid(), ARRAY['owner', 'admin', 'campaign_manager']))
  WITH CHECK (has_brand_role(brand_id, auth.uid(), ARRAY['owner', 'admin', 'campaign_manager']));

CREATE TABLE IF NOT EXISTS repeat_collaboration_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source_opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  new_opportunity_id UUID REFERENCES opportunities(id) ON DELETE SET NULL,
  invite_type TEXT NOT NULL DEFAULT 'private_invite'
    CHECK (invite_type IN ('rehire_creator', 'private_invite', 'duplicate_campaign')),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'declined', 'expired', 'cancelled')),
  note TEXT,
  creator_availability_snapshot TEXT NOT NULL DEFAULT 'unknown',
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '14 days')
);

CREATE INDEX IF NOT EXISTS idx_repeat_collaboration_brand
  ON repeat_collaboration_invites(brand_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_repeat_collaboration_creator
  ON repeat_collaboration_invites(creator_id, status, created_at DESC);

ALTER TABLE repeat_collaboration_invites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Brand teams can read repeat collaboration invites" ON repeat_collaboration_invites;
CREATE POLICY "Brand teams can read repeat collaboration invites"
  ON repeat_collaboration_invites FOR SELECT
  USING (has_brand_role(brand_id, auth.uid(), ARRAY['owner', 'admin', 'campaign_manager', 'content_reviewer', 'viewer']));

DROP POLICY IF EXISTS "Creators can read their repeat collaboration invites" ON repeat_collaboration_invites;
CREATE POLICY "Creators can read their repeat collaboration invites"
  ON repeat_collaboration_invites FOR SELECT
  USING (creator_id = auth.uid());

DROP POLICY IF EXISTS "Brand teams can manage repeat collaboration invites" ON repeat_collaboration_invites;
CREATE POLICY "Brand teams can manage repeat collaboration invites"
  ON repeat_collaboration_invites FOR ALL
  USING (has_brand_role(brand_id, auth.uid(), ARRAY['owner', 'admin', 'campaign_manager']))
  WITH CHECK (has_brand_role(brand_id, auth.uid(), ARRAY['owner', 'admin', 'campaign_manager']));

CREATE OR REPLACE FUNCTION sync_content_library_asset_from_submission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_application applications%ROWTYPE;
  v_opportunity opportunities%ROWTYPE;
BEGIN
  IF NEW.verification_status IS DISTINCT FROM 'verified' THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.verification_status IS NOT DISTINCT FROM 'verified' THEN
    RETURN NEW;
  END IF;

  SELECT * INTO v_application
  FROM applications
  WHERE id = NEW.application_id;

  IF v_application.id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT * INTO v_opportunity
  FROM opportunities
  WHERE id = v_application.opportunity_id;

  IF v_opportunity.id IS NULL THEN
    RETURN NEW;
  END IF;

  INSERT INTO content_library_assets (
    brand_id,
    creator_id,
    opportunity_id,
    application_id,
    submission_id,
    asset_url,
    asset_type,
    asset_title,
    usage_terms,
    rights_expires_at,
    market_tags,
    product_category_tags,
    platform_tags,
    source_metadata
  ) VALUES (
    v_opportunity.brand_id,
    v_application.creator_id,
    v_opportunity.id,
    v_application.id,
    NEW.id,
    COALESCE(NULLIF(NEW.post_url, ''), NEW.screenshot_url),
    CASE WHEN NEW.screenshot_url IS NOT NULL THEN 'screenshot' ELSE 'post_url' END,
    v_opportunity.title,
    CONCAT_WS(
      '; ',
      CASE WHEN v_opportunity.rights_organic_repost THEN 'Organic repost allowed' ELSE NULL END,
      CASE WHEN v_opportunity.rights_paid_ads THEN 'Paid ads allowed' ELSE NULL END,
      CASE WHEN v_opportunity.rights_whitelisting THEN 'Whitelisting allowed' ELSE NULL END,
      CASE WHEN v_opportunity.rights_handle_licensing THEN 'Creator handle licensing allowed' ELSE NULL END,
      CASE WHEN v_opportunity.rights_no_ai_training THEN 'No AI training use' ELSE NULL END
    ),
    v_opportunity.rights_expires_at,
    COALESCE(v_opportunity.eligible_states, ARRAY[]::TEXT[]),
    COALESCE(v_opportunity.categories, ARRAY[]::TEXT[]),
    COALESCE(v_opportunity.target_platforms, ARRAY[]::TEXT[]),
    jsonb_build_object(
      'post_type', NEW.post_type,
      'campaign_number', v_opportunity.campaign_number,
      'verified_at', NEW.verified_at
    )
  )
  ON CONFLICT (submission_id) DO UPDATE SET
    asset_url = EXCLUDED.asset_url,
    asset_type = EXCLUDED.asset_type,
    asset_title = EXCLUDED.asset_title,
    usage_terms = EXCLUDED.usage_terms,
    rights_expires_at = EXCLUDED.rights_expires_at,
    market_tags = EXCLUDED.market_tags,
    product_category_tags = EXCLUDED.product_category_tags,
    platform_tags = EXCLUDED.platform_tags,
    source_metadata = EXCLUDED.source_metadata,
    approval_status = 'approved',
    updated_at = NOW();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_content_library_asset_from_submission ON content_submissions;
CREATE TRIGGER trg_sync_content_library_asset_from_submission
  AFTER INSERT OR UPDATE OF verification_status, post_url, screenshot_url, verified_at ON content_submissions
  FOR EACH ROW
  EXECUTE FUNCTION sync_content_library_asset_from_submission();

CREATE OR REPLACE FUNCTION get_campaign_recap(p_opportunity_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_id UUID := auth.uid();
  v_opportunity opportunities%ROWTYPE;
  v_total_applications INTEGER := 0;
  v_accepted_applications INTEGER := 0;
  v_completed_applications INTEGER := 0;
  v_disputed_applications INTEGER := 0;
  v_usable_asset_count INTEGER := 0;
  v_usable_assets JSONB := '[]'::JSONB;
  v_dispute_count INTEGER := 0;
  v_review_score NUMERIC(2,1);
  v_market_feedback JSONB := '[]'::JSONB;
  v_post_urls JSONB := '[]'::JSONB;
  v_engagement JSONB := '[]'::JSONB;
  v_repeat_creators JSONB := '[]'::JSONB;
BEGIN
  IF v_actor_id IS NULL THEN
    RAISE EXCEPTION 'NOT_SIGNED_IN';
  END IF;

  SELECT * INTO v_opportunity
  FROM opportunities
  WHERE id = p_opportunity_id;

  IF v_opportunity.id IS NULL THEN
    RAISE EXCEPTION 'CAMPAIGN_NOT_FOUND';
  END IF;

  IF NOT has_brand_role(v_opportunity.brand_id, v_actor_id, ARRAY['owner', 'admin', 'campaign_manager', 'content_reviewer', 'viewer']) THEN
    RAISE EXCEPTION 'NOT_AUTHORIZED_FOR_CAMPAIGN_RECAP';
  END IF;

  SELECT
    COUNT(*)::INTEGER,
    COUNT(*) FILTER (WHERE status IN ('accepted', 'completed', 'disputed'))::INTEGER,
    COUNT(*) FILTER (WHERE status = 'completed')::INTEGER,
    COUNT(*) FILTER (WHERE status = 'disputed')::INTEGER
    INTO v_total_applications, v_accepted_applications, v_completed_applications, v_disputed_applications
  FROM applications
  WHERE opportunity_id = p_opportunity_id;

  SELECT
    COUNT(*)::INTEGER,
    COALESCE(jsonb_agg(jsonb_build_object(
      'id', cla.id,
      'creator_id', cla.creator_id,
      'creator_name', creator.name,
      'creator_avatar_url', creator.avatar_url,
      'post_type', cla.asset_type,
      'post_url', cla.asset_url,
      'title', cla.asset_title,
      'status', cla.approval_status,
      'created_at', cla.created_at
    ) ORDER BY cla.created_at DESC), '[]'::JSONB)
    INTO v_usable_asset_count, v_usable_assets
  FROM content_library_assets cla
  LEFT JOIN users creator ON creator.id = cla.creator_id
  WHERE opportunity_id = p_opportunity_id
    AND approval_status = 'approved';

  SELECT COUNT(DISTINCT d.id)::INTEGER
    INTO v_dispute_count
  FROM disputes d
  JOIN applications a ON a.id = d.application_id
  WHERE a.opportunity_id = p_opportunity_id;

  SELECT ROUND(AVG(overall_score)::NUMERIC, 1)
    INTO v_review_score
  FROM reviews r
  JOIN applications a ON a.id = r.application_id
  WHERE a.opportunity_id = p_opportunity_id
    AND r.review_status = 'published'
    AND r.overall_score IS NOT NULL;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'review_text', r.review_text,
    'overall_score', r.overall_score,
    'created_at', r.created_at
  ) ORDER BY r.created_at DESC), '[]'::JSONB)
    INTO v_market_feedback
  FROM reviews r
  JOIN applications a ON a.id = r.application_id
  WHERE a.opportunity_id = p_opportunity_id
    AND r.review_status = 'published'
    AND NULLIF(r.review_text, '') IS NOT NULL;

  SELECT COALESCE(jsonb_agg(DISTINCT s.post_url), '[]'::JSONB)
    INTO v_post_urls
  FROM content_submissions s
  JOIN applications a ON a.id = s.application_id
  WHERE a.opportunity_id = p_opportunity_id
    AND NULLIF(s.post_url, '') IS NOT NULL;

  SELECT COALESCE(jsonb_agg(cla.engagement_metrics), '[]'::JSONB)
    INTO v_engagement
  FROM content_library_assets cla
  WHERE cla.opportunity_id = p_opportunity_id
    AND cla.engagement_metrics <> '{}'::JSONB;

  SELECT COALESCE(jsonb_agg(DISTINCT jsonb_build_object(
    'id', creator.id,
    'name', creator.name,
    'avatar_url', creator.avatar_url,
    'location', creator.location,
    'instagram', creator.instagram,
    'tiktok', creator.tiktok,
    'youtube', creator.youtube,
    'review_score', creator.review_score,
    'completion_rate', creator.completion_rate,
    'creator_availability', creator.creator_availability
  )), '[]'::JSONB)
    INTO v_repeat_creators
  FROM applications a
  JOIN users creator ON creator.id = a.creator_id
  WHERE a.opportunity_id = p_opportunity_id
    AND a.status IN ('accepted', 'completed')
    AND creator.creator_availability IS DISTINCT FROM 'unavailable';

  RETURN jsonb_build_object(
    'opportunity_id', p_opportunity_id,
    'usable_assets', v_usable_assets,
    'usable_asset_count', COALESCE(v_usable_asset_count, 0),
    'application_conversion', CASE
      WHEN COALESCE(v_total_applications, 0) = 0 THEN 0
      ELSE ROUND((v_accepted_applications::NUMERIC / v_total_applications::NUMERIC) * 100, 1)
    END,
    'completion_rate', CASE
      WHEN COALESCE(v_accepted_applications, 0) = 0 THEN 0
      ELSE ROUND((v_completed_applications::NUMERIC / v_accepted_applications::NUMERIC) * 100, 1)
    END,
    'dispute_rate', CASE
      WHEN COALESCE(v_accepted_applications, 0) = 0 THEN 0
      ELSE ROUND((GREATEST(v_disputed_applications, v_dispute_count)::NUMERIC / v_accepted_applications::NUMERIC) * 100, 1)
    END,
    'review_score', v_review_score,
    'market_feedback', v_market_feedback,
    'post_urls', v_post_urls,
    'engagement', v_engagement,
    'repeat_creators', v_repeat_creators,
    'total_applications', COALESCE(v_total_applications, 0),
    'accepted_applications', COALESCE(v_accepted_applications, 0),
    'completed_applications', COALESCE(v_completed_applications, 0)
  );
END;
$$;

CREATE OR REPLACE FUNCTION create_repeat_collaboration_invite(
  p_creator_id UUID,
  p_source_opportunity_id UUID,
  p_note TEXT DEFAULT NULL,
  p_new_opportunity_id UUID DEFAULT NULL
)
RETURNS repeat_collaboration_invites
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_id UUID := auth.uid();
  v_source opportunities%ROWTYPE;
  v_creator users%ROWTYPE;
  v_invite repeat_collaboration_invites%ROWTYPE;
BEGIN
  IF v_actor_id IS NULL THEN
    RAISE EXCEPTION 'NOT_SIGNED_IN';
  END IF;

  SELECT * INTO v_source
  FROM opportunities
  WHERE id = p_source_opportunity_id;

  IF v_source.id IS NULL THEN
    RAISE EXCEPTION 'SOURCE_CAMPAIGN_NOT_FOUND';
  END IF;

  IF NOT has_brand_role(v_source.brand_id, v_actor_id, ARRAY['owner', 'admin', 'campaign_manager']) THEN
    RAISE EXCEPTION 'NOT_AUTHORIZED_TO_INVITE_CREATOR';
  END IF;

  SELECT * INTO v_creator
  FROM users
  WHERE id = p_creator_id
    AND user_type = 'creator';

  IF v_creator.id IS NULL THEN
    RAISE EXCEPTION 'CREATOR_NOT_FOUND';
  END IF;

  INSERT INTO repeat_collaboration_invites (
    brand_id,
    creator_id,
    source_opportunity_id,
    new_opportunity_id,
    invite_type,
    note,
    creator_availability_snapshot,
    created_by
  ) VALUES (
    v_source.brand_id,
    p_creator_id,
    p_source_opportunity_id,
    p_new_opportunity_id,
    CASE WHEN p_new_opportunity_id IS NULL THEN 'rehire_creator' ELSE 'private_invite' END,
    NULLIF(trim(COALESCE(p_note, '')), ''),
    COALESCE(v_creator.creator_availability, 'unknown'),
    v_actor_id
  )
  RETURNING * INTO v_invite;

  INSERT INTO preferred_creator_pools (brand_id, name, description, created_by)
  VALUES (v_source.brand_id, 'Repeat collaborators', 'Creators rehired or privately invited from prior BudCast campaigns.', v_actor_id)
  ON CONFLICT (brand_id, name) DO NOTHING;

  INSERT INTO preferred_creator_pool_members (
    pool_id,
    brand_id,
    creator_id,
    source_opportunity_id,
    notes,
    availability,
    added_by
  )
  SELECT
    p.id,
    v_source.brand_id,
    p_creator_id,
    p_source_opportunity_id,
    p_note,
    COALESCE(v_creator.creator_availability, 'unknown'),
    v_actor_id
  FROM preferred_creator_pools p
  WHERE p.brand_id = v_source.brand_id
    AND p.name = 'Repeat collaborators'
  ON CONFLICT (pool_id, creator_id) DO UPDATE SET
    source_opportunity_id = EXCLUDED.source_opportunity_id,
    notes = COALESCE(EXCLUDED.notes, preferred_creator_pool_members.notes),
    availability = EXCLUDED.availability,
    added_by = EXCLUDED.added_by;

  RETURN v_invite;
END;
$$;

REVOKE EXECUTE ON FUNCTION get_campaign_recap(UUID) FROM anon;
GRANT EXECUTE ON FUNCTION get_campaign_recap(UUID) TO authenticated;

REVOKE EXECUTE ON FUNCTION create_repeat_collaboration_invite(UUID, UUID, TEXT, UUID) FROM anon;
GRANT EXECUTE ON FUNCTION create_repeat_collaboration_invite(UUID, UUID, TEXT, UUID) TO authenticated;
