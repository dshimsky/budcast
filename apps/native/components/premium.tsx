import { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  ScrollView,
  Text,
  View,
  type PressableProps,
  type ScrollViewProps,
  type ViewProps
} from "react-native";

// ── Layout ──────────────────────────────────────────────────────────

export function MobileScreen({ children }: { children: React.ReactNode }) {
  return (
    <View className="flex-1 bg-[#070806]">
      {children}
    </View>
  );
}

export function PremiumScroll({ children, contentContainerStyle, ...props }: ScrollViewProps) {
  return (
    <MobileScreen>
      <ScrollView
        className="flex-1 px-5 pt-16"
        contentContainerStyle={[{ paddingBottom: 40 }, contentContainerStyle]}
        showsVerticalScrollIndicator={false}
        {...props}
      >
        {children}
      </ScrollView>
    </MobileScreen>
  );
}

// ── Animation ─────────────────────────────────────────────────────

export function FadeInSection({
  children,
  delay = 0,
  className = ""
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 360,
        delay,
        useNativeDriver: true
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 360,
        delay,
        useNativeDriver: true
      })
    ]);
    animation.start();
    return () => animation.stop();
  }, [delay, opacity, translateY]);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      <View className={className}>{children}</View>
    </Animated.View>
  );
}

// ── Cards ──────────────────────────────────────────────────────────

/** Primary container — used for hero/welcome cards */
export function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <View className={`rounded-[24px] border border-white/10 bg-[#10120f] px-5 py-6 ${className}`}>
      {children}
    </View>
  );
}

/** Secondary container — used for feed items and list cards */
export function SoftCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <View className={`rounded-[20px] border border-white/10 bg-[#151714] px-5 py-5 ${className}`}>
      {children}
    </View>
  );
}

// ── Chips & Labels ───────────────────────────────────────────────

/** Metadata chip — payout, deadline, status */
export function HeroChip({ children }: { children: React.ReactNode }) {
  return (
    <View className="rounded-full border border-white/10 bg-[#1a1b16] px-4 py-2">
      <Text className="text-xs uppercase tracking-[2px] text-[#d7c3a0]">{children}</Text>
    </View>
  );
}

// ── Data ─────────────────────────────────────────────────────────────

/** Standalone stat tile — value is the hero, label is subordinate */
export function MetricTile({
  label,
  value,
  className = ""
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <View className={`rounded-[20px] border border-white/10 bg-[#0d0f0c] px-5 py-5 ${className}`}>
      <Text className="text-3xl font-black text-[#fbf8f4]">{value}</Text>
      <Text className="mt-2 text-xs uppercase tracking-[2px] text-[#a59a86]">{label}</Text>
    </View>
  );
}

// ── Typography ──────────────────────────────────────────────────

/** Full-card heading block — eyebrow + title + optional description */
export function SectionTitle({
  eyebrow,
  title,
  description
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <View>
      <Text className="text-xs uppercase tracking-[3px] text-[#a59a86]">{eyebrow}</Text>
      <Text className="mt-3 text-2xl font-black leading-[32px] text-[#fbf8f4]">{title}</Text>
      {description ? (
        <Text className="mt-3 text-sm leading-6 text-[#a59a86]">{description}</Text>
      ) : null}
    </View>
  );
}

// ── Actions ────────────────────────────────────────────────────────

/** Primary CTA button */
export function PrimaryPill({
  children,
  className = "",
  isLoading = false,
  ...props
}: PressableProps & { children: React.ReactNode; className?: string; isLoading?: boolean }) {
  return (
    <Pressable
      className={`rounded-full bg-[#b8ff3d] px-5 py-3 active:scale-[0.97] active:opacity-90 ${isLoading ? "opacity-60" : ""} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#070806" />
      ) : (
        <Text className="text-center text-sm font-semibold text-[#070806]">{children}</Text>
      )}
    </Pressable>
  );
}

/** Secondary / ghost action button */
export function SecondaryPill({
  children,
  className = "",
  ...props
}: PressableProps & { children: React.ReactNode; className?: string }) {
  return (
    <Pressable
      className={`rounded-full border border-white/[0.15] bg-white/[0.07] px-5 py-3 active:scale-[0.97] active:opacity-70 ${className}`}
      {...props}
    >
      <Text className="text-center text-sm font-medium text-[#e8dccd]">{children}</Text>
    </Pressable>
  );
}

// ── Utility ─────────────────────────────────────────────────────────

export function SurfaceView({ children, className = "", ...props }: ViewProps & { children: React.ReactNode; className?: string }) {
  return (
    <View className={className} {...props}>
      {children}
    </View>
  );
}
