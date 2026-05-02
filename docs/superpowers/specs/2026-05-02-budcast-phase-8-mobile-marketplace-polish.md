# BudCast Phase 8 Mobile Marketplace Polish

## Goal

Phase 8 turns the mobile experience from a dark card stack into a clearer cannabis creator marketplace. The mobile app should help creators and brands understand money, product/sample status, deadlines, compliance risk, review state, and trust signals at a glance.

This phase does not change backend schema, payments, auth, messaging tables, or desktop layouts. It improves the mobile web presentation layer and creates reusable visual primitives that can later be carried into the native Expo app.

## Product Direction

BudCast should feel adult, premium, operational, and cannabis-specific. Competitor research shows the standard UGC workflow is brief creation, creator application, product or reimbursement tracking, content submission, review/revision, rights capture, and payment release. BudCast should make that workflow visible in every mobile deal surface.

The differentiator is cannabis fluency: age/location eligibility, compliance-safe language, product/sample handling, restricted claims, usage-right clarity, and trust signals for brands and creators.

## Scope

### In Scope

- Add mobile color/design tokens for app base, surfaces, primary action, success/progress, trust, pending, danger, premium/craft, and muted metadata.
- Add reusable mobile badges and timelines for campaign status, trust/safety, compliance, product/sample, and payment state.
- Redesign creator campaign cards for faster triage: brand identity, campaign visual, payout/product value, content type, platform, deadline, eligibility, trust badges, and primary action.
- Improve brand mobile campaign cards with campaign status, applicant/review/payment metrics, compliance/trust badges, and clearer next action.
- Make mobile color use semantic: lime is the primary action/progress accent, teal/blue is trust, amber is pending, red is danger, tan is craft/premium metadata.
- Keep existing routes and data hooks intact.

### Out of Scope

- Desktop redesign. A desktop audit happens after Phase 8.
- Native Expo parity work. Native implementation follows after mobile web patterns are stable.
- New backend tables or Supabase migrations.
- Payment processing changes.
- Legal compliance automation beyond visual cues already supported by existing data.

## Visual System

Use a restrained premium cannabis palette:

- App base: soft black/charcoal.
- Elevated surfaces: layered charcoal with subtle warm undertones.
- Primary action: BudCast lime on dark.
- Trust/safety: teal/blue.
- Pending/opportunity: amber.
- Danger/error: red.
- Premium/craft: muted tan/gold-brown.
- Metadata: neutral gray/taupe.

Color must never be the only state indicator. Status chips include labels and, where useful, icons or borders. Normal text should target WCAG AA contrast.

## Components

### Mobile Visual Primitives

Create reusable helpers for:

- `MobileStatusPill`
- `MobileTrustBadge`
- `MobileDealTimeline`
- shared mobile color role constants

These should live in a mobile-oriented component module and be reused by creator and brand mobile surfaces.

### Creator Campaign Card

The creator card should answer:

- Who is the brand?
- What do I create?
- What do I earn or receive?
- When is it due?
- Where/platform does it apply?
- Is the brand/payment/compliance path trustworthy?
- What is the next action?

The card keeps one primary CTA and one secondary details action. It avoids image-only selling and avoids burying payout/product information.

### Brand Campaign Card

The brand card should answer:

- What is the campaign state?
- How many applicants, submissions, approvals, and pending payment/product items exist?
- What decision should the brand make next?
- Are there trust/compliance cues visible?

The brand card keeps a single full-width next action and uses badges to reduce paragraph scanning.

## Success Criteria

- Mobile campaign cards are easier to scan without reading full paragraphs.
- Lime no longer carries every meaning in the UI.
- Trust, pending, danger, and premium/craft states have distinct visual roles.
- Creator `Campaigns` and brand `Campaigns` mobile screens remain route-compatible.
- Typecheck and web build pass.
- Local mobile browser review shows no horizontal overflow and no bottom-nav content collision.

## Desktop Follow-Up

After Phase 8 is verified, run a separate desktop audit covering visual hierarchy, desktop campaign operations, brand workspace density, color semantics, responsive transitions, and consistency with the polished mobile system.
