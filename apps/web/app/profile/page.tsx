"use client";

import Link from "next/link";
import { formatCompact, hasCompletedOnboarding, useAuth } from "@budcast/shared";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ArrowRight, BadgeCheck, BriefcaseBusiness, LogOut, MapPin, Sparkles, Star, Users2 } from "lucide-react";
import { RouteTransitionScreen } from "../../components/route-transition-screen";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";

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

  return (
    <main className="grid-overlay min-h-screen px-6 py-10 md:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <Card className="hero-orbit soft-panel animate-enter overflow-hidden p-8 md:p-10">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="max-w-3xl">
              <div className="premium-badge">
                <span className="signal-dot" />
                <div>
                  <div className="text-xs uppercase tracking-[0.3em] text-surface-500">Profile</div>
                  <div className="text-sm font-medium text-surface-900">
                    {isCreator ? "Creator identity surface" : "Brand credibility surface"}
                  </div>
                </div>
              </div>
              <h1 className="mt-6 font-display text-5xl leading-[0.96] text-surface-900 md:text-6xl">
                {loading ? "Loading profile..." : profile?.name || profile?.company_name || "No profile yet"}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-surface-700">
                This page is wired to the shared auth hydration model. Once onboarding writes the users row, this
                becomes the profile source of truth for routing, reputation, and campaign decisions.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {(isCreator
                  ? ["Creator trust", "Niche visibility", "Marketplace proof"]
                  : ["Brand trust", "Campaign authority", "Operator identity"]
                ).map((item, index) => (
                  <div className={`premium-chip ${index === 1 ? "animate-float" : ""}`} key={item}>
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
        </Card>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <Card className="sheen p-6">
            <div className="flex items-center gap-3 text-herb-700">
              {isCreator ? <Users2 className="h-5 w-5" /> : <BriefcaseBusiness className="h-5 w-5" />}
              <span className="text-sm font-medium uppercase tracking-[0.18em]">User type</span>
            </div>
            <div className="mt-4 text-3xl font-semibold capitalize text-surface-900">{profile?.user_type ?? "Unknown"}</div>
            <div className="mt-2 text-sm text-surface-600">Determines which side of BudCast you operate from.</div>
          </Card>
          <Card className="sheen p-6">
            <div className="flex items-center gap-3 text-herb-700">
              <Sparkles className="h-5 w-5" />
              <span className="text-sm font-medium uppercase tracking-[0.18em]">Credits balance</span>
            </div>
            <div className="mt-4 text-3xl font-semibold text-surface-900">{profile?.credits_balance ?? 0}</div>
            <div className="mt-2 text-sm text-surface-600">Locked backend balance, not client-side math.</div>
          </Card>
          <Card className="sheen p-6">
            <div className="flex items-center gap-3 text-herb-700">
              <Star className="h-5 w-5" />
              <span className="text-sm font-medium uppercase tracking-[0.18em]">Tier</span>
            </div>
            <div className="mt-4 text-3xl font-semibold capitalize text-surface-900">{profile?.tier ?? "free"}</div>
            <div className="mt-2 text-sm text-surface-600">Subscription posture carried by the current user row.</div>
          </Card>
          <Card className="sheen p-6">
            <div className="flex items-center gap-3 text-herb-700">
              <BadgeCheck className="h-5 w-5" />
              <span className="text-sm font-medium uppercase tracking-[0.18em]">Reputation</span>
            </div>
            <div className="mt-4 text-3xl font-semibold text-surface-900">{profile?.review_score ?? "—"}</div>
            <div className="mt-2 text-sm text-surface-600">
              {profile?.review_count ?? 0} reviews in the current contract.
            </div>
          </Card>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.06fr_0.94fr]">
          <Card className="soft-panel p-8">
            <div className="flex items-center gap-3 text-surface-900">
              {isCreator ? <Users2 className="h-5 w-5 text-herb-700" /> : <BriefcaseBusiness className="h-5 w-5 text-herb-700" />}
              <h2 className="font-display text-4xl">Public profile details</h2>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-[24px] border border-white/80 bg-white/74 p-5">
                <div className="text-xs uppercase tracking-[0.22em] text-surface-500">Email</div>
                <div className="mt-3 text-lg text-surface-900">{profile?.email ?? "No session"}</div>
              </div>
              <div className="rounded-[24px] border border-white/80 bg-white/74 p-5">
                <div className="text-xs uppercase tracking-[0.22em] text-surface-500">Location</div>
                <div className="mt-3 flex items-center gap-2 text-lg text-surface-900">
                  <MapPin className="h-4 w-4 text-herb-700" />
                  {profile?.location ?? "Not set"}
                </div>
              </div>
              <div className="rounded-[24px] border border-white/80 bg-white/74 p-5 md:col-span-2">
                <div className="text-xs uppercase tracking-[0.22em] text-surface-500">Bio</div>
                <div className="mt-3 text-sm leading-7 text-surface-900">{profile?.bio ?? "Not set"}</div>
              </div>

              {isCreator ? (
                <>
                  <div className="rounded-[24px] border border-white/80 bg-white/74 p-5">
                    <div className="text-xs uppercase tracking-[0.22em] text-surface-500">Instagram</div>
                    <div className="mt-3 text-lg text-surface-900">{profile?.instagram ?? "Not set"}</div>
                  </div>
                  <div className="rounded-[24px] border border-white/80 bg-white/74 p-5">
                    <div className="text-xs uppercase tracking-[0.22em] text-surface-500">Niches</div>
                    <div className="mt-3 text-sm leading-7 text-surface-900">
                      {profile?.niches?.length ? profile.niches.join(", ") : "Not set"}
                    </div>
                  </div>
                  <div className="rounded-[24px] border border-white/80 bg-white/74 p-5">
                    <div className="text-xs uppercase tracking-[0.22em] text-surface-500">Follower context</div>
                    <div className="mt-3 text-lg text-surface-900">
                      {formatCompact(profile?.follower_count_instagram)} IG
                    </div>
                  </div>
                  <div className="rounded-[24px] border border-white/80 bg-white/74 p-5">
                    <div className="text-xs uppercase tracking-[0.22em] text-surface-500">Completion rate</div>
                    <div className="mt-3 text-lg text-surface-900">{profile?.completion_rate ?? "—"}%</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="rounded-[24px] border border-white/80 bg-white/74 p-5">
                    <div className="text-xs uppercase tracking-[0.22em] text-surface-500">Company name</div>
                    <div className="mt-3 text-lg text-surface-900">{profile?.company_name ?? "Not set"}</div>
                  </div>
                  <div className="rounded-[24px] border border-white/80 bg-white/74 p-5">
                    <div className="text-xs uppercase tracking-[0.22em] text-surface-500">Website</div>
                    <div className="mt-3 text-lg text-surface-900">{profile?.website ?? "Not set"}</div>
                  </div>
                  <div className="rounded-[24px] border border-white/80 bg-white/74 p-5">
                    <div className="text-xs uppercase tracking-[0.22em] text-surface-500">Payment rate</div>
                    <div className="mt-3 text-lg text-surface-900">{profile?.payment_rate ?? "—"}</div>
                  </div>
                  <div className="rounded-[24px] border border-white/80 bg-white/74 p-5">
                    <div className="text-xs uppercase tracking-[0.22em] text-surface-500">Successful campaigns</div>
                    <div className="mt-3 text-lg text-surface-900">{profile?.successful_campaigns ?? 0}</div>
                  </div>
                </>
              )}
            </div>
          </Card>

          <div className="grid gap-6">
            <Card className="soft-panel p-8">
              <div className="text-xs uppercase tracking-[0.24em] text-surface-500">How this profile is used</div>
              <h2 className="mt-2 font-display text-3xl text-surface-900">Operational downstream</h2>
              <div className="mt-5 grid gap-3">
                {(isCreator
                  ? [
                      "Brands review this profile when deciding who to accept.",
                      "Niches drive campaign relevance on the creator side.",
                      "Completion and review signals shape trust before payout."
                    ]
                  : [
                      "Creators use this profile to decide if a campaign feels credible.",
                      "Company identity frames campaign quality before anyone applies.",
                      "Reputation and payment signals affect future creator trust."
                    ]).map((item, index) => (
                  <div className="rounded-[22px] border border-white/80 bg-white/74 p-4" key={item}>
                    <div className="text-xs uppercase tracking-[0.2em] text-surface-500">Signal 0{index + 1}</div>
                    <div className="mt-2 text-sm leading-7 text-surface-800">{item}</div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="soft-panel p-8">
              <div className="text-xs uppercase tracking-[0.24em] text-surface-500">Quick actions</div>
              <h2 className="mt-2 font-display text-3xl text-surface-900">Keep the profile current</h2>
              <p className="mt-3 text-sm leading-7 text-surface-700">
                This screen should feel like a living market identity, not a dead-end settings page.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/profile/edit">Edit profile</Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link href="/dashboard">Open dashboard</Link>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
