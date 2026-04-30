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
import { ArrowLeft, Clock3, LoaderCircle, MessageCircle, Users2, Workflow } from "lucide-react";
import { BrandWorkspaceShell } from "../../../../../components/brand-workspace-shell";
import { RouteTransitionScreen } from "../../../../../components/route-transition-screen";
import {
  CreatorIdentityRow,
  MarketplaceBadge,
  MediaGrid,
  MetadataStrip,
  SocialPlatformGrid,
  WorkQueueItem
} from "../../../../../components/marketplace";
import type { SocialPlatformItem } from "../../../../../components/marketplace";
import { Button } from "../../../../../components/ui/button";

type ApplicantTab = "pending" | "accepted" | "rejected" | "all";
type ApplicantRow = NonNullable<ReturnType<typeof useCampaignApplicants>["data"]>[number];

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

function getCreatorHandle(creator: ApplicantRow["creator"]) {
  const handle = creator?.instagram || creator?.tiktok || creator?.youtube;
  if (!handle) return null;
  return handle.startsWith("@") ? handle : `@${handle}`;
}

function getSocials(creator: ApplicantRow["creator"]) {
  return [
    creator?.instagram
      ? { label: "Instagram", value: formatCompact(creator.follower_count_instagram), handle: creator.instagram }
      : null,
    creator?.tiktok ? { label: "TikTok", value: formatCompact(creator.follower_count_tiktok), handle: creator.tiktok } : null,
    creator?.youtube ? { label: "YouTube", value: formatCompact(creator.follower_count_youtube), handle: creator.youtube } : null
  ].filter(Boolean) as Array<{ label: string; value: string; handle: string }>;
}

function getSocialPlatformItems(creator: ApplicantRow["creator"]): SocialPlatformItem[] {
  return [
    {
      label: "Instagram",
      platform: "instagram",
      sublabel: creator?.instagram ? `${formatCompact(creator.follower_count_instagram)} followers` : undefined,
      value: creator?.instagram ? normalizeHandle(creator.instagram) : null
    },
    {
      label: "TikTok",
      platform: "tiktok",
      sublabel: creator?.tiktok ? `${formatCompact(creator.follower_count_tiktok)} followers` : undefined,
      value: creator?.tiktok ? normalizeHandle(creator.tiktok) : null
    },
    {
      label: "YouTube",
      platform: "youtube",
      sublabel: creator?.youtube ? `${formatCompact(creator.follower_count_youtube)} followers` : undefined,
      value: creator?.youtube ? normalizeHandle(creator.youtube) : null
    },
    { label: "Facebook", platform: "facebook", value: creator?.facebook },
    { label: "LinkedIn", platform: "linkedin", value: creator?.linkedin },
    { label: "X", platform: "x", value: creator?.x_profile ? normalizeHandle(creator.x_profile) : null }
  ];
}

function normalizeHandle(handle: string) {
  return handle.startsWith("@") ? handle : `@${handle}`;
}

function getFitSignals(creator: ApplicantRow["creator"]) {
  const portfolioCount = creator?.portfolio_image_urls?.length ?? 0;
  const signalCount = [
    Boolean(creator?.avatar_url),
    Boolean(creator?.bio),
    Boolean(creator?.location),
    Boolean(creator?.niches?.length),
    Boolean(portfolioCount),
    Boolean(getSocials(creator).length)
  ].filter(Boolean).length;

  return {
    detail: `${signalCount}/6 visible signals`,
    label: signalCount >= 5 ? "Strong profile" : signalCount >= 3 ? "Fit check ready" : "Needs profile context",
    portfolioLabel: portfolioCount ? `${portfolioCount} saved media item${portfolioCount === 1 ? "" : "s"}` : "No portfolio media yet"
  };
}

