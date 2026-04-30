# BudCast Creator Social Marketplace Slice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the creator entry experience into a mobile-first social marketplace shell with Campaigns as the default feed, Obsidian Drop Culture visual direction, and placeholder Feed/Messages/Work/Profile sections that do not imply unsupported backend behavior.

**Architecture:** Keep Supabase backend, shared hooks, and existing data contracts unchanged. Replace the current creator dashboard layout and campaign card grammar with a new creator shell, bottom navigation, campaign drop feed, and Obsidian styling primitives scoped to the creator surface. Feed/Messages/Work/Profile are visible navigation concepts in this slice; only Campaigns and existing Work/Profile links use live data.

**Tech Stack:** Next.js App Router, React 19, TypeScript strict mode, Tailwind CSS utilities, existing `@budcast/shared` hooks, existing BudCast logo assets.

---

## File Structure

### New Files

- `apps/web/components/creator-social/creator-social-shell.tsx`
  - Owns the mobile-first creator shell: dark obsidian background, sticky top identity bar, segmented Campaigns/Feed control, and bottom nav.

- `apps/web/components/creator-social/creator-bottom-nav.tsx`
  - Bottom navigation for Campaigns, Feed, Messages, Work, Profile.

- `apps/web/components/creator-social/campaign-drop-card.tsx`
  - Replaces current SaaS-style campaign card with a social/drop post card.

- `apps/web/components/creator-social/feed-preview-card.tsx`
  - Static/social placeholder card for Feed shell. Clear placeholder copy only.

- `apps/web/components/creator-social/message-thread-preview.tsx`
  - Static/campaign-aware message placeholder. No real-time messaging claims.

- `apps/web/components/creator-social/work-status-strip.tsx`
  - Compact creator work queue strip based on existing application/submission data.

- `apps/web/components/creator-social/index.ts`
  - Exports the new creator social components.

### Modified Files

- `apps/web/app/creator-dashboard/page.tsx`
  - Rebuilds the page around the new shell and Campaigns feed.
  - Keeps existing auth/onboarding redirects and existing hooks:
    - `useMyNicheCampaigns`
    - `useMyApplications`
    - `useMySubmissionPipeline`
  - Removes large hero/dashboard panel layout.

- `apps/web/app/globals.css`
  - Adds scoped animation/utilities for creator social surfaces only:
    - feed item reveal
    - drop pulse
    - obsidian grain/background
  - Do not globally restyle the existing brand dashboard.

## Visual Rules

Use Obsidian Drop Culture:
- Background: near-black with warm coral/orange activity accents.
- Green: logo/success/signal only, not the primary UI action color.
- Cards become social posts/drops, not dashboard panels.
- Fewer pills. Use tags only for compensation, content type, location, urgency, and status.
- Avatars and campaign media placeholders must be visually prominent.
- No shipping language.

## Task 1: Creator Social Component Foundation

**Files:**
- Create: `apps/web/components/creator-social/creator-bottom-nav.tsx`
- Create: `apps/web/components/creator-social/creator-social-shell.tsx`
- Create: `apps/web/components/creator-social/index.ts`

- [ ] **Step 1: Create bottom navigation component**

Create `apps/web/components/creator-social/creator-bottom-nav.tsx`:

