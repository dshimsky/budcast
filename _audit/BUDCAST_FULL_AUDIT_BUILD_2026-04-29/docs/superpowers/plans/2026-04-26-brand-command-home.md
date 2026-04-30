# Brand Command Home Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `/dashboard` with a responsive brand campaign command home focused on campaign status, applicants, content review, and payment/product follow-up.

**Architecture:** Keep `BrandWorkspaceShell`, existing auth redirects, existing `useBrandCampaigns`, and existing `useBrandSubmissionQueue`. Rewrite only the dashboard content hierarchy so desktop shows campaign operations first and mobile stacks priority actions before campaign cards.

**Tech Stack:** Next.js App Router, React client page, TypeScript, Tailwind utility classes, existing BudCast shared hooks and marketplace helpers.

---

### Task 1: Brand Command Header

**Files:**
- Modify: `apps/web/app/dashboard/page.tsx`

- [x] Replace the current large “Campaign control” header and separate profile block with a compact brand command header.
- [x] Show “Welcome back, {brand}”, brand avatar/logo, website/location, profile strength, and primary actions.
- [x] Keep `Post campaign`, `Review applicants`, and `Approve content` as the main brand actions.

### Task 2: Operational Priority Queue

**Files:**
- Modify: `apps/web/app/dashboard/page.tsx`

- [x] Add top action cards for `Campaigns live`, `Applicants waiting`, `Content needs review`, and `Payment/product pending`.
- [x] Make each card link to the right existing route.
- [x] Keep product wording cannabis-safe: no shipping language.

### Task 3: Campaign Board

**Files:**
- Modify: `apps/web/app/dashboard/page.tsx`

- [x] Replace old production rows with denser campaign cards.
- [x] Each card shows campaign status, compensation, applicants, accepted creators, submissions, approvals, payment/product status, deadline, and next action.
- [x] Preserve empty/loading states.

### Task 4: Verification

**Files:**
- No code files.

- [x] Run `npm run typecheck -w @budcast/web`.
- [x] Run `npm run build:web`.
- [x] Run `git diff --check`.
