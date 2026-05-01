# BudCast Competitive Audit Execution Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Execute the competitive audit by turning BudCast from a campaign marketplace into a cannabis-native creator and budtender campaign operating system.

**Architecture:** Treat trust, compliance, and economic-state safety as the launch foundation. Then complete marketplace trust loops, then add differentiated cannabis workflows that generic UGC platforms do not own.

**Tech Stack:** Next.js web app in `apps/web`, Expo native app in `apps/native`, shared React Query/Zustand/Supabase package in `packages/shared`, Supabase migrations in `supabase/migrations`.

---

## Audit Synthesis

The audit says BudCast is strongest when positioned as a cannabis creator and budtender campaign OS, not as a generic influencer board. The current app already has useful marketplace mechanics: campaign creation, applications, submissions, brand-team work, messaging primitives, profiles, safety schema, and creator-facing UI.

The launch blocker is trust. BudCast must prove that campaigns, creators, rights, gifting, payments, reviews, disputes, moderation, and jurisdiction rules are safe enough for regulated cannabis work before broad creator discovery or social features become the priority.

## Current Repo Reality

Several audit recommendations already exist in code or migrations:

- Economic-state hardening: `supabase/migrations/026_lock_economic_state.sql`
- Age, jurisdiction, and terms layer: `supabase/migrations/027_trust_layer.sql`
- Usage rights, compliance fields, and gifting workflow: `supabase/migrations/028_usage_rights_and_gifting.sql`
- Gifting workflow RLS hardening: `supabase/migrations/029_gifting_workflow_rls.sql`
- Campaign form fields for rights/compliance: `packages/shared/src/stores/campaignForm.ts`
- Gifting hooks: `packages/shared/src/hooks/useGiftingWorkflow.ts`
- Safety/reporting primitives: `packages/shared/src/hooks/useSafety.ts`, `supabase/migrations/022_security_privacy_hardening.sql`

Execution should therefore focus on applying, validating, wiring, and closing gaps.

## Phase 0: Stabilize The Workspace

**Outcome:** Product work is reviewable, deployable, and not trapped in local-only state.

- [x] Create or switch to a WIP branch using the `codex/` prefix.
- [x] Review `git status --short` and separate unrelated `_audit` deletion state from product work.
- [x] Commit the current build-clean baseline after confirming scope with the repo owner.
- [x] Run `npm run typecheck` and `npm run build:web`.
- [x] Push the current branch for staging/deployment review before new feature work.

**Phase 0 evidence:** Branch `codex/budcast-audit-execution` was created in `.worktrees/codex-budcast-audit-execution`, committed as `ecfe54c`, and pushed to `origin`. Fresh verification on May 1, 2026: `npm run typecheck` exited 0; `npm run build:web` exited 0 and generated 30 routes. The build printed missing Supabase env warnings in the isolated worktree, but completed successfully.

**Success criteria:** The staging branch builds, the current web preview is accessible, and no launch-critical work exists only as unstaged local edits.

## Phase 1: Apply And Validate P0 Trust Migrations

**Outcome:** The database enforces age/jurisdiction, terms, economic-state, rights, and gifting constraints.

**Files:**
- Validate: `supabase/migrations/026_lock_economic_state.sql`
- Validate: `supabase/migrations/027_trust_layer.sql`
- Validate: `supabase/migrations/028_usage_rights_and_gifting.sql`
- Validate: `supabase/migrations/029_gifting_workflow_rls.sql`
- Add: `supabase/migrations/030_trust_rpc_grants.sql`
- Add or extend tests near: `packages/shared/tests/security-hardening.test.ts`

- [x] Confirm migrations `026` through `029` are already applied to the linked remote project.
- [x] Add a forward migration for explicit authenticated-only RPC execution grants.
- [x] Static-verify direct client writes are blocked for `users.credits_balance` and `opportunities.slots_filled`.
- [x] Static-verify `accept_terms` rejects users under 21 and records `state_code`, `market_eligible`, and `terms_policy_version`.
- [x] Static-verify campaigns can store `eligible_states`, `target_platforms`, disclosure tags, prohibited content rules, and rights fields.
- [x] Static-verify `gifting_workflow` records cannot be inserted directly by the client.
- [x] Static-verify brand and creator status transitions are only possible for the correct participant.
- [ ] Apply pending migration `030` to staging after owner confirmation.
- [ ] Run remote/staging behavior checks after migration `030` is applied.

