# Brand Mobile Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a mobile-first brand dashboard shell that feels like the creator mobile experience while keeping the approved desktop command center unchanged.

**Architecture:** Keep `/dashboard` as the single brand command route. Render a mobile-only brand app shell at `md:hidden` and keep the current desktop `BrandWorkspaceShell` at `hidden md:block`. Reuse existing campaign, applicant, submission, payment/product data from the page.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind, lucide-react.

---

### Task 1: Mobile Brand Navigation

**Files:**
- Create: `apps/web/components/brand-mobile/brand-mobile-bottom-nav.tsx`
- Create: `apps/web/components/brand-mobile/index.ts`

- [x] **Step 1: Build a mobile bottom nav**

Create a client component with five brand tabs: Campaigns, Feed, Messages, Review, Profile. Use in-page anchors for the command sections and `/profile` for the brand identity route.

- [x] **Step 2: Match creator mobile energy**

Use the approved coral/dark capsule treatment, icons, active state, and brand avatar fallback for Profile.

### Task 2: Mobile Dashboard Layout

**Files:**
- Modify: `apps/web/app/dashboard/page.tsx`

- [x] **Step 1: Keep desktop unchanged**

Wrap the existing `BrandWorkspaceShell` dashboard in `hidden md:block`.

- [x] **Step 2: Add mobile command home**

Add a `BrandMobileDashboard` module-level component that renders:

- Brand header with BudCast mark, search/filter controls, brand name, website/location, and profile strength.
- Action metrics for campaigns live, applicants, review, and payment/product.
- Campaign feed using the same campaign data and next-action routing.
- Brand Feed preview, Messages preview, and Review queue sections.
- Mobile bottom navigation.

### Task 3: Verification

**Files:**
- Test only.

- [x] **Step 1: Type-check**

Run: `npm run typecheck -w @budcast/web`

- [x] **Step 2: Production build**

Stop the dev server first if it is running on `3010`, then run: `npm run build:web`

- [x] **Step 3: Whitespace check**

Run: `git diff --check`

- [x] **Step 4: Preview**

Restart the web dev server on port `3010` and review `/dashboard` at desktop and mobile widths.
