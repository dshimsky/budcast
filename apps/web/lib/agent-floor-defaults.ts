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
      fixRequired: false,
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
      fixRequired: false,
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
    },
    {
      id: "support-desk",
      name: "Support Desk",
      category: "support",
      status: "queued",
      detail: "Bug triage, customer issues, and follow-up loops can become operations missions after launch."
    }
  ],
  notes: [
    "Curated operations view: values are manually maintained unless marked as verified.",
    "Verified build evidence must reference actual commands or review results."
  ]
};
