"use client";

import Link from "next/link";
import {
  formatCompact,
  formatCount,
  formatDeadline,
  hasCompletedOnboarding,
  parseReviewError,
  useAuth,
  useCampaign,
  useCampaignApplicants,
  useReviewApplication
} from "@budcast/shared";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, BadgeCheck, Clock3, LoaderCircle, Sparkles, Users2, Workflow } from "lucide-react";
import { BrandWorkspaceShell } from "../../../../../components/brand-workspace-shell";
import { RouteTransitionScreen } from "../../../../../components/route-transition-screen";
import { Eyebrow } from "../../../../../components/ui/eyebrow";
import { Button } from "../../../../../components/ui/button";
import { LacquerSurface, SmokedPanel } from "../../../../../components/ui/surface-tone";

type ApplicantTab = "pending" | "accepted" | "rejected" | "all";

function reviewCopy(key: ReturnType<typeof parseReviewError>) {
  switch (key) {
    case "INVALID_DECISION":
      return "The requested review decision is invalid.";
    case "APPLICATION_NOT_FOUND":
      return "That application no longer exists.";
    case "APPLICATION_NOT_PENDING":
      return "That application has already been reviewed.";
    case "NOT_OPPORTUNITY_OWNER":
      return "Only the owning brand can review this application.";
    default:
      return "Review action failed.";
  }
}

