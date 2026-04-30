# Profile Studio Storefront Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the brand and creator profile tab into a premium Hybrid Studio + Storefront surface.

**Architecture:** Rework the existing `apps/web/app/profile/page.tsx` presentation only. Reuse existing auth/profile data, marketplace components, social items, portfolio URLs, profile strength helpers, and bottom navigation. Do not change schema, hooks, routing, or backend logic.

**Tech Stack:** Next.js App Router, React client components, Tailwind utility classes, existing BudCast UI primitives.

---

### Task 1: Add Shared Profile Studio Hero

**Files:**
- Modify: `apps/web/app/profile/page.tsx`

- [ ] Replace duplicated brand/creator top panels with one `ProfileStudioHero` component.
- [ ] The hero must include cover-style visual treatment, avatar/logo, name, handle/location/website metadata, profile strength, bio, social chips, and primary actions.
- [ ] Creator primary action routes to `/creator-app` and reads `Open mobile app`.
- [ ] Brand primary action routes to `/dashboard` and reads `Campaigns`.
- [ ] Public profile action appears only when `publicHref` is supplied.

### Task 2: Tighten Profile Sections

**Files:**
- Modify: `apps/web/app/profile/page.tsx`

- [ ] Keep existing Portfolio, Social proof, Creator proof, Campaign fit, Trust signals, Campaign examples, and Collaboration basics sections.
- [ ] Update labels so the page feels like a public profile studio instead of settings.
- [ ] Keep section cards visually quieter than the hero.

### Task 3: Verify

**Files:**
- Test existing app.

- [ ] Run `npm run typecheck -w @budcast/web`.
- [ ] Run `npm run build:web`.
- [ ] Run `git diff --check`.
- [ ] Restart the dev server on port `3010` if production build created stale chunks.
