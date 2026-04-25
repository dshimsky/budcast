# BudCast Operations Agent Floor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a cinematic BudCast Operations Agent Floor inside Mission Control with a command-table dashboard, curated live missions, mission history, model-choice rationale, and a manual JSON editor.

**Architecture:** Reuse the existing Mission Control pattern: local repo-backed JSON, server-side normalization helpers, a route handler for GET/POST persistence, a raw JSON editor, and a server-rendered dashboard. Keep this feature separate from `ops/mission-control.json` so the operating-room data can evolve without destabilizing the main roadmap dashboard.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript strict mode, Tailwind CSS, existing BudCast UI primitives, Node `fs` server helpers, local JSON in `ops/agent-floor.json`.

---

## Implementation Skills

- Use `superpowers:subagent-driven-development` to execute this plan task-by-task with spec review and code-quality review after each task.
- Use `build-web-apps:frontend-app-builder` during implementation because the Agent Floor is a visually driven dashboard/game-screen surface. Preserve the approved Ops War Room and Command Table direction, then verify the result in the browser.
- Use `build-web-apps:react-best-practices` while writing the Next.js route and editor. Keep most rendering server-side, avoid unnecessary client components, and keep the raw JSON editor as the only client-heavy piece.
- Use `build-macos-apps:build-run-debug` only if local macOS desktop runtime tooling becomes relevant. This feature is not a macOS app, so do not introduce Xcode, Swift, or macOS packaging work.

---

## File Structure

- Create: `ops/agent-floor.json`
  Purpose: Curated source of truth for BudCast Operations Agent Floor.
- Create: `apps/web/lib/agent-floor-defaults.ts`
  Purpose: Default curated data used when `ops/agent-floor.json` is missing or invalid.
- Create: `apps/web/lib/agent-floor.ts`
  Purpose: Types, normalization, file IO, snapshot assembly, status/category labels, and tone helpers.
- Create: `apps/web/app/api/agent-floor/route.ts`
  Purpose: GET/POST API for reading and saving the curated JSON.
- Create: `apps/web/app/mission-control/operations/page.tsx`
  Purpose: Main cinematic Ops War Room dashboard.
- Create: `apps/web/app/mission-control/operations/edit/page.tsx`
  Purpose: Editor shell for the curated JSON.
- Create: `apps/web/app/mission-control/operations/editor.tsx`
  Purpose: Client-side raw JSON editor mirroring the existing Mission Control editor.
- Modify: `apps/web/app/mission-control/page.tsx`
  Purpose: Add an entry point to BudCast Operations.
- Optional modify: `apps/web/app/globals.css`
  Purpose: Add narrowly scoped animation utilities only if existing classes are insufficient.

---

## Task 1: Add Agent Floor Data Model And Defaults

**Files:**
- Create: `apps/web/lib/agent-floor-defaults.ts`
- Create: `ops/agent-floor.json`

- [ ] **Step 1: Create the default data module**

Create `apps/web/lib/agent-floor-defaults.ts` with this structure:

```ts
import type { AgentFloorConfig } from "./agent-floor";

export const agentFloorDefaults: AgentFloorConfig = {
  title: "BudCast Operations",
  mode: "agent_floor",
  manager: {
    id: "codex-manager",
    name: "Codex",
    role: "Manager",
    status: "working",
    currentAction: "Planning the next mission",
    avatarTone: "gold"
  },
  metrics: {
    efficiencyScore: 91,
    qualityScore: 96,
    activeMissions: 1,
    blockers: 1
  },
  operators: [
    {
      id: "sagan-quality",
      name: "Sagan",
      role: "Quality Auditor",
      status: "reviewing",
      currentTask: "Reviewing implementation risks",
      missionId: "agent-floor-plan",
      modelLabel: "Standard reviewer",
      reasoningLevel: "medium",
      avatarTone: "olive"
    },
    {
      id: "newton-spec",
      name: "Newton",
      role: "Spec Reviewer",
      status: "assigned",
      currentTask: "Checking scope against approved design",
      missionId: "agent-floor-plan",
      modelLabel: "Standard reviewer",
      reasoningLevel: "medium",
      avatarTone: "bronze"
    },
    {
      id: "pauli-builder",
      name: "Pauli",
      role: "Builder",
      status: "queued",
      currentTask: "Waiting for implementation approval",
      missionId: "agent-floor-build",
      modelLabel: "Efficient builder",
      reasoningLevel: "medium",
      avatarTone: "moss"
    },
    {
      id: "ios-scout",
      name: "Scout",
      role: "iOS Runner",
      status: "queued",
      currentTask: "Ready for simulator checkpoint",
      missionId: "native-qa",
      modelLabel: "Focused QA",
      reasoningLevel: "low",
      avatarTone: "charcoal"
    }
  ],
  activeMission: {
    id: "agent-floor-plan",
    title: "Design BudCast Operations Agent Floor",
    category: "build",
    status: "reviewing",
    assignedTo: "codex-manager",
    summary: "Create the command-table operating room for manager and subagent coordination.",
    modelLabel: "GPT-5 planning",
    reasoningLevel: "medium",
    choiceRationale: "Planning requires architectural judgment, but the scope is bounded by existing Mission Control patterns.",
    qualityGate: "Manual approval",
    verification: "Design spec approved by owner; implementation plan pending approval.",
    fixRequired: false,
    updatedAt: "2026-04-25"
  },
  missions: [
    {
      id: "native-workflow-task-5",
      title: "Convert native creator workflow screens",
      category: "build",
      status: "complete",
      assignedTo: "sagan-quality",
      summary: "Native profile, store, applications, submissions, and campaign detail were converted to Dark Premium Moody.",
      modelLabel: "Reviewer subagent",
      reasoningLevel: "medium",
      choiceRationale: "A fresh reviewer was enough because the task had clear files, explicit design rules, and known verification commands.",
      qualityGate: "Code quality review",
      verification: "NO FINDINGS; npm run typecheck and npm run build:web passed.",
      fixRequired: false,
      updatedAt: "2026-04-25"
    },
    {
      id: "native-foundation-task-4",
      title: "Convert native foundation and creator home",
      category: "build",
      status: "complete",
      assignedTo: "sagan-quality",
      summary: "Native shell, auth, onboarding, and creator home were converted to the dark premium system.",
      modelLabel: "Reviewer subagent",
      reasoningLevel: "medium",
      choiceRationale: "Review needed focused runtime judgment, not maximum-cost architecture work.",
      qualityGate: "Code quality review",
      verification: "Hydration overwrite bug found, fixed, re-reviewed, and typecheck passed.",
      fixRequired: true,
      updatedAt: "2026-04-25"
    },
    {
      id: "web-routes-task-3",
      title: "Convert web operational routes",
      category: "build",
      status: "complete",
      assignedTo: "newton-spec",
      summary: "Brand dashboard, campaign builder, applicant review, submissions, profile, auth, and onboarding routes were aligned to Dark Premium Moody.",
      modelLabel: "Spec and quality reviewers",
      reasoningLevel: "medium",
      choiceRationale: "Multiple bounded route slices benefited from separate review passes instead of a single expensive all-purpose agent.",
      qualityGate: "Spec review and production build",
      verification: "npm run typecheck -w @budcast/web and npm run build:web passed.",
      fixRequired: true,
      updatedAt: "2026-04-24"
    }
  ],
  blockers: [
    {
      id: "simulator-inspection",
      title: "Simulator inspection reliability",
      severity: "medium",
      detail: "Expo iOS bundles successfully, but CoreSimulatorService intermittently fails screenshot/device-inspection commands.",
      owner: "Scout"
    }
  ],
  departments: [
    {
      id: "launch-ops",
      name: "Launch Ops",
      category: "operations",
      status: "queued",
      detail: "Store prep, release readiness, and compliance checks are available as future BudCast Operations missions."
    },
    {
      id: "marketing-room",
      name: "Marketing Room",
      category: "marketing",
      status: "queued",
      detail: "Content calendar, brand voice, and launch campaign work can be tracked after the build floor is stable."
    },
    {
      id: "business-scouting",
      name: "Business Scouting",
      category: "business",
      status: "queued",
      detail: "Creator recruiting, brand partnerships, and sales motion can use the same mission model."
    }
  ],
  notes: [
    "Curated operations view: values are manually maintained unless marked as verified.",
    "Verified build evidence must reference actual commands or review results."
  ]
};
```

