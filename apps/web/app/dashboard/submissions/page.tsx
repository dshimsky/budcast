"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import {
  type BrandSubmissionQueueRow,
  formatPaymentMethod,
  formatPostType,
  formatStatus,
  hasCompletedOnboarding,
  useAuth,
  useBrandSubmissionQueue,
  useConfirmSubmissionPayment,
  useUpdateContentSubmissionVerification
} from "@budcast/shared";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowUpRight, BadgeCheck, CircleDollarSign, ClipboardCheck, Clock3 } from "lucide-react";
import { BrandWorkspaceShell } from "../../../components/brand-workspace-shell";
import { RouteTransitionScreen } from "../../../components/route-transition-screen";
import { Eyebrow } from "../../../components/ui/eyebrow";
import { Button } from "../../../components/ui/button";
import { LacquerSurface, SmokedPanel } from "../../../components/ui/surface-tone";

type QueueTab = "all" | "awaiting_creator" | "pending_verification" | "ready_for_payout" | "completed";

function getQueueStage(row: BrandSubmissionQueueRow): QueueTab {
  if (!row?.submission) return "awaiting_creator";
  if (row.submission.verification_status === "pending" || row.submission.verification_status === "needs_revision") {
    return "pending_verification";
  }
  if (row.submission.verification_status === "verified") {
    if (row.submission.payment_confirmed_by_brand && row.submission.payment_confirmed_by_creator) {
      return "completed";
    }
    return "ready_for_payout";
  }
  return "all";
}

function SubmissionQueueInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loading, session, profile } = useAuth();
  const queue = useBrandSubmissionQueue();
  const verifySubmission = useUpdateContentSubmissionVerification();
  const confirmPayment = useConfirmSubmissionPayment();
  const [activeTab, setActiveTab] = useState<QueueTab>("all");
  const [feedbackByApplication, setFeedbackByApplication] = useState<Record<string, string>>({});
  const [paymentMethodByApplication, setPaymentMethodByApplication] = useState<Record<string, string>>({});
  const [actionError, setActionError] = useState<string | null>(null);
  const activeCampaignId = searchParams.get("campaign");

  useEffect(() => {
    if (!loading && !session) {
      router.replace("/sign-in");
      return;
    }
    if (!loading && session && !hasCompletedOnboarding(profile)) {
      router.replace("/onboarding");
      return;
    }
    if (!loading && profile?.user_type && profile.user_type !== "brand") {
      router.replace("/dashboard");
    }
  }, [loading, profile, router, session]);

  const rows = queue.data ?? [];
  const campaignOptions = useMemo(() => {
    const seen = new Map<string, string>();

    for (const row of rows) {
      const id = row.opportunity?.id;
      const title = row.opportunity?.title;
      if (!id || !title || seen.has(id)) continue;
      seen.set(id, title);
    }

    return Array.from(seen.entries()).map(([id, title]) => ({ id, title }));
  }, [rows]);
  const campaignRows = activeCampaignId ? rows.filter((row) => row.opportunity?.id === activeCampaignId) : rows;
  const activeCampaignTitle = campaignOptions.find((option) => option.id === activeCampaignId)?.title ?? null;
  const counts = useMemo(() => {
    return campaignRows.reduce(
      (acc, row) => {
        const stage = getQueueStage(row);
        acc.all += 1;
        if (stage in acc) {
          acc[stage as Exclude<QueueTab, "all">] += 1;
        }
        return acc;
      },
      {
        all: 0,
        awaiting_creator: 0,
        pending_verification: 0,
        ready_for_payout: 0,
        completed: 0
      }
    );
  }, [campaignRows]);

  const visibleRows = campaignRows.filter((row) => activeTab === "all" || getQueueStage(row) === activeTab);
  const tabs: Array<{ value: QueueTab; label: string; count: number }> = [
    { value: "all", label: "All", count: counts.all },
    { value: "awaiting_creator", label: "Awaiting content", count: counts.awaiting_creator },
    { value: "pending_verification", label: "Verify", count: counts.pending_verification },
    { value: "ready_for_payout", label: "Payout", count: counts.ready_for_payout },
    { value: "completed", label: "Completed", count: counts.completed }
  ];

  if (loading || !session) {
    return (
      <RouteTransitionScreen
        eyebrow="Checking session"
        title="Preparing the submission queue."
        description="BudCast is validating your session before opening verification and payout operations."
      />
    );
  }

  if (!hasCompletedOnboarding(profile)) {
    return (
      <RouteTransitionScreen
        eyebrow="Routing to setup"
        title="Complete setup before opening operations."
        description="Submission verification depends on a hydrated brand profile and marketplace routing."
      />
    );
  }

  if (profile?.user_type !== "brand") {
    return (
      <RouteTransitionScreen
        eyebrow="Brand only"
        title="This queue is brand-side only."
        description="Creators still track proof and payment from the native app, but verification lives in the brand workspace."
      />
    );
  }

  if (queue.error) {
    return (
      <BrandWorkspaceShell>
        <LacquerSurface className="p-8">
          <Eyebrow>Submission queue</Eyebrow>
          <h1 className="mt-3 font-display text-5xl text-[#f5efe6]">Submission queue unavailable.</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-stone-300">
            BudCast could not load verification and payout operations. Try reopening the queue from the dashboard.
          </p>
          <div className="mt-6">
            <Button asChild>
              <Link href="/dashboard">Back to dashboard</Link>
            </Button>
          </div>
        </LacquerSurface>
      </BrandWorkspaceShell>
    );
  }

  async function handleVerification(applicationId: string, submissionId: string, status: "verified" | "needs_revision") {
    try {
      setActionError(null);
      await verifySubmission.mutateAsync({
        applicationId,
        submissionId,
        verificationStatus: status,
        verificationFeedback: feedbackByApplication[applicationId] ?? null
      });
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Submission verification failed.");
    }
  }

  async function handleConfirmPayment(applicationId: string, submissionId: string) {
    const row = rows.find((item) => item.id === applicationId);
    const fallbackMethod = row?.submission?.payment_method ?? row?.opportunity?.payment_methods?.[0] ?? null;
    try {
      setActionError(null);
      await confirmPayment.mutateAsync({
        applicationId,
        submissionId,
        paymentMethod: (paymentMethodByApplication[applicationId] ?? fallbackMethod) as
          | "venmo"
          | "zelle"
          | "cashapp"
          | "paypal"
          | null
      });
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Payment confirmation failed.");
    }
  }

  return (
    <BrandWorkspaceShell>
      <div className="flex flex-col gap-6">
        <LacquerSurface className="overflow-hidden px-7 py-8">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="max-w-3xl">
              <Eyebrow>Submission queue</Eyebrow>
              <h1 className="mt-3 font-display text-5xl text-[#f5efe6] md:text-6xl">
                Content verification and payout follow-through
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-stone-300">
                This queue sits between accepted applications and final payment confirmation. It is wired directly to
                the locked <code>content_submissions</code> table.
              </p>
              {activeCampaignTitle ? (
                <div className="mt-4 inline-flex items-center rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-stone-300">
                  Filtered to campaign: <span className="ml-2 font-medium text-[#f5efe6]">{activeCampaignTitle}</span>
                </div>
              ) : null}
              <div className="mt-5 flex flex-wrap gap-2">
                {["Submission proof", "Verification motion", "Payout closure"].map((item, index) => (
                  <div className={`premium-chip ${index === 1 ? "animate-float" : ""}`} key={item}>
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <Button asChild variant="secondary">
                <Link href={activeCampaignId ? `/dashboard/campaigns/${activeCampaignId}` : "/dashboard"}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {activeCampaignId ? "Back to campaign" : "Back to dashboard"}
                </Link>
              </Button>
            </div>
          </div>
        </LacquerSurface>

        <section className="grid gap-5 md:grid-cols-4">
          <SmokedPanel className="p-6">
            <div className="flex items-center gap-3 text-[#d7c2a0]">
              <Clock3 className="h-5 w-5" />
              <span className="text-sm font-medium uppercase tracking-[0.18em]">Awaiting content</span>
            </div>
            <div className="mt-4 text-4xl font-semibold text-[#f5efe6]">{counts.awaiting_creator}</div>
          </SmokedPanel>
          <SmokedPanel className="p-6">
            <div className="flex items-center gap-3 text-[#d7c2a0]">
              <ClipboardCheck className="h-5 w-5" />
              <span className="text-sm font-medium uppercase tracking-[0.18em]">Needs review</span>
            </div>
            <div className="mt-4 text-4xl font-semibold text-[#f5efe6]">{counts.pending_verification}</div>
          </SmokedPanel>
          <SmokedPanel className="p-6">
            <div className="flex items-center gap-3 text-[#d7c2a0]">
              <CircleDollarSign className="h-5 w-5" />
              <span className="text-sm font-medium uppercase tracking-[0.18em]">Ready for payout</span>
            </div>
            <div className="mt-4 text-4xl font-semibold text-[#f5efe6]">{counts.ready_for_payout}</div>
          </SmokedPanel>
          <SmokedPanel className="p-6">
            <div className="flex items-center gap-3 text-emerald-200">
              <BadgeCheck className="h-5 w-5" />
              <span className="text-sm font-medium uppercase tracking-[0.18em]">Completed</span>
            </div>
            <div className="mt-4 text-4xl font-semibold text-[#f5efe6]">{counts.completed}</div>
          </SmokedPanel>
        </section>

        <LacquerSurface className="p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-2">
                <button
                  aria-pressed={!activeCampaignId}
                  className={`rounded-full px-4 py-2 text-sm transition ${
                    !activeCampaignId
                      ? "border border-[#a48756]/40 bg-[#a48756]/14 text-[#f5efe6] shadow-[0_14px_30px_rgba(164,135,86,0.16)]"
                      : "border border-white/10 bg-white/[0.04] text-stone-300 hover:-translate-y-0.5 hover:border-white/16 hover:bg-white/[0.06]"
                  }`}
                  onClick={() => router.replace("/dashboard/submissions")}
                  type="button"
                >
                  All campaigns ({rows.length})
                </button>
                {campaignOptions.map((option) => {
                  const active = option.id === activeCampaignId;
                  return (
                    <button
                      aria-pressed={active}
                      className={`rounded-full px-4 py-2 text-sm transition ${
                        active
                          ? "border border-[#a48756]/40 bg-[#a48756]/14 text-[#f5efe6] shadow-[0_14px_30px_rgba(164,135,86,0.16)]"
                          : "border border-white/10 bg-white/[0.04] text-stone-300 hover:-translate-y-0.5 hover:border-white/16 hover:bg-white/[0.06]"
                      }`}
                      key={option.id}
                      onClick={() => router.replace(`/dashboard/submissions?campaign=${option.id}`)}
                      type="button"
                    >
                      {option.title}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap gap-2">
                {tabs.map((tab) => {
                  const active = activeTab === tab.value;
                  return (
                    <button
                      aria-pressed={active}
                      className={`rounded-full px-4 py-2 text-sm transition ${
                        active
                          ? "border border-[#a48756]/40 bg-[#a48756]/14 text-[#f5efe6] shadow-[0_14px_30px_rgba(164,135,86,0.16)]"
                          : "border border-white/10 bg-white/[0.04] text-stone-300 hover:-translate-y-0.5 hover:border-white/16 hover:bg-white/[0.06]"
                      }`}
                      key={tab.value}
                      onClick={() => setActiveTab(tab.value)}
                      type="button"
                    >
                      {tab.label} ({tab.count})
                    </button>
                  );
                })}
              </div>
            </div>
            {queue.isLoading ? <div className="text-sm text-stone-400">Loading queue...</div> : null}
          </div>

          {actionError ? (
            <div className="mb-5 rounded-[24px] border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200" role="alert">
              {actionError}
            </div>
          ) : null}

          {queue.isLoading ? (
            <SmokedPanel className="border-dashed px-6 py-12 text-center">
              <p className="text-lg font-medium text-[#f5efe6]">Loading submission operations...</p>
              <p className="mt-2 text-sm leading-6 text-stone-400">
                BudCast is pulling the live proof and payout queue before showing empty states.
              </p>
            </SmokedPanel>
          ) : visibleRows.length === 0 ? (
            <SmokedPanel className="border-dashed px-6 py-12 text-center">
              <p className="text-lg font-medium text-[#f5efe6]">No items in this queue state.</p>
              <p className="mt-2 text-sm leading-6 text-stone-400">
                Accepted applications will land here once creators start submitting content from mobile.
              </p>
            </SmokedPanel>
          ) : (
            <div className="space-y-4">
              {visibleRows.map((row) => {
                const stage = getQueueStage(row);
                const submission = row.submission;
                const selectedMethod =
                  paymentMethodByApplication[row.id] ?? submission?.payment_method ?? row.opportunity?.payment_methods?.[0] ?? null;

                return (
                  <div
                    className="grid gap-5 rounded-[28px] border border-white/8 bg-white/[0.03] p-5 transition-all duration-300 hover:border-white/12 hover:bg-white/[0.05] lg:grid-cols-[1fr_0.9fr_0.8fr]"
                    key={row.id}
                  >
                    <div>
                      <div className="text-xs uppercase tracking-[0.18em] text-stone-500">
                        {row.opportunity?.title || "Accepted application"}
                      </div>
                      <div className="mt-2 text-2xl font-semibold text-[#f5efe6]">
                        {row.creator?.name || "Unnamed creator"}
                      </div>
                      <div className="mt-2 text-sm leading-6 text-stone-300">
                        Stage:{" "}
                        <span
                          className={`font-medium ${
                            stage === "completed"
                              ? "text-emerald-200"
                              : stage === "ready_for_payout"
                                ? "text-[#d7c2a0]"
                              : "text-stone-100"
                          }`}
                        >
                          {formatStatus(stage)}
                        </span>
                      </div>
                      <div className="mt-2 text-sm leading-6 text-stone-300">
                        @{row.creator?.instagram || row.creator?.tiktok || row.creator?.youtube || "No handle on file"}
                      </div>
                      <div className="mt-2 text-sm text-stone-400">
                        Niches: {row.creator?.niches?.join(", ") || "None listed"}
                      </div>
                    </div>

                    <SmokedPanel className="p-4">
                      {!submission ? (
                        <>
                          <div className="text-sm font-medium text-[#f5efe6]">Awaiting creator submission</div>
                          <div className="mt-3 text-sm leading-6 text-stone-400">
                            Creator has been accepted but has not posted content yet. Once they submit a post URL from
                            the native app, it will appear here for verification.
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-sm font-medium text-[#f5efe6]">Submission details</div>
                          <div className="mt-3 text-sm text-stone-300">
                            {formatPostType(submission.post_type)} • {formatStatus(submission.verification_status)}
                          </div>
                          <div className="mt-2 text-sm text-stone-300">
                            Payment method: {formatPaymentMethod(selectedMethod)}
                          </div>
                          <a
                            className="mt-3 inline-flex items-center text-sm font-medium text-[#d7c2a0]"
                            href={submission.post_url}
                            rel="noreferrer"
                            target="_blank"
                          >
                            Open submitted post
                            <ArrowUpRight className="ml-1 h-4 w-4" />
                          </a>
                          {submission.verification_feedback ? (
                            <div className="mt-3 rounded-[20px] border border-white/8 bg-black/20 px-3 py-3 text-sm leading-6 text-stone-300">
                              {submission.verification_feedback}
                            </div>
                          ) : null}
                        </>
                      )}
                    </SmokedPanel>

                    <div className="flex flex-col gap-3">
                      {submission && !submission.payment_confirmed_by_brand ? (
                        <SmokedPanel className="p-4">
                          <div className="text-sm font-medium text-[#f5efe6]">Payout route</div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {(row.opportunity?.payment_methods ?? []).map((method) => {
                              const active = selectedMethod === method;
                              return (
                                <button
                                  aria-pressed={active}
                                  className={`rounded-full px-3 py-1 text-sm transition ${
                                    active
                                      ? "border border-[#a48756]/40 bg-[#a48756]/14 text-[#f5efe6]"
                                      : "border border-white/10 bg-black/20 text-stone-300"
                                  }`}
                                  key={method}
                                  onClick={() =>
                                    setPaymentMethodByApplication((current) => ({ ...current, [row.id]: method }))
                                  }
                                  type="button"
                                >
                                  {formatPaymentMethod(method)}
                                </button>
                              );
                            })}
                          </div>
                        </SmokedPanel>
                      ) : null}

                      {submission ? (
                        <label className="block text-sm font-medium text-stone-200">
                          Verification or revision note
                          <textarea
                            className="premium-textarea mt-2 min-h-[116px] text-sm"
                            onChange={(event) =>
                              setFeedbackByApplication((current) => ({ ...current, [row.id]: event.target.value }))
                            }
                            placeholder="Optional verification or revision note..."
                            value={feedbackByApplication[row.id] ?? submission.verification_feedback ?? ""}
                          />
                        </label>
                      ) : null}

                      <div className="flex flex-wrap gap-3">
                        {submission && stage === "pending_verification" ? (
                          <>
                            <Button
                              disabled={verifySubmission.isPending}
                              onClick={() => void handleVerification(row.id, submission.id, "verified")}
                            >
                              Mark verified
                            </Button>
                            <Button
                              disabled={verifySubmission.isPending}
                              onClick={() => void handleVerification(row.id, submission.id, "needs_revision")}
                              variant="secondary"
                            >
                              Request revision
                            </Button>
                          </>
                        ) : null}

                        {submission && submission.verification_status === "verified" && !submission.payment_confirmed_by_brand ? (
                          <Button
                            disabled={confirmPayment.isPending}
                            onClick={() => void handleConfirmPayment(row.id, submission.id)}
                          >
                            Confirm payment sent
                          </Button>
                        ) : null}
                      </div>

                      {submission ? (
                        <SmokedPanel className="p-4 text-sm leading-6 text-stone-300">
                          Brand confirmed: {submission.payment_confirmed_by_brand ? "Yes" : "No"}
                          <br />
                          Creator confirmed: {submission.payment_confirmed_by_creator ? "Yes" : "No"}
                        </SmokedPanel>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </LacquerSurface>
      </div>
    </BrandWorkspaceShell>
  );
}

export default function SubmissionQueuePage() {
  return (
    <Suspense
      fallback={
        <RouteTransitionScreen
          eyebrow="Loading queue"
          title="Preparing submission operations."
          description="BudCast is opening the verification queue and applying your current campaign filter."
        />
      }
    >
      <SubmissionQueueInner />
    </Suspense>
  );
}
