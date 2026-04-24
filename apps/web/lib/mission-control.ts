import { execFileSync } from "child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync
} from "fs";
import { join, relative } from "path";
import { missionControlDefaults } from "./mission-control-defaults";

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

export type PreviewLink = {
  label: string;
  href: string;
};

export type MissionControlConfig = {
  phases: MissionPhase[];
  workstreams: MissionWorkstream[];
  recentUpdates: MissionUpdate[];
  blockers: string[];
  nextMoves: string[];
  launchChecklist: LaunchItem[];
  previewLinks: PreviewLink[];
};

export type MissionControlSnapshot = MissionControlConfig & {
  now: string;
  repoBranch: string;
  repoDirtyCount: number;
  changedFiles: string[];
  webRouteCount: number;
  nativeRouteCount: number;
  webRoutes: string[];
  nativeRoutes: string[];
  envReady: Array<{ key: string; ready: boolean }>;
  configPath: string;
  configUpdatedAt: string;
};

const runtimeCwd = process.cwd();
const workspaceRoot = existsSync(join(runtimeCwd, "apps", "web")) ? runtimeCwd : join(runtimeCwd, "..", "..");
const webAppRoot = join(workspaceRoot, "apps", "web");
const nativeAppRoot = join(workspaceRoot, "apps", "native");
const missionControlConfigPath = join(workspaceRoot, "ops", "mission-control.json");

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

function isMissionStatus(value: unknown): value is MissionStatus {
  return value === "not_started" || value === "in_progress" || value === "blocked" || value === "done";
}

function asString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function asStringArray(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) return fallback;
  const next = value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean);
  return next.length > 0 ? next : fallback;
}