export default function CampaignApplicantsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { loading, session, profile } = useAuth();
  const campaign = useCampaign(params.id);
  const [activeTab, setActiveTab] = useState<ApplicantTab>("pending");
  const applicants = useCampaignApplicants(params.id, activeTab);
  const reviewApplication = useReviewApplication();
  const [feedback, setFeedback] = useState<string | null>(null);

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

  async function handleDecision(applicationId: string, decision: "accept" | "reject") {
    if (!params.id) return;
    try {
      setFeedback(null);
      await reviewApplication.mutateAsync({
        applicationId,
        opportunityId: params.id,
        decision
      });
    } catch (error) {
      setFeedback(reviewCopy(parseReviewError(error)));
    }
  }

  const counts = applicants.counts;
  const tabs: Array<{ label: string; value: ApplicantTab; count: number }> = [
    { label: "Pending", value: "pending", count: counts.pending },
    { label: "Accepted", value: "accepted", count: counts.accepted },
    { label: "Rejected", value: "rejected", count: counts.rejected },
    { label: "All", value: "all", count: counts.total }
  ];

  if (loading || !session) {
    return (
      <RouteTransitionScreen
        eyebrow="Checking session"
        title="Preparing applicant review."
        description="BudCast is validating your session before exposing creator application decisions."
      />
    );
  }

  if (!hasCompletedOnboarding(profile)) {
    return (
      <RouteTransitionScreen
        eyebrow="Routing to setup"
        title="Onboarding needs to finish first."
        description="Applicant review unlocks once your brand profile is fully routed and ready."
      />
    );
  }

  if (profile?.user_type !== "brand") {
    return (
      <RouteTransitionScreen
        eyebrow="Brand only"
        title="Applicant review is for cannabis brands."
        description="Creator accounts can manage applications and submissions, but not review queues."
      />
    );
  }

  if (campaign.error || applicants.error) {
    return (
      <BrandWorkspaceShell>
        <LacquerSurface className="p-8">
          <Eyebrow>Applicant review</Eyebrow>
          <h1 className="mt-3 font-display text-5xl text-[#f5efe6]">Review queue unavailable.</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-stone-300">
            BudCast could not load this campaign review queue. Return to the dashboard and reopen the campaign.
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

  if (!campaign.isLoading && !campaign.data) {
    return (
      <BrandWorkspaceShell>
        <LacquerSurface className="p-8">
          <Eyebrow>Applicant review</Eyebrow>
          <h1 className="mt-3 font-display text-5xl text-[#f5efe6]">Campaign not available.</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-stone-300">
            This campaign either no longer exists in your brand dashboard or is not available to this brand account.
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

  return (
    <BrandWorkspaceShell>
      <div className="flex flex-col gap-6">
        <LacquerSurface className="overflow-hidden px-7 py-8">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="max-w-3xl">
              <Eyebrow>Applicant review</Eyebrow>
              <h1 className="mt-3 font-display text-5xl text-[#f5efe6] md:text-6xl">
                {campaign.data?.title || "Campaign applicants"}
              </h1>
              <p className="mt-4 text-base leading-8 text-stone-300">
                Review creator applications for {campaign.data?.brand?.company_name ?? "your brand"} and decide who
                should create content for this brief.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {["Creator profile", "Fit review", "Decision queue"].map((item, index) => (
                  <div className={`premium-chip ${index === 1 ? "animate-float" : ""}`} key={item}>
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <Button asChild variant="secondary">
              <Link href={`/dashboard/campaigns/${params.id}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to campaign
              </Link>
            </Button>
          </div>
        </LacquerSurface>

        <section className="grid gap-5 md:grid-cols-3">
          <SmokedPanel className="p-6">
            <div className="flex items-center gap-3 text-[#d7c2a0]">
              <Workflow className="h-5 w-5" />
              <span className="text-sm font-medium uppercase tracking-[0.18em]">Slots</span>
            </div>
            <div className="mt-3 text-3xl font-semibold text-[#f5efe6]">
              {campaign.data ? `${campaign.data.slots_filled}/${campaign.data.slots_available}` : "—"}
            </div>
            <div className="mt-2 text-sm text-stone-400">Filled vs total creator acceptances.</div>
          </SmokedPanel>
          <SmokedPanel className="p-6">
            <div className="flex items-center gap-3 text-[#d7c2a0]">
              <Clock3 className="h-5 w-5" />
              <span className="text-sm font-medium uppercase tracking-[0.18em]">Deadline</span>
            </div>
            <div className="mt-3 text-3xl font-semibold text-[#f5efe6]">
              {formatDeadline(campaign.data?.application_deadline)}
            </div>
            <div className="mt-2 text-sm text-stone-400">Application close date for this campaign.</div>
          </SmokedPanel>
          <SmokedPanel className="p-6">
            <div className="flex items-center gap-3 text-[#d7c2a0]">
              <Users2 className="h-5 w-5" />
              <span className="text-sm font-medium uppercase tracking-[0.18em]">Pending queue</span>
            </div>
            <div className="mt-3 text-3xl font-semibold text-[#f5efe6]">{counts.pending}</div>
            <div className="mt-2 text-sm text-stone-400">Applicants needing a decision right now.</div>
          </SmokedPanel>
        </section>

        <LacquerSurface className="p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
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
            {applicants.isLoading ? <div className="text-sm text-stone-400">Loading applicants...</div> : null}
          </div>

          {feedback ? (
            <div className="mb-5 rounded-[24px] border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200" role="alert">
              {feedback}
            </div>
          ) : null}

          {applicants.isLoading ? (
            <SmokedPanel className="border-dashed px-6 py-12 text-center">
              <p className="text-lg font-medium text-[#f5efe6]">Loading applicants...</p>
              <p className="mt-2 text-sm leading-6 text-stone-400">
                BudCast is pulling the current review queue before showing empty states.
              </p>
            </SmokedPanel>
          ) : (applicants.data ?? []).length === 0 ? (
            <SmokedPanel className="border-dashed px-6 py-12 text-center">
              <p className="text-lg font-medium text-[#f5efe6]">No applicants in this view.</p>
              <p className="mt-2 text-sm leading-6 text-stone-400">
                Once creators apply from mobile, they will appear here for brand review.
              </p>
            </SmokedPanel>
          ) : (
            <div className="space-y-4">
              {applicants.data?.map((applicant) => {
                const pending = applicant.status === "pending";
                return (
                  <div
                    className="grid gap-4 rounded-[28px] border border-white/8 bg-white/[0.03] p-5 transition-all duration-300 hover:border-white/12 hover:bg-white/[0.05] lg:grid-cols-[1fr_0.8fr_0.65fr]"
                    key={applicant.id}
                  >
                    <div>
                      <div className="text-xs uppercase tracking-[0.18em] text-stone-500">
                        {applicant.creator?.location || "Location unavailable"}
                      </div>
                      <div className="mt-2 text-xl font-semibold text-[#f5efe6]">
                        {applicant.creator?.name || "Unnamed creator"}
                      </div>
                      <div className="mt-2 text-sm leading-6 text-stone-300">
                        {applicant.message?.trim() || "No pitch message submitted."}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-sm text-stone-300">
                          {formatCompact(applicant.creator?.follower_count_instagram)} IG
                        </div>
                        <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-sm text-stone-300">
                          {formatCount("review", applicant.creator?.review_count ?? 0)}
                        </div>
                        <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-sm text-stone-300">
                          {applicant.creator?.completion_rate ?? "—"}% completion
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-stone-200">
                        <BadgeCheck className="h-4 w-4 text-[#d7c2a0]" />
                        <span className="text-sm font-medium">Profile snapshot</span>
                      </div>
                      <div className="mt-3 text-sm leading-6 text-stone-300">
                        {applicant.creator?.bio || "No bio yet."}
                      </div>
                      <div className="mt-3 text-sm text-stone-400">
                        Niches: {applicant.creator?.niches?.join(", ") || "None listed"}
                      </div>
                      <div className="mt-2 text-sm text-stone-400">
                        Portfolio items: {applicant.creator?.portfolio_image_urls?.length ?? 0}
                      </div>
                    </div>
                    <div className="flex flex-col justify-between">
                      <SmokedPanel className="p-4">
                        <div className="flex items-center gap-2 text-stone-200">
                          <Clock3 className="h-4 w-4 text-[#d7c2a0]" />
                          <span className="text-sm font-medium capitalize">{applicant.status}</span>
                        </div>
                        <div className="mt-3 text-sm text-stone-400">
                          Applied {new Date(applicant.applied_at).toLocaleDateString()}
                        </div>
                        <div className="mt-2 text-sm text-stone-400">
                          {applicant.credits_spent} credits locked
                        </div>
                      </SmokedPanel>
                      {pending ? (
                        <div className="mt-4 flex gap-3">
                          <Button
                            disabled={reviewApplication.isPending}
                            onClick={() => void handleDecision(applicant.id, "accept")}
                          >
                            {reviewApplication.isPending ? (
                              <>
                                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                Working...
                              </>
                            ) : (
                              "Accept"
                            )}
                          </Button>
                          <Button
                            disabled={reviewApplication.isPending}
                            onClick={() => void handleDecision(applicant.id, "reject")}
                            variant="secondary"
                          >
                            Reject
                          </Button>
                        </div>
                        ) : null}
                        {!pending ? (
                          <div className="mt-4 rounded-[18px] border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-stone-300">
                            Decision recorded. The application queue is up to date.
                          </div>
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