```tsx
import Link from "next/link";
import { BriefcaseBusiness, MessageCircle, Radio, Sparkles, UserRound } from "lucide-react";

type CreatorNavItem = {
  href: string;
  label: "Campaigns" | "Feed" | "Messages" | "Work" | "Profile";
  active?: boolean;
};

const iconByLabel = {
  Campaigns: BriefcaseBusiness,
  Feed: Radio,
  Messages: MessageCircle,
  Work: Sparkles,
  Profile: UserRound
} as const;

export type CreatorBottomNavProps = {
  items: CreatorNavItem[];
};

export function CreatorBottomNav({ items }: CreatorBottomNavProps) {
  return (
    <nav
      aria-label="Creator navigation"
      className="fixed inset-x-3 bottom-3 z-40 rounded-[28px] border border-[#ff6b4a]/18 bg-[#080504]/92 px-2 py-2 shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur md:hidden"
    >
      <div className="grid grid-cols-5 gap-1">
        {items.map((item) => {
          const Icon = iconByLabel[item.label];
          return (
            <Link
              aria-current={item.active ? "page" : undefined}
              className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-[20px] px-1 py-2 text-[10px] font-semibold transition ${
                item.active
                  ? "bg-[#ff6b4a] text-[#170704]"
                  : "text-[#b8a99d] hover:bg-white/[0.045] hover:text-[#f8eee5]"
              }`}
              href={item.href}
              key={item.label}
            >
              <Icon className="h-4 w-4" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Create creator social shell**

Create `apps/web/components/creator-social/creator-social-shell.tsx`:

```tsx
import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";
import { BudCastLogo } from "../budcast-logo";
import { CreatorBottomNav } from "./creator-bottom-nav";

export type CreatorSocialShellProps = {
  activeTab: "Campaigns" | "Feed" | "Messages" | "Work" | "Profile";
  children: React.ReactNode;
  handle: string;
  profileHref?: string;
};

const navItems = [
  { href: "/creator-dashboard", label: "Campaigns" as const },
  { href: "#feed", label: "Feed" as const },
  { href: "#messages", label: "Messages" as const },
  { href: "#work", label: "Work" as const },
  { href: "/profile", label: "Profile" as const }
];

export function CreatorSocialShell({
  activeTab,
  children,
  handle,
  profileHref = "/profile"
}: CreatorSocialShellProps) {
  return (
    <main className="creator-obsidian min-h-screen bg-[#050403] px-0 pb-28 text-[#f8eee5] md:px-8 md:pb-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-[#050403]/92 px-4 py-3 backdrop-blur md:top-4 md:mt-4 md:rounded-[30px] md:border md:px-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <BudCastLogo href="/creator-dashboard" size="sm" variant="mark" />
              <div className="min-w-0">
                <div className="text-sm font-black leading-none text-[#f8eee5]">BudCast</div>
                <div className="mt-1 truncate text-[11px] font-semibold text-[#9d9087]">@{handle}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                aria-label="Search campaigns"
                className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.035] text-[#f8eee5]"
                type="button"
              >
                <Search className="h-4 w-4" />
              </button>
              <button
                aria-label="Filter campaigns"
                className="grid h-10 w-10 place-items-center rounded-full border border-[#ff6b4a]/20 bg-[#ff6b4a]/10 text-[#ffb199]"
                type="button"
              >
                <SlidersHorizontal className="h-4 w-4" />
              </button>
              <Link
                className="hidden rounded-full border border-white/10 px-4 py-2 text-xs font-bold text-[#d0c2b7] transition hover:border-[#ff6b4a]/25 hover:text-[#f8eee5] md:inline-flex"
                href={profileHref}
              >
                Profile
              </Link>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 rounded-full border border-white/10 bg-white/[0.035] p-1 md:max-w-sm">
            <a
              className="rounded-full bg-[#ff6b4a] px-4 py-2 text-center text-xs font-black text-[#170704]"
              href="#campaigns"
            >
              Campaigns
            </a>
            <a
              className="rounded-full px-4 py-2 text-center text-xs font-bold text-[#b8a99d] transition hover:bg-white/[0.045] hover:text-[#f8eee5]"
              href="#feed"
            >
              Feed
            </a>
          </div>
        </header>

        <div className="px-4 py-5 md:px-0 md:py-6">{children}</div>
      </div>
      <CreatorBottomNav items={navItems.map((item) => ({ ...item, active: item.label === activeTab }))} />
    </main>
  );
}
```

- [ ] **Step 3: Export creator social components**

