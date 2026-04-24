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
import { Button } from "../../../../../components/ui/button";
import { Card } from "../../../../../components/ui/card";

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
        title="Applicant review belongs to the brand workspace."
        description="Creator accounts can manage applications and submissions, but not review queues."
      />
    );
  }

  return (
    <BrandWorkspaceShell>
      <div className="flex flex-col gap-6">
        <header className="hero-orbit overflow-hidden rounded-[34px] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.9),rgba(255,248,240,0.72))] px-6 py-6 shadow-[0_24px_70px_rgba(33,27,20,0.1)] backdrop-blur">
          <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="max-w-3xl">
            <div className="text-xs uppercase tracking-[0.3em] text-surface-500">Applicant review</div>
            <h1 className="mt-3 font-display text-5xl text-surface-900 md:text-6xl">
              {campaign.data?.title || "Campaign applicants"}
            </h1>
            <p className="mt-4 text-base leading-8 text-surface-700">
              Review queue for {campaign.data?.brand?.company_name ?? "your brand"} with RPC-backed accept/reject logic.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {["Creator evidence", "Fit review", "Decision queue"].map((item, index) => (
                <div className={`premium-chip ${index === 1 ? "animate-float" : ""}`} key={item}>
                  {item}
                </div>
              ))}
            </div>
          </div>
          <Button asChild variant="secondary">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to dashboard
            </Link>
          </Button>
          </div>
        </header>

        <section className="grid gap-5 md:grid-cols-3">
          <Card className="sheen p-6">
            <div className="flex items-center gap-3 text-herb-700">
              <Workflow className="h-5 w-5" />
              <span className="text-sm font-medium uppercase tracking-[0.18em]">Slots</span>
            </div>
            <div className="mt-3 text-3xl font-semibold text-surface-900">
              {campaign.data ? `${campaign.data.slots_filled}/${campaign.data.slots_available}` : "—"}
            </div>
            <div className="mt-2 text-sm text-surface-600">Filled vs total creator acceptances.</div>
          </Card>
          <Card className="sheen p-6">
            <div className="flex items-center gap-3 text-herb-700">
              <Clock3 className="h-5 w-5" />
              <span className="text-sm font-medium uppercase tracking-[0.18em]">Deadline</span>
            </div>
            <div className="mt-3 text-3xl font-semibold text-surface-900">
              {formatDeadline(campaign.data?.application_deadline)}
            </div>
            <div className="mt-2 text-sm text-surface-600">Application close date for this campaign.</div>
          </Card>
          <Card className="sheen p-6">
            <div className="flex items-center gap-3 text-herb-700">
              <Users2 className="h-5 w-5" />
              <span className="text-sm font-medium uppercase tracking-[0.18em]">Pending queue</span>
            </div>
            <div className="mt-3 text-3xl font-semibold text-surface-900">{counts.pending}</div>
            <div className="mt-2 text-sm text-surface-600">Applicants needing a decision right now.</div>
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
            {applicants.isLoading ? <div className="text-sm text-surface-600">Loading applicants...</div> : null}
          </div>

          {feedback ? (
            <div className="mb-5 rounded-[24px] border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {feedback}
            </div>
          ) : null}

          {(applicants.data ?? []).length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-surface-300 bg-surface-50/70 px-6 py-12 text-center">
              <p className="text-lg font-medium text-surface-900">No applicants in this view.</p>
              <p className="mt-2 text-sm leading-6 text-surface-600">
                Once creators apply from mobile, they will appear here with RPC-backed review actions.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {applicants.data?.map((applicant) => {
                const pending = applicant.status === "pending";
                return (
                  <div
                    className="grid gap-4 rounded-[28px] border border-white/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.86),rgba(251,248,244,0.72))] p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(33,27,20,0.1)] lg:grid-cols-[1fr_0.8fr_0.65fr]"
                    key={applicant.id}
                  >
                    <div>
                      <div className="text-xs uppercase tracking-[0.18em] text-surface-500">
                        {applicant.creator?.location || "Location unavailable"}
                      </div>
                      <div className="mt-2 text-xl font-semibold text-surface-900">
                        {applicant.creator?.name || "Unnamed creator"}
                      </div>
                      <div className="mt-2 text-sm leading-6 text-surface-700">
                        {applicant.message?.trim() || "No pitch message submitted."}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <div className="rounded-full border border-surface-200 bg-white px-3 py-1 text-sm text-surface-700">
                          {formatCompact(applicant.creator?.follower_count_instagram)} IG
                        </div>
                        <div className="rounded-full border border-surface-200 bg-white px-3 py-1 text-sm text-surface-700">
                          {formatCount("review", applicant.creator?.review_count ?? 0)}
                        </div>
                        <div className="rounded-full border border-surface-200 bg-white px-3 py-1 text-sm text-surface-700">
                          {applicant.creator?.completion_rate ?? "—"}% completion
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-surface-700">
                        <BadgeCheck className="h-4 w-4 text-herb-700" />
                        <span className="text-sm font-medium">Profile snapshot</span>
                      </div>
                      <div className="mt-3 text-sm leading-6 text-surface-700">
                        {applicant.creator?.bio || "No bio yet."}
                      </div>
                      <div className="mt-3 text-sm text-surface-600">
                        Niches: {applicant.creator?.niches?.join(", ") || "None listed"}
                      </div>
                      <div className="mt-2 text-sm text-surface-600">
                        Portfolio items: {applicant.creator?.portfolio_image_urls?.length ?? 0}
                      </div>
                    </div>
                    <div className="flex flex-col justify-between">
                      <div className="rounded-[24px] border border-white/80 bg-white/82 p-4">
                        <div className="flex items-center gap-2 text-surface-700">
                          <Clock3 className="h-4 w-4 text-herb-700" />
                          <span className="text-sm font-medium capitalize">{applicant.status}</span>
                        </div>
                        <div className="mt-3 text-sm text-surface-600">
                          Applied {new Date(applicant.applied_at).toLocaleDateString()}
                        </div>
                        <div className="mt-2 text-sm text-surface-600">
                          {applicant.credits_spent} credits locked
                        </div>
                      </div>
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
                          <div className="mt-4 rounded-[18px] border border-white/80 bg-white/72 px-4 py-3 text-sm text-surface-700">
                            Decision recorded. The queue reflects the locked RPC outcome.
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
