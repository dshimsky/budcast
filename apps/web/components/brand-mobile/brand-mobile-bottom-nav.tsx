"use client";

import Link from "next/link";
import { BriefcaseBusiness, FileCheck2, MessageCircle, Radio, Store, UsersRound } from "lucide-react";

type BrandNavItem = {
  href: string;
  label: "Campaigns" | "Feed" | "Messages" | "Team" | "Review" | "Profile";
  avatarFallback?: string;
  avatarUrl?: string | null;
};

const iconByLabel = {
  Campaigns: BriefcaseBusiness,
  Feed: Radio,
  Messages: MessageCircle,
  Team: UsersRound,
  Review: FileCheck2,
  Profile: Store
} as const;

export type BrandMobileBottomNavProps = {
  activeTab: BrandNavItem["label"];
  avatarFallback?: string;
  avatarUrl?: string | null;
  items: BrandNavItem[];
};

export function BrandMobileBottomNav({ activeTab, avatarFallback, avatarUrl, items }: BrandMobileBottomNavProps) {
  return (
    <nav
      aria-label="Brand navigation"
      className="fixed inset-x-3 bottom-3 z-40 overflow-hidden rounded-[32px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(22,13,10,0.74),rgba(5,4,3,0.82))] px-2 py-2 shadow-[0_24px_80px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.08)_inset] backdrop-blur-2xl before:absolute before:inset-x-8 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-[#e7ff9a]/55 before:to-transparent before:content-[''] md:hidden"
    >
      <div className="grid grid-cols-6 gap-1">
        {items.map((item) => {
          const Icon = iconByLabel[item.label];
          const isProfile = item.label === "Profile";
          const isActive = item.label === activeTab;

          return (
            <Link
              aria-current={isActive ? "page" : undefined}
              className={`group relative flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-[24px] px-1 py-1.5 text-[10px] font-extrabold transition duration-200 active:scale-[0.97] ${
                isActive
                  ? "bg-[#b8ff3d]/18 text-[#fff4ee] shadow-[0_12px_34px_rgba(184,255,61,0.22),0_1px_0_rgba(231,255,154,0.28)_inset]"
                  : "text-[#c7ccc2] hover:bg-white/[0.055] hover:text-[#fbfbf7]"
              }`}
              href={item.href}
              key={item.label}
            >
              <span
                className={`relative grid h-8 w-8 place-items-center overflow-hidden rounded-[15px] transition duration-200 ${
                  isActive
                    ? "bg-[linear-gradient(135deg,#d7ff72,#b8ff3d)] text-[#071007] shadow-[0_8px_20px_rgba(184,255,61,0.25)]"
                    : "bg-white/[0.045] text-[#d8ded1] shadow-[0_1px_0_rgba(255,255,255,0.05)_inset] group-hover:-translate-y-0.5 group-hover:bg-[#b8ff3d]/12 group-hover:text-[#e7ff9a]"
                }`}
              >
                {isProfile ? (
                  avatarUrl ? (
                    <img alt="" className="h-full w-full rounded-full object-cover" src={avatarUrl} />
                  ) : (
                    <span className="text-[10px] font-black leading-none">{avatarFallback || "BC"}</span>
                  )
                ) : (
                  <Icon className="h-[17px] w-[17px]" strokeWidth={2.25} />
                )}
                {isActive ? (
                  <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-[#e7ff9a] shadow-[0_0_12px_rgba(215,255,114,0.7)]" />
                ) : null}
              </span>
              <span className={`truncate leading-none tracking-[-0.01em] ${isActive ? "text-[#fff4ee]" : ""}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
