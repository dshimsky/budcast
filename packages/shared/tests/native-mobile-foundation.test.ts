import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const root = new URL("../../../", import.meta.url);

function readWorkspaceFile(path: string) {
  return readFileSync(new URL(path, root), "utf8");
}

test("native mobile foundation exposes canonical primitives", () => {
  const source = readWorkspaceFile("apps/native/components/mobile-system.tsx");

  for (const marker of ["AppHeader", "Surface", "StatusPill", "CampaignCard", "TrustRow", "SegmentedControl"]) {
    assert.match(source, new RegExp(marker));
  }
});

test("native app uses a creator tab shell for top-level mobile navigation", () => {
  const source = readWorkspaceFile("apps/native/app/(tabs)/_layout.tsx");

  for (const marker of ["Tabs", "Campaigns", "Work", "Profile"]) {
    assert.match(source, new RegExp(marker));
  }
});

test("native campaign discovery avoids unsupported web-only layout classes", () => {
  const source = readWorkspaceFile("apps/native/app/index.tsx");

  assert.doesNotMatch(source, /grid-cols-/);
  assert.doesNotMatch(source, /bg-gradient-/);
});

test("native tokens define BudCast mobile color roles", () => {
  const source = readWorkspaceFile("apps/native/tailwind.config.ts");

  for (const marker of ["budcast", "canvas", "raised", "lime", "muted"]) {
    assert.match(source, new RegExp(marker));
  }
});

test("native campaigns tab uses media-first marketplace primitives", () => {
  const source = readWorkspaceFile("apps/native/app/store.tsx");

  for (const marker of ["CampaignCard", "TrustRow", "SegmentedControl", "Payment protected", "Usage rights"]) {
    assert.match(source, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("native campaigns filters match the audit marketplace vocabulary", () => {
  const source = readWorkspaceFile("apps/native/app/store.tsx");

  for (const marker of ["For You", "Local", "Paid", "Product", "Paid + Product"]) {
    assert.match(source, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("native work tab uses operational lanes instead of a dense application list", () => {
  const source = readWorkspaceFile("apps/native/app/applications.tsx");

  for (const marker of ["useMySubmissionPipeline", "WorkLane", "Needs action", "Active jobs", "Submitted", "Completed"]) {
    assert.match(source, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("native work cards surface next actions and payment checkpoints", () => {
  const source = readWorkspaceFile("apps/native/app/applications.tsx");

  for (const marker of ["Submit content", "Open submissions", "Payment checkpoint", "Coordinate details"]) {
    assert.match(source, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("native submission flow uses a visible creator journey timeline", () => {
  const source = readWorkspaceFile("apps/native/app/submissions.tsx");

  for (const marker of ["SubmissionTimeline", "Accepted", "Submit", "Review", "Payment", "Complete"]) {
    assert.match(source, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("native submission cards explain acceptance, denial, revision, and payment states", () => {
  const source = readWorkspaceFile("apps/native/app/submissions.tsx");

  for (const marker of ["getSubmissionMoment", "Accepted by brand", "Revision requested", "Payment ready", "Completed"]) {
    assert.match(source, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});
