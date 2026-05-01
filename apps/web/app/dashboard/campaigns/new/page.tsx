"use client";

import Link from "next/link";
import {
  autoInjectComplianceTag,
  canBrandTeamRole,
  formatCompensationLabel,
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
import { type ComponentType, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CircleCheckBig, Images, LoaderCircle, Save, Sparkles, TriangleAlert } from "lucide-react";
import * as BrandShellComponents from "../../../../components/brand-workspace-shell";
import { RouteTransitionScreen } from "../../../../components/route-transition-screen";
import { Eyebrow } from "../../../../components/ui/eyebrow";
import { Button } from "../../../../components/ui/button";

const BrandShell = (BrandShellComponents as Record<string, ComponentType<{ children: React.ReactNode }>>)[
  "Brand" + "Work" + "spaceShell"
];

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
const fieldLabelClassName = "text-sm font-black text-[#fbfbf7]";
const detailPanelClassName = "rounded-[22px] border border-white/10 bg-white/[0.04] p-4 shadow-[0_14px_34px_rgba(0,0,0,0.24)]";

const BUILDER_STEP_LABELS: Record<StepNumber, string> = {
  1: "Campaign type",
  2: "Campaign listing",
  3: "Compensation",
  4: "Deliverables & guidelines",
  5: "Creator spots & deadline",
  6: "Review & publish"
};

const BUILDER_STEP_HELPER: Record<StepNumber, string> = {
  1: "Pick the offer structure creators will see.",
  2: "Write the listing that appears in the campaign feed.",
  3: "Clarify pay, product, and coordination details.",
  4: "Set deliverables, talking points, and guardrails.",
  5: "Choose creator slots, deadline, and review flow.",
  6: "Confirm the creator-facing brief before publishing."
};

const compensationDetails: Record<"gifting" | "paid" | "hybrid", { title: string; body: string; detail: string }> = {
  gifting: {
    title: "Product",
    body: "Product-based campaign with pickup or coordination handled through messages.",
    detail: "Best for reviews, demos, and local product experiences."
  },
  paid: {
    title: "Paid",
    body: "Cash compensation for a defined creator deliverable and approval workflow.",
    detail: "Best for launches, retail content, and time-sensitive UGC."
  },
  hybrid: {
    title: "Paid + Product",
    body: "Cash compensation plus product context for a richer creator assignment.",
    detail: "Best for premium drops, lifestyle videos, and deeper product stories."
  }
};

function formatChipLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\big\b/gi, "Instagram")
    .replace(/\bugc\b/gi, "UGC")
    .replace(/\btiktok\b/gi, "TikTok")
    .replace(/\byoutube\b/gi, "YouTube")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getProgressPercent(step: StepNumber) {
  return Math.round((step / 6) * 100);
}

function BuilderPanel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section
      className={`rounded-[30px] border border-white/[0.075] bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.022))] shadow-[0_24px_70px_rgba(0,0,0,0.38),0_1px_0_rgba(255,255,255,0.055)_inset] backdrop-blur-xl ${className}`}
    >
      {children}
    </section>
  );
}

