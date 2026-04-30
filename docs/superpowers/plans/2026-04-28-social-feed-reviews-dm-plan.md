# Social Feed, Reviews, And DM Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make BudCast feel like a real launch-ready social marketplace by adding real feed posts, visible review surfaces, and mobile-first DM compose/search.

**Architecture:** Add a minimal first-party feed post table and storage-backed post creation flow without external services. Reuse existing reviews and messaging tables; add hooks and UI surfaces instead of changing campaign workflow logic.

**Tech Stack:** Next.js app router, React, TypeScript strict mode, Supabase Postgres/RLS/Storage, TanStack Query, existing BudCast shared package.

---

## File Structure

- Modify `supabase/migrations/018_social_feed_posts.sql`: create `feed_posts` with RLS for user-created posts, reposts, media URLs, URL metadata placeholders, and public reads.
- Modify `packages/shared/src/types/database.ts`: add `FeedPost` interface and `feed_posts` table type.
- Create `packages/shared/src/hooks/useFeedPosts.ts`: list/create feed posts using Supabase and upload media to existing `portfolios` bucket.
- Create or modify feed UI components under `apps/web/components/social-feed/`: composer button/modal, post card, feed list.
- Modify `apps/web/app/creator-dashboard/_components/creator-dashboard-screen.tsx`: show real feed posts plus existing campaign/activity posts; add floating compose.
- Modify `apps/web/app/dashboard/_components/brand-mobile-dashboard.tsx`: show real feed posts plus existing brand/campaign activity posts; add floating compose.
- Create `packages/shared/src/hooks/useReviews.ts`: fetch published reviews for a profile and optionally create review rows.
- Modify `apps/web/app/profile/page.tsx` and `apps/web/app/brands/[id]/page.tsx`: add visible reviews sections.
- Modify `apps/web/components/messaging/budcast-dm-inbox.tsx`: improve mobile compose button, search drawer behavior, and mobile thread ergonomics.

## Task 1: Feed Data Model And Hooks

**Files:**
- Create: `supabase/migrations/018_social_feed_posts.sql`
- Modify: `packages/shared/src/types/database.ts`
- Create: `packages/shared/src/hooks/useFeedPosts.ts`
- Modify: `packages/shared/src/index.ts`

- [ ] Add `feed_posts` migration with columns: `id`, `author_id`, `post_type`, `body`, `media_urls`, `url`, `url_title`, `url_description`, `url_image`, `repost_of_id`, `visibility`, `created_at`, `updated_at`.
- [ ] Add RLS: published/public reads for authenticated users; authors can insert/update/delete their own posts.
- [ ] Add TypeScript `FeedPost` interface and Database table mapping.
- [ ] Add `useFeedPosts` query that selects posts with `author:users(...)` and optional repost source.
- [ ] Add `useCreateFeedPost` mutation that inserts a post and invalidates feed queries.
- [ ] Add `uploadFeedMedia(file)` helper using existing `portfolios` bucket path `${userId}/feed/${Date.now()}-${safeName}`.

## Task 2: Feed Composer And Feed Rendering

**Files:**
- Create: `apps/web/components/social-feed/feed-composer.tsx`
- Create: `apps/web/components/social-feed/feed-post-card.tsx`
- Create: `apps/web/components/social-feed/index.ts`
- Modify: `apps/web/app/creator-dashboard/_components/creator-dashboard-screen.tsx`
- Modify: `apps/web/app/dashboard/_components/brand-mobile-dashboard.tsx`

- [ ] Build a floating `+` compose action on feed screens for both creator and brand.
- [ ] Composer supports body text, optional image/video upload, optional URL, and optional repost source.
- [ ] URL preview is launch-safe: show URL domain/title placeholder from pasted URL; no server-side scraping yet.
- [ ] Feed renders real posts first, then existing curated campaign/activity posts as fallback.
- [ ] Repost card shows original author and original body/media with a caption above it.
- [ ] Keep visual style aligned with current green/black social marketplace system.

## Task 3: Review Visibility And Review Hooks

**Files:**
- Create: `packages/shared/src/hooks/useReviews.ts`
- Modify: `packages/shared/src/index.ts`
- Modify: `apps/web/app/profile/page.tsx`
- Modify: `apps/web/app/brands/[id]/page.tsx`

- [ ] Add `useProfileReviews(profileId)` to fetch published reviews for a reviewee with reviewer summary and application/campaign context where available.
- [ ] Add profile review section showing overall score, review count, recent written reviews, and reviewer identity.
- [ ] Creator profile labels emphasize brand feedback: content quality, professionalism, timeliness.
- [ ] Brand profile labels emphasize creator feedback: payment speed, communication, product/campaign experience.
- [ ] Empty states explain that reviews appear after completed campaign work.

## Task 4: Mobile-First DM Compose/Search Polish

**Files:**
- Modify: `apps/web/components/messaging/budcast-dm-inbox.tsx`

- [ ] Add always-visible mobile compose button in the header/top-right.
- [ ] Compose opens/focuses a search-first panel with “New message” framing.
- [ ] Search results are easier to tap on mobile and clearly show `Message`.
- [ ] Mobile conversation view behaves as a full-screen thread with back button, sticky header, and sticky composer.
- [ ] Desktop keeps split-pane layout and clearer `New message` action.

## Verification

- [ ] Run `npm run typecheck -w @budcast/web`.
- [ ] Run `npm run build:web`.
- [ ] Run `git diff --check`.
- [ ] Restart dev server on port `3010`.
- [ ] Browser-check:
  - `/creator-dashboard/feed`
  - `/dashboard/feed`
  - `/creator-dashboard/messages`
  - `/dashboard/messages`
  - `/profile`
  - `/brands/[id]`

