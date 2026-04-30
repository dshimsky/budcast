"use client";

import Link from "next/link";
import {
  formatContentType,
  formatCount,
  formatDeadline,
  formatPaymentMethod,
  formatValueLabel,
  getCompensationLabel,
  getCompensationValue,
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
  Sparkles
} from "lucide-react";
import { BrandWorkspaceShell } from "../../../../components/brand-workspace-shell";
import { RouteTransitionScreen } from "../../../../components/route-transition-screen";
import { Button } from "../../../../components/ui/button";

function DetailChip({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex min-h-9 items-center rounded-full border border-white/[0.075] bg-white/[0.05] px-3 text-xs font-black uppercase tracking-[0.16em] text-[#d8ded1] shadow-[0_1px_0_rgba(255,255,255,0.035)_inset]">
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
    <BrandDetailSubPanel className="p-5">
      <div className="text-xs font-black uppercase tracking-[0.2em] text-[#7d7068]">{label}</div>
      <div className="mt-3 text-3xl font-black tracking-[-0.05em] text-[#fbfbf7]">{value}</div>
      <div className="mt-2 text-sm leading-6 text-[#c7ccc2]">{detail}</div>
    </BrandDetailSubPanel>
  );
}

function BrandDetailPanel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section
      className={`rounded-[30px] border border-white/[0.075] bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.024))] shadow-[0_24px_70px_rgba(0,0,0,0.38),0_1px_0_rgba(255,255,255,0.06)_inset] backdrop-blur-xl ${className}`}
    >
      {children}
    </section>
  );
}

function BrandDetailSubPanel({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLElement> & { children: React.ReactNode }) {
  return (
    <section
      className={`rounded-[24px] border border-white/[0.065] bg-black/25 shadow-[0_18px_45px_rgba(0,0,0,0.24),0_1px_0_rgba(255,255,255,0.035)_inset] ${className}`}
      {...props}
    >
      {children}
    </section>
  );
}

function BrandDetailEyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#e7ff9a]">{children}</p>;
}

function BrandMiniMetric({ detail, label, value }: { detail?: string; label: string; value: string | number }) {
  return (
    <BrandDetailSubPanel className="p-4">
      <div className="text-xs font-black uppercase tracking-[0.18em] text-[#7d7068]">{label}</div>
      <div className="mt-2 text-2xl font-black tracking-[-0.05em] text-[#fbfbf7]">{value}</div>
      {detail ? <div className="mt-2 text-sm text-[#c7ccc2]">{detail}</div> : null}
    </BrandDetailSubPanel>
  );
}

