import Link from "next/link";
import { ArrowLeft, PencilLine } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { InternalEyebrow, InternalPanel, InternalShell, InternalTopBar } from "../../../../components/internal-console";
import {
  getAgentFloorConfigPath,
  getAgentFloorConfigRaw,
  getAgentFloorConfigUpdatedAt
} from "../../../../lib/agent-floor";
import { AgentFloorEditor } from "../editor";

export const dynamic = "force-dynamic";

export default function AgentFloorEditPage() {
  return (
    <InternalShell>
      <InternalTopBar label="BudCast operations editor" />

      <InternalPanel className="p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="max-w-4xl">
            <InternalEyebrow>Manual override</InternalEyebrow>
            <h1 className="mt-4 max-w-4xl text-5xl font-black leading-[0.9] tracking-[-0.075em] text-[#fbfbf7] md:text-7xl">
              Edit the manager, operators, missions, and quality gates.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[#d8ded1]">
              This is curated operations data for the cinematic command table, not customer-facing product data.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild variant="secondary">
              <Link href="/mission-control/operations">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
            <Button asChild>
              <a href="/api/agent-floor" target="_blank">
                <PencilLine className="mr-2 h-4 w-4" />
                Raw JSON
              </a>
            </Button>
          </div>
        </div>
      </InternalPanel>

      <AgentFloorEditor
        configPath={getAgentFloorConfigPath()}
        initialRaw={getAgentFloorConfigRaw()}
        initialUpdatedAt={getAgentFloorConfigUpdatedAt()}
      />
    </InternalShell>
  );
}
