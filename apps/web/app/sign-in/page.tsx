"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { hasCompletedOnboarding, useAuth } from "@budcast/shared";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck, Sparkles, Users2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";

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
    <main className="grid-overlay min-h-screen px-6 py-10 md:px-10">
      <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1.02fr_0.98fr]">
        <Card className="hero-orbit soft-panel animate-enter overflow-hidden p-8 md:p-10">
          <div className="premium-badge">
            <span className="signal-dot" />
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-surface-500">BudCast Access</div>
              <div className="text-sm font-medium text-surface-900">Marketplace login</div>
            </div>
          </div>

          <div className="mt-8 max-w-2xl">
            <div className="text-xs uppercase tracking-[0.24em] text-surface-500">Brand trust x creator momentum</div>
            <h1 className="mt-3 font-display text-5xl leading-[0.96] text-surface-900 md:text-6xl">
              Sign in to the operator layer where campaigns, creators, and payouts stay in sync.
            </h1>
            <p className="mt-5 text-base leading-8 text-surface-700">
              This route is already wired to the shared Supabase auth provider. Once the session resolves, BudCast
              branches the user into brand or creator flows from the same hydrated profile.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {signals.map((signal) => (
              <div className="premium-chip" key={signal}>
                {signal}
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <div className="rounded-[24px] border border-white/80 bg-white/76 p-5 shadow-[0_18px_44px_rgba(33,27,20,0.07)]">
              <ShieldCheck className="h-5 w-5 text-herb-700" />
              <div className="mt-4 text-lg font-semibold text-surface-900">Unified auth</div>
              <p className="mt-2 text-sm leading-7 text-surface-700">One session model for both sides of the marketplace.</p>
            </div>
            <div className="rounded-[24px] border border-white/80 bg-white/76 p-5 shadow-[0_18px_44px_rgba(33,27,20,0.07)] animate-float">
              <Sparkles className="h-5 w-5 text-herb-700" />
              <div className="mt-4 text-lg font-semibold text-surface-900">Premium first impression</div>
              <p className="mt-2 text-sm leading-7 text-surface-700">The funnel should feel polished before any campaign data even loads.</p>
            </div>
            <div className="rounded-[24px] border border-white/80 bg-white/76 p-5 shadow-[0_18px_44px_rgba(33,27,20,0.07)]">
              <Users2 className="h-5 w-5 text-herb-700" />
              <div className="mt-4 text-lg font-semibold text-surface-900">Two-sided routing</div>
              <p className="mt-2 text-sm leading-7 text-surface-700">Brands and creators diverge after profile hydration, not before.</p>
            </div>
          </div>
        </Card>

        <Card className="soft-panel animate-enter animate-enter-delay-1 p-7 md:p-8">
          <div className="mb-7">
            <div className="text-xs uppercase tracking-[0.3em] text-surface-500">Sign in</div>
            <h2 className="mt-3 font-display text-4xl text-surface-900">Back into BudCast</h2>
            <p className="mt-3 text-sm leading-7 text-surface-700">
              Enter the account that owns your creator profile or brand workspace.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <label className="block text-sm font-medium text-surface-800">
              Email
              <input
                className="premium-input mt-2"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@company.com"
                type="email"
                value={email}
              />
            </label>

            <label className="block text-sm font-medium text-surface-800">
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
              <div className="rounded-[20px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            ) : null}

            {profile ? (
              <div className="rounded-[20px] border border-herb-200 bg-herb-50 px-4 py-3 text-sm text-herb-800">
                Profile already loaded for {profile.email}.
              </div>
            ) : null}

            <Button className="w-full" disabled={loading || submitting} size="lg" type="submit">
              {submitting ? "Signing in..." : "Enter BudCast"}
              {!submitting ? <ArrowRight className="ml-2 h-4 w-4" /> : null}
            </Button>
          </form>

          <div className="mt-6 flex flex-wrap gap-3 text-sm text-surface-600">
            <span>Need an account?</span>
            <Link className="font-medium text-herb-700" href="/sign-up">
              Create one
            </Link>
          </div>
          <div className="mt-2 flex flex-wrap gap-3 text-sm text-surface-600">
            <span>Want the overview first?</span>
            <Link className="font-medium text-herb-700" href="/">
              Return to marketplace preview
            </Link>
          </div>
        </Card>
      </div>
    </main>
  );
}
