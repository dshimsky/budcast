import { execFileSync } from "child_process";
import { existsSync, readdirSync } from "fs";
import { join, relative } from "path";

export type MissionStatus = "not_started" | "in_progress" | "blocked" | "done";

export type MissionPhase = {
  id: string;
  title: string;
  status: MissionStatus;
  progress: number;
  summary: string;
  milestones: string[];
};

export type MissionWorkstream = {
  name: string;
  status: MissionStatus;
  progress: number;
  detail: string;
};

export type MissionUpdate = {
  date: string;
  title: string;
  detail: string;
};

export type LaunchItem = {
  name: string;
  status: MissionStatus;
  detail: string;
};

export type MissionControlSnapshot = {
  now: string;
  repoBranch: string;
  repoDirtyCount: number;
  changedFiles: string[];
  webRouteCount: number;
  nativeRouteCount: number;
  webRoutes: string[];
  nativeRoutes: string[];
  envReady: Array<{ key: string; ready: boolean }>;
  phases: MissionPhase[];
  workstreams: MissionWorkstream[];
  recentUpdates: MissionUpdate[];
  blockers: string[];
  nextMoves: string[];
  launchChecklist: LaunchItem[];
  previewLinks: Array<{ label: string; href: string }>;
};

const runtimeCwd = process.cwd();
const workspaceRoot = existsSync(join(runtimeCwd, "apps", "web")) ? runtimeCwd : join(runtimeCwd, "..", "..");
const webAppRoot = join(workspaceRoot, "apps", "web");
const nativeAppRoot = join(workspaceRoot, "apps", "native");

const phases: MissionPhase[] = [
  {
    id: "concept",
    title: "Concept And Product Direction",
    status: "done",
    progress: 100,
    summary: "Stack, migration direction, business constraints, and platform posture are locked.",
    milestones: [
      "Read handoff and business context",
      "Approved Next.js + Expo split",
      "Approved migration plan into BUDCASTAPP"
    ]
  },
  {
    id: "foundation",
    title: "Foundation And Shared Runtime",
    status: "done",
    progress: 100,
    summary: "Monorepo, shared package, Supabase client wiring, strict TypeScript, and platform shells are in place.",
    milestones: [
      "Monorepo created in BUDCASTAPP",
      "Shared data layer ported",
      "Web and native compile successfully"
    ]
  },
  {
    id: "identity",
    title: "Auth, Profiles, And Onboarding",
    status: "done",
    progress: 100,
    summary: "Auth, onboarding, profile hydration, and profile editing are wired across web and native.",
    milestones: [
      "Sign-in and sign-up wired",
      "Onboarding writes into locked users row",
      "Profile and edit flows live on both platforms"
    ]
  },
  {
    id: "marketplace-core",
    title: "Marketplace Core",
    status: "in_progress",
    progress: 72,
    summary: "Brand publish/review flows and creator browse/apply flows exist, but deeper navigation, QA, and real-session polish remain.",
    milestones: [
      "Brand dashboard and campaign builder exist",
      "Applicant review queue exists",
      "Creator catalog, details, and applications exist"
    ]
  },
  {
    id: "submission-loop",
    title: "Submission And Payout Loop",
    status: "in_progress",
    progress: 68,
    summary: "Submission, verification, and payout confirmation are wired, but need deeper end-to-end QA and refined happy-path transitions.",
    milestones: [
      "Creator proof submission flow exists",
      "Brand verification queue exists",
      "Two-sided payment confirmation exists"
    ]
  },
  {
    id: "polish",
    title: "Premium Design And Product Cohesion",
    status: "in_progress",
    progress: 64,
    summary: "Premium visual language is strong on web and advancing on native, but final consistency and runtime stability work remain.",
    milestones: [
      "Landing, auth, onboarding, and dashboard upgraded",
      "Operational brand surfaces upgraded",
      "Native creator surfaces upgraded"
    ]
  },
  {
    id: "release",
    title: "QA, Store Prep, And Launch",
    status: "not_started",
    progress: 14,
    summary: "Release operations, compliance copy, full QA, and store submission prep still need dedicated execution.",
    milestones: [
      "App Store and Play Store packaging not started",
      "Full device QA not started",
      "Compliance review pass not started"
    ]
  }
];

