import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migration = readFileSync(
  new URL("../../../supabase/migrations/022_security_privacy_hardening.sql", import.meta.url),
  "utf8"
);
const publicProfilesMigration = readFileSync(
  new URL("../../../supabase/migrations/023_public_profile_boundary.sql", import.meta.url),
  "utf8"
);
const moderationMigration = readFileSync(
  new URL("../../../supabase/migrations/024_platform_moderation.sql", import.meta.url),
  "utf8"
);
const initialAdminMigration = readFileSync(
  new URL("../../../supabase/migrations/025_initial_platform_admin.sql", import.meta.url),
  "utf8"
);
const economicStateMigration = readFileSync(
  new URL("../../../supabase/migrations/026_lock_economic_state.sql", import.meta.url),
  "utf8"
);
const trustLayerMigration = readFileSync(
  new URL("../../../supabase/migrations/027_trust_layer.sql", import.meta.url),
  "utf8"
);
const rightsAndGiftingMigration = readFileSync(
  new URL("../../../supabase/migrations/028_usage_rights_and_gifting.sql", import.meta.url),
  "utf8"
);
const giftingRlsMigration = readFileSync(
  new URL("../../../supabase/migrations/029_gifting_workflow_rls.sql", import.meta.url),
  "utf8"
);
const trustRpcGrantMigration = readFileSync(
  new URL("../../../supabase/migrations/030_trust_rpc_grants.sql", import.meta.url),
  "utf8"
);

test("security hardening migration restricts direct profile updates and adds safe update RPC", () => {
  assert.match(migration, /DROP POLICY IF EXISTS "Users can update their own profile"/);
  assert.match(migration, /CREATE POLICY "Profiles are RPC update only"/);
  assert.match(migration, /CREATE OR REPLACE FUNCTION update_profile_rpc/);
  assert.match(migration, /v_actor_id UUID := auth\.uid\(\)/);
});

test("security hardening migration binds campaign applications to auth uid", () => {
  assert.match(migration, /CREATE OR REPLACE FUNCTION apply_to_campaign_rpc/);
  assert.match(migration, /p_creator_id IS DISTINCT FROM v_actor_id/);
  assert.match(migration, /RAISE EXCEPTION 'NOT_SIGNED_IN'/);
  assert.match(migration, /RAISE EXCEPTION 'CREATOR_ID_MISMATCH'/);
});

test("security hardening migration adds blocking and reporting primitives", () => {
  assert.match(migration, /CREATE TABLE IF NOT EXISTS profile_blocks/);
  assert.match(migration, /CREATE TABLE IF NOT EXISTS safety_reports/);
  assert.match(migration, /CREATE OR REPLACE FUNCTION is_blocked_between/);
  assert.match(migration, /NOT is_blocked_between\(follower_id, following_id\)/);
});

test("security hardening migration enforces follower feed visibility", () => {
  assert.match(migration, /DROP POLICY IF EXISTS "Authenticated users can read public feed posts"/);
  assert.match(migration, /visibility = 'followers'/);
  assert.match(migration, /profile_follows follows/);
  assert.match(migration, /NOT is_blocked_between\(auth\.uid\(\), author_id\)/);
});

test("public profile boundary migration adds a field-limited profile view", () => {
  assert.match(publicProfilesMigration, /CREATE OR REPLACE VIEW public_profiles/);
  assert.match(publicProfilesMigration, /WITH \(security_invoker = true\)/);
  assert.match(publicProfilesMigration, /DROP POLICY IF EXISTS "Profiles are publicly readable"/);
  assert.match(publicProfilesMigration, /account_status = 'active'/);
  assert.doesNotMatch(publicProfilesMigration, /stripe_customer_id/);
  assert.doesNotMatch(publicProfilesMigration, /stripe_subscription_id/);
});

