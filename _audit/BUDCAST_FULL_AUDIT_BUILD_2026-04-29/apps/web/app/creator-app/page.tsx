"use client";

import { hasCompletedOnboarding, useAuth } from "@budcast/shared";
import { ArrowRight, BellRing, MessageCircle, QrCode, Smartphone, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { BudCastLogo } from "../../components/budcast-logo";
import { RouteTransitionScreen } from "../../components/route-transition-screen";
import { Button } from "../../components/ui/button";

const appSignals = [
  {
    copy: "Browse live campaign drops, apply quickly, and keep opportunities in a mobile-first feed.",
    icon: Sparkles,
    label: "Campaign drops"
  },
  {
    copy: "Coordinate pickup, content details, timelines, revisions, and payment directly with brands.",
    icon: MessageCircle,
    label: "Brand DMs"
  },
  {
    copy: "Track submissions, brand review, payment status, and product confirmation from your phone.",
    icon: BellRing,
    label: "Work status"
  }
];

export default function CreatorAppPage() {
  const router = useRouter();
  const { loading, session, profile, signOut } = useAuth();
  const displayName = profile?.name?.split(" ")[0] || profile?.email?.split("@")[0] || "Creator";

  useEffect(() => {
    if (!loading && !session) {
      router.replace("/sign-in");
      return;
    }

    if (!loading && session && !hasCompletedOnboarding(profile)) {
      router.replace("/onboarding");
      return;
    }

    if (!loading && session && (profile?.user_type === "brand" || profile?.user_type === "brand_team")) {
      router.replace("/dashboard");
    }
  }, [loading, profile, router, session]);

  if (loading || !session) {
    return (
      <RouteTransitionScreen
        description="BudCast is checking your account before routing you to the right marketplace experience."
        eyebrow="Checking session"
        title="Loading BudCast."
      />
    );
  }

  if (!profile || !hasCompletedOnboarding(profile)) {
    return (
      <RouteTransitionScreen
        description="Finish onboarding first so BudCast can route you to the right creator or brand experience."
        eyebrow="Setup needed"
        title="Your account needs setup."
      />
    );
  }

  if (profile.user_type === "brand" || profile.user_type === "brand_team") {
    return (
      <RouteTransitionScreen
        description="Brand accounts use the web dashboard for campaign control, review queues, messages, and profile management."
        eyebrow="Brand account"
        title="Opening campaign control."
      />
    );
  }

  return (
    <main className="creator-obsidian min-h-screen bg-[#030303] px-4 pb-10 pt-4 text-[#fbfbf7] md:px-8 md:pt-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
        <header className="premium-glass-bar flex items-center justify-between gap-4 rounded-[30px] px-4 py-3 sm:px-5">
          <BudCastLogo className="brightness-125 contrast-[1.08]" href="/" size="md" variant="lockup" />
          <Button asChild className="hidden sm:inline-flex" variant="ghost">
            <Link href="/profile">Profile</Link>
          </Button>
        </header>

        <section className="overflow-hidden rounded-[42px] border border-white/[0.09] bg-[radial-gradient(circle_at_14%_10%,rgba(184,255,61,0.16),transparent_34%),linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.024))] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.52),0_1px_0_rgba(255,255,255,0.08)_inset] sm:p-7 md:p-9">
          <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_330px] lg:items-start">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#b8ff3d]/22 bg-[#b8ff3d]/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-[#e7ff9a]">
                <Smartphone className="h-3.5 w-3.5" />
                Creator app access
              </div>
              <h1 className="mt-5 max-w-3xl text-5xl font-black leading-[0.92] tracking-[-0.045em] text-[#fbfbf7] md:text-7xl">
                {displayName}, BudCast creator tools are mobile-first.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-[#d8ded1]">
                Creators use the BudCast mobile app for campaign discovery, feed, messages, submissions, approvals,
                and payment or pickup status. Brand accounts continue to use the web dashboard.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button asChild className="justify-center" size="lg">
                  <Link href="/creator-dashboard">
                    Open local creator demo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button className="justify-center" disabled size="lg" variant="secondary">
                  App Store coming soon
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button className="justify-center" disabled size="lg" variant="secondary">
                  Play Store coming soon
                </Button>
                <Button className="justify-center" onClick={() => void signOut()} size="lg" variant="ghost">
                  Sign out
                </Button>
              </div>
              <p className="mt-4 text-sm leading-6 text-[#aeb5aa]">
                For now, this screen confirms the creator-web handoff. The native app will carry the campaign feed,
                creator profile, messages, work queue, and payment/product tracking.
              </p>
            </div>

            <div className="rounded-[34px] border border-white/[0.08] bg-black/30 p-5 shadow-[0_22px_70px_rgba(0,0,0,0.35),0_1px_0_rgba(255,255,255,0.06)_inset]">
              <div className="grid aspect-square place-items-center rounded-[28px] border border-[#b8ff3d]/18 bg-[radial-gradient(circle_at_center,rgba(184,255,61,0.16),rgba(255,255,255,0.035)_58%,rgba(0,0,0,0.32))]">
                <div className="grid h-28 w-28 place-items-center rounded-[30px] border border-white/[0.12] bg-white/[0.06] shadow-[0_22px_60px_rgba(184,255,61,0.16)]">
                  <QrCode className="h-14 w-14 text-[#e7ff9a]" />
                </div>
              </div>
              <div className="mt-5 text-[11px] font-black uppercase tracking-[0.22em] text-[#e7ff9a]">
                Mobile launch path
              </div>
              <p className="mt-3 text-sm leading-7 text-[#c7ccc2]">
                QR and store links will connect once the iOS and Android builds are ready for TestFlight, App Store,
                and Play Store release.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-3">
          {appSignals.map((item) => {
            const Icon = item.icon;
            return (
              <article
                className="rounded-[30px] border border-white/[0.08] bg-white/[0.045] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.28),0_1px_0_rgba(255,255,255,0.05)_inset]"
                key={item.label}
              >
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#b8ff3d]/12 text-[#e7ff9a]">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mt-4 text-lg font-black text-[#fbfbf7]">{item.label}</h2>
                <p className="mt-2 text-sm leading-7 text-[#c7ccc2]">{item.copy}</p>
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}
