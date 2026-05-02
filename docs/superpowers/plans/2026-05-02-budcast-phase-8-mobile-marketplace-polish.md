# BudCast Phase 8 Mobile Marketplace Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Polish BudCast mobile web into a clearer cannabis UGC marketplace with semantic colors, stronger campaign cards, trust/compliance badges, and deal timelines.

**Architecture:** Add a small shared mobile marketplace UI module, then consume it from the creator campaign card and brand mobile dashboard. Keep routes, data hooks, backend schema, and desktop layouts unchanged.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS, lucide-react icons, existing BudCast shared hooks/types.

---

## File Map

- Create `apps/web/components/mobile-marketplace/index.tsx`
  - Owns mobile color roles, `MobileStatusPill`, `MobileTrustBadge`, `MobileDealTimeline`, and `MobileMetricTile`.
- Modify `apps/web/components/creator-social/campaign-drop-card.tsx`
  - Uses the shared mobile primitives for creator-facing campaign triage.
- Modify `apps/web/app/dashboard/_components/brand-mobile-dashboard.tsx`
  - Uses the shared mobile primitives for brand campaign cards and review state.
- Modify `apps/web/components/creator-social/index.ts`
  - Exports the shared creator card only; no behavioral change expected.
- Modify `packages/shared/tests/creator-mobile-redesign.test.ts`
  - Adds source-level regression checks for Phase 8 component markers.

## Task 1: Shared Mobile Marketplace Primitives

**Files:**
- Create: `apps/web/components/mobile-marketplace/index.tsx`
- Test: `packages/shared/tests/creator-mobile-redesign.test.ts`

- [ ] Add a source-level test that checks the shared module exports `MobileStatusPill`, `MobileTrustBadge`, `MobileDealTimeline`, and `mobileColorRoles`.
- [ ] Create the shared component module with semantic role classes for primary, success, trust, pending, danger, premium, muted, and neutral.
- [ ] Run `node --test packages/shared/tests/creator-mobile-redesign.test.ts`.

## Task 2: Creator Campaign Card Triage

**Files:**
- Modify: `apps/web/components/creator-social/campaign-drop-card.tsx`
- Test: `packages/shared/tests/creator-mobile-redesign.test.ts`

- [ ] Import `MobileDealTimeline`, `MobileMetricTile`, `MobileStatusPill`, and `MobileTrustBadge`.
- [ ] Replace generic metadata chips with semantic payout, deadline, platform, and compliance/trust badges.
- [ ] Add a compact timeline: `Open`, `Apply`, `Create`, `Review`, `Paid`.
- [ ] Keep one primary apply CTA and one secondary details CTA.
- [ ] Add regression markers for `Payment protected`, `Compliance fit`, and `MobileDealTimeline`.
- [ ] Run `node --test packages/shared/tests/creator-mobile-redesign.test.ts`.

## Task 3: Brand Mobile Campaign Decision Cards

**Files:**
- Modify: `apps/web/app/dashboard/_components/brand-mobile-dashboard.tsx`
- Test: `packages/shared/tests/creator-mobile-redesign.test.ts`

- [ ] Import the shared mobile primitives.
- [ ] Replace the brand campaign card status and compensation chips with semantic status/trust badges.
- [ ] Add a compact timeline: `Brief`, `Applicants`, `Content`, `Approve`, `Paid`.
- [ ] Keep existing next-action routing unchanged.
- [ ] Add regression markers for `Brand decision`, `Compliance-ready brief`, and `Product/payment`.
- [ ] Run `node --test packages/shared/tests/creator-mobile-redesign.test.ts`.

## Task 4: Verification

**Files:**
- No new files.

- [ ] Run `npm run typecheck`.
- [ ] Run `npm run build:web`.
- [ ] Verify the local dev server still responds on `http://localhost:3002`.
- [ ] Review the in-app browser at mobile width for no horizontal overflow and no bottom-nav collision.
