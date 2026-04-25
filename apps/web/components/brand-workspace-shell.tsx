"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { hasCompletedOnboarding, useAuth } from "@budcast/shared";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Settings2,
  ShieldCheck,
  Sparkles,
  UserRound
} from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Eyebrow } from "./ui/eyebrow";
import { LacquerSurface, SmokedPanel } from "./ui/surface-tone";

function isActivePath(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function BrandWorkspaceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { profile, loading, signOut } = useAuth();
  const onboardingComplete = hasCompletedOnboarding(profile);

  if (!loading && profile?.user_type && profile.user_type !== "brand") {
    return (
      <main className="grid-overlay min-h-screen px-6 py-10">
        <div className="mx-auto w-full max-w-5xl">{children}</div>
      </main>
    );
  }

  const navItems = [
    {
      href: "/dashboard",
      icon: LayoutDashboard,
      label: "Overview",
      description: "Campaign snapshot"
    },
    {
      href: "/dashboard/campaigns/new",
      icon: Sparkles,
      label: "New Campaign",
      description: "Post a brief"
    },
    {
      href: "/dashboard/submissions",
      icon: ShieldCheck,
      label: "Submissions",
      description: "Approve content"
    },
    {
      href: "/profile",
      icon: UserRound,
      label: "Profile",
      description: "Brand identity"
    },
    {
      href: "/onboarding",
      icon: Settings2,
      label: "Setup",
      description: "Brand details"
    }
  ];

  return (
    <main className="min-h-screen bg-[#080a08] px-5 py-6 md:px-8">
      <div className="mx-auto grid w-full max-w-[1480px] gap-6 xl:grid-cols-[296px_minmax(0,1fr)]">
        <aside className="xl:sticky xl:top-6 xl:self-start">
          <LacquerSurface className="overflow-hidden p-5">
            <div className="rounded-[28px] border border-white/8 bg-white/[0.04] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Eyebrow>BudCast For Brands</Eyebrow>
                  <div className="mt-3 font-display text-3xl leading-tight text-[#f5efe6]">
                    {profile?.company_name || profile?.name || "Cannabis brand"}
                  </div>
                  <div className="mt-3 text-sm leading-6 text-stone-300">
                    {onboardingComplete
                      ? "Post campaign briefs, review creators, approve submitted content, and track payments."
                      : "Finish setup so creators can understand your brand before applying."}
                  </div>
                </div>
                <div
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.24em] ${
                    onboardingComplete
                      ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                      : "border-[#a48756]/30 bg-[#a48756]/10 text-[#d7c2a0]"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      onboardingComplete ? "bg-emerald-300 shadow-[0_0_14px_rgba(110,231,183,0.55)]" : "bg-[#b59663]"
                    }`}
                  />
                  {onboardingComplete ? "Ready" : "Setup"}
                </div>
              </div>
            </div>

            <SmokedPanel className="mt-4 p-4">
              <Eyebrow>Brand Account</Eyebrow>
              <div className="mt-4 grid gap-4">
                <div className="flex items-center justify-between gap-3 border-b border-white/8 pb-4">
                  <div className="flex items-center gap-3 text-stone-300">
                    <CreditCard className="h-4 w-4 text-[#d7c2a0]" />
                    <span className="text-xs uppercase tracking-[0.22em]">Credits</span>
                  </div>
                  <div className="text-lg font-semibold text-[#f5efe6]">{profile?.credits_balance ?? 0}</div>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 text-stone-300">
                    <BriefcaseBusiness className="h-4 w-4 text-[#d7c2a0]" />
                    <span className="text-xs uppercase tracking-[0.22em]">Tier</span>
                  </div>
                  <div className="text-sm font-medium capitalize text-[#f5efe6]">{profile?.tier || "free"}</div>
                </div>
              </div>
            </SmokedPanel>

            <nav className="mt-4 grid gap-3">
              {navItems.map((item) => {
                const active = isActivePath(pathname, item.href);
                const Icon = item.icon;
                return (
                  <Link
                    className={`group rounded-[24px] border px-4 py-4 transition duration-300 ${
                      active
                        ? "border-white/16 bg-white/[0.08] shadow-[0_18px_40px_rgba(0,0,0,0.22)]"
                        : "border-white/8 bg-transparent hover:border-white/14 hover:bg-white/[0.04]"
                    }`}
                    href={item.href}
                    key={item.href}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`rounded-full p-2 ${
                            active ? "bg-[#a48756]/14 text-[#d7c2a0]" : "bg-white/[0.05] text-stone-300"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-[#f5efe6]">{item.label}</div>
                          <div className="text-xs uppercase tracking-[0.18em] text-stone-500">
                            {item.description}
                          </div>
                        </div>
                      </div>
                      <ArrowUpRight
                        className={`h-4 w-4 transition ${
                          active ? "text-[#d7c2a0]" : "text-stone-600 group-hover:text-stone-300"
                        }`}
                      />
                    </div>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-4">
              <Button className="w-full justify-center" onClick={() => void signOut()} variant="ghost">
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
            </div>
          </LacquerSurface>
        </aside>

        <section className="flex min-w-0 flex-col gap-6">{children}</section>
      </div>
    </main>
  );
}