**Phase 1 evidence:** `npx supabase migration list` shows remote migrations `026` through `029` are already applied. `npx supabase db push --dry-run` reported only `030_trust_rpc_grants.sql` would be pushed and made no remote changes. Local validation on May 1, 2026: `node --test packages/shared/tests/security-hardening.test.ts` exited 0 with 12 passing tests; `npm run typecheck` exited 0; `npm run build:web` exited 0 and generated 30 routes. Remote mutation is intentionally paused pending owner approval to apply migration `030`.

**Success criteria:** Credits, slots, age gate, terms, campaign compliance fields, rights confirmation, and gifting status are protected by database rules, not just UI checks.

## Phase 2: Wire The P0 Web Product

**Outcome:** Brand and creator web flows make the trust layer visible and unavoidable.

**Files:**
- Modify: `apps/web/app/onboarding/page.tsx`
- Modify: `apps/web/app/dashboard/campaigns/new/page.tsx`
- Modify: `packages/shared/src/hooks/usePublishCampaign.ts`
- Modify: `apps/web/app/dashboard/campaigns/[id]/applicants/page.tsx`
- Modify: `packages/shared/src/hooks/useGiftingWorkflow.ts`
- Modify: `apps/web/components/messaging/budcast-dm-inbox.tsx`

- [ ] Make onboarding completion require 21+ date of birth, state, and explicit terms acceptance.
- [ ] Gate creator marketplace, application, submission, and messaging flows behind completed compliance.
- [ ] Make campaign creation require market eligibility, target platforms, prohibited content rules, and disclosure requirements.
- [ ] Make usage-rights selection visible before publish and visible to creators before applying.
- [ ] Block brand content approval until rights are confirmed.
- [ ] Replace direct gifting table updates in shared hooks with the safe RPC path from migration `028`.
- [ ] Remove or reword product copy that says "pickup", "delivery", "order", or anything that sounds like cannabis commerce facilitation.
- [ ] Keep all gifting language framed as brand-managed collaboration status, not sale, pickup, delivery, or in-app transaction.

**Success criteria:** A brand cannot publish an incomplete cannabis campaign, a creator cannot apply without seeing rights and compliance requirements, and no UI suggests BudCast arranges cannabis sale, pickup, delivery, or purchase.

## Phase 3: Payment Model Decision

**Outcome:** BudCast has one coherent MVP payment posture.

**Recommended MVP choice:** Keep payments out of platform rails for launch. Use credits for campaign posting and manual payout/product confirmation for completed collaborations. Defer Stripe Connect or escrow until legal, tax, KYC, cannabis payment-risk, and refund policy are reviewed.

- [ ] Write a product decision record in `docs/superpowers/specs/2026-05-01-budcast-payment-model-decision.md`.
- [ ] Ensure campaign type copy distinguishes paid creator services from cannabis product transactions.
- [ ] Ensure submission confirmation records who confirmed payment/product status and when.
- [ ] Add admin-facing flags for payment disputes and product-not-received issues.

**Success criteria:** The app does not imply escrow, cannabis commerce, or automated payout unless the backend and operating model actually support it.

## Phase 4: Moderation Minimum

**Outcome:** BudCast meets UGC platform expectations before social/community expansion.

**Files:**
- Modify: `apps/web/components/safety/profile-safety-actions.tsx`
- Modify: `apps/web/app/admin/moderation/page.tsx`
- Modify: `packages/shared/src/hooks/useModeration.ts`
- Validate: `supabase/migrations/022_security_privacy_hardening.sql`
- Validate: `supabase/migrations/024_platform_moderation.sql`

- [ ] Confirm report/block actions exist on profiles, feed posts, messages, reviews, and campaigns.
- [ ] Add admin queue views for open safety reports.
- [ ] Add moderation actions for dismiss, actioned, remove content, and suspend profile where already supported by schema.
- [ ] Add public support/contact copy in the app shell or footer.
- [ ] Run `npm run typecheck` and `npm run build:web`.

