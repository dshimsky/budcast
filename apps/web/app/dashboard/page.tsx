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
        title="Preparing your brand workspace."
        description="BudCast is validating your session before opening the dashboard."
      />
    );
  }

  if (!hasCompletedOnboarding(profile)) {
    return (
      <RouteTransitionScreen
        eyebrow="Routing to setup"
        title="Your workspace is almost ready."
        description="Finishing onboarding comes first so the marketplace can route you with the right brand context."
      />
    );
  }

  if (profile?.user_type && profile.user_type !== "brand") {
    return (
      <main className="grid-overlay min-h-screen px-6 py-10">
        <div className="mx-auto max-w-4xl">
          <Card className="p-8">
            <div className="text-xs uppercase tracking-[0.3em] text-surface-500">Web workspace</div>
            <h1 className="mt-3 font-display text-5xl text-surface-900">
              This web shell is optimized for brand operations.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-surface-700">
              Creator accounts still authenticate here, but the primary creator experience lives in the native app. Use
              your profile while the responsive creator web surface remains intentionally lightweight.
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
                {profile?.company_name || profile?.name || "Brand workspace"}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-stone-300">
                Run BudCast like a protected operator desk: review creators, release campaigns, and move proof and
                payouts with confidence.
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
                  <Eyebrow>Decision Queue</Eyebrow>
                  <div className="mt-3 text-3xl font-semibold text-[#f5efe6] md:text-4xl">
                    Priority campaigns and next moves
                  </div>
                  <p className="mt-3 text-sm leading-7 text-stone-300">
                    Keep attention on live review pressure first, then move accepted creators into submission and payout
                    follow-through.
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
                        Holding the decision surface while BudCast hydrates the active campaign queue.
                      </p>
                    </SmokedPanel>
                  ) : priorityCampaigns.length === 0 ? (
                    <SmokedPanel className="px-6 py-10 text-center">
                      <div className="text-lg font-medium text-[#f5efe6]">No active campaigns yet.</div>
                      <p className="mt-2 text-sm leading-6 text-stone-400">
                        Open the campaign builder when you are ready to release the first brief into the marketplace.
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
                                {campaign.product_description || "Cash-based campaign flow."}
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
                              <div className="mt-1 text-sm text-stone-400">Review before the queue hardens.</div>
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
                  <Eyebrow className="text-[#b59663]">Command Brief</Eyebrow>
                  <div className="mt-3 text-2xl font-semibold text-[#f5efe6]">Release one clear next action</div>
                  <div className="mt-4 space-y-3 text-sm leading-6 text-stone-300">
                    <p>Launch a new brief when you need fresh creator supply.</p>
                    <p>Open the submission queue when proof or payouts need attention.</p>
                    <p>Keep guidance scarce so the desk reads like command, not decoration.</p>
                  </div>
                  <div className="mt-6 grid gap-3">
                    <Button asChild className="w-full justify-center">
                      <Link href="/dashboard/campaigns/new">
                        Launch campaign
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Link
                      className="text-center text-sm font-medium text-stone-400 transition hover:text-stone-200"
                      href="/dashboard/submissions"
                    >
                      Open submission queue
                    </Link>
                  </div>
                </div>
              </div>
            </LacquerSurface>

            <LacquerSurface className="p-6">
              <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <Eyebrow>Campaign Ledger</Eyebrow>
                  <h2 className="mt-3 font-display text-4xl text-[#f5efe6]">Live opportunities</h2>
                </div>
                {campaignsQuery.isLoading ? <div className="text-sm text-stone-400">Loading campaigns...</div> : null}
              </div>

              {isCampaignsLoading ? (
                <SmokedPanel className="px-6 py-12 text-center">
                  <p className="text-lg font-medium text-[#f5efe6]">Loading live campaigns...</p>
                  <p className="mt-2 text-sm leading-6 text-stone-400">
                    Keeping the campaign ledger stable while the live opportunity feed resolves.
                  </p>
                </SmokedPanel>
              ) : campaigns.length === 0 ? (
                <SmokedPanel className="border-dashed px-6 py-12 text-center">
                  <p className="text-lg font-medium text-[#f5efe6]">No active campaigns yet.</p>
                  <p className="mt-2 text-sm leading-6 text-stone-400">
                    The dashboard is live on the real brand query and ready for the first campaign release.
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
                              {campaign.product_description || "Cash-based campaign flow."}
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
              <Eyebrow>Evidence Rail</Eyebrow>
              <div className="mt-3 text-2xl font-semibold text-[#f5efe6]">Operational state</div>
              <div className="mt-5 divide-y divide-white/8 rounded-[22px] border border-white/8 bg-black/20">
                {[
                  {
                    icon: BriefcaseBusiness,
                    label: "Active campaigns",
                    value: campaigns.length,
                    note: "Currently live in the marketplace."
                  },
                  {
                    icon: Inbox,
                    label: "Pending applicants",
                    value: pendingApplicants,
                    note: "Queue requiring brand review."
                  },
                  {
                    icon: Sparkles,
                    label: "Open slots",
                    value: totalOpenSlots,
                    note: "Remaining creator acceptances."
                  },
                  {
                    icon: CreditCard,
                    label: "Credits available",
                    value: profile?.credits_balance ?? 0,
                    note: "Locked backend balance."
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
              <Eyebrow>Submission Operations</Eyebrow>
              <div className="mt-3 text-2xl font-semibold text-[#f5efe6]">
                {submissionQueueCount} accepted creator commitments in motion
              </div>
              <p className="mt-3 text-sm leading-7 text-stone-300">
                Verification and payment confirmation remain wired through the locked content submission contract.
              </p>
              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#a48756]/20 bg-[#a48756]/10 px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-[#d7c2a0]">
                <ShieldCheck className="h-4 w-4 text-[#d7c2a0]" />
                Submission contract active
              </div>
              <Link
                className="mt-5 inline-block text-sm font-medium text-stone-300 transition hover:text-[#f5efe6]"
                href="/dashboard/submissions"
              >
                Open queue
              </Link>
            </SmokedPanel>

            <SmokedPanel className="p-5">
              <div className="flex items-center gap-3 text-[#f5efe6]">
                <Workflow className="h-5 w-5 text-[#d7c2a0]" />
                <div>
                  <Eyebrow>Operator Cadence</Eyebrow>
                  <div className="mt-2 text-2xl font-semibold">Keep the desk moving</div>
                </div>
              </div>
              <div className="mt-5 grid gap-3">
                {[
                  "Launch campaigns with tighter briefs and cleaner compensation framing.",
                  "Review creator evidence before the queue goes stale.",
                  "Push accepted creators into submission and payout follow-through."
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
