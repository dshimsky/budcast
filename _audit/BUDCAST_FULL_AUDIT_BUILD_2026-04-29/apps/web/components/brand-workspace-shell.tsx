"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { hasCompletedOnboarding, useAuth } from "@budcast/shared";
import {
  BriefcaseBusiness,
  CreditCard,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Settings2,
  ShieldCheck,
  Sparkles,
  UserRound,
  UsersRound
} from "lucide-react";
import { BrandMobileBottomNav } from "./brand-mobile";
import { Button } from "./ui/button";
import { BudCastLogo } from "./budcast-logo";

function isActivePath(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function getBrandActiveTab(pathname: string) {
  if (pathname.startsWith("/dashboard/feed")) return "Feed" as const;
  if (pathname.startsWith("/dashboard/messages")) return "Messages" as const;
  if (pathname.startsWith("/dashboard/team")) return "Team" as const;
  if (pathname.startsWith("/dashboard/review") || pathname.startsWith("/dashboard/submissions")) return "Review" as const;
  if (pathname.startsWith("/profile")) return "Profile" as const;
  return "Campaigns" as const;
}

function getInitials(value: string) {
  const parts = value
    .replace(/@.*/, "")
    .split(/\s+/)
    .filter(Boolean);
  const initials = parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}` : value.slice(0, 2);
  return initials.toUpperCase();
}

export function BrandWorkspaceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { profile, loading, signOut } = useAuth();
  const onboardingComplete = hasCompletedOnboarding(profile);
  const activeTab = getBrandActiveTab(pathname);
  const brandName = profile?.company_name || profile?.name || profile?.email || "Cannabis brand";

  if (!loading && profile?.user_type && profile.user_type !== "brand" && profile.user_type !== "brand_team") {
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
      label: "Campaign control",
      description: "Live campaign flow"
    },
    {
      href: "/dashboard/campaigns/new",
      icon: Sparkles,
      label: "Post campaign",
      description: "Create UGC brief"
    },
    {
      href: "/dashboard/submissions",
      icon: ShieldCheck,
      label: "Approve content",
      description: "Approve content"
    },
    {
      href: "/dashboard/messages",
      icon: MessageCircle,
      label: "Messages",
      description: "Creator DMs"
    },
    {
      href: "/dashboard/team",
      icon: UsersRound,
      label: "Team",
      description: "Brand roles"
    },
    {
      href: "/profile",
      icon: UserRound,
      label: "Brand profile",
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
    <main className="min-h-screen bg-[#030303] px-4 pb-28 pt-4 text-[#fbfbf7] sm:px-5 md:px-8 md:py-6">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_10%_4%,rgba(184,255,61,0.08),transparent_30%),radial-gradient(circle_at_88%_0%,rgba(231,255,154,0.055),transparent_30%),linear-gradient(180deg,#030303,#090706_54%,#030303)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-[0.14] [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:72px_72px]" />
      <div className="mx-auto grid w-full max-w-[1480px] gap-6 xl:grid-cols-[296px_minmax(0,1fr)]">
        <aside className="hidden xl:sticky xl:top-6 xl:block xl:self-start">
          <div className="rounded-[32px] border border-white/[0.09] bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.024))] p-4 shadow-[0_28px_90px_rgba(0,0,0,0.46),0_1px_0_rgba(255,255,255,0.05)_inset]">
            <div className="px-1 pb-5">
              <div className="flex items-start gap-3">
                <BudCastLogo href="/" size="sm" variant="mark" className="mt-0.5 brightness-125 contrast-[1.08]" />
                <div className="min-w-0">
                  <div className="text-[11px] font-black uppercase tracking-[0.24em] text-[#e7ff9a]">BudCast</div>
                  <div className="mt-2 truncate text-2xl font-black leading-none tracking-[-0.05em] text-[#fbfbf7]">
                    {profile?.company_name || profile?.name || "Cannabis brand"}
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[#d8ded1]">
                    Post briefs, review creators, approve content, and track payment or product status.
                  </p>
                </div>
              </div>
              <div
                className={`mt-5 flex items-center gap-2 border-t border-white/10 pt-4 text-[10px] font-medium uppercase tracking-[0.24em] ${
                  onboardingComplete ? "text-emerald-200" : "text-[#e7ff9a]"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    onboardingComplete ? "bg-emerald-300 shadow-[0_0_14px_rgba(110,231,183,0.55)]" : "bg-[#b8ff3d]"
                  }`}
                />
                {onboardingComplete ? "Ready" : "Setup"}
              </div>
            </div>

            <nav className="border-t border-white/10">
              {navItems.map((item) => {
                const active = isActivePath(pathname, item.href);
                const Icon = item.icon;
                return (
                  <Link
                    aria-current={active ? "page" : undefined}
                    className={`group flex items-center justify-between gap-3 border-b border-white/10 px-1 py-4 transition duration-300 ${
                      active ? "text-[#fbfbf7]" : "text-[#c7ccc2] hover:text-[#fbfbf7]"
                    }`}
                    href={item.href}
                    key={item.href}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition ${
                          active
                            ? "bg-[#b8ff3d]/15 text-[#e7ff9a] ring-1 ring-[#b8ff3d]/24"
                            : "bg-white/[0.035] text-[#7d7068] group-hover:bg-white/[0.06] group-hover:text-[#d8ded1]"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-black">{item.label}</span>
                        <span className="mt-1 block truncate text-xs font-black uppercase tracking-[0.18em] text-[#6e625c] group-hover:text-[#8d7f76]">
                          {item.description}
                        </span>
                      </span>
                    </div>
                    <span
                      className={`h-2 w-2 shrink-0 rounded-full transition ${
                        active ? "bg-[#b8ff3d] shadow-[0_0_16px_rgba(184,255,61,0.5)]" : "bg-white/10"
                      }`}
                    />
                  </Link>
                );
              })}
            </nav>

            <div className="grid grid-cols-2 border-y border-white/10">
              <div className="border-r border-white/10 px-1 py-4">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#7d7068]">
                  <CreditCard className="h-3.5 w-3.5 text-[#e7ff9a]" />
                  Credits
                </div>
                <div className="mt-2 text-xl font-black text-[#fbfbf7]">{profile?.credits_balance ?? 0}</div>
              </div>
              <div className="px-4 py-4">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#7d7068]">
                  <BriefcaseBusiness className="h-3.5 w-3.5 text-[#e7ff9a]" />
                  Tier
                </div>
                <div className="mt-2 truncate text-sm font-black capitalize text-[#fbfbf7]">{profile?.tier || "free"}</div>
              </div>
            </div>

            <div className="pt-4">
              <Button className="w-full justify-center" onClick={() => void signOut()} variant="ghost">
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
            </div>
          </div>
        </aside>

        <section className="flex min-w-0 flex-col gap-6">{children}</section>
      </div>
      <BrandMobileBottomNav
        activeTab={activeTab}
        avatarFallback={getInitials(brandName)}
        avatarUrl={profile?.avatar_url}
        items={[
          { href: "/dashboard", label: "Campaigns" },
          { href: "/dashboard/feed", label: "Feed" },
          { href: "/dashboard/messages", label: "Messages" },
          { href: "/dashboard/team", label: "Team" },
          { href: "/dashboard/review", label: "Review" },
          {
            avatarFallback: getInitials(brandName),
            avatarUrl: profile?.avatar_url,
            href: "/profile",
            label: "Profile"
          }
        ]}
      />
    </main>
  );
}
