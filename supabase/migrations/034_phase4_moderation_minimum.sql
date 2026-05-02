-- ============================================================
-- Migration: 034_phase4_moderation_minimum
-- Admin-safe moderation action RPC for launch safety review.
-- ============================================================

CREATE OR REPLACE FUNCTION moderate_safety_report(
  p_report_id UUID,
  p_status TEXT,
  p_resolution_note TEXT DEFAULT NULL,
  p_action TEXT DEFAULT 'status_only'
)
RETURNS safety_reports
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_id UUID := auth.uid();
  v_report safety_reports;
  v_next_status TEXT := p_status;
  v_action TEXT := COALESCE(NULLIF(trim(p_action), ''), 'status_only');
  v_suspend_target UUID;
BEGIN
  IF v_actor_id IS NULL THEN
    RAISE EXCEPTION 'NOT_SIGNED_IN';
  END IF;

  IF NOT is_platform_admin(auth.uid()) THEN
    RAISE EXCEPTION 'PLATFORM_ADMIN_REQUIRED';
  END IF;

  IF p_status NOT IN ('reviewing', 'actioned', 'dismissed') THEN
    RAISE EXCEPTION 'INVALID_MODERATION_STATUS';
  END IF;

  IF v_action NOT IN ('status_only', 'remove_content', 'suspend_profile') THEN
    RAISE EXCEPTION 'INVALID_MODERATION_ACTION';
  END IF;

  SELECT *
  INTO v_report
  FROM safety_reports
  WHERE id = p_report_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'SAFETY_REPORT_NOT_FOUND';
  END IF;

  IF v_action = 'remove_content' THEN
    v_next_status := 'actioned';

    IF v_report.target_type = 'review' AND v_report.target_id IS NOT NULL THEN
      UPDATE reviews
      SET
        review_status = 'removed',
        moderator_reviewed = true,
        reported = true,
        report_reason = COALESCE(NULLIF(trim(p_resolution_note), ''), report_reason),
        updated_at = NOW()
      WHERE id = v_report.target_id;
    ELSIF v_report.target_type = 'feed_post' AND v_report.target_id IS NOT NULL THEN
      UPDATE feed_posts
      SET
        visibility = 'private',
        updated_at = NOW()
      WHERE id = v_report.target_id;
    ELSIF v_report.target_type = 'campaign' AND v_report.target_id IS NOT NULL THEN
      UPDATE opportunities
      SET
        status = 'cancelled',
        updated_at = NOW()
      WHERE id = v_report.target_id;
    END IF;
  END IF;

  IF v_action = 'suspend_profile' THEN
    v_next_status := 'actioned';
    v_suspend_target := COALESCE(
      v_report.reported_user_id,
      CASE WHEN v_report.target_type = 'profile' THEN v_report.target_id ELSE NULL END
    );

    IF v_suspend_target IS NULL THEN
      RAISE EXCEPTION 'NO_PROFILE_TO_SUSPEND';
    END IF;

    UPDATE users
    SET
      account_status = 'suspended',
      updated_at = NOW()
    WHERE id = v_suspend_target;
  END IF;

  UPDATE safety_reports
  SET
    metadata = metadata || jsonb_build_object(
      'moderation_action', v_action,
      'moderation_action_at', NOW(),
      'moderation_action_by', v_actor_id
    ),
    resolution_note = NULLIF(trim(COALESCE(p_resolution_note, '')), ''),
    reviewed_at = NOW(),
    reviewed_by = v_actor_id,
    status = v_next_status,
    updated_at = NOW()
  WHERE id = p_report_id
  RETURNING * INTO v_report;

  RETURN v_report;
END;
$$;

REVOKE EXECUTE ON FUNCTION moderate_safety_report(UUID, TEXT, TEXT, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION moderate_safety_report(UUID, TEXT, TEXT, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION moderate_safety_report(UUID, TEXT, TEXT, TEXT) TO authenticated;
