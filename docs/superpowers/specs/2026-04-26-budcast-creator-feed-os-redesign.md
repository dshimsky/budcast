# BudCast Creator Feed OS Redesign

## Summary

BudCast is moving from a premium SaaS-style dashboard into a premium cannabis UGC marketplace that feels closer to Instagram/X in energy, speed, and discovery, while staying purpose-built for paid cannabis creator work.

The logo system stays intact. The product UI direction changes.

BudCast should feel like a $100,000 build: premium, sleek, intentional, mobile-first for creators, desktop-powerful for brands, and specific to cannabis creator campaigns. It should not feel like a generic admin dashboard with cannabis copy layered on top.

## Product Positioning

BudCast is the cannabis creator marketplace where:

- Creators discover paid, product, and paid + product campaign opportunities.
- Brands post UGC campaign briefs and review creator applicants.
- Creators submit content and track approval, payment, and product status.
- Brands approve submissions and confirm payment/product workflow.

The product should communicate that real campaign work is happening.

## Approved Direction

The approved direction is **Creator Feed OS**.

This means:

- Creator surfaces should feel like a high-trust campaign feed.
- Brand surfaces should feel like a campaign production queue.
- Creator profiles should feel like storefronts/portfolios.
- Campaign cards should feel like real marketplace posts.
- Workflow status should be visible without turning the UI into stacked SaaS cards.

The visual reference is not a literal copy of Instagram or X. The goal is the product feel: fast scanning, live feed energy, creator identity, social proof, and clear actions.

## Quality Bar

Every major screen should pass these checks:

- Would a cannabis creator instantly understand how to find paid work?
- Would a brand instantly understand how to post a brief and review creators?
- Does the screen feel premium enough for a serious B2B marketplace?
- Does it avoid stoner clichés, cheap neon, and cannabis gimmicks?
- Does it avoid excessive pills, nested boxes, and over-explaining?
- Does the hierarchy feel designed, not assembled?
- Does the mobile experience feel primary for creators?
- Does the desktop experience feel powerful for brands?

## Visual Principles

### 1. Fewer Boxes

The current UI overuses bordered panels, nested cards, and pill boxes. The redesign should use fewer containers and rely more on:

- Typography hierarchy
- Whitespace
- Rows
- Media thumbnails
- Strong card composition
- Selective status badges
- Clear feed grouping

Cards should be reserved for meaningful objects: campaigns, submissions, applicants, creator portfolio items, and queue items.

### 2. Badges With Purpose

Badges should only be used for marketplace signals that users need to scan quickly:

- Paid
- Product
- Paid + Product
- UGC Video
- Reel
- Product Review
- Lifestyle
- New
- Closing soon
- Filling fast
- Submitted
- Under review
- Approved
- Payment pending
- Product pending

Avoid using pills for every metadata item.

### 3. Creator Mobile First

Creators primarily use BudCast on their phone. The creator experience should open with:

- A campaign feed
- Strong brand identity on each campaign
- Compensation and content type visible immediately
- Apply CTA visible early
- Active work queue accessible but not dominant
- Creator profile preview and portfolio visible where relevant

Mobile screens should feel like a premium marketplace/social app, not a shrunken desktop dashboard.

### 4. Brand Desktop Power

Brands primarily use BudCast on desktop. The brand experience should focus on:

- Campaign production
- Applicant review
- Content approval
- Payment/product status
- Public brand profile quality
- Campaign performance and next actions

Brand desktop should feel like a command center, but not like a dense enterprise admin panel.

### 5. Cannabis-Native, Brand-Safe

The UI should speak directly to cannabis UGC work without sounding gimmicky.

Use language like:

- Cannabis creator marketplace
- Paid content opportunities
- Product review
- UGC video
- Lifestyle content
- Campaign brief
- Content approval
- Payment & product status
- Brand-safe guidelines

Avoid language like:

- Stoner references
- Free product
- Gifting
- Unpaid
- Control panel
- Workspace
- Operations
- Generic SaaS overview labels

## Creator Experience

### Creator Dashboard

The creator dashboard becomes a feed-first surface.

Primary structure:

1. Compact creator header/profile preview
2. Campaign feed
3. Active assignments
4. Submissions
5. Payment & product status
6. Applications

The campaign feed should dominate the screen.

Campaign cards should include:

- Brand avatar/logo placeholder
- Brand name
- Verified/brand trust signal if available
- Campaign title
- Compensation type
- Compensation value
- Content type
- Platform target
- Deadline
- Spots remaining
- Location requirement
- Creator fit tags
- Apply CTA

Campaign cards should feel like marketplace posts, not dashboard summary tiles.

### Creator Profile

Creator profile becomes a creator storefront.

It should include:

- Profile photo/avatar
- Creator name
- Public handle
- Location
- Social links
- Niche/category signals
- Short bio
- Portfolio media grid
- Creator proof
- Campaign preferences
- Cannabis readiness
- Profile strength

The profile should visually support media thumbnails and creator proof. It should not feel like account settings.

### Creator Work Queue

Work queue should stay compact and action-driven:

- Campaigns needing submission
- Deadlines approaching
- Active campaigns
- Payments pending
- Product confirmations pending

