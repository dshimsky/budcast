"use client";

import Link from "next/link";
import { formatCompact, hasCompletedOnboarding, useAuth } from "@budcast/shared";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ArrowRight, BadgeCheck, BriefcaseBusiness, LogOut, MapPin, Sparkles, Star, Users2 } from "lucide-react";
import { RouteTransitionScreen } from "../../components/route-transition-screen";
import { Button } from "../../components/ui/button";
import { Eyebrow } from "../../components/ui/eyebrow";
import { LacquerSurface, SmokedPanel } from "../../components/ui/surface-tone";

const detailPanelClassName = "rounded-[22px] border border-white/8 bg-black/20 p-5";

export default function ProfilePage() {
  const router = useRouter();
  const { loading, session, profile, signOut } = useAuth();
  const isCreator = profile?.user_type === "creator";

  useEffect(() => {
    if (!loading && !session) {
      router.replace("/sign-in");
      return;
    }

    if (!loading && session && !hasCompletedOnboarding(profile)) {
      router.replace("/onboarding");
    }
  }, [loading, profile, router, session]);

  if (loading || !session) {
    return (
      <RouteTransitionScreen
        eyebrow="Checking session"
        title="Loading your BudCast profile."
        description="BudCast is validating your account before loading the marketplace identity surface."
      />
    );
  }

  if (!hasCompletedOnboarding(profile)) {
    return (
      <RouteTransitionScreen
        eyebrow="Routing to setup"
        title="Your profile needs a few setup details."
        description="Finishing onboarding comes first so BudCast can present the right creator or brand profile."
      />
    );
  }

  const identitySignals = isCreator
    ? ["Creator trust", "Niche visibility", "Marketplace proof"]
    : ["Brand trust", "Campaign authority", "Operator identity"];

  const profileStats = [
    {
      icon: isCreator ? Users2 : BriefcaseBusiness,
      label: "User type",
      value: profile?.user_type ?? "Unknown",
      helper: "Determines which side of BudCast you operate from.",
      valueClassName: "capitalize"
    },
    {
      icon: Sparkles,
      label: "Credits balance",
      value: String(profile?.credits_balance ?? 0),
      helper: "Locked backend balance, not client-side math.",
      valueClassName: ""
    },
    {
      icon: Star,
      label: "Tier",
      value: profile?.tier ?? "free",
      helper: "Subscription posture carried by the current user row.",
      valueClassName: "capitalize"
    },
    {
      icon: BadgeCheck,
      label: "Reputation",
      value: String(profile?.review_score ?? "—"),
      helper: `${profile?.review_count ?? 0} reviews in the current contract.`,
      valueClassName: ""
    }
  ];

  const marketplaceSignals = isCreator
    ? [
        "Brands review this profile when deciding who to accept.",
        "Niches drive campaign relevance on the creator side.",
        "Completion and review signals shape trust before payout."
      ]
    : [
        "Creators use this profile to decide if a campaign feels credible.",
        "Company identity frames campaign quality before anyone applies.",
        "Reputation and payment signals affect future creator trust."
      ];

  const roleDetails = isCreator
    ? [
        { label: "Instagram", value: profile?.instagram ?? "Not set" },
        {
          label: "Niches",
          value: profile?.niches?.length ? profile.niches.join(", ") : "Not set"
        },
        {
          label: "Follower context",
          value: `${formatCompact(profile?.follower_count_instagram)} IG`
        },
        {
          label: "Completion rate",
          value: `${profile?.completion_rate ?? "—"}%`
        }
      ]
    : [
        { label: "Company name", value: profile?.company_name ?? "Not set" },
        { label: "Website", value: profile?.website ?? "Not set" },
        { label: "Payment rate", value: String(profile?.payment_rate ?? "—") },
        {
          label: "Successful campaigns",
          value: String(profile?.successful_campaigns ?? 0)
        }
      ];

  return (
    <main className="grid-overlay min-h-screen px-6 py-10 md:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <LacquerSurface className="animate-enter overflow-hidden px-7 py-8 md:px-10 md:py-10">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="max-w-3xl">
              <Eyebrow className="text-[#b59663]">Profile</Eyebrow>
              <h1 className="mt-4 font-display text-5xl leading-[0.92] text-[#f5efe6] md:text-6xl">
                {profile?.name || profile?.company_name || "No profile yet"}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-stone-300">
                This is the identity surface BudCast uses for routing, reputation, and campaign trust. It should read
                quickly for the other side of the marketplace without feeling like a settings dump.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {identitySignals.map((item) => (
                  <div
                    className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-stone-300"
                    key={item}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/profile/edit">
                  Edit profile
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/onboarding">Onboarding</Link>
              </Button>
              <Button onClick={() => void signOut()} variant="ghost">
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
            </div>
          </div>

          <div className="mt-8 border-t border-white/10 pt-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <Eyebrow className="text-[#b59663]">
                  {isCreator ? "Creator identity ledger" : "Brand credibility ledger"}
                </Eyebrow>
                <div className="mt-3 text-3xl font-semibold text-[#f5efe6]">
                  Keep the public surface clear enough to scan in one pass.
                </div>
              </div>
              <div className="rounded-full border border-[#a48756]/30 bg-[#a48756]/10 px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-[#d7c2a0]">
                {isCreator ? "Creator mode active" : "Brand mode active"}
              </div>
            </div>
          </div>
        </LacquerSurface>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {profileStats.map((stat) => {
            const Icon = stat.icon;

            return (
              <SmokedPanel className="p-6" key={stat.label}>
                <div className="flex items-center gap-3 text-[#b59663]">
                  <Icon className="h-5 w-5" />
                  <span className="text-sm font-medium uppercase tracking-[0.18em] text-stone-300">{stat.label}</span>
                </div>
                <div className={`mt-4 text-3xl font-semibold text-[#f5efe6] ${stat.valueClassName}`}>{stat.value}</div>
                <div className="mt-2 text-sm leading-7 text-stone-400">{stat.helper}</div>
              </SmokedPanel>
            );
          })}
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_320px]">
          <LacquerSurface className="p-6 md:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-6">
              <div className="max-w-3xl">
                <Eyebrow className="text-[#b59663]">Public details</Eyebrow>
                <div className="mt-3 text-3xl font-semibold text-[#f5efe6]">Identity, proof, and niche context</div>
                <p className="mt-3 text-sm leading-7 text-stone-400">
                  The essentials stay grouped here so the profile reads like a working marketplace identity rather than
                  a stack of disconnected settings.
                </p>
              </div>
              <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-stone-300">
                {profile?.email ?? "No session"}
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className={detailPanelClassName}>
                <div className="text-[11px] uppercase tracking-[0.22em] text-stone-500">Email</div>
                <div className="mt-3 text-lg text-stone-100">{profile?.email ?? "No session"}</div>
              </div>
              <div className={detailPanelClassName}>
                <div className="text-[11px] uppercase tracking-[0.22em] text-stone-500">Location</div>
                <div className="mt-3 flex items-center gap-2 text-lg text-stone-100">
                  <MapPin className="h-4 w-4 text-[#b59663]" />
                  {profile?.location ?? "Not set"}
                </div>
              </div>
              <div className={`${detailPanelClassName} md:col-span-2`}>
                <div className="text-[11px] uppercase tracking-[0.22em] text-stone-500">Bio</div>
                <div className="mt-3 text-sm leading-7 text-stone-300">{profile?.bio ?? "Not set"}</div>
              </div>

              {roleDetails.map((detail) => (
                <div className={detailPanelClassName} key={detail.label}>
                  <div className="text-[11px] uppercase tracking-[0.22em] text-stone-500">{detail.label}</div>
                  <div className="mt-3 text-lg text-stone-100">{detail.value}</div>
                </div>
              ))}
            </div>
          </LacquerSurface>

          <div className="grid gap-6">
            <SmokedPanel className="p-5">
              <Eyebrow className="text-[#b59663]">Marketplace reading</Eyebrow>
              <div className="mt-3 text-2xl font-semibold text-[#f5efe6]">What the other side evaluates first</div>
              <div className="mt-5 grid gap-3">
                {marketplaceSignals.map((item, index) => (
                  <div className="rounded-[20px] border border-white/8 bg-black/20 p-4" key={item}>
                    <div className="text-[11px] uppercase tracking-[0.22em] text-stone-500">Signal 0{index + 1}</div>
                    <div className="mt-2 text-sm leading-7 text-stone-300">{item}</div>
                  </div>
                ))}
              </div>
            </SmokedPanel>

            <SmokedPanel className="p-5">
              <Eyebrow className="text-[#b59663]">Next move</Eyebrow>
              <div className="mt-3 text-2xl font-semibold text-[#f5efe6]">Keep the profile current</div>
              <p className="mt-3 text-sm leading-7 text-stone-400">
                Update the identity source of truth before you ask the marketplace to trust it.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/profile/edit">Edit profile</Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link href="/dashboard">Open dashboard</Link>
                </Button>
              </div>
            </SmokedPanel>
          </div>
        </section>
      </div>
    </main>
  );
}