**Success criteria:** Users can report and block, admins can review and act, and support contact information is visible.

## Phase 5: P1 Marketplace Trust Loops

**Outcome:** Completed campaigns generate reputation, reviews, and dispute evidence.

**Files:**
- Modify or add shared hooks around `packages/shared/src/hooks/useReviews.ts`
- Modify or add dispute hooks in `packages/shared/src/hooks`
- Modify review surfaces in `apps/web/app/profile/page.tsx`
- Modify submission and applicant review routes under `apps/web/app/dashboard`
- Validate: `supabase/migrations/005_reviews.sql`
- Validate: `supabase/migrations/006_disputes.sql`

- [ ] Implement review RPCs that allow one review per completed application per reviewer.
- [ ] Recalculate visible `review_score`, `review_count`, and trust badges after reviews.
- [ ] Implement dispute filing for non-payment, no content, product-not-received, content quality, and compliance violations.
- [ ] Add dispute resolution states and admin escalation.
- [ ] Surface review and dispute status in brand and creator dashboards.

**Success criteria:** Every completed or failed collaboration has a durable marketplace trust record.

## Phase 6: Creator And Budtender Verification

**Outcome:** BudCast can sell cannabis-ready talent, not just generic creators.

**Files:**
- Modify: `packages/shared/src/types/database.ts`
- Add migration: `supabase/migrations/030_creator_budtender_verification.sql`
- Modify: `apps/web/app/profile/edit/page.tsx`
- Modify: `apps/web/app/profile/page.tsx`
- Modify: `apps/web/app/brands/page.tsx`

- [ ] Add creator verification fields: social handle verification status, platform links, audience age attestation, cannabis willingness, content categories, and markets.
- [ ] Add budtender fields: retail experience, market, store affiliation as optional/free-text or verified status, education/event experience, and sampling recap availability.
- [ ] Add admin verification workflow for verified creator and verified budtender badges.
- [ ] Add filters for cannabis-ready creators, budtenders, markets, platforms, niches, rate, availability, and reputation.

**Success criteria:** Brands can find verified cannabis creators and budtenders by market and campaign fit.

## Phase 7: P2 Differentiators

**Outcome:** BudCast becomes harder for generic UGC tools to copy.

- [ ] Add cannabis campaign templates for product education, budtender education, event recap, compliant lifestyle UGC, unboxing, retail-market awareness, and ambassador content.
- [ ] Add compliance preflight checks for missing disclosure, sale language, health claims, age/market mismatch, and platform-specific warnings.
- [ ] Add content library and rights vault for approved assets, usage terms, creator, campaign, market, product category, and platform tags.
- [ ] Add campaign recap analytics: usable assets, application conversion, completion rate, dispute rate, review score, market feedback, post URLs, and engagement where available.
- [ ] Add repeat collaboration workflows: rehire creator, duplicate campaign, preferred creator pools, private invites, and availability.

**Success criteria:** BudCast sells cannabis campaign intelligence and repeatable operations, not only creator matching.

## Execution Order

1. Phase 0: branch, staging, baseline build.
2. Phase 1: migration validation.
3. Phase 2: trust-layer web wiring and no-commerce copy pass.
4. Phase 3: payment posture decision.
5. Phase 4: moderation minimum.
6. Phase 5: reviews and disputes.
7. Phase 6: creator and budtender verification.
8. Phase 7: templates, preflight, library, analytics, repeat collaboration.

## Non-Negotiables

- Do not add cart, order, pickup arrangement, delivery arrangement, or THC transaction flows.
- Do not ship broad social features ahead of moderation and report/block controls.
- Do not approve content without rights capture.
- Do not rely on frontend checks for credits, slots, age gate, terms, rights, or gifting state.
- Do not implement escrow or automated payouts without a separate legal/payment operations decision.

## Verification Commands

- `npm run typecheck`
- `npm run build:web`
- Supabase staging migration apply and RLS/RPC checks.
- Manual QA for brand, creator, brand-team owner/admin/campaign-manager/content-reviewer/viewer, and platform-admin roles.
