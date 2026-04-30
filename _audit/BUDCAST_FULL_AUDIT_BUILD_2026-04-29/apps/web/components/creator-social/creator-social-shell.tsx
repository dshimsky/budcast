import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";
import { BudCastLogo } from "../budcast-logo";
import { CreatorBottomNav } from "./creator-bottom-nav";

export type CreatorSocialShellProps = {
  activeTab: "Campaigns" | "Feed" | "Messages" | "Work" | "Profile";
  avatarFallback?: string;
  avatarUrl?: string | null;
  children: React.ReactNode;
  handle: string;
  profileHref?: string;
};

const navItems = [
  { href: "/creator-dashboard", label: "Campaigns" as const },
  { href: "/creator-dashboard/feed", label: "Feed" as const },
  { href: "/creator-dashboard/messages", label: "Messages" as const },
  { href: "/creator-dashboard/work", label: "Work" as const },
  { href: "/profile", label: "Profile" as const }
];

const topNavItems = navItems.slice(0, 2);

export function CreatorSocialShell({
  activeTab,
  avatarFallback,
  avatarUrl,
  children,
  handle,
  profileHref = "/profile"
}: CreatorSocialShellProps) {
  return (
    <main className="creator-obsidian min-h-screen overflow-x-hidden bg-[#030303] text-[#fbfbf7] md:px-6 md:py-5">
      <div className="creator-mobile-shell mx-auto flex min-h-screen w-full max-w-[430px] flex-col overflow-x-hidden bg-[#050604] shadow-none md:min-h-[calc(100vh-40px)] md:rounded-[42px] md:border md:border-[#e7ff9a]/10 md:shadow-[0_34px_130px_rgba(0,0,0,0.62),0_1px_0_rgba(255,255,255,0.08)_inset]">
        <header className="premium-glass-bar sticky top-0 z-30 rounded-b-[28px] px-3 pb-3 pt-[max(12px,env(safe-area-inset-top))] md:rounded-b-[30px]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <BudCastLogo className="brightness-125 contrast-[1.08]" href="/creator-dashboard" size="md" variant="mark" />
              <div className="min-w-0">
                <div className="text-sm font-black leading-none text-[#fbfbf7]">BudCast</div>
                <div className="mt-1 truncate text-[11px] font-semibold text-[#aeb5aa]">@{handle}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                aria-label="Search campaigns"
                className="premium-icon-surface grid h-10 w-10 place-items-center rounded-full text-[#fbfbf7] transition hover:-translate-y-0.5 hover:text-[#e7ff9a]"
                type="button"
              >
                <Search className="h-4 w-4" />
              </button>
              <button
                aria-label="Filter campaigns"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#e7ff9a]/20 bg-[linear-gradient(180deg,#d7ff72,#b8ff3d)] text-[#071007] shadow-[0_12px_30px_rgba(184,255,61,0.22),0_1px_0_rgba(255,255,255,0.26)_inset] transition hover:-translate-y-0.5 hover:brightness-110"
                type="button"
              >
                <SlidersHorizontal className="h-4 w-4" />
              </button>
              <Link
                className="hidden min-h-10 items-center rounded-full border border-[#e7ff9a]/12 bg-white/[0.045] px-4 text-xs font-bold text-[#d8ded1] transition hover:-translate-y-0.5 hover:border-[#b8ff3d]/25 hover:text-[#fbfbf7]"
                href={profileHref}
              >
                Profile
              </Link>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-1.5 rounded-full bg-black/25 p-1 shadow-[0_1px_0_rgba(255,255,255,0.06)_inset]">
            {topNavItems.map((item) => (
              <Link
                aria-current={activeTab === item.label ? "page" : undefined}
                className={`rounded-full px-4 py-2.5 text-center text-xs transition ${
                  activeTab === item.label
                    ? "bg-[linear-gradient(180deg,#d7ff72,#b8ff3d)] font-black text-[#071007] shadow-[0_10px_24px_rgba(184,255,61,0.2),0_1px_0_rgba(255,255,255,0.22)_inset]"
                    : "font-bold text-[#c7ccc2] hover:bg-white/[0.045] hover:text-[#fbfbf7]"
                }`}
                href={item.href}
                key={item.label}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </header>

        <div className="min-w-0 flex-1 overflow-x-hidden px-3 py-5 pb-[calc(140px+env(safe-area-inset-bottom))] sm:px-4">{children}</div>
      </div>
      <CreatorBottomNav
        items={navItems.map((item) => ({
          ...item,
          active: item.label === activeTab,
          avatarFallback: item.label === "Profile" ? avatarFallback : undefined,
          avatarUrl: item.label === "Profile" ? avatarUrl : undefined,
          href: item.label === "Profile" ? profileHref : item.href
        }))}
      />
    </main>
  );
}
