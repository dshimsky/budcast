import { useEffect, useRef } from "react";
import {
  Animated,
  ScrollView,
  Text,
  View,
  type ScrollViewProps,
  type ViewProps
} from "react-native";

export function MobileScreen({ children }: { children: React.ReactNode }) {
  return (
    <View className="flex-1 bg-[#f6efe6]">
      <View className="absolute -left-10 top-10 h-40 w-40 rounded-full bg-[#dfe8d1]" />
      <View className="absolute right-[-28px] top-28 h-36 w-36 rounded-full bg-[#f0dbc6]" />
      <View className="absolute bottom-24 left-12 h-28 w-28 rounded-full bg-[#ede2d5]" />
      {children}
    </View>
  );
}

export function PremiumScroll({ children, ...props }: ScrollViewProps) {
  return (
    <MobileScreen>
      <ScrollView className="flex-1 px-5 pt-16" {...props}>
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
    <View className={`rounded-[30px] border border-[#eadfce] bg-[#fffaf5] px-5 py-6 ${className}`}>
      {children}
    </View>
  );
}

export function SoftCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <View className={`rounded-[24px] border border-[#eadfce] bg-[#fffdf9] px-4 py-4 ${className}`}>
      {children}
    </View>
  );
}

export function HeroChip({ children }: { children: React.ReactNode }) {
  return (
    <View className="rounded-full border border-[#e6dacb] bg-[#fffaf3] px-4 py-2">
      <Text className="text-xs uppercase tracking-[2px] text-[#7a6656]">{children}</Text>
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
    <View className={`rounded-[24px] border border-[#eadfce] bg-[#fffdf9] px-4 py-4 ${className}`}>
      <Text className="text-3xl font-semibold text-[#221b14]">{value}</Text>
      <Text className="mt-2 text-xs uppercase tracking-[2px] text-[#7a6656]">{label}</Text>
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
      <Text className="text-xs uppercase tracking-[3px] text-[#6c8c4b]">{eyebrow}</Text>
      <Text className="mt-3 text-4xl font-semibold leading-[44px] text-[#221b14]">{title}</Text>
      {description ? <Text className="mt-4 text-base leading-7 text-[#5e5448]">{description}</Text> : null}
    </View>
  );
}

export function SurfaceView({ children, className = "", ...props }: ViewProps & { children: React.ReactNode; className?: string }) {
  return (
    <View className={className} {...props}>
      {children}
    </View>
  );
}
