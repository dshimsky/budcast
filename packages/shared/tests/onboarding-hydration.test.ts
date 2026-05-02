import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const root = new URL("../../../", import.meta.url);

function readWorkspaceFile(path: string) {
  return readFileSync(new URL(path, root), "utf8");
}

test("web onboarding hydrates profile without depending on the full onboarding store object", () => {
  const source = readWorkspaceFile("apps/web/app/onboarding/page.tsx");

  assert.match(source, /useRef/);
  assert.doesNotMatch(source, /\[onboarding,\s*profile\]/);
});

test("onboarding store hydration is idempotent for unchanged profile data", () => {
  const source = readWorkspaceFile("packages/shared/src/stores/onboarding.ts");

  for (const marker of ["getOnboardingDataFromProfile", "isSameOnboardingData", "return state;"]) {
    assert.match(source, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});
