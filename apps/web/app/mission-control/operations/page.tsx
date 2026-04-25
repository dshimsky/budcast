import Link from "next/link";
import {
  AlertTriangle,
  BrainCircuit,
  ClipboardList,
  MonitorCog,
  PencilLine,
  Radar,
  ShieldCheck
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
    <div className="rounded-[24px] border border-white/10 bg-white/[0.045] p-5 shadow-[0_18px_52px_rgba(0,0,0,0.2)]">
      <div className="text-xs uppercase tracking-[0.24em] text-[#a59a86]">{label}</div>
      <div className="mt-3 text-4xl font-semibold text-[#fbf8f4]">{value}</div>
      <p className="mt-2 text-sm leading-6 text-[#d7cdbd]">{detail}</p>
    </div>
  );
}

function EmptyState({ children }: { children: string }) {
  return (
    <div className="rounded-[20px] border border-dashed border-white/15 bg-white/[0.025] p-4 text-sm leading-6 text-[#d7cdbd]">
      {children}
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
      <div
        className={`mt-5 h-20 rounded-[22px] bg-gradient-to-br ${avatarToneClass(
          operator.avatarTone
        )} shadow-[0_0_36px_rgba(192,147,77,0.12)]`}
      />
      <p className="mt-4 text-sm leading-6 text-[#d7cdbd]">{operator.currentTask}</p>
      <div className="mt-4 rounded-[18px] border border-white/10 bg-white/[0.035] p-3">
        <div className="text-[11px] uppercase tracking-[0.2em] text-[#a59a86]">Model choice</div>
        <div className="mt-1 text-sm font-medium text-[#fbf8f4]">{operator.modelLabel}</div>
        <div className="mt-1 text-xs uppercase tracking-[0.18em] text-[#d7c3a0]">{operator.reasoningLevel} reasoning</div>
      </div>
    </div>
  );
}

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

