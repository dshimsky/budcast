"use client";

import Link from "next/link";
import { hasCompletedOnboarding, useAuth } from "@budcast/shared";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Layers3,
  Sparkles,
  TrendingUp,
  Users2,
  WalletCards
} from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";

const metrics = [
  { label: "Campaigns in motion", value: "18", hint: "seed + live pipeline" },
  { label: "Verified creator matches", value: "126", hint: "high-intent applicants" },
  { label: "Median response time", value: "4h", hint: "brand inbox cadence" }
];

const operatingSignals = [
  "Verified creator rosters",
  "Credit-aware campaign launches",
  "Native creator submissions",
  "Payout confirmation tracking",
  "Reputation-first brand ops",
  "Premium marketplace presentation"
];

const dualTracks = [
  {
    title: "Brands",
    eyebrow: "Desktop-grade control",
    description:
      "Launch paid or gifting campaigns, review creators with evidence, and keep the operation credible from first brief to final payout.",
    stats: ["Campaign board", "Applicant evidence", "Submission queue"]
  },
  {
    title: "Creators",
    eyebrow: "Mobile-native momentum",
    description:
      "Discover fitting opportunities, apply fast, submit proof cleanly, and keep payment follow-through visible instead of vague.",
    stats: ["Niche feed", "Fast apply", "Proof + payout tracker"]
  }
];

