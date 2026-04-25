"use client";

import Link from "next/link";
import {
  formatCampaignType,
  formatCount,
  formatCurrency,
  formatDeadline,
  hasCompletedOnboarding,
  useAuth,
  useBrandCampaigns,
  useBrandSubmissionQueue
} from "@budcast/shared";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  CreditCard,
  Inbox,
  ShieldCheck,
  Sparkles,
  Workflow
} from "lucide-react";
import { BrandWorkspaceShell } from "../../components/brand-workspace-shell";
import { RouteTransitionScreen } from "../../components/route-transition-screen";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Eyebrow } from "../../components/ui/eyebrow";
import { LacquerSurface, SmokedPanel } from "../../components/ui/surface-tone";

function getCampaignCreditCostPerSlot(campaign: { credit_cost_per_slot?: number | null }) {
  return campaign.credit_cost_per_slot ?? (campaign as { credit_cost?: number | null }).credit_cost ?? 0;
}

export default function DashboardPage() {
  const router = useRouter();
  const { loading, session, profile } = useAuth();
  const campaignsQuery = useBrandCampaigns();
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
  }, [loading, profile, router, session]);

  const campaigns = campaignsQuery.data ?? [];
  const pendingApplicants = useMemo(
    () => campaigns.reduce((sum, campaign) => sum + campaign.pending_applications, 0),
    [campaigns]
  );
  const totalOpenSlots = useMemo(
    () => campaigns.reduce((sum, campaign) => sum + Math.max(campaign.slots_available - campaign.slots_filled, 0), 0),
    [campaigns]
  );
  const isCampaignsLoading = campaignsQuery.isLoading && !campaignsQuery.data;
  const submissionQueueCount = submissionQueue.data?.length ?? 0;
  const priorityCampaigns = useMemo(
    () =>
      [...campaigns]
        .sort((left, right) => {
          if (right.pending_applications !== left.pending_applications) {
            return right.pending_applications - left.pending_applications;
          }

          const leftDeadline = left.application_deadline
            ? new Date(left.application_deadline).getTime()
            : Number.MAX_SAFE_INTEGER;
          const rightDeadline = right.application_deadline
            ? new Date(right.application_deadline).getTime()
            : Number.MAX_SAFE_INTEGER;

          return leftDeadline - rightDeadline;
        })
        .slice(0, 3),
    [campaigns]
  );

  if (loading || !session) {
    return (
      <RouteTransitionScreen
        eyebrow="Checking session"
        title="Preparing your brand dashboard."
        description="BudCast is checking your account before loading campaign briefs and creator applications."
      />
    );
  }

  if (!hasCompletedOnboarding(profile)) {
    return (
      <RouteTransitionScreen
        eyebrow="Routing to setup"
        title="Your brand profile is almost ready."
        description="Finish setup so creators can understand your cannabis brand before applying."
      />
    );
  }

  if (profile?.user_type && profile.user_type !== "brand") {
    return (
      <main className="grid-overlay min-h-screen px-6 py-10">
        <div className="mx-auto max-w-4xl">
          <Card className="p-8">
            <div className="text-xs uppercase tracking-[0.3em] text-surface-500">Brand dashboard</div>
            <h1 className="mt-3 font-display text-5xl text-surface-900">
              This desktop view is built for cannabis brands.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-surface-700">
              Creators can sign in on web, but the main creator experience is mobile. Use your profile here, then switch
              to the phone app for opportunities, applications, and content submissions.
            </p>
            <div className="mt-6 flex gap-3">
              <Button asChild>
                <Link href="/profile">Open profile</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/">Back to overview</Link>
              </Button>
            </div>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <BrandWorkspaceShell>
      <div className="flex flex-col gap-6">
        <header className="overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(19,21,19,0.92),rgba(11,12,11,0.92))] px-7 py-8 shadow-[0_28px_90px_rgba(0,0,0,0.45)]">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="max-w-3xl">
              <Eyebrow>BudCast Dashboard</Eyebrow>
              <h1 className="mt-3 font-display text-5xl text-[#f5efe6] md:text-6xl">
                {profile?.company_name || profile?.name || "Brand dashboard"}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-stone-300">
                Post campaign briefs, review creator applications, approve content submissions, and track payments in
                one place.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm">
              <Link className="text-stone-300 transition hover:text-[#f5efe6]" href="/dashboard/submissions">
                Submission queue
              </Link>
              <Link className="text-stone-400 transition hover:text-stone-200" href="/profile">
                Profile
              </Link>
              <Link className="text-stone-500 transition hover:text-stone-300" href="/onboarding">
                Edit onboarding
              </Link>
            </div>
          </div>
        </header>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.18fr)_340px]">
          <div className="grid gap-6">
            <LacquerSurface className="p-6 md:p-7">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-3xl">
                  <Eyebrow>Creator Applications</Eyebrow>
                  <div className="mt-3 text-3xl font-semibold text-[#f5efe6] md:text-4xl">
                    Campaigns that need your next decision
                  </div>
                  <p className="mt-3 text-sm leading-7 text-stone-300">
                    Start with creator applications, then move accepted creators into content submission, approval, and
                    payment.
                  </p>
                </div>
                <div
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.24em] ${
                    pendingApplicants > 0
                      ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                      : "border-white/10 bg-white/[0.04] text-stone-300"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      pendingApplicants > 0
                        ? "bg-emerald-300 shadow-[0_0_14px_rgba(110,231,183,0.55)]"
                        : "bg-stone-500"
                    }`}
                  />
                  {pendingApplicants > 0 ? formatCount("pending reviews", pendingApplicants) : "Queue clear"}
                </div>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
                <div className="grid gap-3">
                  {isCampaignsLoading ? (
                    <SmokedPanel className="px-6 py-10 text-center">
                      <div className="text-lg font-medium text-[#f5efe6]">Loading live campaigns...</div>
                      <p className="mt-2 text-sm leading-6 text-stone-400">
                        Loading the campaigns your brand has posted.
                      </p>
                    </SmokedPanel>
                  ) : priorityCampaigns.length === 0 ? (
                    <SmokedPanel className="px-6 py-10 text-center">
                      <div className="text-lg font-medium text-[#f5efe6]">No active campaigns yet.</div>
                      <p className="mt-2 text-sm leading-6 text-stone-400">
                        Create your first campaign brief when you are ready to hire creators.
                      </p>
                    </SmokedPanel>
                  ) : (
                    priorityCampaigns.map((campaign) => {
                      const creditCostPerSlot = getCampaignCreditCostPerSlot(campaign);

                      return (
                        <SmokedPanel className="p-5" key={campaign.id}>
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="text-xs uppercase tracking-[0.22em] text-stone-500">
                                {formatCampaignType(campaign.campaign_type)}
                              </div>
                              <div className="mt-2 text-xl font-semibold text-[#f5efe6]">{campaign.title}</div>
                              <div className="mt-2 text-sm leading-6 text-stone-400">
                                {campaign.product_description || "Paid content campaign."}
                              </div>
                            </div>
                            {campaign.pending_applications > 0 ? (
                              <div className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-emerald-200">
                                Review now
                              </div>
                            ) : null}
                          </div>

                          <div className="mt-5 grid gap-3 md:grid-cols-3">
                            <div className="rounded-[20px] border border-white/8 bg-black/20 p-4">
                              <div className="text-[11px] uppercase tracking-[0.22em] text-stone-500">Applicants</div>
                              <div className="mt-2 text-lg font-semibold text-[#f5efe6]">
                                {formatCount("pending review", campaign.pending_applications)}
                              </div>
                              <div className="mt-1 text-sm text-stone-400">
                                {campaign.slots_filled}/{campaign.slots_available} slots filled
                              </div>
                            </div>
                            <div className="rounded-[20px] border border-white/8 bg-black/20 p-4">
                              <div className="text-[11px] uppercase tracking-[0.22em] text-stone-500">Compensation</div>
                              <div className="mt-2 text-lg font-semibold text-[#f5efe6]">
                                {campaign.cash_amount ? formatCurrency(campaign.cash_amount) : "Product-led"}
                              </div>
                              <div className="mt-1 text-sm text-stone-400">{creditCostPerSlot ?? 0} credits / slot</div>
                            </div>
                            <div className="rounded-[20px] border border-white/8 bg-black/20 p-4">
                              <div className="text-[11px] uppercase tracking-[0.22em] text-stone-500">Deadline</div>
                              <div className="mt-2 text-lg font-semibold text-[#f5efe6]">
                                {formatDeadline(campaign.application_deadline)}
                              </div>
                              <div className="mt-1 text-sm text-stone-400">Review before applications close.</div>
                            </div>
                          </div>

                          <div className="mt-5 flex flex-wrap gap-4 text-sm font-medium">
                            <Link className="text-[#f5efe6]" href={`/dashboard/campaigns/${campaign.id}`}>
                              Open campaign
                            </Link>
                            <Link
                              className={
                                campaign.pending_applications > 0 ? "text-emerald-200" : "text-stone-400"
                              }
                              href={`/dashboard/campaigns/${campaign.id}/applicants`}
                            >
                              Review applicants
                            </Link>
                          </div>
                        </SmokedPanel>
                      );
                    })
                  )}
                </div>

                <div className="rounded-[28px] border border-[#a48756]/20 bg-[#120f0c] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.22)]">
                  <Eyebrow className="text-[#b59663]">Next Step</Eyebrow>
                  <div className="mt-3 text-2xl font-semibold text-[#f5efe6]">Keep the campaign moving</div>
                  <div className="mt-4 space-y-3 text-sm leading-6 text-stone-300">
                    <p>Post a new brief when you need creators for a product drop, launch, UGC, or social campaign.</p>
                    <p>Open submissions when accepted creators have content ready for approval.</p>
                    <p>Use payment status to keep both sides clear on what is complete.</p>
                  </div>
                  <div className="mt-6 grid gap-3">
                    <Button asChild className="w-full justify-center">
                      <Link href="/dashboard/campaigns/new">
                        Post a campaign brief
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Link
                      className="text-center text-sm font-medium text-stone-400 transition hover:text-stone-200"
                      href="/dashboard/submissions"
                    >
                      Open content submissions
                    </Link>
                  </div>
                </div>
              </div>
            </LacquerSurface>

            <LacquerSurface className="p-6">
              <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <Eyebrow>Campaign Briefs</Eyebrow>
                  <h2 className="mt-3 font-display text-4xl text-[#f5efe6]">Live creator campaigns</h2>
                </div>
                {campaignsQuery.isLoading ? <div className="text-sm text-stone-400">Loading campaigns...</div> : null}
              </div>

              {isCampaignsLoading ? (
                <SmokedPanel className="px-6 py-12 text-center">
                  <p className="text-lg font-medium text-[#f5efe6]">Loading live campaigns...</p>
                  <p className="mt-2 text-sm leading-6 text-stone-400">
                    Loading the campaign briefs your brand has posted.
                  </p>
                </SmokedPanel>
              ) : campaigns.length === 0 ? (
                <SmokedPanel className="border-dashed px-6 py-12 text-center">
                  <p className="text-lg font-medium text-[#f5efe6]">No active campaigns yet.</p>
                  <p className="mt-2 text-sm leading-6 text-stone-400">
                    Your brand dashboard is ready for the first campaign brief.
                  </p>
                </SmokedPanel>
              ) : (
                <div className="space-y-4">
                  {campaigns.map((campaign) => {
                    const creditCostPerSlot = getCampaignCreditCostPerSlot(campaign);

                    return (
                      <SmokedPanel className="p-5" key={campaign.id}>
                        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr_0.7fr_0.7fr]">
                          <div>
                            <div className="text-xs uppercase tracking-[0.18em] text-stone-500">
                              {formatCampaignType(campaign.campaign_type)}
                            </div>
                            <div className="mt-2 text-xl font-semibold text-[#f5efe6]">{campaign.title}</div>
                            <div className="mt-2 text-sm leading-6 text-stone-400">
                              {campaign.product_description || "Paid content campaign."}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs uppercase tracking-[0.18em] text-stone-500">Applicants</div>
                            <div className="mt-2 text-lg font-semibold text-[#f5efe6]">
                              {formatCount("pending review", campaign.pending_applications)}
                            </div>
                            <div className="mt-2 text-sm text-stone-400">
                              {campaign.slots_filled}/{campaign.slots_available} slots filled
                            </div>
                          </div>
                          <div>
                            <div className="text-xs uppercase tracking-[0.18em] text-stone-500">Compensation</div>
                            <div className="mt-2 text-lg font-semibold text-[#f5efe6]">
                              {campaign.cash_amount ? formatCurrency(campaign.cash_amount) : "Product-led"}
                            </div>
                            <div className="mt-2 text-sm text-stone-400">{creditCostPerSlot ?? 0} credits / slot</div>
                          </div>
                          <div>
                            <div className="text-xs uppercase tracking-[0.18em] text-stone-500">Deadline</div>
                            <div className="mt-2 text-lg font-semibold text-[#f5efe6]">
                              {formatDeadline(campaign.application_deadline)}
                            </div>
                            <div className="mt-3 flex flex-col gap-2">
                              <Link className="text-sm font-medium text-[#f5efe6]" href={`/dashboard/campaigns/${campaign.id}`}>
                                Open campaign
                              </Link>
                              <Link
                                className={`text-sm font-medium ${
                                  campaign.pending_applications > 0 ? "text-emerald-200" : "text-stone-400"
                                }`}
                                href={`/dashboard/campaigns/${campaign.id}/applicants`}
                              >
                                Review applicants
                              </Link>
                            </div>
                          </div>
                        </div>
                      </SmokedPanel>
                    );
                  })}
                </div>
              )}
            </LacquerSurface>
          </div>

          <div className="grid gap-6">
            <SmokedPanel className="p-5">
              <Eyebrow>Brand Snapshot</Eyebrow>
              <div className="mt-3 text-2xl font-semibold text-[#f5efe6]">Campaign activity</div>
              <div className="mt-5 divide-y divide-white/8 rounded-[22px] border border-white/8 bg-black/20">
                {[
                  {
                    icon: BriefcaseBusiness,
                    label: "Active campaigns",
                    value: campaigns.length,
                    note: "Campaign briefs currently visible to creators."
                  },
                  {
                    icon: Inbox,
                    label: "Pending applicants",
                    value: pendingApplicants,
                    note: "Creators waiting for your decision."
                  },
                  {
                    icon: Sparkles,
                    label: "Open slots",
                    value: totalOpenSlots,
                    note: "Open creator spots across live briefs."
                  },
                  {
                    icon: CreditCard,
                    label: "Credits available",
                    value: profile?.credits_balance ?? 0,
                    note: "Available for posting creator campaigns."
                  }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div className="flex items-start justify-between gap-4 px-4 py-4" key={item.label}>
                      <div className="min-w-0">
                        <div className="flex items-center gap-3 text-stone-300">
                          <Icon className="h-4 w-4 text-[#d7c2a0]" />
                          <span className="text-xs uppercase tracking-[0.2em]">{item.label}</span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-stone-400">{item.note}</p>
                      </div>
                      <div className="pt-0.5 text-right text-xl font-semibold text-[#f5efe6]">{item.value}</div>
                    </div>
                  );
                })}
              </div>
            </SmokedPanel>

            <SmokedPanel className="p-5">
              <Eyebrow>Content Submissions</Eyebrow>
              <div className="mt-3 text-2xl font-semibold text-[#f5efe6]">
                {submissionQueueCount} accepted creator assignments in motion
              </div>
              <p className="mt-3 text-sm leading-7 text-stone-300">
                Review submitted content links, request changes when needed, and confirm payment once the work is
                approved.
              </p>
              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#a48756]/20 bg-[#a48756]/10 px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-[#d7c2a0]">
                <ShieldCheck className="h-4 w-4 text-[#d7c2a0]" />
                Submission flow active
              </div>
              <Link
                className="mt-5 inline-block text-sm font-medium text-stone-300 transition hover:text-[#f5efe6]"
                href="/dashboard/submissions"
              >
                Open submissions
              </Link>
            </SmokedPanel>

            <SmokedPanel className="p-5">
              <div className="flex items-center gap-3 text-[#f5efe6]">
                <Workflow className="h-5 w-5 text-[#d7c2a0]" />
                <div>
                  <Eyebrow>Brand Workflow</Eyebrow>
                  <div className="mt-2 text-2xl font-semibold">What to do next</div>
                </div>
              </div>
              <div className="mt-5 grid gap-3">
                {[
                  "Write clear campaign briefs so creators understand the content you need.",
                  "Review creator applications before the campaign deadline closes.",
                  "Approve submitted content and keep payment status visible."
                ].map((item, index) => (
                  <div className="rounded-[20px] border border-white/8 bg-black/20 p-4" key={item}>
                    <div className="text-[11px] uppercase tracking-[0.22em] text-stone-500">Step 0{index + 1}</div>
                    <div className="mt-2 text-sm leading-6 text-stone-300">{item}</div>
                  </div>
                ))}
              </div>
            </SmokedPanel>
          </div>
        </section>
      </div>
    </BrandWorkspaceShell>
  );
}
