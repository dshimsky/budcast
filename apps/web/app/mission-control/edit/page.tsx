import Link from "next/link";
import { ArrowLeft, PencilLine } from "lucide-react";
import { Button } from "../../../components/ui/button";
import {
  getMissionControlConfigPath,
  getMissionControlConfigRaw,
  getMissionControlConfigUpdatedAt
} from "../../../lib/mission-control";
import { MissionControlEditor } from "../editor";

export const dynamic = "force-dynamic";

export default function MissionControlEditPage() {
  return (
    <main className="grid-overlay min-h-screen px-6 py-8 md:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <header className="hero-orbit overflow-hidden rounded-[34px] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(255,248,240,0.72))] px-6 py-6 shadow-[0_24px_70px_rgba(33,27,20,0.1)] backdrop-blur">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="max-w-3xl">
              <div className="premium-badge">
                <span className="signal-dot" />
                <div>
                  <div className="text-xs uppercase tracking-[0.3em] text-surface-500">Mission Control Editor</div>
                  <div className="text-sm font-medium text-surface-900">Owner-facing roadmap and ops data</div>
                </div>
              </div>
              <h1 className="mt-6 font-display text-5xl text-surface-900 md:text-6xl">
                The control panel for the control tower.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-surface-700">
                Update the tracked build plan locally, save it into the repo, and keep the operational view aligned
                with what BudCast actually is right now.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild variant="secondary">
                <Link href="/mission-control">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to dashboard
                </Link>
              </Button>
              <Button asChild>
                <a href="/api/mission-control" target="_blank">
                  <PencilLine className="mr-2 h-4 w-4" />
                  View raw JSON
                </a>
              </Button>
            </div>
          </div>
        </header>

        <MissionControlEditor
          configPath={getMissionControlConfigPath()}
          initialRaw={getMissionControlConfigRaw()}
          initialUpdatedAt={getMissionControlConfigUpdatedAt()}
        />
      </div>
    </main>
  );
}
