# BudCast Creator Feed OS Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild BudCast's presentation layer into a premium Creator Feed OS: mobile-first campaign discovery for creators and desktop campaign production for brands, without changing backend schema, RPCs, or services.

**Architecture:** Add focused shared marketplace presentation components, then refactor existing pages to use them. Keep all data access in current shared hooks and convert unsupported fields into static display copy only. Preserve the BudCast logo system and dark premium brand foundation while reducing nested panels, excessive pills, and generic dashboard patterns.

**Tech Stack:** Next.js App Router, React, TypeScript strict mode, Tailwind CSS utility classes, existing `@budcast/shared` hooks, existing Supabase backend.

---

## Scope Boundary

This is a broad product redesign. Execute it in phases so the app stays runnable after every task.

Backend remains locked:

- No Supabase schema changes.
- No new RPCs.
- No new external services.
- No BFF/API layer.
- No new production data contract beyond existing hooks.

## File Structure

Create these shared UI files:

- `apps/web/components/marketplace/brand-identity-row.tsx`: compact brand identity row for campaigns and brand profile previews.
- `apps/web/components/marketplace/creator-identity-row.tsx`: compact creator identity row for profile/applicant/submission surfaces.
- `apps/web/components/marketplace/marketplace-badge.tsx`: constrained badge component for compensation, content type, urgency, and status.
- `apps/web/components/marketplace/metadata-strip.tsx`: compact inline metadata row that replaces many small stat boxes.
- `apps/web/components/marketplace/media-grid.tsx`: portfolio/reference-image thumbnail grid.
- `apps/web/components/marketplace/work-queue-item.tsx`: action-row pattern for creator and brand queues.
- `apps/web/components/marketplace/campaign-feed-card.tsx`: feed-style campaign opportunity card.
- `apps/web/components/marketplace/campaign-production-row.tsx`: brand desktop campaign row.
- `apps/web/components/marketplace/index.ts`: exports for marketplace UI components.

Modify these existing files:

- `apps/web/app/creator-dashboard/page.tsx`: convert to Creator Feed OS.
- `apps/web/app/profile/page.tsx`: convert creator profile to storefront and brand profile to trust surface.
- `apps/web/app/dashboard/page.tsx`: convert brand dashboard to campaign production queue.
- `apps/web/components/brand-workspace-shell.tsx`: simplify sidebar and remove boxed navigation clutter.
- `apps/web/app/dashboard/campaigns/new/page.tsx`: declutter campaign builder presentation.
- `apps/web/app/campaigns/[id]/page.tsx`: align campaign detail with feed-card/detail language.
- `apps/web/app/dashboard/campaigns/[id]/applicants/page.tsx`: align applicant review with creator identity/profile proof.
- `apps/web/app/dashboard/submissions/page.tsx`: align submission review with production workflow.

Verification commands for every phase:

```bash
npm run typecheck -w @budcast/web
npm run build:web
git diff --check
```

Browser QA routes:

- `http://localhost:3010/creator-dashboard`
- `http://localhost:3010/profile`
- `http://localhost:3010/dashboard`
- `http://localhost:3010/dashboard/campaigns/new`
- `http://localhost:3010/campaigns/[id]`
- `http://localhost:3010/dashboard/campaigns/[id]/applicants`
- `http://localhost:3010/dashboard/submissions`

---

## Task 1: Shared Marketplace Presentation Components

**Files:**

- Create: `apps/web/components/marketplace/marketplace-badge.tsx`
- Create: `apps/web/components/marketplace/brand-identity-row.tsx`
- Create: `apps/web/components/marketplace/creator-identity-row.tsx`
- Create: `apps/web/components/marketplace/metadata-strip.tsx`
- Create: `apps/web/components/marketplace/media-grid.tsx`
- Create: `apps/web/components/marketplace/work-queue-item.tsx`
- Create: `apps/web/components/marketplace/campaign-feed-card.tsx`
- Create: `apps/web/components/marketplace/campaign-production-row.tsx`
- Create: `apps/web/components/marketplace/index.ts`

- [ ] **Step 1: Create the marketplace component directory**

Run:

```bash
mkdir -p apps/web/components/marketplace
```

Expected: directory exists.

- [ ] **Step 2: Create `marketplace-badge.tsx`**

Use this component as the only badge primitive for marketplace screens:

```tsx
import { cn } from "../../lib/utils";

export type MarketplaceBadgeTone = "money" | "content" | "status" | "urgent" | "neutral";

const toneClassName: Record<MarketplaceBadgeTone, string> = {
  money: "border-[#c6a061]/35 bg-[#c6a061]/12 text-[#f2d79e]",
  content: "border-white/12 bg-white/[0.045] text-stone-200",
  status: "border-[#c8f060]/24 bg-[#c8f060]/10 text-[#dff7a8]",
  urgent: "border-[#f2b36d]/30 bg-[#f2b36d]/10 text-[#ffd5a0]",
  neutral: "border-white/10 bg-white/[0.035] text-stone-300"
};

export function MarketplaceBadge({
  children,
  className,
  tone = "neutral"
}: {
  children: React.ReactNode;
  className?: string;
  tone?: MarketplaceBadgeTone;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium leading-none",
        toneClassName[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
```

- [ ] **Step 3: Create `brand-identity-row.tsx`**

```tsx
import { Globe2, MapPin } from "lucide-react";
import { cn } from "../../lib/utils";

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function BrandIdentityRow({
  avatarUrl,
  className,
  location,
  name,
  website
}: {
  avatarUrl?: string | null;
  className?: string;
  location?: string | null;
  name: string;
  website?: string | null;
}) {
  return (
    <div className={cn("flex min-w-0 items-center gap-3", className)}>
      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-[16px] border border-white/10 bg-[radial-gradient(circle_at_30%_20%,rgba(200,240,96,0.28),rgba(196,160,97,0.2),rgba(10,11,9,0.96))]">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt="" className="h-full w-full object-cover" src={avatarUrl} />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-[#f5efe6]">
            {getInitials(name)}
          </div>
        )}
      </div>
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold text-[#f5efe6]">{name}</div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-400">
          {location ? (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-[#c6a061]" />
              {location}
            </span>
          ) : null}
          {website ? (
            <span className="inline-flex min-w-0 items-center gap-1">
              <Globe2 className="h-3.5 w-3.5 text-[#c6a061]" />
              <span className="truncate">{website}</span>
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create `creator-identity-row.tsx`**

```tsx
import { MapPin } from "lucide-react";
import { cn } from "../../lib/utils";

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function CreatorIdentityRow({
  avatarUrl,
  className,
  handle,
  location,
  name
}: {
  avatarUrl?: string | null;
  className?: string;
  handle?: string | null;
  location?: string | null;
  name: string;
}) {
  const publicHandle = handle ? handle.replace(/^@/, "@") : "handle not added";

  return (
    <div className={cn("flex min-w-0 items-center gap-3", className)}>
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-white/10 bg-[radial-gradient(circle_at_30%_20%,rgba(200,240,96,0.28),rgba(196,160,97,0.18),rgba(10,11,9,0.96))]">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt="" className="h-full w-full object-cover" src={avatarUrl} />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-[#f5efe6]">
            {getInitials(name)}
          </div>
        )}
      </div>
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold text-[#f5efe6]">{name}</div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-400">
          <span>{publicHandle}</span>
          {location ? (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-[#c6a061]" />
              {location}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create `metadata-strip.tsx`**

```tsx
import { cn } from "../../lib/utils";

export type MetadataItem = {
  label: string;
  value: string;
};

export function MetadataStrip({
  className,
  items
}: {
  className?: string;
  items: MetadataItem[];
}) {
  return (
    <div
      className={cn(
        "grid gap-3 border-t border-white/8 pt-4 sm:grid-cols-3",
        className
      )}
    >
      {items.map((item) => (
        <div className="min-w-0" key={`${item.label}-${item.value}`}>
          <div className="truncate text-sm font-semibold text-[#f5efe6]">{item.value}</div>
          <div className="mt-1 text-[11px] uppercase tracking-[0.16em] text-stone-500">{item.label}</div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 6: Create `media-grid.tsx`**

```tsx
import { ImageIcon, Video } from "lucide-react";
import { cn } from "../../lib/utils";

export type MediaGridItem = {
  imageUrl?: string | null;
  label: string;
  type?: "image" | "video";
};

export function MediaGrid({
  className,
  items
}: {
  className?: string;
  items: MediaGridItem[];
}) {
  return (
    <div className={cn("grid grid-cols-2 gap-2", className)}>
      {items.map((item, index) => (
        <div
          className="group relative aspect-[4/5] overflow-hidden rounded-[22px] border border-white/10 bg-[linear-gradient(135deg,rgba(198,160,97,0.22),rgba(200,240,96,0.08),rgba(9,10,8,0.98))]"
          key={`${item.label}-${index}`}
        >
          {item.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt="" className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" src={item.imageUrl} />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[#d7c2a0]">
              {item.type === "video" ? <Video className="h-7 w-7" /> : <ImageIcon className="h-7 w-7" />}
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
            <div className="truncate text-xs font-medium text-[#f5efe6]">{item.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 7: Create `work-queue-item.tsx`**

```tsx
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "../../lib/utils";

export function WorkQueueItem({
  actionHref,
  actionLabel,
  className,
  description,
  title
}: {
  actionHref?: string;
  actionLabel?: string;
  className?: string;
  description: string;
  title: string;
}) {
  return (
    <div className={cn("grid grid-cols-[42px_minmax(0,1fr)] gap-3 border-b border-white/8 py-4 last:border-b-0", className)}>
      <div className="mt-1 h-10 w-10 rounded-full border border-white/10 bg-white/[0.04]" />
      <div className="min-w-0">
        <div className="text-sm font-semibold text-[#f5efe6]">{title}</div>
        <p className="mt-1 text-sm leading-6 text-stone-400">{description}</p>
        {actionHref && actionLabel ? (
          <Link className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#d7c2a0]" href={actionHref}>
            {actionLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : null}
      </div>
    </div>
  );
}
```

- [ ] **Step 8: Create `campaign-feed-card.tsx`**

```tsx
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BrandIdentityRow } from "./brand-identity-row";
import { MarketplaceBadge } from "./marketplace-badge";
import { MetadataStrip, type MetadataItem } from "./metadata-strip";

export type CampaignFeedCardProps = {
  applyHref?: string;
  brandAvatarUrl?: string | null;
  brandLocation?: string | null;
  brandName: string;
  brandWebsite?: string | null;
  compensationLabel: string;
  compensationValue: string;
  contentTypeLabel: string;
  detailHref: string;
  metadata: MetadataItem[];
  platformLabel: string;
  summary: string;
  title: string;
  urgencyLabel?: string;
};

export function CampaignFeedCard({
  applyHref,
  brandAvatarUrl,
  brandLocation,
  brandName,
  brandWebsite,
  compensationLabel,
  compensationValue,
  contentTypeLabel,
  detailHref,
  metadata,
  platformLabel,
  summary,
  title,
  urgencyLabel
}: CampaignFeedCardProps) {
  return (
    <article className="rounded-[28px] border border-white/10 bg-white/[0.045] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.22)] transition duration-300 hover:-translate-y-0.5 hover:border-white/16 hover:bg-white/[0.06] sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <BrandIdentityRow avatarUrl={brandAvatarUrl} location={brandLocation} name={brandName} website={brandWebsite} />
        {urgencyLabel ? <MarketplaceBadge tone="urgent">{urgencyLabel}</MarketplaceBadge> : null}
      </div>
      <h3 className="mt-4 max-w-2xl text-2xl font-semibold leading-tight tracking-[-0.04em] text-[#f5efe6]">
        {title}
      </h3>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-300">{summary}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <MarketplaceBadge tone="money">{compensationLabel}</MarketplaceBadge>
        <MarketplaceBadge tone="money">{compensationValue}</MarketplaceBadge>
        <MarketplaceBadge tone="content">{contentTypeLabel}</MarketplaceBadge>
        <MarketplaceBadge tone="content">{platformLabel}</MarketplaceBadge>
      </div>
      <MetadataStrip className="mt-4" items={metadata} />
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {applyHref ? (
          <Link className="inline-flex items-center justify-center rounded-full bg-[#c6a061] px-5 py-3 text-sm font-semibold text-[#151108] transition hover:bg-[#d7b474]" href={applyHref}>
            Apply
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        ) : null}
        <Link className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.035] px-5 py-3 text-sm font-semibold text-[#f5efe6] transition hover:border-white/18 hover:bg-white/[0.055]" href={detailHref}>
          Details
        </Link>
      </div>
    </article>
  );
}
```

- [ ] **Step 9: Create `campaign-production-row.tsx`**

```tsx
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MarketplaceBadge } from "./marketplace-badge";

export function CampaignProductionRow({
  actionHref,
  actionLabel,
  compensationLabel,
  contentLabel,
  metrics,
  statusLabel,
  title
}: {
  actionHref: string;
  actionLabel: string;
  compensationLabel: string;
  contentLabel: string;
  metrics: string;
  statusLabel: string;
  title: string;
}) {
  return (
    <article className="grid gap-4 border-b border-white/8 py-5 last:border-b-0 lg:grid-cols-[minmax(0,1.4fr)_120px_120px_130px] lg:items-center">
      <div className="min-w-0">
        <h3 className="text-xl font-semibold leading-tight tracking-[-0.035em] text-[#f5efe6]">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-stone-400">{metrics}</p>
        <div className="mt-3 flex flex-wrap gap-2 lg:hidden">
          <MarketplaceBadge tone="money">{compensationLabel}</MarketplaceBadge>
          <MarketplaceBadge tone="content">{contentLabel}</MarketplaceBadge>
          <MarketplaceBadge tone="status">{statusLabel}</MarketplaceBadge>
        </div>
      </div>
      <div className="hidden lg:block">
        <MarketplaceBadge tone="money">{compensationLabel}</MarketplaceBadge>
      </div>
      <div className="hidden lg:block">
        <MarketplaceBadge tone="content">{contentLabel}</MarketplaceBadge>
      </div>
      <Link className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.035] px-4 py-2.5 text-sm font-semibold text-[#f5efe6] transition hover:border-white/18 hover:bg-white/[0.055]" href={actionHref}>
        {actionLabel}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Link>
    </article>
  );
}
```

- [ ] **Step 10: Create `index.ts`**

```ts
export * from "./brand-identity-row";
export * from "./campaign-feed-card";
export * from "./campaign-production-row";
export * from "./creator-identity-row";
export * from "./marketplace-badge";
export * from "./media-grid";
export * from "./metadata-strip";
export * from "./work-queue-item";
```

- [ ] **Step 11: Run typecheck**

Run:

```bash
npm run typecheck -w @budcast/web
```

Expected: command exits `0`.

- [ ] **Step 12: Commit shared components**

```bash
git add apps/web/components/marketplace
git commit -m "feat: add marketplace presentation components"
```

---

## Task 2: Creator Dashboard Feed-First Redesign

**Files:**

- Modify: `apps/web/app/creator-dashboard/page.tsx`
- Use: `apps/web/components/marketplace/*`

- [ ] **Step 1: Identify current campaign mapping**

Run:

```bash
rg "Campaign feed|Campaigns available|recommended|applications|payments|active" apps/web/app/creator-dashboard/page.tsx
```

Expected: locate current sections and card rendering.

- [ ] **Step 2: Import shared marketplace components**

Add these imports to `apps/web/app/creator-dashboard/page.tsx`:

```tsx
import {
  CampaignFeedCard,
  CreatorIdentityRow,
  MediaGrid,
  MetadataStrip,
  WorkQueueItem
} from "../../components/marketplace";
```

Keep existing shared formatter imports for compensation labels and dates.

- [ ] **Step 3: Replace the oversized dashboard hero with compact creator profile header**

The top card should render:

```tsx
<section className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,20,17,0.88),rgba(8,9,7,0.92))] p-4 shadow-[0_28px_80px_rgba(0,0,0,0.36)] sm:p-5 md:p-6">
  <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
    <div>
      <CreatorIdentityRow
        avatarUrl={profile?.avatar_url}
        handle={profile?.instagram || profile?.tiktok || profile?.youtube}
        location={profile?.location}
        name={profile?.name || "Creator"}
      />
      <h1 className="mt-5 max-w-2xl font-display text-4xl leading-[0.92] tracking-[-0.055em] text-[#f5efe6] sm:text-5xl">
        Find paid content work.
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-7 text-stone-300">
        Browse cannabis campaigns, apply from your phone, submit content, and track payment or product status.
      </p>
    </div>
    <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
      <div className="text-[11px] uppercase tracking-[0.22em] text-[#c6a061]">Work queue</div>
      <WorkQueueItem title="Campaigns needing submission" description="Content due after accepted assignments." />
      <WorkQueueItem title="Payments pending" description="Track cash and product confirmation from accepted campaigns." />
    </div>
  </div>
</section>
```

- [ ] **Step 4: Convert available campaigns to `CampaignFeedCard`**

For each available campaign, map existing data into the feed card:

```tsx
<CampaignFeedCard
  applyHref={`/campaigns/${campaign.id}`}
  brandAvatarUrl={campaign.brand?.avatar_url}
  brandLocation={campaign.location}
  brandName={campaign.brand?.company_name || campaign.brand?.name || "Cannabis brand"}
  brandWebsite={campaign.brand?.website}
  compensationLabel={getCompensationLabel(campaign.campaign_type)}
  compensationValue={getCompensationValue(campaign)}
  contentTypeLabel={campaign.content_types?.[0]?.replaceAll("_", " ") || "UGC Video"}
  detailHref={`/campaigns/${campaign.id}`}
  metadata={[
    { label: "Deadline", value: formatDeadline(campaign.application_deadline) },
    { label: "Spots", value: `${campaign.slots_available ?? 0} open` },
    { label: "Location", value: campaign.location || "Remote" }
  ]}
  platformLabel={campaign.content_types?.[0]?.includes("tiktok") ? "TikTok" : "Instagram"}
  summary={campaign.short_description || campaign.description || "Create cannabis content for this brand campaign."}
  title={campaign.title}
  urgencyLabel={campaign.pending_applications > 4 ? "Filling fast" : "New"}
/>
```

Adjust property names only where the existing hook shape differs.

- [ ] **Step 5: Rename dashboard sections**

Use these visible section labels:

```tsx
Campaign feed
Active assignments
Submissions
Payment & product status
Applications
```

Remove visible text:

```text
Workspace
Control panel
Overview
Product-led
Gifting
Hybrid
```

- [ ] **Step 6: Run creator dashboard QA commands**

```bash
npm run typecheck -w @budcast/web
npm run build:web
git diff --check
```

Expected: all commands exit `0`.

- [ ] **Step 7: Browser QA creator dashboard**

Start dev server if not running:

```bash
npm run dev -w @budcast/web -- --port 3010
```

Open:

```text
http://localhost:3010/creator-dashboard
```

Expected:

- Campaign feed is the dominant surface.
- Apply CTA appears early on mobile.
- No excessive pill clusters.
- No public UI shows `Gifting`, `Hybrid`, `Product-led`, `Free product`, `Unpaid`, or `Control panel`.

- [ ] **Step 8: Commit creator dashboard**

```bash
git add apps/web/app/creator-dashboard/page.tsx
git commit -m "feat: redesign creator dashboard as campaign feed"
```

---

## Task 3: Creator And Brand Profile Redesign

**Files:**

- Modify: `apps/web/app/profile/page.tsx`
- Use: `apps/web/components/marketplace/*`

- [ ] **Step 1: Split profile rendering by role inside the existing file**

Keep the existing auth redirects. Inside the authenticated return, keep role branching:

```tsx
return isCreator ? (
  <CreatorProfileView profile={profile} signOut={signOut} />
) : (
  <BrandProfileView profile={profile} signOut={signOut} />
);
```

Define `CreatorProfileView` and `BrandProfileView` in the same file first. Do not create extra files until the design stabilizes.

- [ ] **Step 2: Build creator profile storefront**

Creator profile top structure:

```tsx
<main className="grid-overlay min-h-screen px-4 py-5 sm:px-6 md:px-10">
  <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
    <section className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,20,17,0.9),rgba(8,9,7,0.94))] p-5 md:p-7">
      <CreatorIdentityRow
        avatarUrl={profile?.avatar_url}
        handle={profile?.instagram || profile?.tiktok || profile?.youtube}
        location={profile?.location}
        name={profile?.name || "Creator"}
      />
      <h1 className="mt-6 font-display text-5xl leading-[0.92] tracking-[-0.055em] text-[#f5efe6]">
        Creator profile
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-300">
        This is the profile cannabis brands see when reviewing your campaign applications.
      </p>
      <MediaGrid
        className="mt-6"
        items={[
          { imageUrl: profile?.portfolio_image_urls?.[0], label: "Product review reel", type: "video" },
          { imageUrl: profile?.portfolio_image_urls?.[1], label: "Lifestyle product demo", type: "video" },
          { imageUrl: profile?.portfolio_image_urls?.[2], label: "Creator proof clip", type: "video" },
          { imageUrl: profile?.portfolio_image_urls?.[3], label: "Portfolio slot", type: "image" }
        ]}
      />
    </section>
  </div>
</main>
```

- [ ] **Step 3: Build brand profile trust surface**

Brand profile top structure:

```tsx
<section className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,20,17,0.9),rgba(8,9,7,0.94))] p-5 md:p-7">
  <BrandIdentityRow
    avatarUrl={profile?.avatar_url}
    location={profile?.location}
    name={profile?.company_name || profile?.name || "Cannabis brand"}
    website={profile?.website}
  />
  <h1 className="mt-6 font-display text-5xl leading-[0.92] tracking-[-0.055em] text-[#f5efe6]">
    Brand profile
  </h1>
  <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-300">
    This is the profile creators see when deciding whether to apply to your campaigns.
  </p>
</section>
```

- [ ] **Step 4: Replace pill-heavy profile details with rows**

Use `MetadataStrip` for profile proof:

```tsx
<MetadataStrip
  items={[
    { label: "Location", value: profile?.location || "Not added" },
    { label: "Website", value: profile?.website || "Not added" },
    { label: "Status", value: profile?.account_status === "active" ? "Active" : "Needs review" }
  ]}
/>
```

- [ ] **Step 5: Run profile QA commands**

```bash
npm run typecheck -w @budcast/web
npm run build:web
git diff --check
```

Expected: all commands exit `0`.

- [ ] **Step 6: Browser QA profile**

Open:

```text
http://localhost:3010/profile
```

Expected:

- Creator profile feels portfolio-first.
- Brand profile feels creator-facing and trustworthy.
- Profile no longer appears as stacked settings cards.
- Pill usage is restrained.

- [ ] **Step 7: Commit profile redesign**

```bash
git add apps/web/app/profile/page.tsx
git commit -m "feat: redesign profiles as marketplace storefronts"
```

---

## Task 4: Brand Workspace Shell Declutter

**Files:**

- Modify: `apps/web/components/brand-workspace-shell.tsx`

- [ ] **Step 1: Remove boxed sidebar card nesting**

Replace the large `LacquerSurface` wrapper around the entire sidebar with a simpler sticky column:

```tsx
<aside className="xl:sticky xl:top-6 xl:self-start">
  <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,20,17,0.9),rgba(8,9,7,0.94))] p-4 shadow-[0_28px_80px_rgba(0,0,0,0.34)]">
    ...
  </div>
</aside>
```

- [ ] **Step 2: Simplify brand intro**

Use one identity block and one status line:

```tsx
<div className="flex items-center gap-3">
  <BudCastLogo href="/" size="sm" variant="mark" />
  <div className="min-w-0">
    <div className="truncate text-sm font-semibold text-[#f5efe6]">BudCast</div>
    <div className="mt-1 text-[10px] uppercase tracking-[0.22em] text-stone-500">Brand portal</div>
  </div>
</div>
<div className="mt-6 font-display text-3xl leading-tight tracking-[-0.04em] text-[#f5efe6]">
  {profile?.company_name || profile?.name || "Cannabis brand"}
</div>
<p className="mt-3 text-sm leading-6 text-stone-400">
  Post briefs, review creators, approve content, and track payment or product status.
</p>
```

- [ ] **Step 3: Convert nav items to quiet rows**

Replace rounded card links with quieter row links:

```tsx
<Link
  className={`group flex items-center justify-between border-b border-white/8 py-4 transition last:border-b-0 ${
    active ? "text-[#f5efe6]" : "text-stone-400 hover:text-[#f5efe6]"
  }`}
  href={item.href}
>
  <span className="flex items-center gap-3">
    <Icon className={active ? "h-4 w-4 text-[#d7c2a0]" : "h-4 w-4 text-stone-500"} />
    <span className="text-sm font-medium">{item.label}</span>
  </span>
  <ArrowUpRight className="h-4 w-4 text-stone-600 transition group-hover:text-stone-300" />
</Link>
```

- [ ] **Step 4: Keep account stats but remove panel boxes**

Replace the `SmokedPanel` account section with a simple inline row:

```tsx
<div className="mt-6 grid grid-cols-2 gap-3 border-y border-white/8 py-4">
  <div>
    <div className="text-[10px] uppercase tracking-[0.2em] text-stone-500">Credits</div>
    <div className="mt-1 text-lg font-semibold text-[#f5efe6]">{profile?.credits_balance ?? 0}</div>
  </div>
  <div>
    <div className="text-[10px] uppercase tracking-[0.2em] text-stone-500">Tier</div>
    <div className="mt-1 text-lg font-semibold capitalize text-[#f5efe6]">{profile?.tier || "free"}</div>
  </div>
</div>
```

- [ ] **Step 5: Run shell QA commands**

```bash
npm run typecheck -w @budcast/web
npm run build:web
git diff --check
```

Expected: all commands exit `0`.

- [ ] **Step 6: Commit shell declutter**

```bash
git add apps/web/components/brand-workspace-shell.tsx
git commit -m "refactor: simplify brand workspace navigation"
```

---

## Task 5: Brand Dashboard Campaign Production Redesign

**Files:**

- Modify: `apps/web/app/dashboard/page.tsx`
- Use: `apps/web/components/marketplace/campaign-production-row.tsx`
- Use: `apps/web/components/marketplace/work-queue-item.tsx`

- [ ] **Step 1: Replace dashboard headline copy**

Use:

```tsx
<Eyebrow>Campaign production</Eyebrow>
<h1 className="mt-3 font-display text-5xl leading-[0.92] tracking-[-0.055em] text-[#f5efe6] md:text-6xl">
  Campaign control
</h1>
<p className="mt-4 max-w-2xl text-base leading-8 text-stone-300">
  Post campaigns, review creators, approve content, and track paid or product-based campaign status.
</p>
```

- [ ] **Step 2: Replace top action cards with queue rows**

Use `WorkQueueItem`:

```tsx
<section className="rounded-[32px] border border-white/10 bg-white/[0.04] p-5 md:p-6">
  <Eyebrow>What needs attention</Eyebrow>
  <WorkQueueItem
    actionHref="/dashboard/campaigns/new"
    actionLabel="Post campaign"
    description="Launch a new creator brief for paid, product, or paid + product work."
    title={`${campaigns.length} campaigns live`}
  />
  <WorkQueueItem
    actionHref="/dashboard"
    actionLabel="Review applicants"
    description="Accept creators and move them into content submission."
    title={`${pendingApplicants} applicants waiting`}
  />
  <WorkQueueItem
    actionHref="/dashboard/submissions"
    actionLabel="Approve content"
    description="Review submitted content links and request revisions when needed."
    title={`${contentAwaitingApproval} submissions awaiting approval`}
  />
</section>
```

- [ ] **Step 3: Convert live campaign cards to production rows**

Map `priorityCampaigns` to `CampaignProductionRow`:

```tsx
<CampaignProductionRow
  actionHref={getCampaignNextAction(campaign, stats).href}
  actionLabel={getCampaignNextAction(campaign, stats).label}
  compensationLabel={getCompensationLabel(campaign.campaign_type)}
  contentLabel={campaign.content_types?.[0]?.replaceAll("_", " ") || "UGC video"}
  metrics={`${campaign.pending_applications} applicants · ${stats.acceptedCreators} accepted · ${stats.submissions} submitted`}
  statusLabel={campaign.status || "Live"}
  title={campaign.title}
/>
```

- [ ] **Step 4: Remove redundant instructional boxes**

Delete or compress sections that explain what to do in long paragraphs. Replace with one short line per queue item.

- [ ] **Step 5: Run dashboard QA commands**

```bash
npm run typecheck -w @budcast/web
npm run build:web
git diff --check
```

Expected: all commands exit `0`.

- [ ] **Step 6: Browser QA brand dashboard**

Open:

```text
http://localhost:3010/dashboard
```

Expected:

- Brand dashboard reads as campaign production.
- Campaigns are rows/queues, not stacked SaaS cards.
- Main actions are obvious: post campaign, review applicants, approve content.

- [ ] **Step 7: Commit brand dashboard**

```bash
git add apps/web/app/dashboard/page.tsx
git commit -m "feat: redesign brand dashboard as campaign production"
```

---

## Task 6: Campaign Builder Editorial Redesign

**Files:**

- Modify: `apps/web/app/dashboard/campaigns/new/page.tsx`

- [ ] **Step 1: Reduce category chip visual weight**

Change `ToggleChip` inactive state from pill-heavy to quiet selectable text:

```tsx
className={`rounded-full px-3 py-1.5 text-sm transition duration-300 ${
  active
    ? "border border-[#c6a061]/40 bg-[#c6a061]/14 text-[#f5efe6]"
    : "border border-white/8 bg-transparent text-stone-400 hover:border-white/14 hover:text-stone-200"
}`}
```

- [ ] **Step 2: Convert step navigation from boxed cards to editorial list**

Change `StepChip` base class:

```tsx
className={`flex w-full items-center justify-between border-b border-white/8 py-4 text-left transition last:border-b-0 ${tone}`}
```

Change tone values to avoid heavy background boxes:

```tsx
const tone =
  status === "complete"
    ? "text-emerald-100"
    : status === "error"
      ? "text-red-100"
      : active
        ? "text-[#f5efe6]"
        : "text-stone-400 hover:text-stone-200";
```

- [ ] **Step 3: Improve builder headline**

Use:

```tsx
<Eyebrow>Campaign brief</Eyebrow>
<h1 className="mt-3 font-display text-5xl leading-[0.92] tracking-[-0.055em] text-[#f5efe6] md:text-6xl">
  Build a creator campaign.
</h1>
<p className="mt-4 max-w-2xl text-base leading-8 text-stone-300">
  Write the brief creators will use to decide if the campaign fits their style, audience, and workflow.
</p>
```

- [ ] **Step 4: Simplify live preview**

Keep only high-signal preview sections:

```tsx
Compensation
Deliverables
Deadline
Guidelines
Credits
```

Remove duplicate decorative labels that do not help the brand publish.

- [ ] **Step 5: Run builder QA commands**

```bash
npm run typecheck -w @budcast/web
npm run build:web
git diff --check
```

Expected: all commands exit `0`.

- [ ] **Step 6: Browser QA campaign builder**

Open:

```text
http://localhost:3010/dashboard/campaigns/new
```

Expected:

- Builder feels like writing a premium campaign brief.
- Category selections do not dominate the page.
- Live preview is useful and not cluttered.

- [ ] **Step 7: Commit builder redesign**

```bash
git add apps/web/app/dashboard/campaigns/new/page.tsx
git commit -m "feat: redesign campaign builder as editorial brief flow"
```

---

## Task 7: Detail, Applicant, And Submission Review Cleanup

**Files:**

- Modify: `apps/web/app/campaigns/[id]/page.tsx`
- Modify: `apps/web/app/dashboard/campaigns/[id]/applicants/page.tsx`
- Modify: `apps/web/app/dashboard/submissions/page.tsx`

- [ ] **Step 1: Align creator campaign detail with feed language**

In `apps/web/app/campaigns/[id]/page.tsx`, make the first visible content answer:

```text
What is the campaign?
Who is the brand?
What do I create?
What do I receive?
When is it due?
What happens after I apply?
```

Use `BrandIdentityRow`, `MarketplaceBadge`, and `MetadataStrip`.

- [ ] **Step 2: Align applicant review with creator identity**

In `apps/web/app/dashboard/campaigns/[id]/applicants/page.tsx`, use `CreatorIdentityRow` for every applicant card and show:

```text
Pitch
Niches
Connected socials
Profile strength
Previous work section
Accept creator
Decline
View profile
```

- [ ] **Step 3: Align submission review with production workflow**

In `apps/web/app/dashboard/submissions/page.tsx`, make submission rows show:

```text
Creator
Campaign
Deliverable link
Status
Revision notes
Approve
Request revision
Payment/product status
```

Use `WorkQueueItem` for high-level queues and `MarketplaceBadge` for statuses.

- [ ] **Step 4: Run review surface QA commands**

```bash
npm run typecheck -w @budcast/web
npm run build:web
git diff --check
```

Expected: all commands exit `0`.

- [ ] **Step 5: Browser QA review routes**

Open:

```text
http://localhost:3010/campaigns/[id]
http://localhost:3010/dashboard/campaigns/[id]/applicants
http://localhost:3010/dashboard/submissions
```

Expected:

- Campaign detail is easy for creators to evaluate.
- Applicant review is easy for brands to scan.
- Submission review feels like production workflow, not static summaries.

- [ ] **Step 6: Commit review surfaces**

```bash
git add apps/web/app/campaigns/[id]/page.tsx apps/web/app/dashboard/campaigns/[id]/applicants/page.tsx apps/web/app/dashboard/submissions/page.tsx
git commit -m "feat: align review flows with creator feed system"
```

---

## Task 8: Final Responsive And Terminology QA

**Files:**

- Inspect all modified route files.
- Modify only files with QA defects.

- [ ] **Step 1: Run banned terminology scan**

Run:

```bash
rg -n "Gifting|Hybrid|Product-led|Free product|Unpaid|Control panel|Workspace|Operations|Overview" apps/web/app apps/web/components
```

Expected: no user-facing marketplace copy uses these terms. Internal comments or code identifiers can remain only if not rendered.

- [ ] **Step 2: Run full verification**

```bash
npm run typecheck -w @budcast/web
npm run build:web
git diff --check
```

Expected: all commands exit `0`.

- [ ] **Step 3: Browser QA desktop widths**

Check these routes around `1440px` desktop width:

```text
http://localhost:3010/
http://localhost:3010/creator-dashboard
http://localhost:3010/profile
http://localhost:3010/dashboard
http://localhost:3010/dashboard/campaigns/new
```

Expected:

- No cramped text columns.
- No excessive pill clusters.
- Clear primary action per surface.
- BudCast logo remains unchanged.

- [ ] **Step 4: Browser QA mobile widths**

Check these routes around phone width:

```text
http://localhost:3010/
http://localhost:3010/creator-dashboard
http://localhost:3010/profile
http://localhost:3010/campaigns/[id]
```

Expected:

- Creator feed appears before low-priority details.
- Apply actions are visible early.
- Cards do not overflow.
- Body text remains readable.

- [ ] **Step 5: Final commit**

```bash
git add apps/web/app apps/web/components packages/shared/src docs/superpowers/specs docs/superpowers/plans
git commit -m "feat: implement BudCast Creator Feed OS redesign"
```

## Plan Self-Review

- Spec coverage: shared components, creator dashboard, creator profile, brand dashboard, brand profile, campaign builder, campaign detail, applicant review, submission review, responsive QA, and terminology QA are all covered.
- Backend safety: no step changes Supabase schema, RPCs, RLS policies, or external services.
- Type consistency: shared components use plain string props and existing route data mapping to avoid backend coupling.
- Scope control: implementation is phased so the app remains runnable and reviewable after each task.
- Visual quality: tasks directly reduce nested cards/pills and move toward premium feed/production patterns.
