"use client";

import Link from "next/link";
import {
  formatCampaignType,
  formatContentType,
  formatCount,
  formatCurrency,
  formatDeadline,
  formatPaymentMethod,
  formatValueLabel,
  hasCompletedOnboarding,
  useAuth,
  useBrandSubmissionQueue,
  useCampaign,
  useCampaignApplicants
} from "@budcast/shared";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CircleDollarSign,
  Clock3,
  Inbox,
  Layers3,
  ShieldCheck,
  Sparkles,
  Workflow
} from "lucide-react";
import { BrandWorkspaceShell } from "../../../../components/brand-workspace-shell";
import { RouteTransitionScreen } from "../../../../components/route-transition-screen";
import { Eyebrow } from "../../../../components/ui/eyebrow";
import { Button } from "../../../../components/ui/button";
import { LacquerSurface, SmokedPanel } from "../../../../components/ui/surface-tone";

function DetailChip({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-xs uppercase tracking-[0.2em] text-stone-300">
      {children}
    </div>
  );
}

function PipelineCard({
  label,
  value,
  detail
}: {
  label: string;
  value: string | number;
  detail: string;
}) {
  return (
    <SmokedPanel className="p-6">
      <div className="text-xs uppercase tracking-[0.2em] text-stone-500">{label}</div>
      <div className="mt-3 text-3xl font-semibold text-[#f5efe6]">{value}</div>
      <div className="mt-2 text-sm leading-6 text-stone-400">{detail}</div>
    </SmokedPanel>
  );
}

