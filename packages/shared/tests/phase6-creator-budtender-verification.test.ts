import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const root = new URL("../../../", import.meta.url);

function readWorkspaceFile(path: string) {
  return readFileSync(new URL(path, root), "utf8");
}

test("Phase 6 migration adds cannabis creator and budtender verification fields", () => {
  const migrationPath = new URL("supabase/migrations/036_phase6_creator_budtender_verification.sql", root);
  const migration = existsSync(migrationPath) ? readFileSync(migrationPath, "utf8") : "";

  assert.match(migration, /creator_social_verification_status/);
  assert.match(migration, /creator_platform_links/);
  assert.match(migration, /audience_age_attested/);
  assert.match(migration, /cannabis_willingness/);
  assert.match(migration, /creator_content_categories/);
  assert.match(migration, /creator_markets/);
  assert.match(migration, /budtender_experience/);
  assert.match(migration, /store_affiliation/);
  assert.match(migration, /budtender_education_experience/);
  assert.match(migration, /sampling_recap_available/);
});

test("Phase 6 migration adds admin-gated creator and budtender verification workflow", () => {
  const migrationPath = new URL("supabase/migrations/036_phase6_creator_budtender_verification.sql", root);
  const migration = existsSync(migrationPath) ? readFileSync(migrationPath, "utf8") : "";

  assert.match(migration, /CREATE OR REPLACE FUNCTION verify_cannabis_talent/);
  assert.match(migration, /is_platform_admin\(auth\.uid\(\)\)/);
  assert.match(migration, /verified_creator/);
  assert.match(migration, /verified_budtender/);
  assert.match(migration, /GRANT EXECUTE ON FUNCTION verify_cannabis_talent/);
  assert.match(migration, /REVOKE EXECUTE ON FUNCTION verify_cannabis_talent/);
});

test("profile save and types expose cannabis talent readiness fields", () => {
  const types = readWorkspaceFile("packages/shared/src/types/database.ts");
  const onboarding = readWorkspaceFile("packages/shared/src/stores/onboarding.ts");
  const saveProfile = readWorkspaceFile("packages/shared/src/hooks/useSaveProfile.ts");

  assert.match(types, /creator_social_verification_status/);
  assert.match(types, /creator_markets/);
  assert.match(types, /budtender_experience/);
  assert.match(types, /verified_budtender/);
  assert.match(onboarding, /audienceAgeAttested/);
  assert.match(onboarding, /budtenderExperience/);
  assert.match(saveProfile, /p_creator_markets/);
  assert.match(saveProfile, /p_budtender_experience/);
});

test("profile and discovery surfaces show cannabis-ready creator and budtender signals", () => {
  const profileEdit = readWorkspaceFile("apps/web/app/profile/edit/page.tsx");
  const profile = readWorkspaceFile("apps/web/app/profile/page.tsx");
  const brands = readWorkspaceFile("apps/web/app/brands/page.tsx");
  const moderation = readWorkspaceFile("apps/web/app/admin/moderation/page.tsx");

  assert.match(profileEdit, /Cannabis creator readiness/);
  assert.match(profileEdit, /Budtender verification/);
  assert.match(profile, /Cannabis markets/);
  assert.match(profile, /Budtender experience/);
  assert.match(brands, /Talent discovery/);
  assert.match(brands, /Cannabis-ready creators/);
  assert.match(brands, /Budtenders/);
  assert.match(moderation, /Talent verification/);
  assert.match(moderation, /Verify creator/);
  assert.match(moderation, /Verify budtender/);
});
