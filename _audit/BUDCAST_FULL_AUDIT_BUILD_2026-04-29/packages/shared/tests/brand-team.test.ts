import assert from "node:assert/strict";
import test from "node:test";
import {
  canBrandTeamRole,
  getBrandTeamDisplayLine,
  getBrandTeamRoleLabel
} from "../src/lib/brand-team.ts";

test("getBrandTeamRoleLabel returns creator-facing role labels", () => {
  assert.equal(getBrandTeamRoleLabel("owner"), "Owner");
  assert.equal(getBrandTeamRoleLabel("campaign_manager"), "Campaign Manager");
  assert.equal(getBrandTeamRoleLabel("content_reviewer"), "Content Reviewer");
});

test("canBrandTeamRole grants campaign manager campaign and messaging access only", () => {
  assert.equal(canBrandTeamRole("campaign_manager", "manage_campaigns"), true);
  assert.equal(canBrandTeamRole("campaign_manager", "review_applicants"), true);
  assert.equal(canBrandTeamRole("campaign_manager", "message_creators"), true);
  assert.equal(canBrandTeamRole("campaign_manager", "review_submissions"), false);
  assert.equal(canBrandTeamRole("campaign_manager", "manage_team"), false);
});

test("canBrandTeamRole grants content reviewer submission review without team management", () => {
  assert.equal(canBrandTeamRole("content_reviewer", "review_submissions"), true);
  assert.equal(canBrandTeamRole("content_reviewer", "message_creators"), true);
  assert.equal(canBrandTeamRole("content_reviewer", "confirm_payment_product"), false);
  assert.equal(canBrandTeamRole("content_reviewer", "manage_campaigns"), false);
  assert.equal(canBrandTeamRole("content_reviewer", "manage_team"), false);
});

test("getBrandTeamDisplayLine clearly branches a person from the brand", () => {
  assert.equal(
    getBrandTeamDisplayLine({
      brandName: "Green Room Labs",
      title: "Marketing Manager"
    }),
    "Marketing Manager at Green Room Labs"
  );

  assert.equal(
    getBrandTeamDisplayLine({
      brandName: "Green Room Labs",
      role: "content_reviewer"
    }),
    "Content Reviewer at Green Room Labs"
  );
});
