# BudCast Native Mobile Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the native mobile foundation required by the visual audit: canonical tokens, smaller primitives, React Native compatible layouts, and a creator-first tab shell.

**Architecture:** Keep existing native screens running while introducing the new system beside them. Build the reusable primitives first, then route creator top-level surfaces through Expo Router tabs. Avoid large screen rewrites until the shell and component language are stable.

**Tech Stack:** Expo Router 6, React Native 0.81, NativeWind 4, TypeScript, `@budcast/shared`, Node source-marker tests.

---

## File Map

- Modify `apps/native/tailwind.config.ts`: canonical dark/lime/mobile color tokens, spacing/radius aliases.
- Modify `apps/native/components/premium.tsx`: export compatibility wrappers backed by the new surface vocabulary.
- Create `apps/native/components/mobile-system.tsx`: `AppHeader`, `Surface`, `StatusPill`, `Avatar`, `MediaTile`, `TrustRow`, `CampaignCard`, `SegmentedControl`.
- Create `apps/native/app/(tabs)/_layout.tsx`: creator tab shell.
- Create `apps/native/app/(tabs)/campaigns.tsx`: campaign discovery entry using existing `StoreScreen`.
- Create `apps/native/app/(tabs)/work.tsx`: work entry using existing `ApplicationsScreen`.
- Create `apps/native/app/(tabs)/profile.tsx`: profile entry using existing `ProfileScreen`.
- Modify `apps/native/app/index.tsx`: route completed creators into `(tabs)/campaigns` and remove unsupported web-style classes.
- Modify `apps/native/app/store.tsx`: remove “Free Store” naming and align filters with the audit vocabulary.
- Test `packages/shared/tests/native-mobile-foundation.test.ts`: source-level guardrails for the foundation.

## Task 1: Guardrails And Native Compatibility Tests

**Files:**
- Create: `packages/shared/tests/native-mobile-foundation.test.ts`

- [ ] **Step 1: Write source guardrail tests**

Create `packages/shared/tests/native-mobile-foundation.test.ts`:

```ts
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const root = new URL("../../../", import.meta.url);

function readWorkspaceFile(path: string) {
  return readFileSync(new URL(path, root), "utf8");
}

test("native mobile foundation exposes canonical primitives", () => {
  const source = readWorkspaceFile("apps/native/components/mobile-system.tsx");

  for (const marker of ["AppHeader", "Surface", "StatusPill", "CampaignCard", "TrustRow", "SegmentedControl"]) {
    assert.match(source, new RegExp(marker));
  }
});

test("native app uses a creator tab shell for top-level mobile navigation", () => {
  const source = readWorkspaceFile("apps/native/app/(tabs)/_layout.tsx");

  for (const marker of ["Tabs", "Campaigns", "Work", "Profile"]) {
    assert.match(source, new RegExp(marker));
  }
});

test("native campaign discovery avoids unsupported web-only layout classes", () => {
  const source = readWorkspaceFile("apps/native/app/index.tsx");

  assert.doesNotMatch(source, /grid-cols-/);
  assert.doesNotMatch(source, /bg-gradient-/);
});

test("native tokens define BudCast mobile color roles", () => {
  const source = readWorkspaceFile("apps/native/tailwind.config.ts");

  for (const marker of ["budcast", "canvas", "raised", "lime", "muted"]) {
    assert.match(source, new RegExp(marker));
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
node --test packages/shared/tests/native-mobile-foundation.test.ts
```

Expected: FAIL because `mobile-system.tsx` and `(tabs)/_layout.tsx` do not exist yet, and `index.tsx` still contains unsupported layout classes.

## Task 2: Canonical Native Tokens

**Files:**
- Modify: `apps/native/tailwind.config.ts`

- [ ] **Step 1: Add BudCast mobile token roles**

Replace the `theme.extend` block with explicit role tokens:

```ts
theme: {
  extend: {
    colors: {
      budcast: {
        canvas: "#070806",
        surface: "#10120f",
        raised: "#151714",
        overlay: "#1a1b16",
        line: "rgba(255,255,255,0.1)",
        text: "#fbf8f4",
        muted: "#a59a86",
        subtle: "#6f7468",
        lime: "#b8ff3d",
        limeSoft: "rgba(184,255,61,0.12)",
        success: "#8ee68e",
        warning: "#f0b85c",
        danger: "#ff6b4a",
        trust: "#69d8d0",
        premium: "#d7b46a"
      },
      surface: {
        50: "#fbf8f4",
        100: "#f2ebe1",
        200: "#e8dccd",
        300: "#d7c2ab",
        400: "#c5a27e",
        500: "#af8458",
        600: "#94673f",
        700: "#785136",
        800: "#624330",
        900: "#533a2b"
      },
      herb: {
        50: "#f3f8ef",
        100: "#e4eedb",
        200: "#cadabe",
        300: "#aac393",
        400: "#89aa67",
        500: "#6c8c4b",
        600: "#56713b",
        700: "#435730",
        800: "#384629",
        900: "#303c25"
      }
    },
    borderRadius: {
      surface: "20px",
      raised: "24px",
      pill: "999px"
    },
    spacing: {
      safe: "20px"
    }
  }
}
```

- [ ] **Step 2: Run typecheck**

Run:

```bash
npm run typecheck -w @budcast/native
```

Expected: PASS.

## Task 3: Mobile System Primitives

**Files:**
- Create: `apps/native/components/mobile-system.tsx`
- Modify: `apps/native/components/premium.tsx`

- [ ] **Step 1: Create the primitive file**

Create `apps/native/components/mobile-system.tsx` with:

```tsx
import type { ReactNode } from "react";
import { Image, Pressable, Text, View, type ImageSourcePropType, type PressableProps, type ViewProps } from "react-native";
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

export function Surface({ children, className = "", tone = "default", ...props }: ViewProps & { children: ReactNode; className?: string; tone?: SurfaceTone }) {
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
      <Text className={`text-[10px] font-bold uppercase tracking-[1.4px] ${statusClasses[tone].split(" ").find((part) => part.startsWith("text-")) ?? "text-budcast-muted"}`}>
        {children}
      </Text>
    </View>
  );
}

export function Avatar({ label, source, size = 44 }: { label: string; source?: ImageSourcePropType | null; size?: number }) {
  return (
    <View className="items-center justify-center overflow-hidden rounded-full border border-white/10 bg-budcast-overlay" style={{ height: size, width: size }}>
      {source ? <Image source={source} className="h-full w-full" resizeMode="cover" /> : <Text className="text-xs font-black text-budcast-lime">{label.slice(0, 2).toUpperCase()}</Text>}
    </View>
  );
}

export function MediaTile({ children, className = "" }: { children?: ReactNode; className?: string }) {
  return (
    <View className={`h-36 overflow-hidden rounded-[18px] bg-budcast-overlay ${className}`}>
      {children}
    </View>
  );
}

export function TrustRow({ items }: { items: Array<{ label: string; tone?: StatusTone }> }) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {items.slice(0, 3).map((item) => (
        <StatusPill key={item.label} tone={item.tone ?? "trust"}>{item.label}</StatusPill>
      ))}
    </View>
  );
}

export function SegmentedControl<T extends string>({ options, value, onChange }: { options: Array<{ label: string; value: T }>; value: T; onChange: (value: T) => void }) {
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
            <Text className={`text-sm font-semibold ${active ? "text-budcast-canvas" : "text-budcast-text"}`}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function CampaignCard({ brand, children, ctaLabel, onPress, title }: PressableProps & { brand: string; children?: ReactNode; ctaLabel: string; title: string }) {
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
```

- [ ] **Step 2: Run typecheck**

Run:

```bash
npm run typecheck -w @budcast/native
```

Expected: PASS.

## Task 4: Compatibility Cleanup

**Files:**
- Modify: `apps/native/app/index.tsx`

- [ ] **Step 1: Replace unsupported gradient and grid classes**

In `apps/native/app/index.tsx`, replace the campaign card media block:

```tsx
<View className="-mx-[18px] -mt-[18px] mb-4 h-24 rounded-t-2xl bg-gradient-to-br from-[#1d2b0a] to-[#0e1a06] border border-[#b8ff3d]/10 overflow-hidden">
  <View className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />
```

with:

```tsx
<View className="-mx-[18px] -mt-[18px] mb-4 h-24 overflow-hidden rounded-t-2xl border border-[#b8ff3d]/10 bg-[#111b0b]">
  <View className="absolute inset-x-0 bottom-0 h-14 bg-black/45" />
```

Replace:

```tsx
<View className="mt-4 grid grid-cols-2 gap-2">
```

with:

