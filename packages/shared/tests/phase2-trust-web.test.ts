import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import {
  autoInjectComplianceTag,
  selectCanPublish,
  selectStepMissingFields,
  type CampaignFormState
} from "../src/stores/campaignForm.ts";
import { hasCompletedTrustCompliance } from "../src/lib/profile.ts";
import type { User } from "../src/types/database.ts";

function makeProfile(overrides: Partial<User> = {}): User {
  return {
    id: "user-1",
    email: "user@example.com",
    phone: null,
    user_type: "creator",
    tier: "free",
    name: "Creator",
    bio: null,
    location: null,
    avatar_url: null,
    cover_url: null,
    instagram: "creator",
    tiktok: null,
    youtube: null,
    facebook: null,
    linkedin: null,
    x_profile: null,
    follower_count_instagram: null,
    follower_count_tiktok: null,
    follower_count_youtube: null,
    portfolio_image_urls: [],
    niches: [],
    company_name: null,
    website: null,
    founded_year: null,
    credits_balance: 100,
    credits_allocated: 0,
    credits_spent_this_month: 0,
    credits_rollover_last_month: 0,
    last_credit_refresh: null,
    date_of_birth: "1990-01-01",
    payment_rate: null,
    completion_rate: null,
    total_campaigns: 0,
    successful_campaigns: 0,
    review_score: null,
    review_count: 0,
    reputation_score: null,
    badges: [],
    dispute_count: 0,
    unresolved_disputes: 0,
    account_status: "active",
    stripe_customer_id: null,
    stripe_subscription_id: null,
    subscription_ends_at: null,
    created_at: "2026-05-01T00:00:00.000Z",
    updated_at: "2026-05-01T00:00:00.000Z",
    age_verified: true,
    age_verified_at: "2026-05-01T00:00:00.000Z",
    market_eligible: true,
    terms_accepted_at: "2026-05-01T00:00:00.000Z",
    terms_policy_version: "2026-05-01",
    terms_ip_address: null,
    state_code: "MI",
    compliance_step: "complete",
    ...overrides
  };
}

function makePublishableCampaign(overrides: Partial<CampaignFormState> = {}): CampaignFormState {
  const state: CampaignFormState = {
    current_step: 6,
    draft_id: null,
    last_saved_at: null,
    brand_credits_balance: 500,
    campaign_type: "hybrid",
    title: "Cannabis education reel",
    short_description: "Creator-led product education with compliant disclosures.",
    description: "Create a compliant product education reel.",
    image_url: "https://example.com/hero.jpg",
    categories: ["flower"],
    cash_amount: 250,
    product_description: "Brand-managed product coordination after acceptance.",
    payment_methods: ["venmo"],
    content_types: ["ig_reel"],
    brand_mention: "@brand",
    required_hashtags: autoInjectComplianceTag({
      campaign_type: "hybrid",
      required_hashtags: []
    } as CampaignFormState),
    must_includes: ["Show packaging clearly"],
    off_limits: ["No medical claims"],
    reference_image_urls: [],
    slots_available: 1,
    application_deadline: "2026-05-15T17:00:00.000Z",
    approval_mode: "manual",
    rights_organic_repost: true,
    rights_paid_ads: false,
    rights_whitelisting: false,
    rights_handle_licensing: false,
    rights_duration_days: 90,
    rights_territory: "US",
    rights_exclusive: false,
    rights_exclusivity_days: null,
    rights_no_ai_training: true,
    rights_revocable: false,
    rights_revocation_notice_days: 30,
    rights_confirmed: true,
    eligible_states: ["MI"],
    target_platforms: ["instagram"],
    compliance_checklist_done: true,
    ...overrides
  };

  return state;
}

