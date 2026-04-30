import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "../../lib/utils";

export type WorkQueueItemProps = {
  actionHref?: string;
  actionLabel?: string;
  className?: string;
  description: string;
  title: string;
};

export function WorkQueueItem({ actionHref, actionLabel, className, description, title }: WorkQueueItemProps) {
  return (
    <div
      className={cn(
        "grid gap-4 rounded-[26px] border border-white/[0.065] bg-white/[0.035] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.2),0_1px_0_rgba(255,255,255,0.035)_inset] sm:grid-cols-[1fr_auto] sm:items-center",
        className
      )}
    >
      <div className="flex min-w-0 gap-3">
        <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#b8ff3d] shadow-[0_0_18px_rgba(184,255,61,0.45)]" />
        <div className="min-w-0">
          <div className="text-sm font-black text-[#fbfbf7]">{title}</div>
          <div className="mt-1 text-sm leading-6 text-[#c7ccc2]">{description}</div>
        </div>
      </div>
      {actionHref && actionLabel ? (
        <Link
          className="inline-flex min-h-9 items-center gap-2 rounded-full bg-[#b8ff3d]/10 px-3 text-sm font-black text-[#e7ff9a] transition hover:bg-[#b8ff3d]/16"
          href={actionHref}
        >
          {actionLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      ) : null}
    </div>
  );
}
