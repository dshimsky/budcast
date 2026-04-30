"use client";

import { hasCompletedOnboarding, useAuth, useOnboarding, useSaveProfile } from "@budcast/shared";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BriefcaseBusiness, RefreshCcw, Users2 } from "lucide-react";
import { PublicMarketplaceHeader } from "../../components/public-marketplace-entry";
import { Button } from "../../components/ui/button";
import { getWorkspaceHref, getWorkspaceHrefForUserType } from "../../lib/workspace-routing";

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

function formatNiche(niche: string) {
  return niche
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

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
      router.replace(getWorkspaceHref(profile));
    }
  }, [loading, onboardingComplete, profile, router]);

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
      const savedProfile = await saveProfile.mutateAsync({ userType });
      router.replace(getWorkspaceHrefForUserType(savedProfile.user_type));
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Profile save failed.");
    }
  }

  return (
    <main className="creator-obsidian min-h-screen bg-[#030303] px-4 pb-10 pt-3 text-[#fbfbf7] md:px-8 md:pt-5">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <PublicMarketplaceHeader accountHref="/" accountLabel="Marketplace" signedIn={Boolean(session)} />
        <section className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div className="rounded-[38px] border border-white/10 bg-[radial-gradient(circle_at_16%_8%,rgba(184,255,61,0.18),transparent_34%),linear-gradient(145deg,rgba(255,255,255,0.075),rgba(255,255,255,0.025))] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.48),0_1px_0_rgba(255,255,255,0.08)_inset] md:p-8">
            <div className="inline-flex rounded-full border border-[#b8ff3d]/20 bg-[#b8ff3d]/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-[#e7ff9a]">
              Onboarding
            </div>
            <h1 className="mt-5 max-w-3xl text-5xl font-black leading-[0.92] tracking-[-0.045em] text-[#fbfbf7] md:text-7xl">
              Choose how you want to use BudCast.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[#d8ded1]">
              Creators set up the mobile app profile brands review. Brands set up the company profile creators see before applying.
            </p>

            <div className="mt-7 grid gap-3">
              {[
                {
                  copy: "Use the mobile app to browse campaigns, submit content, message brands, and track payment status.",
                  icon: Users2,
                  label: "Content creator",
                  mode: "creator" as const
                },
                {
                  copy: "Use web or mobile to post campaign briefs, review creators, approve content, and track payments.",
                  icon: BriefcaseBusiness,
                  label: "Cannabis brand",
                  mode: "brand" as const
                }
              ].map((option) => {
                const Icon = option.icon;
                const selected = userType === option.mode;
                return (
                  <button
                    aria-pressed={selected}
                    className={`rounded-[30px] border p-5 text-left transition active:scale-[0.99] ${
                      selected
                        ? "border-[#b8ff3d]/45 bg-[#b8ff3d]/12 shadow-[0_18px_48px_rgba(184,255,61,0.16)]"
                        : "border-white/10 bg-white/[0.04] hover:border-white/16 hover:bg-white/[0.06]"
                    }`}
                    key={option.mode}
                    onClick={() => onboarding.setUserType(option.mode)}
                    type="button"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-lg font-black text-[#fbfbf7]">{option.label}</div>
                        <p className="mt-2 text-sm leading-6 text-[#c7ccc2]">{option.copy}</p>
                      </div>
                      <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border ${
                        selected ? "border-[#b8ff3d]/35 bg-[#b8ff3d] text-[#071007]" : "border-white/10 bg-white/[0.04] text-[#c7ccc2]"
                      }`}>
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <Button className="mt-5 border-white/10 text-[#c7ccc2]" onClick={() => onboarding.reset()} variant="ghost">
              <RefreshCcw className="mr-2 h-4 w-4" />
              Reset selection
            </Button>
          </div>

          <div className="rounded-[38px] border border-white/10 bg-[#101010]/88 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.42)] md:p-8">

              {!session && !loading ? (
                <div className="mb-6 rounded-[24px] border border-amber-400/20 bg-amber-400/10 px-4 py-4 text-sm leading-7 text-[#d8ded1]">
                  You need to sign in before this can save.
                  <Link className="ml-2 font-medium text-[#fbfbf7]" href="/sign-in">
                    Sign in
                  </Link>
                </div>
              ) : null}

              <div>
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#e7ff9a]">
                      {isCreator ? "Creator profile setup" : "Brand profile setup"}
                    </div>
                    <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-[#fbfbf7]">
                      {isCreator ? "Build the profile cannabis brands will review." : "Set up the brand profile creators will trust."}
                    </h2>
                  </div>
                  <div
                    className={`rounded-full border px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] ${
                      userType
                        ? "border-[#b8ff3d]/30 bg-[#b8ff3d]/10 text-[#e7ff9a]"
                        : "border-white/10 bg-white/[0.04] text-[#aeb5aa]"
                    }`}
                  >
                    {userType
                      ? `${userType === "creator" ? "Creator" : "Brand"} mode active`
                      : "Pick a mode to continue"}
                  </div>
                </div>

                <div className="mt-5 max-w-3xl text-sm leading-7 text-[#c7ccc2]">
                  {isCreator ? (
                    <p>
                      Add your creator name, location, social handles, and cannabis content niches for the mobile creator
                      app profile brands review.
                    </p>
                  ) : (
                    <p>
                      Add your company name, location, website, and brand context so creators know who is posting the
                      campaign brief.
                    </p>
                  )}
                </div>

                <div className="mt-8 grid gap-5 md:grid-cols-2">
                  <label className="text-sm font-black text-[#d8ded1]">
                    {isCreator ? "Creator name" : "Brand contact name"}
                    <input
                      className="premium-input mt-2"
                      onChange={(event) => onboarding.setField("name", event.target.value)}
                      value={onboarding.name}
                    />
                  </label>
                  <label className="text-sm font-black text-[#d8ded1]">
                    Location
                    <input
                      className="premium-input mt-2"
                      onChange={(event) => onboarding.setField("location", event.target.value)}
                      value={onboarding.location}
                    />
                  </label>
                  <label className="text-sm font-black text-[#d8ded1] md:col-span-2">
                    Bio
                    <textarea
                      className="premium-textarea mt-2"
                      onChange={(event) => onboarding.setField("bio", event.target.value)}
                      value={onboarding.bio}
                    />
                  </label>

                  {isCreator ? (
                    <>
                      <label className="text-sm font-black text-[#d8ded1]">
                        Instagram
                        <input
                          className="premium-input mt-2"
                          onChange={(event) => onboarding.setField("instagram", event.target.value)}
                          value={onboarding.instagram}
                        />
                      </label>
                      <label className="text-sm font-black text-[#d8ded1]">
                        TikTok
                        <input
                          className="premium-input mt-2"
                          onChange={(event) => onboarding.setField("tiktok", event.target.value)}
                          value={onboarding.tiktok}
                        />
                      </label>
                      <div className="md:col-span-2">
                        <div className="text-sm font-black text-[#d8ded1]">Niches</div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {creatorNiches.map((niche) => {
                            const selected = onboarding.niches.includes(niche);
                            return (
                              <button
                                className={`rounded-full px-4 py-2 text-sm font-black transition ${
                                  selected
                                    ? "border border-[#b8ff3d]/35 bg-[#b8ff3d]/12 text-[#e7ff9a] shadow-[0_14px_30px_rgba(184,255,61,0.12)]"
                                    : "border border-white/10 bg-white/[0.04] text-[#d8ded1] hover:-translate-y-0.5"
                                }`}
                                aria-pressed={selected}
                                key={niche}
                                onClick={() => onboarding.toggleNiche(niche)}
                                type="button"
                              >
                                {formatNiche(niche)}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <label className="text-sm font-black text-[#d8ded1]">
                        Company name
                        <input
                          className="premium-input mt-2"
                          onChange={(event) => onboarding.setField("companyName", event.target.value)}
                          value={onboarding.companyName}
                        />
                      </label>
                      <label className="text-sm font-black text-[#d8ded1]">
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
                  <Button className="bg-[#b8ff3d] text-[#071007] hover:bg-[#d7ff72]" disabled={!session || loading || saveProfile.isPending || !canSubmit} onClick={handleSave} size="lg">
                    {saveProfile.isPending ? "Saving..." : "Save profile"}
                    {!saveProfile.isPending ? <ArrowRight className="ml-2 h-4 w-4" /> : null}
                  </Button>
                  {feedback ? <p className="text-sm text-[#d8ded1]">{feedback}</p> : null}
                </div>
              </div>
          </div>
        </section>
      </div>
    </main>
  );
}
