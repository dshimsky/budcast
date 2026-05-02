import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const root = new URL("../../../", import.meta.url);

function readWorkspaceFile(path: string) {
  return readFileSync(new URL(path, root), "utf8");
}

test("Phase 7 migration adds cannabis content library, recap analytics, and repeat collaboration tables", () => {
  const migrationPath = new URL("supabase/migrations/037_phase7_differentiators.sql", root);
  const migration = existsSync(migrationPath) ? readFileSync(migrationPath, "utf8") : "";

  assert.match(migration, /CREATE TABLE IF NOT EXISTS content_library_assets/);
  assert.match(migration, /usage_terms/);
  assert.match(migration, /market_tags/);
  assert.match(migration, /product_category_tags/);
  assert.match(migration, /platform_tags/);
  assert.match(migration, /CREATE TABLE IF NOT EXISTS preferred_creator_pools/);
  assert.match(migration, /CREATE TABLE IF NOT EXISTS repeat_collaboration_invites/);
  assert.match(migration, /CREATE OR REPLACE FUNCTION get_campaign_recap/);
  assert.match(migration, /CREATE OR REPLACE FUNCTION create_repeat_collaboration_invite/);
});

test("Phase 7 review fixes harden repeat invites and refresh corrected verified assets", () => {
  const migrationPath = new URL("supabase/migrations/038_phase7_review_fixes.sql", root);
  const migration = existsSync(migrationPath) ? readFileSync(migrationPath, "utf8") : "";

  assert.match(migration, /DESTINATION_CAMPAIGN_NOT_FOUND/);
  assert.match(migration, /DESTINATION_CAMPAIGN_BRAND_MISMATCH/);
  assert.match(migration, /v_destination_brand_id IS DISTINCT FROM v_source\.brand_id/);
  assert.match(migration, /ON CONFLICT \(submission_id\) DO UPDATE SET/);
  assert.doesNotMatch(migration, /OLD\.verification_status IS NOT DISTINCT FROM 'verified'/);
});

test("campaign templates cover cannabis-specific audit differentiators", () => {
  const templateModule = readWorkspaceFile("packages/shared/src/lib/campaign-templates.ts");

  assert.match(templateModule, /product_education/);
  assert.match(templateModule, /budtender_education/);
  assert.match(templateModule, /event_recap/);
  assert.match(templateModule, /compliant_lifestyle_ugc/);
  assert.match(templateModule, /unboxing/);
  assert.match(templateModule, /retail_market_awareness/);
  assert.match(templateModule, /ambassador_content/);
  assert.match(templateModule, /runCampaignPreflight/);
  assert.match(templateModule, /missing_disclosure/);
  assert.match(templateModule, /sale_language/);
  assert.match(templateModule, /health_claim/);
  assert.match(templateModule, /age_market_mismatch/);
  assert.match(templateModule, /platform_warning/);
});

test("brand campaign builder exposes templates and compliance preflight before publish", () => {
  const builder = readWorkspaceFile("apps/web/app/dashboard/campaigns/new/page.tsx");

  assert.match(builder, /Campaign templates/);
  assert.match(builder, /Product education/);
  assert.match(builder, /Budtender education/);
  assert.match(builder, /Apply template/);
  assert.match(builder, /Compliance preflight/);
  assert.match(builder, /Missing disclosure/);
  assert.match(builder, /Sale language/);
  assert.match(builder, /Health claim/);
  assert.match(builder, /budcast_duplicate_campaign/);
  assert.match(builder, /window\.sessionStorage\.getItem/);
});

test("campaign detail exposes recap analytics and repeat collaboration workflows", () => {
  const detail = readWorkspaceFile("apps/web/app/dashboard/campaigns/[id]/page.tsx");

  assert.match(detail, /Campaign recap analytics/);
  assert.match(detail, /Usable assets/);
  assert.match(detail, /Application conversion/);
  assert.match(detail, /Completion rate/);
  assert.match(detail, /Dispute rate/);
  assert.match(detail, /Market feedback/);
  assert.match(detail, /Rehire creator/);
  assert.match(detail, /Duplicate campaign/);
  assert.match(detail, /window\.sessionStorage\.setItem/);
  assert.match(detail, /Preferred creator pools/);
  assert.match(detail, /Private invites/);
  assert.match(detail, /Availability/);
});

test("content library route exposes the rights vault filters and asset metadata", () => {
  const route = readWorkspaceFile("apps/web/app/dashboard/library/page.tsx");

  assert.match(route, /Content library/);
  assert.match(route, /Rights vault/);
  assert.match(route, /Usage terms/);
  assert.match(route, /Creator/);
  assert.match(route, /Campaign/);
  assert.match(route, /Market/);
  assert.match(route, /Product category/);
  assert.match(route, /Platform/);
});
