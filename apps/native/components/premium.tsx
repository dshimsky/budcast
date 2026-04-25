import { useEffect, useRef } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  Text,
  View,
  type PressableProps,
  type ScrollViewProps,
  type ViewProps
} from "react-native";

export function MobileScreen({ children }: { children: React.ReactNode }) {
  return (
    <View className="flex-1 bg-[#070806]">
      <View className="absolute left-[-56px] top-8 h-56 w-56 rounded-full bg-[#314126]/32" />
      <View className="absolute right-[-52px] top-28 h-48 w-48 rounded-full bg-[#9c7a4a]/18" />
      <View className="absolute bottom-[-18px] left-8 h-40 w-40 rounded-full bg-[#141713]" />
      {children}
    </View>
  );
}

export function PremiumScroll({ children, contentContainerStyle, ...props }: ScrollViewProps) {
  return (
    <MobileScreen>
      <ScrollView
        className="flex-1 px-5 pt-16"
        contentContainerStyle={[{ paddingBottom: 28 }, contentContainerStyle]}
        {...props}
      >
        {children}
      </ScrollView>
    </MobileScreen>
  );
}

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
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 520,
        delay,
        useNativeDriver: true
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 520,
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

export function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <View className={`rounded-[32px] border border-white/10 bg-[#10120f] px-5 py-6 shadow-sm ${className}`}>
      {children}
    </View>
  );
}

export function SoftCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <View className={`rounded-[26px] border border-white/10 bg-[#151714] px-4 py-4 ${className}`}>
      {children}
    </View>
  );
}

export function HeroChip({ children }: { children: React.ReactNode }) {
  return (
    <View className="rounded-full border border-[#a98c5b]/30 bg-[#1a1b16] px-4 py-2">
      <Text className="text-xs uppercase tracking-[2px] text-[#d7c3a0]">{children}</Text>
    </View>
  );
}

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
    <View className={`rounded-[24px] border border-white/10 bg-[#121410] px-4 py-4 ${className}`}>
      <Text className="text-3xl font-semibold text-[#fbf8f4]">{value}</Text>
      <Text className="mt-2 text-xs uppercase tracking-[2px] text-[#a59a86]">{label}</Text>
    </View>
  );
}

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
      <Text className="mt-3 text-4xl font-semibold leading-[44px] text-[#fbf8f4]">{title}</Text>
      {description ? <Text className="mt-4 text-base leading-7 text-[#d7cdbd]">{description}</Text> : null}
    </View>
  );
}

export function PrimaryPill({ children, className = "", ...props }: PressableProps & { children: React.ReactNode; className?: string }) {
  return (
    <Pressable className={`rounded-full bg-[#6b4c2e] px-5 py-3 ${className}`} {...props}>
      <Text className="text-center text-sm font-semibold text-[#fff8ec]">{children}</Text>
    </Pressable>
  );
}

export function SecondaryPill({ children, className = "", ...props }: PressableProps & { children: React.ReactNode; className?: string }) {
  return (
    <Pressable className={`rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 ${className}`} {...props}>
      <Text className="text-center text-sm font-medium text-[#e8dccd]">{children}</Text>
    </Pressable>
  );
}

export function SurfaceView({ children, className = "", ...props }: ViewProps & { children: React.ReactNode; className?: string }) {
  return (
    <View className={className} {...props}>
      {children}
    </View>
  );
}
