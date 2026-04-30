"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@budcast/shared";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { PublicMarketplaceHeader, PublicMarketplacePreview, PublicRoleCards } from "../../components/public-marketplace-entry";
import { Button } from "../../components/ui/button";
import { getWorkspaceHref } from "../../lib/workspace-routing";

const valueProps = [
  "Apply as a cannabis creator",
  "Post campaigns and hire creators",
  "Paid & product campaigns"
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
      router.replace(getWorkspaceHref(profile));
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
    <main className="creator-obsidian min-h-screen bg-[#030303] px-4 pb-10 pt-3 text-[#fbfbf7] md:px-8 md:pt-5">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <PublicMarketplaceHeader accountHref="/sign-in" accountLabel="Sign in" />
        <section className="grid gap-5 lg:grid-cols-[430px_minmax(0,1fr)] lg:items-start">
          <div className="rounded-[34px] border border-white/10 bg-[#101010]/88 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.42)] md:p-6">
            <div className="mb-6">
              <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#e7ff9a]">Create account</div>
              <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] text-[#fbfbf7]">Join BudCast.</h1>
              <p className="mt-3 text-sm leading-7 text-[#c7ccc2]">
                Create one account, then choose creator mobile access or brand campaign control in onboarding.
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
                      placeholder="Create a password"
                      type="password"
                      value={password}
                    />
                  </label>

                  {message ? (
                    <div className="rounded-[20px] border border-[#b8ff3d]/30 bg-[#b8ff3d]/10 px-4 py-3 text-sm text-[#e7ff9a]">
                      {message}
                    </div>
                  ) : null}
                  {error ? (
                    <div className="rounded-[20px] border border-[#b8ff3d]/20 bg-[#b8ff3d]/[0.08] px-4 py-3 text-sm text-[#d8ded1]">
                      {error}
                    </div>
                  ) : null}

                  <Button className="w-full" disabled={submitting} size="lg" type="submit">
                    {submitting ? "Creating account..." : "Create account"}
                    {!submitting ? <ArrowRight className="ml-2 h-4 w-4" /> : null}
                  </Button>
            </form>

            <div className="mt-6 border-t border-white/8 pt-5 text-sm text-[#aeb5aa]">
              <span>Already have an account? </span>
              <Link className="font-black text-[#fbfbf7]" href="/sign-in">
                Sign in
              </Link>
            </div>
          </div>

          <div className="grid gap-5">
            <div className="rounded-[38px] border border-white/10 bg-[radial-gradient(circle_at_18%_8%,rgba(184,255,61,0.18),transparent_34%),linear-gradient(145deg,rgba(255,255,255,0.075),rgba(255,255,255,0.025))] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.48),0_1px_0_rgba(255,255,255,0.08)_inset] md:p-8">
              <div className="inline-flex rounded-full border border-[#b8ff3d]/20 bg-[#b8ff3d]/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-[#e7ff9a]">
                Marketplace entry
              </div>
              <h2 className="mt-5 max-w-3xl text-4xl font-black leading-[0.92] tracking-[-0.045em] text-[#fbfbf7] md:text-6xl">
                Start as a mobile-first creator or launch campaigns as a brand.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-[#d8ded1]">
                BudCast connects cannabis brands and creators through campaigns, social proof, messages, approval
                workflows, and payment or pickup coordination. Creators use the app. Brands can work from desktop or phone.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {valueProps.map((item) => (
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#c7ccc2]" key={item}>
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <PublicRoleCards />
            <PublicMarketplacePreview />
          </div>
        </section>
      </div>
    </main>
  );
}
