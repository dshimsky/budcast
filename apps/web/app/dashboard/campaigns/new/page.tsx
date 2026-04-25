"use client";

import Link from "next/link";
import {
  autoInjectComplianceTag,
  formatCampaignType,
  formatCurrency,
  formatDeadline,
  hasCompletedOnboarding,
  selectBalanceAfterPublish,
  selectCanPublish,
  selectCreditCost,
  selectHasInsufficientCredits,
  selectStepMissingFields,
  selectStepStatus,
  selectTotalCreditsRequired,
  STEP_NAMES,
  useAuth,
  useAutosaveDraft,
  useCampaignForm,
  useDrafts,
  usePublishCampaign,
  type CampaignCategory,
  type ContentFormat,
  type PaymentMethod,
  type StepNumber
} from "@budcast/shared";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CircleCheckBig, LoaderCircle, Save, Sparkles, TriangleAlert } from "lucide-react";
import { BrandWorkspaceShell } from "../../../../components/brand-workspace-shell";
import { RouteTransitionScreen } from "../../../../components/route-transition-screen";
import { Eyebrow } from "../../../../components/ui/eyebrow";
import { Button } from "../../../../components/ui/button";
import { LacquerSurface, SmokedPanel } from "../../../../components/ui/surface-tone";

const categories: CampaignCategory[] = [
  "flower",
  "pre_rolls",
  "edibles",
  "vapes",
  "concentrates",
  "topicals",
  "accessories",
  "lifestyle"
];

const contentFormats: ContentFormat[] = [
  "ig_post",
  "ig_reel",
  "ig_story",
  "tiktok_video",
  "tiktok_photo",
  "youtube_short"
];

const paymentMethods: PaymentMethod[] = ["venmo", "zelle", "cashapp", "paypal"];
const inputClassName = "premium-input mt-2";
const textAreaClassName = "premium-textarea mt-2";
const compactInputClassName = "premium-input";
const fieldLabelClassName = "text-sm font-medium text-stone-200";
const detailPanelClassName = "rounded-[24px] border border-white/8 bg-black/20 p-4";

function toDateTimeLocal(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 16);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function StepChip({
  active,
  label,
  onClick,
  status,
  step
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  status: "complete" | "in_progress" | "not_started" | "error";
  step: number;
}) {
  const tone =
    status === "complete"
      ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-100 shadow-[0_18px_44px_rgba(16,185,129,0.12)]"
      : status === "error"
        ? "border-red-400/30 bg-red-500/10 text-red-100"
        : active
          ? "border-[#a48756]/40 bg-[#a48756]/14 text-[#f5efe6] shadow-[0_20px_50px_rgba(0,0,0,0.24)]"
          : "border-white/8 bg-white/[0.03] text-stone-300";

  return (
    <button
      aria-pressed={active}
      className={`flex w-full items-center justify-between rounded-[24px] border px-4 py-4 text-left transition duration-300 hover:-translate-y-0.5 hover:border-white/14 hover:bg-white/[0.05] ${tone}`}
      onClick={onClick}
      type="button"
    >
      <div>
        <div className="text-xs uppercase tracking-[0.22em] text-stone-500">Step {step}</div>
        <div className="mt-1 text-sm font-medium">{label}</div>
      </div>
      {status === "complete" ? <CircleCheckBig className="h-4 w-4" /> : null}
    </button>
  );
}

