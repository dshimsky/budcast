"use client";

import { hasCompletedOnboarding, useAuth, useOnboarding, useSaveProfile } from "@budcast/shared";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BriefcaseBusiness, RefreshCcw, Sparkles, Users2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";

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

export default function OnboardingPage() {
  const router = useRouter();
  const { session, profile, loading } = useAuth();
  const onboarding = useOnboarding();
  const saveProfile = useSaveProfile();
  const [feedback, setFeedback] = useState<string | null>(null);

  const userType = onboarding.userType;
  const isCreator = userType === "creator";
  const onboardingComplete = hasCompletedOnboarding(profile);

  useEffect(() => {
    if (profile) onboarding.hydrateFromProfile(profile);
  }, [onboarding, profile]);

  useEffect(() => {
    if (!loading && onboardingComplete) {
      router.replace("/profile");
    }
  }, [loading, onboardingComplete, router]);

  const canSubmit = useMemo(() => {
    if (!userType) return false;
    if (!onboarding.name.trim()) return false;
    if (isCreator) return Boolean(onboarding.instagram.trim());
    return Boolean(onboarding.companyName.trim());
  }, [isCreator, onboarding.companyName, onboarding.instagram, onboarding.name, userType]);

  async function handleSave() {
    if (!userType) {
      setFeedback("Pick creator or brand before saving.");
      return;
    }

    try {
      setFeedback(null);
      await saveProfile.mutateAsync({ userType });
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
                  <div className="text-xs uppercase tracking-[0.3em] text-surface-500">Onboarding</div>
                  <div className="text-sm font-medium text-surface-900">Choose your marketplace role</div>
                </div>
              </div>
              <h1 className="mt-6 font-display text-5xl leading-[0.96] text-surface-900 md:text-6xl">
                BudCast should know whether you are here to hire creators or become one.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-surface-700">
                Creator and brand onboarding diverge immediately, but they still persist through the same shared store
                and profile save path. The design should make that fork feel intentional, not technical.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => onboarding.setUserType("brand")}
                variant={userType === "brand" ? "primary" : "secondary"}
              >
                <BriefcaseBusiness className="mr-2 h-4 w-4" />
                I&apos;m a brand
              </Button>
              <Button
                onClick={() => onboarding.setUserType("creator")}
                variant={userType === "creator" ? "primary" : "secondary"}
              >
                <Users2 className="mr-2 h-4 w-4" />
                I&apos;m a creator
              </Button>
              <Button onClick={() => onboarding.reset()} variant="ghost">
                <RefreshCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>

          {!session && !loading ? (
            <div className="mt-6 rounded-[24px] border border-surface-200 bg-white/76 p-4 text-sm leading-7 text-surface-700">
              You need an authenticated session before this can save to Supabase.
              <Link className="ml-2 font-medium text-herb-700" href="/sign-in">
                Sign in
              </Link>
            </div>
          ) : null}
        </Card>

        <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <Card className="soft-panel animate-enter animate-enter-delay-1 p-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.24em] text-surface-500">
                  {isCreator ? "Creator profile setup" : "Brand profile setup"}
                </div>
                <h2 className="mt-2 font-display text-4xl text-surface-900">
                  {isCreator ? "Build the creator profile brands will review." : "Set up the brand profile creators will trust."}
                </h2>
              </div>
              <div className="premium-chip">
                {userType ? `${userType} mode active` : "Pick a mode to continue"}
              </div>
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-2">
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
                  <div className="md:col-span-2">
                    <div className="text-sm font-medium text-surface-800">Niches</div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {creatorNiches.map((niche) => {
                        const selected = onboarding.niches.includes(niche);
                        return (
                          <button
                            className={`rounded-full px-4 py-2 text-sm transition ${
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
              <Button disabled={!session || loading || saveProfile.isPending || !canSubmit} onClick={handleSave} size="lg">
                {saveProfile.isPending ? "Saving..." : "Save profile"}
                {!saveProfile.isPending ? <ArrowRight className="ml-2 h-4 w-4" /> : null}
              </Button>
              {feedback ? <p className="text-sm text-red-700">{feedback}</p> : null}
            </div>
          </Card>

          <div className="grid gap-6">
            <Card className="soft-panel animate-enter animate-enter-delay-2 p-8">
              <div className="flex items-center gap-3 text-surface-900">
                <Sparkles className="h-5 w-5 text-herb-700" />
                <h2 className="font-display text-3xl">Role signal</h2>
              </div>
              <div className="mt-5 grid gap-4">
                <div className="rounded-[24px] border border-white/80 bg-white/72 p-5">
                  <div className="text-xs uppercase tracking-[0.22em] text-surface-500">Brand side</div>
                  <p className="mt-3 text-sm leading-7 text-surface-700">
                    Needs credibility, clean company context, and a profile that can support campaign review decisions.
                  </p>
                </div>
                <div className="rounded-[24px] border border-white/80 bg-white/72 p-5">
                  <div className="text-xs uppercase tracking-[0.22em] text-surface-500">Creator side</div>
                  <p className="mt-3 text-sm leading-7 text-surface-700">
                    Needs social proof, clear niches, and a profile brands can trust enough to spend credits on.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="soft-panel animate-enter animate-enter-delay-3 p-8">
              <div className="text-xs uppercase tracking-[0.24em] text-surface-500">Live persisted state</div>
              <h2 className="mt-2 font-display text-3xl text-surface-900">Profile payload preview</h2>
              <pre className="mt-5 overflow-x-auto rounded-[24px] bg-surface-900 p-5 text-sm text-surface-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                {JSON.stringify(onboarding, null, 2)}
              </pre>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