test("trust compliance requires age, market, terms, and state completion", () => {
  assert.equal(hasCompletedTrustCompliance(makeProfile()), true);
  assert.equal(hasCompletedTrustCompliance(makeProfile({ age_verified: false })), false);
  assert.equal(hasCompletedTrustCompliance(makeProfile({ market_eligible: false })), false);
  assert.equal(hasCompletedTrustCompliance(makeProfile({ terms_accepted_at: null })), false);
  assert.equal(hasCompletedTrustCompliance(makeProfile({ state_code: null })), false);
  assert.equal(hasCompletedTrustCompliance(makeProfile({ compliance_step: "profile" })), false);
});

test("campaign publish requires rights, market, platform, and compliance checks", () => {
  assert.equal(selectCanPublish(makePublishableCampaign()), true);

  const missing = selectStepMissingFields(
    makePublishableCampaign({
      compliance_checklist_done: false,
      eligible_states: [],
      rights_confirmed: false,
      target_platforms: []
    }),
    6
  );

  assert.deepEqual(
    missing.filter((item) =>
      ["eligible states", "target platforms", "rights confirmation", "compliance checklist"].includes(item)
    ),
    ["eligible states", "target platforms", "rights confirmation", "compliance checklist"]
  );
  assert.equal(selectCanPublish(makePublishableCampaign({ rights_confirmed: false })), false);
  assert.equal(selectCanPublish(makePublishableCampaign({ eligible_states: [] })), false);
  assert.equal(selectCanPublish(makePublishableCampaign({ target_platforms: [] })), false);
});

test("gifting status mutations use the safe RPC path", () => {
  const source = readFileSync(new URL("../src/hooks/useGiftingWorkflow.ts", import.meta.url), "utf8");
  assert.match(source, /supabase\.rpc\("update_gifting_status"/);
  assert.doesNotMatch(source, /\.from\("gifting_workflow"\)\s*\.\s*update/);
});

test("Phase 2 publish RPC persists trust fields and keeps gifting copy non-commerce", () => {
  const migrationPath = new URL("../../../supabase/migrations/032_phase2_trust_web_rpc_hardening.sql", import.meta.url);
  const migration = existsSync(migrationPath) ? readFileSync(migrationPath, "utf8") : "";

  assert.match(migration, /CREATE OR REPLACE FUNCTION publish_campaign_rpc/);
  assert.match(migration, /rights_confirmed/);
  assert.match(migration, /eligible_states/);
  assert.match(migration, /target_platforms/);
  assert.match(migration, /disclosure_tags/);
  assert.match(migration, /prohibited_content/);
  assert.match(migration, /brand_contact_method/);
  assert.match(migration, /REVOKE EXECUTE ON FUNCTION publish_campaign_rpc\(UUID, JSONB, INTEGER, UUID\) FROM anon/);
  assert.match(migration, /REVOKE EXECUTE ON FUNCTION public\.update_gifting_status\(UUID, TEXT, TEXT\) FROM anon/);
  assert.doesNotMatch(migration, /\b(pickup|delivery|purchase)\b/i);
});

test("Phase 2 web flows use trust compliance gates and non-commerce copy", () => {
  const files = [
    "../../../apps/web/app/campaigns/[id]/page.tsx",
    "../../../apps/web/app/dashboard/campaigns/new/page.tsx",
    "../../../apps/web/app/dashboard/campaigns/[id]/applicants/page.tsx",
    "../../../apps/web/app/dashboard/submissions/page.tsx",
    "../../../apps/web/components/messaging/budcast-dm-inbox.tsx"
  ];

  for (const file of files) {
    const source = readFileSync(new URL(file, import.meta.url), "utf8");
    assert.match(source, /hasCompletedTrustCompliance/);
    const sourceWithoutClassNames = source.replace(/className=(?:"[^"]*"|{`[\s\S]*?`})/g, "");
    assert.doesNotMatch(sourceWithoutClassNames, /(?<![A-Za-z_])(?:pickup|delivery|purchase|shipped)(?![A-Za-z_])/i, file);
  }
});