const workstreams: MissionWorkstream[] = [
  {
    name: "Web Brand Workspace",
    status: "in_progress",
    progress: 78,
    detail: "Strong operator-facing dashboard, campaign builder, applicant review, submissions, and local mission-control support."
  },
  {
    name: "Native Creator App",
    status: "in_progress",
    progress: 66,
    detail: "Premium creator home, catalog, detail, submissions, applications, onboarding, and profile surfaces are in place."
  },
  {
    name: "Shared Data Layer",
    status: "done",
    progress: 92,
    detail: "Supabase client, shared hooks, query logic, and stores are ported and driving both platforms."
  },
  {
    name: "Design System",
    status: "in_progress",
    progress: 71,
    detail: "Premium visual system exists on web and native, but consistency and reusable owner-console patterns are still growing."
  },
  {
    name: "Runtime Stability",
    status: "blocked",
    progress: 44,
    detail: "The customer product builds cleanly, but local preview tooling has intermittent Next/Expo runtime instability that needs cleanup."
  },
  {
    name: "Release Readiness",
    status: "not_started",
    progress: 12,
    detail: "Store packaging, submission assets, compliance copy, and final launch checklists still need to be built."
  }
];

const recentUpdates: MissionUpdate[] = [
  {
    date: "2026-04-23",
    title: "Split-stack platform foundation established",
    detail: "Monorepo, shared package, web shell, native shell, and locked-backend data layer were stood up inside BUDCASTAPP."
  },
  {
    date: "2026-04-23",
    title: "Auth, onboarding, and profile flows shipped",
    detail: "Shared auth hydration, onboarding persistence, and profile editing now work across web and native."
  },
  {
    date: "2026-04-23",
    title: "Core marketplace loops shipped",
    detail: "Brand campaign creation, applicant review, creator discovery, applications, submission proof, and payout confirmation are in place."
  },
  {
    date: "2026-04-23",
    title: "Premium visual direction raised across both apps",
    detail: "Web received a stronger operator-grade visual system and native creator surfaces were rebuilt around the same premium direction."
  },
  {
    date: "2026-04-23",
    title: "Owner-facing mission control started",
    detail: "A local-only command center is being added to track progress, blockers, and build health while the product is under construction."
  }
];

const blockers = [
  "Supabase public env vars are still missing for full live-session product validation.",
  "Local runtime previews are less stable than the formal build pipeline; Next dev and Expo web both need cleanup.",
  "Store-prep work has not started yet, so launch readiness is still operationally early."
];

const nextMoves = [
  "Finish the owner-facing mission control dashboard and make it the daily local control tower.",
  "Stabilize local preview/runtime paths so creator and brand surfaces are easy to review without manual cleanup.",
  "Continue native creator polish and tighten cross-platform cohesion in the marketplace loop.",
  "Move into QA and release-prep planning once the local product loop is visually and functionally stable."
];

const launchChecklist: LaunchItem[] = [
  {
    name: "Brand web workflow",
    status: "in_progress",
    detail: "Publish, review, and submissions exist, but need QA and finish work."
  },
  {
    name: "Creator native workflow",
    status: "in_progress",
    detail: "Discovery, applications, profile, and submissions exist, but need full runtime QA."
  },
  {
    name: "Environment readiness",
    status: "blocked",
    detail: "Supabase public keys are still missing for true live local validation."
  },
  {
    name: "App Store prep",
    status: "not_started",
    detail: "Store packaging, listing assets, and submission workflow not started."
  },
  {
    name: "Play Store prep",
    status: "not_started",
    detail: "Android packaging and listing assets not started."
  },
  {
    name: "Compliance and copy review",
    status: "not_started",
    detail: "Cannabis-adjacent positioning and store-facing copy still need a launch pass."
  }
];

