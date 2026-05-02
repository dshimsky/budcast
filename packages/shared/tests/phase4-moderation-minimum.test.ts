import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const root = new URL("../../../", import.meta.url);

function readWorkspaceFile(path: string) {
  return readFileSync(new URL(path, root), "utf8");
}

test("Phase 4 moderation migration supports admin report actions", () => {
  const migrationPath = new URL("supabase/migrations/034_phase4_moderation_minimum.sql", root);
  const migration = existsSync(migrationPath) ? readFileSync(migrationPath, "utf8") : "";

  assert.match(migration, /CREATE OR REPLACE FUNCTION moderate_safety_report/);
  assert.match(migration, /is_platform_admin\(auth\.uid\(\)\)/);
  assert.match(migration, /UPDATE safety_reports/);
  assert.match(migration, /UPDATE reviews[\s\S]+review_status = 'removed'/);
  assert.match(migration, /UPDATE feed_posts[\s\S]+visibility = 'private'/);
  assert.match(migration, /UPDATE opportunities[\s\S]+status = 'cancelled'/);
  assert.match(migration, /UPDATE users[\s\S]+account_status = 'suspended'/);
  assert.match(migration, /GRANT EXECUTE ON FUNCTION moderate_safety_report/);
  assert.match(migration, /REVOKE EXECUTE ON FUNCTION moderate_safety_report/);
});

test("moderation hook uses the audited RPC action path", () => {
  const source = readWorkspaceFile("packages/shared/src/hooks/useModeration.ts");

  assert.match(source, /export type ModerationAction/);
  assert.match(source, /["']remove_content["']/);
  assert.match(source, /["']suspend_profile["']/);
  assert.match(source, /supabase\.rpc\("moderate_safety_report"/);
  assert.doesNotMatch(source, /\.from\("safety_reports"\)\s*\.\s*update/);
});

test("report and block controls cover launch moderation surfaces", () => {
  const profileActions = readWorkspaceFile("apps/web/components/safety/profile-safety-actions.tsx");
  const brandProfile = readWorkspaceFile("apps/web/app/brands/[id]/page.tsx");
  const socialFeed = readWorkspaceFile("apps/web/components/social-feed/index.tsx");
  const messages = readWorkspaceFile("apps/web/components/messaging/budcast-dm-inbox.tsx");
  const campaignDetail = readWorkspaceFile("apps/web/app/campaigns/[id]/page.tsx");
  const profilePage = readWorkspaceFile("apps/web/app/profile/page.tsx");

  assert.match(profileActions, /targetType === "review"/);
  assert.match(brandProfile, /targetType="profile"/);
  assert.match(socialFeed, /targetType="feed_post"/);
  assert.match(messages, /targetType="conversation"/);
  assert.match(messages, /targetType="message"/);
  assert.match(campaignDetail, /targetType="campaign"/);
  assert.match(profilePage, /targetType="review"/);
});

test("admin moderation page exposes open queue and action controls", () => {
  const source = readWorkspaceFile("apps/web/app/admin/moderation/page.tsx");

  assert.match(source, /Open reports/);
  assert.match(source, /Remove content/);
  assert.match(source, /Suspend profile/);
  assert.match(source, /["']remove_content["']/);
  assert.match(source, /["']suspend_profile["']/);
});

test("public support contact is visible", () => {
  const home = readWorkspaceFile("apps/web/app/page.tsx");
  const publicEntry = readWorkspaceFile("apps/web/components/public-marketplace-entry.tsx");

  assert.match(`${home}\n${publicEntry}`, /support@budcast\.app/);
  assert.match(`${home}\n${publicEntry}`, /Safety and support/i);
});
