"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@budcast/shared";
import { PublicMarketplaceHeader } from "../../components/public-marketplace-entry";
import { Button } from "../../components/ui/button";

export default function ForgotPasswordPage() {
  const { resetPasswordForEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await resetPasswordForEmail(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset request failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="creator-obsidian min-h-screen bg-[#030303] px-4 pb-10 pt-3 text-[#fbfbf7] md:px-8 md:pt-5">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <PublicMarketplaceHeader accountHref="/sign-up" accountLabel="Create account" />

        <section className="flex justify-center">
          <div className="w-full max-w-[430px] rounded-[34px] border border-white/10 bg-[#101010]/88 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.42)] md:p-6">
            <div className="mb-6">
              <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#e7ff9a]">
                Password reset
              </div>
              <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] text-[#fbfbf7]">
                Reset your password.
              </h1>
              <p className="mt-3 text-sm leading-7 text-[#c7ccc2]">
                Enter your account email and we&apos;ll send a reset link. Check your inbox within a minute.
              </p>
            </div>

            {sent ? (
              <div className="rounded-[20px] border border-[#b8ff3d]/30 bg-[#b8ff3d]/10 px-4 py-4 text-sm text-[#e7ff9a]">
                Reset link sent. Check your inbox and follow the link to set a new password.
              </div>
            ) : (
              <form className="space-y-5" onSubmit={handleSubmit}>
                <label className="block text-sm font-medium text-[#fbfbf7]">
                  Email
                  <input
                    className="premium-input mt-2"
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    type="email"
                    value={email}
                  />
                </label>

                {error ? (
                  <div className="rounded-[20px] border border-[#b8ff3d]/20 bg-[#b8ff3d]/[0.08] px-4 py-3 text-sm text-[#d8ded1]">
                    {error}
                  </div>
                ) : null}

                <Button className="w-full" disabled={submitting} size="lg" type="submit">
                  {submitting ? "Sending reset link..." : "Send reset link"}
                </Button>
              </form>
            )}

            <div className="mt-6 border-t border-white/8 pt-5">
              <Link
                className="inline-flex items-center gap-2 text-sm font-black text-[#fbfbf7] transition hover:text-[#e7ff9a]"
                href="/sign-in"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to sign in
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
