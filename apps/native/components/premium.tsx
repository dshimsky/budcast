import { useEffect, useRef, type ReactNode } from "react";
import {
  ActivityIndicator,
  Animated,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
  type PressableProps,
  type ScrollViewProps,
  type ViewProps
} from "react-native";
import { Surface } from "./mobile-system";

const useNativeAnimationDriver = Platform.OS !== "web";

// ── Layout ──────────────────────────────────────────────────────────

export function MobileScreen({ children }: { children: ReactNode }) {
  return (
    <View className="flex-1 bg-budcast-canvas">
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
  children: ReactNode;
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
        useNativeDriver: useNativeAnimationDriver
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 360,
        delay,
        useNativeDriver: useNativeAnimationDriver
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
export function GlassCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <Surface tone="default" className={`rounded-raised px-5 py-6 ${className}`}>
      {children}
    </Surface>
  );
}

/** Secondary container — used for feed items and list cards */
export function SoftCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <Surface tone="raised" className={`px-5 py-5 ${className}`}>
      {children}
    </Surface>
  );
}

// ── Chips & Labels ───────────────────────────────────────────────

/** Metadata chip — payout, deadline, status */
export function HeroChip({ children }: { children: ReactNode }) {
  return (
    <View className="rounded-pill border border-white/10 bg-budcast-overlay px-4 py-2">
      <Text className="text-xs uppercase tracking-[2px] text-budcast-premium">{children}</Text>
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
    <Surface tone="overlay" className={`px-5 py-5 ${className}`}>
      <Text className="text-3xl font-black text-budcast-text">{value}</Text>
      <Text className="mt-2 text-xs uppercase tracking-[2px] text-budcast-muted">{label}</Text>
    </Surface>
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
      <Text className="text-xs uppercase tracking-[3px] text-budcast-muted">{eyebrow}</Text>
      <Text className="mt-3 text-2xl font-black leading-[32px] text-budcast-text">{title}</Text>
      {description ? (
        <Text className="mt-3 text-sm leading-6 text-budcast-muted">{description}</Text>
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
}: PressableProps & { children: ReactNode; className?: string; isLoading?: boolean }) {
  return (
    <Pressable
      className={`rounded-pill bg-budcast-lime px-5 py-3 active:scale-[0.97] active:opacity-90 ${isLoading ? "opacity-60" : ""} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#070806" />
      ) : (
        <Text className="text-center text-sm font-semibold text-budcast-canvas">{children}</Text>
      )}
    </Pressable>
  );
}

/** Secondary / ghost action button */
export function SecondaryPill({
  children,
  className = "",
  ...props
}: PressableProps & { children: ReactNode; className?: string }) {
  return (
    <Pressable
      className={`rounded-pill border border-white/[0.15] bg-white/[0.07] px-5 py-3 active:scale-[0.97] active:opacity-70 ${className}`}
      {...props}
    >
      <Text className="text-center text-sm font-medium text-surface-200">{children}</Text>
    </Pressable>
  );
}

// ── Utility ─────────────────────────────────────────────────────────

export function SurfaceView({ children, className = "", ...props }: ViewProps & { children: ReactNode; className?: string }) {
  return (
    <View className={className} {...props}>
      {children}
    </View>
  );
}
