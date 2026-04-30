# Brand Team Profiles Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add brand team profiles, role-based brand access, creator-facing team identity, campaign contacts, and activity attribution without breaking existing brand/creator marketplace flows.

**Architecture:** Keep the existing `users` table as the canonical profile table, but introduce `brand_team` users linked to official `brand` users through a new membership table. Existing brand profiles continue to own campaigns, assets, billing, and public brand pages. Team members become real users who can post, message, review, and approve through brand-scoped permissions.

**Tech Stack:** Supabase Postgres + RLS, Next.js App Router, React/Tailwind, `@tanstack/react-query`, existing shared hooks in `packages/shared`.

---

## Product Rules

- Official brand profiles remain the source of truth for campaigns, billing, brand kit assets, and public `/brands/[id]` pages.
- Brand team profiles are person profiles linked to exactly one official brand at launch.
- Team members can have their own feed presence and DMs, but every brand-side action must show the parent brand.
- Creators should always understand both the human actor and the official brand behind them.
- Do not let team members appear as standalone brands in the brand directory.
- Do not change creator-only mobile direction or brand desktop/mobile direction.

## Data Model

### New visible profile type

Extend `UserType`:

```ts
export type UserType = "creator" | "brand" | "brand_team";
```

### New tables

`brand_team_members`

```sql
CREATE TABLE brand_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'campaign_manager', 'content_reviewer', 'viewer')),
  title TEXT,
  public_display BOOLEAN DEFAULT true NOT NULL,
  status TEXT DEFAULT 'active' NOT NULL CHECK (status IN ('invited', 'active', 'suspended', 'removed')),
  invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
  joined_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (brand_id, user_id)
);
```

Indexes:

```sql
CREATE INDEX idx_brand_team_members_brand ON brand_team_members(brand_id);
CREATE INDEX idx_brand_team_members_user ON brand_team_members(user_id);
CREATE INDEX idx_brand_team_members_active_brand ON brand_team_members(brand_id, role)
  WHERE status = 'active';
```

`brand_team_invites`

```sql
CREATE TABLE brand_team_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'campaign_manager', 'content_reviewer', 'viewer')),
  title TEXT,
  invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
  accepted_by UUID REFERENCES users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'accepted', 'revoked', 'expired')),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days') NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (brand_id, email, status)
);
```

Indexes:

```sql
CREATE INDEX idx_brand_team_invites_brand ON brand_team_invites(brand_id, status);
CREATE INDEX idx_brand_team_invites_email ON brand_team_invites(lower(email), status);
```

`brand_activity_log`

```sql
CREATE TABLE brand_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

Indexes:

```sql
CREATE INDEX idx_brand_activity_log_brand_created ON brand_activity_log(brand_id, created_at DESC);
CREATE INDEX idx_brand_activity_log_actor_created ON brand_activity_log(actor_id, created_at DESC);
```

### New columns

`opportunities`

```sql
ALTER TABLE opportunities
  ADD COLUMN campaign_contact_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN updated_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL;
```

`applications`

```sql
ALTER TABLE applications
  ADD COLUMN reviewed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL;
```

`content_submissions`

```sql
ALTER TABLE content_submissions
  ADD COLUMN reviewed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN payment_confirmed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL;
```

`messages`

```sql
ALTER TABLE messages
  ADD COLUMN sender_brand_id UUID REFERENCES users(id) ON DELETE SET NULL;
```

## Permission Model

### Role capabilities

- `owner`: full brand access, team management, campaign management, approvals, messages, billing/settings.
- `admin`: team management except ownership transfer, campaign management, approvals, messages.
- `campaign_manager`: create/edit campaigns, review applicants, message creators.
- `content_reviewer`: view campaigns, review submissions, approve/request revisions, message creators.
- `viewer`: read brand campaign state and activity only.

### Permission helper functions

Add SQL helper:

```sql
CREATE OR REPLACE FUNCTION is_brand_team_member(p_brand_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM brand_team_members
    WHERE brand_id = p_brand_id
      AND user_id = p_user_id
      AND status = 'active'
  );
$$;
```

Add role helper:

```sql
CREATE OR REPLACE FUNCTION has_brand_role(p_brand_id UUID, p_user_id UUID, p_roles TEXT[])
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT
    p_user_id = p_brand_id
    OR EXISTS (
      SELECT 1
      FROM brand_team_members
      WHERE brand_id = p_brand_id
        AND user_id = p_user_id
        AND status = 'active'
        AND role = ANY(p_roles)
    );
