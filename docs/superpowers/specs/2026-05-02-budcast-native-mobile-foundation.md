# BudCast Native Mobile Foundation Design

## Goal

Rebuild BudCast native mobile around a creator-first, Instagram-familiar marketplace foundation before continuing screen-level visual polish.

## Audit Decision

The mobile visual audit changes the execution order. BudCast should keep its dark premium cannabis identity, lime accent, creator-first language, and trust/compliance concepts, but the native app needs a system-level rebuild: tokens, primitives, tab navigation, and media-first campaign discovery.

This is not a request for more effects. It is a request for fewer competing visual ideas and a stronger mobile hierarchy.

## Product Scope

The native MVP is creator-first.

Primary native tabs:

- Campaigns: campaign discovery and apply entry point.
- Work: accepted jobs, pending applications, submissions, payment/product checkpoints, and disputes.
- Profile: public creator media kit, portfolio, trust, reviews, and edit/settings entry.
- Messages: only ships when backed by a real native thread list and chat using shared messaging hooks.
- Feed: delayed unless real UGC/feed content is included in the same release.

Brands remain web-first for this phase. Native brand routes can continue to exist, but the new foundation optimizes for creator mobile behavior.

## Visual Rules

- Lime means primary action, active tab, or selected chip.
- Bottom tabs are the main navigation.
- Header actions are contextual, not another navigation system.
- Campaign cards are media-first and badge-light.
- Trust signals reassure; they do not decorate every surface.
- Use two to three surface levels: canvas, surface, raised/overlay.
- Use fewer borders and more spacing.
- Reduce uppercase microcopy; reserve it for sparse metadata.
- One screen has one primary job.
- One card has one primary CTA.
- Cannabis compliance should feel built in, not bolted on.

## Native Architecture

Add a real Expo Router tab shell under `apps/native/app/(tabs)/`.

Keep these as stack routes outside tabs:

- Auth: `sign-in`, `sign-up`
- Onboarding: `onboarding`
- Details/forms: `campaigns/[id]`, `profile-edit`, submission forms

Move or map existing creator routes into the tab shell:

- Current `store.tsx` becomes Campaigns.
- Current `applications.tsx` and `submissions.tsx` inform Work.
- Current `profile.tsx` becomes Profile, but should be recomposed as a public media kit.

## Component System

Collapse overlapping primitives into a smaller native design system:

- `AppHeader`: safe-area-aware title/header actions.
- `Surface`: replaces `GlassCard`, `SoftCard`, `SectionBlock`, and `InfoTile` with controlled variants.
- `StatusPill`: badge/status treatment with limited tones.
- `Avatar`: creator/brand identity treatment.
- `MediaTile`: campaign and portfolio image handling.
- `TrustRow`: compact payment/compliance/rights indicators.
- `CampaignCard`: feed-ready campaign listing card.
- `SegmentedControl`: only for in-screen modes, not top-level nav duplication.

## Screen Targets

Campaigns should become a premium marketplace feed:

- Search or compact search action.
- Filters: For You, Local, Paid, Product, Paid + Product.
- Media-first campaign card.
- Visible fields: brand, title, payout/product value, deadline, open slots, platform, primary CTA.
- Secondary trust details move to `TrustRow` or detail view.

Work should become an operational dashboard:

- Today summary with only the most important two or three states.
- Sections: Needs action, Active, Submitted, Completed.
- Cards show status, next step, due date, and one CTA.

Profile should become a creator media kit:

- Cover image, avatar, name, location, verified/compliance state.
- Portfolio grid or reels row.
- Trust grouped by reviews, completed campaigns, repeat brands, and compliance verification.
- Settings/editing is available, but not the main content.

Messages ships only if it is real:

- Thread list using shared conversation hooks.
- Campaign-aware chat context.
- Empty state that explains coordination clearly.

Feed ships only if real content is ready:

- Uses shared feed hooks.
- Avoid placeholder-only tab in the primary navigation.

## Compatibility Requirements

Before visual QA, remove native-incompatible web patterns:

- Replace `grid grid-cols-*` with React Native flex layouts.
- Replace NativeWind `bg-gradient-*` usage with real images, plain surfaces, or `expo-linear-gradient` if intentionally added.
- Reduce inline hex drift by moving canonical color roles into tokens.
- Normalize fallback strings where non-ASCII placeholders are not necessary.

## Success Criteria

- Native root uses a real tab shell for creator top-level navigation.
- Tokens define the visual system rather than scattered TSX literals.
- Campaign cards show less metadata but improve scan speed.
- Work and Profile no longer feel like generic account dashboards.
- No shown tab is a dead surface.
- Native typecheck passes.
- Native web export or Expo preview path remains runnable after each phase.
