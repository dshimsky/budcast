import { ImageIcon, Video } from "lucide-react";
import { cn } from "../../lib/utils";

export type MediaGridItem = {
  id?: string;
  imageUrl?: string | null;
  label: string;
  type?: "image" | "video";
};

export type MediaGridProps = {
  className?: string;
  items: MediaGridItem[];
};

export function MediaGrid({ className, items }: MediaGridProps) {
  if (items.length === 0) return null;

  return (
    <div className={cn("grid grid-cols-2 gap-3", className)}>
      {items.map((item, index) => {
        const Icon = item.type === "video" ? Video : ImageIcon;

        return (
          <div
            className="group relative aspect-[4/3] overflow-hidden rounded-[22px] border border-white/[0.075] bg-white/[0.045] shadow-[0_18px_45px_rgba(0,0,0,0.24),0_1px_0_rgba(255,255,255,0.04)_inset]"
            key={item.id ?? `${item.label}-${index}`}
          >
            {item.imageUrl ? (
              <img
                alt=""
                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                src={item.imageUrl}
              />
            ) : (
              <div className="grid h-full w-full place-items-center bg-[radial-gradient(circle_at_30%_20%,rgba(184,255,61,0.14),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.075),rgba(255,255,255,0.018))]">
                <Icon className="h-7 w-7 text-[#e7ff9a]/70" />
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#050605]/90 via-[#050605]/60 to-transparent p-3 pt-10">
              <div className="truncate text-xs font-black text-[#fbfbf7]">{item.label}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
