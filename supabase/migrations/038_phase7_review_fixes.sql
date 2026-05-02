-- =============================================================================
-- Migration 038: Phase 7 Review Fixes
-- =============================================================================
-- Hardens repeat collaboration ownership checks and keeps approved library
-- assets fresh when verified submissions are corrected.
-- =============================================================================

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
  v_destination_brand_id UUID;
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

  IF p_new_opportunity_id IS NOT NULL THEN
    SELECT brand_id INTO v_destination_brand_id
    FROM opportunities
    WHERE id = p_new_opportunity_id;

    IF v_destination_brand_id IS NULL THEN
      RAISE EXCEPTION 'DESTINATION_CAMPAIGN_NOT_FOUND';
    END IF;

    IF v_destination_brand_id IS DISTINCT FROM v_source.brand_id THEN
      RAISE EXCEPTION 'DESTINATION_CAMPAIGN_BRAND_MISMATCH';
    END IF;
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
