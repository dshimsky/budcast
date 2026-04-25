"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { hasCompletedOnboarding, useAuth } from "@budcast/shared";
import { useRouter } from "next/navigation";
import { ArrowRight, BriefcaseBusiness, Sparkles, WandSparkles } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Eyebrow } from "../../components/ui/eyebrow";
import { LacquerSurface } from "../../components/ui/surface-tone";

const valueProps = [
  "Find paid creator opportunities",
  "Post cannabis brand campaign briefs",
  "Track submissions, approvals, and payments"
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
    <main className="grid-overlay min-h-screen bg-[#080a08] px-6 py-10 text-stone-100 md:px-10">
      <div className="mx-auto w-full max-w-6xl">
        <section className="hero-orbit animate-enter">
          <LacquerSurface className="overflow-hidden px-7 py-8 md:px-10 md:py-10">
            <div className="grid gap-8 lg:grid-cols-[380px_minmax(0,1fr)] lg:items-start">
              <div className="animate-enter animate-enter-delay-1 border-b border-white/10 pb-8 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-8">
                <div className="mb-7">
                  <Eyebrow className="text-[#b59663]">Create account</Eyebrow>
                  <h1 className="mt-3 text-3xl font-semibold text-[#f5efe6]">Open your BudCast account</h1>
                  <p className="mt-3 text-sm leading-7 text-stone-400">
                    Create one account, then choose whether you are joining as a content creator or a cannabis brand.
                  </p>
                </div>

                <form className="space-y-5" onSubmit={handleSubmit}>
                  <label className="block text-sm font-medium text-stone-200">
                    Email
                    <input
                      className="premium-input mt-2"
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="creator@email.com or brand@company.com"
                      type="email"
                      value={email}
                    />
                  </label>
                  <label className="block text-sm font-medium text-stone-200">
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
                    <div className="rounded-[20px] border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
                      {message}
                    </div>
                  ) : null}
                  {error ? (
                    <div className="rounded-[20px] border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                      {error}
                    </div>
                  ) : null}

                  <Button className="w-full" disabled={submitting} size="lg" type="submit">
                    {submitting ? "Creating account..." : "Create account"}
                    {!submitting ? <ArrowRight className="ml-2 h-4 w-4" /> : null}
                  </Button>
                </form>

                <div className="mt-6 border-t border-white/8 pt-5 text-sm text-stone-400">
                  <span>Already have an account? </span>
                  <Link className="font-medium text-stone-100" href="/sign-in">
                    Sign in
                  </Link>
                </div>
              </div>

              <div className="max-w-3xl lg:pl-4">
                <Eyebrow className="text-[#b59663]">Marketplace entry</Eyebrow>
                <h2 className="mt-4 font-display text-5xl leading-[0.92] text-[#f5efe6] md:text-6xl">
                  Join the marketplace where cannabis brands hire creators for paid content.
                </h2>
                <p className="mt-5 max-w-2xl text-base leading-8 text-stone-300">
                  Creators can apply to paid content opportunities. Brands can post campaign briefs, review creators,
                  approve submissions, and keep payment status clear.
                </p>

                <div className="mt-10 grid gap-4 border-t border-white/10 pt-6 md:grid-cols-3">
                  {valueProps.map((item, index) => (
                    <div key={item}>
                      {index === 0 ? (
                        <WandSparkles className="h-5 w-5 text-stone-400" />
                      ) : index === 1 ? (
                        <BriefcaseBusiness className="h-5 w-5 text-stone-400" />
                      ) : (
                        <Sparkles className="h-5 w-5 text-stone-400" />
                      )}
                      <div className="mt-4 text-lg font-semibold text-[#f5efe6]">{item}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </LacquerSurface>
        </section>
      </div>
    </main>
  );
}