export default function HomePage() {
  const { profile, session, loading } = useAuth();
  const workspaceHref = session ? (hasCompletedOnboarding(profile) ? "/dashboard" : "/onboarding") : "/sign-in";
  const authLabel = loading ? "Resolving session..." : profile ? `Signed in as ${profile.email}` : "No active session";

  return (
    <main className="grid-overlay min-h-screen px-6 py-8 md:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <header className="animate-enter flex flex-wrap items-center justify-between gap-4 rounded-full border border-white/70 bg-white/70 px-5 py-3 shadow-[0_18px_50px_rgba(33,27,20,0.08)] backdrop-blur">
          <div className="premium-badge">
            <span className="signal-dot" />
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-surface-500">BudCast</div>
              <div className="text-sm font-medium text-surface-900">Cannabis creator marketplace</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-sm text-surface-600 md:block">{authLabel}</div>
            <Button asChild variant="secondary">
              <Link href="/mission-control">Mission control</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href={workspaceHref}>{session ? "Open workspace" : "Open auth"}</Link>
            </Button>
          </div>
        </header>

        <section className="hero-orbit grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="animate-enter animate-enter-delay-1 overflow-hidden border-white/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(255,248,240,0.72))] p-8 md:p-10">
            <div className="mb-8 flex flex-wrap items-center gap-3 text-herb-700">
              <div className="premium-badge bg-white/68">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-medium uppercase tracking-[0.22em]">Premium marketplace layer</span>
              </div>
              <div className="rounded-full border border-white/70 bg-white/55 px-4 py-2 text-xs uppercase tracking-[0.24em] text-surface-600">
                Brands x creators
              </div>
            </div>

            <div className="max-w-3xl space-y-5">
              <h1 className="font-display text-5xl leading-[0.94] text-surface-900 md:text-7xl">
                The cannabis content marketplace that feels expensive before the first campaign launches.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-surface-700 md:text-lg">
                BudCast should not feel like creator-job-board software. It should feel like a polished marketplace
                where serious brands discover credible creators, creators find paid opportunities, and every step
                carries trust.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href={workspaceHref}>
                  Enter workspace
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/dashboard/submissions">See marketplace operations</Link>
              </Button>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {metrics.map((metric, index) => (
                <div
                  key={metric.label}
                  className={`animate-enter rounded-[24px] border border-white/80 bg-white/72 p-4 shadow-[0_18px_50px_rgba(33,27,20,0.08)] ${index === 1 ? "animate-float" : ""}`}
                >
                  <div className="text-3xl font-semibold text-surface-900">{metric.value}</div>
                  <div className="mt-2 text-sm font-medium text-surface-800">{metric.label}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.18em] text-surface-500">{metric.hint}</div>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid gap-5">
            <Card className="animate-enter animate-enter-delay-2 overflow-hidden p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.24em] text-surface-500">Market pulse</div>
                  <h2 className="mt-2 font-display text-3xl text-surface-900">Two-sided by design</h2>
                </div>
                <TrendingUp className="h-5 w-5 text-herb-700" />
              </div>
              <div className="market-marquee rounded-[24px] border border-surface-200/70 bg-surface-50/75 px-4 py-4">
                <div className="market-track">
                  {[...operatingSignals, ...operatingSignals].map((signal, index) => (
                    <div
                      key={`${signal}-${index}`}
                      className="rounded-full border border-white/80 bg-white/75 px-4 py-2 text-sm text-surface-700 shadow-[0_8px_22px_rgba(33,27,20,0.06)]"
                    >
                      {signal}
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {dualTracks.map((track, index) => (
              <Card className={`animate-enter ${index === 0 ? "animate-enter-delay-2" : "animate-enter-delay-3"} p-6`} key={track.title}>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-[0.24em] text-surface-500">{track.eyebrow}</div>
                    <h2 className="mt-2 font-display text-3xl text-surface-900">{track.title}</h2>
                  </div>
                  {track.title === "Brands" ? (
                    <BriefcaseBusiness className="h-5 w-5 text-herb-700" />
                  ) : (
                    <Users2 className="h-5 w-5 text-herb-700" />
                  )}
                </div>
                <p className="text-sm leading-7 text-surface-700">{track.description}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {track.stats.map((item) => (
                    <div
                      className="rounded-full border border-surface-200 bg-white/78 px-3 py-2 text-xs uppercase tracking-[0.2em] text-surface-600"
                      key={item}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
          <Card className="animate-enter animate-enter-delay-2 p-6 md:p-7">
            <div className="mb-4 flex items-center gap-3 text-surface-900">
              <Layers3 className="h-5 w-5 text-herb-700" />
              <h2 className="font-display text-3xl">Marketplace trust stack</h2>
            </div>
            <p className="text-sm leading-7 text-surface-700">
              The visual language should help sell trust: strong editorial typography, glass surfaces, signal-rich data,
              and motion that suggests an active marketplace rather than a static admin panel.
            </p>
            <div className="mt-6 grid gap-3">
              <div className="rounded-[22px] border border-surface-200 bg-surface-50/70 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-surface-500">Brand confidence</div>
                <div className="mt-2 text-lg font-semibold text-surface-900">Clear review and payout choreography</div>
              </div>
              <div className="rounded-[22px] border border-surface-200 bg-surface-50/70 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-surface-500">Creator confidence</div>
                <div className="mt-2 text-lg font-semibold text-surface-900">Fast opportunity discovery with visible follow-through</div>
              </div>
              <div className="rounded-[22px] border border-surface-200 bg-surface-50/70 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-surface-500">Platform confidence</div>
                <div className="mt-2 text-lg font-semibold text-surface-900">Premium brand presentation without losing operational clarity</div>
              </div>
            </div>
          </Card>

          <Card className="animate-enter animate-enter-delay-3 p-6 md:p-7">
            <div className="mb-6 flex items-center gap-3 text-surface-900">
              <WalletCards className="h-5 w-5 text-herb-700" />
              <h2 className="font-display text-3xl">What’s already live</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-[24px] border border-surface-200 bg-white/75 p-5">
                <div className="text-xs uppercase tracking-[0.22em] text-surface-500">Campaign engine</div>
                <p className="mt-3 text-sm leading-7 text-surface-700">
                  Credit-aware publish flow, applicant review queue, and real campaign dashboard surface.
                </p>
              </div>
              <div className="rounded-[24px] border border-surface-200 bg-white/75 p-5">
                <div className="text-xs uppercase tracking-[0.22em] text-surface-500">Submission loop</div>
                <p className="mt-3 text-sm leading-7 text-surface-700">
                  Creator proof submission, brand verification, and two-sided payment confirmation.
                </p>
              </div>
              <div className="rounded-[24px] border border-surface-200 bg-white/75 p-5">
                <div className="text-xs uppercase tracking-[0.22em] text-surface-500">Session state</div>
                <p className="mt-3 text-sm leading-7 text-surface-700">
                  {loading
                    ? "Auth provider is hydrating the persisted session."
                    : profile
                      ? `Profile loaded for ${profile.email}.`
                      : "No persisted session found yet. Use the auth route after env vars are configured."}
                </p>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <Button asChild variant="ghost">
                <Link href={session ? "/dashboard" : "/profile"}>{session ? "Dashboard" : "Profile shell"}</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/sign-up">Sign up</Link>
              </Button>
            </div>
          </Card>
        </section>
      </div>
    </main>
  );
}
