"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@budcast/shared";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { PublicMarketplaceHeader, PublicMarketplacePreview } from "../../components/public-marketplace-entry";
import { Button } from "../../components/ui/button";
import { getWorkspaceHref } from "../../lib/workspace-routing";

const signals = [
  "Apply as a cannabis creator",
  "Post campaigns and hire creators",
  "Paid & product campaigns"
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
      router.replace(getWorkspaceHref(profile));
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
    <main className="creator-obsidian min-h-screen bg-[#030303] px-4 pb-10 pt-3 text-[#fbfbf7] md:px-8 md:pt-5">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <PublicMarketplaceHeader accountHref="/sign-up" accountLabel="Create account" />
        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_430px] lg:items-start">
          {/* Left — hero panel, headline only, no nested form */}
          <div className="rounded-[38px] border border-white/10 bg-[radial-gradient(circle_at_14%_8%,rgba(184,255,61,0.18),transparent_34%),linear-gradient(145deg,rgba(255,255,255,0.075),rgba(255,255,255,0.025))] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.48),0_1px_0_rgba(255,255,255,0.08)_inset] md:p-8">
            <div className="inline-flex rounded-full border border-[#b8ff3d]/20 bg-[#b8ff3d]/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-[#e7ff9a]">
              BudCast access
            </div>
            <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[0.92] tracking-[-0.045em] text-[#fbfbf7] md:text-6xl">
              Sign back into the cannabis creator network.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[#d8ded1]">
              Creators open the mobile app experience. Brands open campaign control on web or mobile.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {signals.map((signal) => (
                <span
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#c7ccc2]"
                  key={signal}
                >
                  {signal}
                </span>
              ))}
            </div>
          </div>

          {/* Right — standalone form card + marketplace preview stacked */}
          <div className="grid gap-5">
            <div className="rounded-[34px] border border-white/10 bg-[#101010]/88 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.42)] md:p-6">
              <div className="mb-6">
                <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#e7ff9a]">Sign in</div>
                <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-[#fbfbf7]">Welcome back.</h2>
                <p className="mt-3 text-sm leading-7 text-[#c7ccc2]">
                  Creator accounts route to the mobile app. Brand accounts route to campaign control.
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <label className="block text-sm font-medium text-[#fbfbf7]">
                  Email
                  <input
                    className="premium-input mt-2"
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="creator@email.com or brand@company.com"
                    type="email"
                    value={email}
                  />
                </label>

                <label className="block text-sm font-medium text-[#fbfbf7]">
                  Password
                  <input
                    className="premium-input mt-2"
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter password"
                    type="password"
                    value={password}
                  />
                </label>

                <div className="flex justify-end">
                  <Link
                    className="text-xs font-black text-[#c7ccc2] transition hover:text-[#e7ff9a]"
                    href="/forgot-password"
                  >
                    Forgot password?
                  </Link>
                </div>

                {error ? (
                  <div className="rounded-[20px] border border-[#b8ff3d]/20 bg-[#b8ff3d]/[0.08] px-4 py-3 text-sm text-[#d8ded1]">
                    {error}
                  </div>
                ) : null}

                <Button className="w-full" disabled={loading || submitting} size="lg" type="submit">
                  {submitting ? "Signing in..." : "Sign in to BudCast"}
                  {!submitting ? <ArrowRight className="ml-2 h-4 w-4" /> : null}
                </Button>
              </form>

              <div className="mt-6 border-t border-white/8 pt-5 text-sm text-[#aeb5aa]">
                <div className="flex flex-wrap gap-3">
                  <span>Need an account?</span>
                  <Link className="font-black text-[#fbfbf7]" href="/sign-up">
                    Create one
                  </Link>
                </div>
                <div className="mt-2 flex flex-wrap gap-3">
                  <span>Want the overview first?</span>
                  <Link className="font-black text-[#fbfbf7]" href="/">
                    Return to marketplace preview
                  </Link>
                </div>
              </div>
            </div>

            <PublicMarketplacePreview />
          </div>
        </section>
      </div>
    </main>
  );
}
