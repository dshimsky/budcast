import assert from "node:assert/strict";
import test from "node:test";
import { getProfileFollowStatsLabels } from "../src/lib/follows.ts";

test("getProfileFollowStatsLabels splits creator followers by brand and creator", () => {
  assert.deepEqual(
    getProfileFollowStatsLabels({
      brandFollowers: 7,
      creatorFollowers: 42,
      followingCount: 11,
      profileType: "creator",
      totalFollowers: 49
    }),
    [
      { label: "Brands following", value: "7" },
      { label: "Creator followers", value: "42" },
      { label: "Following", value: "11" }
    ]
  );
});

test("getProfileFollowStatsLabels keeps brand stats simpler", () => {
  assert.deepEqual(
    getProfileFollowStatsLabels({
      brandFollowers: 2,
      creatorFollowers: 14,
      followingCount: 6,
      profileType: "brand",
      totalFollowers: 16
    }),
    [
      { label: "Followers", value: "16" },
      { label: "Following", value: "6" }
    ]
  );
});