test("platform moderation migration adds admin-gated report review", () => {
  assert.match(moderationMigration, /CREATE TABLE IF NOT EXISTS platform_admins/);
  assert.match(moderationMigration, /CREATE OR REPLACE FUNCTION is_platform_admin/);
  assert.match(moderationMigration, /CREATE POLICY "Platform admins can read safety reports"/);
  assert.match(moderationMigration, /CREATE POLICY "Platform admins can update safety reports"/);
  assert.match(moderationMigration, /reviewed_by UUID REFERENCES users/);
  assert.match(moderationMigration, /reviewed_at TIMESTAMPTZ/);
});

test("initial platform admin migration grants only the management account", () => {
  assert.match(initialAdminMigration, /INSERT INTO platform_admins/);
  assert.match(initialAdminMigration, /shiminskymanage@gmail\.com/);
  assert.match(initialAdminMigration, /ON CONFLICT \(user_id\) DO UPDATE/);
  assert.match(initialAdminMigration, /status = 'active'/);
});

test("P0 trust RPCs are explicitly executable by authenticated users", () => {
  assert.match(trustRpcGrantMigration, /REVOKE EXECUTE ON FUNCTION public\.accept_terms\(DATE, TEXT, TEXT, TEXT\) FROM PUBLIC/);
  assert.match(trustRpcGrantMigration, /GRANT EXECUTE ON FUNCTION public\.accept_terms\(DATE, TEXT, TEXT, TEXT\) TO authenticated/);
  assert.match(trustRpcGrantMigration, /REVOKE EXECUTE ON FUNCTION public\.confirm_campaign_rights\(UUID, BOOLEAN, BOOLEAN, BOOLEAN, INTEGER, TEXT, BOOLEAN, BOOLEAN\) FROM PUBLIC/);
  assert.match(trustRpcGrantMigration, /GRANT EXECUTE ON FUNCTION public\.confirm_campaign_rights\(UUID, BOOLEAN, BOOLEAN, BOOLEAN, INTEGER, TEXT, BOOLEAN, BOOLEAN\) TO authenticated/);
  assert.match(trustRpcGrantMigration, /REVOKE EXECUTE ON FUNCTION public\.update_gifting_status\(UUID, TEXT, TEXT\) FROM PUBLIC/);
  assert.match(trustRpcGrantMigration, /GRANT EXECUTE ON FUNCTION public\.update_gifting_status\(UUID, TEXT, TEXT\) TO authenticated/);
});

test("P0 economic state migration blocks direct credit and slot mutations", () => {
  assert.match(economicStateMigration, /REVOKE UPDATE \(credits_balance\) ON public\.users FROM authenticated/);
  assert.match(economicStateMigration, /REVOKE UPDATE \(slots_filled\) ON public\.opportunities FROM authenticated/);
  assert.match(economicStateMigration, /CREATE OR REPLACE FUNCTION public\.guard_economic_state/);
  assert.match(economicStateMigration, /NEW\.credits_balance IS DISTINCT FROM OLD\.credits_balance/);
  assert.match(economicStateMigration, /CREATE OR REPLACE FUNCTION public\.guard_slots_filled/);
  assert.match(economicStateMigration, /NEW\.slots_filled IS DISTINCT FROM OLD\.slots_filled/);
  assert.match(economicStateMigration, /ALTER COLUMN balance_after SET NOT NULL/);
});

test("P0 trust layer migration enforces age, market, and terms completion", () => {
  assert.match(trustLayerMigration, /ADD COLUMN IF NOT EXISTS date_of_birth\s+DATE/);
  assert.match(trustLayerMigration, /ADD COLUMN IF NOT EXISTS age_verified\s+BOOLEAN NOT NULL DEFAULT FALSE/);
  assert.match(trustLayerMigration, /ADD COLUMN IF NOT EXISTS state_code\s+TEXT/);
  assert.match(trustLayerMigration, /ADD COLUMN IF NOT EXISTS market_eligible\s+BOOLEAN NOT NULL DEFAULT FALSE/);
  assert.match(trustLayerMigration, /ADD COLUMN IF NOT EXISTS terms_policy_version\s+TEXT/);
  assert.match(trustLayerMigration, /IF v_age_years < 21 THEN/);
  assert.match(trustLayerMigration, /SELECT 1 FROM legal_cannabis_states WHERE state_code = UPPER\(p_state_code\)/);
  assert.match(trustLayerMigration, /compliance_step\s+= 'complete'/);
  assert.match(trustLayerMigration, /REVOKE UPDATE \(age_verified, age_verified_at, terms_accepted_at, compliance_step\)/);
});

