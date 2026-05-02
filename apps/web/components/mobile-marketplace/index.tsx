import type { ReactNode } from "react";

export const mobileColorRoles = {
  danger: {
    dot: "bg-[#ff6b4a]",
    label: "text-[#ffab99]",
    pill: "border-[#ff6b4a]/25 bg-[#ff6b4a]/12 text-[#ffab99]",
    rail: "bg-[#ff6b4a]"
  },
  muted: {
    dot: "bg-[#8f948a]",
    label: "text-[#aeb5aa]",
    pill: "border-white/[0.08] bg-white/[0.035] text-[#aeb5aa]",
    rail: "bg-white/14"
  },
  neutral: {
    dot: "bg-[#d8ded1]",
    label: "text-[#d8ded1]",
    pill: "border-white/[0.1] bg-white/[0.045] text-[#d8ded1]",
    rail: "bg-white/18"
  },
  pending: {
    dot: "bg-[#f0b85c]",
    label: "text-[#ffd58a]",
    pill: "border-[#f0b85c]/25 bg-[#f0b85c]/12 text-[#ffd58a]",
    rail: "bg-[#f0b85c]"
  },
  premium: {
    dot: "bg-[#d7b46a]",
    label: "text-[#f0d28d]",
    pill: "border-[#d7b46a]/28 bg-[#d7b46a]/12 text-[#f0d28d]",
    rail: "bg-[#d7b46a]"
  },
  primary: {
    dot: "bg-[#b8ff3d]",
    label: "text-[#e7ff9a]",
    pill: "border-[#b8ff3d]/25 bg-[#b8ff3d]/12 text-[#e7ff9a]",
    rail: "bg-[#b8ff3d]"
  },
  success: {
    dot: "bg-[#8ee68e]",
    label: "text-[#bff7b6]",
    pill: "border-[#8ee68e]/24 bg-[#8ee68e]/12 text-[#bff7b6]",
    rail: "bg-[#8ee68e]"
  },
  trust: {
    dot: "bg-[#69d8d0]",
    label: "text-[#a7f5ef]",
    pill: "border-[#69d8d0]/24 bg-[#69d8d0]/12 text-[#a7f5ef]",
    rail: "bg-[#69d8d0]"
  }
} as const;

export type MobileColorRole = keyof typeof mobileColorRoles;

export function MobileStatusPill({
  children,
  className = "",
  tone = "neutral"
}: {
  children: ReactNode;
  className?: string;
  tone?: MobileColorRole;
}) {
  const role = mobileColorRoles[tone];

  return (
    <span
      className={`inline-flex min-h-7 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.11em] ${role.pill} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${role.dot}`} aria-hidden="true" />
      <span className="min-w-0 truncate">{children}</span>
    </span>
  );
}

export function MobileTrustBadge({
  children,
  className = "",
  tone = "trust"
}: {
  children: ReactNode;
  className?: string;
  tone?: MobileColorRole;
}) {
  const role = mobileColorRoles[tone];

  return (
    <span
      className={`inline-flex min-h-8 items-center rounded-[12px] border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.09em] ${role.pill} ${className}`}
    >
      {children}
    </span>
  );
}

export function MobileMetricTile({
  label,
  tone = "neutral",
  value
}: {
  label: string;
  tone?: MobileColorRole;
  value: ReactNode;
}) {
  const role = mobileColorRoles[tone];

  return (
    <div className="rounded-[16px] border border-white/[0.075] bg-white/[0.032] p-3 shadow-[0_1px_0_rgba(255,255,255,0.04)_inset]">
      <div className="text-[15px] font-black leading-tight text-[#fbfbf7]">{value}</div>
      <div className={`mt-1 text-[10px] font-black uppercase tracking-[0.1em] ${role.label}`}>
        {label}
      </div>
    </div>
  );
}

export function MobileDealTimeline({
  currentIndex,
  steps
}: {
  currentIndex: number;
  steps: Array<{ label: string; tone?: MobileColorRole }>;
}) {
  return (
    <div className="rounded-[20px] border border-white/[0.075] bg-black/20 p-3" aria-label="Campaign progress">
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
        {steps.map((step, index) => {
          const isActive = index <= currentIndex;
          const tone = step.tone ?? (isActive ? "primary" : "muted");
          const role = mobileColorRoles[tone];

          return (
            <div className="min-w-0" key={`${step.label}-${index}`}>
              <span
                className={`block h-1.5 rounded-full ${isActive ? role.rail : "bg-white/[0.12]"}`}
                aria-hidden="true"
              />
              <span
                className={`mt-1.5 block truncate text-[9px] font-black uppercase tracking-[0.08em] ${
                  isActive ? "text-[#d8ded1]" : "text-[#747970]"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
