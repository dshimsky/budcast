import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const root = new URL("../../../", import.meta.url);

function readWorkspaceFile(path: string) {
  return readFileSync(new URL(path, root), "utf8");
}

test("creator profile mobile route uses social storefront tabs", () => {
  const source = readWorkspaceFile("apps/web/app/profile/page.tsx");

  for (const marker of ["Posts", "Portfolio", "Reviews", "About"]) {
    assert.match(source, new RegExp(`>${marker}<|\"${marker}\"|'${marker}'`));
  }
});

test("creator work mobile route uses job tracker framing", () => {
  const source = readWorkspaceFile("apps/web/app/creator-dashboard/_components/creator-dashboard-screen.tsx");

  for (const marker of ["Today's work", "Active jobs", "Payment pending", "Campaign details in DM"]) {
    assert.match(source, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("phase 8 mobile marketplace primitives are available", () => {
  const source = readWorkspaceFile("apps/web/components/mobile-marketplace/index.tsx");

  for (const marker of ["mobileColorRoles", "MobileStatusPill", "MobileTrustBadge", "MobileDealTimeline"]) {
    assert.match(source, new RegExp(marker));
  }
});

test("phase 8 creator and brand cards surface marketplace trust cues", () => {
  const creatorCard = readWorkspaceFile("apps/web/components/creator-social/campaign-drop-card.tsx");
  const brandDashboard = readWorkspaceFile("apps/web/app/dashboard/_components/brand-mobile-dashboard.tsx");

  for (const marker of ["Payment protected", "Compliance fit", "MobileDealTimeline"]) {
    assert.match(creatorCard, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  for (const marker of ["Brand decision", "Compliance-ready brief", "Product/payment"]) {
    assert.match(brandDashboard, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});