- [ ] **Step 2: Create the repo-backed JSON seed**

Create `ops/agent-floor.json` by copying the exact JSON representation of `agentFloorDefaults`. Use double quotes and no TypeScript syntax.

Expected top-level keys:

```json
[
  "title",
  "mode",
  "manager",
  "metrics",
  "operators",
  "activeMission",
  "missions",
  "blockers",
  "departments",
  "notes"
]
```

- [ ] **Step 3: Commit the data seed**

Run:

```bash
git add apps/web/lib/agent-floor-defaults.ts ops/agent-floor.json
git commit -m "feat: add BudCast operations data seed"
```

Expected: commit succeeds and only these two files are staged.

---

## Task 2: Build Agent Floor Server Utilities

**Files:**
- Create: `apps/web/lib/agent-floor.ts`
- Modify: `apps/web/lib/agent-floor-defaults.ts`

- [ ] **Step 1: Define strict TypeScript types**

Create `apps/web/lib/agent-floor.ts` with these exported types before adding functions:

```ts
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "fs";
import { join } from "path";
import { agentFloorDefaults } from "./agent-floor-defaults";

export type AgentMissionStatus =
  | "queued"
  | "assigned"
  | "working"
  | "reviewing"
  | "needs_fix"
  | "verified"
  | "complete"
  | "blocked";

export type AgentMissionCategory = "build" | "operations" | "marketing" | "business" | "support";

export type AgentReasoningLevel = "low" | "medium" | "high" | "xhigh";

export type AgentAvatarTone = "gold" | "olive" | "bronze" | "moss" | "charcoal";

export type AgentOperator = {
  id: string;
  name: string;
  role: string;
  status: AgentMissionStatus;
  currentTask: string;
  missionId: string;
  modelLabel: string;
  reasoningLevel: AgentReasoningLevel;
  avatarTone: AgentAvatarTone;
};

export type AgentManager = {
  id: string;
  name: string;
  role: string;
  status: AgentMissionStatus;
  currentAction: string;
  avatarTone: AgentAvatarTone;
};

export type AgentMission = {
  id: string;
  title: string;
  category: AgentMissionCategory;
  status: AgentMissionStatus;
  assignedTo: string;
  summary: string;
  modelLabel: string;
  reasoningLevel: AgentReasoningLevel;
  choiceRationale: string;
  qualityGate: string;
  verification: string;
  fixRequired: boolean;
  updatedAt: string;
};

export type AgentBlocker = {
  id: string;
  title: string;
  severity: "low" | "medium" | "high";
  detail: string;
  owner: string;
};

export type AgentDepartment = {
  id: string;
  name: string;
  category: AgentMissionCategory;
  status: AgentMissionStatus;
  detail: string;
};

export type AgentFloorMetrics = {
  efficiencyScore: number;
  qualityScore: number;
  activeMissions: number;
  blockers: number;
};

export type AgentFloorConfig = {
  title: string;
  mode: "agent_floor";
  manager: AgentManager;
  metrics: AgentFloorMetrics;
  operators: AgentOperator[];
  activeMission: AgentMission | null;
  missions: AgentMission[];
  blockers: AgentBlocker[];
  departments: AgentDepartment[];
  notes: string[];
};

export type AgentFloorSnapshot = AgentFloorConfig & {
  now: string;
  configPath: string;
  configUpdatedAt: string;
};
```

- [ ] **Step 2: Add workspace path helpers**

Add the same root detection style used by `apps/web/lib/mission-control.ts`:

```ts
const runtimeCwd = process.cwd();
const workspaceRoot = existsSync(join(runtimeCwd, "apps", "web")) ? runtimeCwd : join(runtimeCwd, "..", "..");
const agentFloorConfigPath = join(workspaceRoot, "ops", "agent-floor.json");
```

- [ ] **Step 3: Add primitive normalizers**

Add these helper functions:

```ts
function asRecord(value: unknown) {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
}

function asString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function asBoolean(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function asScore(value: unknown, fallback: number) {
  if (typeof value !== "number" || Number.isNaN(value)) return fallback;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function asStringArray(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) return fallback;
  const next = value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean);
  return next.length > 0 ? next : fallback;
}

function isMissionStatus(value: unknown): value is AgentMissionStatus {
  return (
    value === "queued" ||
    value === "assigned" ||
    value === "working" ||
    value === "reviewing" ||
    value === "needs_fix" ||
    value === "verified" ||
    value === "complete" ||
    value === "blocked"
  );
}

function asMissionStatus(value: unknown, fallback: AgentMissionStatus) {
  return isMissionStatus(value) ? value : fallback;
}

function isMissionCategory(value: unknown): value is AgentMissionCategory {
  return value === "build" || value === "operations" || value === "marketing" || value === "business" || value === "support";
}

function asMissionCategory(value: unknown, fallback: AgentMissionCategory) {
  return isMissionCategory(value) ? value : fallback;
}

function isReasoningLevel(value: unknown): value is AgentReasoningLevel {
  return value === "low" || value === "medium" || value === "high" || value === "xhigh";
}

function asReasoningLevel(value: unknown, fallback: AgentReasoningLevel) {
  return isReasoningLevel(value) ? value : fallback;
}

function isAvatarTone(value: unknown): value is AgentAvatarTone {
  return value === "gold" || value === "olive" || value === "bronze" || value === "moss" || value === "charcoal";
}

function asAvatarTone(value: unknown, fallback: AgentAvatarTone) {
  return isAvatarTone(value) ? value : fallback;
}
```

- [ ] **Step 4: Add object normalizers**

Add normalizers that preserve valid manual data and fall back to defaults:

```ts
function normalizeManager(value: unknown, fallback: AgentManager): AgentManager {
  const source = asRecord(value);
  return {
    id: asString(source.id, fallback.id),
    name: asString(source.name, fallback.name),
    role: asString(source.role, fallback.role),
    status: asMissionStatus(source.status, fallback.status),
    currentAction: asString(source.currentAction, fallback.currentAction),
    avatarTone: asAvatarTone(source.avatarTone, fallback.avatarTone)
  };
}

function normalizeOperator(value: unknown, fallback: AgentOperator): AgentOperator {
  const source = asRecord(value);
  return {
    id: asString(source.id, fallback.id),
    name: asString(source.name, fallback.name),
    role: asString(source.role, fallback.role),
    status: asMissionStatus(source.status, fallback.status),
    currentTask: asString(source.currentTask, fallback.currentTask),
    missionId: asString(source.missionId, fallback.missionId),
    modelLabel: asString(source.modelLabel, fallback.modelLabel),
    reasoningLevel: asReasoningLevel(source.reasoningLevel, fallback.reasoningLevel),
    avatarTone: asAvatarTone(source.avatarTone, fallback.avatarTone)
  };
}

function normalizeMission(value: unknown, fallback: AgentMission): AgentMission {
  const source = asRecord(value);
  return {
    id: asString(source.id, fallback.id),
    title: asString(source.title, fallback.title),
    category: asMissionCategory(source.category, fallback.category),
    status: asMissionStatus(source.status, fallback.status),
    assignedTo: asString(source.assignedTo, fallback.assignedTo),
    summary: asString(source.summary, fallback.summary),
    modelLabel: asString(source.modelLabel, fallback.modelLabel),
    reasoningLevel: asReasoningLevel(source.reasoningLevel, fallback.reasoningLevel),
    choiceRationale: asString(source.choiceRationale, fallback.choiceRationale),
    qualityGate: asString(source.qualityGate, fallback.qualityGate),
    verification: asString(source.verification, fallback.verification),
    fixRequired: asBoolean(source.fixRequired, fallback.fixRequired),
    updatedAt: asString(source.updatedAt, fallback.updatedAt)
  };
}

function normalizeMetrics(value: unknown, fallback: AgentFloorMetrics): AgentFloorMetrics {
  const source = asRecord(value);
  return {
    efficiencyScore: asScore(source.efficiencyScore, fallback.efficiencyScore),
    qualityScore: asScore(source.qualityScore, fallback.qualityScore),
    activeMissions: asScore(source.activeMissions, fallback.activeMissions),
    blockers: asScore(source.blockers, fallback.blockers)
  };
}
```

- [ ] **Step 5: Add list normalizers and config IO**

Add list normalizers and exported functions:

```ts
function normalizeList<T>(value: unknown, fallback: T[], normalizeItem: (value: unknown, fallback: T) => T) {
  if (!Array.isArray(value)) return fallback;
  const next = value.map((item, index) => normalizeItem(item, fallback[index] ? fallback[index] : fallback[fallback.length - 1])).filter(Boolean);
  return next.length > 0 ? next : fallback;
}

function normalizeBlocker(value: unknown, fallback: AgentBlocker): AgentBlocker {
  const source = asRecord(value);
  const severity = source.severity === "low" || source.severity === "medium" || source.severity === "high" ? source.severity : fallback.severity;
  return {
    id: asString(source.id, fallback.id),
    title: asString(source.title, fallback.title),
    severity,
    detail: asString(source.detail, fallback.detail),
    owner: asString(source.owner, fallback.owner)
  };
}

function normalizeDepartment(value: unknown, fallback: AgentDepartment): AgentDepartment {
  const source = asRecord(value);
  return {
    id: asString(source.id, fallback.id),
    name: asString(source.name, fallback.name),
    category: asMissionCategory(source.category, fallback.category),
    status: asMissionStatus(source.status, fallback.status),
    detail: asString(source.detail, fallback.detail)
  };
}

export function normalizeAgentFloorConfig(value: unknown): AgentFloorConfig {
  const source = asRecord(value);
  return {
    title: asString(source.title, agentFloorDefaults.title),
    mode: "agent_floor",
    manager: normalizeManager(source.manager, agentFloorDefaults.manager),
    metrics: normalizeMetrics(source.metrics, agentFloorDefaults.metrics),
    operators: normalizeList(source.operators, agentFloorDefaults.operators, normalizeOperator),
    activeMission: source.activeMission === null ? null : normalizeMission(source.activeMission, agentFloorDefaults.activeMission ? agentFloorDefaults.activeMission : agentFloorDefaults.missions[0]),
    missions: normalizeList(source.missions, agentFloorDefaults.missions, normalizeMission),
    blockers: normalizeList(source.blockers, agentFloorDefaults.blockers, normalizeBlocker),
    departments: normalizeList(source.departments, agentFloorDefaults.departments, normalizeDepartment),
    notes: asStringArray(source.notes, agentFloorDefaults.notes)
  };
}

export function getAgentFloorConfigPath() {
  return agentFloorConfigPath;
}

export function getAgentFloorConfig() {
  if (!existsSync(agentFloorConfigPath)) {
    saveAgentFloorConfig(agentFloorDefaults);
    return agentFloorDefaults;
  }

  try {
    const raw = readFileSync(agentFloorConfigPath, "utf8");
    return normalizeAgentFloorConfig(JSON.parse(raw));
  } catch {
    return agentFloorDefaults;
  }
}

export function getAgentFloorConfigRaw() {
  return JSON.stringify(getAgentFloorConfig(), null, 2);
}

export function getAgentFloorConfigUpdatedAt() {
  try {
    return statSync(agentFloorConfigPath).mtime.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
  } catch {
    return "Not saved yet";
  }
}

export function saveAgentFloorConfig(value: unknown) {
  const config = normalizeAgentFloorConfig(value);
  mkdirSync(join(workspaceRoot, "ops"), { recursive: true });
  writeFileSync(agentFloorConfigPath, `${JSON.stringify(config, null, 2)}\n`, "utf8");
  return {
    config,
    updatedAt: getAgentFloorConfigUpdatedAt(),
    path: agentFloorConfigPath
  };
}

export function getAgentFloorSnapshot(): AgentFloorSnapshot {
  return {
    ...getAgentFloorConfig(),
    now: new Date().toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit"
    }),
    configPath: agentFloorConfigPath,
    configUpdatedAt: getAgentFloorConfigUpdatedAt()
  };
}
```

