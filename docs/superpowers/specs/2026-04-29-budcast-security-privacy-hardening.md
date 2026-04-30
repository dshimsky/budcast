# BudCast Security And Privacy Hardening

Date: 2026-04-29
Status: Approved first pass
Owner: Codex

## Decision

BudCast will prioritize a launch-blocking security and privacy hardening pass before adding more marketplace features.

This pass protects the current Supabase-backed marketplace without changing the product architecture, adding external services, or replacing existing campaign/application/messaging flows.

## Intent

BudCast will handle user identity, creator portfolios, brand assets, campaign applications, direct messages, reviews, payments/product status, and reputation. The platform needs backend protections that hold even when a user bypasses the UI and calls Supabase directly.

The first pass focuses on:
- preventing client-side mutation of privileged account fields
- proving security-definer RPCs bind sensitive actions to `auth.uid()`
- adding platform safety primitives for blocks and reports
- enforcing feed visibility as modeled in the schema
- limiting unauthenticated local operations APIs

## Non-Goals

- No schema rewrite.
- No external moderation, KYC, or identity vendor.
- No paid compliance automation.
- No new backend service or BFF layer.
- No removal of the existing Supabase client/data layer.

## Threat Model

The first pass assumes a real user can:
- inspect frontend code
- call Supabase REST/RPC endpoints directly with their own JWT
- attempt to update fields not shown in the UI
- attempt to message or follow users who blocked them
- attempt to view follower/private feed posts
- attempt to report abusive posts/messages/profiles
- hit local Next.js API routes if the web app is exposed

The first pass does not attempt to protect against:
- leaked service role keys
- compromised Supabase project owner credentials
- payment-provider fraud
- legal compliance beyond basic product safety language and auditability

## Core Rules

- User-editable profile fields must be explicit and narrow.
- Credits, badges, account status, reputation, and billing identifiers must not be directly client-editable.
- Security-definer RPCs must validate `auth.uid()` internally.
- Blocking must prevent follows, new DMs, and feed exposure where practical.
- Reporting must be possible without exposing reporter identity publicly.
- Public profile surfaces should read public-safe fields instead of depending on broad raw `users` access.
- Internal operations APIs must be dev-only unless protected by a local secret.

## First-Pass Data Additions

### `profile_blocks`

Tracks one user blocking another user.

Required behavior:
- users can create/delete their own blocks
- users can read blocks they created or blocks against themselves
- no self-blocks
- blocks prevent future follows and conversation creation

### `safety_reports`

Unified report table for users, feed posts, messages, reviews, campaigns, and conversations.

Required behavior:
- signed-in users can create reports
- reporters can see their own reports
- ordinary users cannot see reports against others
- report records have status lifecycle: `open`, `reviewing`, `actioned`, `dismissed`

### Safe profile update RPC

Client profile saves should use an RPC that only accepts editable profile fields:
- name
- bio
- location
- avatar_url
- cover_url
- creator/brand social links
- company_name
- website
- portfolio_image_urls
- niches

Privileged fields remain server-owned:
- credits
- badges
- reputation
- review counts
- account_status
- Stripe fields
- subscription fields

## First-Pass Policy Changes

- Replace broad `users` update with an RPC-only mutation model.
- Harden `apply_to_campaign_rpc` so `p_creator_id` must equal `auth.uid()`.
- Update feed post SELECT policy so:
  - public posts are visible to authenticated users
  - private posts are author-only
  - follower posts are visible to followers and author only
  - blocked relationships suppress visibility
- Update profile follow INSERT policy to reject blocked relationships.
- Update conversation INSERT policy to reject blocked relationships.
- Update messaging INSERT policy to reject blocked relationships.

## Operations API Rule

`/api/mission-control` and `/api/agent-floor` are local build tools. They must not be unauthenticated write endpoints in production.

First pass:
- allow reads/writes in development
- require a `BUDCAST_OPS_API_KEY` bearer token outside development
- fail closed when no token is configured in production

## Acceptance Criteria

- A user cannot update their own credits, badges, reputation, account status, or billing fields through the normal profile save path.
- `apply_to_campaign_rpc` rejects calls where `p_creator_id <> auth.uid()`.
- A blocked user cannot follow, start a conversation, or send a new message to the blocker.
- Feed follower/private visibility matches the `visibility` field.
- Reports can be created for profiles, posts, messages, reviews, campaigns, and conversations.
- Ops APIs are not open write endpoints in production.
- Typecheck and build pass after the hardening pass.
