import Link from "next/link";
import { BriefcaseBusiness, MessageCircle, Radio, Sparkles, UserRound } from "lucide-react";

type CreatorNavItem = {
  href: string;
  label: "Campaigns" | "Feed" | "Messages" | "Work" | "Profile";
  active?: boolean;
  avatarFallback?: string;
  avatarUrl?: string | null;
};

const iconByLabel = {
  Campaigns: BriefcaseBusiness,
  Feed: Radio,
  Messages: MessageCircle,
  Work: Sparkles,
  Profile: UserRound
} as const;

export type CreatorBottomNavProps = {
  items: CreatorNavItem[];
};

export function CreatorBottomNav({ items }: CreatorBottomNavProps) {
  return (
    <nav
      aria-label="Creator navigation"
      className="fixed inset-x-3 bottom-[max(12px,env(safe-area-inset-bottom))] z-40 mx-auto w-[min(calc(100vw-24px),406px)] overflow-hidden rounded-[30px] border border-[#e7ff9a]/10 bg-[linear-gradient(180deg,rgba(16,20,12,0.78),rgba(3,4,3,0.9))] px-2 py-2 shadow-[0_26px_90px_rgba(0,0,0,0.62),0_1px_0_rgba(255,255,255,0.11)_inset] backdrop-blur-2xl before:absolute before:inset-x-10 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-[#e7ff9a]/50 before:to-transparent before:content-[''] md:bottom-8"
    >
      <div className="grid grid-cols-5 gap-1">
        {items.map((item) => {
          const Icon = iconByLabel[item.label];
          const isProfile = item.label === "Profile";
          return (
            <Link
              aria-current={item.active ? "page" : undefined}
              className={`group relative flex min-h-[58px] min-w-0 flex-col items-center justify-center gap-1 rounded-[23px] px-1 py-1.5 text-[10px] font-extrabold transition duration-200 active:scale-[0.96] ${
                item.active
                  ? "bg-[#b8ff3d]/14 text-[#fbfbf7] shadow-[0_14px_34px_rgba(184,255,61,0.2),0_1px_0_rgba(231,255,154,0.22)_inset]"
                  : "text-[#c7ccc2] hover:bg-white/[0.055] hover:text-[#fbfbf7]"
              }`}
              href={item.href}
              key={item.label}
            >
              <span
                className={`relative grid h-8 w-8 place-items-center overflow-hidden rounded-[15px] transition duration-200 ${
                  item.active
                    ? "bg-[linear-gradient(135deg,#e7ff9a,#b8ff3d)] text-[#071007] shadow-[0_8px_20px_rgba(184,255,61,0.26)]"
                    : "bg-white/[0.055] text-[#d8ded1] shadow-[0_1px_0_rgba(255,255,255,0.06)_inset] group-hover:-translate-y-0.5 group-hover:bg-[#b8ff3d]/12 group-hover:text-[#e7ff9a]"
                }`}
              >
                {isProfile ? (
                  item.avatarUrl ? (
                    <img alt="" className="h-full w-full rounded-full object-cover" src={item.avatarUrl} />
                  ) : (
                    <span className="text-[10px] font-black leading-none">{item.avatarFallback || "ME"}</span>
                  )
                ) : (
                  <Icon className="h-[17px] w-[17px]" strokeWidth={2.25} />
                )}
                {item.active ? (
                  <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-[#e7ff9a] shadow-[0_0_12px_rgba(215,255,114,0.7)]" />
                ) : null}
              </span>
              <span className={`truncate leading-none tracking-[-0.01em] ${item.active ? "text-[#fbfbf7]" : ""}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
