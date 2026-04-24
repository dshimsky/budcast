"use client";

import Link from "next/link";
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
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowUpRight, BadgeCheck, CircleDollarSign, ClipboardCheck, Clock3 } from "lucide-react";
import { BrandWorkspaceShell } from "../../../components/brand-workspace-shell";
import { RouteTransitionScreen } from "../../../components/route-transition-screen";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";

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
    if (!row.submission.payment_confirmed_by_brand) {
      return "ready_for_payout";
    }
  }
  return "all";
}

export default function SubmissionQueuePage() {
  const router = useRouter();
  const { loading, session, profile } = useAuth();
  const queue = useBrandSubmissionQueue();
  const verifySubmission = useUpdateContentSubmissionVerification();
  const confirmPayment = useConfirmSubmissionPayment();
  const [activeTab, setActiveTab] = useState<QueueTab>("all");
  const [feedbackByApplication, setFeedbackByApplication] = useState<Record<string, string>>({});
  const [paymentMethodByApplication, setPaymentMethodByApplication] = useState<Record<string, string>>({});

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
  const counts = useMemo(() => {
    return rows.reduce(
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
  }, [rows]);

  const visibleRows = rows.filter((row) => activeTab === "all" || getQueueStage(row) === activeTab);
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

  async function handleVerification(applicationId: string, submissionId: string, status: "verified" | "needs_revision") {
    await verifySubmission.mutateAsync({
      applicationId,
      submissionId,
      verificationStatus: status,
      verificationFeedback: feedbackByApplication[applicationId] ?? null
    });
  }

  async function handleConfirmPayment(applicationId: string, submissionId: string) {
    const row = rows.find((item) => item.id === applicationId);
    const fallbackMethod = row?.submission?.payment_method ?? row?.opportunity?.payment_methods?.[0] ?? null;
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
  }

  return (
    <BrandWorkspaceShell>
      <div className="flex flex-col gap-6">
        <header className="hero-orbit overflow-hidden rounded-[34px] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.9),rgba(255,248,240,0.72))] px-6 py-6 shadow-[0_24px_70px_rgba(33,27,20,0.1)] backdrop-blur">
          <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="max-w-3xl">
            <div className="text-xs uppercase tracking-[0.3em] text-surface-500">Submission queue</div>
            <h1 className="mt-3 font-display text-5xl text-surface-900 md:text-6xl">Content verification and payout follow-through</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-surface-700">
              This queue sits between accepted applications and final payment confirmation. It is wired directly to
              the locked <code>content_submissions</code> table.
            </p>
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
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to dashboard
              </Link>
            </Button>
          </div>
          </div>
        </header>

        <section className="grid gap-5 md:grid-cols-4">
          <Card className="sheen p-6">
            <div className="flex items-center gap-3 text-herb-700">
              <Clock3 className="h-5 w-5" />
              <span className="text-sm font-medium uppercase tracking-[0.18em]">Awaiting content</span>
            </div>
            <div className="mt-4 text-4xl font-semibold text-surface-900">{counts.awaiting_creator}</div>
          </Card>
          <Card className="sheen p-6">
            <div className="flex items-center gap-3 text-herb-700">
              <ClipboardCheck className="h-5 w-5" />
              <span className="text-sm font-medium uppercase tracking-[0.18em]">Needs review</span>
            </div>
            <div className="mt-4 text-4xl font-semibold text-surface-900">{counts.pending_verification}</div>
          </Card>
          <Card className="sheen p-6">
            <div className="flex items-center gap-3 text-herb-700">
              <CircleDollarSign className="h-5 w-5" />
              <span className="text-sm font-medium uppercase tracking-[0.18em]">Ready for payout</span>
            </div>
            <div className="mt-4 text-4xl font-semibold text-surface-900">{counts.ready_for_payout}</div>
          </Card>
          <Card className="sheen p-6">
            <div className="flex items-center gap-3 text-herb-700">
              <BadgeCheck className="h-5 w-5" />
              <span className="text-sm font-medium uppercase tracking-[0.18em]">Completed</span>
            </div>
            <div className="mt-4 text-4xl font-semibold text-surface-900">{counts.completed}</div>
          </Card>
        </section>

        <Card className="soft-panel p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => {
                const active = activeTab === tab.value;
                return (
                  <button
                    className={`rounded-full px-4 py-2 text-sm transition ${
                      active
                        ? "bg-herb-700 text-white shadow-[0_14px_30px_rgba(67,87,48,0.18)]"
                        : "border border-surface-200 bg-white/82 text-surface-700 hover:-translate-y-0.5"
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
            {queue.isLoading ? <div className="text-sm text-surface-600">Loading queue...</div> : null}
          </div>

          {visibleRows.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-surface-300 bg-surface-50/70 px-6 py-12 text-center">
              <p className="text-lg font-medium text-surface-900">No items in this queue state.</p>
              <p className="mt-2 text-sm leading-6 text-surface-600">
                Accepted applications will land here once creators start submitting content from mobile.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {visibleRows.map((row) => {
                const stage = getQueueStage(row);
                const submission = row.submission;
                const selectedMethod =
                  paymentMethodByApplication[row.id] ?? submission?.payment_method ?? row.opportunity?.payment_methods?.[0] ?? null;

                return (
                  <div
                    className="grid gap-5 rounded-[28px] border border-white/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.86),rgba(251,248,244,0.72))] p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(33,27,20,0.1)] lg:grid-cols-[1fr_0.9fr_0.8fr]"
                    key={row.id}
                  >
                    <div>
                      <div className="text-xs uppercase tracking-[0.18em] text-surface-500">
                        {row.opportunity?.title || "Accepted application"}
                      </div>
                      <div className="mt-2 text-2xl font-semibold text-surface-900">
                        {row.creator?.name || "Unnamed creator"}
                      </div>
                      <div className="mt-2 text-sm leading-6 text-surface-700">
                        Stage: <span className="font-medium">{formatStatus(stage)}</span>
                      </div>
                      <div className="mt-2 text-sm leading-6 text-surface-700">
                        @{row.creator?.instagram || row.creator?.tiktok || row.creator?.youtube || "No handle on file"}
                      </div>
                      <div className="mt-2 text-sm text-surface-600">
                        Niches: {row.creator?.niches?.join(", ") || "None listed"}
                      </div>
                    </div>

                    <div className="rounded-[24px] border border-white/80 bg-white/82 p-4">
                      {!submission ? (
                        <>
                          <div className="text-sm font-medium text-surface-900">Awaiting creator submission</div>
                          <div className="mt-3 text-sm leading-6 text-surface-600">
                            Creator has been accepted but has not posted content yet. Once they submit a post URL from
                            the native app, it will appear here for verification.
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-sm font-medium text-surface-900">Submission details</div>
                          <div className="mt-3 text-sm text-surface-700">
                            {formatPostType(submission.post_type)} • {formatStatus(submission.verification_status)}
                          </div>
                          <div className="mt-2 text-sm text-surface-700">
                            Payment method: {formatPaymentMethod(selectedMethod)}
                          </div>
                          <a
                            className="mt-3 inline-flex items-center text-sm font-medium text-herb-700"
                            href={submission.post_url}
                            rel="noreferrer"
                            target="_blank"
                          >
                            Open submitted post
                            <ArrowUpRight className="ml-1 h-4 w-4" />
                          </a>
                          {submission.verification_feedback ? (
                            <div className="mt-3 rounded-[20px] bg-surface-50 px-3 py-3 text-sm leading-6 text-surface-700">
                              {submission.verification_feedback}
                            </div>
                          ) : null}
                        </>
                      )}
                    </div>

                    <div className="flex flex-col gap-3">
                      {submission && !submission.payment_confirmed_by_brand ? (
                        <div className="rounded-[24px] border border-white/80 bg-white/82 p-4">
                          <div className="text-sm font-medium text-surface-900">Payout route</div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {(row.opportunity?.payment_methods ?? []).map((method) => {
                              const active = selectedMethod === method;
                              return (
                                <button
                                  className={`rounded-full px-3 py-1 text-sm transition ${
                                    active
                                      ? "bg-herb-700 text-white"
                                      : "border border-surface-200 bg-surface-50 text-surface-700"
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
                        </div>
                      ) : null}

                      {submission ? (
                        <textarea
                          className="premium-textarea min-h-[116px] text-sm text-surface-900"
                          onChange={(event) =>
                            setFeedbackByApplication((current) => ({ ...current, [row.id]: event.target.value }))
                          }
                          placeholder="Optional verification or revision note..."
                          value={feedbackByApplication[row.id] ?? submission.verification_feedback ?? ""}
                        />
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
                        <div className="rounded-[24px] border border-white/80 bg-white/82 p-4 text-sm leading-6 text-surface-700">
                          Brand confirmed: {submission.payment_confirmed_by_brand ? "Yes" : "No"}
                          <br />
                          Creator confirmed: {submission.payment_confirmed_by_creator ? "Yes" : "No"}
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </BrandWorkspaceShell>
  );
}
