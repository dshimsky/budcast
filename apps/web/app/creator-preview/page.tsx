"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  BadgeCheck,
  Compass,
  CreditCard,
  HeartHandshake,
  Play,
  Sparkles,
  WalletCards
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";

function formatPreviewCurrency(amount: number) {
  return `$${Math.round(amount).toLocaleString("en-US")}`;
}

const creatorStats = [
  { label: "Fresh matches", value: "14", hint: "new opportunities today" },
  { label: "Live applications", value: "6", hint: "awaiting brand review" },
  { label: "Available credits", value: "50", hint: "ready to spend" }
];

const opportunityCards = [
  {
    brand: "Houseplant Supply Co.",
    title: "Studio-grade reel for terpene launch",
    type: "Paid reel",
    value: formatPreviewCurrency(250),
    deadline: "Apply by Apr 29",
    fit: "Best for cannabis lifestyle and product education creators."
  },
  {
    brand: "Juniper Farms",
    title: "Unboxing + story sequence for spring drop",
    type: "Hybrid gifting",
    value: "Product + $90",
    deadline: "Apply by May 2",
    fit: "Strong match if your audience responds to tactile product content."
  },
  {
    brand: "Northbank Extracts",
    title: "Photo carousel with usage narrative",
    type: "Paid post",
    value: formatPreviewCurrency(180),
    deadline: "Apply by Apr 27",
    fit: "Good for creators with clean still-life photography and credible captions."
  }
];

const creatorFlow = [
  "Browse niche-aligned opportunities with stronger market energy.",
  "Apply quickly without losing trust cues about the brand.",
  "Track content submissions, revisions, and payment confirmation in one place."
];