export default function BudCastOperationsPage() {
  const snapshot = getAgentFloorSnapshot();
  const activeMission = snapshot.activeMission;
  const leftOperators = snapshot.operators.slice(0, 2);
  const rightOperators = snapshot.operators.slice(2, 4);
  const overflowOperators = snapshot.operators.slice(4);

  return (
    <main className="min-h-screen bg-[#070806] px-6 py-8 text-[#fbf8f4] md:px-10">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(192,147,77,0.22),transparent_28%),radial-gradient(circle_at_84%_18%,rgba(95,119,72,0.2),transparent_28%),linear-gradient(135deg,#070806,#10120f_55%,#060705)]" />
      <div className="pointer-events-none fixed inset-0 opacity-[0.18] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:84px_84px]" />
      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.045] p-6 shadow-[0_28px_80px_rgba(0,0,0,0.35)]">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-3 rounded-full border border-[#c6a15b]/30 bg-[#1a1710] px-4 py-2">
                <span className="h-2 w-2 rounded-full bg-[#c6a15b] shadow-[0_0_18px_rgba(198,161,91,0.9)]" />
                <div>
                  <div className="text-xs uppercase tracking-[0.3em] text-[#a59a86]">{snapshot.title}</div>
                  <div className="text-sm font-medium text-[#fbf8f4]">Agent Floor - Curated live operations view</div>
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

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricTile
            detail="Curated measure of model fit versus task complexity."
            label="Efficiency"
            value={`${snapshot.metrics.efficiencyScore}%`}
          />
          <MetricTile
            detail="How cleanly work is passing review and verification gates."
            label="Quality"
            value={`${snapshot.metrics.qualityScore}%`}
          />
          <MetricTile
            detail="Current missions assigned or in review."
            label="Active Missions"
            value={snapshot.metrics.activeMissions}
          />
          <MetricTile
            detail="Known operational risks blocking clean progress."
            label="Blockers"
            value={snapshot.metrics.blockers}
          />
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
              <div className="pointer-events-none absolute inset-x-12 top-1/2 hidden h-px bg-gradient-to-r from-transparent via-[#c6a15b]/35 to-transparent lg:block" />
              <div className="pointer-events-none absolute inset-y-12 left-1/2 hidden w-px bg-gradient-to-b from-transparent via-[#c6a15b]/30 to-transparent lg:block" />
              <div className="relative grid gap-4 lg:grid-cols-[0.92fr_1.16fr_0.92fr]">
                <div className="grid gap-4">
                  {leftOperators.length > 0 ? (
                    leftOperators.map((operator) => <OperatorCard key={operator.id} operator={operator} />)
                  ) : (
                    <EmptyState>No operators are currently assigned to this side of the command table.</EmptyState>
                  )}
                </div>

                <div className="flex min-h-[34rem] flex-col justify-center rounded-[30px] border border-[#c6a15b]/25 bg-[#18140d]/80 p-6 text-center shadow-[0_0_70px_rgba(192,147,77,0.12)]">
                  <div
                    className={`mx-auto h-32 w-32 rounded-[36px] bg-gradient-to-br ${avatarToneClass(
                      snapshot.manager.avatarTone
                    )} shadow-[0_0_60px_rgba(192,147,77,0.24)]`}
                  />
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
                  {rightOperators.length > 0 ? (
                    rightOperators.map((operator) => <OperatorCard key={operator.id} operator={operator} />)
                  ) : (
                    <EmptyState>No operators are currently assigned to this side of the command table.</EmptyState>
                  )}
                </div>
              </div>
              {overflowOperators.length > 0 ? (
                <div className="mt-4 rounded-[24px] border border-white/10 bg-[#0d0f0c]/85 p-4">
                  <div className="text-xs uppercase tracking-[0.24em] text-[#a59a86]">
                    Additional operators on the floor
                  </div>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    {overflowOperators.map((operator) => (
                      <div className="rounded-[18px] border border-white/10 bg-white/[0.035] p-3" key={operator.id}>
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="text-[11px] uppercase tracking-[0.2em] text-[#a59a86]">{operator.role}</div>
                            <div className="mt-1 text-base font-semibold text-[#fbf8f4]">{operator.name}</div>
                          </div>
                          <StatusBadge status={operator.status} />
                        </div>
                        <p className="mt-2 text-sm leading-6 text-[#d7cdbd]">{operator.currentTask}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <aside className="grid gap-5">
            <div className="rounded-[30px] border border-white/10 bg-white/[0.045] p-6">
              <div className="mb-4 flex items-center gap-3">
                <BrainCircuit className="h-5 w-5 text-[#c6a15b]" />
                <h2 className="font-display text-3xl text-[#fbf8f4]">Mission Intel</h2>
              </div>
              {activeMission ? (
                <MissionCard mission={activeMission} />
              ) : (
                <div className="rounded-[22px] border border-white/10 bg-white/[0.045] p-4 text-sm leading-6 text-[#d7cdbd]">
                  No active mission intel is currently published.
                </div>
              )}
            </div>

            <div className="rounded-[30px] border border-[#c6a15b]/20 bg-[#15130e]/80 p-6">
              <div className="text-xs uppercase tracking-[0.24em] text-[#a59a86]">Current mission rail</div>
              <div className="mt-3 text-2xl font-semibold text-[#fbf8f4]">
                {activeMission ? activeMission.title : "Awaiting dispatch"}
              </div>
              <p className="mt-3 text-sm leading-7 text-[#d7cdbd]">
                {activeMission
                  ? activeMission.summary
                  : "The command table is ready for the next approved BudCast Operations assignment."}
              </p>
            </div>
          </aside>
        </section>

        <section className="grid gap-5 xl:grid-cols-[0.7fr_1.3fr]">
          <div className="grid gap-5">
            <div className="rounded-[30px] border border-white/10 bg-white/[0.045] p-6">
              <div className="mb-4 flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-[#d7a07d]" />
                <h2 className="font-display text-3xl text-[#fbf8f4]">Blockers</h2>
              </div>
              <div className="grid gap-3">
                {snapshot.blockers.length > 0 ? (
                  snapshot.blockers.map((blocker) => (
                    <div className="rounded-[20px] border border-[#d7a07d]/30 bg-[#3b1d12]/40 p-4" key={blocker.id}>
                      <div className="text-xs uppercase tracking-[0.2em] text-[#d7a07d]">
                        {blocker.severity} risk - {blocker.owner}
                      </div>
                      <div className="mt-2 text-base font-semibold text-[#fbf8f4]">{blocker.title}</div>
                      <p className="mt-2 text-sm leading-6 text-[#ffd8c4]">{blocker.detail}</p>
                    </div>
                  ))
                ) : (
                  <EmptyState>No active blockers are published for this operations snapshot.</EmptyState>
                )}
              </div>
            </div>

            <div className="rounded-[30px] border border-white/10 bg-white/[0.045] p-6">
              <div className="mb-4 flex items-center gap-3">
                <MonitorCog className="h-5 w-5 text-[#c6a15b]" />
                <h2 className="font-display text-3xl text-[#fbf8f4]">Departments</h2>
              </div>
              <div className="grid gap-3">
                {snapshot.departments.length > 0 ? (
                  snapshot.departments.map((department) => (
                    <div className="rounded-[20px] border border-white/10 bg-[#0d0f0c] p-4" key={department.id}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-xs uppercase tracking-[0.2em] text-[#a59a86]">
                            {agentCategoryLabel(department.category)}
                          </div>
                          <div className="mt-2 text-base font-semibold text-[#fbf8f4]">{department.name}</div>
                        </div>
                        <StatusBadge status={department.status} />
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[#d7cdbd]">{department.detail}</p>
                    </div>
                  ))
                ) : (
                  <EmptyState>No department coverage is published for this operations snapshot.</EmptyState>
                )}
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
              {snapshot.missions.length > 0 ? (
                snapshot.missions.map((mission) => <MissionCard key={mission.id} mission={mission} />)
              ) : (
                <EmptyState>No mission history is published yet. Use Manual override to add the first replay entry.</EmptyState>
              )}
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
              <p className="mt-4 text-xs uppercase tracking-[0.2em] text-[#a59a86]">
                Snapshot refreshed {snapshot.now}
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
