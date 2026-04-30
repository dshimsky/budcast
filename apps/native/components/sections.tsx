import type { ReactNode } from "react";
import { Text, View } from "react-native";

// ─── SectionEyebrow ───────────────────────────────────────────────────────────
// Uppercase label used as section/tile header.
// Color matches the muted text token (#a8a090 — warm gray, readable on dark surfaces).
export function SectionEyebrow({ children }: { children: ReactNode }) {
  return (
    <Text
      numberOfLines={1}
      className="text-xs uppercase tracking-[3px] text-[#a8a090]"
    >
      {children}
    </Text>
  );
}

// ─── SectionBlock ─────────────────────────────────────────────────────────────
// Card-style container. Accepts an optional `title` to render a SectionEyebrow
// without requiring every consumer to import and compose it manually.
// gap-3 (12px) is the default child spacing — overridable via className.
export function SectionBlock({
  children,
  title,
  className = "",
}: {
  children: ReactNode;
  title?: string;
  className?: string;
}) {
  return (
    <View
      className={`rounded-2xl border border-white/10 bg-white/[0.05] p-4 gap-3 ${className}`}
    >
      {title ? <SectionEyebrow>{title}</SectionEyebrow> : null}
      {children}
    </View>
  );
}

// ─── InfoTile ─────────────────────────────────────────────────────────────────
// Data display tile. bg-white/[0.03] keeps it visually subordinate to SectionBlock
// without a conflicting hardcoded hex. leading-6 (24px on 16px base) is tighter
// and correct for a dense data tile.
export function InfoTile({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <View
      className={`rounded-2xl border border-white/10 bg-white/[0.03] px-4 pt-3 pb-4 ${className}`}
    >
      <SectionEyebrow>{label}</SectionEyebrow>
      <Text className="mt-1.5 text-base leading-6 text-[#e8dccd]">
        {children}
      </Text>
    </View>
  );
}