function asProgress(value: unknown, fallback: number) {
  if (typeof value !== "number" || Number.isNaN(value)) return fallback;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function asStatus(value: unknown, fallback: MissionStatus) {
  return isMissionStatus(value) ? value : fallback;
}

function asRecord(value: unknown) {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
}

function normalizePhaseList(value: unknown, fallback: MissionPhase[]) {
  if (!Array.isArray(value)) return fallback;
  const phases = value
    .map((item, index) => {
      const source = asRecord(item);
      const fallbackPhase = fallback[index] ?? fallback[fallback.length - 1];
      return {
        id: asString(source.id, `${fallbackPhase?.id ?? "phase"}-${index + 1}`),
        title: asString(source.title, fallbackPhase?.title ?? `Phase ${index + 1}`),
        status: asStatus(source.status, fallbackPhase?.status ?? "not_started"),
        progress: asProgress(source.progress, fallbackPhase?.progress ?? 0),
        summary: asString(source.summary, fallbackPhase?.summary ?? ""),
        milestones: asStringArray(source.milestones, fallbackPhase?.milestones ?? [])
      };
    })
    .filter((item) => item.title);

  return phases.length > 0 ? phases : fallback;
}

function normalizeWorkstreamList(value: unknown, fallback: MissionWorkstream[]) {
  if (!Array.isArray(value)) return fallback;
  const workstreams = value
    .map((item, index) => {
      const source = asRecord(item);
      const fallbackItem = fallback[index] ?? fallback[fallback.length - 1];
      return {
        name: asString(source.name, fallbackItem?.name ?? `Workstream ${index + 1}`),
        status: asStatus(source.status, fallbackItem?.status ?? "not_started"),
        progress: asProgress(source.progress, fallbackItem?.progress ?? 0),
        detail: asString(source.detail, fallbackItem?.detail ?? "")
      };
    })
    .filter((item) => item.name);

  return workstreams.length > 0 ? workstreams : fallback;
}

function normalizeUpdateList(value: unknown, fallback: MissionUpdate[]) {
  if (!Array.isArray(value)) return fallback;
  const updates = value
    .map((item, index) => {
      const source = asRecord(item);
      const fallbackItem = fallback[index] ?? fallback[fallback.length - 1];
      return {
        date: asString(source.date, fallbackItem?.date ?? ""),
        title: asString(source.title, fallbackItem?.title ?? `Update ${index + 1}`),
        detail: asString(source.detail, fallbackItem?.detail ?? "")
      };
    })
    .filter((item) => item.title);

  return updates.length > 0 ? updates : fallback;
}

function normalizeLaunchList(value: unknown, fallback: LaunchItem[]) {
  if (!Array.isArray(value)) return fallback;
  const launchItems = value
    .map((item, index) => {
      const source = asRecord(item);
      const fallbackItem = fallback[index] ?? fallback[fallback.length - 1];
      return {
        name: asString(source.name, fallbackItem?.name ?? `Checklist ${index + 1}`),
        status: asStatus(source.status, fallbackItem?.status ?? "not_started"),
        detail: asString(source.detail, fallbackItem?.detail ?? "")
      };
    })
    .filter((item) => item.name);

  return launchItems.length > 0 ? launchItems : fallback;
}

function normalizePreviewLinks(value: unknown, fallback: PreviewLink[]) {
  if (!Array.isArray(value)) return fallback;
  const links = value
    .map((item, index) => {
      const source = asRecord(item);
      const fallbackItem = fallback[index] ?? fallback[fallback.length - 1];
      return {
        label: asString(source.label, fallbackItem?.label ?? `Preview ${index + 1}`),
        href: asString(source.href, fallbackItem?.href ?? "/")
      };
    })
    .filter((item) => item.label && item.href);

  return links.length > 0 ? links : fallback;
}

export function normalizeMissionControlConfig(value: unknown): MissionControlConfig {
  const source = asRecord(value);

  return {
    phases: normalizePhaseList(source.phases, missionControlDefaults.phases),
    workstreams: normalizeWorkstreamList(source.workstreams, missionControlDefaults.workstreams),
    recentUpdates: normalizeUpdateList(source.recentUpdates, missionControlDefaults.recentUpdates),
    blockers: asStringArray(source.blockers, missionControlDefaults.blockers),
    nextMoves: asStringArray(source.nextMoves, missionControlDefaults.nextMoves),
    launchChecklist: normalizeLaunchList(source.launchChecklist, missionControlDefaults.launchChecklist),
    previewLinks: normalizePreviewLinks(source.previewLinks, missionControlDefaults.previewLinks)
  };
}

export function getMissionControlConfigPath() {
  return missionControlConfigPath;
}

export function getMissionControlConfig() {
  if (!existsSync(missionControlConfigPath)) {
    saveMissionControlConfig(missionControlDefaults);
    return missionControlDefaults;
  }

  try {
    const raw = readFileSync(missionControlConfigPath, "utf8");
    return normalizeMissionControlConfig(JSON.parse(raw));
  } catch {
    return missionControlDefaults;
  }
}

export function getMissionControlConfigRaw() {
  return JSON.stringify(getMissionControlConfig(), null, 2);
}

export function getMissionControlConfigUpdatedAt() {
  try {
    return statSync(missionControlConfigPath).mtime.toLocaleString("en-US", {
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

export function saveMissionControlConfig(value: unknown) {
  const config = normalizeMissionControlConfig(value);
  mkdirSync(join(workspaceRoot, "ops"), { recursive: true });
  writeFileSync(missionControlConfigPath, `${JSON.stringify(config, null, 2)}\n`, "utf8");
  return {
    config,
    updatedAt: getMissionControlConfigUpdatedAt(),
    path: missionControlConfigPath
  };
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
  const config = getMissionControlConfig();

  const envKeys = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "EXPO_PUBLIC_SUPABASE_URL",
    "EXPO_PUBLIC_SUPABASE_ANON_KEY"
  ];

  return {
    ...config,
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
    configPath: missionControlConfigPath,
    configUpdatedAt: getMissionControlConfigUpdatedAt()
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
