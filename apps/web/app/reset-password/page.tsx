"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@budcast/shared";
import { PublicMarketplaceHeader } from "../../components/public-marketplace-entry";
import { Button } from "../../components/ui/button";

export default function ResetPasswordPage() {
  const { updatePassword } = useAuth();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await updatePassword(password);
      router.replace("/sign-in");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Password update failed.");
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
                New password
              </div>
              <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] text-[#fbfbf7]">
                Set a new password.
              </h1>
              <p className="mt-3 text-sm leading-7 text-[#c7ccc2]">
                Choose a strong password for your BudCast account. You&apos;ll sign in with it immediately after.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <label className="block text-sm font-medium text-[#fbfbf7]">
                New password
                <input
                  className="premium-input mt-2"
                  minLength={8}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  type="password"
                  value={password}
                />
              </label>

              <label className="block text-sm font-medium text-[#fbfbf7]">
                Confirm password
                <input
                  className="premium-input mt-2"
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repeat password"
                  required
                  type="password"
                  value={confirm}
                />
              </label>

              {error ? (
                <div className="rounded-[20px] border border-[#b8ff3d]/20 bg-[#b8ff3d]/[0.08] px-4 py-3 text-sm text-[#d8ded1]">
                  {error}
                </div>
              ) : null}

              <Button className="w-full" disabled={submitting} size="lg" type="submit">
                {submitting ? "Updating password..." : "Update password"}
              </Button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