export default function BrandCampaignDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { loading, session, profile } = useAuth();
  const campaign = useCampaign(params.id);
  const applicants = useCampaignApplicants(params.id, "all");
  const submissionQueue = useBrandSubmissionQueue();

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

  const isOwner =
    !campaign.data || !profile?.id ? true : campaign.data.brand_id === profile.id;

  useEffect(() => {
    if (!campaign.isLoading && campaign.data && !isOwner) {
      router.replace("/dashboard");
    }
  }, [campaign.data, campaign.isLoading, isOwner, router]);

  const campaignSubmissions = useMemo(
    () => (submissionQueue.data ?? []).filter((row) => row.opportunity?.id === params.id),
    [params.id, submissionQueue.data]
  );

  const submissionCounts = useMemo(() => {
    let awaitingContent = 0;
    let pendingVerification = 0;
    let needsRevision = 0;
    let awaitingPayout = 0;
    let completed = 0;

    for (const row of campaignSubmissions) {
      const submission = row.submission;
      if (!submission) {
        awaitingContent += 1;
        continue;
      }

      if (submission.verification_status === "needs_revision") {
        needsRevision += 1;
        continue;
      }

      if (submission.verification_status === "pending") {
        pendingVerification += 1;
        continue;
      }

      if (submission.verification_status === "verified") {
        const fullyConfirmed = submission.payment_confirmed_by_brand && submission.payment_confirmed_by_creator;
        if (fullyConfirmed) {
          completed += 1;
        } else {
          awaitingPayout += 1;
        }
      }
    }

    return {
      awaitingContent,
      pendingVerification,
      needsRevision,
      awaitingPayout,
      completed
    };
  }, [campaignSubmissions]);

  if (loading || !session) {
    return (
      <RouteTransitionScreen
        eyebrow="Checking session"
        title="Preparing campaign brief."
        description="BudCast is validating your session before opening this campaign."
      />
    );
  }

  if (!hasCompletedOnboarding(profile)) {
    return (
      <RouteTransitionScreen
        eyebrow="Routing to setup"
        title="Campaign details unlock after setup."
        description="Complete your brand profile before managing campaign briefs."
      />
    );
  }

  if (profile?.user_type !== "brand") {
    return (
      <RouteTransitionScreen
        eyebrow="Brand only"
        title="This campaign dashboard is for cannabis brands."
        description="Creators can browse opportunities in the mobile app; brands manage briefs, applicants, submissions, and payments here."
      />
    );
  }

  if (campaign.isLoading) {
    return (
      <RouteTransitionScreen
        eyebrow="Loading campaign"
        title="Pulling live campaign state."
        description="BudCast is loading the campaign brief, creator applicants, and content submission status."
      />
    );
  }

  if (!campaign.data || !isOwner) {
    return (
      <BrandWorkspaceShell>
        <LacquerSurface className="p-8">
          <Eyebrow>Campaign detail</Eyebrow>
          <h1 className="mt-3 font-display text-5xl text-[#f5efe6]">Campaign not available.</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-stone-300">
            This campaign either no longer exists in your brand dashboard or does not belong to the signed-in brand.
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

  const detail = campaign.data;
  const counts = applicants.counts;
  const remainingSlots = Math.max((detail.slots_available ?? 0) - (detail.slots_filled ?? 0), 0);
  const compensationSummary =
    detail.cash_amount != null
      ? formatCurrency(detail.cash_amount)
      : detail.product_description || "Product-led";

  return (
    <BrandWorkspaceShell>
      <div className="flex flex-col gap-6">
        <LacquerSurface className="overflow-hidden px-7 py-8">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="max-w-4xl">
              <Eyebrow>Campaign brief</Eyebrow>
              <h1 className="mt-3 font-display text-5xl text-[#f5efe6] md:text-6xl">{detail.title}</h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-stone-300">
                {detail.short_description || detail.description || "No campaign summary available yet."}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <DetailChip>{formatCampaignType(detail.campaign_type)}</DetailChip>
                <DetailChip>{formatDeadline(detail.application_deadline)}</DetailChip>
                <DetailChip>{formatCount("slot open", remainingSlots)}</DetailChip>
                <DetailChip>{detail.credit_cost_per_slot ?? 0} credits / slot</DetailChip>
                {detail.campaign_number ? <DetailChip>{detail.campaign_number}</DetailChip> : null}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild variant="secondary">
                <Link href="/dashboard">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href={`/dashboard/campaigns/${detail.id}/applicants`}>Review applicants</Link>
              </Button>
              <Button asChild>
                <Link href={`/dashboard/submissions?campaign=${detail.id}`}>
                  Submission queue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </LacquerSurface>

        {submissionQueue.error ? (
          <SmokedPanel className="border-red-500/30 bg-red-500/10 p-5" role="alert">
            <Eyebrow className="text-red-200">Submission queue</Eyebrow>
            <div className="mt-3 text-2xl font-semibold text-[#f5efe6]">Submission metrics unavailable.</div>
            <p className="mt-2 text-sm leading-7 text-red-100/80">
              BudCast could not load the content submission and payment queue for this campaign, so those counts are
              withheld instead of shown as zero.
            </p>
          </SmokedPanel>
        ) : null}

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <PipelineCard
            detail="Applications still awaiting a brand decision."
            label="Pending applicants"
            value={counts.pending}
          />
          <PipelineCard
            detail="Creators already accepted into this campaign."
            label="Accepted creators"
            value={counts.accepted}
          />
          <PipelineCard
            detail="Accepted creators who have not submitted content yet."
            label="Awaiting content"
            value={submissionQueue.error ? "Unavailable" : submissionCounts.awaitingContent}
          />
          <PipelineCard
            detail="Approved submissions still waiting on final payment confirmation."
            label="Awaiting payment"
            value={submissionQueue.error ? "Unavailable" : submissionCounts.awaitingPayout}
          />
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.04fr_0.96fr]">
          <LacquerSurface className="p-8">
            <div className="mb-5 flex items-center gap-3 text-[#f5efe6]">
              <Layers3 className="h-5 w-5 text-[#d7c2a0]" />
              <h2 className="font-display text-4xl">Campaign brief</h2>
            </div>

            <div className="grid gap-5">
              <SmokedPanel className="p-5">
                <div className="text-xs uppercase tracking-[0.2em] text-stone-500">Description</div>
                <p className="mt-3 text-sm leading-7 text-stone-300">
                  {detail.description || "No campaign description provided."}
                </p>
              </SmokedPanel>

              <div className="grid gap-5 md:grid-cols-2">
                <SmokedPanel className="p-5">
                  <div className="flex items-center gap-2 text-[#d7c2a0]">
                    <CircleDollarSign className="h-4 w-4" />
                    <span className="text-xs uppercase tracking-[0.2em]">Compensation</span>
                  </div>
                  <div className="mt-3 text-2xl font-semibold text-[#f5efe6]">{compensationSummary}</div>
                  <div className="mt-2 text-sm leading-6 text-stone-400">
                    {detail.payment_methods?.length > 0
                      ? `Pays through ${detail.payment_methods.map((item) => formatPaymentMethod(item)).join(", ")}.`
                      : "No payment method selected for this campaign type."}
                  </div>
                </SmokedPanel>

                <SmokedPanel className="p-5">
                  <div className="flex items-center gap-2 text-[#d7c2a0]">
                    <Clock3 className="h-4 w-4" />
                    <span className="text-xs uppercase tracking-[0.2em]">Capacity</span>
                  </div>
                  <div className="mt-3 text-2xl font-semibold text-[#f5efe6]">
                    {detail.slots_filled}/{detail.slots_available}
                  </div>
                  <div className="mt-2 text-sm leading-6 text-stone-400">
                    {formatCount("slot remaining", remainingSlots)} with application deadline{" "}
                    {formatDeadline(detail.application_deadline)}.
                  </div>
                </SmokedPanel>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <SmokedPanel className="p-5">
                  <div className="flex items-center gap-2 text-[#d7c2a0]">
                    <Sparkles className="h-4 w-4" />
                    <span className="text-xs uppercase tracking-[0.2em]">Content types</span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(detail.content_types ?? []).length > 0 ? (
                      detail.content_types.map((item) => <DetailChip key={item}>{formatContentType(item)}</DetailChip>)
                    ) : (
                      <div className="text-sm text-stone-400">No content types listed.</div>
                    )}
                  </div>
                </SmokedPanel>

                <SmokedPanel className="p-5">
                  <div className="flex items-center gap-2 text-[#d7c2a0]">
                    <BadgeCheck className="h-4 w-4" />
                    <span className="text-xs uppercase tracking-[0.2em]">Categories</span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(detail.categories ?? []).length > 0 ? (
                      detail.categories.map((item) => <DetailChip key={item}>{formatValueLabel(item)}</DetailChip>)
                    ) : (
                      <div className="text-sm text-stone-400">No categories listed.</div>
                    )}
                  </div>
                </SmokedPanel>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <SmokedPanel className="p-5">
                  <div className="text-xs uppercase tracking-[0.2em] text-stone-500">Required hashtags</div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(detail.required_hashtags ?? []).length > 0 ? (
                      detail.required_hashtags.map((item) => <DetailChip key={item}>{item}</DetailChip>)
                    ) : (
                      <div className="text-sm text-stone-400">No required hashtags.</div>
                    )}
                  </div>
                </SmokedPanel>

                <SmokedPanel className="p-5">
                  <div className="text-xs uppercase tracking-[0.2em] text-stone-500">Brand mention</div>
                  <div className="mt-3 text-lg font-semibold text-[#f5efe6]">{detail.brand_mention || "Not set"}</div>
                  <div className="mt-2 text-sm leading-6 text-stone-400">
                    Mention handling is part of the content approval flow.
                  </div>
                </SmokedPanel>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <SmokedPanel className="p-5">
                  <div className="text-xs uppercase tracking-[0.2em] text-stone-500">Must include</div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(detail.must_includes ?? []).length > 0 ? (
                      detail.must_includes.map((item) => <DetailChip key={item}>{item}</DetailChip>)
                    ) : (
                      <div className="text-sm text-stone-400">No required callouts.</div>
                    )}
                  </div>
                </SmokedPanel>

                <SmokedPanel className="p-5">
                  <div className="text-xs uppercase tracking-[0.2em] text-stone-500">Off limits</div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(detail.off_limits ?? []).length > 0 ? (
                      detail.off_limits.map((item) => <DetailChip key={item}>{item}</DetailChip>)
                    ) : (
                      <div className="text-sm text-stone-400">No off-limit callouts.</div>
                    )}
                  </div>
                </SmokedPanel>
              </div>
            </div>
          </LacquerSurface>

          <div className="grid gap-5">
            <LacquerSurface className="p-8">
              <div className="mb-5 flex items-center gap-3 text-[#f5efe6]">
                <Inbox className="h-5 w-5 text-[#d7c2a0]" />
                <h2 className="font-display text-3xl">Application queue</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
                <SmokedPanel className="p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-stone-500">Pending</div>
                  <div className="mt-2 text-2xl font-semibold text-[#f5efe6]">{counts.pending}</div>
                  <div className="mt-2 text-sm text-stone-400">Still awaiting a brand decision.</div>
                </SmokedPanel>
                <SmokedPanel className="p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-stone-500">Accepted</div>
                  <div className="mt-2 text-2xl font-semibold text-[#f5efe6]">{counts.accepted}</div>
                  <div className="mt-2 text-sm text-stone-400">Accepted creators moving toward content submission.</div>
                </SmokedPanel>
                <SmokedPanel className="p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-stone-500">Rejected</div>
                  <div className="mt-2 text-2xl font-semibold text-[#f5efe6]">{counts.rejected}</div>
                  <div className="mt-2 text-sm text-stone-400">Reviewed out of this opportunity.</div>
                </SmokedPanel>
                <SmokedPanel className="p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-stone-500">Total</div>
                  <div className="mt-2 text-2xl font-semibold text-[#f5efe6]">{counts.total}</div>
                  <div className="mt-2 text-sm text-stone-400">Applications received for this campaign.</div>
                </SmokedPanel>
              </div>
              <div className="mt-5">
                <Button asChild>
                  <Link href={`/dashboard/campaigns/${detail.id}/applicants`}>
                    Open applicant review
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </LacquerSurface>

            <LacquerSurface className="p-8">
              <div className="mb-5 flex items-center gap-3 text-[#f5efe6]">
                <ShieldCheck className="h-5 w-5 text-[#d7c2a0]" />
                <h2 className="font-display text-3xl">Submission queue</h2>
              </div>
              <div className="grid gap-4">
                <SmokedPanel className="p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-stone-500">Awaiting content</div>
                  <div className="mt-2 text-2xl font-semibold text-[#f5efe6]">
                    {submissionQueue.error ? "Unavailable" : submissionCounts.awaitingContent}
                  </div>
                </SmokedPanel>
                <SmokedPanel className="p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-stone-500">Needs approval</div>
                  <div className="mt-2 text-2xl font-semibold text-[#f5efe6]">
                    {submissionQueue.error ? "Unavailable" : submissionCounts.pendingVerification}
                  </div>
                </SmokedPanel>
                <SmokedPanel className="p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-stone-500">Needs revision</div>
                  <div className="mt-2 text-2xl font-semibold text-[#f5efe6]">
                    {submissionQueue.error ? "Unavailable" : submissionCounts.needsRevision}
                  </div>
                </SmokedPanel>
                <SmokedPanel className="p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-stone-500">Completed payments</div>
                  <div className="mt-2 text-2xl font-semibold text-[#f5efe6]">
                    {submissionQueue.error ? "Unavailable" : submissionCounts.completed}
                  </div>
                </SmokedPanel>
              </div>
              <div className="mt-5 text-sm leading-6 text-stone-400">
                Submission status is based on accepted creators, submitted content links, approvals, and payment
                confirmations.
              </div>
              <div className="mt-5">
                <Button asChild variant="secondary">
                  <Link href={`/dashboard/submissions?campaign=${detail.id}`}>Open content submissions</Link>
                </Button>
              </div>
            </LacquerSurface>
          </div>
        </section>
      </div>
    </BrandWorkspaceShell>
  );
}