- [ ] **Step 6: Add label and tone helpers**

Add exported helpers used by the UI:

```ts
export function agentStatusLabel(status: AgentMissionStatus) {
  switch (status) {
    case "needs_fix":
      return "Needs Fix";
    case "in_progress":
      return "In Progress";
    default:
      return status.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
  }
}

export function agentCategoryLabel(category: AgentMissionCategory) {
  return category.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function agentStatusTone(status: AgentMissionStatus) {
  switch (status) {
    case "complete":
    case "verified":
      return "border-herb-300/40 bg-herb-400/10 text-herb-100";
    case "blocked":
    case "needs_fix":
      return "border-[#d7a07d]/40 bg-[#7a2f1d]/20 text-[#ffd8c4]";
    case "working":
    case "reviewing":
      return "border-[#c6a15b]/40 bg-[#8f7044]/20 text-[#f6deb0]";
    default:
      return "border-white/10 bg-white/[0.04] text-[#d7cdbd]";
  }
}

export function avatarToneClass(tone: AgentAvatarTone) {
  switch (tone) {
    case "olive":
      return "from-[#5f7748] to-[#1d2519]";
    case "bronze":
      return "from-[#80623d] to-[#21170d]";
    case "moss":
      return "from-[#394f31] to-[#11170e]";
    case "charcoal":
      return "from-[#384038] to-[#0c0e0c]";
    default:
      return "from-[#c0934d] to-[#3c2813]";
  }
}
```

- [ ] **Step 7: Run typecheck for the new lib**

Run:

```bash
npm run typecheck -w @budcast/web
```

Expected: pass. If TypeScript reports circular import issues between `agent-floor.ts` and `agent-floor-defaults.ts`, keep the `import type` in defaults and ensure all runtime imports remain one-directional from `agent-floor.ts` to `agent-floor-defaults.ts`.

- [ ] **Step 8: Commit server utilities**

Run:

```bash
git add apps/web/lib/agent-floor.ts apps/web/lib/agent-floor-defaults.ts
git commit -m "feat: add BudCast operations server utilities"
```

Expected: commit succeeds.

---

## Task 3: Add Agent Floor API And Editor

**Files:**
- Create: `apps/web/app/api/agent-floor/route.ts`
- Create: `apps/web/app/mission-control/operations/editor.tsx`
- Create: `apps/web/app/mission-control/operations/edit/page.tsx`

- [ ] **Step 1: Add the API route**

Create `apps/web/app/api/agent-floor/route.ts`:

```ts
import { getAgentFloorConfigRaw, saveAgentFloorConfig } from "../../../lib/agent-floor";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({ raw: getAgentFloorConfigRaw() });
}

export async function POST(request: Request) {
  let payload: { raw?: unknown } = {};

  try {
    payload = (await request.json()) as { raw?: unknown };
  } catch {
    return Response.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  if (typeof payload.raw !== "string") {
    return Response.json({ error: "Expected a raw JSON string." }, { status: 400 });
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(payload.raw);
  } catch (error) {
    const message = error instanceof Error ? error.message : "BudCast Operations JSON could not be parsed.";
    return Response.json({ error: message }, { status: 400 });
  }

  const result = saveAgentFloorConfig(parsed);

  return Response.json({
    ok: true,
    updatedAt: result.updatedAt,
    path: result.path
  });
}
```

- [ ] **Step 2: Create the operations editor component**

Create `apps/web/app/mission-control/operations/editor.tsx` by mirroring `apps/web/app/mission-control/editor.tsx`, with wording and endpoint changed:

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { RotateCcw, Save, ShieldCheck } from "lucide-react";
import { Button } from "../../../components/ui/button";

type AgentFloorEditorProps = {
  configPath: string;
  initialRaw: string;
  initialUpdatedAt: string;
};