Create `apps/web/components/creator-social/index.ts`:

```ts
export { CreatorBottomNav } from "./creator-bottom-nav";
export { CreatorSocialShell } from "./creator-social-shell";
export type { CreatorBottomNavProps } from "./creator-bottom-nav";
export type { CreatorSocialShellProps } from "./creator-social-shell";
```

- [ ] **Step 4: Run typecheck**

Run:

```bash
npm run typecheck -w @budcast/web
```

Expected: typecheck passes.

## Task 2: Campaign Drop Card

**Files:**
- Create: `apps/web/components/creator-social/campaign-drop-card.tsx`
- Modify: `apps/web/components/creator-social/index.ts`

- [ ] **Step 1: Create campaign drop card component**

Create `apps/web/components/creator-social/campaign-drop-card.tsx`:

```tsx
import Link from "next/link";
import { ArrowRight, MapPin, MessageCircle } from "lucide-react";

export type CampaignDropCardProps = {
  applyHref: string;
  applyLabel: string;
  brandAvatarUrl?: string | null;
  brandName: string;
  compensationLabel: string;
  compensationValue: string;
  contentTypeLabel: string;
  deadlineLabel: string;
  detailHref: string;
  locationLabel: string;
  platformLabel: string;
  slotsLabel: string;
  summary: string;
  title: string;
  urgencyLabel?: string;
};

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function CampaignDropCard({
  applyHref,
  applyLabel,
  brandAvatarUrl,
  brandName,
  compensationLabel,
  compensationValue,
  contentTypeLabel,
  deadlineLabel,
  detailHref,
  locationLabel,
  platformLabel,
  slotsLabel,
  summary,
  title,
  urgencyLabel
}: CampaignDropCardProps) {
  return (
    <article className="creator-feed-reveal overflow-hidden rounded-[30px] border border-white/10 bg-[#0d0a08] shadow-[0_28px_90px_rgba(0,0,0,0.38)]">
      <div className="p-4 md:p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full border border-[#ff6b4a]/20 bg-[#21110d] text-sm font-black text-[#ffb199]">
              {brandAvatarUrl ? (
                <img alt="" className="h-full w-full object-cover" src={brandAvatarUrl} />
              ) : (
                getInitials(brandName) || "BC"
              )}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-black text-[#f8eee5]">{brandName}</div>
              <div className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold text-[#9d9087]">
                <MapPin className="h-3.5 w-3.5 text-[#ff6b4a]" />
                <span className="truncate">{locationLabel}</span>
              </div>
            </div>
          </div>
          {urgencyLabel ? (
            <span className="creator-drop-pulse rounded-full border border-[#ff6b4a]/24 bg-[#ff6b4a]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#ffb199]">
              {urgencyLabel}
            </span>
          ) : null}
        </div>

        <Link className="group mt-4 block" href={detailHref}>
          <div className="relative h-36 overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(135deg,#33140d,#0a0503_62%,#ff6b4a)] md:h-48">
            <div className="absolute inset-4 rounded-[20px] border border-white/10" />
            <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-[#ff6b4a] px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#170704]">
                {compensationLabel}
              </span>
              <span className="rounded-full border border-white/14 bg-black/30 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#f8eee5]">
                {contentTypeLabel}
              </span>
            </div>
          </div>
          <h2 className="mt-4 text-[1.55rem] font-black leading-[1.02] text-[#f8eee5] transition group-hover:text-[#ffb199] md:text-4xl">
            {title}
          </h2>
        </Link>

        <p className="mt-3 text-sm font-medium leading-6 text-[#c6b8ad]">{summary}</p>

        <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] font-bold text-[#9d9087] md:grid-cols-4">
          <div className="rounded-[18px] border border-white/8 bg-white/[0.035] p-3">
            <span className="block text-[#f8eee5]">{compensationValue}</span>
            <span className="mt-1 block">Compensation</span>
          </div>
          <div className="rounded-[18px] border border-white/8 bg-white/[0.035] p-3">
            <span className="block text-[#f8eee5]">{platformLabel}</span>
            <span className="mt-1 block">Platform</span>
          </div>
          <div className="rounded-[18px] border border-white/8 bg-white/[0.035] p-3">
            <span className="block text-[#f8eee5]">{deadlineLabel}</span>
            <span className="mt-1 block">Deadline</span>
          </div>
          <div className="rounded-[18px] border border-white/8 bg-white/[0.035] p-3">
            <span className="block text-[#f8eee5]">{slotsLabel}</span>
            <span className="mt-1 block">Creator spots</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[11px] font-bold text-[#ffb199]">
            <MessageCircle className="h-4 w-4" />
            <span>Messages open after acceptance</span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              className="hidden rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-[#cfc0b6] transition hover:border-white/18 hover:text-[#f8eee5] sm:inline-flex"
              href={detailHref}
            >
              Details
            </Link>
            <Link
              aria-label={`${applyLabel} for ${title}`}
              className="inline-flex items-center gap-2 rounded-full bg-[#ff6b4a] px-4 py-2 text-sm font-black text-[#170704] shadow-[0_16px_42px_rgba(255,107,74,0.22)] transition hover:bg-[#ff8569]"
              href={applyHref}
            >
              {applyLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
```

