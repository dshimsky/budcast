import assert from "node:assert/strict";
import test from "node:test";
import { getFeedModeEmptyState, getFeedModeTabs } from "../src/lib/feed.ts";

test("getFeedModeTabs returns launch feed tabs in display order", () => {
  assert.deepEqual(getFeedModeTabs(), [
    { label: "For You", mode: "all" },
    { label: "Following", mode: "following" }
  ]);
});

test("getFeedModeEmptyState gives a follow-building prompt for Following", () => {
  assert.deepEqual(getFeedModeEmptyState("following"), {
    body: "Follow creators and brands to build a feed around the accounts you care about.",
    title: "Your following feed is ready."
  });
});