function ToggleChip({
  active,
  children,
  onClick
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      aria-pressed={active}
      className={`rounded-full px-4 py-2 text-sm transition duration-300 ${
        active
          ? "border border-[#a48756]/40 bg-[#a48756]/14 text-[#f5efe6] shadow-[0_14px_30px_rgba(164,135,86,0.16)]"
          : "border border-white/10 bg-white/[0.04] text-stone-300 hover:-translate-y-0.5 hover:border-white/16 hover:bg-white/[0.06]"
      }`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-stone-500">{children}</div>;
}

function formatMissingFieldList(items: string[]) {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

export default function NewCampaignPage() {
  const router = useRouter();
  const { loading, session, profile } = useAuth();
  const drafts = useDrafts();
  const publishMutation = usePublishCampaign();
  useAutosaveDraft(profile?.user_type === "brand");

  const currentStep = useCampaignForm((state) => state.current_step);
  const state = useCampaignForm();
  const hasHydratedRef = useRef(false);
  const [draftPromptDismissed, setDraftPromptDismissed] = useState(false);
  const [hashtagInput, setHashtagInput] = useState("");
  const [referenceInput, setReferenceInput] = useState("");
  const [publishFeedback, setPublishFeedback] = useState<string | null>(null);
  const [draftFeedback, setDraftFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !session) {
      router.replace("/sign-in");
      return;
    }
    if (!loading && session && !hasCompletedOnboarding(profile)) {
      router.replace("/onboarding");
    }
  }, [loading, profile, router, session]);

  useEffect(() => {
    if (!profile || profile.user_type !== "brand") return;
    if (hasHydratedRef.current) return;
    useCampaignForm.getState().hydrate(null, profile.credits_balance ?? 0);
    hasHydratedRef.current = true;
  }, [profile]);

  const latestDraft = drafts.data?.[0] ?? null;
  const creditCost = selectCreditCost(state);
  const totalCredits = selectTotalCreditsRequired(state);
  const balanceAfter = selectBalanceAfterPublish(state);
  const canPublish = selectCanPublish(state);
  const insufficientCredits = selectHasInsufficientCredits(state);
  const steps = useMemo(
    () =>
      ([1, 2, 3, 4, 5, 6] as StepNumber[]).map((step) => ({
        step,
        label: STEP_NAMES[step],
        status: selectStepStatus(state, step),
        missing: selectStepMissingFields(state, step)
      })),
    [state]
  );
  const unmetRequirements = useMemo(
    () =>
      steps
        .filter(({ step }) => step < 6)
        .flatMap(({ label, missing }) => missing.map((item) => `${label}: ${item}`)),
    [steps]
  );

  async function handleResumeLatestDraft() {
    if (!profile || !latestDraft) return;
    setDraftFeedback(null);
    useCampaignForm.getState().hydrate(latestDraft, profile.credits_balance ?? 0);
    hasHydratedRef.current = true;
    setDraftPromptDismissed(true);
  }

  async function handleDiscardDrafts() {
    try {
      setDraftFeedback(null);
      await drafts.deleteAllDrafts.mutateAsync();
      if (profile) {
        useCampaignForm.getState().hydrate(null, profile.credits_balance ?? 0);
        hasHydratedRef.current = true;
      }
      setDraftPromptDismissed(true);
    } catch (error) {
      setDraftFeedback(error instanceof Error ? error.message : "Failed to discard drafts.");
    }
  }

  async function handlePublish() {
    try {
      setPublishFeedback(null);
      await publishMutation.mutateAsync();
      router.push("/dashboard");
    } catch (error) {
      setPublishFeedback(error instanceof Error ? error.message : "Publish failed.");
    }
  }

  function setCampaignType(type: "gifting" | "paid" | "hybrid") {
    const nextState = {
      ...useCampaignForm.getState(),
      campaign_type: type
    };

    useCampaignForm.getState().patch({
      campaign_type: type,
      required_hashtags: autoInjectComplianceTag(nextState)
    });
    useCampaignForm.getState().setStep(2);
  }

  function updateReferenceImages() {
    if (!referenceInput.trim()) return;
    const next = [...(state.reference_image_urls ?? []), referenceInput.trim()];
    useCampaignForm.getState().patch({ reference_image_urls: next });
    setReferenceInput("");
  }

  const previewHashtags = state.required_hashtags ?? [];

  if (loading || !session) {
    return (
      <RouteTransitionScreen
        eyebrow="Checking session"
        title="Preparing the campaign builder."
        description="BudCast is validating your account before opening the publish workflow."
      />
    );
  }

  if (!hasCompletedOnboarding(profile)) {
    return (
      <RouteTransitionScreen
        eyebrow="Routing to setup"
        title="A few setup details come first."
        description="The campaign builder unlocks after onboarding so creators can see a complete brand profile."
      />
    );
  }

  if (profile?.user_type !== "brand") {
    return (
      <RouteTransitionScreen
        eyebrow="Brand only"
        title="This dashboard is reserved for cannabis brands."
        description="Creators use BudCast to find opportunities. Cannabis brands use this dashboard to publish campaign briefs."
      />
    );
  }

  return (
    <BrandWorkspaceShell>
      <div className="flex flex-col gap-6">
        <LacquerSurface className="overflow-hidden px-7 py-8">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="max-w-3xl">
              <Eyebrow>Campaign builder</Eyebrow>
              <h1 className="mt-3 font-display text-5xl text-[#f5efe6] md:text-6xl">Create a new opportunity</h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-stone-300">
                Create a campaign brief that gives creators clear expectations before it reaches the opportunity feed.
                Keep compensation, deliverables, deadlines, and brand context easy to understand.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {["Premium brief", "Credit-safe publish", "Creator-facing presentation"].map((item, index) => (
                  <div className={`premium-chip ${index === 1 ? "animate-float" : ""}`} key={item}>
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-stone-300">
                <Save className="h-4 w-4 text-[#d7c2a0]" />
                {state.last_saved_at ? `Saved ${new Date(state.last_saved_at).toLocaleTimeString()}` : "Autosave ready"}
              </div>
              <Button asChild variant="secondary">
                <Link href="/dashboard">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to dashboard
                </Link>
              </Button>
            </div>
          </div>
        </LacquerSurface>

        {latestDraft && !state.draft_id && !draftPromptDismissed ? (
          <SmokedPanel className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-[#f5efe6]">Resume latest draft?</div>
                <p className="mt-1 text-sm leading-6 text-stone-300">
                  Found an unfinished draft: <span className="font-medium text-stone-100">{latestDraft.display_title}</span>
                </p>
              </div>
              <div className="flex gap-3">
                <Button onClick={handleResumeLatestDraft} variant="secondary">
                  Resume
                </Button>
                <Button onClick={() => setDraftPromptDismissed(true)} variant="ghost">
                  Start fresh
                </Button>
                <Button onClick={handleDiscardDrafts} variant="ghost">
                  Discard drafts
                </Button>
              </div>
              {draftFeedback ? (
                <div className="basis-full rounded-[24px] border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200" role="alert">
                  {draftFeedback}
                </div>
              ) : null}
            </div>
          </SmokedPanel>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)_360px]">
          <LacquerSurface className="h-fit p-4">
            <div className="mb-4 px-2">
              <Eyebrow>Builder flow</Eyebrow>
              <div className="mt-3 text-2xl font-semibold text-[#f5efe6]">Step control</div>
              <p className="mt-2 text-sm leading-6 text-stone-400">
                Move through the brief in order. Completed sections stay marked, but publish rules remain unchanged.
              </p>
            </div>
            <aside className="space-y-3">
              {steps.map(({ step, label, status }) => (
                <StepChip
                  active={currentStep === step}
                  key={step}
                  label={label}
                  onClick={() => useCampaignForm.getState().setStep(step)}
                  status={status}
                  step={step}
                />
              ))}
            </aside>
          </LacquerSurface>

          <LacquerSurface className="p-8">
            {currentStep === 1 ? (
              <div>
                <Eyebrow>Step 1</Eyebrow>
                <h2 className="mt-2 font-display text-4xl text-[#f5efe6]">Choose campaign type</h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-300">
                  Type determines credit cost, compensation requirements, and locked compliance hashtags.
                </p>
                <div className="mt-6 grid gap-4 lg:grid-cols-3">
                  {(["gifting", "paid", "hybrid"] as const).map((type) => (
                    <button
                      aria-pressed={state.campaign_type === type}
                      className={`rounded-[28px] border p-5 text-left transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.24)] ${
                        state.campaign_type === type
                          ? "border-[#a48756]/40 bg-[#a48756]/12"
                          : "border-white/8 bg-white/[0.04] hover:border-white/14 hover:bg-white/[0.06]"
                      }`}
                      key={type}
                      onClick={() => setCampaignType(type)}
                      type="button"
                    >
                      <div className="text-xs uppercase tracking-[0.18em] text-stone-500">
                        {creditCost === 0 ? `${type}` : ""}
                      </div>
                      <div className="mt-2 text-2xl font-semibold text-[#f5efe6]">
                        {formatCampaignType(type)}
                      </div>
                      <div className="mt-3 text-sm leading-6 text-stone-300">
                        {type === "gifting"
                          ? "Product-only exchange. Lowest credit cost, best for sampling and seeding."
                          : type === "paid"
                            ? "Cash-only creator work. Highest scrutiny and strongest spam resistance."
                            : "Product + cash. Balanced for premium campaigns with selective payment."}
                      </div>
                      <div className="mt-4 text-sm font-medium text-[#d7c2a0]">
                        {type === "gifting" ? "50" : type === "paid" ? "100" : "75"} credits per slot
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {currentStep === 2 ? (
              <div className="space-y-6">
                <div>
                  <Eyebrow>Step 2</Eyebrow>
                  <h2 className="mt-2 font-display text-4xl text-[#f5efe6]">Basics</h2>
                </div>
                <div className="grid gap-4">
                  <label className={fieldLabelClassName}>
                    Title
                    <input
                      className={inputClassName}
                      onChange={(event) => useCampaignForm.getState().patch({ title: event.target.value })}
                      value={state.title ?? ""}
                    />
                  </label>
                  <label className={fieldLabelClassName}>
                    Short description
                    <textarea
                      className={textAreaClassName}
                      onChange={(event) =>
                        useCampaignForm.getState().patch({ short_description: event.target.value })
                      }
                      value={state.short_description ?? ""}
                    />
                  </label>
                  <label className={fieldLabelClassName}>
                    Hero image URL
                    <input
                      className={inputClassName}
                      onChange={(event) => useCampaignForm.getState().patch({ image_url: event.target.value })}
                      value={state.image_url ?? ""}
                    />
                  </label>
                  <div>
                    <SectionLabel>Categories</SectionLabel>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((category) => (
                        <ToggleChip
                          active={(state.categories ?? []).includes(category)}
                          key={category}
                          onClick={() => useCampaignForm.getState().toggleCategory(category)}
                        >
                          {category.replace("_", " ")}
                        </ToggleChip>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {currentStep === 3 ? (
              <div className="space-y-6">
                <div>
                  <Eyebrow>Step 3</Eyebrow>
                  <h2 className="mt-2 font-display text-4xl text-[#f5efe6]">Compensation</h2>
                </div>
                {(state.campaign_type === "paid" || state.campaign_type === "hybrid") ? (
                  <label className={fieldLabelClassName}>
                    Cash amount
                    <input
                      className={inputClassName}
                      min={0}
                      onChange={(event) =>
                        useCampaignForm.getState().patch({
                          cash_amount: Number(event.target.value) || undefined
                        })
                      }
                      type="number"
                      value={state.cash_amount ?? ""}
                    />
                  </label>
                ) : null}
                {state.campaign_type !== "gifting" ? (
                  <div>
                    <SectionLabel>Payment methods</SectionLabel>
                    <div className="flex flex-wrap gap-2">
                      {paymentMethods.map((method) => (
                        <ToggleChip
                          active={(state.payment_methods ?? []).includes(method)}
                          key={method}
                          onClick={() => useCampaignForm.getState().togglePaymentMethod(method)}
                        >
                          {method}
                        </ToggleChip>
                      ))}
                    </div>
                  </div>
                ) : null}
                {(state.campaign_type === "gifting" || state.campaign_type === "hybrid") ? (
                  <label className={fieldLabelClassName}>
                    Product description
                    <textarea
                      className={textAreaClassName}
                      onChange={(event) =>
                        useCampaignForm.getState().patch({ product_description: event.target.value })
                      }
                      value={state.product_description ?? ""}
                    />
                  </label>
                ) : null}
              </div>
            ) : null}

            {currentStep === 4 ? (
              <div className="space-y-6">
                <div>
                  <Eyebrow>Step 4</Eyebrow>
                  <h2 className="mt-2 font-display text-4xl text-[#f5efe6]">Creative brief</h2>
                </div>
                <div>
                  <SectionLabel>Required content formats</SectionLabel>
                  <div className="flex flex-wrap gap-2">
                    {contentFormats.map((format) => (
                      <ToggleChip
                        active={(state.content_types ?? []).includes(format)}
                        key={format}
                        onClick={() => useCampaignForm.getState().toggleContentFormat(format)}
                      >
                        {format.replaceAll("_", " ")}
                      </ToggleChip>
                    ))}
                  </div>
                </div>
                <label className={fieldLabelClassName}>
                  Brand mention
                  <input
                    className={inputClassName}
                    onChange={(event) => useCampaignForm.getState().patch({ brand_mention: event.target.value })}
                    value={state.brand_mention ?? ""}
                  />
                </label>
                <label className={fieldLabelClassName}>
                  Campaign brief
                  <textarea
                    className={textAreaClassName}
                    onChange={(event) => useCampaignForm.getState().patch({ description: event.target.value })}
                    value={state.description ?? ""}
                  />
                </label>

                <div>
                  <SectionLabel>Required hashtags</SectionLabel>
                  <div className="mb-3 flex flex-wrap gap-2">
                    {previewHashtags.map((tag) => {
                      const locked =
                        (tag === "#ad" && (state.campaign_type === "paid" || state.campaign_type === "hybrid")) ||
                        (tag === "#gifted" &&
                          (state.campaign_type === "gifting" || state.campaign_type === "hybrid"));
                      return (
                        <button
                          className={`rounded-full px-4 py-2 text-sm ${
                            locked
                              ? "border border-white/8 bg-black/20 text-stone-500"
                              : "border border-white/10 bg-white/[0.05] text-stone-200"
                          }`}
                          disabled={locked}
                          key={tag}
                          onClick={() => useCampaignForm.getState().removeHashtag(tag)}
                          type="button"
                        >
                          {tag} {locked ? "locked" : "remove"}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex gap-3">
                    <input
                      className={compactInputClassName}
                      onChange={(event) => setHashtagInput(event.target.value)}
                      value={hashtagInput}
                    />
                    <Button
                      onClick={() => {
                        useCampaignForm.getState().addHashtag(hashtagInput);
                        setHashtagInput("");
                      }}
                      variant="secondary"
                    >
                      Add
                    </Button>
                  </div>
                </div>

                <div>
                  <SectionLabel>Must include</SectionLabel>
                  <div className="space-y-3">
                    {(state.must_includes ?? []).map((item, index) => (
                      <div className="flex gap-3" key={`must-${index}`}>
                        <input
                          className={compactInputClassName}
                          onChange={(event) =>
                            useCampaignForm.getState().updateBullet(
                              "must_includes",
                              index,
                              event.target.value
                            )
                          }
                          value={item}
                        />
                        <Button
                          onClick={() => useCampaignForm.getState().removeBullet("must_includes", index)}
                          variant="ghost"
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button onClick={() => useCampaignForm.getState().addBullet("must_includes")} variant="secondary">
                      Add talking point
                    </Button>
                  </div>
                </div>

                <div>
                  <SectionLabel>Off limits</SectionLabel>
                  <div className="space-y-3">
                    {(state.off_limits ?? []).map((item, index) => (
                      <div className="flex gap-3" key={`off-${index}`}>
                        <input
                          className={compactInputClassName}
                          onChange={(event) =>
                            useCampaignForm.getState().updateBullet("off_limits", index, event.target.value)
                          }
                          value={item}
                        />
                        <Button
                          onClick={() => useCampaignForm.getState().removeBullet("off_limits", index)}
                          variant="ghost"
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button onClick={() => useCampaignForm.getState().addBullet("off_limits")} variant="secondary">
                      Add restriction
                    </Button>
                  </div>
                </div>

                <div>
                  <SectionLabel>Reference image URLs</SectionLabel>
                  <div className="mb-3 flex flex-wrap gap-2">
                    {(state.reference_image_urls ?? []).map((url) => (
                      <div className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-stone-300" key={url}>
                        {url}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <input
                      className={compactInputClassName}
                      onChange={(event) => setReferenceInput(event.target.value)}
                      value={referenceInput}
                    />
                    <Button onClick={updateReferenceImages} variant="secondary">
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}

            {currentStep === 5 ? (
              <div className="space-y-6">
                <div>
                  <Eyebrow>Step 5</Eyebrow>
                  <h2 className="mt-2 font-display text-4xl text-[#f5efe6]">Slots & timing</h2>
                </div>
                <label className={fieldLabelClassName}>
                  Slots available
                  <input
                    className={inputClassName}
                    min={1}
                    onChange={(event) =>
                      useCampaignForm.getState().patch({
                        slots_available: Number(event.target.value) || 1
                      })
                    }
                    type="number"
                    value={state.slots_available ?? 1}
                  />
                </label>
                <label className={fieldLabelClassName}>
                  Application deadline
                  <input
                    className={inputClassName}
                    onChange={(event) =>
                      useCampaignForm.getState().patch({ application_deadline: event.target.value })
                    }
                    type="datetime-local"
                    value={toDateTimeLocal(state.application_deadline)}
                  />
                  <div className="mt-2 text-xs leading-6 text-stone-500">
                    BudCast seeds this seven days out so publish is never blocked by an invisible blank state. Adjust it
                    before launch if the campaign window should close sooner.
                  </div>
                </label>
                <div>
                  <SectionLabel>Approval mode</SectionLabel>
                  <div className="flex gap-3">
                    <ToggleChip
                      active={state.approval_mode === "manual"}
                      onClick={() => useCampaignForm.getState().patch({ approval_mode: "manual" })}
                    >
                      Manual
                    </ToggleChip>
                    <ToggleChip
                      active={state.approval_mode === "auto"}
                      onClick={() => useCampaignForm.getState().patch({ approval_mode: "auto" })}
                    >
                      Auto
                    </ToggleChip>
                  </div>
                </div>
                {insufficientCredits ? (
                  <div className="rounded-[24px] border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
                    Not enough credits. You are short by {Math.abs(balanceAfter)}.
                  </div>
                ) : null}
              </div>
            ) : null}

            {currentStep === 6 ? (
              <div className="space-y-6">
                <div>
                  <Eyebrow>Step 6</Eyebrow>
                  <h2 className="mt-2 font-display text-4xl text-[#f5efe6]">Review & publish</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className={detailPanelClassName}>
                    <div className="text-sm font-medium text-stone-500">Campaign type</div>
                    <div className="mt-2 text-lg font-semibold text-[#f5efe6]">
                      {state.campaign_type ? formatCampaignType(state.campaign_type) : "Not set"}
                    </div>
                  </div>
                  <div className={detailPanelClassName}>
                    <div className="text-sm font-medium text-stone-500">Credits reserved</div>
                    <div className="mt-2 text-lg font-semibold text-[#f5efe6]">{totalCredits}</div>
                  </div>
                  <div className={detailPanelClassName}>
                    <div className="text-sm font-medium text-stone-500">Slots</div>
                    <div className="mt-2 text-lg font-semibold text-[#f5efe6]">{state.slots_available ?? 1}</div>
                  </div>
                  <div className={detailPanelClassName}>
                    <div className="text-sm font-medium text-stone-500">Balance after publish</div>
                    <div className="mt-2 text-lg font-semibold text-[#f5efe6]">{balanceAfter}</div>
                  </div>
                </div>
                <div className={detailPanelClassName}>
                  <div className="text-sm font-medium text-stone-500">Final validation</div>
                  <div className="mt-3 space-y-2 text-sm text-stone-300">
                    {steps.slice(0, 5).map(({ step, label, status, missing }) => (
                      <div key={step}>
                        <div className="flex items-center justify-between">
                          <span>{label}</span>
                          <span
                            className={`capitalize ${
                              status === "complete"
                                ? "text-emerald-200"
                                : status === "error"
                                  ? "text-red-200"
                                  : "text-stone-400"
                            }`}
                          >
                            {status.replace("_", " ")}
                          </span>
                        </div>
                        {missing.length > 0 ? (
                          <div className="mt-1 text-xs leading-6 text-stone-500">
                            Missing: {formatMissingFieldList(missing)}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
                {publishFeedback ? (
                  <div className="rounded-[24px] border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200" role="alert">
                    {publishFeedback}
                  </div>
                ) : null}
                <div className="flex flex-wrap gap-3">
                  <Button
                    disabled={!canPublish || publishMutation.isPending}
                    onClick={handlePublish}
                  >
                    {publishMutation.isPending ? (
                      <>
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      "Publish campaign"
                    )}
                  </Button>
                  {!canPublish ? (
                    <div className="rounded-[24px] border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
                      <div className="flex items-center gap-2">
                        <TriangleAlert className="h-4 w-4" />
                        Complete all steps before publish.
                      </div>
                      {unmetRequirements.length > 0 ? (
                        <div className="mt-2 text-xs leading-6 text-amber-100/80">
                          {unmetRequirements.join(" • ")}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}

            {currentStep > 1 && currentStep < 6 ? (
              <div className="mt-8 flex items-center justify-between border-t border-white/8 pt-6">
                <Button
                  onClick={() => useCampaignForm.getState().setStep((currentStep - 1) as StepNumber)}
                  variant="secondary"
                >
                  Back
                </Button>
                <Button
                  onClick={() => useCampaignForm.getState().setStep((currentStep + 1) as StepNumber)}
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ) : null}
          </LacquerSurface>

          <LacquerSurface className="p-6">
            <div className="flex items-center gap-2 text-[#d7c2a0]">
              <Sparkles className="h-4 w-4" />
              <Eyebrow>Live preview</Eyebrow>
            </div>
            <h2 className="mt-2 font-display text-4xl text-[#f5efe6]">
              {state.title?.trim() || "Untitled campaign"}
            </h2>
            <p className="mt-3 text-sm leading-6 text-stone-300">
              {state.short_description?.trim() ||
                "This card previews how your campaign is shaping up while autosave keeps the draft warm."}
            </p>

            <div className="mt-6 space-y-4">
              <div className={detailPanelClassName}>
                <div className="text-sm font-medium text-stone-500">Campaign type</div>
                <div className="mt-2 text-lg font-semibold text-[#f5efe6]">
                  {state.campaign_type ? formatCampaignType(state.campaign_type) : "Choose a type"}
                </div>
              </div>
              <div className={detailPanelClassName}>
                <div className="text-sm font-medium text-stone-500">Compensation snapshot</div>
                <div className="mt-2 text-lg font-semibold text-[#f5efe6]">
                  {state.cash_amount ? formatCurrency(state.cash_amount) : "No cash set"}
                </div>
                <div className="mt-1 text-sm text-stone-400">
                  {state.product_description?.trim() || "No product details yet"}
                </div>
              </div>
              <div className={detailPanelClassName}>
                <div className="text-sm font-medium text-stone-500">Credits</div>
                <div className="mt-2 text-lg font-semibold text-[#f5efe6]">
                  {creditCost} / slot • {totalCredits} total
                </div>
                <div className="mt-1 text-sm text-stone-400">
                  Balance after publish: {balanceAfter}
                </div>
              </div>
              <div className={detailPanelClassName}>
                <div className="text-sm font-medium text-stone-500">Deadline</div>
                <div className="mt-2 text-lg font-semibold text-[#f5efe6]">
                  {formatDeadline(state.application_deadline)}
                </div>
              </div>
              <div className={detailPanelClassName}>
                <div className="text-sm font-medium text-stone-500">Compliance</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {previewHashtags.length > 0 ? (
                    previewHashtags.map((tag) => (
                      <div className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-sm text-stone-200" key={tag}>
                        {tag}
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-stone-400">No hashtags yet.</div>
                  )}
                </div>
              </div>
            </div>
          </LacquerSurface>
        </section>
      </div>
    </BrandWorkspaceShell>
  );
}
