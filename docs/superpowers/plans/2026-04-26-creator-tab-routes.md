# Creator Tab Routes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert creator marketplace tabs from hash anchors into real Next.js routes.

**Architecture:** Keep one shared client screen that owns auth redirects, creator data hooks, and tab rendering. Add thin route wrappers for Feed, Messages, and Work so navigation behaves like a social app without duplicating data logic.

**Tech Stack:** Next.js App Router, React client components, TypeScript, existing BudCast shared hooks.

---

### Task 1: Shared Creator Screen

**Files:**
- Create: `apps/web/app/creator-dashboard/_components/creator-dashboard-screen.tsx`
- Modify: `apps/web/app/creator-dashboard/page.tsx`

- [x] Move the creator dashboard auth checks, data hooks, campaign rendering, feed preview, messages preview, and work queue into `CreatorDashboardScreen`.
- [x] Make `/creator-dashboard` render `<CreatorDashboardScreen activeTab="Campaigns" />`.
- [x] Keep existing backend hooks unchanged.

### Task 2: Route Wrappers

**Files:**
- Create: `apps/web/app/creator-dashboard/feed/page.tsx`
- Create: `apps/web/app/creator-dashboard/messages/page.tsx`
- Create: `apps/web/app/creator-dashboard/work/page.tsx`

- [x] Add thin route pages for Feed, Messages, and Work.
- [x] Pass the correct `activeTab` prop to the shared creator screen.

### Task 3: Navigation Hrefs

**Files:**
- Modify: `apps/web/components/creator-social/creator-social-shell.tsx`
- Modify: `apps/web/components/creator-social/creator-bottom-nav.tsx`

- [x] Replace `#feed`, `#messages`, and `#work` with real route URLs.
- [x] Make the top Campaigns/Feed switch use `Link` and active route styling.
- [x] Keep Profile pointed at `/profile`.

### Task 4: Verification

**Files:**
- No code files.

- [x] Run `npm run typecheck -w @budcast/web`.
- [x] Run `npm run build:web`.
- [x] Verify `/creator-dashboard`, `/creator-dashboard/feed`, `/creator-dashboard/messages`, and `/creator-dashboard/work` are generated as separate routes in the production build output.
