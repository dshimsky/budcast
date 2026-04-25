"use client";

import Link from "next/link";
import { hasCompletedOnboarding, useAuth } from "@budcast/shared";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Users2,
  WalletCards
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Eyebrow } from "../components/ui/eyebrow";
import { LacquerSurface } from "../components/ui/surface-tone";

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
    <main className="grid-overlay min-h-screen bg-[#080a08] px-6 py-6 text-stone-100 md:px-10 md:py-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="animate-enter flex flex-wrap items-center justify-between gap-4 rounded-full border border-white/10 bg-black/20 px-5 py-3 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="h-2.5 w-2.5 rounded-full bg-[#b59663] shadow-[0_0_18px_rgba(181,150,99,0.32)]" />
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-stone-500">BudCast</div>
              <div className="text-sm font-medium text-[#f5efe6]">Cannabis creator marketplace</div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="hidden text-sm text-stone-400 md:block">{authLabel}</div>
            <Button asChild variant="ghost">
              <Link href="/mission-control">Mission control</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href={workspaceHref}>{session ? "Open workspace" : "Open auth"}</Link>
            </Button>
          </div>
        </header>

        <section className="hero-orbit animate-enter animate-enter-delay-1">
          <LacquerSurface className="overflow-hidden px-7 py-8 md:px-10 md:py-10">
            <div className="grid gap-10 xl:grid-cols-[minmax(0,1.2fr)_240px] xl:items-end">
              <div className="max-w-4xl">
                <Eyebrow className="text-[#b59663]">Dark premium moody</Eyebrow>
                <h1 className="mt-4 max-w-4xl font-display text-5xl leading-[0.9] text-[#f5efe6] md:text-7xl">
                  The marketplace should feel expensive before the first campaign ever opens.
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-8 text-stone-300 md:text-lg">
                  BudCast is the private operator desk for cannabis brands and creators. Discovery, review,
                  submissions, and payout follow-through should arrive with the same trust signal from the first public
                  screen onward.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Button asChild size="lg">
                    <Link href={workspaceHref}>
                      {session ? "Enter workspace" : "Open auth"}
                      <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="secondary">
                    <Link href="/dashboard/submissions">See marketplace operations</Link>
                  </Button>
                </div>

                <div className="mt-10 grid gap-6 border-t border-white/10 pt-6 md:grid-cols-3">
                  {metrics.map((metric) => (
                    <div key={metric.label}>
                      <div className="text-3xl font-semibold text-[#f5efe6]">{metric.value}</div>
                      <div className="mt-2 text-sm font-medium text-stone-200">{metric.label}</div>
                      <div className="mt-1 text-[11px] uppercase tracking-[0.24em] text-stone-500">{metric.hint}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="max-w-[240px] xl:justify-self-end">
                <Eyebrow className="text-[#b59663]">Operating split</Eyebrow>
                <div className="mt-3 text-lg font-semibold text-[#f5efe6]">Two-sided by design</div>
                <p className="mt-3 text-sm leading-7 text-stone-400">
                  {loading
                    ? "Hydrating the persisted session before the route branches into dashboard or onboarding."
                    : profile
                      ? "The public surface stays dark and branded even when the workspace is one click away."
                      : "The public routes now carry the same protected-marketplace tone before login."}
                </p>

                <div className="mt-6 space-y-5">
                  {dualTracks.map((track) => (
                    <div className="border-t border-white/8 pt-4 first:border-t-0 first:pt-0" key={track.title}>
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-[11px] uppercase tracking-[0.24em] text-stone-500">{track.eyebrow}</div>
                          <div className="mt-1 text-base font-semibold text-stone-100">{track.title}</div>
                        </div>
                        {track.title === "Brands" ? (
                          <BriefcaseBusiness className="h-4 w-4 text-stone-400" />
                        ) : (
                          <Users2 className="h-4 w-4 text-stone-400" />
                        )}
                      </div>
                      <p className="mt-2 text-sm leading-6 text-stone-400">{track.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-10 border-t border-white/10 pt-6">
              <div className="flex flex-wrap items-center gap-3 text-[#f5efe6]">
                <WalletCards className="h-5 w-5 text-stone-400" />
                <Eyebrow className="text-[#b59663]">Marketplace trust stack</Eyebrow>
              </div>

              <p className="mt-4 max-w-4xl text-sm leading-7 text-stone-300">
                Verified creator rosters, credit-aware campaign launches, native submissions, payout confirmation
                tracking, and premium brand presentation already shape the working product. The public route should
                simply frame that reality instead of breaking into more dashboard zones.
              </p>

              <div className="market-marquee mt-5 border-y border-white/8 py-4">
                <div className="market-track">
                  {[...operatingSignals, ...operatingSignals].map((signal, index) => (
                    <div
                      className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-stone-300"
                      key={`${signal}-${index}`}
                    >
                      {signal}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Button asChild variant="ghost">
                  <Link href={session ? "/dashboard" : "/profile"}>{session ? "Dashboard" : "Profile shell"}</Link>
                </Button>
                <Button asChild variant="ghost">
                  <Link href="/sign-up">Sign up</Link>
                </Button>
              </div>
            </div>
          </LacquerSurface>
        </section>
      </div>
    </main>
  );
}