export function AgentFloorEditor({
  configPath,
  initialRaw,
  initialUpdatedAt
}: AgentFloorEditorProps) {
  const [draft, setDraft] = useState(initialRaw);
  const [savedBaseline, setSavedBaseline] = useState(initialRaw);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState(`Curated operations config last saved ${initialUpdatedAt}.`);

  const isDirty = draft !== savedBaseline;

  async function handleSave() {
    setStatus("saving");
    setMessage("Saving BudCast Operations data...");

    try {
      JSON.parse(draft);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "BudCast Operations JSON is invalid.");
      return;
    }

    const response = await fetch("/api/agent-floor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ raw: draft })
    });

    const payload = (await response.json()) as { error?: string; updatedAt?: string };

    if (!response.ok) {
      setStatus("error");
      setMessage(payload.error ? payload.error : "BudCast Operations save failed.");
      return;
    }

    setSavedBaseline(draft);
    setStatus("saved");
    setMessage(`BudCast Operations saved locally at ${payload.updatedAt ? payload.updatedAt : "just now"}.`);
  }

  function handleRestore() {
    setDraft(savedBaseline);
    setStatus("idle");
    setMessage("Restored the last saved BudCast Operations state.");
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
      <section className="soft-panel p-8">
        <div className="premium-badge">
          <span className="signal-dot" />
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-surface-500">Operations Editor</div>
            <div className="text-sm font-medium text-surface-900">Curated command-table data, local save, no backend dependency</div>
          </div>
        </div>

        <h2 className="mt-6 font-display text-4xl text-surface-900">Edit the cinematic operating room without touching product code.</h2>
        <p className="mt-4 max-w-xl text-sm leading-7 text-surface-700">
          This editor writes directly to the repo-backed Agent Floor config file. Use it for mission status, operators,
          model rationale, blockers, and verified build evidence.
        </p>

        <div className="mt-6 space-y-4">
          <div className="rounded-[22px] border border-white/80 bg-white/76 p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-surface-500">Tracked file</div>
            <div className="mt-2 break-all font-mono text-xs text-surface-700">{configPath}</div>
          </div>
          <div className="rounded-[22px] border border-white/80 bg-white/76 p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-surface-500">Editing guidance</div>
            <div className="mt-2 space-y-2 text-sm leading-7 text-surface-700">
              <p>Keep valid JSON.</p>
              <p>Status values must match the allowed Agent Floor statuses.</p>
              <p>Use `verification` for command evidence or review results.</p>
              <p>Use this for curated operations truth, not customer-facing product data.</p>
            </div>
          </div>
          <div
            className={`rounded-[22px] border px-4 py-4 text-sm leading-7 ${
              status === "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : status === "saved"
                  ? "border-herb-200 bg-herb-50 text-herb-800"
                  : "border-white/80 bg-white/76 text-surface-700"
            }`}
          >
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-1 h-4 w-4" />
              <span>{message}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild variant="secondary">
            <Link href="/mission-control/operations">Back to BudCast Operations</Link>
          </Button>
          <Button asChild variant="secondary">
            <a href="/api/agent-floor" target="_blank">
              Open raw JSON
            </a>
          </Button>
        </div>
      </section>

      <section className="soft-panel p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] text-surface-500">Config JSON</div>
            <h3 className="mt-2 font-display text-3xl text-surface-900">Agent Floor state</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleRestore} type="button" variant="secondary">
              <RotateCcw className="mr-2 h-4 w-4" />
              Restore saved
            </Button>
            <Button disabled={!isDirty || status === "saving"} onClick={handleSave} type="button">
              <Save className="mr-2 h-4 w-4" />
              {status === "saving" ? "Saving..." : "Save operations file"}
            </Button>
          </div>
        </div>

        <textarea
          className="premium-textarea mt-6 min-h-[42rem] font-mono text-xs leading-6 text-surface-900"
          onChange={(event) => {
            setDraft(event.target.value);
            if (status !== "idle") {
              setStatus("idle");
              setMessage("Unsaved BudCast Operations changes in progress.");
            }
          }}
          spellCheck={false}
          value={draft}
        />
      </section>
    </div>
  );
}
```

- [ ] **Step 3: Create the editor route**

Create `apps/web/app/mission-control/operations/edit/page.tsx`:

```tsx
import Link from "next/link";
import { ArrowLeft, PencilLine } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import {
  getAgentFloorConfigPath,
  getAgentFloorConfigRaw,
  getAgentFloorConfigUpdatedAt
} from "../../../../lib/agent-floor";
import { AgentFloorEditor } from "../editor";

export const dynamic = "force-dynamic";

