# BudCast Messaging Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add real text-only brand/creator DMs that feel like Instagram/X while staying inside BudCast's campaign marketplace.

**Architecture:** Supabase owns conversations and messages with RLS restricting access to the two participants. Shared hooks expose typed conversation search, start-thread, message-list, and send-message behavior. Web routes reuse one premium DM component for brand desktop/mobile and creator mobile-first screens.

**Tech Stack:** Supabase Postgres/RLS, `@supabase/supabase-js`, TanStack Query, Next.js React client components, TypeScript strict.

---

### Task 1: Messaging Data Foundation

**Files:**
- Create: `supabase/migrations/017_messaging.sql`
- Modify: `packages/shared/src/types/database.ts`
- Modify: `packages/shared/src/index.ts`

- [ ] Create `conversations` and `messages` tables with participant RLS for `brand_id` and `creator_id`.
- [ ] Add typed `Conversation`, `Message`, and `ConversationType` interfaces.
- [ ] Export messaging hooks from the shared package after Task 2.

### Task 2: Shared Messaging Hooks

**Files:**
- Create: `packages/shared/src/hooks/useMessaging.ts`

- [ ] Add `useUserSearch` for creators/brands by name, company, and social handles.
- [ ] Add `useConversations` for current signed-in participant with profile and latest-message summaries.
- [ ] Add `useMessages` for a selected conversation.
- [ ] Add `useStartConversation` to find or create direct/campaign conversations.
- [ ] Add `useSendMessage` and invalidate message/conversation queries after send.

### Task 3: Reusable DM UI

**Files:**
- Create: `apps/web/components/messaging/budcast-dm-inbox.tsx`
- Create: `apps/web/components/messaging/index.ts`

- [ ] Build a two-pane desktop DM layout and mobile list/thread layout.
- [ ] Include username/company search and start-DM actions.
- [ ] Include text composer with send disabled for empty messages.
- [ ] Preserve BudCast premium dark styling with Persimmon Red action states.

### Task 4: Brand And Creator Message Pages

**Files:**
- Modify: `apps/web/app/dashboard/messages/page.tsx`
- Modify: `apps/web/app/creator-dashboard/messages/page.tsx`

- [ ] Replace workflow-only inbox pages with the real DM inbox component.
- [ ] Keep bottom nav/shell behavior for brand and creator pages.
- [ ] Scope brand search to creators and creator search to brands.

### Task 5: Message Entry Points

**Files:**
- Modify: `apps/web/app/brands/[id]/page.tsx`
- Modify: `apps/web/app/dashboard/campaigns/[id]/applicants/page.tsx`

- [ ] Add `Message brand` CTA on public brand profiles for signed-in creators.
- [ ] Add `Message creator` CTA on applicant review cards for brands.
- [ ] Route to the correct messages page with `?user=<id>` for auto-starting a thread.

### Task 6: Verification

**Commands:**
- `npm run typecheck -w @budcast/web`
- `npm run build:web`
- `git diff --check`
- `curl -I http://localhost:3010/dashboard/messages`
- `curl -I http://localhost:3010/creator-dashboard/messages`
