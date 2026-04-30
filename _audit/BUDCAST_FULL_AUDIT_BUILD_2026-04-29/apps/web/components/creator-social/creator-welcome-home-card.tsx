import type { TrustBadgeDescriptor } from "@budcast/shared";
import { TrustBadgeRow } from "../marketplace/trust-badge";

export type CreatorWelcomeStat = {
  label: string;
  value: string | number;
};

export type CreatorWelcomeHomeCardProps = {
  avatarUrl?: string | null;
  displayName: string;
  editHref: string;
  handle: string;
  location?: string | null;
  niches: string[];
  profileStrength: number;
  stats: CreatorWelcomeStat[];
  trustBadges?: TrustBadgeDescriptor[];
};

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function CreatorWelcomeHomeCard({
  avatarUrl,
  displayName,
  handle,
  location,
  niches,
  profileStrength,
  stats,
  trustBadges = []
}: CreatorWelcomeHomeCardProps) {
  const firstName = displayName.split(/\s+/).filter(Boolean)[0] ?? "creator";
  const visibleNiches = niches.length ? niches.slice(0, 3) : ["Add niches"];
  const profileStatus = profileStrength >= 80 ? "Profile ready" : "Improve profile";

  return (
    <article className="overflow-hidden rounded-[34px] border border-white/[0.075] bg-[linear-gradient(135deg,rgba(184,255,61,0.11),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.022)),#0b0907] shadow-[0_30px_90px_rgba(0,0,0,0.36),0_1px_0_rgba(255,255,255,0.06)_inset]">
      <div className="p-4 pb-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-[20px] border border-[#e7ff9a]/[0.16] bg-[radial-gradient(circle_at_30%_22%,rgba(231,255,154,0.28),transparent_34%),linear-gradient(145deg,#211611,#090705)] text-lg font-black text-[#fbfbf7] shadow-[0_14px_34px_rgba(0,0,0,0.28)]">
            {avatarUrl ? <img alt="" className="h-full w-full object-cover" src={avatarUrl} /> : getInitials(displayName) || "BC"}
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#e7ff9a]">Creator home</div>
            <div className="mt-1 truncate text-xs font-bold text-[#aeb5aa]">@{handle}</div>
          </div>
        </div>
        <h1 className="mt-4 text-[2.2rem] font-black leading-[1.07] tracking-[-0.035em] text-[#fbfbf7]">
          Welcome back, {firstName}.
        </h1>
        <p className="mt-3 text-[15px] font-semibold leading-6 text-[#c6b8ad]">
          Your profile is live for cannabis brands reviewing campaign applications.
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto px-4 pb-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <TrustBadgeRow badges={trustBadges} className="contents" limit={3} />
        <span className="shrink-0 rounded-full border border-white/[0.075] bg-white/[0.04] px-3 py-2 text-[11px] font-black text-[#d3c5ba]">
          {location || "Add location"}
        </span>
        {visibleNiches.map((niche) => (
          <span
            className="shrink-0 rounded-full border border-white/[0.075] bg-white/[0.04] px-3 py-2 text-[11px] font-black text-[#d3c5ba]"
            key={niche}
          >
            {niche}
          </span>
        ))}
        <span className="shrink-0 rounded-full border border-[#b8ff3d]/24 bg-[#b8ff3d]/10 px-3 py-2 text-[11px] font-black text-[#e7ff9a]">
          {profileStatus} {profileStrength}%
        </span>
      </div>

      <div className="grid grid-cols-4 border-t border-white/[0.075] bg-black/[0.18]">
        {stats.map((stat, index) => (
          <div
            className={`border-r border-white/[0.075] px-3 py-4 last:border-r-0`}
            key={stat.label}
          >
            <div className="text-2xl font-black leading-none text-[#fbfbf7]">{stat.value}</div>
            <div className="mt-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#83766e]">{stat.label}</div>
          </div>
        ))}
      </div>
    </article>
  );
}