function runGit(args: string[]) {
  try {
    return execFileSync("git", args, {
      cwd: workspaceRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    }).trim();
  } catch {
    return "";
  }
}

function normalizeRoute(relativePath: string) {
  let route = `/${relativePath}`.replace(/\\/g, "/");
  route = route.replace(/\/+/g, "/");
  return route === "/" ? route : route.replace(/\/$/, "") || "/";
}

function listNextAppRoutes(appDir: string) {
  const routes: string[] = [];

  function walk(currentDir: string) {
    for (const entry of readdirSync(currentDir, { withFileTypes: true })) {
      const fullPath = join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }
      if (!entry.isFile()) continue;
      if (!entry.name.endsWith(".tsx")) continue;
      if (entry.name !== "page.tsx") continue;

      const relativePath = relative(appDir, fullPath)
        .replace(/\\/g, "/")
        .replace(/(^|\/)page\.tsx$/, "");
      routes.push(normalizeRoute(relativePath));
    }
  }

  if (existsSync(appDir)) walk(appDir);

  return routes.sort();
}

function listExpoRoutes(appDir: string) {
  const routes: string[] = [];

  function walk(currentDir: string) {
    for (const entry of readdirSync(currentDir, { withFileTypes: true })) {
      const fullPath = join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }
      if (!entry.isFile()) continue;
      if (!entry.name.endsWith(".tsx")) continue;
      if (entry.name.startsWith("_")) continue;

      const relativePath = relative(appDir, fullPath)
        .replace(/\\/g, "/")
        .replace(/\.tsx$/, "")
        .replace(/\/index$/, "")
        .replace(/^index$/, "");

      routes.push(normalizeRoute(relativePath));
    }
  }

  if (existsSync(appDir)) walk(appDir);

  return routes.sort();
}

function normalizeStatus(status: MissionStatus) {
  switch (status) {
    case "done":
      return "Done";
    case "in_progress":
      return "In Progress";
    case "blocked":
      return "Blocked";
    default:
      return "Not Started";
  }
}

export function getMissionControlSnapshot(): MissionControlSnapshot {
  const branch = runGit(["symbolic-ref", "--short", "HEAD"]) || runGit(["branch", "--show-current"]) || "unknown";
  const changedFilesRaw = runGit(["status", "--short"]);
  const changedFiles = changedFilesRaw
    ? changedFilesRaw
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .slice(0, 12)
    : [];

  const webRoutes = listNextAppRoutes(join(webAppRoot, "app"));
  const nativeRoutes = listExpoRoutes(join(nativeAppRoot, "app"));

  const envKeys = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "EXPO_PUBLIC_SUPABASE_URL",
    "EXPO_PUBLIC_SUPABASE_ANON_KEY"
  ];

  return {
    now: new Date().toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit"
    }),
    repoBranch: branch,
    repoDirtyCount: changedFiles.length,
    changedFiles,
    webRouteCount: webRoutes.length,
    nativeRouteCount: nativeRoutes.length,
    webRoutes,
    nativeRoutes,
    envReady: envKeys.map((key) => ({ key, ready: Boolean(process.env[key]) })),
    phases,
    workstreams,
    recentUpdates,
    blockers,
    nextMoves,
    launchChecklist,
    previewLinks: [
      { label: "Marketplace home", href: "/" },
      { label: "Brand dashboard", href: "/dashboard" },
      { label: "Mission control", href: "/mission-control" },
      { label: "Creator visual preview", href: "http://127.0.0.1:8090/creator-preview.html" }
    ]
  };
}

export function statusTone(status: MissionStatus) {
  switch (status) {
    case "done":
      return "text-herb-800 bg-herb-50 border-herb-200";
    case "in_progress":
      return "text-surface-900 bg-white/80 border-white/80";
    case "blocked":
      return "text-red-700 bg-red-50 border-red-200";
    default:
      return "text-surface-700 bg-surface-50 border-surface-200";
  }
}

export function statusLabel(status: MissionStatus) {
  return normalizeStatus(status);
}