export default function AgentFloorEditPage() {
  return (
    <main className="grid-overlay min-h-screen px-6 py-8 md:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <header className="hero-orbit overflow-hidden rounded-[34px] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(255,248,240,0.72))] px-6 py-6 shadow-[0_24px_70px_rgba(33,27,20,0.1)] backdrop-blur">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="max-w-3xl">
              <div className="premium-badge">
                <span className="signal-dot" />
                <div>
                  <div className="text-xs uppercase tracking-[0.3em] text-surface-500">BudCast Operations Editor</div>
                  <div className="text-sm font-medium text-surface-900">Curated Agent Floor data</div>
                </div>
              </div>
              <h1 className="mt-6 font-display text-5xl text-surface-900 md:text-6xl">
                Manual override for the operating room.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-surface-700">
                Update the manager, operators, mission log, model choices, verification evidence, and blockers that power
                the cinematic command table.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild variant="secondary">
                <Link href="/mission-control/operations">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to operations
                </Link>
              </Button>
              <Button asChild>
                <a href="/api/agent-floor" target="_blank">
                  <PencilLine className="mr-2 h-4 w-4" />
                  View raw JSON
                </a>
              </Button>
            </div>
          </div>
        </header>

        <AgentFloorEditor
          configPath={getAgentFloorConfigPath()}
          initialRaw={getAgentFloorConfigRaw()}
          initialUpdatedAt={getAgentFloorConfigUpdatedAt()}
        />
      </div>
    </main>
  );
}
```

- [ ] **Step 4: Verify API and editor typecheck**

Run:

```bash
npm run typecheck -w @budcast/web
```

Expected: pass.

- [ ] **Step 5: Commit API and editor**

Run:

```bash
git add apps/web/app/api/agent-floor/route.ts apps/web/app/mission-control/operations/editor.tsx apps/web/app/mission-control/operations/edit/page.tsx
git commit -m "feat: add BudCast operations editor"
```

Expected: commit succeeds.

---

## Task 4: Build The Cinematic Command Table Dashboard

**Files:**
- Create: `apps/web/app/mission-control/operations/page.tsx`
- Optional modify: `apps/web/app/globals.css`

- [ ] **Step 1: Create small local dashboard helpers**

In `apps/web/app/mission-control/operations/page.tsx`, start with imports and helper components:

```tsx
import Link from "next/link";
import {
  AlertTriangle,
  Bot,
  BrainCircuit,
  CheckCircle2,
  ClipboardList,
  Gauge,
  MonitorCog,
  PencilLine,
  Radar,
  ShieldCheck,
  Sparkles,
  Target
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import {
  agentCategoryLabel,
  agentStatusLabel,
  agentStatusTone,
  avatarToneClass,
  getAgentFloorSnapshot,
  type AgentMission,
  type AgentMissionStatus,
  type AgentOperator
} from "../../../lib/agent-floor";

export const dynamic = "force-dynamic";

function MetricTile({ label, value, detail }: { label: string; value: string | number; detail: string }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.045] p-5">
      <div className="text-xs uppercase tracking-[0.24em] text-[#a59a86]">{label}</div>
      <div className="mt-3 text-4xl font-semibold text-[#fbf8f4]">{value}</div>
      <p className="mt-2 text-sm leading-6 text-[#d7cdbd]">{detail}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: AgentMissionStatus }) {
  return (
    <div className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.18em] ${agentStatusTone(status)}`}>
      {agentStatusLabel(status)}
    </div>
  );
}

function OperatorCard({ operator }: { operator: AgentOperator }) {
  return (
    <div className="group rounded-[24px] border border-white/10 bg-[#11130f]/90 p-4 shadow-[0_18px_44px_rgba(0,0,0,0.24)] transition duration-300 hover:-translate-y-1 hover:border-[#c6a15b]/40">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.24em] text-[#a59a86]">{operator.role}</div>
          <div className="mt-2 text-xl font-semibold text-[#fbf8f4]">{operator.name}</div>
        </div>
        <StatusBadge status={operator.status} />
      </div>
      <div className={`mt-5 h-20 rounded-[22px] bg-gradient-to-br ${avatarToneClass(operator.avatarTone)} shadow-[0_0_36px_rgba(192,147,77,0.12)]`} />
      <p className="mt-4 text-sm leading-6 text-[#d7cdbd]">{operator.currentTask}</p>
      <div className="mt-4 rounded-[18px] border border-white/10 bg-white/[0.035] p-3">
        <div className="text-[11px] uppercase tracking-[0.2em] text-[#a59a86]">Model choice</div>
        <div className="mt-1 text-sm font-medium text-[#fbf8f4]">{operator.modelLabel}</div>
        <div className="mt-1 text-xs uppercase tracking-[0.18em] text-[#d7c3a0]">{operator.reasoningLevel} reasoning</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add mission and blocker cards**

Continue in the same file with:

```tsx
function MissionCard({ mission }: { mission: AgentMission }) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/[0.045] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.24em] text-[#a59a86]">{agentCategoryLabel(mission.category)}</div>
          <div className="mt-2 text-lg font-semibold text-[#fbf8f4]">{mission.title}</div>
        </div>
        <StatusBadge status={mission.status} />
      </div>
      <p className="mt-3 text-sm leading-6 text-[#d7cdbd]">{mission.summary}</p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-[16px] border border-white/10 bg-[#0d0f0c] p-3">
          <div className="text-[11px] uppercase tracking-[0.2em] text-[#a59a86]">Model</div>
          <div className="mt-1 text-sm text-[#fbf8f4]">{mission.modelLabel}</div>
          <div className="mt-1 text-xs uppercase tracking-[0.18em] text-[#d7c3a0]">{mission.reasoningLevel} reasoning</div>
        </div>
        <div className="rounded-[16px] border border-white/10 bg-[#0d0f0c] p-3">
          <div className="text-[11px] uppercase tracking-[0.2em] text-[#a59a86]">Quality gate</div>
          <div className="mt-1 text-sm text-[#fbf8f4]">{mission.qualityGate}</div>
          <div className="mt-1 text-xs uppercase tracking-[0.18em] text-[#d7c3a0]">
            {mission.fixRequired ? "Fix required" : "No fix required"}
          </div>
        </div>
      </div>
      <p className="mt-3 text-xs leading-5 text-[#a59a86]">Verified: {mission.verification}</p>
    </div>
  );
}
```

- [ ] **Step 3: Build the page shell and header**

Add the default export:

```tsx
export default function BudCastOperationsPage() {
  const snapshot = getAgentFloorSnapshot();
  const activeMission = snapshot.activeMission;

  return (
    <main className="min-h-screen bg-[#070806] px-6 py-8 text-[#fbf8f4] md:px-10">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(192,147,77,0.22),transparent_28%),radial-gradient(circle_at_84%_18%,rgba(95,119,72,0.2),transparent_28%),linear-gradient(135deg,#070806,#10120f_55%,#060705)]" />
      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.045] p-6 shadow-[0_28px_80px_rgba(0,0,0,0.35)]">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-3 rounded-full border border-[#c6a15b]/30 bg-[#1a1710] px-4 py-2">
                <span className="h-2 w-2 rounded-full bg-[#c6a15b] shadow-[0_0_18px_rgba(198,161,91,0.9)]" />
                <div>
                  <div className="text-xs uppercase tracking-[0.3em] text-[#a59a86]">{snapshot.title}</div>
                  <div className="text-sm font-medium text-[#fbf8f4]">Agent Floor · Curated live operations view</div>
                </div>
              </div>
              <h1 className="mt-6 font-display text-5xl text-[#fbf8f4] md:text-7xl">
                Ops War Room for manager and subagent missions.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-[#d7cdbd]">
                Codex Manager dispatches missions, named operators work the table, and every quality gate records the
                model choice, rationale, result, and verification evidence.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="secondary">
                <Link href="/mission-control">Mission Control</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/mission-control/operations/edit">
                  <PencilLine className="mr-2 h-4 w-4" />
                  Manual override
                </Link>
              </Button>
            </div>
          </div>
        </header>
      </div>
    </main>
  );
}
```

- [ ] **Step 4: Add metrics and command table content**

Inside the `div.relative`, after the header, add:

```tsx
<section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
  <MetricTile label="Efficiency" value={`${snapshot.metrics.efficiencyScore}%`} detail="Curated measure of model fit versus task complexity." />
  <MetricTile label="Quality" value={`${snapshot.metrics.qualityScore}%`} detail="How cleanly work is passing review and verification gates." />
  <MetricTile label="Active Missions" value={snapshot.metrics.activeMissions} detail="Current missions assigned or in review." />
  <MetricTile label="Blockers" value={snapshot.metrics.blockers} detail="Known operational risks blocking clean progress." />