- [ ] **Step 2: Export campaign drop card**

Modify `apps/web/components/creator-social/index.ts`:

```ts
export { CampaignDropCard } from "./campaign-drop-card";
export { CreatorBottomNav } from "./creator-bottom-nav";
export { CreatorSocialShell } from "./creator-social-shell";
export type { CampaignDropCardProps } from "./campaign-drop-card";
export type { CreatorBottomNavProps } from "./creator-bottom-nav";
export type { CreatorSocialShellProps } from "./creator-social-shell";
```

- [ ] **Step 3: Run typecheck**

Run:

```bash
npm run typecheck -w @budcast/web
```

Expected: typecheck passes.

## Task 3: Placeholder Feed, Messages, And Work Components

**Files:**
- Create: `apps/web/components/creator-social/feed-preview-card.tsx`
- Create: `apps/web/components/creator-social/message-thread-preview.tsx`
- Create: `apps/web/components/creator-social/work-status-strip.tsx`
- Modify: `apps/web/components/creator-social/index.ts`

- [ ] **Step 1: Create Feed preview card**

Create `apps/web/components/creator-social/feed-preview-card.tsx`:

```tsx
export type FeedPreviewCardProps = {
  eyebrow: string;
  title: string;
  body: string;
  meta: string;
};

export function FeedPreviewCard({ eyebrow, title, body, meta }: FeedPreviewCardProps) {
  return (
    <article className="rounded-[28px] border border-white/10 bg-[#0b0907] p-4 shadow-[0_22px_70px_rgba(0,0,0,0.32)]">
      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#ffb199]">{eyebrow}</div>
      <h3 className="mt-3 text-xl font-black leading-tight text-[#f8eee5]">{title}</h3>
      <p className="mt-2 text-sm font-medium leading-6 text-[#bfb1a6]">{body}</p>
      <div className="mt-4 rounded-full border border-white/10 bg-white/[0.035] px-3 py-2 text-xs font-bold text-[#9d9087]">
        {meta}
      </div>
    </article>
  );
}
```

- [ ] **Step 2: Create Message thread preview**

Create `apps/web/components/creator-social/message-thread-preview.tsx`:

```tsx
import { MessageCircle } from "lucide-react";

export type MessageThreadPreviewProps = {
  body: string;
  campaignTitle: string;
  status: string;
};

export function MessageThreadPreview({ body, campaignTitle, status }: MessageThreadPreviewProps) {
  return (
    <div className="rounded-[28px] border border-[#ff6b4a]/18 bg-[#ff6b4a]/[0.07] p-4">
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#ff6b4a] text-[#170704]">
          <MessageCircle className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#ffb199]">{status}</div>
          <h3 className="mt-2 text-lg font-black leading-tight text-[#f8eee5]">{campaignTitle}</h3>
          <p className="mt-2 text-sm font-medium leading-6 text-[#d0c2b7]">{body}</p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create Work status strip**

Create `apps/web/components/creator-social/work-status-strip.tsx`:

```tsx
export type WorkStatusItem = {
  label: string;
  value: string | number;
};

export type WorkStatusStripProps = {
  items: WorkStatusItem[];
};

export function WorkStatusStrip({ items }: WorkStatusStripProps) {
  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
      {items.map((item) => (
        <div
          className="rounded-[22px] border border-white/10 bg-white/[0.035] p-4"
          key={item.label}
        >
          <div className="text-3xl font-black text-[#f8eee5]">{item.value}</div>
          <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#9d9087]">{item.label}</div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Export preview components**

Modify `apps/web/components/creator-social/index.ts`:

```ts
export { CampaignDropCard } from "./campaign-drop-card";
export { CreatorBottomNav } from "./creator-bottom-nav";
export { CreatorSocialShell } from "./creator-social-shell";
export { FeedPreviewCard } from "./feed-preview-card";
export { MessageThreadPreview } from "./message-thread-preview";
export { WorkStatusStrip } from "./work-status-strip";
export type { CampaignDropCardProps } from "./campaign-drop-card";
export type { CreatorBottomNavProps } from "./creator-bottom-nav";
export type { CreatorSocialShellProps } from "./creator-social-shell";
export type { FeedPreviewCardProps } from "./feed-preview-card";
export type { MessageThreadPreviewProps } from "./message-thread-preview";
export type { WorkStatusItem, WorkStatusStripProps } from "./work-status-strip";
```

- [ ] **Step 5: Run typecheck**

Run:

```bash
npm run typecheck -w @budcast/web
```

Expected: typecheck passes.

## Task 4: Scoped Obsidian CSS Utilities

**Files:**
- Modify: `apps/web/app/globals.css`

- [ ] **Step 1: Add scoped creator social CSS**

Append this block to `apps/web/app/globals.css`:

```css
.creator-obsidian {
  background:
    radial-gradient(circle at 80% 0%, rgba(255, 107, 74, 0.18), transparent 28%),
    radial-gradient(circle at 12% 22%, rgba(200, 240, 96, 0.055), transparent 24%),
    #050403;
}

.creator-obsidian::before {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  opacity: 0.16;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px);
  background-size: 28px 28px;
  mask-image: linear-gradient(to bottom, black, transparent 82%);
}

.creator-feed-reveal {
  animation: creatorFeedReveal 520ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

.creator-drop-pulse {
  animation: creatorDropPulse 2.4s ease-in-out infinite;
}

@keyframes creatorFeedReveal {
  from {
    opacity: 0;
    transform: translateY(16px) scale(0.985);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes creatorDropPulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(255, 107, 74, 0);
  }
  50% {
    box-shadow: 0 0 0 6px rgba(255, 107, 74, 0.08);
  }
}

@media (prefers-reduced-motion: reduce) {
  .creator-feed-reveal,
  .creator-drop-pulse {
    animation: none;
  }
}
```

- [ ] **Step 2: Run typecheck**

Run:

```bash
npm run typecheck -w @budcast/web
```

Expected: typecheck passes.

## Task 5: Rebuild Creator Dashboard Into Campaigns Feed

**Files:**
- Modify: `apps/web/app/creator-dashboard/page.tsx`

- [ ] **Step 1: Replace component imports**

In `apps/web/app/creator-dashboard/page.tsx`, replace imports from `../../components/marketplace`, `ProductBrandBar`, `Button`, `Eyebrow`, `LacquerSurface`, and `SmokedPanel` with:

```tsx
import {
  CampaignDropCard,
  CreatorSocialShell,
  FeedPreviewCard,
  MessageThreadPreview,
  WorkStatusStrip
} from "../../components/creator-social";
```

Keep existing shared hook imports and `RouteTransitionScreen`.

- [ ] **Step 2: Add creator feed filter data**

Inside `CreatorDashboardPage`, after `workQueueItems`, add:

```tsx
const campaignFilters = ["For You", "Local", "Paid", "Product", "Paid + Product", "Reels", "UGC Video"];
const workStatusItems = [
  { label: "Applied", value: pendingApplicationCount },
  { label: "Active", value: acceptedApplicationCount },
  { label: "Submit", value: submissionActionCount },
  { label: "Pending", value: paymentPendingCount }
];
```

- [ ] **Step 3: Replace returned product layout**

Replace the current return JSX after the brand account guard with:

```tsx
return (
  <CreatorSocialShell activeTab="Campaigns" handle={creatorHandle} profileHref="/profile">
    <section className="grid gap-5" id="campaigns">
      <div className="rounded-[32px] border border-white/10 bg-[#0b0907]/86 p-5 shadow-[0_28px_90px_rgba(0,0,0,0.38)] md:p-6">
        <div className="max-w-3xl">
          <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#ffb199]">
            Cannabis creator marketplace
          </div>
          <h1 className="mt-3 text-5xl font-black leading-[0.92] text-[#f8eee5] md:text-7xl">
            Find campaigns. Create content. Coordinate the work.
          </h1>
          <p className="mt-4 max-w-2xl text-base font-medium leading-8 text-[#c6b8ad]">
            Browse paid, product, and paid + product cannabis campaigns. Apply with your profile, then use Messages
            after acceptance to coordinate pickup, content details, and payment timing.
          </p>
        </div>
        <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
          {campaignFilters.map((filter, index) => (
            <span
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-black ${
                index === 0
                  ? "bg-[#ff6b4a] text-[#170704]"
                  : "border border-white/10 bg-white/[0.035] text-[#b8a99d]"
              }`}
              key={filter}
            >
              {filter}
            </span>
          ))}
        </div>
      </div>

      <WorkStatusStrip items={workStatusItems} />

      {opportunities.isLoading ? (
        <div className="rounded-[30px] border border-white/10 bg-[#0d0a08] px-6 py-12 text-center">
          <p className="text-lg font-black text-[#f8eee5]">Loading campaign drops...</p>
          <p className="mt-2 text-sm font-medium leading-6 text-[#9d9087]">
            BudCast is matching live campaigns to your creator profile.
          </p>
        </div>
      ) : (opportunities.data?.length ?? 0) === 0 ? (
        <div className="rounded-[30px] border border-dashed border-white/14 bg-[#0d0a08] px-6 py-12 text-center">
          <p className="text-lg font-black text-[#f8eee5]">No matching campaigns yet.</p>
          <p className="mt-2 text-sm font-medium leading-6 text-[#9d9087]">
            Add niches, socials, and portfolio examples so BudCast can match better campaign drops.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {opportunities.data?.map((campaign) => {
            const application = applications.getApplication(campaign.id);
            const applied = Boolean(application);
            const workflowStatus = getCampaignWorkflowStatus(campaign.id, application, pipelineRows);
            const primaryActionLabel = applied ? "View status" : "Apply";
            const compensationLabel = getCompensationLabel(campaign);
            const feedLabels = getCampaignFeedBadges(campaign).slice(0, 3);
            const brandName = campaign.brand?.company_name ?? "Cannabis brand";
            const totalSlots = campaign.slots_available ?? 0;
            const remainingSlots = Math.max(totalSlots - (campaign.slots_filled ?? 0), 0);

            return (
              <CampaignDropCard
                applyHref={`/campaigns/${campaign.id}`}
                applyLabel={primaryActionLabel}
                brandAvatarUrl={campaign.brand?.avatar_url}
                brandName={brandName}
                compensationLabel={compensationLabel}
                compensationValue={getCreatorCompensationValue(campaign)}
                contentTypeLabel={getPrimaryContentType(campaign)}
                deadlineLabel={formatDeadline(campaign.application_deadline)}
                detailHref={`/campaigns/${campaign.id}`}
                key={campaign.id}
                locationLabel={campaign.location ?? "Local or brand-coordinated"}
                platformLabel={getPlatformTarget(campaign)}
                slotsLabel={`${remainingSlots} open`}
                summary={getCreatorFacingDescription(campaign)}
                title={campaign.title}
                urgencyLabel={feedLabels[0] ?? (applied ? workflowStatus : undefined)}
              />
            );
          })}
        </div>
      )}
    </section>

    <section className="mt-7 grid gap-5 md:grid-cols-2" id="feed">
      <FeedPreviewCard
        body="Brand posts, creator work, job reviews, and campaign recaps will live here. This shell is intentionally visible so BudCast feels like a network, not only a job board."
        eyebrow="Social marketplace feed"
        meta="Placeholder until social feed data is supported"
        title="See what cannabis brands and creators are doing."
      />
      <FeedPreviewCard
        body="Completed creator work and brand reviews should become trust signals across profiles and campaign decisions."
        eyebrow="Marketplace proof"
        meta="Proof loop planned after creator feed rebuild"
        title="Completed work becomes reputation."
      />
    </section>

    <section className="mt-7 grid gap-5 md:grid-cols-2" id="messages">
      <MessageThreadPreview
        body="Accepted product campaigns should create a campaign-aware thread for pickup details, creative questions, payment timing, and revision discussion. This slice does not add a real-time messaging backend."
        campaignTitle="Campaign coordination"
        status="Messages"
      />
      <MessageThreadPreview
        body="Product campaigns should use pickup and product received language, not shipping. Brand and creator coordination stays attached to the campaign."
        campaignTitle="Product coordination"
        status="Cannabis-aware workflow"
      />
    </section>

    <section className="mt-7 rounded-[30px] border border-white/10 bg-[#0d0a08] p-5" id="work">
      <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#ffb199]">Work queue</div>
      <h2 className="mt-2 text-3xl font-black text-[#f8eee5]">Applications and accepted work</h2>
      <div className="mt-5 grid gap-3">
        {workQueueItems.map((item) => (
          <a
            className="rounded-[22px] border border-white/10 bg-white/[0.035] p-4 transition hover:border-[#ff6b4a]/24 hover:bg-[#ff6b4a]/[0.06]"
            href={item.actionHref}
            key={item.title}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-black text-[#f8eee5]">{item.title}</div>
                <div className="mt-1 text-sm font-medium leading-6 text-[#9d9087]">{item.description}</div>
              </div>
              <span className="shrink-0 text-sm font-black text-[#ffb199]">{item.actionLabel}</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  </CreatorSocialShell>
);
```

- [ ] **Step 4: Remove now-unused helpers/imports**

Remove imports and helper functions that are no longer referenced after the JSX replacement:
- `formatDeliverable`
- `getBrandSubmissionStatus`
- `getCreatorSubmissionStatus`
- `getPaymentProductStatus`
- `ArrowRight`
- `CampaignFeedCard`
- `CreatorIdentityRow`
- `MetadataStrip`
- `WorkQueueItem`
- `ProductBrandBar`
- `Button`
- `Eyebrow`
- `LacquerSurface`
- `SmokedPanel`
- `getPipelineStatus`
- `getCreatorBrandReviewStatus`

Keep helpers used by the new return:
- `formatCompact` only if still referenced; otherwise remove it.
- `formatDeadline`
- `getCampaignFeedBadges`
- `getCompensationLabel`
- `getCompensationValue`
- `getPlatformTarget`
- `getPrimaryContentType`
- `hasCompletedOnboarding`
- existing hooks.

- [ ] **Step 5: Run typecheck**

Run:

```bash
npm run typecheck -w @budcast/web
```

Expected: typecheck passes.

## Task 6: Cannabis Product Language Cleanup In Creator Slice

**Files:**
- Modify: `apps/web/app/creator-dashboard/page.tsx`
- Modify: `apps/web/components/creator-social/campaign-drop-card.tsx`

- [ ] **Step 1: Scan for shipping and banned terms**

Run:

```bash
rg -n "ship|shipping|shipped|Gifting|Hybrid|Product-led|Free product|Unpaid|Control panel|Workspace|Overview" apps/web/app/creator-dashboard/page.tsx apps/web/components/creator-social
```

Expected: no visible copy matches. Component names from existing imports do not count, but there should be no visible UI text with these terms.

- [ ] **Step 2: If matches appear, replace visible copy**

Use these replacements:
- `shipping` -> `pickup coordination`
- `shipped` -> `product received`
- `Gifting` -> `Product`
- `Hybrid` -> `Paid + Product`
- `Free product` -> `Product`
- `Unpaid` -> `Product`
- `Workspace` -> `Work`
- `Overview` -> `Campaigns`

- [ ] **Step 3: Run typecheck**

Run:

```bash
npm run typecheck -w @budcast/web
```

Expected: typecheck passes.

## Task 7: Final Verification

**Files:**
- Verify all changed files.

- [ ] **Step 1: Run typecheck**

Run:

```bash
npm run typecheck -w @budcast/web
```

Expected: typecheck passes.

- [ ] **Step 2: Run production build**

Before building, stop the dev server if it is running on port `3010`:

```bash
lsof -i tcp:3010 -n -P
```

If a Node process is listening on `3010`, stop it:

```bash
kill -9 <PID>
```

Then run:

```bash
npm run build:web
```

Expected: build completes successfully.

- [ ] **Step 3: Run diff checks**

Run:

```bash
git diff --check
```

Expected: no output.

- [ ] **Step 4: Run direct whitespace scan for untracked files**

Run:

```bash
rg -n "[ \t]+$" apps/web/app/creator-dashboard apps/web/components/creator-social apps/web/app/globals.css
```

Expected: no output.

- [ ] **Step 5: Run banned visible-term scan**

Run:

```bash
rg -n "Gifting|Hybrid|Product-led|Free product|Unpaid|Control panel|\bOverview\b|shipping|shipped" apps/web/app/creator-dashboard apps/web/components/creator-social
```

Expected: no output.

- [ ] **Step 6: Restart preview**

Run:

```bash
npm run dev -w @budcast/web -- --port 3010
```

Expected: Next dev server reports ready at `http://localhost:3010`.

## Review Checklist

After implementation:
- Creator dashboard no longer looks like the previous panel/card dashboard.
- Creator lands on `Campaigns`.
- Bottom nav contains Campaigns, Feed, Messages, Work, Profile.
- Campaigns look like social/drop posts.
- Feed and Messages are visible but clearly placeholder/shell surfaces if no backend supports them.
- Product campaigns use coordination language, not shipping.
- Green is not the primary UI accent outside the logo/success/signal states.
- No backend/schema/RPC changes were made.

## Self-Review

Spec coverage:
- Creator app shell, Campaigns default, Feed/Messages/Work/Profile nav, Obsidian visual system, cannabis no-shipping language, and backend lock are covered.
- Brand-side hybrid app is intentionally out of scope for this first implementation slice.

Placeholder scan:
- No TBD/TODO/incomplete steps remain.
- Placeholder UI is explicitly defined as placeholder and must not imply live backend functionality.

Type consistency:
- Component props are defined and used consistently across tasks.
- Navigation labels match the approved product language.

