"use client";

import { useState } from "react";
import Link from "next/link";
import { RotateCcw, Save, ShieldCheck } from "lucide-react";
import { Button } from "../../../components/ui/button";

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
    let payload: { error?: string; updatedAt?: string };

    try {
      response = await fetch("/api/agent-floor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw: draft })
      });
      payload = (await response.json()) as { error?: string; updatedAt?: string };
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "BudCast Operations save failed.");
      return;
    }

    if (!response.ok) {
      setStatus("error");
      setMessage(payload.error ?? "BudCast Operations save failed.");
      return;
    }

    setSavedBaseline(draft);
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
      <section className="soft-panel p-8">
        <div className="premium-badge">
          <span className="signal-dot" />
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-surface-500">Operations Editor</div>
            <div className="text-sm font-medium text-surface-900">
              Curated command-table data, local save, no backend dependency
            </div>
          </div>
        </div>

        <h2 className="mt-6 font-display text-4xl text-surface-900">
          Edit the cinematic operating room without touching product code.
        </h2>
        <p className="mt-4 max-w-xl text-sm leading-7 text-surface-700">
          This editor writes directly to the repo-backed Agent Floor config file. Use it for mission status,
          operators, model rationale, blockers, and verified build evidence.
        </p>

        <div className="mt-6 space-y-4">
          <div className="rounded-[22px] border border-white/80 bg-white/76 p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-surface-500">Tracked file</div>
            <div className="mt-2 break-all font-mono text-xs text-surface-700">{configPath}</div>
          </div>
          <div className="rounded-[22px] border border-white/80 bg-white/76 p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-surface-500">Editing guidance</div>
            <div className="mt-2 space-y-2 text-sm leading-7 text-surface-700">
              <p>Keep valid JSON.</p>
              <p>Status values must match the allowed Agent Floor statuses.</p>
              <p>Use `verification` for command evidence or review results.</p>
              <p>Use this for curated operations truth, not customer-facing product data.</p>
            </div>
          </div>
          <div
            aria-live="polite"
            className={`rounded-[22px] border px-4 py-4 text-sm leading-7 ${
              status === "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : status === "saved"
                  ? "border-herb-200 bg-herb-50 text-herb-800"
                  : "border-white/80 bg-white/76 text-surface-700"
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
      </section>

      <section className="soft-panel p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] text-surface-500">Config JSON</div>
            <h3 className="mt-2 font-display text-3xl text-surface-900" id="agent-floor-json-heading">
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
          className="premium-textarea mt-6 min-h-[42rem] font-mono text-xs leading-6 text-surface-900"
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
      </section>
    </div>
  );
}
