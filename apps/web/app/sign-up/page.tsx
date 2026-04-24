"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { hasCompletedOnboarding, useAuth } from "@budcast/shared";
import { useRouter } from "next/navigation";
import { ArrowRight, BriefcaseBusiness, Sparkles, WandSparkles } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";

const valueProps = [
  "Find paid creator opportunities",
  "Launch brand-safe campaigns",
  "Keep payout follow-through visible"
];

export default function SignUpPage() {
  const router = useRouter();
  const { signUp, loading, session, profile } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
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
    setMessage(null);

    try {
      await signUp(email, password);
      setMessage("Sign-up request submitted. Check your inbox if email confirmation is enabled.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="grid-overlay min-h-screen px-6 py-10 md:px-10">
      <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[0.96fr_1.04fr]">
        <Card className="soft-panel animate-enter p-7 md:p-8">
          <div className="mb-7">
            <div className="text-xs uppercase tracking-[0.3em] text-surface-500">Create account</div>
            <h1 className="mt-3 font-display text-4xl text-surface-900">Open your BudCast account</h1>
            <p className="mt-3 text-sm leading-7 text-surface-700">
              Shared auth is live already. The next move after this route is user-type onboarding so the same backend
              can power both creator and brand experiences cleanly.
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
                placeholder="Create a password"
                type="password"
                value={password}
              />
            </label>

            {message ? (
              <div className="rounded-[20px] border border-herb-200 bg-herb-50 px-4 py-3 text-sm text-herb-800">{message}</div>
            ) : null}
            {error ? (
              <div className="rounded-[20px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            ) : null}

            <Button className="w-full" disabled={submitting} size="lg" type="submit">
              {submitting ? "Creating account..." : "Create account"}
              {!submitting ? <ArrowRight className="ml-2 h-4 w-4" /> : null}
            </Button>
          </form>

          <div className="mt-6 flex flex-wrap gap-3 text-sm text-surface-600">
            <span>Already have an account?</span>
            <Link className="font-medium text-herb-700" href="/sign-in">
              Sign in
            </Link>
          </div>
        </Card>

        <Card className="hero-orbit soft-panel animate-enter animate-enter-delay-1 overflow-hidden p-8 md:p-10">
          <div className="premium-badge">
            <Sparkles className="h-4 w-4 text-herb-700" />
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-surface-500">Marketplace entry</div>
              <div className="text-sm font-medium text-surface-900">Creators and brands start here</div>
            </div>
          </div>

          <div className="mt-8 max-w-2xl">
            <div className="text-xs uppercase tracking-[0.24em] text-surface-500">Premium funnel</div>
            <h2 className="mt-3 font-display text-5xl leading-[0.96] text-surface-900 md:text-6xl">
              A creator marketplace should feel like a high-trust invitation, not a commodity signup form.
            </h2>
            <p className="mt-5 text-base leading-8 text-surface-700">
              BudCast is selling credibility to both sides. The moment of account creation should already hint at the
              quality of the brands, creators, and campaign flow behind it.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {valueProps.map((item, index) => (
              <div
                className={`rounded-[24px] border border-white/80 bg-white/74 p-5 shadow-[0_18px_44px_rgba(33,27,20,0.07)] ${index === 1 ? "animate-float" : ""}`}
                key={item}
              >
                {index === 0 ? (
                  <WandSparkles className="h-5 w-5 text-herb-700" />
                ) : index === 1 ? (
                  <BriefcaseBusiness className="h-5 w-5 text-herb-700" />
                ) : (
                  <Sparkles className="h-5 w-5 text-herb-700" />
                )}
                <div className="mt-4 text-base font-semibold text-surface-900">{item}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </main>
  );
}
