"use client";

import { useState } from "react";
import Link from "next/link";
import { RotateCcw, Save, ShieldCheck } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { InternalEyebrow, InternalPanel, InternalSubPanel } from "../../../components/internal-console";

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

    let response: Response;
    let payload: { error?: string; details?: string[]; raw?: string; updatedAt?: string };

    try {
      response = await fetch("/api/agent-floor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw: draft })
      });
      payload = (await response.json()) as { error?: string; details?: string[]; raw?: string; updatedAt?: string };
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "BudCast Operations save failed.");
      return;
    }

    if (!response.ok) {
      setStatus("error");
      const detailText = payload.details?.length ? ` ${payload.details.slice(0, 4).join(" ")}` : "";
      setMessage(`${payload.error ?? "BudCast Operations save failed."}${detailText}`);
      return;
    }

    const savedRaw = payload.raw ?? draft;
    setDraft(savedRaw);
    setSavedBaseline(savedRaw);
    setStatus("saved");
    setMessage(`BudCast Operations saved locally at ${payload.updatedAt ?? "just now"}.`);
  }

  function handleRestore() {
    setDraft(savedBaseline);
    setStatus("idle");
    setMessage("Restored the last saved BudCast Operations state.");
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
      <InternalPanel className="p-5 md:p-7">
        <InternalEyebrow>Operations editor</InternalEyebrow>

        <h2 className="mt-4 text-4xl font-black tracking-[-0.04em] text-[#fbfbf7]">
          Edit the cinematic operating room without touching product code.
        </h2>
        <p className="mt-4 max-w-xl text-sm leading-7 text-[#d8ded1]">
          This editor writes directly to the repo-backed Agent Floor config file. Use it for mission status,
          operators, model rationale, blockers, and verified build evidence.
        </p>

        <div className="mt-6 space-y-4">
          <InternalSubPanel className="p-4">
            <InternalEyebrow>Tracked file</InternalEyebrow>
            <div className="mt-2 break-all font-mono text-xs text-[#c7ccc2]">{configPath}</div>
          </InternalSubPanel>
          <InternalSubPanel className="p-4">
            <InternalEyebrow>Editing guidance</InternalEyebrow>
            <div className="mt-2 space-y-2 text-sm leading-7 text-[#d8ded1]">
              <p>Keep valid JSON.</p>
              <p>Status values must match the allowed Agent Floor statuses.</p>
              <p>Use `verification` for command evidence or review results.</p>
              <p>Use this for curated operations truth, not customer-facing product data.</p>
            </div>
          </InternalSubPanel>
          <div
            aria-live="polite"
            className={`rounded-[22px] border px-4 py-4 text-sm leading-7 ${
              status === "error"
                ? "border-red-400/30 bg-red-500/10 text-red-100"
                : status === "saved"
                  ? "border-[#c8f060]/20 bg-[#c8f060]/10 text-[#dff7a8]"
                  : "border-white/[0.08] bg-black/25 text-[#d8ded1]"
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
      </InternalPanel>

      <InternalPanel className="p-5 md:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <InternalEyebrow>Config JSON</InternalEyebrow>
            <h3 className="mt-2 text-3xl font-black tracking-[-0.05em] text-[#fbfbf7]" id="agent-floor-json-heading">
              Agent Floor state
            </h3>
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
          aria-labelledby="agent-floor-json-heading"
          className="mt-6 min-h-[42rem] w-full rounded-[24px] border border-white/[0.08] bg-black/35 px-4 py-4 font-mono text-xs leading-6 text-[#fbfbf7] outline-none transition focus:border-[#b8ff3d]/45"
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
      </InternalPanel>
    </div>
  );
}
