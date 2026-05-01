"use client";

import { hasCompletedOnboarding, hasCompletedTrustCompliance, supabase, useAuth, useOnboarding, useSaveProfile } from "@budcast/shared";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BriefcaseBusiness, Users2, ShieldCheck, MapPin, Calendar } from "lucide-react";
import { PublicMarketplaceHeader } from "../../components/public-marketplace-entry";
import { Button } from "../../components/ui/button";
import { getWorkspaceHref, getWorkspaceHrefForUserType } from "../../lib/workspace-routing";

const creatorNiches = [
  "flower", "pre_rolls", "edibles", "vapes",
  "concentrates", "topicals", "accessories", "lifestyle"
] as const;

const US_STATES = [
  { code: "AK", name: "Alaska" }, { code: "AL", name: "Alabama" },
  { code: "AZ", name: "Arizona" }, { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" }, { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" }, { code: "DE", name: "Delaware" },
  { code: "DC", name: "Washington D.C." }, { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" }, { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" }, { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" }, { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" }, { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" }, { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" }, { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" }, { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" }, { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" }, { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" }, { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" }, { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" }, { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" }, { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" }, { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" }, { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" }, { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" }, { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" }, { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" }, { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" }, { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
];

function formatNiche(niche: string) {
  return niche.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

// Onboarding steps
type Step = "role" | "profile" | "age_gate" | "terms";

export default function OnboardingPage() {
  const router = useRouter();
  const { session, profile, loading, refreshProfile } = useAuth();
  const onboarding = useOnboarding();
  const saveProfile = useSaveProfile();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("role");
  const [submitting, setSubmitting] = useState(false);

  // Age gate fields
  const [dob, setDob] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [platformRulesAccepted, setPlatformRulesAccepted] = useState(false);

  const userType = onboarding.userType;
  const isCreator = userType === "creator";
  const profileComplete = hasCompletedOnboarding(profile);
  const trustComplete = hasCompletedTrustCompliance(profile);
  const onboardingComplete = profileComplete && trustComplete;

  useEffect(() => {
    if (!profile) return;
    onboarding.hydrateFromProfile(profile);
    if (hasCompletedOnboarding(profile) && !hasCompletedTrustCompliance(profile)) {
      setStep("age_gate");
    }
  }, [onboarding, profile]);

  useEffect(() => {
    if (!loading && onboardingComplete) {
      router.replace(getWorkspaceHref(profile));
    }
  }, [loading, onboardingComplete, profile, router]);

  // Age validation — must be 21+
  const ageIsValid = useMemo(() => {
    if (!dob) return false;
    const birthDate = new Date(dob);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear() -
      (today < new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate()) ? 1 : 0);
    return age >= 21;
  }, [dob]);

  const canSubmitProfile = useMemo(() => {
    if (!userType) return false;
    if (!onboarding.name.trim()) return false;
    if (isCreator) return Boolean(onboarding.instagram.trim());
    return Boolean(onboarding.companyName.trim());
  }, [isCreator, onboarding.companyName, onboarding.instagram, onboarding.name, userType]);

  const canSubmitAgeGate = ageIsValid && Boolean(stateCode);
  const canSubmitTerms = termsAccepted && platformRulesAccepted;

  // Step 1: Save profile, then advance to age gate
  async function handleSaveProfile() {
    if (!userType) { setFeedback("Pick creator or brand before continuing."); return; }
    try {
      setFeedback(null);
      setSubmitting(true);
      await saveProfile.mutateAsync({ userType });
      setStep("age_gate");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Profile save failed.");
    } finally {
      setSubmitting(false);
    }
  }

  // Step 2: Submit age gate + state via accept_terms RPC
  async function handleAgeGate() {
    if (!canSubmitAgeGate) return;
    setStep("terms");
  }

  // Step 3: Accept terms — calls accept_terms RPC
  async function handleAcceptTerms() {
    if (!canSubmitTerms) return;
    try {
      setFeedback(null);
      setSubmitting(true);
      const { data, error } = await supabase.rpc("accept_terms", {
        p_date_of_birth:  dob,
        p_state_code:     stateCode,
        p_policy_version: "1.0",
      });
      if (error) throw error;
      if (!data?.success) throw new Error("Terms acceptance failed.");
      await refreshProfile();
      // Redirect to workspace
      router.replace(getWorkspaceHrefForUserType(userType!));
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass = "w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-[#fbfbf7] placeholder:text-white/30 focus:border-[#b8ff3d]/40 focus:outline-none focus:ring-1 focus:ring-[#b8ff3d]/30 transition";
  const labelClass = "block text-xs font-bold uppercase tracking-[0.12em] text-[#b8ff3d]/70 mb-2";

  return (
    <main className="creator-obsidian min-h-screen bg-[#030303] px-4 pb-10 pt-3 text-[#fbfbf7] md:px-8 md:pt-5">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <PublicMarketplaceHeader accountHref="/" accountLabel="Marketplace" signedIn={Boolean(session)} />

        {/* Step progress indicator */}
        <div className="mx-auto flex w-full max-w-lg items-center gap-2 px-1">
          {(["role", "profile", "age_gate", "terms"] as Step[]).map((s, i) => (
            <div key={s} className="flex flex-1 items-center gap-2">
              <div className={`h-1.5 flex-1 rounded-full transition-all ${
                ["role","profile","age_gate","terms"].indexOf(step) >= i
                  ? "bg-[#b8ff3d]"
                  : "bg-white/10"
              }`} />
            </div>
          ))}
        </div>

        <section className="mx-auto w-full max-w-lg">
          <div className="rounded-[38px] border border-white/10 bg-[radial-gradient(circle_at_16%_8%,rgba(184,255,61,0.18),transparent_34%),linear-gradient(145deg,rgba(255,255,255,0.075),rgba(255,255,255,0.025))] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.48),0_1px_0_rgba(255,255,255,0.08)_inset] md:p-8">

            {/* ── STEP: ROLE ── */}
            {step === "role" && (
              <>
                <div className="inline-flex rounded-full border border-[#b8ff3d]/20 bg-[#b8ff3d]/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-[#e7ff9a]">
                  Step 1 of 4 — Who are you?
                </div>
                <h1 className="mt-5 text-4xl font-black leading-[0.92] tracking-[-0.04em] text-[#fbfbf7] md:text-5xl">
                  Choose how you&apos;ll use BudCast.
                </h1>
                <p className="mt-4 text-sm leading-7 text-[#d8ded1]">
                  Creators browse and apply to campaigns. Brands post campaigns and review creators.
                </p>
                <div className="mt-6 grid gap-3">
                  {([
                    { copy: "Browse campaigns, submit content, message brands, and track campaign status.", icon: Users2, label: "Content creator", mode: "creator" as const },
                    { copy: "Post briefs, review creators, approve content, and track campaign results.", icon: BriefcaseBusiness, label: "Cannabis brand", mode: "brand" as const },
                  ]).map((option) => {
                    const Icon = option.icon;
                    const selected = userType === option.mode;
                    return (
                      <button
                        aria-pressed={selected}
                        className={`rounded-[24px] border p-5 text-left transition active:scale-[0.99] ${
                          selected
                            ? "border-[#b8ff3d]/45 bg-[#b8ff3d]/12 shadow-[0_18px_48px_rgba(184,255,61,0.16)]"
                            : "border-white/10 bg-white/[0.04] hover:border-white/16 hover:bg-white/[0.06]"
                        }`}
                        key={option.mode}
                        onClick={() => onboarding.setUserType(option.mode)}
                        type="button"
                      >
                        <div className="flex items-start gap-3">
                          <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${selected ? "text-[#b8ff3d]" : "text-white/40"}`} />
                          <div>
                            <div className={`text-sm font-bold ${selected ? "text-[#b8ff3d]" : "text-[#fbfbf7]"}`}>{option.label}</div>
                            <div className="mt-1 text-xs leading-5 text-white/50">{option.copy}</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <Button
                  className="mt-6 w-full"
                  disabled={!userType}
                  onClick={() => setStep("profile")}
                  type="button"
                >
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </>
            )}

            {/* ── STEP: PROFILE ── */}
            {step === "profile" && (
              <>
                <div className="inline-flex rounded-full border border-[#b8ff3d]/20 bg-[#b8ff3d]/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-[#e7ff9a]">
                  Step 2 of 4 — Your profile
                </div>
                <h2 className="mt-5 text-3xl font-black tracking-[-0.04em] text-[#fbfbf7]">
                  Set up your {isCreator ? "creator" : "brand"} profile.
                </h2>
                <div className="mt-6 grid gap-4">
                  <div>
                    <label className={labelClass}>Your name</label>
                    <input className={inputClass} onChange={(e) => onboarding.setField("name", e.target.value)} placeholder={isCreator ? "Your name" : "Your full name"} type="text" value={onboarding.name} />
                  </div>
                  {isCreator ? (
                    <div>
                      <label className={labelClass}>Instagram handle</label>
                      <input className={inputClass} onChange={(e) => onboarding.setField("instagram", e.target.value)} placeholder="@yourhandle" type="text" value={onboarding.instagram} />
                    </div>
                  ) : (
                    <div>
                      <label className={labelClass}>Brand / company name</label>
                      <input className={inputClass} onChange={(e) => onboarding.setField("companyName", e.target.value)} placeholder="Your cannabis brand" type="text" value={onboarding.companyName} />
                    </div>
                  )}
                </div>
                {feedback && <p className="mt-3 text-sm text-red-400">{feedback}</p>}
                <Button
                  className="mt-6 w-full"
                  disabled={!canSubmitProfile || submitting}
                  onClick={handleSaveProfile}
                  type="button"
                >
                  {submitting ? "Saving..." : <>Continue <ArrowRight className="ml-2 h-4 w-4" /></>}
                </Button>
              </>
            )}

            {/* ── STEP: AGE GATE ── */}
            {step === "age_gate" && (
              <>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-[#b8ff3d]/20 bg-[#b8ff3d]/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-[#e7ff9a]">
                  <ShieldCheck className="h-3 w-3" /> Step 3 of 4 — Age &amp; Location
                </div>
                <h2 className="mt-5 text-3xl font-black tracking-[-0.04em] text-[#fbfbf7]">
                  You must be 21+ to use BudCast.
                </h2>
                <p className="mt-3 text-sm leading-6 text-white/50">
                  BudCast is a cannabis creator platform. We are required to verify your age and confirm you are in a jurisdiction where cannabis marketing is permitted.
                </p>
                <div className="mt-6 grid gap-4">
                  <div>
                    <label className={labelClass}>
                      <Calendar className="mr-1.5 inline h-3 w-3" />
                      Date of birth
                    </label>
                    <input
                      className={inputClass}
                      max={new Date(new Date().setFullYear(new Date().getFullYear() - 21)).toISOString().split("T")[0]}
                      onChange={(e) => setDob(e.target.value)}
                      type="date"
                      value={dob}
                    />
                    {dob && !ageIsValid && (
                      <p className="mt-2 text-xs text-red-400">You must be 21 or older to use BudCast.</p>
                    )}
                    {dob && ageIsValid && (
                      <p className="mt-2 text-xs text-[#b8ff3d]/70">✓ Age confirmed</p>
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>
                      <MapPin className="mr-1.5 inline h-3 w-3" />
                      Your state
                    </label>
                    <select
                      className={inputClass + " cursor-pointer"}
                      onChange={(e) => setStateCode(e.target.value)}
                      value={stateCode}
                    >
                      <option value="">Select your state...</option>
                      {US_STATES.map((s) => (
                        <option key={s.code} value={s.code}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <Button
                  className="mt-6 w-full"
                  disabled={!canSubmitAgeGate}
                  onClick={handleAgeGate}
                  type="button"
                >
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </>
            )}

            {/* ── STEP: TERMS ── */}
            {step === "terms" && (
              <>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-[#b8ff3d]/20 bg-[#b8ff3d]/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-[#e7ff9a]">
                  <ShieldCheck className="h-3 w-3" /> Step 4 of 4 — Terms
                </div>
                <h2 className="mt-5 text-3xl font-black tracking-[-0.04em] text-[#fbfbf7]">
                  Review and accept the terms.
                </h2>
                <p className="mt-3 text-sm leading-6 text-white/50">
                  BudCast is a marketing collaboration platform. We do not facilitate cannabis transactions or product transfer logistics.
                </p>

                <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-xs leading-6 text-white/60 space-y-2">
                  <p className="font-bold text-white/80">By using BudCast you agree to:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Disclose all sponsored or gifted content with #ad or #gifted</li>
                    <li>Not make health claims about cannabis products</li>
                    <li>Not use sale language or coordinate regulated cannabis transactions</li>
                    <li>Only create content in states where cannabis marketing is permitted</li>
                    <li>Not post content featuring minors or promoting unsafe use</li>
                    <li>Follow all applicable state and local cannabis advertising laws</li>
                  </ul>
                </div>

                <div className="mt-5 space-y-3">
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      checked={termsAccepted}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-[#b8ff3d]"
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      type="checkbox"
                    />
                    <span className="text-xs leading-5 text-white/60">
                      I agree to the{" "}
                      <a className="text-[#b8ff3d]/80 underline" href="/legal/creator-terms" target="_blank">Creator Terms</a>
                      {" "}and{" "}
                      <a className="text-[#b8ff3d]/80 underline" href="/legal/brand-terms" target="_blank">Brand Terms</a>
                      . I confirm I am 21 or older.
                    </span>
                  </label>
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      checked={platformRulesAccepted}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-[#b8ff3d]"
                      onChange={(e) => setPlatformRulesAccepted(e.target.checked)}
                      type="checkbox"
                    />
                    <span className="text-xs leading-5 text-white/60">
                      I understand BudCast does not facilitate cannabis transactions and I will follow all{" "}
                      <a className="text-[#b8ff3d]/80 underline" href="/legal/platform-rules" target="_blank">Platform Rules</a>
                      {" "}including FTC disclosure requirements.
                    </span>
                  </label>
                </div>

                {feedback && <p className="mt-3 text-sm text-red-400">{feedback}</p>}

                <Button
                  className="mt-6 w-full"
                  disabled={!canSubmitTerms || submitting}
                  onClick={handleAcceptTerms}
                  type="button"
                >
                  {submitting ? "Setting up your account..." : <>Enter BudCast <ArrowRight className="ml-2 h-4 w-4" /></>}
                </Button>
              </>
            )}

          </div>
        </section>
      </div>
    </main>
  );
}
