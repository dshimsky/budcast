import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

function read(path: string) {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

test("Phase 3 decision record locks the MVP payment posture", () => {
  const decisionPath = new URL(
    "../../../docs/superpowers/specs/2026-05-01-budcast-payment-model-decision.md",
    import.meta.url
  );
  const decision = existsSync(decisionPath) ? readFileSync(decisionPath, "utf8") : "";

  assert.match(decision, /manual payout\/product confirmation/i);
  assert.match(decision, /credits for campaign posting/i);
  assert.match(decision, /defer Stripe Connect/i);
  assert.match(decision, /defer escrow/i);
  assert.match(decision, /not facilitate cannabis transactions/i);
});

test("Phase 3 migration records confirmation actors and admin payment-product flags", () => {
  const migrationPath = new URL(
    "../../../supabase/migrations/033_phase3_payment_posture.sql",
    import.meta.url
  );
  const migration = existsSync(migrationPath) ? readFileSync(migrationPath, "utf8") : "";

  assert.match(migration, /ALTER TABLE content_submissions/);
  assert.match(migration, /brand_confirmed_by_user_id/);
  assert.match(migration, /creator_confirmed_by_user_id/);
  assert.match(migration, /CREATE OR REPLACE FUNCTION confirm_submission_fulfillment/);
  assert.match(migration, /payment_issue_flag/);
  assert.match(migration, /product_not_received_flag/);
  assert.match(migration, /product_not_received/);
  assert.match(migration, /REVOKE EXECUTE ON FUNCTION confirm_submission_fulfillment\(UUID, TEXT\) FROM anon/);
});

test("submission fulfillment confirmation uses the audited RPC path", () => {
  const source = read("../src/hooks/useSubmissions.ts");
  const start = source.indexOf("export function useConfirmSubmissionPayment()");
  const end = source.indexOf("\n}", start) + 2;
  const confirmHook = source.slice(start, end);

  assert.match(confirmHook, /supabase\.rpc\("confirm_submission_fulfillment"/);
  assert.doesNotMatch(confirmHook, /\.from\("content_submissions"\)\s*\.\s*update/);
  assert.match(source, /brand_confirmed_by_user_id/);
  assert.match(source, /creator_confirmed_by_user_id/);
});

test("database types expose payment-product dispute fields", () => {
  const types = read("../src/types/database.ts");

  assert.match(types, /\|\s+'product_not_received'/);
  assert.match(types, /brand_confirmed_by_user_id: string \| null/);
  assert.match(types, /creator_confirmed_by_user_id: string \| null/);
  assert.match(types, /payment_issue_flag: boolean/);
  assert.match(types, /product_not_received_flag: boolean/);
});

test("admin moderation surfaces payment and product-not-received flags", () => {
  const adminPage = read("../../../apps/web/app/admin/moderation/page.tsx");

  assert.match(adminPage, /Payment dispute/);
  assert.match(adminPage, /Product not received/);
  assert.match(adminPage, /payment_issue_flag/);
  assert.match(adminPage, /product_not_received_flag/);
});

test("payment-facing web copy does not imply escrow, automated payout, or product pickup", () => {
  const files = [
    "../../../apps/web/app/page.tsx",
    "../../../apps/web/app/sign-up/page.tsx",
    "../../../apps/web/app/creator-dashboard/_components/creator-dashboard-screen.tsx",
    "../../../apps/web/app/dashboard/_components/brand-mobile-dashboard.tsx",
    "../../../apps/web/app/brands/[id]/page.tsx",
    "../../../apps/web/app/dashboard/campaigns/new/page.tsx",
    "../../../apps/web/app/dashboard/submissions/page.tsx",
    "../../../apps/web/app/dashboard/page.tsx",
    "../../../apps/web/app/dashboard/messages/page.tsx",
    "../../../apps/web/app/creator-app/page.tsx",
    "../../../apps/web/app/creator-preview/page.tsx",
    "../../../apps/web/app/design-review/dark-moody/page.tsx",
    "../../../apps/web/app/design-review/palette-preview/page.tsx",
    "../../../apps/web/components/public-marketplace-entry.tsx",
    "../../../apps/web/components/messaging/budcast-dm-inbox.tsx"
  ];

  for (const file of files) {
    const source = read(file);
    const sourceWithoutClassNames = source.replace(/className=(?:"[^"]*"|{`[\s\S]*?`})/g, "");
    assert.doesNotMatch(
      sourceWithoutClassNames,
      /(?<![A-Za-z_])(?:pickup|escrow|automated payout|in-app payout|budcast pays|budcast handles payment)(?![A-Za-z_])/i,
      file
    );
  }
});
