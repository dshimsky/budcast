import Link from "next/link";
import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  ClipboardList,
  FilePenLine,
  Flag,
  GitBranch,
  MonitorCog,
  MoveRight,
  Radar,
  Route,
  ShieldAlert,
  Sparkles
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { InternalEyebrow, InternalMetric, InternalPanel, InternalShell, InternalSubPanel, InternalTopBar } from "../../components/internal-console";
import { getMissionControlSnapshot, statusLabel, type MissionStatus } from "../../lib/mission-control";

export const dynamic = "force-dynamic";

function StatusBadge({ status }: { status: MissionStatus }) {
  const done = status === "done";
  const blocked = status === "blocked";
  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.16em] ${
        done
          ? "border-[#c8f060]/20 bg-[#c8f060]/10 text-[#dff7a8]"
          : blocked
            ? "border-red-400/30 bg-red-500/10 text-red-200"
            : "border-[#b8ff3d]/25 bg-[#b8ff3d]/10 text-[#e7ff9a]"
      }`}
    >
      {statusLabel(status)}
    </span>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
      <div className="h-full rounded-full bg-[linear-gradient(90deg,#b8ff3d,#d7ff72)]" style={{ width: `${Math.max(4, Math.min(100, value))}%` }} />
    </div>
  );
}

export default function MissionControlPage() {
  const snapshot = getMissionControlSnapshot();
  const completedPhases = snapshot.phases.filter((phase) => phase.status === "done").length;
  const readyEnvCount = snapshot.envReady.filter((item) => item.ready).length;

  return (
    <InternalShell>
      <InternalTopBar label="Mission control" />

      <InternalPanel className="overflow-hidden p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="max-w-4xl">
            <InternalEyebrow>Owner console</InternalEyebrow>
            <h1 className="mt-4 max-w-4xl text-5xl font-black leading-[0.9] tracking-[-0.075em] text-[#fbfbf7] md:text-7xl">
              The control tower for building BudCast from concept to launch.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[#d8ded1]">
              Current phase, build health, blockers, local previews, launch checklist, and surface inventory in one
              operating view.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild variant="secondary">
              <Link href="/mission-control/edit">
                <FilePenLine className="mr-2 h-4 w-4" />
                Edit ops
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/mission-control/operations">
                <MonitorCog className="mr-2 h-4 w-4" />
                Operations
              </Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard">
                Brand dashboard
                <MoveRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </InternalPanel>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <InternalMetric detail="Current roadmap state across concept through release." label="Phases complete" value={`${completedPhases}/${snapshot.phases.length}`} />
        <InternalMetric detail={`${snapshot.repoDirtyCount} tracked local changes detected.`} label="Repo branch" value={snapshot.repoBranch} />
        <InternalMetric detail={`${snapshot.webRouteCount} web and ${snapshot.nativeRouteCount} native routes tracked.`} label="Surface count" value={snapshot.webRouteCount + snapshot.nativeRouteCount} />
        <InternalMetric detail="Public runtime keys available for local validation." label="Env readiness" value={`${readyEnvCount}/${snapshot.envReady.length}`} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
        <InternalPanel className="p-5 md:p-7">
          <div className="mb-5 flex items-center gap-3 text-[#fbfbf7]">
            <Radar className="h-5 w-5 text-[#e7ff9a]" />
            <h2 className="text-4xl font-black tracking-[-0.04em]">Progress map</h2>
          </div>
          <div className="space-y-4">
            {snapshot.phases.map((phase) => (
              <InternalSubPanel className="p-5" key={phase.id}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="max-w-2xl">
                    <InternalEyebrow>{phase.title}</InternalEyebrow>
                    <p className="mt-3 text-sm leading-7 text-[#d8ded1]">{phase.summary}</p>
                  </div>
                  <StatusBadge status={phase.status} />
                </div>
                <ProgressBar value={phase.progress} />
                <div className="mt-3 text-sm font-black text-[#fbfbf7]">{phase.progress}% complete</div>
                <div className="mt-4 grid gap-2">
                  {phase.milestones.map((milestone) => (
                    <div className="flex items-start gap-3 text-sm text-[#d8ded1]" key={milestone}>
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#e7ff9a]" />
                      <span>{milestone}</span>
                    </div>
                  ))}
                </div>
              </InternalSubPanel>
            ))}
          </div>
        </InternalPanel>

        <div className="grid gap-5">
          <InternalPanel className="p-5 md:p-7">
            <div className="mb-5 flex items-center gap-3 text-[#fbfbf7]">
              <Boxes className="h-5 w-5 text-[#e7ff9a]" />
              <h2 className="text-3xl font-black tracking-[-0.05em]">Workstreams</h2>
            </div>
            <div className="space-y-3">
              {snapshot.workstreams.map((stream) => (
                <InternalSubPanel className="p-4" key={stream.name}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-base font-black text-[#fbfbf7]">{stream.name}</div>
                    <StatusBadge status={stream.status} />
                  </div>
                  <ProgressBar value={stream.progress} />
                  <p className="mt-3 text-sm leading-7 text-[#c7ccc2]">{stream.detail}</p>
                </InternalSubPanel>
              ))}
            </div>
          </InternalPanel>

          <InternalPanel className="p-5 md:p-7">
            <div className="mb-5 flex items-center gap-3 text-[#fbfbf7]">
              <ClipboardList className="h-5 w-5 text-[#e7ff9a]" />
              <h2 className="text-3xl font-black tracking-[-0.05em]">Build health</h2>
            </div>
            <div className="grid gap-3">
              {snapshot.envReady.map((item) => (
                <InternalSubPanel className="flex items-center justify-between gap-3 p-4" key={item.key}>
                  <div className="text-sm font-black text-[#fbfbf7]">{item.key}</div>
                  <span className={`rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.16em] ${item.ready ? "border-[#c8f060]/20 bg-[#c8f060]/10 text-[#dff7a8]" : "border-red-400/30 bg-red-500/10 text-red-200"}`}>
                    {item.ready ? "Ready" : "Missing"}
                  </span>
                </InternalSubPanel>
              ))}
            </div>

            <InternalEyebrow>Preview links</InternalEyebrow>
            <div className="mt-3 grid gap-3">
              {snapshot.previewLinks.map((link) => (
                <a className="rounded-[20px] border border-white/[0.075] bg-black/25 px-4 py-4 text-sm font-black text-[#fbfbf7] transition hover:border-[#b8ff3d]/30 hover:text-[#e7ff9a]" href={link.href} key={link.href} target="_blank">
                  {link.label}
                  <span className="mt-1 block text-xs uppercase tracking-[0.16em] text-[#7d7068]">{link.href}</span>
                </a>
              ))}
            </div>
          </InternalPanel>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.98fr_1.02fr]">
        <InternalPanel className="p-5 md:p-7">
          <div className="mb-5 flex items-center gap-3 text-[#fbfbf7]">
            <ShieldAlert className="h-5 w-5 text-[#e7ff9a]" />
            <h2 className="text-3xl font-black tracking-[-0.05em]">Current blockers</h2>
          </div>
          <div className="space-y-3">
            {snapshot.blockers.map((blocker) => (
              <div className="rounded-[22px] border border-red-400/30 bg-red-500/10 px-4 py-4 text-sm leading-7 text-red-100" key={blocker}>
                {blocker}
              </div>
            ))}
          </div>

          <InternalEyebrow>Recently changed files</InternalEyebrow>
          <div className="mt-3 grid gap-2">
            {(snapshot.changedFiles.length ? snapshot.changedFiles : ["No local git changes detected."]).map((file) => (
              <div className="rounded-[18px] border border-white/[0.08] bg-black/25 px-4 py-3 font-mono text-xs text-[#c7ccc2]" key={file}>
                {file}
              </div>
            ))}
          </div>
        </InternalPanel>

        <InternalPanel className="p-5 md:p-7">
          <div className="mb-5 flex items-center gap-3 text-[#fbfbf7]">
            <Sparkles className="h-5 w-5 text-[#e7ff9a]" />
            <h2 className="text-3xl font-black tracking-[-0.05em]">Recent progress and next moves</h2>
          </div>
          <div className="space-y-3">
            {snapshot.recentUpdates.map((update) => (
              <InternalSubPanel className="p-4" key={`${update.date}-${update.title}`}>
                <InternalEyebrow>{update.date}</InternalEyebrow>
                <div className="mt-2 text-lg font-black text-[#fbfbf7]">{update.title}</div>
                <p className="mt-2 text-sm leading-7 text-[#c7ccc2]">{update.detail}</p>
              </InternalSubPanel>
            ))}
          </div>

          <InternalEyebrow>Next moves</InternalEyebrow>
          <div className="mt-3 space-y-3">
            {snapshot.nextMoves.map((move) => (
              <div className="flex items-start gap-3 rounded-[20px] border border-white/[0.08] bg-black/25 px-4 py-4 text-sm leading-7 text-[#d8ded1]" key={move}>
                <AlertTriangle className="mt-1 h-4 w-4 text-[#e7ff9a]" />
                <span>{move}</span>
              </div>
            ))}
          </div>
        </InternalPanel>
      </section>

      <InternalPanel className="p-5 md:p-7">
        <div className="mb-5 flex items-center gap-3 text-[#fbfbf7]">
          <Flag className="h-5 w-5 text-[#e7ff9a]" />
          <h2 className="text-3xl font-black tracking-[-0.05em]">Launch checklist</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {snapshot.launchChecklist.map((item) => (
            <InternalSubPanel className="p-5" key={item.name}>
              <div className="flex items-center justify-between gap-3">
                <div className="text-lg font-black text-[#fbfbf7]">{item.name}</div>
                <StatusBadge status={item.status} />
              </div>
              <p className="mt-3 text-sm leading-7 text-[#c7ccc2]">{item.detail}</p>
            </InternalSubPanel>
          ))}
        </div>
      </InternalPanel>

      <InternalPanel className="p-5 md:p-7">
        <div className="mb-5 flex items-center gap-3 text-[#fbfbf7]">
          <Route className="h-5 w-5 text-[#e7ff9a]" />
          <h2 className="text-3xl font-black tracking-[-0.05em]">Surface inventory</h2>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          {[
            ["Web routes", snapshot.webRoutes],
            ["Native routes", snapshot.nativeRoutes]
          ].map(([label, routes]) => (
            <div key={label as string}>
              <InternalEyebrow>{label as string}</InternalEyebrow>
              <div className="mt-3 grid gap-2">
                {(routes as string[]).map((route) => (
                  <div className="rounded-[18px] border border-white/[0.08] bg-black/25 px-4 py-3 font-mono text-xs text-[#c7ccc2]" key={route}>
                    {route}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 text-sm text-[#7d7068]">Snapshot refreshed at {snapshot.now}.</div>
      </InternalPanel>
    </InternalShell>
  );
}