function ApplicantReviewCard({
  applicant,
  disabled,
  onDecision
}: {
  applicant: ApplicantRow;
  disabled: boolean;
  onDecision: (applicationId: string, decision: "accept" | "reject") => void;
}) {
  const creator = applicant.creator;
  const pending = applicant.status === "pending";
  const fitSignals = getFitSignals(creator);
  const socialPlatformItems = getSocialPlatformItems(creator);
  const portfolio = creator?.portfolio_image_urls?.slice(0, 3) ?? [];
  const niches = creator?.niches?.slice(0, 4) ?? [];
  const handle = getCreatorHandle(creator);
  const creatorName = creator?.name || "Unnamed creator";

  return (
    <article className="overflow-hidden rounded-[34px] border border-white/[0.075] bg-[linear-gradient(145deg,rgba(255,255,255,0.07),rgba(255,255,255,0.024))] shadow-[0_22px_70px_rgba(0,0,0,0.28),0_1px_0_rgba(255,255,255,0.045)_inset] transition hover:-translate-y-1 hover:border-[#b8ff3d]/24">
      <div className="bg-[radial-gradient(circle_at_84%_0%,rgba(184,255,61,0.13),transparent_30%),linear-gradient(135deg,rgba(22,33,15,0.84),rgba(5,6,4,0.9)_68%)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <CreatorIdentityRow
            avatarUrl={creator?.avatar_url}
            badges={creator?.badges}
            handle={handle}
            location={creator?.location}
            name={creatorName}
          />
          <MarketplaceBadge tone={pending ? "urgent" : applicant.status === "accepted" ? "status" : "neutral"}>
            {applicant.status}
          </MarketplaceBadge>
        </div>
      </div>
      <div className="grid gap-5 p-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          <div className="rounded-[26px] border border-white/[0.065] bg-black/20 p-4 shadow-[0_1px_0_rgba(255,255,255,0.035)_inset]">
            <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#e7ff9a]">Creator pitch</div>
            <p className="mt-3 text-sm leading-7 text-[#d8ded1]">
              {applicant.message?.trim() || "No pitch message submitted."}
            </p>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_240px]">
            <div>
              <div className="text-sm font-black text-[#fbfbf7]">Profile signal</div>
              <p className="mt-2 text-sm leading-7 text-[#c7ccc2]">
                {creator?.bio || "This creator has not added a bio yet. Use socials, niches, and portfolio signals to evaluate fit."}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {niches.length ? (
                  niches.map((niche) => (
                    <MarketplaceBadge key={niche} tone="content">
                      {niche.replace("_", " ")}
                    </MarketplaceBadge>
                  ))
                ) : (
                  <MarketplaceBadge tone="neutral">Niches pending</MarketplaceBadge>
                )}
              </div>
              <SocialPlatformGrid className="mt-4 md:grid-cols-2" items={socialPlatformItems} />
            </div>
            <div>
              <MediaGrid
                className="grid-cols-3 gap-2"
                items={
                  portfolio.length
                    ? portfolio.map((imageUrl, index) => ({
                        id: `${applicant.id}-${index}`,
                        imageUrl,
                        label: `Portfolio ${index + 1}`
                      }))
                    : [
                        { id: "empty-1", label: "Portfolio pending" },
                        { id: "empty-2", label: "Portfolio pending" },
                        { id: "empty-3", label: "Portfolio pending" }
                      ]
                }
              />
              <div className="mt-2 text-xs text-[#aeb5aa]">{fitSignals.portfolioLabel}</div>
            </div>
          </div>
        </div>

        <aside className="grid content-start gap-3">
          <div className="rounded-[28px] border border-white/[0.065] bg-[#101010]/82 p-4 shadow-[0_1px_0_rgba(255,255,255,0.035)_inset]">
            <div className="flex items-center gap-2 text-sm font-black text-[#fbfbf7]">
              <Clock3 className="h-4 w-4 text-[#e7ff9a]" />
              Fit decision
            </div>
            <div className="mt-4 rounded-[22px] border border-[#b8ff3d]/16 bg-[#b8ff3d]/10 p-4 shadow-[0_1px_0_rgba(255,255,255,0.035)_inset]">
              <div className="text-[11px] font-black uppercase tracking-[0.18em] text-[#e7ff9a]">Fit signal</div>
              <div className="mt-1 text-lg font-black text-[#fbfbf7]">{fitSignals.label}</div>
              <div className="mt-1 text-sm text-[#c7ccc2]">{fitSignals.detail}</div>
            </div>
            <MetadataStrip
              className="mt-4 grid-cols-2"
              items={[
                { label: "Applied", value: new Date(applicant.applied_at).toLocaleDateString() },
                { label: "Credits", value: `${applicant.credits_spent}` },
                { label: "Reviews", value: formatCount("review", creator?.review_count ?? 0) },
                { label: "Campaigns", value: formatCompact(creator?.total_campaigns ?? 0) }
              ]}
            />
          </div>

          {pending ? (
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
              {creator?.id ? (
                <Button asChild variant="secondary">
                  <Link href={`/dashboard/messages?user=${creator.id}`}>
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Message creator
                  </Link>
                </Button>
              ) : null}
              <Button
                disabled={disabled}
                onClick={() => onDecision(applicant.id, "accept")}
              >
                {disabled ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    Working...
                  </>
                ) : (
                  "Accept creator"
                )}
              </Button>
              <Button disabled={disabled} onClick={() => onDecision(applicant.id, "reject")} variant="secondary">
                Decline
              </Button>
            </div>
          ) : (
            <div className="grid gap-2">
              {creator?.id ? (
                <Button asChild>
                  <Link href={`/dashboard/messages?user=${creator.id}`}>
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Message creator
                  </Link>
                </Button>
              ) : null}
              <div className="rounded-[22px] border border-white/[0.075] bg-white/[0.04] px-4 py-3 text-sm font-bold text-[#d8ded1]">
                Decision recorded.
              </div>
            </div>
          )}
        </aside>
      </div>
    </article>
  );
}

