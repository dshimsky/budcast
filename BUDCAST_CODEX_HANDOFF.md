# BudCast — Codex Handoff Document

**Purpose:** You (Codex) are rebuilding the BudCast frontend from scratch. The data layer — Supabase schema, RPCs, TypeScript types — is **done, tested, and production-ready**. The hooks and stores are portable to most React-based frontend stacks with minor rewrites.

Your job, in order:

1. **Recommend a frontend stack** based on the product requirements in this doc
2. **Get the user's approval** on your recommendation before writing code
3. **Design and build the UI** once the stack is locked

**What you should read in addition to this doc:**
1. `budcastknowledgebasev3.pdf` — business model, campaign types, credit system, reputation formulas, content verification, go-to-market
2. `budcastdecisionlogv3.pdf` — 17 locked business decisions (payment strategy, review system, dispute resolution, etc.)

**What you should NOT read:**
- `components/` — scrap everything in here, you're rebuilding it
- `app/` — scrap every screen, you're rebuilding them
- `theme/` — scrap the token system, build your own
- Any previous design rationale, skill files, or `_PHASE_D_` docs — those reflect design choices that were scrapped

## Table of contents

1. [Stack decision — your first task](#stack-decision--your-first-task)
2. [Environment & config](#environment--config)
3. [Supabase schema](#supabase-schema)
4. [RPCs — the only way to mutate credits](#rpcs--the-only-way-to-mutate-credits)
5. [Row-level security policies](#row-level-security-policies)
6. [React Query hooks — the frontend data API](#react-query-hooks--the-frontend-data-api)
7. [Zustand stores](#zustand-stores)
8. [TypeScript types](#typescript-types)
9. [Auth + profile hydration pattern](#auth--profile-hydration-pattern)
10. [Routing expectations](#routing-expectations)
11. [Seed accounts + test data](#seed-accounts--test-data)
12. [Invariants you must preserve](#invariants-you-must-preserve)

---

## Stack decision — your first task

### Product requirements (non-negotiable)

Before choosing a stack, you must design against these:

1. **Cross-platform deployment.** The product ships on iOS App Store, Google Play Store, AND a responsive web app at `app.budcast.co`. All three are first-class. The web app is not an afterthought, and the native apps are not an afterthought.

2. **App Store presence matters for trust.** BudCast is a cannabis industry marketplace. Federal legal grayness means "we're in the App Store" is a credibility signal. App Store approval is a hard requirement by launch. This rules out any stack that can't ship a true native binary.

3. **B2B marketplace, not a social app.** Two primary personas:
   - **Brands** (cannabis companies) — desktop-heavy, creating campaigns, reviewing applicants, managing a dashboard. Their flows need to feel like a professional SaaS tool (think Linear, Notion, Stripe dashboard).
   - **Creators** (influencers) — mobile-heavy, browsing the "Free Store" catalog, applying to campaigns, submitting content. Their flows need to feel like a modern consumer app (think a cleaner Instagram or Depop).

4. **Premium design ceiling.** The founder has been through two design iterations that didn't land. The visual target is "Linear-grade" — dense, architectural, polished, not toy-like. Your stack choice must support this ceiling without constant fighting. If your chosen UI library makes premium aesthetics hard, that's a point against it.

5. **Data layer is locked.**
   - **Backend:** Supabase (Postgres + Auth + Realtime + Storage) — stays as-is
   - **Server state library:** `@tanstack/react-query` v5 — stays (works in every modern React stack)
   - **Client state library:** `zustand` — stays (works in every modern React stack)
   - **Language:** TypeScript strict mode — stays

   These are portable across essentially every React-based frontend. You're choosing what sits ON TOP of them.

6. **AI-first development.** The user will be building with you (Codex). Your stack recommendation must factor in **where your own training data is densest**. A stack where you ship high-quality output on the first try is worth more than a "theoretically optimal" stack where you hallucinate APIs.

### Constraints you should evaluate against

Rank and evaluate every option you consider against these axes:

| Axis | Weight | What "good" looks like |
|---|---|---|
| **True native iOS/Android capability** | Critical | Ships to App Store + Play Store, passes review, feels native not web-in-a-shell |
| **Web deployment quality** | Critical | Real responsive web app, not a mobile-app-squeezed-onto-desktop |
| **Premium design ceiling** | Critical | Can you realistically ship a Linear-grade UI? What's the best-in-class reference app built on this stack? |
| **AI code generation density** | High | Your own training data coverage. Be honest about this. |
| **Component library maturity** | High | Battle-tested primitives. Don't make the user fight their tooling for basic things like modals or toasts. |
| **Single codebase vs. multi-codebase** | Medium | One codebase is cheaper. Two codebases (e.g., Next.js web + RN native) is more work but can yield a higher ceiling on each surface. |
| **Learning curve for a solo technical founder** | Medium | The user knows React. Stack shouldn't require learning a new paradigm. |
| **Ecosystem momentum in 2026** | Medium | Is this stack gaining or losing developer mindshare? |

### Candidates to evaluate (at minimum)

You should evaluate these and can add others:

**Candidate A: Expo (React Native) + your choice of UI layer**
- Examples of UI layer: NativeWind + React Native Reusables, Tamagui, Gluestack UI v2, or vanilla
- Ships to iOS + Android via EAS Build, web via `react-native-web`
- **Pro:** one codebase, true native
- **Con:** web output is a compromise; design ceiling on native is lower than web-native stacks

**Candidate B: Next.js web + separate React Native native apps**
- Two codebases sharing the Supabase backend
- Next.js 15 + TypeScript + Tailwind + shadcn/ui for web; Expo + [UI layer] for native
- **Pro:** best-in-class web design ceiling, best-in-class native feel
- **Con:** maintenance cost of two frontends, duplicate feature work

**Candidate C: Next.js web + Capacitor wrapper for App Store**
- Single codebase (Next.js), wrapped in Capacitor for iOS/Android binaries
- **Pro:** one codebase, excellent web
- **Con:** Capacitor apps are "web-in-a-shell" — may fail App Store review for cannabis industry (scrutinized category), performance feels webby not native

**Candidate D: Flutter**
- True native + web, single codebase, different language (Dart)
- **Pro:** true native feel on mobile, Google-backed
- **Con:** forfeits the entire React/TypeScript ecosystem the user knows; AI code generation quality is lower than React stacks

**Candidate E: Your recommendation if different from above**
- Feel free to suggest something not listed if you have a strong case

### Required output format for your recommendation

Before you write a single line of code, produce a document in this shape:

```markdown
# BudCast Stack Recommendation

## My recommendation
[One sentence: "Expo + NativeWind + React Native Reusables" or whatever you land on]

## Candidates I evaluated
[Brief list, 1 line each]

## How I scored them
[Table: candidates × axes, score each 1-5 with a one-line reason]

## Why I picked the winner
[3-5 paragraphs]

## What the user loses by picking this
[Be honest about the tradeoffs. This is the section most AI recommendations skip.]

## Reference products built on this stack
[2-3 real apps the user can look at and say "yes I want it to feel like that"]

## Risk factors
[What could go wrong? Are there known bugs / gotchas / limitations?]

## What I need the user to confirm before I start
[Explicit list of questions. Don't start coding until these are answered.]
```

**Do not skip the "what the user loses" section.** Every stack has real costs. If you present an option as having no downsides, you're not being useful.

### Hard rules for your recommendation

- **Do not recommend a stack where you don't have strong training data.** If you'd be hallucinating APIs half the time, that's disqualifying, regardless of how "good" the stack is in theory.
- **Do not recommend "microservices" or a "BFF layer" or anything that fragments the backend.** The user has a working Supabase setup. Recommend a frontend that talks directly to it.
- **Do not recommend a stack that can't ship to the iOS App Store as a true native binary.** The user has explicitly said this is a hard requirement.
- **Do not fragment the design system across multiple libraries.** Pick one primary UI layer and commit. No "Tailwind for layout + MUI for components + Radix for modals" Frankenstein.
- **Prefer boring over novel.** BudCast is a business, not a tech demo. If Stack A is less hype but ships 2x faster, pick Stack A.

### Once the stack is approved

After the user confirms your recommendation, produce a second document:

```markdown
# BudCast Migration Plan

## What to keep from the existing /budcast-v6 codebase
[Specific file paths that port over cleanly: lib/supabase.ts, types/database.ts, supabase/migrations/*, etc.]

## What to rewrite
[hooks/* → new hooks in new paradigm. Explain the API shape changes.]

## What to delete
[components/*, app/*, theme/*]

## Phase 1 scope (first 2 weeks)
[Which screens/flows do we build first? Align with the 6-phase roadmap in the knowledge base.]

## Phase 1 deliverable
[What does "done" look like for Phase 1?]
```

Then wait for user approval on the migration plan before writing code.

---

## Environment & config

Two required env vars (in `.env.local`, inlined by Metro at build time):

```
EXPO_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

The Supabase client is already set up at `lib/supabase.ts`. It handles:
- Platform-split storage (localStorage on web, AsyncStorage on native, in-memory fallback for SSR)
- Session persistence + auto-refresh
- Typed database interface via `Database` type import

**You should not need to touch this file.**

---

## Supabase schema

All tables use `uuid` primary keys with `gen_random_uuid()` defaults. All tables have `created_at` / `updated_at` timestamps (updated_at auto-maintained by the `update_updated_at_column()` trigger).

### `users` — individuals who log in (both brand and creator)

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK, FK to `auth.users.id` |
| `email` | text | unique |
| `phone` | text | unique, nullable |
| `user_type` | text | `'creator'` \| `'brand'` |
| `tier` | text | `'free'` \| `'pro'` \| `'premium'` \| `'enterprise'` (default `'free'`) |
| `name` | text | display name |
| `bio` | text | |
| `location` | text | "Los Angeles, CA" |
| `avatar_url` | text | |
| `instagram` / `tiktok` / `youtube` | text | handles without @ |
| `follower_count_instagram` / `follower_count_tiktok` / `follower_count_youtube` | int | nullable |
| `portfolio_image_urls` | text[] | creator only |
| `niches` | text[] | creator only |
| `company_name` | text | brand only |
| `website` | text | brand only |
| `credits_balance` | int | current available credits |
| `credits_allocated` | int | monthly allocation based on tier |
| `credits_spent_this_month` | int | for rollover math |
| `credits_rollover_last_month` | int | |
| `last_credit_refresh` | timestamptz | |
| `payment_rate` | decimal(5,2) | brand only, 0-100 |
| `completion_rate` | decimal(5,2) | creator only, 0-100 |
| `total_campaigns` | int | |
| `successful_campaigns` | int | |
| `review_score` | decimal(2,1) | 1.0-5.0 |
| `review_count` | int | |
| `reputation_score` | decimal(5,2) | composite, 0-100 |
| `badges` | text[] | `['verified', 'pro', 'top_rated', 'founding_member']` etc. |
| `dispute_count` / `unresolved_disputes` | int | |
| `account_status` | text | `'active'` \| `'suspended'` \| `'banned'` |
| `stripe_customer_id` / `stripe_subscription_id` | text | |

### `opportunities` — brand-posted campaigns

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `brand_id` | uuid | FK → users.id |
| `title` | text | required |
| `description` | text | the long brief (Markdown OK) |
| `short_description` | text | the card blurb |
| `campaign_type` | text | `'gifting'` \| `'paid'` \| `'hybrid'` |
| `credit_cost` | int | snapshot of credit cost per slot at publish time |
| `credit_cost_per_slot` | int | same as credit_cost, explicit naming |
| `cash_amount` | int | nullable, for paid/hybrid only |
| `payment_methods` | text[] | `['venmo', 'zelle', 'cashapp', 'paypal']` |
| `product_description` | text | for gifting/hybrid |
| `content_types` | text[] | see enum below |
| `required_hashtags` | text[] | includes `#ad` / `#gifted` (auto-injected, locked) |
| `brand_mention` | text | handle without @ |
| `must_includes` | text[] | "talking points" |
| `off_limits` | text[] | hard constraints |
| `reference_image_urls` | text[] | up to 4 |
| `categories` | text[] | see enum below |
| `image_url` | text | hero image |
| `slots_available` | int | how many creators brand wants |
| `slots_filled` | int | auto-incremented on accept |
| `application_deadline` | timestamptz | |
| `completion_deadline` | timestamptz | application_deadline + 21 days |
| `approval_mode` | text | `'manual'` \| `'auto'` |
| `status` | text | `'draft'` \| `'active'` \| `'closed'` \| `'cancelled'` |
| `campaign_number` | text | human-readable, e.g. `'BC-2026-0047'` |

### `applications` — creator applications to opportunities

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `opportunity_id` | uuid | FK → opportunities.id |
| `creator_id` | uuid | FK → users.id |
| `message` | text | pitch, required for paid/hybrid (50-500 chars) |
| `credits_spent` | int | locked at application time |
| `status` | text | `'pending'` \| `'accepted'` \| `'rejected'` \| `'expired'` \| `'completed'` \| `'disputed'` |
| `applied_at` / `accepted_at` / `rejected_at` / `completed_at` | timestamptz | |
| `completion_deadline` | timestamptz | accepted_at + 21 days |
| `UNIQUE(opportunity_id, creator_id)` | — | enforced at DB level |

### `content_submissions` — verified content posts

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `application_id` | uuid | FK → applications.id |
| `creator_id` | uuid | denormalized for RLS |
| `post_url` | text | Instagram/TikTok/YouTube URL |
| `post_type` | text | `'instagram_post'` \| `'instagram_story'` \| `'instagram_reel'` \| `'tiktok_video'` \| `'tiktok_photo'` \| `'youtube_short'` |
| `screenshot_url` | text | backup proof, optional |
| `verification_status` | text | `'pending'` \| `'verified'` \| `'needs_revision'` \| `'failed'` |
| `verification_results` | jsonb | `{ brand_mentioned, product_shown, hashtags_present, ftc_compliant }` |
| `verification_feedback` | text | human-readable |
| `verified_at` | timestamptz | |
| `payment_confirmed_by_brand` / `payment_confirmed_by_creator` | bool | mutual confirm |
| `payment_method` | text | self-reported by brand after payment |
| `brand_confirmed_at` / `creator_confirmed_at` | timestamptz | |

### `reviews` — mutual reviews after campaign completion

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `application_id` | uuid | FK |
| `reviewer_id` / `reviewee_id` | uuid | FK → users.id |
| `content_quality_score` / `professionalism_score` / `timeliness_score` | int | brand reviewing creator, 1-5 each |
| `payment_speed_score` / `communication_score` / `product_quality_score` | int | creator reviewing brand, 1-5 each |
| `overall_score` | decimal(2,1) | average of category scores |
| `review_text` | text | up to 500 chars |
| `response_text` | text | reviewee can respond once |
| `response_posted_at` | timestamptz | |
| `reported` | bool | |
| `review_status` | text | `'published'` \| `'flagged'` \| `'removed'` |
| `UNIQUE(application_id, reviewer_id)` | — | one review per campaign per user |

### `disputes`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `application_id` | uuid | FK |
| `filed_by` / `filed_against` | uuid | FK → users.id |
| `dispute_type` | text | `'non_payment'` \| `'no_content'` \| `'content_quality'` \| `'fraud'` |
| `description` | text | |
| `evidence_urls` | text[] | |
| `status` | text | `'open'` \| `'under_review'` \| `'resolved'` \| `'escalated'` |
| `resolution` | text | |
| `resolved_by` | uuid | |
| `resolved_at` | timestamptz | |
| `credits_refunded` / `account_suspended` | bool | |

### `credit_transactions` — immutable audit log of every credit movement

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `user_id` | uuid | FK |
| `transaction_type` | text | `'allocation'` \| `'rollover'` \| `'spent'` \| `'refund'` \| `'completion'` \| `'purchase'` |
| `amount` | int | positive or negative |
| `balance_after` | int | |
| `related_application_id` / `related_opportunity_id` | uuid | nullable |
| `description` | text | human-readable |

### `campaign_drafts` — persistent wizard state

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `brand_id` | uuid | FK |
| `form_state` | jsonb | full `CampaignFormState` snapshot |
| `current_step` | int | 1-6 |
| `last_saved_at` | timestamptz | |

Autosaved every 2 seconds via `useAutosaveDraft` hook. Deleted on publish.

### `notifications`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `user_id` | uuid | FK |
| `type` | text | `'application_accepted'` \| `'review_request'` \| `'payment_confirmed'` etc. |
| `title` / `message` | text | |
| `action_url` | text | deep link into the app |
| `read_at` | timestamptz | null = unread |

### Enums used in array columns

```ts
type ContentFormat = 'ig_post' | 'ig_reel' | 'ig_story' | 'tiktok_video' | 'tiktok_photo' | 'youtube_short'
type CampaignCategory = 'flower' | 'vapes' | 'pre_rolls' | 'edibles' | 'concentrates' | 'topicals' | 'accessories' | 'lifestyle'
type PaymentMethod = 'venmo' | 'zelle' | 'cashapp' | 'paypal'
```

---

## RPCs — the only way to mutate credits

**Critical invariant:** never write directly to `users.credits_balance`, `applications.status`, or `opportunities.slots_filled` from the frontend. All credit-affecting mutations go through one of three RPCs. They're `SECURITY DEFINER` functions that enforce business rules atomically.

### 1. `apply_to_campaign_rpc`

```sql
apply_to_campaign_rpc(
  p_creator_id: uuid,
  p_opportunity_id: uuid,
  p_message: text DEFAULT NULL
) RETURNS jsonb
```

**What it does:**
- Validates creator exists and has enough credits
- Validates opportunity is `'active'` and has slots
- Validates creator hasn't already applied
- Validates pitch length if required (50-500 chars for paid/hybrid)
- Deducts credits from `users.credits_balance`
- Inserts `applications` row with `status='pending'`
- Inserts `credit_transactions` audit row
- Returns `{ application_id, credits_spent, new_balance }`

**Known errors (RAISE EXCEPTION keys):**
- `USER_NOT_CREATOR`
- `OPPORTUNITY_NOT_AVAILABLE`
- `OPPORTUNITY_FULL`
- `ALREADY_APPLIED`
- `PITCH_REQUIRED`
- `PITCH_LENGTH_INVALID`
- `INSUFFICIENT_CREDITS`

### 2. `publish_campaign_rpc`

```sql
publish_campaign_rpc(
  p_brand_id: uuid,
  p_opportunity: jsonb,   -- full opportunity payload
  p_credits_to_deduct: int,
  p_draft_id: uuid DEFAULT NULL
) RETURNS jsonb
```

**What it does:**
- Validates brand has enough credits
- Inserts `opportunities` row with `status='active'`
- Generates `campaign_number` (e.g., `'BC-2026-0047'`)
- Deducts reserved credits from brand balance
- Inserts `credit_transactions` audit row
- Deletes the `campaign_drafts` row if `p_draft_id` provided
- Returns `{ opportunity_id, campaign_number, new_balance }`

**Errors:**
- `INSUFFICIENT_CREDITS`
- `INVALID_OPPORTUNITY`

### 3. `review_application_rpc`

```sql
review_application_rpc(
  p_application_id: uuid,
  p_brand_id: uuid,
  p_decision: text   -- 'accepted' or 'rejected'
) RETURNS jsonb
```

**What it does:**
- Validates brand owns the opportunity
- Validates application is `'pending'`
- Updates `applications.status`
- On accept: increments `opportunities.slots_filled`
- On reject: refunds creator's credits + inserts `credit_transactions` row
- Returns `{ application_id, new_status, credits_refunded }`

**Errors:**
- `NOT_OWNER`
- `INVALID_DECISION`
- `ALREADY_REVIEWED`

---

## Row-level security policies

Enforced at the database level. Relevant for understanding what each user type can see:

- **users** — anyone can read (for profile pages); only owner can update
- **opportunities** — anyone can read `status='active'` rows; brand can read/update own
- **applications** — creator can read own; brand can read applications to their opportunities
- **content_submissions** — creator + brand of the associated opportunity can read
- **reviews** — anyone can read `review_status='published'`; only reviewer can update
- **disputes** — only filer + filed_against can read
- **credit_transactions** — only owner can read
- **campaign_drafts** — only brand owner
- **notifications** — only recipient

**You never need to add `.eq('user_id', session.user.id)` filters manually.** RLS handles it.

---

## React Query hooks — the frontend data API

**Context:** These hooks were written for the previous Expo + React Native frontend. They are 95% portable to any React-based frontend (Next.js, Remix, Vite+React, RN with a different UI layer, etc.). If Codex recommends a non-React stack (e.g., Flutter), the hooks become reference documentation rather than copy-paste code — the RPC calls and error handling patterns still apply, you'll just re-implement in the target language's idioms.

All hooks live in `hooks/`. **These are your data API contract.** Do not make Supabase calls directly from components; use these hooks (or their equivalent in your chosen stack).

### Reads

| Hook | Returns | Invalidation key |
|---|---|---|
| `useAuth()` | `{ session, profile, loading, signIn, signUp, signOut, refreshProfile }` | manual via `refreshProfile()` |
| `useCampaigns(filters?)` | paginated `Opportunity[]` for the Free Store | `['campaigns']` |
| `useCampaign(id)` | single `Opportunity` with joined `brand` user | `['campaign', id]` |
| `useMyNicheCampaigns()` | creator's personalized feed based on `niches[]` | `['campaigns', 'niche']` |
| `useBrandCampaigns()` | brand's own opportunities | `['brand-campaigns']` |
| `useCampaignApplicants(opportunityId)` | applications to a given opportunity with creator profile joined | `['applicants', opportunityId]` |
| `useMyApplications()` | creator's applications with opportunity + brand joined | `['my-applications']` |
| `useDrafts()` | brand's `campaign_drafts` | `['drafts']` |
| `useLayout()` | `{ isMobile, isTablet, isDesktop, width, height }` from `useWindowDimensions()` | — |

### Mutations

| Hook | Input | Success side effects |
|---|---|---|
| `useApplyToCampaign()` | `{ opportunityId, message }` | invalidates `['my-applications']`, `['campaigns']`, `['campaign', id]`; calls `refreshProfile()` |
| `usePublishCampaign()` | reads from `campaignForm` store | invalidates `['brand-campaigns']`, `['drafts']`; calls `refreshProfile()`; routes to dashboard |
| `useReviewApplication()` | `{ applicationId, decision }` | invalidates `['applicants', opportunityId]` |
| `useAutosaveDraft()` | (subscribed to form store) | debounced write to `campaign_drafts`, 2s |

**Example usage:**

```tsx
function CampaignDetailScreen({ id }: { id: string }) {
  const { data: campaign, isLoading } = useCampaign(id);
  const applyMutation = useApplyToCampaign();

  async function handleApply(message: string) {
    try {
      await applyMutation.mutateAsync({ opportunityId: id, message });
      // navigate away
    } catch (err) {
      const key = parseApplyError(err);
      // display known error to user
    }
  }

  // ... render
}
```

### Error parsing

All three RPC hooks export a `parseXxxError(err)` function that maps Postgres `RAISE EXCEPTION` messages to typed error keys. Always use it — don't display raw error messages.

```tsx
import { parseApplyError } from '@/hooks/useApplyToCampaign';

const errorKey = applyMutation.error ? parseApplyError(applyMutation.error) : null;
// errorKey is now 'USER_NOT_CREATOR' | 'OPPORTUNITY_FULL' | ... | 'UNKNOWN'
```

---

## Zustand stores

### `lib/stores/campaignForm.ts`

The wizard form state, shared across all 6 steps. Persisted to `campaign_drafts` via `useAutosaveDraft`.

**Shape (abbreviated):**

```ts
interface CampaignFormState {
  // Identity
  draft_id: string | null;
  current_step: StepNumber;  // 1-6
  last_saved_at: number | null;
  brand_credits_balance: number;

  // Step 1
  campaign_type: CampaignType | null;

  // Step 2
  title?: string;
  short_description?: string;
  image_url?: string;
  categories?: CampaignCategory[];

  // Step 3
  cash_amount?: number;
  payment_methods?: PaymentMethod[];
  product_description?: string;

  // Step 4
  content_types?: ContentFormat[];
  brand_mention?: string;
  required_hashtags?: string[];
  description?: string;
  must_includes?: string[];
  off_limits?: string[];
  reference_image_urls?: string[];

  // Step 5
  slots_available?: number;
  application_deadline?: string;
  approval_mode?: 'manual' | 'auto';
}
```

**Actions:**
- `patch(partial)` — shallow merge
- `toggleCategory(cat)` / `toggleContentFormat(fmt)` / `togglePaymentMethod(m)` — array toggles
- `addHashtag(tag)` / `removeHashtag(tag)` — with FTC compliance protection
- `addBullet(key)` / `updateBullet(key, i, value)` / `removeBullet(key, i)` — for must_includes + off_limits
- `setStep(n)` — also updates `current_step`
- `hydrate(draft, balance)` — load from `campaign_drafts` row
- `reset()` — back to empty

**Selectors:**
- `selectStepStatus(state, step)` — returns `'not_started'` \| `'in_progress'` \| `'complete'` \| `'error'`
- `selectCreditCost(state)` — 50 / 75 / 100 based on campaign_type
- `selectTotalCreditsRequired(state)` — creditCost × slots_available
- `selectBalanceAfterPublish(state)` — brand_credits_balance - total
- `selectHasInsufficientCredits(state)` — boolean

**Constants:**
- `CREDIT_COST_BY_TYPE: { gifting: 50, paid: 100, hybrid: 75 }`
- `STEP_NAMES: { 1: 'Campaign type', 2: 'Basics', 3: 'Compensation', 4: 'Creative brief', 5: 'Slots & timing', 6: 'Review' }`

### `lib/stores/onboarding.ts`

Transient state during signup. Similar shape, less complex. Reset after onboarding completes.

---

## TypeScript types

`types/database.ts` contains the generated Supabase `Database` type (what `createClient<Database>()` uses). It's 482 lines of fully-typed table rows, insert/update shapes, and RPC signatures.

**Use it like this:**

```ts
import type { Database } from '@/types/database';

type Opportunity = Database['public']['Tables']['opportunities']['Row'];
type OpportunityInsert = Database['public']['Tables']['opportunities']['Insert'];
type UserRow = Database['public']['Tables']['users']['Row'];
```

**Do not manually redefine these types elsewhere.** Import from `@/types/database` and derive.

---

## Auth + profile hydration pattern

`useAuth()` is a Context provider mounted at the root layout. On mount:

1. Calls `supabase.auth.getSession()` to check for persisted session
2. If session exists, fetches corresponding `users` row (the "profile")
3. Subscribes to auth state changes
4. Exposes `{ session, profile, loading, signIn, signUp, signOut, refreshProfile }`

`profile` is the frontend's source of truth for the current user. It holds `credits_balance`, `user_type`, `tier`, everything.

**After any mutation that changes profile state (credits, badges, reputation):** call `refreshProfile()` to re-fetch. The three RPC hooks already do this automatically.

**Redirect patterns:**
- Root layout: if loading, show splash; if no session, redirect to `/(auth)/sign-in`
- `(tabs)/_layout.tsx`: requires session + completed onboarding
- `campaigns/new/_layout.tsx`: requires `profile.user_type === 'brand'`

---

## Routing expectations

File-based via `expo-router`. Routes you need to implement (feel free to rename or reorganize):

### Auth flow — `app/(auth)/`
- `sign-in.tsx`
- `sign-up.tsx`
- `forgot-password.tsx` (optional Phase 1)

### Onboarding — `app/(onboarding)/`
- `_layout.tsx` — Stack
- `user-type.tsx` — choose creator or brand
- `creator-1.tsx`, `creator-2.tsx`, `creator-3.tsx` — 3-step profile setup
- `brand-1.tsx`, `brand-2.tsx`, `brand-3.tsx` — 3-step brand setup

### Main tabs — `app/(tabs)/`
- `_layout.tsx` — bottom tabs mobile, sidebar desktop
- `index.tsx` — Home (creator feed / brand dashboard, branches on user_type)
- `store.tsx` — Free Store catalog (creator only)
- `applications.tsx` — My applications (creator) / Applicants queue (brand)
- `notifications.tsx`
- `profile.tsx` — own profile

### Deep routes
- `app/profile/[id].tsx` — view any user's profile
- `app/profile/edit.tsx` — edit own profile
- `app/campaigns/[id]/index.tsx` — campaign detail
- `app/campaigns/[id]/apply.tsx` — creator apply flow
- `app/campaigns/[id]/applicants.tsx` — brand applicant queue
- `app/campaigns/new/index.tsx` — wizard Step 1
- `app/campaigns/new/[step].tsx` — wizard Steps 2-6

---

## Seed accounts + test data

Already in the Supabase project:

- **Brand:** `shiminskymanage+brand@gmail.com`
  - User ID: `15bcadd8-9119-4db1-968a-978471f168e3`
  - 500 credits
  - Owns all 5 seed campaigns
- **Creator:** `shiminskymanage@gmail.com`
  - User ID: `03af54b1-3d6c-4ab1-8601-15a27011701d`
  - 50 credits
  - Niches: Flower, Lifestyle, Reviews

Passwords: whatever was set during initial setup — if unknown, reset via Supabase dashboard → Authentication → Users → ⋯ → Send password recovery.

**The 5 seed campaigns cover all 3 types** (mix of gifting / paid / hybrid) so you can exercise the full UI surface without creating more data.

---

## Invariants you must preserve

**Reading this carefully will save you from re-solving problems the data layer has already solved.**

### 1. Never mutate credits directly

Always go through `apply_to_campaign_rpc`, `publish_campaign_rpc`, or `review_application_rpc`. The RPCs handle balance math, audit logs, and concurrency. Direct table writes will drift the balance from the transaction log and you'll have no way to reconcile.

### 2. FTC compliance hashtags are locked

When `campaign_type` is:
- `'paid'` or `'hybrid'` → `#ad` is auto-injected into `required_hashtags` and **cannot be removed**
- `'gifting'` or `'hybrid'` → `#gifted` is auto-injected and cannot be removed

The store's `autoInjectComplianceTag()` selector handles this. Your UI just needs to show locked chips (disabled remove button) for any tag in the "locked" set.

### 3. Credit cost locks at apply time, not publish time

When a creator applies, `applications.credits_spent` = the opportunity's `credit_cost` at that moment. If the brand later edits the opportunity (shouldn't happen but hypothetically), previously applied creators still have their original credit cost locked in. This is why refund logic uses `applications.credits_spent`, not `opportunities.credit_cost`.

### 4. The 21-day completion deadline is computed, not stored separately

It's `application_deadline + 21 days` at the opportunity level, OR `accepted_at + 21 days` at the application level. Show it as a computed value in the UI; don't let the user edit it.

### 5. `slots_filled` increments on accept, not on apply

Applications can exceed slots (overapply is allowed). Only acceptance consumes a slot. The RPC enforces this — you just need to display `slots_filled / slots_available` correctly.

### 6. Reviews are one-per-user-per-campaign

Enforced by `UNIQUE(application_id, reviewer_id)`. If you show a "Leave review" button, check if the current user has already reviewed before rendering it (the `reviews` query will return their existing review if it exists).

### 7. Both sides must confirm payment

Credits return to both parties only when `payment_confirmed_by_brand` AND `payment_confirmed_by_creator` are both true. This is enforced by a trigger on `content_submissions`. Your UI needs two separate confirm flows (one for brand, one for creator) — they're not a single button.

### 8. 7-day dispute auto-trigger

If content is verified but `payment_confirmed_by_brand` stays false for 7 days, a cron job opens a dispute automatically. You don't need to build this timer UI-side; just show dispute state when it exists.

### 9. Soft-delete only

Business records (opportunities, applications, users) are never hard-deleted. They get `deleted_at` set or their `status` moved to a terminal state. Design your UI assuming rows can come back.

### 10. Autosave is already wired

The wizard form is autosaved to `campaign_drafts` every 2 seconds by `useAutosaveDraft()`. If the user closes the browser mid-flow and comes back, they'll see a "Resume draft?" prompt on `campaigns/new/index`. You don't need to build any of this — just mount the hook at the layout level (see `app/campaigns/new/_layout.tsx` for the current pattern).

---

## What's not yet built (opportunities to add in your rebuild)

These pieces exist in the business spec but aren't wired to RPCs yet. If you want to build them, you'll need to add the RPCs too:

- **Content submission flow** — creator submits post URL, AI verification via Claude API edge function
- **Payment confirmation UI** — the mutual confirm flow after content is verified
- **Review flow** — the post-completion review form (schema exists, RPC doesn't)
- **Dispute flow** — file dispute, upload evidence, resolution (schema exists, RPC doesn't)
- **Monthly credit refresh cron** — end-of-month allocation + 50% rollover
- **Reputation recalculation** — trigger to update `reputation_score` on review insert

---

## How to start

Execute in this order. Do not skip steps.

### Step 1: Read everything

Read this doc end-to-end. Read `budcastknowledgebasev3.pdf` and `budcastdecisionlogv3.pdf`. Do not start coding yet.

### Step 2: Inspect the existing codebase to see what you're inheriting

```bash
cd budcast-v6
# Look at the data layer you're keeping — do not modify
ls -la hooks/ lib/ types/ supabase/migrations/
# Look at what will be thrown out — do not bother reading contents
ls app/ components/ theme/
```

You do NOT need to run `npm install` yet. The current `package.json` targets Expo + Tamagui. After the stack decision, you'll likely be rewriting the `package.json` anyway.

### Step 3: Produce your stack recommendation

Use the required output format in the "Stack decision" section at the top of this doc. Post it in chat. Wait for user approval.

**Do not start Step 4 until the user has explicitly approved your stack recommendation.**

### Step 4: Produce your migration plan

Again, use the required output format. Post in chat. Wait for user approval.

**Do not start Step 5 until the user has explicitly approved your migration plan.**

### Step 5: Execute the migration plan

Now you build. One phase at a time. Show your work. Ask before making assumptions.

---

## A note on what this handoff represents

You are inheriting:
- 15 Supabase migrations (schema + RPCs + RLS policies + seed data)
- 3 tested, production-ready RPCs that handle all credit-affecting mutations atomically
- 2 seed accounts and 5 seed campaigns exercising all 3 campaign types
- A business model and decision log with 17 locked decisions
- A frontend codebase that is being scrapped on purpose — not because the previous builder was incompetent, but because the user wants a fresh design direction

You are NOT inheriting:
- A design system
- A component library
- Working screens
- Any visual or interaction design commitments

Treat this as a greenfield UI rebuild on top of a battle-tested backend. That's unusually clean. Don't squander it by rushing into code before the stack and plan are locked.

Good luck.