export default function CreatorPreviewPage() {
  return (
    <main className="grid-overlay min-h-screen px-6 py-8 md:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <header className="animate-enter flex flex-wrap items-center justify-between gap-4 rounded-full border border-white/70 bg-white/70 px-5 py-3 shadow-[0_18px_50px_rgba(33,27,20,0.08)] backdrop-blur">
          <div className="premium-badge">
            <span className="signal-dot" />
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-surface-500">BudCast Creator Preview</div>
              <div className="text-sm font-medium text-surface-900">Mobile-first creator dashboard shown in browser</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="secondary">
              <Link href="/">Back to overview</Link>
            </Button>
            <Button asChild>
              <Link href="/sign-in">
                Open auth
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </header>

        <section className="hero-orbit grid gap-6 xl:grid-cols-[1.06fr_0.94fr]">
          <Card className="animate-enter overflow-hidden border-white/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(255,248,240,0.74))] p-8 md:p-10">
            <div className="mb-8 flex flex-wrap items-center gap-3 text-herb-700">
              <div className="premium-badge bg-white/68">
                <Compass className="h-4 w-4" />
                <span className="text-sm font-medium uppercase tracking-[0.22em]">Creator home</span>
              </div>
              <div className="rounded-full border border-white/70 bg-white/55 px-4 py-2 text-xs uppercase tracking-[0.24em] text-surface-600">
                Discovery x trust x payment clarity
              </div>
            </div>

            <div className="max-w-3xl space-y-5">
              <h1 className="font-display text-5xl leading-[0.94] text-surface-900 md:text-7xl">
                A creator dashboard that feels alive, curated, and worth checking daily.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-surface-700 md:text-lg">
                This preview represents the creator dashboard: live opportunity discovery, quick-apply momentum, and a
                clear line from application to content submission to payment confirmation.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/sign-in">
                  Preview auth flow
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/dashboard/submissions">See brand-side counterpart</Link>
              </Button>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {creatorStats.map((metric, index) => (
                <div
                  key={metric.label}
                  className={`rounded-[24px] border border-white/80 bg-white/72 p-4 shadow-[0_18px_50px_rgba(33,27,20,0.08)] ${index === 1 ? "animate-float" : ""}`}
                >
                  <div className="text-3xl font-semibold text-surface-900">{metric.value}</div>
                  <div className="mt-2 text-sm font-medium text-surface-800">{metric.label}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.18em] text-surface-500">{metric.hint}</div>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid gap-5">
            <Card className="animate-enter animate-enter-delay-1 p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.24em] text-surface-500">Momentum layer</div>
                  <h2 className="mt-2 font-display text-3xl text-surface-900">Why creators come back</h2>
                </div>
                <Sparkles className="h-5 w-5 text-herb-700" />
              </div>
              <div className="grid gap-3">
                {creatorFlow.map((item, index) => (
                  <div className="rounded-[22px] border border-surface-200 bg-surface-50/70 p-4" key={item}>
                    <div className="text-xs uppercase tracking-[0.2em] text-surface-500">Loop 0{index + 1}</div>
                    <div className="mt-2 text-sm leading-7 text-surface-800">{item}</div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="animate-enter animate-enter-delay-2 p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.24em] text-surface-500">Creator signals</div>
                  <h2 className="mt-2 font-display text-3xl text-surface-900">Activity feed</h2>
                </div>
                <HeartHandshake className="h-5 w-5 text-herb-700" />
              </div>
              <div className="grid gap-3">
                {[
                  "2 brands viewed your profile today",
                  "1 submission is awaiting brand review",
                  "1 accepted campaign is ready for content"
                ].map((item, index) => (
                  <div className="rounded-[22px] border border-white/80 bg-white/75 p-4" key={item}>
                    <div className="text-xs uppercase tracking-[0.2em] text-surface-500">Signal 0{index + 1}</div>
                    <div className="mt-2 text-sm leading-7 text-surface-800">{item}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
          <Card className="animate-enter animate-enter-delay-2 p-6 md:p-7">
            <div className="mb-6 flex items-center gap-3 text-surface-900">
              <WalletCards className="h-5 w-5 text-herb-700" />
              <h2 className="font-display text-3xl">Recommended opportunities</h2>
            </div>
            <div className="grid gap-4">
              {opportunityCards.map((opportunity, index) => (
                <div
                  className={`rounded-[28px] border border-white/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.86),rgba(251,248,244,0.72))] p-5 shadow-[0_18px_44px_rgba(33,27,20,0.07)] ${index === 1 ? "animate-float" : ""}`}
                  key={opportunity.title}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="max-w-2xl">
                      <div className="text-xs uppercase tracking-[0.22em] text-surface-500">{opportunity.brand}</div>
                      <h3 className="mt-2 font-display text-3xl text-surface-900">{opportunity.title}</h3>
                      <p className="mt-3 text-sm leading-7 text-surface-700">{opportunity.fit}</p>
                    </div>
                    <div className="rounded-[22px] border border-white/80 bg-white/76 px-4 py-4 text-right shadow-[0_12px_32px_rgba(33,27,20,0.06)]">
                      <div className="text-xs uppercase tracking-[0.18em] text-surface-500">{opportunity.type}</div>
                      <div className="mt-2 text-2xl font-semibold text-surface-900">{opportunity.value}</div>
                      <div className="mt-2 text-sm text-surface-600">{opportunity.deadline}</div>
                    </div>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Button variant="secondary">Save for later</Button>
                    <Button>
                      View details
                      <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid gap-5">
            <Card className="animate-enter animate-enter-delay-2 p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.24em] text-surface-500">Content and payment</div>
                  <h2 className="mt-2 font-display text-3xl text-surface-900">Submission clarity</h2>
                </div>
                <BadgeCheck className="h-5 w-5 text-herb-700" />
              </div>
              <div className="grid gap-3">
                {[
                  {
                    label: "Northbank Extracts",
                    state: "Approved by brand",
                    note: "Waiting on payment confirmation"
                  },
                  {
                    label: "Juniper Farms",
                    state: "Needs revision",
                    note: "Brand requested a cleaner product opening frame"
                  }
                ].map((item) => (
                  <div className="rounded-[22px] border border-surface-200 bg-surface-50/70 p-4" key={item.label}>
                    <div className="text-xs uppercase tracking-[0.2em] text-surface-500">{item.label}</div>
                    <div className="mt-2 text-lg font-semibold text-surface-900">{item.state}</div>
                    <div className="mt-2 text-sm leading-7 text-surface-700">{item.note}</div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="animate-enter animate-enter-delay-3 p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.24em] text-surface-500">Creator actions</div>
                  <h2 className="mt-2 font-display text-3xl text-surface-900">Quick launch points</h2>
                </div>
                <Play className="h-5 w-5 text-herb-700" />
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/sign-in">Sign in as creator</Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link href="/sign-up">Create creator account</Link>
                </Button>
                <Button asChild variant="ghost">
                  <Link href="/profile">View profile shell</Link>
                </Button>
              </div>
              <div className="mt-5 rounded-[22px] border border-white/80 bg-white/74 p-4">
                <div className="flex items-center gap-2 text-herb-700">
                  <CreditCard className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-[0.2em]">Preview note</span>
                </div>
                <p className="mt-3 text-sm leading-7 text-surface-700">
                  This browser route is a visual preview of the creator-side dashboard direction. The real creator app
                  still lives in the Expo native project and will inherit this same level of hierarchy and energy.
                </p>
              </div>
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
}
