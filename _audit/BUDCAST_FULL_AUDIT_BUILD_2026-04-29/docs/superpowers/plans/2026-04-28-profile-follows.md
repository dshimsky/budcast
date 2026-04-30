# Profile Follows Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a real BudCast follow graph so creators and brands can follow each other, with creator profiles showing brand follower count and creator follower count separately.

**Architecture:** Add a small Supabase-backed `profile_follows` relationship table and a grouped stats view. Shared React Query hooks expose follow state, follow/unfollow, and split follower counts. Web profile surfaces render a launch-ready follow button and real marketplace count labels without affecting feed ranking yet.

**Tech Stack:** Supabase Postgres/RLS, `@supabase/supabase-js`, React Query, Next.js App Router, TypeScript strict mode.

---

### Task 1: Follow Data Model

**Files:**
- Create: `supabase/migrations/019_profile_follows.sql`
- Modify: `packages/shared/src/types/database.ts`

- [ ] Add `profile_follows` with `follower_id`, `following_id`, unique pair, and no self-following.
- [ ] Add RLS so authenticated users can read follows, insert their own follows, and delete their own follows.
- [ ] Add `profile_follow_counts` view with `brand_followers`, `creator_followers`, `total_followers`, and `following_count`.
- [ ] Add matching TypeScript database types.

### Task 2: Shared Follow Hooks

**Files:**
- Create: `packages/shared/src/hooks/useFollows.ts`
- Modify: `packages/shared/src/index.ts`

- [ ] Add `useProfileFollowStats(profileId)` returning split counts.
- [ ] Add `useProfileFollowState(profileId)` returning whether current user follows that profile.
- [ ] Add `useToggleProfileFollow(profileId)` for follow/unfollow with query invalidation.
- [ ] Add small display helpers for creator-facing labels.

### Task 3: Web Profile Integration

**Files:**
- Modify: `apps/web/app/profile/page.tsx`
- Modify: `apps/web/app/brands/[id]/page.tsx`

- [ ] Show `Brand followers`, `Creator followers`, and `Following` on creator profiles.
- [ ] Show `Followers` and `Following` on brand profiles.
- [ ] Add `Follow` / `Following` buttons on public profile surfaces, hidden when viewing your own profile.
- [ ] Keep UI aligned to the current Concept 2B lime/glass style.

### Task 4: Verification

**Commands:**
- `npm run typecheck -w @budcast/shared`
- `npm run typecheck -w @budcast/web`
- `npm run build:web`
- `git diff --check`
- Read-only Supabase REST check against `profile_follows`.

**Acceptance:**
- Creators can see how many brands follow them and how many creators follow them.
- Brands can follow creators; creators can follow brands or creators.
- Counts are real Supabase data, not fake UI numbers.
