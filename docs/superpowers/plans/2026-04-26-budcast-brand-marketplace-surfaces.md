# BudCast Brand Marketplace Surfaces Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the brand side of BudCast into a marketplace-native system where brands operate campaigns and creators can discover, evaluate, and trust brand profiles.

**Architecture:** Keep the Supabase backend locked. Add frontend-only presentation routes and shared helpers that reuse existing `users`, `opportunities`, applications, and submissions data. Unsupported marketplace trust details render as clear placeholders and never imply new production logic.

**Tech Stack:** Next.js App Router, React, TypeScript strict mode, Tailwind utility styling, `@tanstack/react-query`, Supabase client hooks in `packages/shared`, existing BudCast dark premium UI components.

---

## File Structure

**Create**
- `packages/shared/src/hooks/useBrands.ts`: fetch public brand directory rows from `users` where `user_type = "brand"`.
- `packages/shared/src/hooks/useBrandProfile.ts`: fetch one public brand profile by id plus active campaigns for that brand.
- `apps/web/app/brands/page.tsx`: creator-facing brand directory.
- `apps/web/app/brands/[id]/page.tsx`: public creator-facing brand profile.

**Modify**
- `packages/shared/src/index.ts`: export the two new hooks.
- `apps/web/app/dashboard/page.tsx`: sharpen brand dashboard into an action-first campaign command center with brand profile strength.
- `apps/web/app/profile/page.tsx`: split creator and brand profile presentation so brand users see a brand profile studio, not creator proof sections.
- `apps/web/app/campaigns/[id]/page.tsx`: link brand identity card to `/brands/[brandId]`.
- `apps/web/app/creator-dashboard/page.tsx`: make campaign card brand names link to `/brands/[brandId]`.
- `apps/web/components/brand-workspace-shell.tsx`: add visible route context for `Brand profile` and keep terminology marketplace-first.

**Verification**
- `npm run typecheck -w @budcast/web`
- `npm run build:web`
- `git diff --check`
- Browser check `/dashboard`, `/profile`, `/brands`, `/brands/[id]`, `/creator-dashboard`, `/campaigns/[id]`.

---

### Task 1: Shared Brand Directory Data

**Files:**
- Create: `packages/shared/src/hooks/useBrands.ts`
- Create: `packages/shared/src/hooks/useBrandProfile.ts`
- Modify: `packages/shared/src/index.ts`

- [ ] **Step 1: Create public brand directory hook**

Create `packages/shared/src/hooks/useBrands.ts` with a focused directory row type:

```ts
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import type { Badge, User } from "../types/database";

export type BrandDirectoryRow = Pick<
  User,
  | "id"
  | "company_name"
  | "name"
  | "bio"
  | "location"
  | "avatar_url"
  | "website"
  | "badges"
  | "payment_rate"
  | "review_score"
  | "review_count"
  | "total_campaigns"
  | "successful_campaigns"
  | "account_status"
> & {
  badges: Badge[];
};

export function useBrands() {
  return useQuery<BrandDirectoryRow[]>({
    queryKey: ["brands"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("users")
        .select(
          "id, company_name, name, bio, location, avatar_url, website, badges, payment_rate, review_score, review_count, total_campaigns, successful_campaigns, account_status"
        )
        .eq("user_type", "brand")
        .order("total_campaigns", { ascending: false, nullsFirst: false });

      if (error) throw error;
      return (data ?? []) as BrandDirectoryRow[];
    },
    staleTime: 30_000
  });
}
```

- [ ] **Step 2: Create public brand profile hook**

Create `packages/shared/src/hooks/useBrandProfile.ts`:

```ts
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import type { CampaignCatalogRow } from "./useCampaigns";
import type { BrandDirectoryRow } from "./useBrands";

export type BrandProfileResult = {
  brand: BrandDirectoryRow;
  campaigns: CampaignCatalogRow[];
};

export function useBrandProfile(brandId: string | null | undefined) {
  return useQuery<BrandProfileResult | null>({
    queryKey: ["brand-profile", brandId],
    enabled: Boolean(brandId),
    queryFn: async () => {
      const { data: brand, error: brandError } = await supabase
        .from("users")
        .select(
          "id, company_name, name, bio, location, avatar_url, website, badges, payment_rate, review_score, review_count, total_campaigns, successful_campaigns, account_status"
        )
        .eq("id", brandId!)
        .eq("user_type", "brand")
        .maybeSingle();

      if (brandError) throw brandError;
      if (!brand) return null;

      const { data: campaigns, error: campaignError } = await supabase
        .from("opportunities")
        .select(
          `
          *,
          brand:users!opportunities_brand_id_fkey (
            id,
            company_name,
            badges,
            payment_rate,
            review_score,
            review_count,
            avatar_url
          )
        `
        )
        .eq("brand_id", brandId!)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (campaignError) throw campaignError;

      return {
        brand: brand as BrandDirectoryRow,
        campaigns: (campaigns ?? []) as CampaignCatalogRow[]
      };
    },
    staleTime: 30_000
  });
}
```

- [ ] **Step 3: Export hooks**

Add these exports to `packages/shared/src/index.ts`:

```ts
export * from "./hooks/useBrandProfile";
export * from "./hooks/useBrands";
```

- [ ] **Step 4: Verify shared code**

Run:

```bash
npm run typecheck -w @budcast/web
```

Expected: `tsc --noEmit` exits successfully.

---

### Task 2: Brand Directory

**Files:**
- Create: `apps/web/app/brands/page.tsx`

- [ ] **Step 1: Build `/brands` directory page**

Create `apps/web/app/brands/page.tsx` as a client component using `useBrands`. The page must:
- Use `ProductBrandBar` with CTA back to `/creator-dashboard`.
- Show title `Brand directory`.
- Explain: `Explore cannabis brands running creator campaigns on BudCast.`
- Render brand cards with avatar, company name, location, bio, campaign history, review score, website indicator, and CTA `View brand`.
- Show empty state: `No brands are available yet.`

Implementation skeleton:

```tsx
"use client";

import Link from "next/link";
import { formatCompact, useBrands } from "@budcast/shared";
import { ArrowRight, Globe2, MapPin, ShieldCheck } from "lucide-react";
import { ProductBrandBar } from "../../components/product-brand-bar";
import { Button } from "../../components/ui/button";
import { Eyebrow } from "../../components/ui/eyebrow";
import { LacquerSurface, SmokedPanel } from "../../components/ui/surface-tone";

function initials(name?: string | null) {
  return (name || "BC").split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
}

export default function BrandsPage() {
  const brands = useBrands();

  return (
    <main className="grid-overlay min-h-screen bg-[#080a08] px-5 py-8 text-stone-100 md:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <ProductBrandBar ctaHref="/creator-dashboard" ctaLabel="Campaign feed" logoSize="lg" />
        <LacquerSurface className="p-6 md:p-8">
          <Eyebrow className="text-[#b59663]">Brand discovery</Eyebrow>
          <h1 className="mt-3 font-display text-5xl text-[#f5efe6] md:text-6xl">Brand directory</h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-stone-300">
            Explore cannabis brands running creator campaigns on BudCast.
          </p>
        </LacquerSurface>
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(brands.data ?? []).map((brand) => {
            const displayName = brand.company_name || brand.name || "Cannabis brand";
            return (
              <SmokedPanel className="p-5" key={brand.id}>
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-black/30 text-sm font-semibold text-[#d7c2a0]">
                    {brand.avatar_url ? <img alt="" className="h-full w-full object-cover" src={brand.avatar_url} /> : initials(displayName)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl font-semibold text-[#f5efe6]">{displayName}</h2>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-stone-400">
                      <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{brand.location || "Location not listed"}</span>
                      {brand.website ? <span className="inline-flex items-center gap-1"><Globe2 className="h-3.5 w-3.5" />Website</span> : null}
                    </div>
                  </div>
                </div>
                <p className="mt-4 line-clamp-3 text-sm leading-6 text-stone-300">
                  {brand.bio || "Brand profile details are being built out."}
                </p>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-[16px] border border-white/8 bg-black/20 p-3"><div className="text-lg font-semibold text-[#f5efe6]">{formatCompact(brand.total_campaigns)}</div><div className="text-[10px] uppercase tracking-[0.18em] text-stone-500">Campaigns</div></div>
                  <div className="rounded-[16px] border border-white/8 bg-black/20 p-3"><div className="text-lg font-semibold text-[#f5efe6]">{brand.review_score ?? "—"}</div><div className="text-[10px] uppercase tracking-[0.18em] text-stone-500">Rating</div></div>
                  <div className="rounded-[16px] border border-white/8 bg-black/20 p-3"><div className="text-lg font-semibold text-[#f5efe6]">{brand.payment_rate ?? "—"}</div><div className="text-[10px] uppercase tracking-[0.18em] text-stone-500">Payment</div></div>
                </div>
                <Button asChild className="mt-5 w-full" variant="secondary">
                  <Link href={`/brands/${brand.id}`}>View brand <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </SmokedPanel>
            );
          })}
          {!brands.isLoading && !brands.data?.length ? (
            <SmokedPanel className="p-8 text-center md:col-span-2 xl:col-span-3">
              <ShieldCheck className="mx-auto h-8 w-8 text-[#d7c2a0]" />
              <p className="mt-4 text-lg font-semibold text-[#f5efe6]">No brands are available yet.</p>
            </SmokedPanel>
          ) : null}
        </section>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Verify route compiles**

Run:

```bash
npm run typecheck -w @budcast/web
```

Expected: no TypeScript errors.

---

### Task 3: Public Brand Profile

**Files:**
- Create: `apps/web/app/brands/[id]/page.tsx`

- [ ] **Step 1: Build `/brands/[id]` page**

Create a client component using `useBrandProfile(params.id)`. The page must:
- Show public brand identity: avatar, company name, location, bio, website.
- Show trust stack: profile status, review score, payment rate, completed campaigns.
- Show `Active campaigns` as campaign cards linking to `/campaigns/[id]`.
- Show placeholders for unsupported trust data: `License details not stored yet`, `Shipping status is confirmed inside campaign workflow`, `Creator payment proof is tracked after approval`.

- [ ] **Step 2: Use marketplace labels**

Campaign cards must use:
- `getCompensationLabel(campaign)`
- `getCompensationValue(campaign)`
- `getPrimaryContentType(campaign)`
- `getPlatformTarget(campaign)`
- `formatDeadline(campaign.application_deadline)`

No user-facing `Gifting`, `Hybrid`, `Free product`, or `Unpaid`.

- [ ] **Step 3: Verify route with seeded brand id**

Use the seeded campaign brand id from `/creator-dashboard` or known seed data and browser-check:

```text
http://localhost:3010/brands/<brand-id>
```

Expected: brand profile renders, active campaign cards link to creator campaign detail, no 404.

---

### Task 4: Link Campaigns To Brand Profiles

**Files:**
- Modify: `apps/web/app/campaigns/[id]/page.tsx`
- Modify: `apps/web/app/creator-dashboard/page.tsx`

- [ ] **Step 1: Link brand identity on campaign detail**

In `apps/web/app/campaigns/[id]/page.tsx`, wrap the brand name/identity CTA area with:

```tsx
{detail.brand?.id ? (
  <Button asChild className="mt-4" variant="secondary">
    <Link href={`/brands/${detail.brand.id}`}>View brand profile</Link>
  </Button>
) : null}
```

- [ ] **Step 2: Link brand names in creator campaign feed**

In `apps/web/app/creator-dashboard/page.tsx`, change campaign card brand name display from plain text to a link when `campaign.brand?.id` exists:

```tsx
{campaign.brand?.id ? (
  <Link className="transition hover:text-[#f5efe6]" href={`/brands/${campaign.brand.id}`}>
    {campaign.brand?.company_name ?? "Cannabis brand"}
  </Link>
) : (
  campaign.brand?.company_name ?? "Cannabis brand"
)}
```

- [ ] **Step 3: Verify navigation**

Browser-check:
- `/creator-dashboard` shows linked brand names.
- `/campaigns/[id]` shows `View brand profile`.
- Clicking either reaches `/brands/[id]`.

---

### Task 5: Brand Dashboard Command Center Refinement

**Files:**
- Modify: `apps/web/app/dashboard/page.tsx`

- [ ] **Step 1: Add brand profile preview card**

At the top of `/dashboard`, add a compact brand identity and profile strength module:
- Brand logo/avatar
- Company name
- Website
- Location
- Profile strength percentage
- CTA `Edit brand profile`
- CTA `View public profile`

Profile strength should be computed from existing fields only:

```ts
function getBrandProfileStrength(profile: ReturnType<typeof useAuth>["profile"]) {
  const checks = [
    Boolean(profile?.avatar_url),
    Boolean(profile?.company_name || profile?.name),
    Boolean(profile?.bio),
    Boolean(profile?.website),
    Boolean(profile?.location)
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}
```

- [ ] **Step 2: Reorder dashboard content**

Keep the page order:
1. Brand profile preview + campaign action queue.
2. Needs attention.
3. Live campaigns.
4. Applicants waiting.
5. Content approvals.
6. Payment & product confirmations.

- [ ] **Step 3: Tighten copy**

Use these labels:
- `Campaign control`
- `Needs attention`
- `Applicants waiting`
- `Content awaiting approval`
- `Payments/products pending`
- `Live campaigns`
- `Post campaign`
- `Review applicants`
- `Approve content`
- `Confirm payment/product`

Avoid:
- `Overview`
- `Workspace`
- `Manage`
- `Control panel`

- [ ] **Step 4: Verify with creator session**

If currently logged in as creator, `/dashboard` may redirect to `/creator-dashboard` or show brand-only gate. This is acceptable. Type/build verification must still pass.

---

### Task 6: Brand Profile Studio Refinement

**Files:**
- Modify: `apps/web/app/profile/page.tsx`

- [ ] **Step 1: Branch creator and brand profile views**

Keep the current creator profile studio for creators. For `profile.user_type === "brand"`, render brand-specific sections instead of creator portfolio/proof sections.

- [ ] **Step 2: Brand sections**

Brand profile studio must include:
- `Brand profile`
- `This is the profile creators see when evaluating your campaign opportunities.`
- Brand identity: logo/avatar, company name, location, website, public status.
- Active marketplace signals: total campaigns, successful campaigns, review score, payment rate.
- Brand story: bio and category/niche placeholders.
- Creator expectations: content style, review process, compliance language.
- Campaign trust: payment/product workflow note, approval workflow note, shipping/product placeholder.
- Profile strength with CTA `Edit profile`.

- [ ] **Step 3: Link to public brand page**

If `profile.id` exists, show:

```tsx
<Button asChild variant="secondary">
  <Link href={`/brands/${profile.id}`}>View public profile</Link>
</Button>
```

- [ ] **Step 4: Verify profile route**

Browser-check `/profile` for both:
- Creator account: creator profile studio still renders.
- Brand account or route-gated state: brand copy is present in code and typecheck passes.

---

### Task 7: Final Verification

**Files:**
- No new files.

- [ ] **Step 1: Run typecheck**

```bash
npm run typecheck -w @budcast/web
```

Expected: exits 0.

- [ ] **Step 2: Run production build**

```bash
npm run build:web
```

Expected: Next build exits 0 and lists `/brands` and `/brands/[id]`.

- [ ] **Step 3: Run whitespace diff check**

```bash
git diff --check
```

Expected: no output.

- [ ] **Step 4: Run terminology scan**

```bash
rg -n "Gifting|Gifted|Hybrid|Product-led|Free product|Unpaid|Control panel|Brand dashboard|View dashboard" apps/web/app/brands apps/web/app/dashboard apps/web/app/profile apps/web/app/campaigns apps/web/app/creator-dashboard apps/web/components/brand-workspace-shell.tsx
```

Expected: no output.

- [ ] **Step 5: Browser-check core flows**

Check these routes on desktop width:
- `/brands`
- `/brands/[seed-brand-id]`
- `/campaigns/[seed-campaign-id]`
- `/creator-dashboard`
- `/profile`
- `/dashboard`

Expected:
- No 404s.
- Brand directory renders.
- Brand profile renders.
- Campaign detail links to brand profile.
- Creator campaign feed links brand names to brand profile.
- Brand dashboard remains auth-aware and creator sessions do not see brand-only tooling.

---

## Self-Review

- Spec coverage: Covers brand dashboard, brand profile setup, creator brand discovery, campaign-to-brand linking, and backend-safe placeholder behavior.
- Placeholder scan: All unsupported fields are explicitly described as display placeholders, not future implementation gaps.
- Type consistency: New hook types use existing `User`, `Badge`, and `CampaignCatalogRow` types; route components consume existing marketplace helper names exported by `@budcast/shared`.
- Scope check: This is one cohesive frontend marketplace-surface pass. It does not include search filters, brand messaging, reviews, or backend schema changes.
