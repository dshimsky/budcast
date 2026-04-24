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

function isActivePath(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function BrandWorkspaceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { profile, loading, signOut } = useAuth();

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
      description: "Workspace pulse"
    },
    {
      href: "/dashboard/campaigns/new",
      icon: Sparkles,
      label: "New Campaign",
      description: "Launch opportunity"
    },
    {
      href: "/dashboard/submissions",
      icon: ShieldCheck,
      label: "Submissions",
      description: "Verify and payout"
    },
    {
      href: "/profile",
      icon: UserRound,
      label: "Profile",
      description: "Market identity"
    },
    {
      href: "/onboarding",
      icon: Settings2,
      label: "Setup",
      description: "Profile routing"
    }
  ];

  return (
    <main className="grid-overlay min-h-screen px-5 py-6 md:px-8">
      <div className="mx-auto grid w-full max-w-[1480px] gap-6 xl:grid-cols-[296px_minmax(0,1fr)]">
        <aside className="xl:sticky xl:top-6 xl:self-start">
          <Card className="hero-orbit overflow-hidden p-5">
            <div className="premium-badge">
              <span className="signal-dot" />
              <div>
                <div className="text-xs uppercase tracking-[0.26em] text-surface-500">BudCast Workspace</div>
                <div className="text-sm font-medium text-surface-900">Brand-side command center</div>
              </div>
            </div>

            <div className="mt-6 rounded-[28px] border border-white/80 bg-white/72 p-5 shadow-[0_18px_50px_rgba(33,27,20,0.08)]">
              <div className="text-xs uppercase tracking-[0.24em] text-surface-500">Operator</div>
              <div className="mt-3 font-display text-3xl leading-tight text-surface-900">
                {profile?.company_name || profile?.name || "Brand workspace"}
              </div>
              <div className="mt-3 text-sm leading-6 text-surface-700">
                {hasCompletedOnboarding(profile)
                  ? "Launch opportunities, manage applicants, and keep creator follow-through moving."
                  : "Finish setup to unlock the full brand workflow."}
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <div className="rounded-[22px] border border-white/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(249,244,237,0.78))] p-4">
                  <div className="flex items-center gap-2 text-herb-700">
                    <CreditCard className="h-4 w-4" />
                    <span className="text-xs uppercase tracking-[0.2em]">Credits</span>
                  </div>
                  <div className="mt-3 text-2xl font-semibold text-surface-900">{profile?.credits_balance ?? 0}</div>
                </div>
                <div className="rounded-[22px] border border-white/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(249,244,237,0.78))] p-4">
                  <div className="flex items-center gap-2 text-herb-700">
                    <BriefcaseBusiness className="h-4 w-4" />
                    <span className="text-xs uppercase tracking-[0.2em]">Tier</span>
                  </div>
                  <div className="mt-3 text-2xl font-semibold capitalize text-surface-900">
                    {profile?.tier || "free"}
                  </div>
                </div>
              </div>
            </div>

            <nav className="mt-5 grid gap-3">
              {navItems.map((item) => {
                const active = isActivePath(pathname, item.href);
                const Icon = item.icon;
                return (
                  <Link
                    className={`group rounded-[24px] border px-4 py-4 transition duration-300 ${
                      active
                        ? "border-white/85 bg-white/88 shadow-[0_22px_44px_rgba(33,27,20,0.1)]"
                        : "border-white/60 bg-white/58 hover:-translate-y-0.5 hover:bg-white/78"
                    }`}
                    href={item.href}
                    key={item.href}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-herb-50 p-2 text-herb-700">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-surface-900">{item.label}</div>
                          <div className="text-xs uppercase tracking-[0.18em] text-surface-500">
                            {item.description}
                          </div>
                        </div>
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-surface-400 transition group-hover:text-herb-700" />
                    </div>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-5 flex flex-wrap gap-3">
              <Button asChild className="flex-1">
                <Link href="/dashboard/campaigns/new">Launch campaign</Link>
              </Button>
              <Button className="flex-1" onClick={() => void signOut()} variant="ghost">
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
            </div>
          </Card>
        </aside>

        <section className="flex min-w-0 flex-col gap-6">{children}</section>
      </div>
    </main>
  );
}
