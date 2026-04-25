# BudCast Dark Premium Moody Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the approved `Dark Premium Moody` visual system across the real BudCast web and native product surfaces while preserving the existing Supabase-backed behavior and route structure.

**Architecture:** Keep the current app structure intact and move the visual system downward through semantic tokens, shared surface primitives, and page-level rewrites. Web remains Next.js + Tailwind-driven and native remains Expo + NativeWind-driven, but both are aligned under one darker, cinematic, high-trust system with `Editorial Operator` hierarchy rules.

**Tech Stack:** Next.js 15, Expo Router 6, React 19, React Native 0.81, Tailwind CSS, NativeWind, TypeScript strict mode, existing shared auth/query/store layer.

---

## File Structure

### Existing files to modify

- `apps/web/app/globals.css`
  Purpose: global color tokens, shadows, backgrounds, typography roles, motion rules, premium input styles.

- `apps/web/components/ui/button.tsx`
  Purpose: core action styles for dark primary, dark secondary, and restrained ghost treatments.

- `apps/web/components/ui/card.tsx`
  Purpose: convert the default surface model from light glass cards to darker lacquer planes.

- `apps/web/components/brand-workspace-shell.tsx`
  Purpose: primary brand-side structure, left rail treatment, action hierarchy, and shell-level tone.

- `apps/web/app/page.tsx`
  Purpose: top-of-funnel BudCast expression under the dark default system.

- `apps/web/app/dashboard/page.tsx`
  Purpose: main operator desk conversion.

- `apps/web/app/dashboard/campaigns/new/page.tsx`
  Purpose: dark premium campaign builder.

- `apps/web/app/dashboard/campaigns/[id]/page.tsx`
  Purpose: campaign detail command surface.

- `apps/web/app/dashboard/campaigns/[id]/applicants/page.tsx`
  Purpose: darker shortlist/review workflow.

- `apps/web/app/dashboard/submissions/page.tsx`
  Purpose: proof, verification, and payout review treatment.

- `apps/web/app/sign-in/page.tsx`
- `apps/web/app/sign-up/page.tsx`
- `apps/web/app/onboarding/page.tsx`
- `apps/web/app/profile/page.tsx`
- `apps/web/app/profile/edit/page.tsx`
  Purpose: top-of-funnel and identity surfaces under the same default system.

- `apps/native/components/premium.tsx`
  Purpose: native surface primitives, spacing, chips, cards, and section headers.

- `apps/native/global.css`
  Purpose: native token alignment with the approved darker palette.

- `apps/native/app/index.tsx`
- `apps/native/app/sign-in.tsx`
- `apps/native/app/sign-up.tsx`
- `apps/native/app/onboarding.tsx`
- `apps/native/app/profile.tsx`
- `apps/native/app/profile-edit.tsx`
- `apps/native/app/store.tsx`
- `apps/native/app/applications.tsx`
- `apps/native/app/submissions.tsx`
- `apps/native/app/campaigns/[id].tsx`
  Purpose: creator mobile experience under the dark default system.

### New files to create

- `apps/web/components/ui/surface-tone.tsx`
  Purpose: shared semantic wrappers for dark lacquer, smoked panel, and accent rail surfaces on web.

- `apps/web/components/ui/eyebrow.tsx`
  Purpose: consistent uppercase metadata label treatment on web.

- `apps/native/components/sections.tsx`
  Purpose: optional small wrappers for native dark section composition to keep screen files smaller.

- `docs/superpowers/plans/2026-04-24-budcast-dark-premium-moody-implementation.md`
  Purpose: this execution plan.

## Task 1: Build The Shared Dark Surface Foundation

**Files:**
- Create: `apps/web/components/ui/surface-tone.tsx`
- Create: `apps/web/components/ui/eyebrow.tsx`
- Modify: `apps/web/app/globals.css`
- Modify: `apps/web/components/ui/button.tsx`
- Modify: `apps/web/components/ui/card.tsx`
- Modify: `apps/native/global.css`
- Modify: `apps/native/components/premium.tsx`

- [ ] **Step 1: Capture the current baseline before changing tokens**

Run:

```bash
npm run typecheck
npm run build:web
```

Expected:
- both commands pass
- the current product still renders with the older lighter premium system

- [ ] **Step 2: Add dark semantic tokens to web globals**

