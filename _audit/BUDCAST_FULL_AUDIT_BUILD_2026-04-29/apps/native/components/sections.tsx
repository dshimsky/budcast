import type { ReactNode } from "react";
import { Text, View } from "react-native";

export function SectionEyebrow({ children }: { children: ReactNode }) {
  return <Text className="text-[11px] uppercase tracking-[3px] text-[#a59a86]">{children}</Text>;
}

export function SectionBlock({
  children,
  className = ""
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <View className={`rounded-[24px] border border-white/10 bg-white/[0.04] p-4 ${className}`}>
      {children}
    </View>
  );
}

export function InfoTile({
  label,
  children,
  className = ""
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <View className={`rounded-[20px] border border-white/10 bg-[#0d0f0c] px-4 py-4 ${className}`}>
      <SectionEyebrow>{label}</SectionEyebrow>
      <Text className="mt-2 text-base leading-7 text-[#e8dccd]">{children}</Text>
    </View>
  );
}
