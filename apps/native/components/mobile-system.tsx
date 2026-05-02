import type { ReactNode } from "react";
import {
  Image,
  Pressable,
  Text,
  View,
  type ImageSourcePropType,
  type PressableProps,
  type ViewProps
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type SurfaceTone = "default" | "raised" | "overlay";
type StatusTone = "default" | "action" | "success" | "warning" | "danger" | "trust" | "premium";

const surfaceClasses: Record<SurfaceTone, string> = {
  default: "bg-budcast-surface",
  raised: "bg-budcast-raised",
  overlay: "bg-budcast-overlay"
};

const statusClasses: Record<StatusTone, string> = {
  default: "border-white/10 bg-white/[0.05] text-budcast-muted",
  action: "border-budcast-lime/25 bg-budcast-limeSoft text-budcast-lime",
  success: "border-budcast-success/25 bg-budcast-success/[0.1] text-budcast-success",
  warning: "border-budcast-warning/25 bg-budcast-warning/[0.1] text-budcast-warning",
  danger: "border-budcast-danger/25 bg-budcast-danger/[0.1] text-budcast-danger",
  trust: "border-budcast-trust/25 bg-budcast-trust/[0.1] text-budcast-trust",
  premium: "border-budcast-premium/25 bg-budcast-premium/[0.1] text-budcast-premium"
};

function statusTextClass(tone: StatusTone) {
  return statusClasses[tone].split(" ").find((part) => part.startsWith("text-")) ?? "text-budcast-muted";
}

export function Surface({
  children,
  className = "",
  tone = "default",
  ...props
}: ViewProps & { children: ReactNode; className?: string; tone?: SurfaceTone }) {
  return (
    <View className={`rounded-surface border border-white/10 ${surfaceClasses[tone]} p-4 ${className}`} {...props}>
      {children}
    </View>
  );
}

export function AppHeader({ actions, eyebrow, title }: { actions?: ReactNode; eyebrow?: string; title: string }) {
  const insets = useSafeAreaInsets();

  return (
    <View className="bg-budcast-canvas px-5 pb-3" style={{ paddingTop: Math.max(insets.top, 12) }}>
      <View className="flex-row items-center justify-between gap-3">
        <View className="min-w-0 flex-1">
          {eyebrow ? <Text className="text-[10px] font-bold uppercase tracking-[2px] text-budcast-muted">{eyebrow}</Text> : null}
          <Text className="mt-1 text-2xl font-black tracking-tight text-budcast-text" numberOfLines={1}>
            {title}
          </Text>
        </View>
        {actions ? <View className="flex-row items-center gap-2">{actions}</View> : null}
      </View>
    </View>
  );
}

export function StatusPill({ children, tone = "default" }: { children: ReactNode; tone?: StatusTone }) {
  return (
    <View className={`rounded-pill border px-3 py-1.5 ${statusClasses[tone]}`}>
      <Text className={`text-[10px] font-bold uppercase tracking-[1.4px] ${statusTextClass(tone)}`}>{children}</Text>
    </View>
  );
}

export function Avatar({
  label,
  source,
  size = 44
}: {
  label: string;
  source?: ImageSourcePropType | null;
  size?: number;
}) {
  return (
    <View
      className="items-center justify-center overflow-hidden rounded-full border border-white/10 bg-budcast-overlay"
      style={{ height: size, width: size }}
    >
      {source ? (
        <Image source={source} className="h-full w-full" resizeMode="cover" />
      ) : (
        <Text className="text-xs font-black text-budcast-lime">{label.slice(0, 2).toUpperCase()}</Text>
      )}
    </View>
  );
}

export function MediaTile({ children, className = "" }: { children?: ReactNode; className?: string }) {
  return <View className={`h-36 overflow-hidden rounded-[18px] bg-budcast-overlay ${className}`}>{children}</View>;
}

export function TrustRow({ items }: { items: Array<{ label: string; tone?: StatusTone }> }) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {items.slice(0, 3).map((item) => (
        <StatusPill key={item.label} tone={item.tone ?? "trust"}>
          {item.label}
        </StatusPill>
      ))}
    </View>
  );
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange
}: {
  options: Array<{ label: string; value: T }>;
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            className={`rounded-pill px-4 py-2 ${active ? "bg-budcast-lime" : "border border-white/10 bg-white/[0.05]"}`}
            key={option.value}
            onPress={() => onChange(option.value)}
          >
            <Text className={`text-sm font-semibold ${active ? "text-budcast-canvas" : "text-budcast-text"}`}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function CampaignCard({
  brand,
  children,
  ctaLabel,
  onPress,
  title
}: PressableProps & { brand: string; children?: ReactNode; ctaLabel: string; title: string }) {
  return (
    <Pressable className="active:scale-[0.99]" onPress={onPress}>
      <Surface tone="raised">
        <MediaTile>
          <View className="absolute bottom-3 left-3 rounded-lg bg-black/45 px-2.5 py-1.5">
            <Text className="text-[10px] font-bold uppercase tracking-[1.4px] text-budcast-text">{brand}</Text>
          </View>
        </MediaTile>
        <Text className="mt-4 text-lg font-black leading-6 text-budcast-text">{title}</Text>
        {children ? <View className="mt-3">{children}</View> : null}
        <View className="mt-4 rounded-pill bg-budcast-lime px-4 py-3">
          <Text className="text-center text-sm font-black text-budcast-canvas">{ctaLabel}</Text>
        </View>
      </Surface>
    </Pressable>
  );
}
