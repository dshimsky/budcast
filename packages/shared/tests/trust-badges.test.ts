import assert from "node:assert/strict";
import test from "node:test";
import { getTrustBadgeDescriptors } from "../src/lib/trust-badges.ts";

test("getTrustBadgeDescriptors maps legacy brand badges into marketplace trust labels", () => {
  assert.deepEqual(
    getTrustBadgeDescriptors({
      badges: ["founding_brand", "verified_payer"],
      profileType: "brand"
    }).map((badge) => ({ id: badge.id, label: badge.label })),
    [
      { id: "verified_brand", label: "Verified Brand" },
      { id: "payment_ready", label: "Payment Ready" }
    ]
  );
});

test("getTrustBadgeDescriptors maps legacy creator badges without exposing founding language", () => {
  assert.deepEqual(
    getTrustBadgeDescriptors({
      badges: ["founding_creator", "trusted_creator", "highly_rated"],
      profileType: "creator"
    }).map((badge) => ({ id: badge.id, label: badge.label })),
    [
      { id: "verified_creator", label: "Verified Creator" },
      { id: "campaign_ready", label: "Campaign Ready" },
      { id: "highly_rated", label: "Highly Rated" }
    ]
  );
});

test("getTrustBadgeDescriptors keeps badge order relevant to the profile type", () => {
  assert.deepEqual(
    getTrustBadgeDescriptors({
      badges: ["social_verified", "payment_ready", "verified_brand", "campaign_ready"],
      profileType: "brand"
    }).map((badge) => badge.id),
    ["verified_brand", "payment_ready", "social_verified", "campaign_ready"]
  );
});
