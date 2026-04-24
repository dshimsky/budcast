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
  Orbit,
  Sparkles,
  Star,
  Workflow
} from "lucide-react";
import { BrandWorkspaceShell } from "../../components/brand-workspace-shell";
import { RouteTransitionScreen } from "../../components/route-transition-screen";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";

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
      <div className="flex flex-col gap-8">
        <header className="hero-orbit overflow-hidden rounded-[34px] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.9),rgba(255,248,240,0.72))] px-6 py-6 shadow-[0_24px_70px_rgba(33,27,20,0.1)] backdrop-blur">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="max-w-3xl">
              <div className="text-xs uppercase tracking-[0.3em] text-surface-500">BudCast Dashboard</div>
              <h1 className="mt-3 font-display text-5xl text-surface-900 md:text-6xl">
                {profile?.company_name || profile?.name || "Brand workspace"}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-surface-700">
                Run BudCast like a premium operator desk: launch creator opportunities, review applicants with
                confidence, and keep verification and payouts moving without collapsing into generic dashboard sludge.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {["Campaign command", "Creator discovery", "Submission ops", "Credit visibility"].map((item, index) => (
                  <div
                    className={`rounded-full border border-white/80 bg-white/70 px-4 py-2 text-xs uppercase tracking-[0.22em] text-surface-600 shadow-[0_10px_24px_rgba(33,27,20,0.06)] ${index === 1 ? "animate-float" : ""}`}
                    key={item}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <Button asChild variant="secondary">
                <Link href="/profile">Profile</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/dashboard/submissions">Submission queue</Link>
              </Button>
              <Button asChild>
                <Link href="/dashboard/campaigns/new">
                  New campaign
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/onboarding">Edit onboarding</Link>
              </Button>
            </div>
          </div>
        </header>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <Card className="sheen p-6">
            <div className="flex items-center gap-3 text-herb-700">
              <BriefcaseBusiness className="h-5 w-5" />
              <span className="text-sm font-medium uppercase tracking-[0.18em]">Active campaigns</span>
            </div>
            <div className="mt-5 text-4xl font-semibold text-surface-900">{campaigns.length}</div>
            <p className="mt-2 text-sm text-surface-600">Currently live in the marketplace.</p>
          </Card>
          <Card className="sheen p-6">
            <div className="flex items-center gap-3 text-herb-700">
              <Inbox className="h-5 w-5" />
              <span className="text-sm font-medium uppercase tracking-[0.18em]">Pending applicants</span>
            </div>
            <div className="mt-5 text-4xl font-semibold text-surface-900">{pendingApplicants}</div>
            <p className="mt-2 text-sm text-surface-600">Queue requiring brand review.</p>
          </Card>
          <Card className="sheen p-6">
            <div className="flex items-center gap-3 text-herb-700">
              <Sparkles className="h-5 w-5" />
              <span className="text-sm font-medium uppercase tracking-[0.18em]">Open slots</span>
            </div>
            <div className="mt-5 text-4xl font-semibold text-surface-900">{totalOpenSlots}</div>
            <p className="mt-2 text-sm text-surface-600">Remaining creator acceptances.</p>
          </Card>
          <Card className="sheen p-6">
            <div className="flex items-center gap-3 text-herb-700">
              <CreditCard className="h-5 w-5" />
              <span className="text-sm font-medium uppercase tracking-[0.18em]">Credits available</span>
            </div>
            <div className="mt-5 text-4xl font-semibold text-surface-900">{profile?.credits_balance ?? 0}</div>
            <p className="mt-2 text-sm text-surface-600">Locked backend balance, not client math.</p>
          </Card>
        </section>

        <Card className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-surface-500">Submission operations</div>
              <div className="mt-2 font-display text-4xl text-surface-900">
                {submissionQueue.data?.length ?? 0} accepted creator commitments in motion
              </div>
              <p className="mt-2 text-sm leading-6 text-surface-600">
                Verification and payment confirmation are now wired through the locked content submission contract.
              </p>
            </div>
            <Button asChild>
              <Link href="/dashboard/submissions">Open queue</Link>
            </Button>
          </div>
        </Card>

        <section className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-3 text-surface-900">
              <Workflow className="h-5 w-5 text-herb-700" />
              <h2 className="font-display text-3xl">Operator cadence</h2>
            </div>
            <div className="grid gap-3">
              {[
                "Launch campaigns with tighter briefs and cleaner compensation framing.",
                "Review creator evidence fast enough that the queue feels alive.",
                "Push accepted creators into submission and payout follow-through."
              ].map((item, index) => (
                <div className="rounded-[22px] border border-surface-200 bg-surface-50/70 p-4" key={item}>
                  <div className="text-xs uppercase tracking-[0.2em] text-surface-500">Step 0{index + 1}</div>
                  <div className="mt-2 text-base leading-7 text-surface-800">{item}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <div className="mb-4 flex items-center gap-3 text-surface-900">
              <Orbit className="h-5 w-5 text-herb-700" />
              <h2 className="font-display text-3xl">Brand surface direction</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[24px] border border-surface-200 bg-white/72 p-5">
                <div className="flex items-center gap-2 text-herb-700">
                  <Star className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-[0.22em]">Premium feel</span>
                </div>
                <p className="mt-3 text-sm leading-7 text-surface-700">
                  Stronger editorial hierarchy, atmospheric motion, and glass-panel treatment that reads B2B premium
                  instead of template.
                </p>
              </div>
              <div className="rounded-[24px] border border-surface-200 bg-white/72 p-5">
                <div className="flex items-center gap-2 text-herb-700">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-[0.22em]">Marketplace energy</span>
                </div>
                <p className="mt-3 text-sm leading-7 text-surface-700">
                  Motion is now used to imply market flow: signals pulse, chips drift, actions lift, and the surface
                  feels active.
                </p>
              </div>
            </div>
          </Card>
        </section>

        <Card className="p-8">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-surface-500">Campaign queue</div>
              <h2 className="mt-2 font-display text-4xl text-surface-900">Live opportunities</h2>
            </div>
            {campaignsQuery.isLoading ? <div className="text-sm text-surface-600">Loading campaigns...</div> : null}
          </div>

          {campaigns.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-surface-300 bg-surface-50/70 px-6 py-12 text-center">
              <p className="text-lg font-medium text-surface-900">No active campaigns yet.</p>
              <p className="mt-2 text-sm leading-6 text-surface-600">
                The publish wizard is next. This dashboard is already wired to the real brand query.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <div
                  className="grid gap-4 rounded-[28px] border border-surface-200 bg-[linear-gradient(135deg,rgba(251,248,244,0.9),rgba(255,255,255,0.72))] p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(33,27,20,0.1)] lg:grid-cols-[1.2fr_0.8fr_0.6fr_0.6fr]"
                  key={campaign.id}
                >
                  <div>
                    <div className="text-xs uppercase tracking-[0.18em] text-surface-500">
                      {formatCampaignType(campaign.campaign_type)}
                    </div>
                    <div className="mt-2 text-xl font-semibold text-surface-900">{campaign.title}</div>
                    <div className="mt-2 text-sm leading-6 text-surface-600">
                      {campaign.product_description || "Cash-based campaign flow."}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-[0.18em] text-surface-500">Applicants</div>
                    <div className="mt-2 text-lg font-semibold text-surface-900">
                      {formatCount("pending review", campaign.pending_applications)}
                    </div>
                    <div className="mt-2 text-sm text-surface-600">
                      {campaign.slots_filled}/{campaign.slots_available} slots filled
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-[0.18em] text-surface-500">Compensation</div>
                    <div className="mt-2 text-lg font-semibold text-surface-900">
                      {campaign.cash_amount ? formatCurrency(campaign.cash_amount) : "Product-led"}
                    </div>
                    <div className="mt-2 text-sm text-surface-600">{campaign.credit_cost_per_slot} credits / slot</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-[0.18em] text-surface-500">Deadline</div>
                    <div className="mt-2 text-lg font-semibold text-surface-900">
                      {formatDeadline(campaign.application_deadline)}
                    </div>
                    <div className="mt-3">
                      <Link className="text-sm font-medium text-herb-700" href={`/dashboard/campaigns/${campaign.id}/applicants`}>
                        Review applicants
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </BrandWorkspaceShell>
  );
}