```tsx
<View className="mt-4 flex-row gap-2">
```

and add `flex-1` to each child stat tile.

- [ ] **Step 2: Run guardrail test**

Run:

```bash
node --test packages/shared/tests/native-mobile-foundation.test.ts
```

Expected: still FAIL until tab shell and primitive file exist, but no failure should reference `grid-cols-` or `bg-gradient-`.

## Task 5: Creator Tab Shell

**Files:**
- Create: `apps/native/app/(tabs)/_layout.tsx`
- Create: `apps/native/app/(tabs)/campaigns.tsx`
- Create: `apps/native/app/(tabs)/work.tsx`
- Create: `apps/native/app/(tabs)/profile.tsx`
- Modify: `apps/native/app/index.tsx`
- Modify: `apps/native/app/store.tsx`
- Modify: `apps/native/app/applications.tsx`
- Modify: `apps/native/app/profile.tsx`

- [ ] **Step 1: Export default screen functions from existing routes**

Ensure these files export named functions in addition to default exports:

```tsx
export function StoreScreen() { ... }
export default StoreScreen;
```

```tsx
export function ApplicationsScreen() { ... }
export default ApplicationsScreen;
```

```tsx
export function ProfileScreen() { ... }
export default ProfileScreen;
```

- [ ] **Step 2: Add tab wrappers**

Create `apps/native/app/(tabs)/campaigns.tsx`:

```tsx
export { StoreScreen as default } from "../store";
```

Create `apps/native/app/(tabs)/work.tsx`:

```tsx
export { ApplicationsScreen as default } from "../applications";
```

Create `apps/native/app/(tabs)/profile.tsx`:

```tsx
export { ProfileScreen as default } from "../profile";
```

- [ ] **Step 3: Add tab layout**

Create `apps/native/app/(tabs)/_layout.tsx`:

```tsx
import { Tabs } from "expo-router";

const tabBarStyle = {
  backgroundColor: "#070806",
  borderTopColor: "rgba(255,255,255,0.1)"
};

export default function CreatorTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#b8ff3d",
        tabBarInactiveTintColor: "#a59a86",
        tabBarStyle
      }}
    >
      <Tabs.Screen name="campaigns" options={{ title: "Campaigns" }} />
      <Tabs.Screen name="work" options={{ title: "Work" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
```

- [ ] **Step 4: Route completed creators into tabs**

In `apps/native/app/index.tsx`, add:

```tsx
import { Redirect } from "expo-router";
```

For authenticated, onboarded creators, return:

```tsx
return <Redirect href="/(tabs)/campaigns" />;
```

Keep unauthenticated, onboarding-incomplete, and brand fallback branches intact.

- [ ] **Step 5: Run typecheck**

Run:

```bash
npm run typecheck -w @budcast/native
```

Expected: PASS.

## Task 6: Rename Campaign Discovery Language

**Files:**
- Modify: `apps/native/app/store.tsx`

- [ ] **Step 1: Update labels**

Change `Free Store` to `Campaigns`.

Change `Creator Opportunities` to `Creator campaigns`.

Change filters from:

```ts
const campaignTypes = [
  { label: "All", value: null },
  { label: "Gifting", value: "gifting" },
  { label: "Paid", value: "paid" },
  { label: "Hybrid", value: "hybrid" }
];
```

to:

```ts
const campaignTypes = [
  { label: "For You", value: null },
  { label: "Product", value: "gifting" },
  { label: "Paid", value: "paid" },
  { label: "Paid + Product", value: "hybrid" }
] satisfies Array<{ label: string; value: CampaignType | null }>;
```

- [ ] **Step 2: Run source guardrails and typecheck**

Run:

```bash
node --test packages/shared/tests/native-mobile-foundation.test.ts
npm run typecheck -w @budcast/native
```

Expected: PASS.

## Verification

Run after all tasks:

```bash
node --test packages/shared/tests/native-mobile-foundation.test.ts
npm run typecheck -w @budcast/native
npm run build:web -w @budcast/native
```

Expected:

- Source guardrails pass.
- Native typecheck passes.
- Native web export completes.

## Commit

```bash
git add apps/native packages/shared/tests/native-mobile-foundation.test.ts docs/superpowers/specs/2026-05-02-budcast-native-mobile-foundation.md docs/superpowers/plans/2026-05-02-budcast-native-mobile-foundation.md
git commit -m "feat: add native mobile foundation"
```
