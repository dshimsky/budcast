"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import {
  type BrandSubmissionQueueRow,
  formatDeliverable,
  formatPaymentMethod,
  getTrustComplianceGateCopy,
  hasCompletedOnboarding,
  hasCompletedTrustCompliance,
  useAuth,
  useBrandSubmissionQueue,
  useConfirmSubmissionPayment,
  useUpdateContentSubmissionVerification
} from "@budcast/shared";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowUpRight, BadgeCheck, ClipboardCheck, Clock3, MessageSquareText } from "lucide-react";
import { BrandWorkspaceShell } from "../../../components/brand-workspace-shell";
import { RouteTransitionScreen } from "../../../components/route-transition-screen";
import { CreatorIdentityRow, MarketplaceBadge, MetadataStrip, WorkQueueItem } from "../../../components/marketplace";
import { Button } from "../../../components/ui/button";

type QueueTab = "all" | "submitted" | "needs_review" | "revision_requested" | "approved" | "complete";

function getQueueStage(row: BrandSubmissionQueueRow): QueueTab {
  if (!row?.submission) return "submitted";
  if (row.submission.verification_status === "pending") return "needs_review";
  if (row.submission.verification_status === "needs_revision" || row.submission.verification_status === "failed") {
    return "revision_requested";
  }
  if (row.submission.verification_status === "verified") {
    if (row.submission.payment_confirmed_by_brand && row.submission.payment_confirmed_by_creator) {
      return "complete";
    }
    return "approved";
  }
  return "all";
}

function getReviewStatusLabel(row: BrandSubmissionQueueRow) {
  const stage = getQueueStage(row);
  if (stage === "submitted") return "Submitted";
  if (stage === "needs_review") return "Needs review";
  if (stage === "revision_requested") return "Revision requested";
  if (stage === "approved") return "Approved";
  if (stage === "complete") return "Complete";
  return "Submitted";
}

function getCompensationLabel(type?: string | null) {
  if (type === "paid") return "Paid";
  if (type === "hybrid") return "Paid + Product";
  return "Product";
}

function getFulfillmentActionLabel(type?: string | null) {
  if (type === "paid") return "Confirm payment sent";
  if (type === "hybrid") return "Confirm payment and product status";
  return "Confirm product status";
}

function getFulfillmentMethodLabel(type?: string | null) {
  if (type === "paid") return "Creator payout method";
  if (type === "hybrid") return "Creator payout/product status method";
  return "Product status method";
}

function getFulfillmentStatusLabel(type?: string | null) {
  if (type === "paid") return "Payment status";
  if (type === "hybrid") return "Payment/product status";
  return "Product status";
}