Update `apps/web/app/globals.css` so the root tokens move from light parchment defaults to the approved darker palette.

```css
:root {
  --background: 120 8% 5%;
  --foreground: 34 28% 92%;
  --card: 120 8% 8%;
  --card-foreground: 34 28% 92%;
  --primary: 42 30% 47%;
  --primary-foreground: 120 8% 6%;
  --secondary: 120 8% 12%;
  --secondary-foreground: 34 24% 88%;
  --muted: 120 7% 14%;
  --muted-foreground: 34 12% 68%;
  --accent: 84 24% 32%;
  --accent-foreground: 34 28% 92%;
  --border: 34 10% 18%;
  --input: 34 10% 18%;
  --ring: 42 30% 47%;
}

body {
  background:
    radial-gradient(circle at 18% 12%, rgba(120, 102, 72, 0.18), transparent 0 24%),
    radial-gradient(circle at 88% 14%, rgba(67, 87, 48, 0.16), transparent 0 20%),
    linear-gradient(180deg, #090b09 0%, #0b0d0b 40%, #070807 100%);
  color: hsl(var(--foreground));
}
```

- [ ] **Step 3: Create reusable web surface wrappers**

Create `apps/web/components/ui/surface-tone.tsx`.

```tsx
import * as React from "react";
import { cn } from "../../lib/utils";

export function LacquerSurface({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(19,21,19,0.92),rgba(11,12,11,0.92))] shadow-[0_28px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl",
        className
      )}
      {...props}
    />
  );
}

export function SmokedPanel({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[24px] border border-white/8 bg-white/[0.04] shadow-[0_18px_40px_rgba(0,0,0,0.22)]",
        className
      )}
      {...props}
    />
  );
}
```

Create `apps/web/components/ui/eyebrow.tsx`.

```tsx
import * as React from "react";
import { cn } from "../../lib/utils";

export function Eyebrow({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "text-[11px] uppercase tracking-[0.3em] text-stone-500",
        className
      )}
      {...props}
    />
  );
}
```

- [ ] **Step 4: Rework core web buttons and cards to the dark system**

Update `apps/web/components/ui/button.tsx` and `apps/web/components/ui/card.tsx`.

```tsx
// button.tsx variants
primary:
  "bg-[#7d6a4b] text-stone-950 shadow-[0_18px_50px_rgba(125,106,75,0.28)] hover:bg-[#94815d]",
secondary:
  "border border-white/12 bg-white/[0.04] text-stone-100 hover:bg-white/[0.08]",
ghost:
  "bg-transparent text-stone-200 hover:bg-white/[0.06]"
```

```tsx
// card.tsx base class
"rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(19,21,19,0.92),rgba(11,12,11,0.92))] shadow-[0_28px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1"
```

- [ ] **Step 5: Rebuild native premium primitives around the same palette**

Update `apps/native/components/premium.tsx`.

```tsx
export function MobileScreen({ children }: { children: React.ReactNode }) {
  return (
    <View className="flex-1 bg-[#080a08]">
      <View className="absolute left-[-32px] top-10 h-48 w-48 rounded-full bg-[#4d5b39]/20" />
      <View className="absolute right-[-40px] top-24 h-44 w-44 rounded-full bg-[#8b7552]/16" />
      <View className="absolute bottom-20 left-10 h-32 w-32 rounded-full bg-[#1a1e1a]" />
      {children}
    </View>
  );
}

export function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <View className={`rounded-[30px] border border-white/10 bg-[#111311] px-5 py-6 ${className}`}>
      {children}
    </View>
  );
}
```

- [ ] **Step 6: Run verification after the shared foundation pass**

Run:

```bash
npm run typecheck
npm run build:web
```

Expected:
- both commands pass
- shared UI primitives compile
- no existing route is deleted or broken by the token shift alone

- [ ] **Step 7: Commit the surface foundation**

```bash
git add apps/web/app/globals.css apps/web/components/ui/button.tsx apps/web/components/ui/card.tsx apps/web/components/ui/surface-tone.tsx apps/web/components/ui/eyebrow.tsx apps/native/global.css apps/native/components/premium.tsx
git commit -m "feat: add dark premium moody surface foundation"
```

## Task 2: Convert The Brand Workspace Shell And Dashboard

**Files:**
- Modify: `apps/web/components/brand-workspace-shell.tsx`
- Modify: `apps/web/app/dashboard/page.tsx`
- Reuse: `apps/web/components/ui/surface-tone.tsx`
- Reuse: `apps/web/components/ui/eyebrow.tsx`

- [ ] **Step 1: Verify the current dashboard still uses the old lighter hierarchy**

Run:

```bash
npm run build:web
```

Expected:
- build passes
- dashboard is still visually lighter and card-heavier than the approved dark direction

- [ ] **Step 2: Restructure the shell into darker command/evidence framing**

Update `apps/web/components/brand-workspace-shell.tsx` so the left rail becomes a darker structural shell.

```tsx
<main className="min-h-screen bg-[#080a08] px-5 py-6 md:px-8">
  <div className="mx-auto grid w-full max-w-[1480px] gap-6 xl:grid-cols-[296px_minmax(0,1fr)]">
    <aside className="xl:sticky xl:top-6 xl:self-start">
      <LacquerSurface className="overflow-hidden p-5">
        <div className="rounded-[28px] border border-white/8 bg-white/[0.04] p-5">
          ...
        </div>
      </LacquerSurface>
    </aside>
    <section className="flex min-w-0 flex-col gap-6">{children}</section>
  </div>