export default function CampaignApplicantsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { brandContext, loading, session, profile } = useAuth();
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
    if (!loading && profile?.user_type && !brandContext) {
      router.replace("/dashboard");
    }
  }, [brandContext, loading, profile, router, session]);

  async function handleDecision(applicationId: string, decision: "accept" | "reject") {
    if (!params.id) return;
    try {
      setFeedback(null);
      await reviewApplication.mutateAsync({
        applicationId,
        decision,
        opportunityId: params.id
      });
    } catch (error) {
      setFeedback(reviewCopy(parseReviewError(error)));
    }
  }

  const counts = applicants.counts;
  const tabs: Array<{ label: string; value: ApplicantTab; count: number }> = [
    { count: counts.pending, label: "Pending", value: "pending" },
    { count: counts.accepted, label: "Accepted", value: "accepted" },
    { count: counts.rejected, label: "Rejected", value: "rejected" },
    { count: counts.total, label: "All", value: "all" }
  ];

  if (loading || !session) {
    return (
      <RouteTransitionScreen
        description="BudCast is validating your session before exposing creator application decisions."
        eyebrow="Checking session"
        title="Preparing applicant review."
      />
    );
  }

  if (!hasCompletedOnboarding(profile)) {
    return (
      <RouteTransitionScreen
        description="Applicant review unlocks once your brand profile is fully routed and ready."
        eyebrow="Routing to setup"
        title="Onboarding needs to finish first."
      />
    );
  }

  if (!brandContext) {
    return (
      <RouteTransitionScreen
        description="Creator accounts can manage applications and submissions, but not review queues."
        eyebrow="Brand only"
        title="Applicant review is for cannabis brands."
      />
    );
  }

  if (campaign.error || applicants.error || (!campaign.isLoading && !campaign.data)) {
    return (
      <BrandWorkspaceShell>
        <section className="rounded-[34px] border border-white/[0.075] bg-white/[0.035] p-8 shadow-[0_24px_70px_rgba(0,0,0,0.34),0_1px_0_rgba(255,255,255,0.045)_inset]">
          <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#e7ff9a]">Applicant review</div>
          <h1 className="mt-4 text-5xl font-black leading-[0.92] tracking-[-0.045em] text-[#fbfbf7]">
            Review queue unavailable.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#d8ded1]">
            BudCast could not load this applicant review queue. Return to campaign control and reopen the campaign.
          </p>
          <Button asChild className="mt-6">
            <Link href="/dashboard">Back to campaign control</Link>
          </Button>
        </section>
      </BrandWorkspaceShell>
    );
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
                href={`/dashboard/campaigns/${params.id}`}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to campaign
              </Link>
              <div className="mt-5 text-[11px] font-black uppercase tracking-[0.2em] text-[#e7ff9a]">Applicant review</div>
              <h1 className="mt-3 text-5xl font-black leading-[0.92] tracking-[-0.045em] text-[#fbfbf7] md:text-6xl">
                {campaign.data?.title || "Campaign applicants"}
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-[#d8ded1]">
                Review creator profiles, pitch context, social signals, and portfolio previews before accepting creators
                into this campaign.
              </p>
            </div>
          </div>
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-3">
          {[
            {
              detail: "Accepted creators vs total creator spots.",
              icon: Workflow,
              label: "Slots",
              value: campaign.data ? `${campaign.data.slots_filled}/${campaign.data.slots_available}` : "..."
            },
            {
              detail: "Application close date.",
              icon: Clock3,
              label: "Deadline",
              value: formatDeadline(campaign.data?.application_deadline)
            },
            {
              detail: "Creators needing a brand decision.",
              icon: Users2,
              label: "Pending queue",
              value: String(counts.pending)
            }
          ].map((metric) => {
            const Icon = metric.icon;
            return (
              <div className="rounded-[28px] border border-white/[0.075] bg-white/[0.035] p-5 shadow-[0_18px_45px_rgba(0,0,0,0.22),0_1px_0_rgba(255,255,255,0.035)_inset]" key={metric.label}>
                <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#e7ff9a]">
                  <Icon className="h-4 w-4" />
                  {metric.label}
                </div>
                <div className="mt-3 text-3xl font-black text-[#fbfbf7]">{metric.value}</div>
                <div className="mt-2 text-sm leading-6 text-[#aeb5aa]">{metric.detail}</div>
              </div>
            );
          })}
        </section>

        <section className="rounded-[34px] border border-white/[0.075] bg-white/[0.035] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.32),0_1px_0_rgba(255,255,255,0.045)_inset] md:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => {
                const active = activeTab === tab.value;
                return (
                  <button
                    aria-pressed={active}
                    className={`rounded-full border px-4 py-2.5 text-sm font-black transition ${
                      active
                        ? "border-[#b8ff3d]/42 bg-[#b8ff3d]/14 text-[#e7ff9a] shadow-[0_14px_30px_rgba(184,255,61,0.14)]"
                        : "border-white/[0.075] bg-white/[0.04] text-[#c7ccc2] hover:-translate-y-0.5 hover:border-white/16"
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
            {applicants.isLoading ? <div className="text-sm text-[#aeb5aa]">Loading applicants...</div> : null}
          </div>

          {feedback ? (
            <div className="mb-5 rounded-[24px] border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200" role="alert">
              {feedback}
            </div>
          ) : null}

          {applicants.isLoading ? (
            <div className="rounded-[30px] border border-dashed border-white/12 bg-black/20 px-6 py-12 text-center shadow-[0_1px_0_rgba(255,255,255,0.035)_inset]">
              <p className="text-lg font-black text-[#fbfbf7]">Loading applicants...</p>
              <p className="mt-2 text-sm leading-6 text-[#c7ccc2]">
                BudCast is pulling the current applicant queue before showing empty states.
              </p>
            </div>
          ) : (applicants.data ?? []).length === 0 ? (
            <div className="rounded-[30px] border border-dashed border-white/12 bg-black/20 px-6 py-12 text-center shadow-[0_1px_0_rgba(255,255,255,0.035)_inset]">
              <p className="text-lg font-black text-[#fbfbf7]">No applicants in this view.</p>
              <p className="mt-2 text-sm leading-6 text-[#c7ccc2]">
                Once creators apply from mobile, they appear here for fit review and assignment decisions.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {applicants.data?.map((applicant) => (
                <ApplicantReviewCard
                  applicant={applicant}
                  disabled={reviewApplication.isPending}
                  key={applicant.id}
                  onDecision={(applicationId, decision) => void handleDecision(applicationId, decision)}
                />
              ))}
            </div>
          )}
        </section>

        <section className="grid gap-3 lg:grid-cols-3">
          <WorkQueueItem
            description="Start with creators who have a clear pitch, public profile, and portfolio examples."
            title="Review fit before acceptance"
          />
          <WorkQueueItem
            description="Accepted creators move into submission, approval, and payment/product status tracking."
            title="Acceptance opens the assignment"
          />
          <WorkQueueItem
            description="Use messages after acceptance to coordinate pickup, usage context, timing, and payment details."
            title="Coordinate after acceptance"
          />
        </section>
      </div>
    </BrandWorkspaceShell>
  );
}