This should feel like a creator’s current work list, not a dashboard KPI area.

## Brand Experience

### Brand Dashboard

Brand dashboard becomes campaign production.

Primary structure:

1. Brand profile preview
2. Campaign action queue
3. Live campaigns
4. Applicants waiting
5. Content awaiting approval
6. Payment & product status

The brand side should use rows and queues more than big stacked cards.

Brand campaign rows/cards should include:

- Campaign title
- Campaign status
- Compensation type
- Creator spots
- Applications
- Accepted creators
- Submissions
- Approvals
- Payment/product status
- Next action CTA

### Brand Profile

Brand profile must become creator-facing trust content.

It should include:

- Logo/avatar
- Brand name
- Website
- Location
- Product/category signals
- Brand story
- Creator expectations
- Campaign trust notes
- Payment/product expectations
- Public profile preview CTA

The brand profile should help creators decide if they trust the campaign.

### Campaign Builder

The campaign builder should feel like creating a premium UGC brief.

It should reduce visual clutter and use a guided editorial layout:

- Fewer pills
- Cleaner step navigation
- Larger writing areas
- Stronger live preview
- Clear compensation section
- Clear deliverables section
- Clear content guideline section

The builder should feel like writing a high-quality campaign brief, not filling out a generic form.

## Shared Marketplace Components

The redesign should introduce a more coherent presentation layer. This is UI architecture only and does not change backend schema.

Recommended shared UI concepts:

- Campaign feed card
- Brand identity row
- Creator identity row
- Compensation badge
- Content type badge
- Status badge
- Marketplace metadata row
- Media thumbnail grid
- Work queue item
- Applicant review card
- Submission review card
- Payment/product status row

The goal is to reduce repeated one-off layouts and prevent the product from drifting back into card clutter.

## Interaction Feel

BudCast should feel premium and responsive.

Use subtle motion only where it helps:

- Feed card entrance
- Hover elevation on desktop
- Press feedback on mobile
- Smooth transitions between selected filters
- Subtle active state changes

Avoid:

- Excessive glow
- Loud neon animations
- Random decorative motion
- Anything that makes the product feel toy-like

## Typography And Color

The current logo stays.

The premium dark direction stays, but the interface should become more marketplace-native.

Use:

- Near-black background
- Restrained green for brand identity and live/active status
- Gold/tan for primary actions and premium emphasis
- High contrast text
- Serif display type for major moments
- Clean sans-serif for feed, metadata, forms, and actions

Avoid:

- Too many uppercase labels
- Low-contrast body text
- Large paragraph blocks in operational screens
- Green as a decoration everywhere

## Data Rules

No backend changes are part of this redesign.

Existing supported data should be used:

- Profiles: avatar, name, bio, location, Instagram, TikTok, YouTube, niches, portfolio image URLs, reputation metrics
- Campaigns: title, descriptions, campaign type, cash/product fields, content types, categories, location, deadlines, slots, hashtags, brand mention, must-includes, off-limits, reference images
- Applications: pitch/message, status, accepted/rejected/completed dates, completion deadline
- Submissions: post URL, post type, screenshot URL, verification status, revision feedback, payment confirmation booleans

Unsupported data should render as restrained placeholders and never imply live backend functionality.

Placeholder-only data includes:

- Facebook
- LinkedIn
- Product shipped/received
- Age verification
- Usage rights comfort
- Creator equipment/tools
- Rich portfolio metadata
- Cannabis readiness confirmations

## Implementation Scope

This is a redesign of the product presentation layer, not a backend rebuild.

In scope:

- UI hierarchy
- Layout patterns
- Shared marketplace presentation components
- Copy and terminology cleanup
- Responsive behavior
- Campaign/feed/profile/queue presentation
- Visual density cleanup

Out of scope:

- Supabase schema changes
- New RPCs
- New external services
- BFF/API layer
- Payment processor integration
- Real social network integrations beyond existing profile fields

## Rollout Plan

Implementation should happen in phases:

1. Shared design primitives and marketplace presentation components
2. Creator feed/dashboard redesign
3. Creator profile storefront redesign
4. Brand campaign production dashboard redesign
5. Brand profile redesign
6. Campaign builder redesign
7. Campaign detail/application/applicant/submission review cleanup
8. Desktop/mobile QA pass

This phased approach avoids a half-redesigned product with mismatched surfaces.

## Acceptance Criteria

The redesign is successful when:

- The creator side feels like a premium mobile creator marketplace.
- The brand side feels like a premium campaign production system.
- Campaign opportunities feel real and scannable.
- Creator profiles feel portfolio-first.
- Brand profiles feel trustworthy and creator-facing.
- The UI no longer feels like stacked SaaS cards.
- Pills and badges are reduced to high-signal marketplace use only.
- The visual quality feels appropriate for a serious paid build.
- The backend remains unchanged.

## Spec Self-Review

- No backend changes are proposed.
- No unsupported data is presented as live functionality.
- The approved Route A direction is explicit.
- The Instagram/X comparison is treated as product feel, not visual copying.
- The spec is broad enough for the full redesign but phased enough for implementation planning.
- The quality bar is explicit: premium, sleek, cannabis-native, creator-first, brand-safe.