</main>
```

- [ ] **Step 3: Replace KPI mosaic rhythm with a command-first dashboard**

Update `apps/web/app/dashboard/page.tsx`.

```tsx
<header className="overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(19,21,19,0.92),rgba(11,12,11,0.92))] px-7 py-8 shadow-[0_28px_90px_rgba(0,0,0,0.45)]">
  <Eyebrow>BudCast Dashboard</Eyebrow>
  <h1 className="mt-3 font-display text-5xl text-[#f5efe6]">
    {profile?.company_name || profile?.name || "Brand workspace"}
  </h1>
  <p className="mt-4 max-w-2xl text-base leading-8 text-stone-300">
    Run BudCast like a protected operator desk: review creators, release campaigns, and move proof and payouts with confidence.
  </p>
</header>
```

Use one primary decision band plus a quieter evidence rail instead of four equal-weight hero cards.

- [ ] **Step 4: Keep the operator discipline while applying the darker mood**

Make sure:
- one primary action area is obvious
- secondary metrics are quieter
- green only marks meaningful state
- bronze is used for guidance, not everything

Use patterns like:

```tsx
<SmokedPanel className="p-5">
  <Eyebrow>Decision queue</Eyebrow>
  <div className="mt-3 text-2xl font-semibold text-[#f5efe6]">Priority campaigns and next moves</div>
</SmokedPanel>
```

- [ ] **Step 5: Verify the dashboard conversion**

Run:

```bash
npm run typecheck -w @budcast/web
npm run build:web
```

Expected:
- both commands pass
- dashboard route still builds
- auth gates still compile

- [ ] **Step 6: Commit the shell and dashboard pass**

```bash
git add apps/web/components/brand-workspace-shell.tsx apps/web/app/dashboard/page.tsx
git commit -m "feat: convert brand workspace to dark premium moody"
```

## Task 3: Convert Web Funnel And Operational Pages

**Files:**
- Modify: `apps/web/app/page.tsx`
- Modify: `apps/web/app/sign-in/page.tsx`
- Modify: `apps/web/app/sign-up/page.tsx`
- Modify: `apps/web/app/onboarding/page.tsx`
- Modify: `apps/web/app/profile/page.tsx`
- Modify: `apps/web/app/profile/edit/page.tsx`
- Modify: `apps/web/app/dashboard/campaigns/new/page.tsx`
- Modify: `apps/web/app/dashboard/campaigns/[id]/page.tsx`
- Modify: `apps/web/app/dashboard/campaigns/[id]/applicants/page.tsx`
- Modify: `apps/web/app/dashboard/submissions/page.tsx`

- [ ] **Step 1: Start with the public and auth-facing routes**

Convert `apps/web/app/page.tsx`, `sign-in/page.tsx`, `sign-up/page.tsx`, and `onboarding/page.tsx` so the product looks dark by default before login.

Use a poster-like hero, fewer boxes, and one dominant visual plane:

```tsx
<main className="min-h-screen bg-[#080a08] text-stone-100">
  <section className="mx-auto max-w-[1440px] px-6 py-8">
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <LacquerSurface className="px-8 py-10">
        <Eyebrow>BudCast</Eyebrow>
        <h1 className="mt-4 font-display text-6xl leading-[0.9] text-[#f5efe6]">
          The premium cannabis marketplace for brand trust, creator proof, and payout follow-through.
        </h1>
      </LacquerSurface>
    </div>
  </section>