</section>

<section className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
  <div className="rounded-[34px] border border-white/10 bg-white/[0.045] p-6 shadow-[0_28px_80px_rgba(0,0,0,0.28)]">
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <Radar className="h-5 w-5 text-[#c6a15b]" />
        <h2 className="font-display text-4xl text-[#fbf8f4]">Command Table</h2>
      </div>
      <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[#d7c3a0]">
        Last updated {snapshot.configUpdatedAt}
      </div>
    </div>

    <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[radial-gradient(ellipse_at_center,rgba(192,147,77,0.16),rgba(255,255,255,0.035)_54%,rgba(255,255,255,0.02))] p-5">
      <div className="grid gap-4 lg:grid-cols-[0.92fr_1.16fr_0.92fr]">
        <div className="grid gap-4">
          {snapshot.operators.slice(0, 2).map((operator) => (
            <OperatorCard key={operator.id} operator={operator} />
          ))}
        </div>

        <div className="flex min-h-[34rem] flex-col justify-center rounded-[30px] border border-[#c6a15b]/25 bg-[#18140d]/80 p-6 text-center shadow-[0_0_70px_rgba(192,147,77,0.12)]">
          <div className={`mx-auto h-32 w-32 rounded-[36px] bg-gradient-to-br ${avatarToneClass(snapshot.manager.avatarTone)} shadow-[0_0_60px_rgba(192,147,77,0.24)]`} />
          <div className="mt-5 text-xs uppercase tracking-[0.26em] text-[#a59a86]">{snapshot.manager.role}</div>
          <div className="mt-2 font-display text-5xl text-[#fbf8f4]">{snapshot.manager.name}</div>
          <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-[#d7cdbd]">{snapshot.manager.currentAction}</p>
          <div className="mx-auto mt-5">
            <StatusBadge status={snapshot.manager.status} />
          </div>
          {activeMission ? (
            <div className="mt-6 rounded-[22px] border border-[#c6a15b]/25 bg-[#21190f] p-4 text-left">
              <div className="text-[11px] uppercase tracking-[0.22em] text-[#c6a15b]">Current mission</div>
              <div className="mt-2 text-2xl font-semibold text-[#fbf8f4]">{activeMission.title}</div>
              <p className="mt-2 text-sm leading-6 text-[#d7cdbd]">{activeMission.choiceRationale}</p>
            </div>
          ) : (
            <div className="mt-6 rounded-[22px] border border-white/10 bg-white/[0.035] p-4 text-sm text-[#d7cdbd]">
              No active mission assigned. Use Manual override to queue the next operation.
            </div>
          )}
        </div>

        <div className="grid gap-4">
          {snapshot.operators.slice(2, 4).map((operator) => (
            <OperatorCard key={operator.id} operator={operator} />
          ))}
        </div>
      </div>
    </div>
  </div>

  <aside className="grid gap-5">
    <div className="rounded-[30px] border border-white/10 bg-white/[0.045] p-6">
      <div className="flex items-center gap-3">
        <BrainCircuit className="h-5 w-5 text-[#c6a15b]" />
        <h2 className="font-display text-3xl text-[#fbf8f4]">Mission Intel</h2>
      </div>
      {activeMission ? <MissionCard mission={activeMission} /> : null}
    </div>
  </aside>
</section>
```

- [ ] **Step 5: Add blockers, notes, departments, and mission log**

After the command table section, add:

```tsx
<section className="grid gap-5 xl:grid-cols-[0.7fr_1.3fr]">
  <div className="grid gap-5">
    <div className="rounded-[30px] border border-white/10 bg-white/[0.045] p-6">
      <div className="mb-4 flex items-center gap-3">
        <AlertTriangle className="h-5 w-5 text-[#d7a07d]" />
        <h2 className="font-display text-3xl text-[#fbf8f4]">Blockers</h2>
      </div>
      <div className="grid gap-3">
        {snapshot.blockers.map((blocker) => (
          <div className="rounded-[20px] border border-[#d7a07d]/30 bg-[#3b1d12]/40 p-4" key={blocker.id}>
            <div className="text-xs uppercase tracking-[0.2em] text-[#d7a07d]">{blocker.severity} risk · {blocker.owner}</div>
            <div className="mt-2 text-base font-semibold text-[#fbf8f4]">{blocker.title}</div>
            <p className="mt-2 text-sm leading-6 text-[#ffd8c4]">{blocker.detail}</p>
          </div>
        ))}
      </div>
    </div>

    <div className="rounded-[30px] border border-white/10 bg-white/[0.045] p-6">
      <div className="mb-4 flex items-center gap-3">
        <MonitorCog className="h-5 w-5 text-[#c6a15b]" />
        <h2 className="font-display text-3xl text-[#fbf8f4]">Departments</h2>
      </div>
      <div className="grid gap-3">
        {snapshot.departments.map((department) => (
          <div className="rounded-[20px] border border-white/10 bg-[#0d0f0c] p-4" key={department.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-[#a59a86]">{agentCategoryLabel(department.category)}</div>
                <div className="mt-2 text-base font-semibold text-[#fbf8f4]">{department.name}</div>
              </div>
              <StatusBadge status={department.status} />
            </div>
            <p className="mt-2 text-sm leading-6 text-[#d7cdbd]">{department.detail}</p>
          </div>
        ))}
      </div>
    </div>
  </div>

  <div className="rounded-[30px] border border-white/10 bg-white/[0.045] p-6">
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <ClipboardList className="h-5 w-5 text-[#c6a15b]" />
        <h2 className="font-display text-3xl text-[#fbf8f4]">Mission Log</h2>
      </div>
      <div className="text-xs uppercase tracking-[0.2em] text-[#a59a86]">Curated replay history</div>
    </div>
    <div className="grid gap-4">
      {snapshot.missions.map((mission) => (
        <MissionCard key={mission.id} mission={mission} />
      ))}
    </div>
  </div>
</section>

<section className="rounded-[28px] border border-white/10 bg-white/[0.045] p-5">
  <div className="flex items-start gap-3">
    <ShieldCheck className="mt-1 h-5 w-5 text-[#c6a15b]" />
    <div>
      <div className="text-xs uppercase tracking-[0.24em] text-[#a59a86]">Truthfulness Rules</div>
      <div className="mt-2 grid gap-2 text-sm leading-6 text-[#d7cdbd]">
        {snapshot.notes.map((note) => (
          <p key={note}>{note}</p>
        ))}
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 6: Add missing dark button compatibility if needed**

If `Button` secondary styling is too light inside this dark page, wrap links in existing `Button` only in the header where contrast is acceptable. Do not change global button styles for this feature unless manual visual review proves a contrast issue.

- [ ] **Step 7: Verify the dashboard route**

Run:

```bash
npm run typecheck -w @budcast/web
```

Expected: pass.

Run:

```bash
npm run build:web
```

Expected: Next build includes `/mission-control/operations` and `/mission-control/operations/edit`.

- [ ] **Step 8: Commit dashboard**

Run:

```bash
git add apps/web/app/mission-control/operations/page.tsx apps/web/app/globals.css
git commit -m "feat: add BudCast operations command table"
```

If `apps/web/app/globals.css` was not modified, omit it from `git add`.

---

## Task 5: Link BudCast Operations From Mission Control

**Files:**
- Modify: `apps/web/app/mission-control/page.tsx`

- [ ] **Step 1: Add a header button**

In `apps/web/app/mission-control/page.tsx`, add `Bot` or `BrainCircuit` to the `lucide-react` import list:

```tsx
  Bot,
```

Add this button beside the existing `Edit ops` button:

```tsx
<Button asChild variant="secondary">
  <Link href="/mission-control/operations">
    <Bot className="mr-2 h-4 w-4" />
    BudCast Operations
  </Link>
</Button>
```

- [ ] **Step 2: Add a preview link in mission-control data**

Modify `ops/mission-control.json` and `apps/web/lib/mission-control-defaults.ts` preview links to include:

```json
{
  "label": "BudCast Operations",
  "href": "/mission-control/operations"
}
```

For the TypeScript defaults file, add:

```ts
{ label: "BudCast Operations", href: "/mission-control/operations" },
```

- [ ] **Step 3: Verify navigation**

Run:

```bash
npm run typecheck -w @budcast/web
npm run build:web
```

Expected: both pass, and the production route table includes `/mission-control/operations`.

- [ ] **Step 4: Commit navigation**

Run:

```bash
git add apps/web/app/mission-control/page.tsx ops/mission-control.json apps/web/lib/mission-control-defaults.ts
git commit -m "feat: link BudCast operations from mission control"
```

Expected: commit succeeds.

---

## Task 6: Manual QA And Editor Validation

**Files:**
- Verify: `apps/web/app/mission-control/operations/page.tsx`
- Verify: `apps/web/app/mission-control/operations/edit/page.tsx`
- Verify: `ops/agent-floor.json`

- [ ] **Step 1: Start the web server**

Run:

```bash
npm run start -w @budcast/web -- --port 3001
```

Expected: web server starts on `http://localhost:3001`.

- [ ] **Step 2: Load operations dashboard**

Open:

```text
http://localhost:3001/mission-control/operations
```

Expected:

- Header says `BudCast Operations`.
- Command table is the dominant center visual.
- Codex Manager appears in the center.
- Operators show both name and role.
- Active mission rail shows model choice and reasoning rationale.
- Mission log shows Task 5, Task 4, and Task 3 history.
- Truthfulness note says the view is curated.

- [ ] **Step 3: Load operations editor**

Open:

```text
http://localhost:3001/mission-control/operations/edit
```

Expected:

- Editor loads JSON from `ops/agent-floor.json`.
- Tracked file path points to `ops/agent-floor.json`.
- Save button is disabled until the JSON changes.

- [ ] **Step 4: Validate invalid JSON handling**

In the editor, temporarily replace the first `{` with this invalid text:

```json
{ invalid
```

Click save.

Expected:

- Save is rejected.
- Error message appears.
- File is not saved as invalid JSON.

Restore the previous valid JSON with the restore button.

- [ ] **Step 5: Validate a real manual override**

Change `metrics.efficiencyScore` from `91` to `92`, save, then reload `/mission-control/operations`.

Expected:

- Dashboard shows `92%` efficiency.
- `ops/agent-floor.json` contains `"efficiencyScore": 92`.

Change the score back to `91` and save.

- [ ] **Step 6: Run final verification**

Run:

```bash
npm run typecheck
npm run build:web
```

Expected: both pass.

- [ ] **Step 7: Commit QA cleanup if files changed**

If the manual override test changed `ops/agent-floor.json`, restore the approved value and commit only intentional final data:

```bash
git add ops/agent-floor.json
git commit -m "chore: finalize BudCast operations seed data"
```

If no final data changed, do not create a commit.

---

## Self-Review

### Spec coverage

- Product name `BudCast Operations`: covered in Tasks 1, 3, 4, and 5.
- Routes `/mission-control/operations` and `/mission-control/operations/edit`: covered in Tasks 3 and 4.
- Curated JSON data source `ops/agent-floor.json`: covered in Tasks 1 and 2.
- Command Table centerpiece: covered in Task 4.
- Live floor plus mission history: covered in Tasks 1 and 4.
- Manual override editor: covered in Task 3 and validated in Task 6.
- Name plus role characters: covered in Task 1 defaults and Task 4 operator UI.
- Mission categories beyond build work: covered in Task 1 data shape and departments.
- Truthfulness rules: covered in Task 4 notes panel and Task 6 manual verification.
- No backend/schema/service changes: all tasks stay in local files and Next routes.

### Placeholder scan

This plan avoids placeholder work, open-ended edge-case instructions, and unspecified tests. Every task lists exact files, code patterns, commands, and expected results.

### Type consistency

The plan consistently uses `AgentFloorConfig`, `AgentMissionStatus`, `AgentMissionCategory`, `AgentReasoningLevel`, `AgentOperator`, `AgentMission`, `getAgentFloorSnapshot`, `getAgentFloorConfigRaw`, and `saveAgentFloorConfig` across tasks.
