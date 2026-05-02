import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const root = new URL("../../../", import.meta.url);

function readWorkspaceFile(path: string) {
  return readFileSync(new URL(path, root), "utf8");
}

test("Phase 5 migration locks reviews to completed collaborations and recalculates reputation", () => {
  const migrationPath = new URL("supabase/migrations/035_phase5_marketplace_trust_loops.sql", root);
  const migration = existsSync(migrationPath) ? readFileSync(migrationPath, "utf8") : "";

  assert.match(migration, /CREATE OR REPLACE FUNCTION create_marketplace_review/);
  assert.match(migration, /application must be completed/i);
  assert.match(migration, /UNIQUE\(application_id, reviewer_id\)/);
  assert.match(migration, /CREATE OR REPLACE FUNCTION recalculate_user_reputation/);
  assert.match(migration, /review_score/);
  assert.match(migration, /review_count/);
  assert.match(migration, /highly_rated/);
  assert.match(migration, /top_rated/);
  assert.match(migration, /GRANT EXECUTE ON FUNCTION create_marketplace_review/);
  assert.match(migration, /REVOKE EXECUTE ON FUNCTION create_marketplace_review/);
});

test("Phase 5 migration supports dispute filing, admin escalation, and trust counters", () => {
  const migrationPath = new URL("supabase/migrations/035_phase5_marketplace_trust_loops.sql", root);
  const migration = existsSync(migrationPath) ? readFileSync(migrationPath, "utf8") : "";

  assert.match(migration, /CREATE OR REPLACE FUNCTION file_marketplace_dispute/);
  assert.match(migration, /product_not_received/);
  assert.match(migration, /compliance_violation/);
  assert.match(migration, /CREATE OR REPLACE FUNCTION resolve_marketplace_dispute/);
  assert.match(migration, /is_platform_admin\(auth\.uid\(\)\)/);
  assert.match(migration, /CREATE OR REPLACE FUNCTION recalculate_user_dispute_counters/);
  assert.match(migration, /unresolved_disputes/);
  assert.match(migration, /GRANT EXECUTE ON FUNCTION file_marketplace_dispute/);
  assert.match(migration, /GRANT EXECUTE ON FUNCTION resolve_marketplace_dispute/);
});

test("review and dispute hooks use the audited RPC paths", () => {
  const reviews = readWorkspaceFile("packages/shared/src/hooks/useReviews.ts");
  const disputes = readWorkspaceFile("packages/shared/src/hooks/useDisputes.ts");
  const exports = readWorkspaceFile("packages/shared/src/index.ts");

  assert.match(reviews, /useCreateMarketplaceReview/);
  assert.match(reviews, /supabase\.rpc\("create_marketplace_review"/);
  assert.doesNotMatch(reviews, /\.from\("reviews"\)\s*\.\s*insert/);
  assert.match(disputes, /useFileMarketplaceDispute/);
  assert.match(disputes, /useResolveMarketplaceDispute/);
  assert.match(disputes, /supabase\.rpc\("file_marketplace_dispute"/);
  assert.match(disputes, /supabase\.rpc\("resolve_marketplace_dispute"/);
  assert.match(exports, /useDisputes/);
});

test("brand and creator dashboards surface review and dispute trust state", () => {
  const brandSubmissions = readWorkspaceFile("apps/web/app/dashboard/submissions/page.tsx");
  const creatorDashboard = readWorkspaceFile("apps/web/app/creator-dashboard/_components/creator-dashboard-screen.tsx");
  const adminModeration = readWorkspaceFile("apps/web/app/admin/moderation/page.tsx");

  assert.match(brandSubmissions, /Leave creator review/);
  assert.match(brandSubmissions, /File dispute/);
  assert.match(brandSubmissions, /Dispute status/);
  assert.match(creatorDashboard, /Leave brand review/);
  assert.match(creatorDashboard, /File dispute/);
  assert.match(creatorDashboard, /Disputed jobs/);
  assert.match(adminModeration, /Dispute escalation/);
  assert.match(adminModeration, /Resolve dispute/);
});