</main>
```

- [ ] **Step 2: Convert profile and identity routes**

Apply the same darker system to `profile/page.tsx` and `profile/edit/page.tsx`, keeping identity, credibility, and niche information easy to scan.

```tsx
<LacquerSurface className="p-6">
  <Eyebrow>Profile</Eyebrow>
  <h1 className="mt-3 font-display text-5xl text-[#f5efe6]">{profile?.name}</h1>
  <p className="mt-4 text-sm leading-7 text-stone-300">
    This public-facing marketplace profile anchors trust, matching, and workflow routing.
  </p>
</LacquerSurface>
```

- [ ] **Step 3: Convert the campaign builder and operational routes**

Update:
- `apps/web/app/dashboard/campaigns/new/page.tsx`
- `apps/web/app/dashboard/campaigns/[id]/page.tsx`
- `apps/web/app/dashboard/campaigns/[id]/applicants/page.tsx`
- `apps/web/app/dashboard/submissions/page.tsx`

Use darker large-plane sections and calmer review rows:

```tsx
<SmokedPanel className="p-5">
  <Eyebrow>Review state</Eyebrow>
  <div className="mt-3 text-2xl font-semibold text-[#f5efe6]">Applicant evidence awaiting decision</div>
  <p className="mt-2 text-sm leading-7 text-stone-300">
    Proof, payout, and campaign fit should feel weighted and deliberate rather than stacked as equal cards.
  </p>
</SmokedPanel>
```

- [ ] **Step 4: Preserve all real data behavior during the visual rewrite**

Do not change:
- route contracts
- auth guards
- hook signatures
- Supabase mutation behavior
- campaign form validation behavior

This task is visual and structural, not behavioral.

- [ ] **Step 5: Verify the full web surface conversion**

Run:

```bash
npm run typecheck -w @budcast/web
npm run build:web
```

Expected:
- both commands pass
- all affected routes compile
- no server route disappears from the build output

- [ ] **Step 6: Commit the web surface pass**

```bash
git add apps/web/app/page.tsx apps/web/app/sign-in/page.tsx apps/web/app/sign-up/page.tsx apps/web/app/onboarding/page.tsx apps/web/app/profile/page.tsx apps/web/app/profile/edit/page.tsx apps/web/app/dashboard/campaigns/new/page.tsx apps/web/app/dashboard/campaigns/[id]/page.tsx apps/web/app/dashboard/campaigns/[id]/applicants/page.tsx apps/web/app/dashboard/submissions/page.tsx
git commit -m "feat: apply dark premium moody to web product surfaces"
```

## Task 4: Convert Native Foundation And Creator Home

**Files:**
- Create: `apps/native/components/sections.tsx`
- Modify: `apps/native/components/premium.tsx`
- Modify: `apps/native/app/index.tsx`
- Modify: `apps/native/app/sign-in.tsx`
- Modify: `apps/native/app/sign-up.tsx`
- Modify: `apps/native/app/onboarding.tsx`

- [ ] **Step 1: Create small native section wrappers to reduce screen-file sprawl**

Create `apps/native/components/sections.tsx`.

```tsx
import { Text, View } from "react-native";

export function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return <Text className="text-[11px] uppercase tracking-[3px] text-[#a59a86]">{children}</Text>;
}

