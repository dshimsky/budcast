"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { hasCompletedOnboarding, useAuth } from "@budcast/shared";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck, Sparkles, Users2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Eyebrow } from "../../components/ui/eyebrow";
import { LacquerSurface } from "../../components/ui/surface-tone";

const signals = [
  "Paid creator opportunities",
  "Brand-safe applicant review",
  "Submission and payout clarity"
];

export default function SignInPage() {
  const router = useRouter();
  const { signIn, loading, session, profile } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && session) {
      router.replace(hasCompletedOnboarding(profile) ? "/profile" : "/onboarding");
    }
  }, [loading, profile, router, session]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await signIn(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="grid-overlay min-h-screen bg-[#080a08] px-6 py-10 text-stone-100 md:px-10">
      <div className="mx-auto w-full max-w-6xl">
        <section className="hero-orbit animate-enter">
          <LacquerSurface className="overflow-hidden px-7 py-8 md:px-10 md:py-10">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_400px] lg:items-start">
              <div className="max-w-3xl">
                <Eyebrow className="text-[#b59663]">BudCast access</Eyebrow>
                <h1 className="mt-4 font-display text-5xl leading-[0.92] text-[#f5efe6] md:text-6xl">
                  Sign in to the operator layer where campaigns, creators, and payouts stay in sync.
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-8 text-stone-300">
                  Shared Supabase auth already routes this session into the right next step. The page just needs to
                  feel like the same protected marketplace before any campaign data loads.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  {signals.map((signal) => (
                    <div className="premium-chip" key={signal}>
                      {signal}
                    </div>
                  ))}
                </div>

                <div className="mt-10 grid gap-4 border-t border-white/10 pt-6 md:grid-cols-3">
                  <div>
                    <ShieldCheck className="h-5 w-5 text-stone-400" />
                    <div className="mt-4 text-lg font-semibold text-[#f5efe6]">Unified auth</div>
                    <p className="mt-2 text-sm leading-7 text-stone-400">One session model for both sides of the marketplace.</p>
                  </div>
                  <div>
                    <Sparkles className="h-5 w-5 text-stone-400" />
                    <div className="mt-4 text-lg font-semibold text-[#f5efe6]">Premium first impression</div>
                    <p className="mt-2 text-sm leading-7 text-stone-400">The funnel should stay composed, dark, and credible.</p>
                  </div>
                  <div>
                    <Users2 className="h-5 w-5 text-stone-400" />
                    <div className="mt-4 text-lg font-semibold text-[#f5efe6]">Two-sided routing</div>
                    <p className="mt-2 text-sm leading-7 text-stone-400">Brands and creators diverge after profile hydration, not before.</p>
                  </div>
                </div>
              </div>

              <div className="animate-enter animate-enter-delay-1 border-t border-white/10 pt-8 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
                <div className="mb-7 max-w-sm">
                  <Eyebrow className="text-[#b59663]">Sign in</Eyebrow>
                  <h2 className="mt-3 text-3xl font-semibold text-[#f5efe6]">Back into BudCast</h2>
                  <p className="mt-3 text-sm leading-7 text-stone-400">
                    Enter the account that owns your creator profile or brand workspace.
                  </p>
                </div>

                <form className="space-y-5" onSubmit={handleSubmit}>
                  <label className="block text-sm font-medium text-stone-200">
                    Email
                    <input
                      className="premium-input mt-2"
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="name@company.com"
                      type="email"
                      value={email}
                    />
                  </label>

                  <label className="block text-sm font-medium text-stone-200">
                    Password
                    <input
                      className="premium-input mt-2"
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Enter password"
                      type="password"
                      value={password}
                    />
                  </label>

                  {error ? (
                    <div className="rounded-[20px] border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                      {error}
                    </div>
                  ) : null}

                  {profile ? (
                    <div className="rounded-[20px] border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
                      Profile already loaded for {profile.email}.
                    </div>
                  ) : null}

                  <Button className="w-full" disabled={loading || submitting} size="lg" type="submit">
                    {submitting ? "Signing in..." : "Enter BudCast"}
                    {!submitting ? <ArrowRight className="ml-2 h-4 w-4" /> : null}
                  </Button>
                </form>

                <div className="mt-6 border-t border-white/8 pt-5 text-sm text-stone-400">
                  <div className="flex flex-wrap gap-3">
                    <span>Need an account?</span>
                    <Link className="font-medium text-stone-100" href="/sign-up">
                      Create one
                    </Link>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-3">
                    <span>Want the overview first?</span>
                    <Link className="font-medium text-stone-100" href="/">
                      Return to marketplace preview
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </LacquerSurface>
        </section>
      </div>
    </main>
  );
}
