# BudCast Phase 9 Creator Application Moments Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make creator application states engaging and clear across campaign detail, creator dashboard, and campaign cards.

**Architecture:** Keep the existing application RPC and campaign routes. Add creator-facing animation primitives and application-state helpers in web components, include declined applications in the creator query without blocking reapplication, and update source-level regression tests.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS, node:test source regressions.

---

## File Map

- Modify `packages/shared/src/hooks/useMyApplications.ts`
  - Include rejected applications in history while keeping `isApplied` and `getApplication` active-only.
  - Add `getApplicationHistory` for detail/history views.
- Modify `apps/web/app/campaigns/[id]/page.tsx`
  - Add submitted, pending, accepted, declined application panels and status timeline.
- Modify `apps/web/app/creator-dashboard/_components/creator-dashboard-screen.tsx`
  - Add status-specific application card copy, tones, rail, and CTAs.
- Modify `apps/web/components/creator-social/campaign-drop-card.tsx`
  - Add stronger press/transition feedback for opening campaign briefs.
- Modify `apps/web/app/globals.css`
  - Add reduced-motion-safe animations for application submitted pulse, pending shimmer, and status rails.
- Modify `packages/shared/tests/creator-mobile-redesign.test.ts`
  - Add regression markers for Phase 9 application moments.

## Task 1: Application History Visibility

- [ ] Add failing source-level test checking `useMyApplications.ts` includes `rejected`, has `activeApplicationStatuses`, and exposes `getApplicationHistory`.
- [ ] Update `useMyApplications.ts` so rejected applications appear in `data`, while `isApplied` and `getApplication` only return pending/accepted/completed/disputed.
- [ ] Run `node --test packages/shared/tests/creator-mobile-redesign.test.ts`.

## Task 2: Detail Page Application Moment

- [ ] Add failing source-level test checking campaign detail contains `Application sent`, `Brand reviewing`, `Accepted by brand`, `Not selected`, and `application-moment-pulse`.
- [ ] Update `apps/web/app/campaigns/[id]/page.tsx` application panel to use state-specific moments.
- [ ] Run `node --test packages/shared/tests/creator-mobile-redesign.test.ts`.

## Task 3: Creator Dashboard Application Cards

- [ ] Add failing source-level test checking dashboard cards contain `Coordinate details`, `This campaign was not a match`, and `application-status-rail`.
- [ ] Update `CreatorApplicationCard` with status-specific tone/copy/CTA.
- [ ] Run `node --test packages/shared/tests/creator-mobile-redesign.test.ts`.

## Task 4: Motion Utilities and Card Feedback

- [ ] Add failing source-level test checking `globals.css` contains `application-moment-pulse`, `application-pending-shimmer`, and reduced-motion handling.
- [ ] Add CSS animations and improve campaign card/link press states.
- [ ] Run focused test, `npm run typecheck`, and `npm run build:web`.