export function SectionBlock({
  children,
  className = ""
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <View className={`rounded-[24px] border border-white/10 bg-white/[0.04] p-4 ${className}`}>{children}</View>;
}
```

- [ ] **Step 2: Shift native home to the approved dark mood**

Update `apps/native/app/index.tsx`.

```tsx
<PremiumScroll>
  <FadeInSection>
    <GlassCard>
      <SectionTitle
        eyebrow="Creator home"
        title="Discover the market from inside the dark room."
        description="BudCast mobile should feel premium, alive, and trustworthy while staying easier to approach than the brand workspace."
      />
    </GlassCard>
  </FadeInSection>
</PremiumScroll>
```

Make discovery cards feel like premium opportunity objects, not softened admin blocks.

- [ ] **Step 3: Convert auth and onboarding to the dark default**

Update:
- `apps/native/app/sign-in.tsx`
- `apps/native/app/sign-up.tsx`
- `apps/native/app/onboarding.tsx`

Use darker surfaces but keep them slightly more approachable than brand web:

```tsx
<GlassCard>
  <SectionTitle
    eyebrow="BudCast Auth"
    title="Sign in to the creator marketplace."
    description="Shared Supabase auth remains unchanged. Only the surface language shifts."
  />
</GlassCard>
```

- [ ] **Step 4: Verify the native foundation pass**

Run:

```bash
npm run typecheck -w @budcast/native
```

Expected:
- typecheck passes
- no route imports break
- native shell still compiles against the current Expo runtime

- [ ] **Step 5: Commit the native foundation pass**

```bash
git add apps/native/components/sections.tsx apps/native/components/premium.tsx apps/native/app/index.tsx apps/native/app/sign-in.tsx apps/native/app/sign-up.tsx apps/native/app/onboarding.tsx
git commit -m "feat: apply dark premium moody to native shell"
```

## Task 5: Convert Native Creator Workflow Screens And Run QA

**Files:**
- Modify: `apps/native/app/profile.tsx`
- Modify: `apps/native/app/profile-edit.tsx`
- Modify: `apps/native/app/store.tsx`
- Modify: `apps/native/app/applications.tsx`
- Modify: `apps/native/app/submissions.tsx`
- Modify: `apps/native/app/campaigns/[id].tsx`

- [ ] **Step 1: Convert the creator profile and edit surfaces**

Update `apps/native/app/profile.tsx` and `profile-edit.tsx` so profile identity, stats, niches, and trust information align with the dark system.

```tsx
<GlassCard>
  <SectionTitle
    eyebrow="Profile"
    title={profile?.name || "Creator profile"}
    description="This marketplace identity anchors trust, matching, and workflow routing."
  />
</GlassCard>
```

- [ ] **Step 2: Convert store, applications, and submissions**

Update:
- `apps/native/app/store.tsx`
- `apps/native/app/applications.tsx`
- `apps/native/app/submissions.tsx`

Focus on:
- stronger feed hierarchy
- clearer status progression
- higher emotional weight around proof and payout

```tsx
<SectionBlock>
  <SectionEyebrow>Submission state</SectionEyebrow>
  <Text className="mt-3 text-2xl font-semibold text-[#f5efe6]">
    Verified proof awaiting brand payment confirmation
  </Text>
</SectionBlock>
```

- [ ] **Step 3: Convert campaign detail to a premium opportunity view**

Update `apps/native/app/campaigns/[id].tsx`.

```tsx
<GlassCard>
  <SectionTitle
    eyebrow={formatCampaignType(campaign.campaign_type)}
    title={campaign.title}
    description={campaign.short_description || campaign.description}
  />
</GlassCard>
```

The detail screen should feel like a desirable opportunity, not a record view.

- [ ] **Step 4: Run full verification**

Run:

```bash
npm run typecheck
npm run build:web
```

Then manually verify:
- web design still loads
- dashboard still loads
- native simulator still boots
- creator sign-in still works
- profile and submissions still render on device

- [ ] **Step 5: Commit the native workflow conversion**

```bash
git add apps/native/app/profile.tsx apps/native/app/profile-edit.tsx apps/native/app/store.tsx apps/native/app/applications.tsx apps/native/app/submissions.tsx apps/native/app/campaigns/[id].tsx
git commit -m "feat: apply dark premium moody to creator workflow screens"
```

## Self-Review

### Spec coverage

- Global dark system: covered by Task 1
- Web brand workspace conversion: covered by Task 2
- Web marketing/auth/operational pages: covered by Task 3
- Native dark system foundation: covered by Task 4
- Native creator workflow conversion: covered by Task 5
- Guardrails around restraint, hierarchy, and limited green usage: enforced across Tasks 1-5

### Placeholder scan

- No `TODO`, `TBD`, or deferred “handle later” steps remain
- Every task contains exact file paths
- Every verification step contains exact commands

### Type consistency

- New web primitives are consistently named `LacquerSurface`, `SmokedPanel`, and `Eyebrow`
- New native section wrappers are consistently named `SectionEyebrow` and `SectionBlock`
- Existing route and hook names remain unchanged

