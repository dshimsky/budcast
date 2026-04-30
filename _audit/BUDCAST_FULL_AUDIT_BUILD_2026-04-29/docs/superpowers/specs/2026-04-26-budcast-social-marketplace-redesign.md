# BudCast Social Marketplace Redesign Spec

Date: 2026-04-26

## Summary

BudCast should shift from a premium SaaS-style dashboard into a cannabis-native UGC marketplace and social network.

The product should borrow the proven UGC/gifting marketplace model used by creator campaign platforms, then adapt it for cannabis industry constraints. The core experience is no longer a static dashboard. It is a social marketplace where creators discover campaigns, brands post opportunities and market activity, both sides coordinate through campaign-aware messages, and completed work builds trust across the network.

The approved visual direction is `Obsidian Drop Culture`: dark premium, sharper, more urgent, and more social than the current card-heavy UI. The existing BudCast logo system stays. The current layout grammar does not.

## Product North Star

BudCast is a cannabis creator marketplace where brands and creators connect around paid, product, and paid + product UGC campaigns.

The product should feel like:
- A creator campaign marketplace.
- A social feed for cannabis brand and creator activity.
- A work queue for applications, content submissions, approvals, and payment/product confirmation.
- A trust network where public profiles, completed work, reviews, and campaign outcomes matter.

It should not feel like:
- A generic SaaS admin dashboard.
- A static list of cards.
- A cannabis gimmick or stoner-themed app.
- A normal product-shipping gifting platform.

## Borrowed UGC Marketplace Patterns

BudCast should replicate the strongest patterns from top UGC and gifting platforms:

- Creators browse a mobile-first campaign feed.
- Brands post campaign briefs with compensation, deliverables, deadlines, and requirements.
- Creators apply with profile context and a short pitch.
- Brands review applicants quickly with portfolio/social/profile signals visible.
- Accepted creators submit content for brand approval.
- Brands approve, request revisions, and confirm payment/product status.
- Profiles and completed work build trust over time.

BudCast should avoid copying generic visual design from those platforms. The value is the workflow model, not the look.

## Cannabis-Specific Adaptation

Cannabis product campaigns require different language and workflow assumptions.

Hard product language rules:
- Use `Paid`, `Product`, and `Paid + Product`.
- Do not use `Gifting`, `Free product`, `Unpaid`, or `Hybrid` in visible marketplace UI.
- Do not use shipping language for cannabis products.
- Use coordination language: pickup, local coordination, product received, product confirmed.

Messaging is a core workflow because brands cannot legally treat cannabis product delivery like standard e-commerce shipping.

Messages should support:
- Pickup details.
- Product coordination.
- Creative questions.
- Timing and location details.
- Payment timing.
- Revision discussion.
- Approval follow-up.

Campaign briefs should remain brand-safe:
- Avoid medical claims.
- Avoid overconsumption language.
- Avoid content targeted to minors.
- Avoid risky purchase CTAs.
- Make location and age/readiness signals clear without making unsupported legal claims.

## Creator App Architecture

The creator app is mobile-first. The creator lands on `Campaigns`.

Bottom navigation:
- `Campaigns`
- `Feed`
- `Messages`
- `Work`
- `Profile`

### Campaigns

The primary creator discovery surface.

Campaigns should look and behave like social/drop posts, not admin cards.

Each campaign should communicate:
- Brand identity.
- Campaign title.
- Compensation type: Paid, Product, or Paid + Product.
- Compensation value/details.
- Content type.
- Platform target.
- Deadline.
- Slots or creator demand.
- Location or remote/local requirement.
- Creator fit tags.
- Apply CTA.

Filters should support:
- For You.
- Local.
- Paid.
- Product.
- Paid + Product.
- Platform.
- Content type.

### Feed

The social marketplace layer.

Feed content can include:
- Brand posts.
- Product drops.
- Campaign calls.
- Creator completed work.
- Brand campaign recaps.
- Creator reviews of campaign experience.
- Brand reviews or creator proof.

The Feed should create confidence that BudCast is an active marketplace, not a static job board.

### Messages

Messages are a main bottom-nav item from day one.

Messages should feel campaign-aware:
- Threads can be tied to accepted campaigns.
- Thread context should show campaign status.
- Product campaigns should guide pickup/product coordination.
- Payment and content approval discussion stays attached to the campaign.

If backend support is incomplete, initial implementation should use clear placeholder states and avoid implying unsupported real-time messaging.

### Work

The creator operational queue.

Work should show:
- Applied campaigns.
- Accepted campaigns.
- Campaigns needing submission.
- Under review submissions.
- Revision requested.
- Approved.
- Payment/product pending.
- Payment/product confirmed.

This replaces generic dashboard summaries with creator action states.

### Profile

The creator public storefront.

Profile should support:
- Avatar/photo.
- Name.
- Handle.
- Location.
- Social links.
- Niche tags.
- Bio.
- Portfolio/previous work.
- Campaign preferences.
- Reviews/proof where supported.
- Cannabis readiness placeholders where not backend-supported.

## Brand App Architecture

Brands need a hybrid experience: social marketplace presence plus campaign management.

Brand navigation should support:
- `Feed`
- `Campaigns`
- `Messages`
- `Creators`
- `Brand Profile`
- Deeper `Campaign Command` surfaces for management

