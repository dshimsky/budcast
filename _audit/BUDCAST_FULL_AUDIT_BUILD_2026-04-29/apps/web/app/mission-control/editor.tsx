"use client";

import { useState } from "react";
import Link from "next/link";
import { RotateCcw, Save, ShieldCheck } from "lucide-react";
import { Button } from "../../components/ui/button";
import { InternalEyebrow, InternalPanel, InternalSubPanel } from "../../components/internal-console";

type MissionControlEditorProps = {
  configPath: string;
  initialRaw: string;
  initialUpdatedAt: string;
};

export function MissionControlEditor({
  configPath,
  initialRaw,
  initialUpdatedAt
}: MissionControlEditorProps) {
  const [draft, setDraft] = useState(initialRaw);
  const [savedBaseline, setSavedBaseline] = useState(initialRaw);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState(`Repo-backed config last saved ${initialUpdatedAt}.`);

  const isDirty = draft !== savedBaseline;

  async function handleSave() {
    setStatus("saving");
    setMessage("Saving mission control data...");

    try {
      JSON.parse(draft);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Mission control JSON is invalid.");
      return;
    }

    const response = await fetch("/api/mission-control", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ raw: draft })
    });

    const payload = (await response.json()) as { error?: string; updatedAt?: string };

    if (!response.ok) {
      setStatus("error");
      setMessage(payload.error ?? "Mission control save failed.");
      return;
    }

    setSavedBaseline(draft);
    setStatus("saved");
    setMessage(`Mission control saved locally at ${payload.updatedAt ?? "just now"}.`);
  }

  function handleRestore() {
    setDraft(savedBaseline);
    setStatus("idle");
    setMessage("Restored the last saved mission control state.");
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
      <InternalPanel className="p-5 md:p-7">
        <InternalEyebrow>Ops editor</InternalEyebrow>

        <h2 className="mt-4 text-4xl font-black tracking-[-0.04em] text-[#fbfbf7]">Edit the build operating system without touching app code.</h2>
        <p className="mt-4 max-w-xl text-sm leading-7 text-[#d8ded1]">
          This editor writes directly to the repo-backed mission-control config file. Keep it practical: update phases,
          blockers, next moves, preview links, and launch readiness as the build changes.
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
              <p>Statuses must be `not_started`, `in_progress`, `blocked`, or `done`.</p>
              <p>Progress values should stay between `0` and `100`.</p>
              <p>Use this for roadmap truth, not customer-facing product data.</p>
            </div>
          </InternalSubPanel>
          <div
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
            <Link href="/mission-control">Back to mission control</Link>
          </Button>
          <Button asChild variant="secondary">
            <a href="/api/mission-control" target="_blank">
              Open raw JSON
            </a>
          </Button>
        </div>
      </InternalPanel>

      <InternalPanel className="p-5 md:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <InternalEyebrow>Config JSON</InternalEyebrow>
            <h3 className="mt-2 text-3xl font-black tracking-[-0.05em] text-[#fbfbf7]">Mission control state</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleRestore} type="button" variant="secondary">
              <RotateCcw className="mr-2 h-4 w-4" />
              Restore saved
            </Button>
            <Button disabled={!isDirty || status === "saving"} onClick={handleSave} type="button">
              <Save className="mr-2 h-4 w-4" />
              {status === "saving" ? "Saving..." : "Save ops file"}
            </Button>
          </div>
        </div>

        <textarea
          className="mt-6 min-h-[42rem] w-full rounded-[24px] border border-white/[0.08] bg-black/35 px-4 py-4 font-mono text-xs leading-6 text-[#fbfbf7] outline-none transition focus:border-[#b8ff3d]/45"
          onChange={(event) => {
            setDraft(event.target.value);
            if (status !== "idle") {
              setStatus("idle");
              setMessage("Unsaved mission control changes in progress.");
            }
          }}
          spellCheck={false}
          value={draft}
        />
      </InternalPanel>
    </div>
  );
}
