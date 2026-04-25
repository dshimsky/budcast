"use client";

import { hasCompletedOnboarding, useAuth, useOnboarding, useSaveProfile } from "@budcast/shared";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BriefcaseBusiness, RefreshCcw, Users2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Eyebrow } from "../../components/ui/eyebrow";
import { LacquerSurface } from "../../components/ui/surface-tone";

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
    <main className="grid-overlay min-h-screen bg-[#080a08] px-6 py-10 text-stone-100 md:px-10">
      <div className="mx-auto max-w-7xl">
        <section className="hero-orbit animate-enter">
          <LacquerSurface className="overflow-hidden px-7 py-8 md:px-10 md:py-10">
            <div className="max-w-4xl">
              <div className="flex flex-wrap items-start justify-between gap-5">
                <div className="max-w-3xl">
                  <Eyebrow className="text-[#b59663]">Onboarding</Eyebrow>
                  <h1 className="mt-4 font-display text-5xl leading-[0.92] text-[#f5efe6] md:text-6xl">
                    Tell BudCast whether you are a content creator or a cannabis brand.
                  </h1>
                  <p className="mt-5 max-w-2xl text-base leading-8 text-stone-300">
                    Creators build a profile brands can review. Brands set up the company profile creators will see
                    before applying to a paid content brief.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button
                    aria-pressed={userType === "brand"}
                    onClick={() => onboarding.setUserType("brand")}
                    variant={userType === "brand" ? "primary" : "secondary"}
                  >
                    <BriefcaseBusiness className="mr-2 h-4 w-4" />
                    I&apos;m a cannabis brand
                  </Button>
                  <Button
                    aria-pressed={userType === "creator"}
                    onClick={() => onboarding.setUserType("creator")}
                    variant={userType === "creator" ? "primary" : "secondary"}
                  >
                    <Users2 className="mr-2 h-4 w-4" />
                    I&apos;m a content creator
                  </Button>
                  <Button onClick={() => onboarding.reset()} variant="ghost">
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    Reset
                  </Button>
                </div>
              </div>

              {!session && !loading ? (
                <div className="mt-6 rounded-[24px] border border-amber-400/20 bg-amber-400/10 px-4 py-4 text-sm leading-7 text-amber-100">
                  You need to sign in before this can save.
                  <Link className="ml-2 font-medium text-[#f5efe6]" href="/sign-in">
                    Sign in
                  </Link>
                </div>
              ) : null}

              <div className="mt-8 border-t border-white/10 pt-8">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <Eyebrow className="text-[#b59663]">
                      {isCreator ? "Creator profile setup" : "Brand profile setup"}
                    </Eyebrow>
                    <h2 className="mt-3 text-3xl font-semibold text-[#f5efe6]">
                      {isCreator ? "Build the profile cannabis brands will review." : "Set up the brand profile creators will trust."}
                    </h2>
                  </div>
                  <div
                    className={`rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.24em] ${
                      userType
                        ? "border-[#a48756]/30 bg-[#a48756]/10 text-[#d7c2a0]"
                        : "border-white/10 bg-white/[0.04] text-stone-400"
                    }`}
                  >
                    {userType ? `${userType} mode active` : "Pick a mode to continue"}
                  </div>
                </div>

                <div className="mt-5 max-w-3xl text-sm leading-7 text-stone-400">
                  {isCreator ? (
                    <p>
                      Add your creator name, location, social handles, and cannabis content niches so brands understand
                      what type of paid work fits you.
                    </p>
                  ) : (
                    <p>
                      Add your company name, location, website, and brand context so creators know who is posting the
                      campaign brief.
                    </p>
                  )}
                </div>

                <div className="mt-8 grid gap-5 md:grid-cols-2">
                  <label className="text-sm font-medium text-stone-200">
                    {isCreator ? "Creator name" : "Brand contact name"}
                    <input
                      className="premium-input mt-2"
                      onChange={(event) => onboarding.setField("name", event.target.value)}
                      value={onboarding.name}
                    />
                  </label>
                  <label className="text-sm font-medium text-stone-200">
                    Location
                    <input
                      className="premium-input mt-2"
                      onChange={(event) => onboarding.setField("location", event.target.value)}
                      value={onboarding.location}
                    />
                  </label>
                  <label className="text-sm font-medium text-stone-200 md:col-span-2">
                    Bio
                    <textarea
                      className="premium-textarea mt-2"
                      onChange={(event) => onboarding.setField("bio", event.target.value)}
                      value={onboarding.bio}
                    />
                  </label>

                  {isCreator ? (
                    <>
                      <label className="text-sm font-medium text-stone-200">
                        Instagram
                        <input
                          className="premium-input mt-2"
                          onChange={(event) => onboarding.setField("instagram", event.target.value)}
                          value={onboarding.instagram}
                        />
                      </label>
                      <label className="text-sm font-medium text-stone-200">
                        TikTok
                        <input
                          className="premium-input mt-2"
                          onChange={(event) => onboarding.setField("tiktok", event.target.value)}
                          value={onboarding.tiktok}
                        />
                      </label>
                      <div className="md:col-span-2">
                        <div className="text-sm font-medium text-stone-200">Niches</div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {creatorNiches.map((niche) => {
                            const selected = onboarding.niches.includes(niche);
                            return (
                              <button
                                className={`rounded-full px-4 py-2 text-sm transition ${
                                  selected
                                    ? "border border-[#a48756]/30 bg-[#a48756]/12 text-[#ead8bb] shadow-[0_14px_30px_rgba(164,135,86,0.12)]"
                                    : "border border-white/10 bg-white/[0.04] text-stone-300 hover:-translate-y-0.5"
                                }`}
                                aria-pressed={selected}
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
                      <label className="text-sm font-medium text-stone-200">
                        Company name
                        <input
                          className="premium-input mt-2"
                          onChange={(event) => onboarding.setField("companyName", event.target.value)}
                          value={onboarding.companyName}
                        />
                      </label>
                      <label className="text-sm font-medium text-stone-200">
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
                  {feedback ? <p className="text-sm text-red-200">{feedback}</p> : null}
                </div>
              </div>
            </div>
          </LacquerSurface>
        </section>
      </div>
    </main>
  );
}
