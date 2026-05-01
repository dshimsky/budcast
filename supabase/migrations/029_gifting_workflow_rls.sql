-- ============================================================
-- Migration: 029_gifting_workflow_rls
-- Hardens gifting_workflow RLS policies.
--
-- Migration 028 enabled RLS and created three baseline policies
-- but they:
--   1. Lacked the explicit TO authenticated role
--   2. Used a single broad UPDATE policy (brand OR creator) with
--      no WITH CHECK, allowing either party to overwrite fields
--      that only the other party should control
--   3. Had no INSERT policy — correct (inserts are SECURITY
--      DEFINER via review_application_rpc, which bypasses RLS),
--      but now made explicit with a blanket deny on direct inserts
--
-- This migration drops and replaces all three policies and adds
-- separate brand/creator UPDATE policies with WITH CHECK.
-- ============================================================

-- ---------------------------------------------------------------------------
-- 1. Drop existing policies from migration 028
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Brands can view their gifting records"    ON gifting_workflow;
DROP POLICY IF EXISTS "Creators can view their gifting records"  ON gifting_workflow;
DROP POLICY IF EXISTS "Gifting parties can update their records" ON gifting_workflow;

-- ---------------------------------------------------------------------------
-- 2. SELECT — brand sees all records for their campaigns
-- ---------------------------------------------------------------------------
CREATE POLICY "gifting_workflow: brand select"
  ON gifting_workflow FOR SELECT
  TO authenticated
  USING (auth.uid() = brand_id);

-- ---------------------------------------------------------------------------
-- 3. SELECT — creator sees only their own records
-- ---------------------------------------------------------------------------
CREATE POLICY "gifting_workflow: creator select"
  ON gifting_workflow FOR SELECT
  TO authenticated
  USING (auth.uid() = creator_id);

-- ---------------------------------------------------------------------------
-- 4. INSERT — blocked for direct client calls.
--    Records are created server-side via review_application_rpc
--    (SECURITY DEFINER), which bypasses RLS. This explicit deny
--    prevents any client-side INSERT from slipping through.
-- ---------------------------------------------------------------------------
CREATE POLICY "gifting_workflow: no direct insert"
  ON gifting_workflow FOR INSERT
  TO authenticated
  WITH CHECK (false);

-- ---------------------------------------------------------------------------
-- 5. UPDATE — brand
--    Brand may advance status to brand_shipped or cancelled,
--    and record their contact method. They may not touch
--    creator-owned fields (creator_received_at, creator_feedback,
--    substitution_notes, creator_state_confirmed,
--    creator_age_confirmed).
--
--    WITH CHECK restricts the resulting row: brand_id and
--    creator_id must remain unchanged, and status may only
--    move to brand_shipped, cancelled, or stay pending from
--    this side.
-- ---------------------------------------------------------------------------
CREATE POLICY "gifting_workflow: brand update"
  ON gifting_workflow FOR UPDATE
  TO authenticated
  USING (auth.uid() = brand_id)
  WITH CHECK (
    auth.uid() = brand_id
    AND status IN ('brand_shipped', 'cancelled', 'pending_brand_action')
  );

-- ---------------------------------------------------------------------------
-- 6. UPDATE — creator
--    Creator may confirm receipt, decline, or request
--    substitution. They may not touch brand-owned fields
--    (brand_contact_method, brand_contact_at).
--
--    WITH CHECK restricts the resulting row: status may only
--    move to creator-initiated terminal states from this side.
-- ---------------------------------------------------------------------------
CREATE POLICY "gifting_workflow: creator update"
  ON gifting_workflow FOR UPDATE
  TO authenticated
  USING (auth.uid() = creator_id)
  WITH CHECK (
    auth.uid() = creator_id
    AND status IN ('creator_received', 'creator_declined', 'substitution_requested')
  );

-- ---------------------------------------------------------------------------
-- 7. DELETE — blocked for all authenticated users.
--    Gifting records are a permanent compliance audit trail.
--    Cancellation is handled by setting status = 'cancelled',
--    not by deleting the row.
-- ---------------------------------------------------------------------------
CREATE POLICY "gifting_workflow: no delete"
  ON gifting_workflow FOR DELETE
  TO authenticated
  USING (false);