$$;
```

Use these functions in RLS for opportunities, applications, submissions, conversations, messages, and activity logs.

## UX Surfaces

### Brand dashboard

Add `Team` entry on desktop and mobile brand navigation.

Team page sections:

- Team header: official brand identity and team count.
- Active team members.
- Invite teammate.
- Role explainer.
- Recent team activity.

### Team member profile

Route:

```txt
/team/[id]
```

Profile content:

- Avatar.
- Name.
- Title.
- `at Brand Name`.
- `Verified Brand Team` badge.
- Parent brand card with `View Brand`.
- Recent brand-side posts.
- Campaigns they manage.
- Message CTA.

### Public brand profile

Add a `Team` section:

- “People creators may hear from.”
- Cards for public active team members.
- Role/title.
- Message CTA.

### Messages

Thread should remain brand-to-creator scoped, but message rows show the human sender:

```txt
Maya Chen · Green Room Labs
```

For creator-side inbox:

- Thread title can remain brand name.
- Message header shows current campaign contact when available.
- Individual bubbles can show the sender name when not from the creator.

### Campaign builder

Add campaign contact field:

- Defaults to the current actor if they are a brand owner/team member with campaign permissions.
- Can be changed by owner/admin/campaign manager.
- Creators see the contact after applying or acceptance.

### Applicant review and submission review

Show actor attribution:

- `Accepted by Maya Chen`.
- `Revision requested by Jordan Lee`.
- `Approved by Jordan Lee`.
- `Payment confirmed by owner/admin`.

## Implementation Tasks

### Task 1: Shared Types And Badge Labels

**Files:**

- Modify: `packages/shared/src/types/database.ts`
- Create: `packages/shared/src/lib/brand-team.ts`
- Modify: `packages/shared/src/index.ts`
- Test: `packages/shared/tests/brand-team.test.ts`

Steps:

- [ ] Add `brand_team` to `UserType`.
- [ ] Add `BrandTeamRole`, `BrandTeamMember`, `BrandTeamInvite`, and `BrandActivityLog` types.
- [ ] Add display helpers:

```ts
export function getBrandTeamRoleLabel(role: BrandTeamRole): string;
export function canBrandTeamRole(role: BrandTeamRole, capability: BrandTeamCapability): boolean;
export function getBrandTeamDisplayLine(member): string;
```

- [ ] Add tests that verify role labels and capability rules.
- [ ] Run:

```bash
node --test packages/shared/tests/brand-team.test.ts
npm run typecheck -w @budcast/shared
```

### Task 2: Supabase Migration

**Files:**

- Create: `supabase/migrations/020_brand_team_profiles.sql`
- Modify: `packages/shared/src/types/database.ts`

Steps:

- [ ] Add `brand_team` to `users.user_type` constraint.
- [ ] Create `brand_team_members`.
- [ ] Create `brand_team_invites`.
- [ ] Create `brand_activity_log`.
- [ ] Add actor/contact columns to `opportunities`, `applications`, `content_submissions`, and `messages`.
- [ ] Add indexes listed in this plan.
- [ ] Add helper functions `is_brand_team_member` and `has_brand_role`.
- [ ] Add RLS policies for new tables.
- [ ] Extend existing RLS policies so active brand team members can access the parent brand’s campaigns/applications/submissions/conversations according to role.
- [ ] Run migration locally/linked only after review.

### Task 3: Auth And Brand Context

**Files:**

- Modify: `packages/shared/src/auth/useAuth.tsx`
- Create: `packages/shared/src/hooks/useBrandTeam.ts`
- Modify: `packages/shared/src/index.ts`

Steps:

- [ ] Fetch current user’s active `brand_team_members` row when `profile.user_type === "brand_team"`.
- [ ] Expose `brandContext`:

```ts
{
  brandId: string;
  actorId: string;
  role: BrandTeamRole | "owner";
  isOfficialBrand: boolean;
}
```

- [ ] Ensure existing brand accounts map to `role: "owner"`.
- [ ] Route `brand_team` users to the brand dashboard, not creator mobile.
- [ ] Add loading/error states for missing or suspended team memberships.

### Task 4: Brand Team Management UI

**Files:**

- Create: `apps/web/app/dashboard/team/page.tsx`
- Create: `apps/web/components/brand-team/brand-team-shell.tsx`
- Create: `apps/web/components/brand-team/team-member-card.tsx`
- Create: `apps/web/components/brand-team/invite-team-member-form.tsx`
- Modify: `apps/web/components/brand-workspace-shell.tsx`
- Modify: `apps/web/components/brand-mobile/brand-mobile-bottom-nav.tsx`

Steps:

- [ ] Add Team nav entry for brand desktop and mobile.
- [ ] Show active team members.
- [ ] Show role labels and permission summaries.
- [ ] Add invite form UI.
- [ ] Use placeholder invite submission if backend invite action is not complete in the same task.

### Task 5: Team Invites And Membership Mutations

**Files:**

- Create: `packages/shared/src/hooks/useBrandTeamInvites.ts`
- Create: `packages/shared/src/hooks/useBrandTeamMembers.ts`
- Modify: `packages/shared/src/index.ts`

Steps:

- [ ] Add `useBrandTeamMembers(brandId)`.
- [ ] Add `useCreateBrandTeamInvite()`.
- [ ] Add `useUpdateBrandTeamMemberRole()`.
- [ ] Add `useRemoveBrandTeamMember()`.
- [ ] Keep invitation email sending out of scope unless Supabase email workflow is explicitly added later.
- [ ] For launch testing, allow owner/admin to create pending invite records and manually accept them by matching signed-in email.

### Task 6: Team Member Public Profiles

**Files:**

- Create: `apps/web/app/team/[id]/page.tsx`
- Create: `packages/shared/src/hooks/useBrandTeamProfile.ts`
- Modify: `apps/web/app/brands/[id]/page.tsx`

Steps:

- [ ] Public team profile loads the `brand_team` user and parent brand membership.
- [ ] Show `Verified Brand Team` badge.
- [ ] Show “at Brand Name” with parent brand link.
- [ ] Add public team section on brand profiles.
- [ ] Hide suspended/removed/private team members.

### Task 7: Campaign Contact

**Files:**

- Modify: `packages/shared/src/stores/campaignForm.ts`
- Modify: `packages/shared/src/hooks/usePublishCampaign.ts`
- Modify: `apps/web/app/dashboard/campaigns/new/page.tsx`
- Modify: `apps/web/app/campaigns/[id]/page.tsx`

Steps:

- [ ] Add campaign contact to form state.
- [ ] Default contact to current actor when actor is a brand owner or active team member with campaign permission.
- [ ] Persist `campaign_contact_id` on publish.
- [ ] Show campaign contact on creator campaign detail.
- [ ] Add “Message contact” CTA after application/acceptance when messaging is available.

### Task 8: Messaging Actor Identity

**Files:**

- Modify: `packages/shared/src/hooks/useMessaging.ts`
- Modify: `apps/web/components/messaging/budcast-dm-inbox.tsx`

Steps:

- [ ] Conversation remains scoped to official `brand_id` and `creator_id`.
- [ ] Messages insert `sender_id` as the actual user.
- [ ] Messages insert `sender_brand_id` when sender is a brand team member.
- [ ] Message list joins sender profile and sender brand membership.
- [ ] Creator-side bubbles show `Maya Chen · Green Room Labs`.
- [ ] Brand-side bubbles distinguish internal team sender names.

### Task 9: Application And Submission Actor Attribution

**Files:**

- Modify: `supabase/migrations/014_review_application_rpc.sql` or create replacement migration for function signature.
- Modify: `packages/shared/src/hooks/useReviewApplication.ts`
- Modify: `packages/shared/src/hooks/useSubmissions.ts`
- Modify: `apps/web/app/dashboard/campaigns/[id]/applicants/page.tsx`
- Modify: `apps/web/app/dashboard/submissions/page.tsx`
- Modify: `apps/web/app/creator-dashboard/work/page.tsx`

Steps:

- [ ] Update review RPC to accept `p_actor_id` and validate actor role against opportunity brand.
- [ ] Store `applications.reviewed_by_user_id`.
- [ ] Store `content_submissions.reviewed_by_user_id` on approval/revision.
- [ ] Store `content_submissions.payment_confirmed_by_user_id` when brand confirms payment/product.
- [ ] Show actor attribution on brand and creator views.

### Task 10: Activity Log

**Files:**

- Create: `packages/shared/src/hooks/useBrandActivityLog.ts`
- Modify: team/campaign/review/submission hooks where actions occur.
- Modify: `apps/web/app/dashboard/team/page.tsx`
- Modify: `apps/web/app/dashboard/page.tsx`

Steps:

- [ ] Insert log entries for invite created, role changed, campaign published, application accepted/rejected, content approved/revision requested, payment/product confirmed.
- [ ] Show recent activity on Team page.
- [ ] Show relevant activity on dashboard home.
- [ ] Use compact actor labels.

## Testing Plan

Run after each task group:

```bash
node --test packages/shared/tests/brand-team.test.ts
npm run typecheck -w @budcast/shared
npm run typecheck -w @budcast/web
npm run build:web
git diff --check
```

Manual browser checks:

- `/dashboard/team`
- `/team/[id]`
- `/brands/[id]`
- `/dashboard/campaigns/new`
- `/campaigns/[id]`
- `/dashboard/campaigns/[id]/applicants`
- `/dashboard/submissions`
- `/dashboard/messages`
- `/creator-dashboard/messages`
- `/creator-dashboard/work`

Permission checks:

- Owner can invite and edit team.
- Campaign manager can publish campaigns and review applicants.
- Content reviewer can review submissions but cannot invite team.
- Viewer can read but cannot mutate.
- Creator can see public team identity but cannot access brand-team routes.

## Risks

- Existing RLS assumes `auth.uid() = brand_id`; policies must be carefully expanded to include team members without exposing unrelated brand data.
- `brand_team` users require routing updates so they do not get treated as creators or standalone brands.
- Invitation email delivery is not included unless an email workflow is added later.
- Existing RPCs need actor-aware signatures; old callers must be updated at the same time.

## Recommendation

Implement this in the task order above. Do not start with UI only. The first production-safe slice should be: schema/RLS + shared brand context + Team page read UI. Then add mutations, campaign contact, messaging identity, and activity logs.