### Brand Social Mode

Brands should feel like active accounts inside a creator network.

Brand social mode should allow or represent:
- Brand profile presence.
- Brand posts.
- Product drops.
- Campaign calls.
- Completed creator work.
- Campaign recaps.
- Marketplace trust signals.

### Campaign Command

Campaign Command remains the deeper brand management workspace.

It should handle:
- Post campaign.
- Review applicants.
- Accept or decline creators.
- Approve content.
- Request revisions.
- Confirm payment.
- Confirm product coordination/product received status.

It should feel more like a production desk than a SaaS dashboard.

### Creator Discovery

Brands should be able to evaluate creators with minimal clicks:
- Avatar/photo.
- Name and handle.
- Location.
- Socials.
- Niches.
- Bio.
- Portfolio preview.
- Previous work.
- Fit signals.
- Reviews/proof where supported.

## Visual Direction

Approved direction: `Obsidian Drop Culture`.

Goals:
- Break away from the current BudCast card/pill/admin grammar.
- Preserve a dark premium atmosphere.
- Make the app feel like a new social marketplace.
- Create urgency and market energy without cannabis clichés.

Visual characteristics:
- Near-black base.
- Warm coral/orange accent replacing most green UI emphasis.
- Green remains primarily tied to the BudCast brand mark and select success/signal states.
- Sharper campaign/feed surfaces.
- Social post structures instead of dashboard panels.
- Campaign cards as posts/drops.
- Creator and brand avatars become more prominent.
- More media/thumbnail presence.
- Less stacked pill noise.
- More tabbed feed/navigation structures.

Motion direction:
- Feed item reveal on scroll/load.
- Campaign drop pulse for new/closing campaigns.
- Smooth segmented control transitions between Campaigns and Feed.
- Message/status updates with subtle activity motion.
- Avoid generic glowing panels and excessive neon.

Typography direction:
- Keep premium display typography where it adds brand authority.
- Use more compact, social-product typography in feeds.
- Reduce large marketing hero blocks inside logged-in product surfaces.

## First Implementation Slice

The first implementation should not rebuild the whole app at once.

Recommended first slice:

1. Create the new creator app shell.
2. Make `Campaigns` the default creator landing surface.
3. Apply the Obsidian visual system to this slice.
4. Convert campaign discovery into a true feed/drop experience.
5. Add bottom navigation: Campaigns, Feed, Messages, Work, Profile.
6. Keep Feed, Messages, and Work initially functional as shells/placeholders if backend support is incomplete.
7. Preserve existing Supabase hooks and backend contracts.

This slice gives the highest visible break from the current design while staying achievable.

## Data And Backend Rules

Backend remains locked.

Do not change:
- Supabase schema.
- RPCs.
- RLS policies.
- Existing production hooks unless strictly required to consume existing data safely.
- External services.
- BFF/API layer.

Use existing data where available:
- Profiles.
- Campaigns/opportunities.
- Applications.
- Content submissions.
- Payment confirmation booleans.
- Existing brand/creator fields.

Use clear placeholders where backend data is missing:
- Social feed posts.
- Real-time messages.
- Campaign-aware threads.
- Reviews.
- Product pickup status if not represented in existing data.
- Brand social posts.
- Creator social posts.

Do not imply placeholder data is live production functionality.

## Terminology Rules

Use:
- Campaigns.
- Feed.
- Messages.
- Work.
- Profile.
- Paid.
- Product.
- Paid + Product.
- Apply.
- Submit content.
- Approve content.
- Request revision.
- Confirm payment.
- Confirm product.
- Coordinate pickup.
- Product received.

Avoid:
- Dashboard as the primary creator concept.
- Workspace.
- Control panel.
- Overview.
- Gifting.
- Hybrid.
- Free product.
- Unpaid.
- Shipping language for cannabis product campaigns.

## Acceptance Criteria

The redesigned creator entry experience should immediately communicate:
- BudCast is a cannabis UGC campaign marketplace.
- Creators can browse and apply to campaigns.
- Brands are active accounts in a social marketplace.
- Campaigns can be paid, product-based, or both.
- Product coordination happens through messaging, not shipping.
- Accepted work moves into a clear work queue.

The design should feel:
- Premium.
- Social.
- Creator-native.
- Cannabis-aware.
- Trustworthy for brands.
- Distinct from the current BudCast dashboard UI.

## Out Of Scope For First Slice

The first slice should not include:
- A real-time messaging backend.
- New database tables.
- New Supabase RPCs.
- Full review system backend.
- Full social posting backend.
- App Store production submission work.
- Brand app full rebuild.

Those can be phased after the creator shell and campaign feed establish the new product direction.

## Spec Self-Review

Placeholder scan:
- The spec defines placeholder-only areas explicitly and does not leave implementation requirements as TBD.

Internal consistency:
- Creator app, brand app, visual direction, and cannabis constraints all align around a social UGC marketplace.

Scope check:
- The full vision is broad, but the first implementation slice is intentionally narrow: creator shell plus Campaigns feed.

Ambiguity check:
- Messaging is defined as a main nav item from day one, but real-time messaging backend is out of scope for the first slice unless existing data supports it.
- Product campaigns explicitly avoid shipping language and use coordination/pickup/product confirmation language.
