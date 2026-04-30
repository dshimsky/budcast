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