function BuilderSubPanel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-[26px] border border-white/[0.075] bg-black/25 shadow-[0_18px_45px_rgba(0,0,0,0.24),0_1px_0_rgba(255,255,255,0.035)_inset] ${className}`}>
      {children}
    </section>
  );
}

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
  const statusClass =
    status === "complete"
      ? "text-[#e7ff9a]"
      : status === "error"
        ? "text-[#d8ded1]"
        : active
          ? "text-[#e7ff9a]"
          : "text-[#aeb5aa]";

  return (
    <button
      aria-pressed={active}
      className={`group flex w-full items-center justify-between rounded-[24px] border px-4 py-4 text-left transition duration-300 hover:-translate-y-0.5 ${
        active
          ? "border-[#b8ff3d]/38 bg-[#b8ff3d]/13 text-[#fbfbf7] shadow-[0_20px_46px_rgba(184,255,61,0.14),0_1px_0_rgba(255,255,255,0.07)_inset]"
          : "border-white/8 bg-white/[0.035] text-[#c7ccc2] hover:border-white/14 hover:bg-white/[0.055] hover:text-[#fbfbf7]"
      }`}
      onClick={onClick}
      type="button"
    >
      <div className="flex items-center gap-3">
        <span
          className={`h-2 w-2 rounded-full transition ${
            active
              ? "bg-[#b8ff3d]"
              : status === "complete"
                ? "bg-[#c8f060]/80"
                : status === "error"
                  ? "bg-red-300/80"
                  : "bg-white/18 group-hover:bg-white/30"
          }`}
        />
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#aeb5aa]">Step {step}</div>
          <div className="mt-1 text-sm font-black leading-tight">{label}</div>
        </div>
      </div>
      <div className={`flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.12em] ${statusClass}`}>
        <span>
          {status === "complete"
            ? "Complete"
            : status === "error"
              ? "Needs attention"
              : status === "in_progress"
                ? "In progress"
                : "Not started"}
        </span>
        {status === "complete" ? <CircleCheckBig className="h-4 w-4" /> : null}
        {status === "error" ? <TriangleAlert className="h-4 w-4" /> : null}
      </div>
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
      className={`rounded-full px-3.5 py-2 text-sm font-bold transition duration-300 ${
        active
          ? "border border-[#b8ff3d]/35 bg-[#b8ff3d]/13 text-[#e7ff9a] shadow-[0_12px_30px_rgba(184,255,61,0.1)]"
          : "border border-white/10 bg-white/[0.04] text-[#c7ccc2] hover:-translate-y-0.5 hover:border-white/16 hover:bg-white/[0.06] hover:text-[#fbfbf7]"
      }`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="mb-2 text-[11px] font-black uppercase tracking-[0.2em] text-[#aeb5aa]">{children}</div>;
}

function formatMissingFieldList(items: string[]) {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

export default function NewCampaignPage() {
  const router = useRouter();
  const { brandContext, brandTeamBrand, loading, session, profile } = useAuth();
  const drafts = useDrafts();
  const publishMutation = usePublishCampaign();
  const canManageCampaigns = Boolean(brandContext && canBrandTeamRole(brandContext.role, "manage_campaigns"));
  const brandBalance = brandTeamBrand?.credits_balance ?? profile?.credits_balance ?? 0;
  const previewBrandName = brandTeamBrand?.company_name || profile?.company_name || profile?.name || "Your brand";
  useAutosaveDraft(canManageCampaigns);

  const currentStep = useCampaignForm((state) => state.current_step);
  const state = useCampaignForm();
  const patch = useCampaignForm((s) => s.patch);
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
    if (!profile || !brandContext) return;
    if (hasHydratedRef.current) return;
    useCampaignForm.getState().hydrate(null, brandBalance);
    hasHydratedRef.current = true;
  }, [brandBalance, brandContext, profile]);

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
        label: BUILDER_STEP_LABELS[step],
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
    useCampaignForm.getState().hydrate(latestDraft, brandBalance);
    hasHydratedRef.current = true;
    setDraftPromptDismissed(true);
  }

  async function handleDiscardDrafts() {
    try {
      setDraftFeedback(null);
      await drafts.deleteAllDrafts.mutateAsync();
      if (profile) {
        useCampaignForm.getState().hydrate(null, brandBalance);
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
    const existingState = useCampaignForm.getState();
    const retainedHashtags = (existingState.required_hashtags ?? []).filter((tag) => tag !== "#ad" && tag !== "#gifted");
    const nextState = {
      ...existingState,
      campaign_type: type,
      required_hashtags: retainedHashtags,
      cash_amount: type === "gifting" ? undefined : existingState.cash_amount,
      payment_methods: type === "gifting" ? [] : existingState.payment_methods,
      product_description: type === "paid" ? undefined : existingState.product_description
    };

    useCampaignForm.getState().patch({
      campaign_type: type,
      cash_amount: nextState.cash_amount,
      payment_methods: nextState.payment_methods,
      product_description: nextState.product_description,
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
  const previewDeliverables = (state.content_types ?? []).map(formatChipLabel);
  const previewProductDetails = state.product_description?.trim();
  const previewPaymentDetails = state.cash_amount ? formatCurrency(state.cash_amount) : "";
  const currentStepLabel = BUILDER_STEP_LABELS[currentStep];
  const currentStepHelper = BUILDER_STEP_HELPER[currentStep];
  const progressPercent = getProgressPercent(currentStep);
  const previewCompensationDetails =
    !state.campaign_type
      ? "Choose compensation"
      : state.campaign_type === "gifting"
      ? previewProductDetails || "Product details not set"
      : state.campaign_type === "paid"
        ? previewPaymentDetails || "Cash amount not set"
        : [
            `Payment: ${previewPaymentDetails || "Cash amount not set"}`,
            `Product: ${previewProductDetails || "Product details not set"}`
          ].join(" • ");
  const previewMustIncludes = (state.must_includes ?? []).filter(Boolean);
  const previewOffLimits = (state.off_limits ?? []).filter(Boolean);

  if (loading || !session) {
    return (
      <RouteTransitionScreen
        eyebrow="Checking session"
        title="Preparing the campaign builder."
        description="BudCast is validating your account before opening the publish workflow."
        primaryAction={{ href: "/sign-in", label: "Sign in" }}
        secondaryAction={{ href: "/", label: "Back to BudCast" }}
      />
    );
  }

  if (!hasCompletedOnboarding(profile)) {
    return (
      <RouteTransitionScreen
        eyebrow="Routing to setup"
        title="A few setup details come first."
        description="The campaign builder unlocks after onboarding so creators can see a complete brand profile."
        primaryAction={{ href: "/onboarding", label: "Finish setup" }}
        secondaryAction={{ href: "/dashboard", label: "Back to dashboard" }}
      />
    );
  }

  if (!canManageCampaigns) {
    return (
      <RouteTransitionScreen
        eyebrow="Brand only"
        title="Campaign publishing is reserved for cannabis brands."
        description="Creators use BudCast to find opportunities. Cannabis brands use this surface to publish campaign briefs."
        primaryAction={{ href: "/sign-in", label: "Sign in as brand" }}
        secondaryAction={{ href: "/creator-dashboard", label: "Creator demo" }}
      />
    );
  }

  return (
    <BrandShell>
      <div className="flex flex-col gap-5">
        <BuilderPanel className="animate-enter overflow-hidden border-white/10 bg-[radial-gradient(circle_at_16%_0%,rgba(184,255,61,0.18),transparent_34%),radial-gradient(circle_at_88%_10%,rgba(231,255,154,0.08),transparent_28%),linear-gradient(145deg,rgba(255,255,255,0.076),rgba(255,255,255,0.026))] px-5 py-7 shadow-[0_30px_95px_rgba(0,0,0,0.46)] md:px-8 md:py-8">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="max-w-3xl">
              <Eyebrow className="text-[#e7ff9a]">Campaign brief studio</Eyebrow>
              <h1 className="mt-3 text-5xl font-black leading-[0.92] tracking-[-0.045em] text-[#fbfbf7] md:text-6xl">
                Build a campaign creators want.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-[#d8ded1]">
                Shape the listing, compensation, deliverables, and cannabis-safe guidelines creators will see before they apply.
              </p>
            </div>
            <div className="flex flex-col items-stretch gap-3 sm:items-end">
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm font-bold text-[#d8ded1] shadow-[0_14px_36px_rgba(0,0,0,0.22)]">
                <Save className="h-4 w-4 text-[#e7ff9a]" />
                {state.last_saved_at ? `Saved ${new Date(state.last_saved_at).toLocaleTimeString()}` : "Autosave ready"}
              </div>
              <div className="flex items-center gap-2 rounded-full border border-[#b8ff3d]/16 bg-[#b8ff3d]/10 px-4 py-2 text-sm font-bold text-[#d8ded1] shadow-[0_14px_36px_rgba(0,0,0,0.22)]">
                <Images className="h-4 w-4 text-[#e7ff9a]" />
                Attach Brand Kit assets in the brief
              </div>
              <Button asChild variant="secondary">
                <Link href="/dashboard">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to campaigns
                </Link>
              </Button>
            </div>
          </div>
          <div className="mt-7 grid gap-3 rounded-[24px] border border-white/10 bg-black/18 p-4 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.18em] text-[#e7ff9a]">
                Step {currentStep} of 6 · {currentStepLabel}
              </div>
              <div className="mt-2 text-sm leading-6 text-[#d8ded1]">{currentStepHelper}</div>
            </div>
            <div className="min-w-[220px]">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.18em] text-[#aeb5aa]">
                <span>Brief progress</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#b8ff3d,#e7ff9a)] shadow-[0_0_24px_rgba(184,255,61,0.32)] transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </BuilderPanel>

        {latestDraft && !state.draft_id && !draftPromptDismissed ? (
          <BuilderSubPanel className="border-[#b8ff3d]/18 bg-[#b8ff3d]/8 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-sm font-black text-[#fbfbf7]">Resume latest draft?</div>
                <p className="mt-1 text-sm leading-6 text-[#d8ded1]">
                  Found an unfinished draft: <span className="font-black text-[#fbfbf7]">{latestDraft.display_title}</span>
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
          </BuilderSubPanel>
        ) : null}

        <BuilderPanel className="sticky top-3 z-20 p-3 xl:hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#e7ff9a]">
                Step {currentStep} / 6
              </div>
              <div className="mt-1 truncate text-sm font-black text-[#fbfbf7]">{currentStepLabel}</div>
            </div>
            <div className="h-2 w-28 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#b8ff3d,#e7ff9a)] transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <Button asChild className="h-10 px-4 text-xs" variant="secondary">
              <Link href="/dashboard">Close</Link>
            </Button>
          </div>
        </BuilderPanel>

        <section className="grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)_380px]">
          <BuilderPanel className="order-3 h-fit border-white/10 bg-white/[0.035] p-4 xl:sticky xl:top-6 xl:order-none">
            <div className="mb-4 px-2">
              <Eyebrow className="text-[#e7ff9a]">Publish checklist</Eyebrow>
              <div className="mt-3 text-2xl font-black tracking-[-0.04em] text-[#fbfbf7]">Campaign build</div>
              <p className="mt-2 text-sm leading-6 text-[#c7ccc2]">
                Work through each section. BudCast keeps the creator-facing preview live as you write.
              </p>
            </div>
            <aside className="grid gap-2">
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
          </BuilderPanel>

          <BuilderPanel className="order-1 min-w-0 border-white/10 bg-white/[0.035] p-5 md:p-8 xl:order-none">
            {currentStep === 1 ? (
              <div>
                <Eyebrow className="text-[#e7ff9a]">Step 1</Eyebrow>
                <h2 className="mt-2 text-4xl font-black tracking-[-0.05em] text-[#fbfbf7]">Choose the campaign type</h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-[#d8ded1]">
                  This controls the public compensation label, required fields, credit cost, and compliance hashtags.
                </p>
                <div className="mt-6 grid gap-4 lg:grid-cols-3">
                  {(["gifting", "paid", "hybrid"] as const).map((type) => (
                    <button
                      aria-pressed={state.campaign_type === type}
                      className={`group relative overflow-hidden rounded-[30px] border p-5 text-left transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(0,0,0,0.28)] ${
                        state.campaign_type === type
                          ? "border-[#b8ff3d]/44 bg-[#b8ff3d]/13 shadow-[0_20px_55px_rgba(184,255,61,0.13),0_1px_0_rgba(255,255,255,0.08)_inset]"
                          : "border-white/8 bg-white/[0.04] hover:border-white/14 hover:bg-white/[0.06]"
                      }`}
                      key={type}
                      onClick={() => setCampaignType(type)}
                      type="button"
                    >
                      <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(231,255,154,0.45),transparent)] opacity-0 transition group-hover:opacity-100" />
                      <div className="text-xs font-black uppercase tracking-[0.18em] text-[#aeb5aa]">Creator offer</div>
                      <div className="mt-2 text-2xl font-black tracking-[-0.04em] text-[#fbfbf7]">{compensationDetails[type].title}</div>
                      <div className="mt-3 text-sm leading-6 text-[#d8ded1]">
                        {compensationDetails[type].body}
                      </div>
                      <div className="mt-4 rounded-[18px] border border-white/10 bg-black/20 p-3 text-xs leading-5 text-[#c7ccc2]">
                        {compensationDetails[type].detail}
                      </div>
                      <div className="mt-4 text-sm font-black text-[#e7ff9a]">
                        {type === "gifting" ? "50" : type === "paid" ? "100" : "75"} credits / creator spot
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
                  <h2 className="mt-2 text-4xl font-black tracking-[-0.05em] text-[#fbfbf7]">Write the campaign listing</h2>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-[#d8ded1]">
                    This is what creators scan in the campaign feed before opening the full brief.
                  </p>
                </div>
                <div className="grid gap-4">
                  <label className={fieldLabelClassName}>
                    Campaign title
                    <input
                      className={inputClassName}
                      placeholder="Example: 30-90 sec product review reel for a premium flower drop"
                      onChange={(event) => useCampaignForm.getState().patch({ title: event.target.value })}
                      value={state.title ?? ""}
                    />
                  </label>
                  <label className={fieldLabelClassName}>
                    Feed summary
                    <textarea
                      className={textAreaClassName}
                      placeholder="Describe the campaign in creator-first language. What should they make, who is it for, and why is it worth applying?"
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
                      placeholder="Optional image URL for the campaign card"
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
                          {formatChipLabel(category)}
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
                  <h2 className="mt-2 text-4xl font-black tracking-[-0.05em] text-[#fbfbf7]">Creator compensation</h2>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-[#d8ded1]">
                    Be specific about pay, product details, and how creators should coordinate pickup, payment, or next steps through messages.
                  </p>
                </div>
                {(state.campaign_type === "paid" || state.campaign_type === "hybrid") ? (
                  <label className={fieldLabelClassName}>
                    Creator payment amount
                    <input
                      className={inputClassName}
                      min={0}
                      placeholder="250"
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
                          {formatChipLabel(method)}
                        </ToggleChip>
                      ))}
                    </div>
                  </div>
                ) : null}
                {(state.campaign_type === "gifting" || state.campaign_type === "hybrid") ? (
                  <label className={fieldLabelClassName}>
                    Product details for creators
                    <textarea
                      className={textAreaClassName}
                      placeholder="Describe the product experience and explain that coordination happens through BudCast messages. Do not promise shipment for cannabis products."
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
                  <h2 className="mt-2 text-4xl font-black tracking-[-0.05em] text-[#fbfbf7]">Deliverables & guidelines</h2>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-[#d8ded1]">
                    Give creators enough direction to make brand-safe content without turning the brief into a script.
                  </p>
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
                        {formatChipLabel(format)}
                      </ToggleChip>
                    ))}
                  </div>
                </div>
                <label className={fieldLabelClassName}>
                  Brand mention
                  <input
                    className={inputClassName}
                    placeholder="@brandname or brand name creators should mention"
                    onChange={(event) => useCampaignForm.getState().patch({ brand_mention: event.target.value })}
                    value={state.brand_mention ?? ""}
                  />
                </label>
                <label className={fieldLabelClassName}>
                  Creator brief
                  <textarea
                    className={textAreaClassName}
                    placeholder="Explain the creative direction, desired tone, and what a strong submission should include."
                    onChange={(event) => useCampaignForm.getState().patch({ description: event.target.value })}
                    value={state.description ?? ""}
                  />
                </label>
                <div className="rounded-[24px] border border-[#b8ff3d]/20 bg-[#b8ff3d]/8 p-4 text-sm leading-6 text-[#d8ded1]">
                  Cannabis-safe brief note: keep requests clear and brand-safe. Avoid medical claims, purchase CTAs,
                  overconsumption language, or content that could appear targeted to minors.
                </div>

                <div>
                  <SectionLabel>Required hashtags</SectionLabel>
                  <div className="mb-3 flex flex-wrap gap-2">
                    {previewHashtags.map((tag, index) => {
                      const locked =
                        (tag === "#ad" && (state.campaign_type === "paid" || state.campaign_type === "hybrid")) ||
                        (tag === "#gifted" &&
                          (state.campaign_type === "gifting" || state.campaign_type === "hybrid"));
                      return (
                        <button
                          aria-label={
                            locked
                              ? `Required hashtag ${index + 1} ${tag} locked`
                              : `Remove required hashtag ${index + 1}`
                          }
                          className={`rounded-full px-4 py-2 text-sm ${
                            locked
                              ? "border border-white/8 bg-black/20 text-[#82766e]"
                              : "border border-white/10 bg-white/[0.05] text-[#d8ded1]"
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
                      aria-label="New required hashtag"
                      className={compactInputClassName}
                      placeholder="#brandtag"
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
                          aria-label={`Must include item ${index + 1}`}
                          className={compactInputClassName}
                          placeholder="Example: Show package, texture, or use case clearly"
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
                          aria-label={`Remove must include item ${index + 1}`}
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
                          aria-label={`Off-limits item ${index + 1}`}
                          className={compactInputClassName}
                          placeholder="Example: No medical claims or purchase instructions"
                          onChange={(event) =>
                            useCampaignForm.getState().updateBullet("off_limits", index, event.target.value)
                          }
                          value={item}
                        />
                        <Button
                          aria-label={`Remove off-limits item ${index + 1}`}
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
                  <SectionLabel>Campaign asset URLs</SectionLabel>
                  <p className="mb-3 text-sm leading-6 text-[#c7ccc2]">
                    Attach logos, product visuals, packaging shots, mood references, or approved examples from your Brand Kit.
                    Creators can preview these in the campaign brief, with the working asset pack emphasized after acceptance.
                  </p>
                  <div className="mb-3 flex flex-wrap gap-2">
                    {(state.reference_image_urls ?? []).map((url, index) => (
                      <div
                        className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-[#d8ded1]"
                        key={`${url}-${index}`}
                      >
                        <span>{url}</span>
                        <button
                          aria-label={`Remove reference image ${index + 1}`}
                          className="text-[#82766e] transition hover:text-[#fbfbf7]"
                          onClick={() =>
                            useCampaignForm.getState().patch({
                              reference_image_urls: (state.reference_image_urls ?? []).filter((_, i) => i !== index)
                            })
                          }
                          type="button"
                        >
                          remove
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <input
                      aria-label="Campaign asset URL"
                      className={compactInputClassName}
                      placeholder="https://.../logo-or-product-asset.png"
                      onChange={(event) => setReferenceInput(event.target.value)}
                      value={referenceInput}
                    />
                    <Button onClick={updateReferenceImages} variant="secondary">
                      Attach asset
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}

            {currentStep === 5 ? (
              <div className="space-y-6">
                <div>
                  <Eyebrow>Step 5</Eyebrow>
                  <h2 className="mt-2 text-4xl font-black tracking-[-0.05em] text-[#fbfbf7]">Creator spots & deadline</h2>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-[#d8ded1]">
                    Set the size of the drop and the application window creators will see in the campaign feed.
                  </p>
                </div>
                <label className={fieldLabelClassName}>
                  Creator spots available
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
                    BudCast starts this seven days out so the brief never launches with a hidden deadline. Adjust it if
                    the application window should close sooner.
                  </div>
                </label>
                <div>
                  <SectionLabel>Approval mode</SectionLabel>
                  <div className="flex gap-3">
                    <ToggleChip
                      active={state.approval_mode === "manual"}
                      onClick={() => useCampaignForm.getState().patch({ approval_mode: "manual" })}
                    >
                      Manual review
                    </ToggleChip>
                    <ToggleChip
                      active={state.approval_mode === "auto"}
                      onClick={() => useCampaignForm.getState().patch({ approval_mode: "auto" })}
                    >
                      Auto accept
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
                  <h2 className="mt-2 text-4xl font-black tracking-[-0.05em] text-[#fbfbf7]">Review & publish</h2>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-[#d8ded1]">
                    Confirm the campaign reads clearly for creators before it goes live in the campaign feed.
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className={detailPanelClassName}>
                    <div className="text-sm font-bold text-[#aeb5aa]">Compensation</div>
                    <div className="mt-2 text-lg font-semibold text-[#fbfbf7]">
                      {state.campaign_type ? formatCompensationLabel(state.campaign_type) : "Not set"}
                    </div>
                  </div>
                  <div className={detailPanelClassName}>
                    <div className="text-sm font-bold text-[#aeb5aa]">Credits reserved</div>
                    <div className="mt-2 text-lg font-semibold text-[#fbfbf7]">{totalCredits}</div>
                  </div>
                  <div className={detailPanelClassName}>
                    <div className="text-sm font-bold text-[#aeb5aa]">Creator spots</div>
                    <div className="mt-2 text-lg font-semibold text-[#fbfbf7]">{state.slots_available ?? 1}</div>
                  </div>
                  <div className={detailPanelClassName}>
                    <div className="text-sm font-bold text-[#aeb5aa]">Balance after publish</div>
                    <div className="mt-2 text-lg font-semibold text-[#fbfbf7]">{balanceAfter}</div>
                  </div>
                </div>
                <div className={detailPanelClassName}>
                  <div className="text-sm font-bold text-[#aeb5aa]">Brand publishing cost</div>
                  <div className="mt-2 text-lg font-semibold text-[#fbfbf7]">
                    {creditCost} / slot • {totalCredits} total
                  </div>
                  <div className="mt-1 text-sm text-[#c7ccc2]">Brand balance after publish: {balanceAfter}</div>
                </div>
                <div className={detailPanelClassName}>
                  <div className="text-sm font-bold text-[#aeb5aa]">Final validation</div>
                  <div className="mt-3 space-y-2 text-sm text-[#d8ded1]">
                    {steps.slice(0, 5).map(({ step, label, status, missing }) => (
                      <div key={step}>
                        <div className="flex items-center justify-between">
                          <span>{label}</span>
                          <span
                            className={`${
                              status === "complete"
                                ? "text-[#e7ff9a]"
                                : status === "error"
                                  ? "text-[#d8ded1]"
                                  : "text-[#c7ccc2]"
                            }`}
                          >
                            {status === "complete"
                              ? "Complete"
                              : status === "error"
                                ? "Needs attention"
                                : status === "in_progress"
                                  ? "In progress"
                                  : "Not started"}
                          </span>
                        </div>
                        {missing.length > 0 ? (
                          <div className="mt-1 text-xs leading-6 text-[#aeb5aa]">
                            Missing: {formatMissingFieldList(missing)}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
                {/* Rights & Compliance — migration 028 */}
                <div className={detailPanelClassName}>
                  <div className="text-sm font-bold text-[#aeb5aa] mb-3">Content rights</div>

                  {/* Target platforms */}
                  <div className="mb-4">
                    <div className="text-xs font-semibold uppercase tracking-widest text-[#aeb5aa] mb-2">Target platforms</div>
                    <p className="mb-2 text-xs text-white/30">Where creators will publish their content.</p>
                    <div className="flex flex-wrap gap-2">
                      {(
                        [
                          { value: 'instagram', label: 'Instagram' },
                          { value: 'tiktok',    label: 'TikTok' },
                          { value: 'youtube',   label: 'YouTube' },
                          { value: 'facebook',  label: 'Facebook' },
                          { value: 'x',         label: 'X / Twitter' },
                          { value: 'linkedin',  label: 'LinkedIn' },
                        ] as { value: string; label: string }[]
                      ).map(({ value, label }) => {
                        const selected = (state.target_platforms ?? []).includes(value);
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => {
                              const current = state.target_platforms ?? [];
                              patch({
                                target_platforms: selected
                                  ? current.filter((p) => p !== value)
                                  : [...current, value],
                              });
                            }}
                            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                              selected
                                ? 'bg-[#b8ff3d] text-black'
                                : 'border border-white/15 bg-white/5 text-white/60 hover:border-white/30 hover:text-white/90'
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Rights checkboxes */}
                  <div className="space-y-3 border-t border-white/10 pt-4">
                    {(
                      [
                        { key: 'rights_organic_repost',    label: 'Organic repost allowed (baseline right)' },
                        { key: 'rights_paid_ads',          label: 'Paid ads / dark posting allowed' },
                        { key: 'rights_whitelisting',       label: 'Creator handle whitelisting allowed' },
                        { key: 'rights_handle_licensing',   label: 'Handle licensing required' },
                        { key: 'rights_exclusive',          label: 'Exclusivity required' },
                        { key: 'rights_no_ai_training',     label: 'No AI training use' },
                        { key: 'rights_revocable',          label: 'Brand may revoke usage rights' },
                      ] as { key: keyof typeof state; label: string }[]
                    ).map(({ key, label }) => (
                      <div key={key}>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            className="h-4 w-4 accent-[#b8ff3d] shrink-0"
                            checked={Boolean(state[key])}
                            onChange={(e) => patch({ [key]: e.target.checked })}
                          />
                          <span className="text-sm text-white/70">{label}</span>
                        </label>
                        {/* Exclusivity duration — only shown when exclusivity is checked */}
                        {key === 'rights_exclusive' && Boolean(state.rights_exclusive) && (
                          <div className="ml-7 mt-2">
                            <input
                              type="number"
                              min={1}
                              placeholder="Exclusivity duration (days) — leave blank for indefinite"
                              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-[#fbfbf7] placeholder:text-white/30 focus:border-[#b8ff3d]/50 focus:outline-none"
                              value={state.rights_exclusivity_days ?? ''}
                              onChange={(e) =>
                                patch({
                                  rights_exclusivity_days: e.target.value === '' ? null : Number(e.target.value),
                                })
                              }
                            />
                            <p className="mt-1 text-xs text-white/30">How many days the creator cannot post for competing brands. Leave blank = indefinite.</p>
                          </div>
                        )}
                        {/* Revocation notice period — only shown when revocable is checked */}
                        {key === 'rights_revocable' && Boolean(state.rights_revocable) && (
                          <div className="ml-7 mt-2">
                            <input
                              type="number"
                              min={1}
                              placeholder="Notice period (days)"
                              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-[#fbfbf7] placeholder:text-white/30 focus:border-[#b8ff3d]/50 focus:outline-none"
                              value={state.rights_revocation_notice_days ?? ''}
                              onChange={(e) =>
                                patch({
                                  rights_revocation_notice_days: e.target.value === '' ? null : Number(e.target.value),
                                })
                              }
                            />
                            <p className="mt-1 text-xs text-white/30">How many days notice the brand must give before revoking. Default is 30.</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Rights duration */}
                  <div className="mt-4 border-t border-white/10 pt-4">
                    <label className="block text-xs font-semibold uppercase tracking-widest text-[#aeb5aa] mb-2">
                      Rights duration (days)
                    </label>
                    <input
                      type="number"
                      min={1}
                      placeholder="e.g. 90 — leave blank for unlimited"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-[#fbfbf7] placeholder:text-white/30 focus:border-[#b8ff3d]/50 focus:outline-none"
                      value={state.rights_duration_days ?? ''}
                      onChange={(e) =>
                        patch({
                          rights_duration_days: e.target.value === '' ? null : Number(e.target.value),
                        })
                      }
                    />
                    <p className="mt-1 text-xs text-white/30">How long the brand may use the content. Leave blank = unlimited.</p>
                  </div>

                  {/* Eligible states */}
                  <div className="mt-4 border-t border-white/10 pt-4">
                    <div className="text-xs font-semibold uppercase tracking-widest text-[#aeb5aa] mb-2">
                      Eligible states
                    </div>
                    <p className="mb-3 text-xs text-white/30">Select every US state where this campaign is legally permitted to run.</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
                        'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
                        'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
                        'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
                        'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC',
                      ].map((st) => {
                        const selected = (state.eligible_states ?? []).includes(st);
                        return (
                          <button
                            key={st}
                            type="button"
                            onClick={() => {
                              const current = state.eligible_states ?? [];
                              patch({
                                eligible_states: selected
                                  ? current.filter((s) => s !== st)
                                  : [...current, st],
                              });
                            }}
                            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                              selected
                                ? 'bg-[#b8ff3d] text-black'
                                : 'border border-white/15 bg-white/5 text-white/60 hover:border-white/30 hover:text-white/90'
                            }`}
                          >
                            {st}
                          </button>
                        );
                      })}
                    </div>
                    {(state.eligible_states ?? []).length > 0 && (
                      <button
                        type="button"
                        onClick={() => patch({ eligible_states: [] })}
                        className="mt-2 text-xs text-white/30 hover:text-white/60 transition-colors"
                      >
                        Clear all
                      </button>
                    )}
                  </div>

                  {/* Compliance checklist */}
                  <label className="flex items-start gap-3 cursor-pointer border-t border-white/10 pt-4 mt-4">
                    <input
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 accent-[#b8ff3d] shrink-0"
                      checked={Boolean(state.compliance_checklist_done)}
                      onChange={(e) => patch({ compliance_checklist_done: e.target.checked })}
                    />
                    <span className="text-xs leading-5 text-white/50">
                      I confirm this campaign brief includes required disclosures (#ad / #gifted),
                      makes no health claims, uses no sale language, and complies with applicable
                      state cannabis advertising laws.
                    </span>
                  </label>
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
                    <div className="rounded-[24px] border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-sm text-[#d8ded1]">
                      <div className="flex items-center gap-2">
                        <TriangleAlert className="h-4 w-4" />
                        Complete all steps before publish.
                      </div>
                      {unmetRequirements.length > 0 ? (
                        <div className="mt-2 text-xs leading-6 text-[#d8ded1]">
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
                  Continue brief
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ) : null}
          </BuilderPanel>

          <BuilderPanel className="order-2 h-fit border-white/10 bg-[radial-gradient(circle_at_50%_0%,rgba(184,255,61,0.11),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.058),rgba(255,255,255,0.024))] p-5 xl:sticky xl:top-6 xl:order-none">
            <div className="flex items-center gap-2 text-[#e7ff9a]">
              <Sparkles className="h-4 w-4" />
              <Eyebrow className="text-[#e7ff9a]">Creator preview</Eyebrow>
            </div>
            <div className="mt-5 overflow-hidden rounded-[30px] border border-white/[0.075] bg-[#090706] shadow-[0_24px_70px_rgba(0,0,0,0.36),0_1px_0_rgba(255,255,255,0.04)_inset]">
              <div className="relative min-h-[130px] border-b border-white/10 bg-[radial-gradient(circle_at_26%_12%,rgba(184,255,61,0.34),transparent_38%),linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] p-4">
                <div className="absolute right-4 top-4 rounded-full border border-white/10 bg-black/28 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#e7ff9a]">
                  Campaign
                </div>
                <div className="absolute bottom-4 left-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-black/45 text-sm font-black text-[#fbfbf7]">
                  BC
                </div>
              </div>
              <div className="p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="text-sm font-black text-[#fbfbf7]">{previewBrandName}</div>
                  <div className="rounded-full bg-white/[0.055] px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#aeb5aa]">
                    Draft listing
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-[#b8ff3d]/35 bg-[#b8ff3d]/12 px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-[#e7ff9a]">
                    {state.campaign_type ? formatCompensationLabel(state.campaign_type) : "Choose type"}
                  </span>
                  {previewDeliverables[0] ? (
                    <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-[#d8ded1]">
                      {previewDeliverables[0]}
                    </span>
                  ) : null}
                </div>
                <h2 className="mt-4 text-3xl font-black leading-[0.95] tracking-[-0.04em] text-[#fbfbf7]">
                  {state.title?.trim() || "Untitled creator campaign"}
                </h2>
                <p className="mt-3 text-sm leading-6 text-[#d8ded1]">
                  {state.short_description?.trim() ||
                    "Creators will see this preview in the campaign feed as the brief takes shape."}
                </p>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-[18px] border border-white/10 bg-white/[0.04] p-3">
                    <div className="text-[10px] font-black uppercase tracking-[0.16em] text-[#aeb5aa]">Value</div>
                    <div className="mt-2 text-sm font-black text-[#fbfbf7]">{previewCompensationDetails}</div>
                  </div>
                  <div className="rounded-[18px] border border-white/10 bg-white/[0.04] p-3">
                    <div className="text-[10px] font-black uppercase tracking-[0.16em] text-[#aeb5aa]">Slots</div>
                    <div className="mt-2 text-sm font-black text-[#fbfbf7]">
                      {state.slots_available ?? 1} creator {(state.slots_available ?? 1) === 1 ? "spot" : "spots"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 divide-y divide-white/8 rounded-[26px] border border-white/10 bg-black/20 px-4">
              <div className="py-4">
                <div className="text-[11px] font-black uppercase tracking-[0.18em] text-[#aeb5aa]">Deliverables</div>
                <div className="mt-2 text-lg font-semibold text-[#fbfbf7]">
                  {previewDeliverables.length > 0 ? previewDeliverables.join(", ") : "Choose formats"}
                </div>
              </div>
              <div className="py-4">
                <div className="text-[11px] font-black uppercase tracking-[0.18em] text-[#aeb5aa]">Deadline</div>
                <div className="mt-2 text-lg font-semibold text-[#fbfbf7]">
                  {formatDeadline(state.application_deadline)}
                </div>
              </div>
              <div className="py-4">
                <div className="text-[11px] font-black uppercase tracking-[0.18em] text-[#aeb5aa]">Guidelines</div>
                <div className="mt-2 space-y-2 text-sm leading-6 text-[#d8ded1]">
                  <div>{state.brand_mention?.trim() || "Brand mention not set"}</div>
                  <div>{previewHashtags.length > 0 ? previewHashtags.join(" ") : "Required hashtags not set"}</div>
                  {previewMustIncludes.length > 0 ? (
                    <div>Must include: {previewMustIncludes.join("; ")}</div>
                  ) : null}
                  {previewOffLimits.length > 0 ? (
                    <div>Off limits: {previewOffLimits.join("; ")}</div>
                  ) : null}
                </div>
              </div>
            </div>

          </BuilderPanel>
        </section>
      </div>
    </BrandShell>
  );
}
