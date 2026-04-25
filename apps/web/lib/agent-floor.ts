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

const runtimeCwd = process.cwd();
const workspaceRoot = existsSync(join(runtimeCwd, "apps", "web")) ? runtimeCwd : join(runtimeCwd, "..", "..");
const agentFloorConfigPath = join(workspaceRoot, "ops", "agent-floor.json");

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

function asCount(value: unknown, fallback: number) {
  if (typeof value !== "number" || Number.isNaN(value)) return fallback;
  return Math.max(0, Math.round(value));
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
    activeMissions: asCount(source.activeMissions, fallback.activeMissions),
    blockers: asCount(source.blockers, fallback.blockers)
  };
}

function normalizeList<T>(value: unknown, fallback: T[], normalizeItem: (value: unknown, fallback: T) => T) {
  if (!Array.isArray(value) || fallback.length === 0) return fallback;
  if (value.length === 0) return [];
  const lastFallback = fallback[fallback.length - 1] as T;
  const next = value.map((item, index) => normalizeItem(item, fallback[index] ?? lastFallback));
  return next;
}

function normalizeBlocker(value: unknown, fallback: AgentBlocker): AgentBlocker {
  const source = asRecord(value);
  const severity =
    source.severity === "low" || source.severity === "medium" || source.severity === "high" ? source.severity : fallback.severity;
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
  const fallbackMission = agentFloorDefaults.activeMission ?? agentFloorDefaults.missions[0];
  const activeMission =
    source.activeMission === null || source.activeMission === undefined
      ? null
      : normalizeMission(source.activeMission, fallbackMission);

  return {
    title: asString(source.title, agentFloorDefaults.title),
    mode: "agent_floor",
    manager: normalizeManager(source.manager, agentFloorDefaults.manager),
    metrics: normalizeMetrics(source.metrics, agentFloorDefaults.metrics),
    operators: normalizeList(source.operators, agentFloorDefaults.operators, normalizeOperator),
    activeMission,
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

export function agentStatusLabel(status: AgentMissionStatus) {
  switch (status) {
    case "needs_fix":
      return "Needs Fix";
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
