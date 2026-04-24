"use client";

import Link from "next/link";
import { hasCompletedOnboarding, useAuth, useOnboarding, useSaveProfile } from "@budcast/shared";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, BriefcaseBusiness, Sparkles, Users2 } from "lucide-react";
import { RouteTransitionScreen } from "../../../components/route-transition-screen";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";

const creatorNiches = [
  "flower",
  "pre_rolls",
  "edibles",
  "vapes",
  "concentrates",
  "topicals",
  "accessories",
  "lifestyle"
] as const;

export default function EditProfilePage() {
  const router = useRouter();
  const { loading, session, profile } = useAuth();
  const onboarding = useOnboarding();
  const saveProfile = useSaveProfile();
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
  }, [loading, profile, router, session]);

  useEffect(() => {
    if (profile) onboarding.hydrateFromProfile(profile);
  }, [onboarding, profile]);

  const isCreator = profile?.user_type === "creator";
  const canSave = useMemo(() => {
    if (!profile?.user_type) return false;
    if (!onboarding.name.trim()) return false;
    if (profile.user_type === "creator") return Boolean(onboarding.instagram.trim());
    return Boolean(onboarding.companyName.trim());
  }, [onboarding.companyName, onboarding.instagram, onboarding.name, profile?.user_type]);

  if (loading || !session) {
    return (
      <RouteTransitionScreen
        eyebrow="Checking session"
        title="Preparing profile editing."
        description="BudCast is validating your account before opening profile edits."
      />
    );
  }

  if (!hasCompletedOnboarding(profile)) {
    return (
      <RouteTransitionScreen
        eyebrow="Routing to setup"
        title="Finish setup before editing details."
        description="Profile editing unlocks after onboarding so the right creator or brand surface is already established."
      />
    );
  }

  async function handleSave() {
    if (!profile?.user_type) return;
    try {
      setFeedback(null);
      await saveProfile.mutateAsync({ userType: profile.user_type });
      router.replace("/profile");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Profile save failed.");
    }
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
                  <div className="text-xs uppercase tracking-[0.3em] text-surface-500">Profile editor</div>
                  <div className="text-sm font-medium text-surface-900">
                    {isCreator ? "Shape creator trust" : "Shape brand credibility"}
                  </div>
                </div>
              </div>
              <h1 className="mt-6 font-display text-5xl leading-[0.96] text-surface-900 md:text-6xl">
                Edit the public profile the marketplace will actually see.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-surface-700">
                This writes directly into the locked users row. Same save path as onboarding, no separate profile API,
                just a better surface for updating the identity that powers the marketplace.
              </p>
            </div>
            <Button asChild variant="secondary">
              <Link href="/profile">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to profile
              </Link>
            </Button>
          </div>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[1.04fr_0.96fr]">
          <Card className="soft-panel p-8">
            <div className="flex items-center gap-3 text-surface-900">
              {isCreator ? <Users2 className="h-5 w-5 text-herb-700" /> : <BriefcaseBusiness className="h-5 w-5 text-herb-700" />}
              <h2 className="font-display text-4xl">Profile fields</h2>
            </div>

            <div className="mt-7 grid gap-5 md:grid-cols-2">
              <label className="text-sm font-medium text-surface-800">
                {isCreator ? "Display name" : "Owner name"}
                <input
                  className="premium-input mt-2"
                  onChange={(event) => onboarding.setField("name", event.target.value)}
                  value={onboarding.name}
                />
              </label>
              <label className="text-sm font-medium text-surface-800">
                Location
                <input
                  className="premium-input mt-2"
                  onChange={(event) => onboarding.setField("location", event.target.value)}
                  value={onboarding.location}
                />
              </label>
              <label className="text-sm font-medium text-surface-800 md:col-span-2">
                Bio
                <textarea
                  className="premium-textarea mt-2"
                  onChange={(event) => onboarding.setField("bio", event.target.value)}
                  value={onboarding.bio}
                />
              </label>

              {isCreator ? (
                <>
                  <label className="text-sm font-medium text-surface-800">
                    Instagram
                    <input
                      className="premium-input mt-2"
                      onChange={(event) => onboarding.setField("instagram", event.target.value)}
                      value={onboarding.instagram}
                    />
                  </label>
                  <label className="text-sm font-medium text-surface-800">
                    TikTok
                    <input
                      className="premium-input mt-2"
                      onChange={(event) => onboarding.setField("tiktok", event.target.value)}
                      value={onboarding.tiktok}
                    />
                  </label>
                  <label className="text-sm font-medium text-surface-800 md:col-span-2">
                    YouTube
                    <input
                      className="premium-input mt-2"
                      onChange={(event) => onboarding.setField("youtube", event.target.value)}
                      value={onboarding.youtube}
                    />
                  </label>
                  <div className="md:col-span-2">
                    <div className="mb-2 text-sm font-medium uppercase tracking-[0.18em] text-surface-600">Niches</div>
                    <div className="flex flex-wrap gap-2">
                      {creatorNiches.map((niche) => {
                        const selected = onboarding.niches.includes(niche);
                        return (
                          <button
                            className={`rounded-full px-4 py-2 text-sm transition duration-300 ${
                              selected
                                ? "bg-herb-700 text-white shadow-[0_14px_30px_rgba(67,87,48,0.18)]"
                                : "border border-surface-200 bg-white/82 text-surface-700 hover:-translate-y-0.5"
                            }`}
                            key={niche}
                            onClick={() => onboarding.toggleNiche(niche)}
                            type="button"
                          >
                            {niche.replace("_", " ")}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <label className="text-sm font-medium text-surface-800">
                    Company name
                    <input
                      className="premium-input mt-2"
                      onChange={(event) => onboarding.setField("companyName", event.target.value)}
                      value={onboarding.companyName}
                    />
                  </label>
                  <label className="text-sm font-medium text-surface-800">
                    Website
                    <input
                      className="premium-input mt-2"
                      onChange={(event) => onboarding.setField("website", event.target.value)}
                      value={onboarding.website}
                    />
                  </label>
                </>
              )}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button disabled={!canSave || saveProfile.isPending} onClick={handleSave} size="lg">
                {saveProfile.isPending ? "Saving..." : "Save changes"}
                {!saveProfile.isPending ? <ArrowRight className="ml-2 h-4 w-4" /> : null}
              </Button>
              {feedback ? <p className="text-sm text-red-700">{feedback}</p> : null}
            </div>
          </Card>

          <div className="grid gap-6">
            <Card className="soft-panel p-8">
              <div className="flex items-center gap-3 text-surface-900">
                <Sparkles className="h-5 w-5 text-herb-700" />
                <h2 className="font-display text-3xl">Editing intent</h2>
              </div>
              <div className="mt-5 grid gap-3">
                {(isCreator
                  ? [
                      "Brands use this profile to evaluate creator fit before acceptance.",
                      "Clear niche and social identity reduces low-intent applications.",
                      "The profile should look curated, not barely configured."
                    ]
                  : [
                      "Creators use this profile to judge whether a campaign feels worth their effort.",
                      "A weak brand profile erodes trust before a brief is even opened.",
                      "Company context should feel considered, not boilerplate."
                    ]).map((item, index) => (
                  <div className="rounded-[22px] border border-white/80 bg-white/74 p-4" key={item}>
                    <div className="text-xs uppercase tracking-[0.2em] text-surface-500">Note 0{index + 1}</div>
                    <div className="mt-2 text-sm leading-7 text-surface-800">{item}</div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="soft-panel p-8">
              <div className="text-xs uppercase tracking-[0.3em] text-surface-500">Current output</div>
              <h2 className="mt-2 font-display text-3xl text-surface-900">Persisted payload preview</h2>
              <pre className="mt-5 overflow-x-auto rounded-[24px] bg-surface-900 p-5 text-sm text-surface-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                {JSON.stringify(
                  {
                    userType: profile?.user_type,
                    name: onboarding.name,
                    location: onboarding.location,
                    bio: onboarding.bio,
                    instagram: onboarding.instagram,
                    tiktok: onboarding.tiktok,
                    youtube: onboarding.youtube,
                    companyName: onboarding.companyName,
                    website: onboarding.website,
                    niches: onboarding.niches
                  },
                  null,
                  2
                )}
              </pre>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
