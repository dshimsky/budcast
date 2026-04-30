# Creator Mobile Home Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the creator login landing screen feel like a mobile-first social marketplace home with a welcome/profile preview above campaigns.

**Architecture:** Add a focused `CreatorWelcomeHomeCard` presentation component and wire it into the existing shared `CreatorDashboardScreen` only for the `Campaigns` tab. Keep existing auth, hooks, campaign cards, and backend behavior unchanged.

**Tech Stack:** Next.js App Router, React client components, TypeScript, Tailwind utility classes, existing BudCast creator-social components.

---

### Task 1: Creator Welcome Card

**Files:**
- Create: `apps/web/components/creator-social/creator-welcome-home-card.tsx`
- Modify: `apps/web/components/creator-social/index.ts`

- [x] Create a mobile-first profile preview card with avatar, welcome text, handle, location, niche chips, profile strength, and quick work stats.
- [x] Export the component and types from the creator-social barrel.

### Task 2: Campaigns Home Integration

**Files:**
- Modify: `apps/web/app/creator-dashboard/_components/creator-dashboard-screen.tsx`

- [x] Replace the oversized Campaigns hero with `CreatorWelcomeHomeCard`.
- [x] Keep campaign filters and campaign cards directly underneath the welcome card.
- [x] Remove the separate work stat strip from the Campaigns home because stats now live inside the welcome card.

### Task 3: Verification

**Files:**
- No code files.

- [x] Run `npm run typecheck -w @budcast/web`.
- [x] Run `npm run build:web`.
- [x] Run `git diff --check`.
