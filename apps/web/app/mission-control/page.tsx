import Link from "next/link";
import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  ClipboardList,
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
import { Card } from "../../components/ui/card";
import {
  getMissionControlSnapshot,
  statusLabel,
  statusTone
} from "../../lib/mission-control";

export const dynamic = "force-dynamic";

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-100">
      <div
        className="h-full rounded-full bg-gradient-to-r from-herb-700 via-herb-600 to-herb-500"
        style={{ width: `${Math.max(4, Math.min(100, value))}%` }}
      />
    </div>
  );
}

export default function MissionControlPage() {
  const snapshot = getMissionControlSnapshot();
  const completedPhases = snapshot.phases.filter((phase) => phase.status === "done").length;
  const readyEnvCount = snapshot.envReady.filter((item) => item.ready).length;

  return (
    <main className="grid-overlay min-h-screen px-6 py-8 md:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <header className="hero-orbit overflow-hidden rounded-[34px] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(255,248,240,0.72))] px-6 py-6 shadow-[0_24px_70px_rgba(33,27,20,0.1)] backdrop-blur">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="max-w-3xl">
              <div className="premium-badge">
                <span className="signal-dot" />
                <div>
                  <div className="text-xs uppercase tracking-[0.3em] text-surface-500">Mission Control</div>
                  <div className="text-sm font-medium text-surface-900">Owner console for the BudCast build</div>
                </div>
              </div>
              <h1 className="mt-6 font-display text-5xl text-surface-900 md:text-6xl">
                The local control tower for everything between concept and launch.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-surface-700">
                This is the boss view: current phase, workstream status, recent shipments, blockers, and local build
                health in one place while BudCast is being built.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {["Phase tracking", "Build health", "Blockers", "Next moves"].map((item, index) => (
                  <div className={`premium-chip ${index === 1 ? "animate-float" : ""}`} key={item}>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild variant="secondary">
                <Link href="/">Marketplace</Link>
              </Button>
              <Button asChild variant="secondary">
                <a href="http://127.0.0.1:8090/creator-preview.html" target="_blank">
                  Creator preview
                </a>
              </Button>
              <Button asChild>
                <Link href="/dashboard">
                  Brand dashboard
                  <MoveRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </header>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <Card className="sheen p-6">
            <div className="flex items-center gap-3 text-herb-700">
              <Flag className="h-5 w-5" />
              <span className="text-sm font-medium uppercase tracking-[0.18em]">Phases complete</span>
            </div>
            <div className="mt-5 text-4xl font-semibold text-surface-900">
              {completedPhases}/{snapshot.phases.length}
            </div>
            <p className="mt-2 text-sm text-surface-600">Current roadmap state across concept through release.</p>
          </Card>

          <Card className="sheen p-6">
            <div className="flex items-center gap-3 text-herb-700">
              <GitBranch className="h-5 w-5" />
              <span className="text-sm font-medium uppercase tracking-[0.18em]">Repo branch</span>
            </div>
            <div className="mt-5 text-3xl font-semibold text-surface-900">{snapshot.repoBranch}</div>
            <p className="mt-2 text-sm text-surface-600">{snapshot.repoDirtyCount} tracked local changes detected.</p>
          </Card>

          <Card className="sheen p-6">
            <div className="flex items-center gap-3 text-herb-700">
              <Route className="h-5 w-5" />
              <span className="text-sm font-medium uppercase tracking-[0.18em]">Surface count</span>
            </div>
            <div className="mt-5 text-4xl font-semibold text-surface-900">
              {snapshot.webRouteCount + snapshot.nativeRouteCount}
            </div>
            <p className="mt-2 text-sm text-surface-600">
              {snapshot.webRouteCount} web routes and {snapshot.nativeRouteCount} native routes tracked.
            </p>
          </Card>

          <Card className="sheen p-6">
            <div className="flex items-center gap-3 text-herb-700">
              <MonitorCog className="h-5 w-5" />
              <span className="text-sm font-medium uppercase tracking-[0.18em]">Env readiness</span>
            </div>
            <div className="mt-5 text-4xl font-semibold text-surface-900">
              {readyEnvCount}/{snapshot.envReady.length}
            </div>
            <p className="mt-2 text-sm text-surface-600">Public runtime keys available for local live validation.</p>
          </Card>
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
          <Card className="soft-panel p-8">
            <div className="mb-6 flex items-center gap-3 text-surface-900">
              <Radar className="h-5 w-5 text-herb-700" />
              <h2 className="font-display text-4xl">Progress Map</h2>
            </div>
            <div className="space-y-5">
              {snapshot.phases.map((phase) => (
                <div
                  className="rounded-[26px] border border-white/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.86),rgba(251,248,244,0.72))] p-5"
                  key={phase.id}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="max-w-2xl">
                      <div className="text-xs uppercase tracking-[0.2em] text-surface-500">{phase.title}</div>
                      <p className="mt-3 text-sm leading-7 text-surface-700">{phase.summary}</p>
                    </div>
                    <div className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.18em] ${statusTone(phase.status)}`}>
                      {statusLabel(phase.status)}
                    </div>
                  </div>
                  <ProgressBar value={phase.progress} />
                  <div className="mt-3 text-sm font-medium text-surface-700">{phase.progress}% complete</div>
                  <div className="mt-4 grid gap-2">
                    {phase.milestones.map((milestone) => (
                      <div className="flex items-start gap-3 text-sm text-surface-700" key={milestone}>
                        <CheckCircle2 className="mt-0.5 h-4 w-4 text-herb-700" />
                        <span>{milestone}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid gap-5">
            <Card className="soft-panel p-8">
              <div className="mb-5 flex items-center gap-3 text-surface-900">
                <Boxes className="h-5 w-5 text-herb-700" />
                <h2 className="font-display text-3xl">Workstreams</h2>
              </div>
              <div className="space-y-4">
                {snapshot.workstreams.map((stream) => (
                  <div className="rounded-[22px] border border-white/80 bg-white/76 p-4" key={stream.name}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-base font-semibold text-surface-900">{stream.name}</div>
                      <div className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.18em] ${statusTone(stream.status)}`}>
                        {statusLabel(stream.status)}
                      </div>
                    </div>
                    <ProgressBar value={stream.progress} />
                    <p className="mt-3 text-sm leading-7 text-surface-700">{stream.detail}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="soft-panel p-8">
              <div className="mb-5 flex items-center gap-3 text-surface-900">
                <ClipboardList className="h-5 w-5 text-herb-700" />
                <h2 className="font-display text-3xl">Build Health</h2>
              </div>
              <div className="grid gap-3">
                {snapshot.envReady.map((item) => (
                  <div className="rounded-[20px] border border-white/80 bg-white/76 px-4 py-4" key={item.key}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-medium text-surface-900">{item.key}</div>
                      <div className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.18em] ${item.ready ? "text-herb-800 bg-herb-50 border-herb-200" : "text-red-700 bg-red-50 border-red-200"}`}>
                        {item.ready ? "Ready" : "Missing"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 text-xs uppercase tracking-[0.22em] text-surface-500">Preview links</div>
              <div className="mt-3 grid gap-3">
                {snapshot.previewLinks.map((link) => (
                  <a
                    className="rounded-[20px] border border-white/80 bg-white/76 px-4 py-4 text-sm font-medium text-surface-900 transition hover:-translate-y-0.5 hover:shadow-[0_16px_38px_rgba(33,27,20,0.08)]"
                    href={link.href}
                    key={link.href}
                    target="_blank"
                  >
                    {link.label}
                    <span className="mt-1 block text-xs uppercase tracking-[0.18em] text-surface-500">{link.href}</span>
                  </a>
                ))}
              </div>
            </Card>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[0.98fr_1.02fr]">
          <Card className="soft-panel p-8">
            <div className="mb-5 flex items-center gap-3 text-surface-900">
              <ShieldAlert className="h-5 w-5 text-herb-700" />
              <h2 className="font-display text-3xl">Current Blockers</h2>
            </div>
            <div className="space-y-3">
              {snapshot.blockers.map((blocker) => (
                <div className="rounded-[22px] border border-red-200 bg-red-50 px-4 py-4 text-sm leading-7 text-red-700" key={blocker}>
                  {blocker}
                </div>
              ))}
            </div>

            <div className="mt-6 text-xs uppercase tracking-[0.22em] text-surface-500">Recently changed files</div>
            <div className="mt-3 grid gap-2">
              {snapshot.changedFiles.length > 0 ? (
                snapshot.changedFiles.map((file) => (
                  <div className="rounded-[18px] border border-white/80 bg-white/76 px-4 py-3 font-mono text-xs text-surface-700" key={file}>
                    {file}
                  </div>
                ))
              ) : (
                <div className="rounded-[18px] border border-white/80 bg-white/76 px-4 py-3 text-sm text-surface-700">
                  No local git changes detected.
                </div>
              )}
            </div>
          </Card>

          <Card className="soft-panel p-8">
            <div className="mb-5 flex items-center gap-3 text-surface-900">
              <Sparkles className="h-5 w-5 text-herb-700" />
              <h2 className="font-display text-3xl">Recent Progress And Next Moves</h2>
            </div>
            <div className="space-y-4">
              {snapshot.recentUpdates.map((update) => (
                <div className="rounded-[22px] border border-white/80 bg-white/76 p-4" key={`${update.date}-${update.title}`}>
                  <div className="text-xs uppercase tracking-[0.2em] text-surface-500">{update.date}</div>
                  <div className="mt-2 text-lg font-semibold text-surface-900">{update.title}</div>
                  <p className="mt-2 text-sm leading-7 text-surface-700">{update.detail}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 text-xs uppercase tracking-[0.22em] text-surface-500">Next moves</div>
            <div className="mt-3 space-y-3">
              {snapshot.nextMoves.map((move) => (
                <div className="flex items-start gap-3 rounded-[20px] border border-white/80 bg-white/76 px-4 py-4 text-sm leading-7 text-surface-700" key={move}>
                  <AlertTriangle className="mt-1 h-4 w-4 text-herb-700" />
                  <span>{move}</span>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <Card className="soft-panel p-8">
          <div className="mb-5 flex items-center gap-3 text-surface-900">
            <Flag className="h-5 w-5 text-herb-700" />
            <h2 className="font-display text-3xl">Launch Checklist</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {snapshot.launchChecklist.map((item) => (
              <div className="rounded-[24px] border border-white/80 bg-white/76 p-5" key={item.name}>
                <div className="flex items-center justify-between gap-3">
                  <div className="text-lg font-semibold text-surface-900">{item.name}</div>
                  <div className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.18em] ${statusTone(item.status)}`}>
                    {statusLabel(item.status)}
                  </div>
                </div>
                <p className="mt-3 text-sm leading-7 text-surface-700">{item.detail}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="soft-panel p-8">
          <div className="mb-5 flex items-center gap-3 text-surface-900">
            <Route className="h-5 w-5 text-herb-700" />
            <h2 className="font-display text-3xl">Surface Inventory</h2>
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-surface-500">Web routes</div>
              <div className="mt-3 grid gap-2">
                {snapshot.webRoutes.map((route) => (
                  <div className="rounded-[18px] border border-white/80 bg-white/76 px-4 py-3 font-mono text-xs text-surface-700" key={route}>
                    {route}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-surface-500">Native routes</div>
              <div className="mt-3 grid gap-2">
                {snapshot.nativeRoutes.map((route) => (
                  <div className="rounded-[18px] border border-white/80 bg-white/76 px-4 py-3 font-mono text-xs text-surface-700" key={route}>
                    {route}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-6 text-sm text-surface-500">Snapshot refreshed at {snapshot.now}.</div>
        </Card>
      </div>
    </main>
  );
}
