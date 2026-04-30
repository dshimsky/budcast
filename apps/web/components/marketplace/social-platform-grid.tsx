import { cn } from "../../lib/utils";

export type SocialPlatform = "instagram" | "tiktok" | "youtube" | "facebook" | "linkedin" | "x";

export type SocialPlatformItem = {
  label: string;
  platform: SocialPlatform;
  value?: string | null;
  sublabel?: string;
};

export type SocialPlatformGridProps = {
  className?: string;
  items: SocialPlatformItem[];
};

const platformMeta: Record<SocialPlatform, { iconSrc: string; iconScale?: string }> = {
  instagram: {
    iconScale: "scale-[1.22]",
    iconSrc: "/assets/social/instagram.webp"
  },
  tiktok: {
    iconScale: "scale-[1.04]",
    iconSrc: "/assets/social/tiktok.avif"
  },
  youtube: {
    iconScale: "scale-[1.12]",
    iconSrc: "/assets/social/youtube.webp"
  },
  facebook: {
    iconScale: "scale-[1.18]",
    iconSrc: "/assets/social/facebook.webp"
  },
  linkedin: {
    iconScale: "scale-[1.2]",
    iconSrc: "/assets/social/linkedin.jpg"
  },
  x: {
    iconScale: "scale-[1.08]",
    iconSrc: "/assets/social/x.avif"
  }
};

export function SocialPlatformGrid({ className, items }: SocialPlatformGridProps) {
  return (
    <div className={cn("grid gap-2 sm:grid-cols-2", className)}>
      {items.map((item) => {
        const connected = Boolean(item.value?.trim());
        const meta = platformMeta[item.platform];

        return (
          <div
            className={cn(
              "group flex min-w-0 items-center gap-3 rounded-[20px] border px-3 py-3 shadow-[0_1px_0_rgba(255,255,255,0.04)_inset] transition duration-200",
              connected
                ? "border-white/[0.09] bg-white/[0.05]"
                : "border-white/[0.06] bg-white/[0.025] opacity-75"
            )}
            key={item.platform}
          >
            <div
              className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-[16px] border border-white/[0.075] bg-[linear-gradient(180deg,rgba(255,255,255,0.09),rgba(255,255,255,0.035))] p-2 shadow-[0_10px_26px_rgba(0,0,0,0.24),0_1px_0_rgba(255,255,255,0.08)_inset]"
            >
              <span className="grid h-7 w-7 place-items-center overflow-hidden rounded-[9px] bg-black/25">
                <img alt="" className={cn("h-full w-full object-contain", meta.iconScale)} src={meta.iconSrc} />
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-black text-[#fbfbf7]">{item.label}</div>
              <div className={cn("mt-0.5 truncate text-xs font-bold", connected ? "text-[#e7ff9a]" : "text-[#7d7068]")}>
                {connected ? item.value : "Not added"}
              </div>
              {item.sublabel ? <div className="mt-1 truncate text-[11px] font-bold text-[#8d8077]">{item.sublabel}</div> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