export default function BrandCampaignDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { brandContext, loading, session, profile } = useAuth();
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
    if (!loading && profile?.user_type && !brandContext) {
      router.replace("/dashboard");
    }
  }, [brandContext, loading, profile, router, session]);

  const isOwner =
    !campaign.data || !brandContext?.brandId ? true : campaign.data.brand_id === brandContext.brandId;

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
        primaryAction={{ href: "/sign-in", label: "Sign in" }}
        secondaryAction={{ href: "/", label: "Back to BudCast" }}
      />
    );
  }

  if (!hasCompletedOnboarding(profile)) {
    return (
      <RouteTransitionScreen
        eyebrow="Routing to setup"
        title="Campaign details unlock after setup."
        description="Complete your brand profile before managing campaign briefs."
        primaryAction={{ href: "/onboarding", label: "Finish setup" }}
        secondaryAction={{ href: "/dashboard", label: "Campaign control" }}
      />
    );
  }

  if (!brandContext) {
    return (
      <RouteTransitionScreen
        eyebrow="Brand only"
        title="This campaign surface is for cannabis brands."
        description="Creators can browse opportunities in the mobile app; brands manage briefs, applicants, submissions, and payments here."
        primaryAction={{ href: "/creator-dashboard", label: "Creator demo" }}
        secondaryAction={{ href: "/sign-in", label: "Switch account" }}
      />
    );
  }

  if (campaign.isLoading) {
    return (
      <RouteTransitionScreen
        eyebrow="Loading campaign"
        title="Pulling live campaign state."
        description="BudCast is loading the campaign brief, creator applicants, and content submission status."
        secondaryAction={{ href: "/dashboard", label: "Campaign control" }}
      />
    );
  }

  if (!campaign.data || !isOwner) {
    return (
      <BrandWorkspaceShell>
        <BrandDetailPanel className="p-8">
          <BrandDetailEyebrow>Campaign detail</BrandDetailEyebrow>
          <h1 className="mt-3 text-5xl font-black tracking-[-0.04em] text-[#fbfbf7]">Campaign not available.</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#d8ded1]">
            This campaign either no longer exists in campaign control or does not belong to the signed-in brand.
          </p>
          <div className="mt-6">
            <Button asChild>
              <Link href="/dashboard">Back to campaign control</Link>
            </Button>
          </div>
        </BrandDetailPanel>
      </BrandWorkspaceShell>
    );
  }

  const detail = campaign.data;
  const counts = applicants.counts;
  const remainingSlots = Math.max((detail.slots_available ?? 0) - (detail.slots_filled ?? 0), 0);
  const compensationLabel = getCompensationLabel(detail);
  const compensationSummary = getCompensationValue(detail);
  const campaignAssets = (detail.reference_image_urls ?? []).filter(Boolean);

  return (
    <BrandWorkspaceShell>
      <div className="flex flex-col gap-6">
        <BrandDetailPanel className="overflow-hidden border-[#b8ff3d]/16 bg-[radial-gradient(circle_at_86%_0%,rgba(184,255,61,0.16),transparent_30%),linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.024))] p-4 md:p-6">
          <div className="rounded-[30px] border border-white/[0.085] bg-[linear-gradient(135deg,#16210f,#050604_68%)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="max-w-4xl">
              <BrandDetailEyebrow>Campaign command sheet</BrandDetailEyebrow>
              <h1 className="mt-3 max-w-4xl text-5xl font-black leading-[0.9] tracking-[-0.045em] text-[#fbfbf7] md:text-6xl">{detail.title}</h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-[#d8ded1]">
                {detail.short_description || detail.description || "No campaign summary available yet."}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <div className="inline-flex min-h-9 items-center rounded-full border border-[#b8ff3d]/30 bg-[#b8ff3d]/12 px-3 text-xs font-black uppercase tracking-[0.2em] text-[#e7ff9a] shadow-[0_1px_0_rgba(255,255,255,0.035)_inset]">
                  {compensationLabel}
                </div>
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
                  Campaign control
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href={`/dashboard/campaigns/${detail.id}/applicants`}>Review applicants</Link>
              </Button>
              <Button asChild>
                <Link href={`/dashboard/submissions?campaign=${detail.id}`}>
                  Content approvals
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
          </div>
        </BrandDetailPanel>

        {submissionQueue.error ? (
          <BrandDetailSubPanel className="border-red-500/30 bg-red-500/10 p-5" role="alert">
            <BrandDetailEyebrow>Content approvals</BrandDetailEyebrow>
            <div className="mt-3 text-2xl font-black text-[#fbfbf7]">Content metrics unavailable.</div>
            <p className="mt-2 text-sm leading-7 text-red-100/80">
              BudCast could not load the content submission and payment queue for this campaign, so those counts are
              withheld instead of shown as zero.
            </p>
          </BrandDetailSubPanel>
        ) : null}

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <PipelineCard
            detail="Applications still awaiting a brand decision."
            label="Applicants waiting"
            value={counts.pending}
          />
          <PipelineCard
            detail="Creators already accepted into this campaign."
            label="Accepted creators"
            value={counts.accepted}
          />
          <PipelineCard
            detail="Accepted creators who have not submitted content yet."
            label="Content due"
            value={submissionQueue.error ? "Unavailable" : submissionCounts.awaitingContent}
          />
          <PipelineCard
            detail="Approved submissions still waiting on final payment confirmation."
            label="Payment/product pending"
            value={submissionQueue.error ? "Unavailable" : submissionCounts.awaitingPayout}
          />
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.04fr_0.96fr]">
          <BrandDetailPanel className="p-5 md:p-7">
            <div className="mb-5 flex items-center gap-3 text-[#fbfbf7]">
              <Layers3 className="h-5 w-5 text-[#e7ff9a]" />
              <h2 className="text-4xl font-black tracking-[-0.04em]">Creator-facing brief</h2>
            </div>

            <div className="grid gap-5">
              <BrandDetailSubPanel className="p-5">
                <div className="text-xs font-black uppercase tracking-[0.2em] text-[#7d7068]">Campaign listing</div>
                <p className="mt-3 text-sm leading-7 text-[#d8ded1]">
                  {detail.description || "No campaign description provided."}
                </p>
              </BrandDetailSubPanel>

              <div className="grid gap-5 md:grid-cols-2">
                <BrandDetailSubPanel className="p-5">
                  <div className="flex items-center gap-2 text-[#e7ff9a]">
                    <CircleDollarSign className="h-4 w-4" />
                    <span className="text-xs font-black uppercase tracking-[0.2em]">Compensation</span>
                  </div>
                  <div className="mt-3 text-2xl font-black text-[#fbfbf7]">{compensationSummary}</div>
                  <div className="mt-2 text-sm leading-6 text-[#c7ccc2]">
                    {detail.payment_methods?.length > 0
                      ? `Pays through ${detail.payment_methods.map((item) => formatPaymentMethod(item)).join(", ")}.`
                      : "No payment method selected for this compensation model."}
                  </div>
                </BrandDetailSubPanel>

                <BrandDetailSubPanel className="p-5">
                  <div className="flex items-center gap-2 text-[#e7ff9a]">
                    <Clock3 className="h-4 w-4" />
                    <span className="text-xs font-black uppercase tracking-[0.2em]">Creator spots</span>
                  </div>
                  <div className="mt-3 text-2xl font-black text-[#fbfbf7]">
                    {detail.slots_filled}/{detail.slots_available}
                  </div>
                  <div className="mt-2 text-sm leading-6 text-[#c7ccc2]">
                    {formatCount("slot remaining", remainingSlots)} with application deadline{" "}
                    {formatDeadline(detail.application_deadline)}.
                  </div>
                </BrandDetailSubPanel>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <BrandDetailSubPanel className="p-5">
                  <div className="flex items-center gap-2 text-[#e7ff9a]">
                    <Sparkles className="h-4 w-4" />
                    <span className="text-xs font-black uppercase tracking-[0.2em]">Content types</span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(detail.content_types ?? []).length > 0 ? (
                      detail.content_types.map((item) => <DetailChip key={item}>{formatContentType(item)}</DetailChip>)
                    ) : (
                      <div className="text-sm text-[#c7ccc2]">No content types listed.</div>
                    )}
                  </div>
                </BrandDetailSubPanel>

                <BrandDetailSubPanel className="p-5">
                  <div className="flex items-center gap-2 text-[#e7ff9a]">
                    <BadgeCheck className="h-4 w-4" />
                    <span className="text-xs font-black uppercase tracking-[0.2em]">Categories</span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(detail.categories ?? []).length > 0 ? (
                      detail.categories.map((item) => <DetailChip key={item}>{formatValueLabel(item)}</DetailChip>)
                    ) : (
                      <div className="text-sm text-[#c7ccc2]">No categories listed.</div>
                    )}
                  </div>
                </BrandDetailSubPanel>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <BrandDetailSubPanel className="p-5">
                  <div className="text-xs font-black uppercase tracking-[0.2em] text-[#7d7068]">Required hashtags</div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(detail.required_hashtags ?? []).length > 0 ? (
                      detail.required_hashtags.map((item) => <DetailChip key={item}>{item}</DetailChip>)
                    ) : (
                      <div className="text-sm text-[#c7ccc2]">No required hashtags.</div>
                    )}
                  </div>
                </BrandDetailSubPanel>

                <BrandDetailSubPanel className="p-5">
                  <div className="text-xs font-black uppercase tracking-[0.2em] text-[#7d7068]">Brand mention</div>
                  <div className="mt-3 text-lg font-black text-[#fbfbf7]">{detail.brand_mention || "Not set"}</div>
                  <div className="mt-2 text-sm leading-6 text-[#c7ccc2]">
                    Mention handling is part of the content approval flow.
                  </div>
                </BrandDetailSubPanel>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <BrandDetailSubPanel className="p-5">
                  <div className="text-xs font-black uppercase tracking-[0.2em] text-[#7d7068]">Must include</div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(detail.must_includes ?? []).length > 0 ? (
                      detail.must_includes.map((item) => <DetailChip key={item}>{item}</DetailChip>)
                    ) : (
                      <div className="text-sm text-[#c7ccc2]">No required callouts.</div>
                    )}
                  </div>
                </BrandDetailSubPanel>

                <BrandDetailSubPanel className="p-5">
                  <div className="text-xs font-black uppercase tracking-[0.2em] text-[#7d7068]">Off limits</div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(detail.off_limits ?? []).length > 0 ? (
                      detail.off_limits.map((item) => <DetailChip key={item}>{item}</DetailChip>)
                    ) : (
                      <div className="text-sm text-[#c7ccc2]">No off-limit callouts.</div>
                    )}
                  </div>
                </BrandDetailSubPanel>
              </div>

              <BrandDetailSubPanel className="p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-black uppercase tracking-[0.2em] text-[#7d7068]">Campaign assets</div>
                    <p className="mt-2 text-sm leading-6 text-[#c7ccc2]">
                      Logos, product visuals, packaging shots, and creative references attached from the Brand Kit.
                    </p>
                  </div>
                  <DetailChip>{campaignAssets.length} attached</DetailChip>
                </div>
                {campaignAssets.length > 0 ? (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {campaignAssets.slice(0, 4).map((assetUrl, index) => (
                      <div className="overflow-hidden rounded-[22px] border border-white/[0.075] bg-black/30" key={`${assetUrl}-${index}`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img alt="" className="aspect-[4/3] w-full object-cover" src={assetUrl} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 rounded-[22px] border border-dashed border-white/14 bg-white/[0.035] p-4 text-sm leading-6 text-[#aeb5aa]">
                    No campaign assets attached yet. Add them in the campaign builder so accepted creators know exactly which visuals to use.
                  </div>
                )}
              </BrandDetailSubPanel>
            </div>
          </BrandDetailPanel>

          <div className="grid gap-5">
            <BrandDetailPanel className="p-5 md:p-7">
              <div className="mb-5 flex items-center gap-3 text-[#fbfbf7]">
                <Inbox className="h-5 w-5 text-[#e7ff9a]" />
                <h2 className="text-3xl font-black tracking-[-0.05em]">Application queue</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
                <BrandMiniMetric label="Pending" value={counts.pending} detail="Still awaiting a brand decision." />
                <BrandMiniMetric label="Accepted" value={counts.accepted} detail="Accepted creators moving toward content submission." />
                <BrandMiniMetric label="Rejected" value={counts.rejected} detail="Reviewed out of this opportunity." />
                <BrandMiniMetric label="Total" value={counts.total} detail="Applications received for this campaign." />
              </div>
              <div className="mt-5">
                <Button asChild>
                  <Link href={`/dashboard/campaigns/${detail.id}/applicants`}>
                    Open applicant review
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </BrandDetailPanel>

            <BrandDetailPanel className="p-5 md:p-7">
              <div className="mb-5 flex items-center gap-3 text-[#fbfbf7]">
                <ShieldCheck className="h-5 w-5 text-[#e7ff9a]" />
                <h2 className="text-3xl font-black tracking-[-0.05em]">Content approvals</h2>
              </div>
              <div className="grid gap-4">
                <BrandMiniMetric label="Awaiting content" value={submissionQueue.error ? "Unavailable" : submissionCounts.awaitingContent} />
                <BrandMiniMetric label="Needs approval" value={submissionQueue.error ? "Unavailable" : submissionCounts.pendingVerification} />
                <BrandMiniMetric label="Needs revision" value={submissionQueue.error ? "Unavailable" : submissionCounts.needsRevision} />
                <BrandMiniMetric label="Completed payments" value={submissionQueue.error ? "Unavailable" : submissionCounts.completed} />
              </div>
              <div className="mt-5 text-sm leading-6 text-[#c7ccc2]">
                Submission status is based on accepted creators, submitted content links, approvals, and payment
                confirmations.
              </div>
              <div className="mt-5">
                <Button asChild variant="secondary">
                  <Link href={`/dashboard/submissions?campaign=${detail.id}`}>Open content submissions</Link>
                </Button>
              </div>
            </BrandDetailPanel>
          </div>
        </section>
      </div>
    </BrandWorkspaceShell>
  );
}
