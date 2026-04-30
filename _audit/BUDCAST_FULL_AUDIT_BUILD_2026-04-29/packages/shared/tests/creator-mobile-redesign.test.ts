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

  for (const marker of ["Today's work", "Active jobs", "Payment pending", "Pickup details in DM"]) {
    assert.match(source, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});