test("P0 rights and compliance migration adds campaign controls", () => {
  assert.match(rightsAndGiftingMigration, /ADD COLUMN IF NOT EXISTS rights_organic_repost\s+BOOLEAN NOT NULL DEFAULT TRUE/);
  assert.match(rightsAndGiftingMigration, /ADD COLUMN IF NOT EXISTS rights_paid_ads\s+BOOLEAN NOT NULL DEFAULT FALSE/);
  assert.match(rightsAndGiftingMigration, /ADD COLUMN IF NOT EXISTS rights_whitelisting\s+BOOLEAN NOT NULL DEFAULT FALSE/);
  assert.match(rightsAndGiftingMigration, /ADD COLUMN IF NOT EXISTS rights_handle_licensing\s+BOOLEAN NOT NULL DEFAULT FALSE/);
  assert.match(rightsAndGiftingMigration, /ADD COLUMN IF NOT EXISTS rights_no_ai_training\s+BOOLEAN NOT NULL DEFAULT TRUE/);
  assert.match(rightsAndGiftingMigration, /ADD COLUMN IF NOT EXISTS rights_confirmed\s+BOOLEAN NOT NULL DEFAULT FALSE/);
  assert.match(rightsAndGiftingMigration, /ADD COLUMN IF NOT EXISTS eligible_states\s+TEXT\[\] DEFAULT '\{\}'/);
  assert.match(rightsAndGiftingMigration, /ADD COLUMN IF NOT EXISTS target_platforms\s+TEXT\[\] DEFAULT '\{\}'/);
  assert.match(rightsAndGiftingMigration, /ADD COLUMN IF NOT EXISTS disclosure_tags\s+TEXT\[\] DEFAULT ARRAY\['#ad', '#gifted'\]/);
  assert.match(rightsAndGiftingMigration, /ADD COLUMN IF NOT EXISTS compliance_checklist_done BOOLEAN NOT NULL DEFAULT FALSE/);
  assert.match(rightsAndGiftingMigration, /ADD COLUMN IF NOT EXISTS min_applicant_age\s+INTEGER NOT NULL DEFAULT 21/);
});

test("P0 gifting migrations create non-commerce workflow and restrict direct client access", () => {
  assert.match(rightsAndGiftingMigration, /CREATE TABLE IF NOT EXISTS gifting_workflow/);
  assert.match(rightsAndGiftingMigration, /creator_state_confirmed\s+BOOLEAN NOT NULL DEFAULT FALSE/);
  assert.match(rightsAndGiftingMigration, /creator_age_confirmed\s+BOOLEAN NOT NULL DEFAULT FALSE/);
  assert.match(rightsAndGiftingMigration, /BudCast does not facilitate cannabis sale, delivery, or pickup/);
  assert.match(giftingRlsMigration, /DROP POLICY IF EXISTS "Gifting parties can update their records" ON gifting_workflow/);
  assert.match(giftingRlsMigration, /CREATE POLICY "gifting_workflow: no direct insert"/);
  assert.match(giftingRlsMigration, /WITH CHECK \(false\)/);
  assert.match(giftingRlsMigration, /CREATE POLICY "gifting_workflow: brand update"/);
  assert.match(giftingRlsMigration, /status IN \('brand_shipped', 'cancelled', 'pending_brand_action'\)/);
  assert.match(giftingRlsMigration, /CREATE POLICY "gifting_workflow: creator update"/);
  assert.match(giftingRlsMigration, /status IN \('creator_received', 'creator_declined', 'substitution_requested'\)/);
  assert.match(giftingRlsMigration, /CREATE POLICY "gifting_workflow: no delete"/);
});
