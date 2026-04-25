"use client";

import Link from "next/link";
import { hasCompletedOnboarding, useAuth, useOnboarding, useSaveProfile } from "@budcast/shared";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, BriefcaseBusiness, Sparkles, Users2 } from "lucide-react";
import { RouteTransitionScreen } from "../../../components/route-transition-screen";
import { Button } from "../../../components/ui/button";
import { Eyebrow } from "../../../components/ui/eyebrow";
import { LacquerSurface, SmokedPanel } from "../../../components/ui/surface-tone";

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
  const hydratedProfileId = useRef<string | null>(null);

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
    if (!profile?.id || hydratedProfileId.current === profile.id) return;
    onboarding.hydrateFromProfile(profile);
    hydratedProfileId.current = profile.id;
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

  async function handleSave(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (!profile?.user_type) return;
    try {
      setFeedback(null);
      await saveProfile.mutateAsync({ userType: profile.user_type });
      router.replace("/profile");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Profile save failed.");
    }
  }

  const editingNotes = isCreator
    ? [
        "Brands use this profile to evaluate creator fit before acceptance.",
        "Clear niche and social identity reduces low-intent applications.",
        "The profile should look curated, not barely configured."
      ]
    : [
        "Creators use this profile to judge whether a campaign feels worth their effort.",
        "A weak brand profile erodes trust before a brief is even opened.",
        "Company context should feel considered, not boilerplate."
      ];

  return (
    <main className="grid-overlay min-h-screen px-6 py-10 md:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <LacquerSurface className="animate-enter overflow-hidden px-7 py-8 md:px-10 md:py-10">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="max-w-3xl">
              <Eyebrow className="text-[#b59663]">Profile editor</Eyebrow>
              <h1 className="mt-4 font-display text-5xl leading-[0.92] text-[#f5efe6] md:text-6xl">
                Edit the public profile the marketplace will actually see.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-stone-300">
                This updates your public BudCast profile using the same setup flow, so creators and brands see one
                consistent profile across the marketplace.
              </p>
            </div>
            <Button asChild variant="secondary">
              <Link href="/profile">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to profile
              </Link>
            </Button>
          </div>

          <div className="mt-8 border-t border-white/10 pt-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <Eyebrow className="text-[#b59663]">
                  {isCreator ? "Creator editing flow" : "Brand editing flow"}
                </Eyebrow>
                <div className="mt-3 text-3xl font-semibold text-[#f5efe6]">
                  Shape the identity, trust, and context the marketplace reads first.
                </div>
              </div>
              <div className="rounded-full border border-[#a48756]/30 bg-[#a48756]/10 px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-[#d7c2a0]">
                {isCreator ? "Creator mode active" : "Brand mode active"}
              </div>
            </div>
          </div>
        </LacquerSurface>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_320px]">
          <LacquerSurface className="p-6 md:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-6">
              <div className="max-w-3xl">
                <Eyebrow className="text-[#b59663]">Profile fields</Eyebrow>
                <div className="mt-3 text-3xl font-semibold text-[#f5efe6]">
                  {isCreator ? "Creator identity and niche fit" : "Brand identity and credibility"}
                </div>
                <p className="mt-3 text-sm leading-7 text-stone-400">
                  Keep this concise and specific. Every field here saves through the same setup flow you already used.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-stone-300">
                {isCreator ? <Users2 className="h-4 w-4 text-[#b59663]" /> : <BriefcaseBusiness className="h-4 w-4 text-[#b59663]" />}
                {isCreator ? "Creator profile" : "Brand profile"}
              </div>
            </div>

            <form className="mt-7 grid gap-5 md:grid-cols-2" onSubmit={handleSave}>
              <label className="text-sm font-medium text-stone-200">
                {isCreator ? "Display name" : "Owner name"}
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
                  <label className="text-sm font-medium text-stone-200 md:col-span-2">
                    YouTube
                    <input
                      className="premium-input mt-2"
                      onChange={(event) => onboarding.setField("youtube", event.target.value)}
                      value={onboarding.youtube}
                    />
                  </label>
                  <div className="md:col-span-2">
                    <div className="text-sm font-medium text-stone-200">Niches</div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {creatorNiches.map((niche) => {
                        const selected = onboarding.niches.includes(niche);
                        return (
                          <button
                            aria-pressed={selected}
                            className={`rounded-full border px-4 py-2 text-sm transition ${
                              selected
                                ? "border-[#a48756]/30 bg-[#a48756]/12 text-[#ead8bb] shadow-[0_14px_30px_rgba(164,135,86,0.12)]"
                                : "border-white/10 bg-white/[0.04] text-stone-300 hover:-translate-y-0.5"
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
              <div className="mt-3 flex flex-wrap items-center gap-3 md:col-span-2">
                <Button disabled={!canSave || saveProfile.isPending} size="lg" type="submit">
                  {saveProfile.isPending ? "Saving..." : "Save changes"}
                  {!saveProfile.isPending ? <ArrowRight className="ml-2 h-4 w-4" /> : null}
                </Button>
                {feedback ? (
                  <p className="text-sm text-red-200" role="alert">
                    {feedback}
                  </p>
                ) : null}
              </div>
            </form>

          </LacquerSurface>

          <div className="grid gap-6">
            <SmokedPanel className="p-5">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-[#b59663]" />
                <div>
                  <Eyebrow className="text-[#b59663]">Editing intent</Eyebrow>
                  <div className="mt-2 text-2xl font-semibold text-[#f5efe6]">What this screen should optimize for</div>
                </div>
              </div>
              <div className="mt-5 grid gap-3">
                {editingNotes.map((item, index) => (
                  <div className="rounded-[20px] border border-white/8 bg-black/20 p-4" key={item}>
                    <div className="text-[11px] uppercase tracking-[0.22em] text-stone-500">Note 0{index + 1}</div>
                    <div className="mt-2 text-sm leading-7 text-stone-300">{item}</div>
                  </div>
                ))}
              </div>
            </SmokedPanel>

            <SmokedPanel className="p-5">
              <Eyebrow className="text-[#b59663]">Current output</Eyebrow>
              <div className="mt-3 text-2xl font-semibold text-[#f5efe6]">Persisted payload preview</div>
              <pre className="mt-5 overflow-x-auto rounded-[24px] border border-white/8 bg-black/30 p-5 text-sm text-stone-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
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
            </SmokedPanel>
          </div>
        </section>
      </div>
    </main>
  );
}