function formatApplicationStatus(status: string | null | undefined) {
  if (status === "pending") return "Pending";
  if (status === "accepted") return "Accepted";
  if (status === "rejected") return "Rejected";
  if (status === "pending_review") return "Pending review";
  if (status === "withdrawn") return "Withdrawn";
  if (!status) return "—";
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

function formatConfirmationDetail(confirmed: boolean, actorId?: string | null, confirmedAt?: string | null) {
  if (!confirmed) return "No";
  const actor = actorId ? ` by ${actorId.slice(0, 8)}` : "";
  const at = confirmedAt ? ` at ${new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(confirmedAt))}` : "";
  return `Yes${actor}${at}`;
}

function formatChipLabel(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\big\b/gi, "Instagram")
    .replace(/\bugc\b/gi, "UGC")
    .replace(/\btiktok\b/gi, "TikTok")
    .replace(/\byoutube\b/gi, "YouTube")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getCreatorHandle(creator: BrandSubmissionQueueRow["creator"]) {
  const handle = creator?.instagram || creator?.tiktok || creator?.youtube;
  if (!handle) return null;
  return handle.startsWith("@") ? handle : `@${handle}`;
}

function getBadgeTone(stage: QueueTab) {
  if (stage === "complete" || stage === "approved") return "status";
  if (stage === "needs_review" || stage === "revision_requested") return "urgent";
  return "neutral";
}

function SubmissionReviewCard({
  confirmPending,
  feedback,
  onConfirmPayment,
  onFeedbackChange,
  onPaymentMethodChange,
  onVerification,
  paymentMethod,
  row,
  verifyPending
}: {
  confirmPending: boolean;
  feedback: string;
  onConfirmPayment: (applicationId: string, submissionId: string) => void;
  onFeedbackChange: (applicationId: string, value: string) => void;
  onPaymentMethodChange: (applicationId: string, method: string) => void;
  onVerification: (applicationId: string, submissionId: string, status: "verified" | "needs_revision") => void;
  paymentMethod: string | null;
  row: BrandSubmissionQueueRow;
  verifyPending: boolean;
}) {
  const stage = getQueueStage(row);
  const submission = row.submission;
  const statusLabel = getReviewStatusLabel(row);
  const compensationLabel = getCompensationLabel(row.opportunity?.campaign_type);
  const fulfillmentActionLabel = getFulfillmentActionLabel(row.opportunity?.campaign_type);
  const fulfillmentMethodLabel = getFulfillmentMethodLabel(row.opportunity?.campaign_type);
  const fulfillmentStatusLabel = getFulfillmentStatusLabel(row.opportunity?.campaign_type);
  const canReview = Boolean(submission && stage === "needs_review");
  const rightsConfirmed = row.opportunity?.rights_confirmed === true;

  return (
    <article className="overflow-hidden rounded-[34px] border border-white/[0.075] bg-[linear-gradient(145deg,rgba(255,255,255,0.07),rgba(255,255,255,0.024))] shadow-[0_22px_70px_rgba(0,0,0,0.28),0_1px_0_rgba(255,255,255,0.045)_inset] transition hover:-translate-y-1 hover:border-[#b8ff3d]/24">
      <div className="bg-[radial-gradient(circle_at_84%_0%,rgba(184,255,61,0.13),transparent_30%),linear-gradient(135deg,rgba(22,33,15,0.84),rgba(5,6,4,0.9)_68%)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <CreatorIdentityRow
            avatarUrl={row.creator?.avatar_url}
            badges={row.creator?.badges}
            handle={getCreatorHandle(row.creator)}
            name={row.creator?.name || "Unnamed creator"}
          />
          <MarketplaceBadge tone={getBadgeTone(stage)}>{statusLabel}</MarketplaceBadge>
        </div>
      </div>
      <div className="grid gap-5 p-5 xl:grid-cols-[0.9fr_minmax(0,1fr)_330px]">
        <div className="min-w-0">
          <div className="rounded-[26px] border border-white/[0.065] bg-black/20 p-4 shadow-[0_1px_0_rgba(255,255,255,0.035)_inset]">
            <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#e7ff9a]">Campaign</div>
            <div className="mt-2 text-lg font-black leading-7 text-[#fbfbf7]">
              {row.opportunity?.title || "Accepted campaign"}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <MarketplaceBadge tone="money">{compensationLabel}</MarketplaceBadge>
              {(row.creator?.niches ?? []).slice(0, 2).map((niche) => (
                <MarketplaceBadge key={niche} tone="content">
                  {formatChipLabel(niche)}
                </MarketplaceBadge>
              ))}
            </div>
          </div>
          <MetadataStrip
            className="mt-4 grid-cols-2"
            items={[
              { label: "Application", value: formatApplicationStatus(row.status) },
              { label: "Creator reviews", value: String(row.creator?.review_count ?? 0) }
            ]}
          />
        </div>

        <div className="rounded-[28px] border border-white/[0.065] bg-[#101010]/82 p-4 shadow-[0_1px_0_rgba(255,255,255,0.035)_inset]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#aeb5aa]">Content review</div>
              <div className="mt-2 text-xl font-black text-[#fbfbf7]">
                {submission ? formatDeliverable(submission.post_type) : "Content link pending"}
              </div>
            </div>
          </div>

          {submission ? (
            <>
              <a
                className="mt-5 inline-flex min-h-10 items-center rounded-full border border-[#b8ff3d]/22 bg-[#b8ff3d]/10 px-4 text-sm font-black text-[#e7ff9a] transition hover:-translate-y-0.5 hover:bg-[#b8ff3d]/14"
                href={submission.post_url}
                rel="noreferrer"
                target="_blank"
              >
                Open submitted content
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </a>
              <MetadataStrip
                className="mt-4 grid-cols-2"
                items={[
                  { label: "Submitted", value: new Date(submission.created_at).toLocaleDateString() },
                  { label: "Method", value: formatPaymentMethod(paymentMethod) }
                ]}
              />
              <div className="mt-4 rounded-[22px] border border-white/[0.065] bg-black/20 p-4 shadow-[0_1px_0_rgba(255,255,255,0.035)_inset]">
                <div className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#aeb5aa]">
                  <MessageSquareText className="h-3.5 w-3.5" />
                  Notes
                </div>
                <p className="text-sm leading-6 text-[#d8ded1]">
                  {submission.verification_feedback || "No revision notes or feedback yet."}
                </p>
              </div>
            </>
          ) : (
            <div className="mt-5 rounded-[24px] border border-dashed border-white/12 bg-black/20 p-4 text-sm leading-6 text-[#c7ccc2] shadow-[0_1px_0_rgba(255,255,255,0.035)_inset]">
              The creator has been accepted. Their submitted content link will appear here when available.
            </div>
          )}
        </div>

        <aside className="grid content-start gap-3">
          {submission && !submission.payment_confirmed_by_brand ? (
            <div className="rounded-[26px] border border-white/[0.065] bg-black/20 p-4 shadow-[0_1px_0_rgba(255,255,255,0.035)_inset]">
              <div className="text-sm font-black text-[#fbfbf7]">{fulfillmentMethodLabel}</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {(row.opportunity?.payment_methods ?? []).map((method) => {
                  const active = paymentMethod === method;
                  return (
                    <button
                      aria-pressed={active}
                      className={`rounded-full border px-3 py-2 text-sm font-bold transition ${
                        active
                          ? "border-[#b8ff3d]/40 bg-[#b8ff3d]/14 text-[#e7ff9a]"
                          : "border-white/[0.075] bg-white/[0.04] text-[#c7ccc2]"
                      }`}
                      key={method}
                      onClick={() => onPaymentMethodChange(row.id, method)}
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
            <label className="block text-sm font-black text-[#d8ded1]">
              Approval or revision note
              <textarea
                className="premium-textarea mt-2 min-h-[116px] text-sm"
                onChange={(event) => onFeedbackChange(row.id, event.target.value)}
                placeholder="Optional approval or revision note..."
                value={feedback}
              />
            </label>
          ) : null}

          <div className="flex flex-wrap gap-2">
            {submission && canReview ? (
              <>
                <Button
                  disabled={verifyPending || !rightsConfirmed}
                  onClick={() => onVerification(row.id, submission.id, "verified")}
                >
                  Approve content
                </Button>
                <Button disabled={verifyPending} onClick={() => onVerification(row.id, submission.id, "needs_revision")} variant="secondary">
                  Request revision
                </Button>
              </>
            ) : null}

            {submission && submission.verification_status === "verified" && !submission.payment_confirmed_by_brand ? (
              <Button
                disabled={confirmPending}
                onClick={() => onConfirmPayment(row.id, submission.id)}
              >
                {fulfillmentActionLabel}
              </Button>
            ) : null}
          </div>

          {submission && canReview && !rightsConfirmed ? (
            <div className="rounded-[22px] border border-amber-400/25 bg-amber-400/10 p-4 text-sm leading-6 text-[#d8ded1]">
              Confirm campaign usage rights before approving creator content.
            </div>
          ) : null}

          {submission ? (
            <div className="rounded-[26px] border border-white/[0.065] bg-black/20 p-4 text-sm leading-6 text-[#d8ded1] shadow-[0_1px_0_rgba(255,255,255,0.035)_inset]">
              <div className="font-black text-[#fbfbf7]">{fulfillmentStatusLabel}</div>
              <div className="mt-2">
                Brand confirmed:{" "}
                {formatConfirmationDetail(
                  submission.payment_confirmed_by_brand,
                  submission.brand_confirmed_by_user_id ?? submission.payment_confirmed_by_user_id,
                  submission.brand_confirmed_at
                )}
              </div>
              <div>
                Creator confirmed:{" "}
                {formatConfirmationDetail(
                  submission.payment_confirmed_by_creator,
                  submission.creator_confirmed_by_user_id,
                  submission.creator_confirmed_at
                )}
              </div>
            </div>
          ) : null}
        </aside>
      </div>
    </article>
  );
}

function SubmissionQueueInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { brandContext, brandTeamBrand, loading, session, profile } = useAuth();
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
    const complianceProfile = brandTeamBrand ?? profile;
    if (!loading && session && (!hasCompletedOnboarding(profile) || !hasCompletedTrustCompliance(complianceProfile))) {
      router.replace("/onboarding");
      return;
    }
    if (!loading && profile?.user_type && !brandContext) {
      router.replace("/dashboard");
    }
  }, [brandContext, brandTeamBrand, loading, profile, router, session]);

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
        approved: 0,
        complete: 0,
        needs_review: 0,
        revision_requested: 0,
        submitted: 0
      }
    );
  }, [campaignRows]);

  const visibleRows = campaignRows.filter((row) => activeTab === "all" || getQueueStage(row) === activeTab);
  const tabs: Array<{ value: QueueTab; label: string; count: number }> = [
    { count: counts.all, label: "All", value: "all" },
    { count: counts.submitted, label: "Submitted", value: "submitted" },
    { count: counts.needs_review, label: "Needs review", value: "needs_review" },
    { count: counts.revision_requested, label: "Revision requested", value: "revision_requested" },
    { count: counts.approved, label: "Approved", value: "approved" },
    { count: counts.complete, label: "Complete", value: "complete" }
  ];

  if (loading || !session) {
    return (
      <RouteTransitionScreen
        description="BudCast is validating your session before opening content review and fulfillment tracking."
        eyebrow="Checking session"
        title="Preparing content approvals."
      />
    );
  }

  if (!hasCompletedOnboarding(profile)) {
    return (
      <RouteTransitionScreen
        description="Content submissions unlock after your brand profile is complete."
        eyebrow="Routing to setup"
        title="Complete setup before reviewing submissions."
      />
    );
  }

  if (!hasCompletedTrustCompliance(brandTeamBrand ?? profile)) {
    return (
      <RouteTransitionScreen
        description={getTrustComplianceGateCopy(brandTeamBrand ?? profile)}
        eyebrow="Compliance setup"
        title="Complete trust setup before reviewing content."
        primaryAction={{ href: "/onboarding", label: "Finish setup" }}
        secondaryAction={{ href: "/dashboard", label: "Back to dashboard" }}
      />
    );
  }

  if (!brandContext) {
    return (
      <RouteTransitionScreen
        description="Creators track submitted content and fulfillment status from the mobile app; brands review submitted content here."
        eyebrow="Brand only"
        title="This queue is brand-side only."
      />
    );
  }

  if (queue.error) {
    return (
      <BrandWorkspaceShell>
        <section className="rounded-[34px] border border-white/[0.075] bg-white/[0.035] p-8 shadow-[0_24px_70px_rgba(0,0,0,0.34),0_1px_0_rgba(255,255,255,0.045)_inset]">
          <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#e7ff9a]">Content approvals</div>
          <h1 className="mt-4 text-5xl font-black leading-[0.92] tracking-[-0.045em] text-[#fbfbf7]">
            Content approvals unavailable.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#d8ded1]">
            BudCast could not load content review and fulfillment status. Try reopening approvals from campaign control.
          </p>
          <Button asChild className="mt-6">
            <Link href="/dashboard">Back to campaign control</Link>
          </Button>
        </section>
      </BrandWorkspaceShell>
    );
  }

  async function handleVerification(applicationId: string, submissionId: string, status: "verified" | "needs_revision") {
    try {
      setActionError(null);
      await verifySubmission.mutateAsync({
        applicationId,
        submissionId,
        verificationFeedback: feedbackByApplication[applicationId] ?? null,
        verificationStatus: status
      });
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Content review failed.");
    }
  }

  async function handleConfirmPayment(applicationId: string, submissionId: string) {
    const row = rows.find((item) => item.id === applicationId);
    const fallbackMethod = row?.submission?.payment_method ?? row?.opportunity?.payment_methods?.[0] ?? null;
    try {
      setActionError(null);
      await confirmPayment.mutateAsync({
        applicationId,
        paymentMethod: (paymentMethodByApplication[applicationId] ?? fallbackMethod) as
          | "venmo"
          | "zelle"
          | "cashapp"
          | "paypal"
          | null,
        submissionId
      });
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Payment confirmation failed.");
    }
  }

  return (
    <BrandWorkspaceShell>
      <div className="flex flex-col gap-5">
        <section className="overflow-hidden rounded-[38px] border border-[#b8ff3d]/16 bg-[radial-gradient(circle_at_86%_0%,rgba(184,255,61,0.16),transparent_30%),linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.024))] p-4 shadow-[0_28px_90px_rgba(0,0,0,0.42),0_1px_0_rgba(255,255,255,0.05)_inset] md:p-6">
          <div className="rounded-[30px] border border-white/[0.085] bg-[linear-gradient(135deg,#16210f,#050604_68%)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="max-w-4xl">
              <Link
                className="inline-flex items-center gap-2 text-sm font-black text-[#c7ccc2] transition hover:text-[#fbfbf7]"
                href={activeCampaignId ? `/dashboard/campaigns/${activeCampaignId}` : "/dashboard"}
              >
                <ArrowLeft className="h-4 w-4" />
                {activeCampaignId ? "Back to campaign" : "Back to campaign control"}
              </Link>
              <div className="mt-5 text-[11px] font-black uppercase tracking-[0.2em] text-[#e7ff9a]">Content approvals</div>
              <h1 className="mt-3 text-5xl font-black leading-[0.92] tracking-[-0.045em] text-[#fbfbf7] md:text-6xl">
                Review creator content and track fulfillment.
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-[#d8ded1]">
                Accepted creators submit content links here. Approve content, request revisions, and confirm
                payment and product status without losing campaign context.
              </p>
              {activeCampaignTitle ? (
                <MarketplaceBadge className="mt-4" tone="content">
                  Filtered to {activeCampaignTitle}
                </MarketplaceBadge>
              ) : null}
            </div>
          </div>
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-4">
          {[
            { icon: Clock3, label: "Submitted", value: counts.submitted },
            { icon: ClipboardCheck, label: "Needs review", value: counts.needs_review },
            { icon: MessageSquareText, label: "Revision requested", value: counts.revision_requested },
            { icon: BadgeCheck, label: "Approved", value: counts.approved + counts.complete }
          ].map((metric) => {
            const Icon = metric.icon;
            return (
              <div className="rounded-[28px] border border-white/[0.075] bg-white/[0.035] p-5 shadow-[0_18px_45px_rgba(0,0,0,0.22),0_1px_0_rgba(255,255,255,0.035)_inset]" key={metric.label}>
                <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#e7ff9a]">
                  <Icon className="h-4 w-4" />
                  {metric.label}
                </div>
                <div className="mt-3 text-3xl font-black text-[#fbfbf7]">{metric.value}</div>
              </div>
            );
          })}
        </section>

        <section className="rounded-[34px] border border-white/[0.075] bg-white/[0.035] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.32),0_1px_0_rgba(255,255,255,0.045)_inset] md:p-6">
          <div className="mb-5 grid gap-4">
            <div className="flex flex-wrap gap-2">
              <button
                aria-pressed={!activeCampaignId}
                className={`rounded-full border px-4 py-2.5 text-sm font-black transition ${
                  !activeCampaignId
                    ? "border-[#b8ff3d]/42 bg-[#b8ff3d]/14 text-[#e7ff9a]"
                    : "border-white/[0.075] bg-white/[0.04] text-[#c7ccc2] hover:-translate-y-0.5"
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
                    className={`rounded-full border px-4 py-2.5 text-sm font-black transition ${
                      active
                        ? "border-[#b8ff3d]/42 bg-[#b8ff3d]/14 text-[#e7ff9a]"
                        : "border-white/[0.075] bg-white/[0.04] text-[#c7ccc2] hover:-translate-y-0.5"
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
                    className={`rounded-full border px-4 py-2.5 text-sm font-black transition ${
                      active
                        ? "border-[#b8ff3d]/42 bg-[#b8ff3d]/14 text-[#e7ff9a]"
                        : "border-white/[0.075] bg-white/[0.04] text-[#c7ccc2] hover:-translate-y-0.5"
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
            {queue.isLoading ? <div className="text-sm text-[#aeb5aa]">Loading queue...</div> : null}
          </div>

          {actionError ? (
            <div className="mb-5 rounded-[24px] border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200" role="alert">
              {actionError}
            </div>
          ) : null}

          {queue.isLoading ? (
            <div className="rounded-[30px] border border-dashed border-white/12 bg-black/20 px-6 py-12 text-center">
              <p className="text-lg font-black text-[#fbfbf7]">Loading content submissions...</p>
              <p className="mt-2 text-sm leading-6 text-[#c7ccc2]">
                BudCast is pulling the live content and fulfillment queue before showing empty states.
              </p>
            </div>
          ) : visibleRows.length === 0 ? (
            <div className="rounded-[30px] border border-dashed border-white/12 bg-black/20 px-6 py-12 text-center">
              <p className="text-lg font-black text-[#fbfbf7]">No items in this queue state.</p>
              <p className="mt-2 text-sm leading-6 text-[#c7ccc2]">
                Accepted applications land here once creators start submitting content from mobile.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {visibleRows.map((row) => {
                const submission = row.submission;
                const selectedMethod =
                  paymentMethodByApplication[row.id] ?? submission?.payment_method ?? row.opportunity?.payment_methods?.[0] ?? null;

                return (
                  <SubmissionReviewCard
                    confirmPending={confirmPayment.isPending}
                    feedback={feedbackByApplication[row.id] ?? submission?.verification_feedback ?? ""}
                    key={row.id}
                    onConfirmPayment={(applicationId, submissionId) => void handleConfirmPayment(applicationId, submissionId)}
                    onFeedbackChange={(applicationId, value) =>
                      setFeedbackByApplication((current) => ({ ...current, [applicationId]: value }))
                    }
                    onPaymentMethodChange={(applicationId, method) =>
                      setPaymentMethodByApplication((current) => ({ ...current, [applicationId]: method }))
                    }
                    onVerification={(applicationId, submissionId, status) =>
                      void handleVerification(applicationId, submissionId, status)
                    }
                    paymentMethod={selectedMethod}
                    row={row}
                    verifyPending={verifySubmission.isPending}
                  />
                );
              })}
            </div>
          )}
        </section>

        <section className="grid gap-3 lg:grid-cols-3">
          <WorkQueueItem
            description="Open submitted links, approve content, or request a revision with clear notes."
            title="Review creator submissions"
          />
          <WorkQueueItem
            description="After approval, confirm payment and product status so both sides know what is complete."
            title="Confirm fulfillment"
          />
          <WorkQueueItem
            description="Use messages to coordinate campaign timing, content usage, product status, and payment details."
            title="Coordinate details"
          />
        </section>
      </div>
    </BrandWorkspaceShell>
  );
}

export default function SubmissionQueuePage() {
  return (
    <Suspense
      fallback={
        <RouteTransitionScreen
          description="BudCast is opening content approvals and applying your current campaign filter."
          eyebrow="Loading queue"
          title="Preparing content submissions."
        />
      }
    >
      <SubmissionQueueInner />
    </Suspense>
  );
}
