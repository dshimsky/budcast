# BudCast Phase 9 Creator Application Moments

## Goal

Phase 9 makes creator applications feel alive and understandable. Applying, waiting, getting accepted, and getting declined should each have a clear visual state, useful next action, and restrained motion.

## Scope

### In Scope

- Creator campaign detail application panel.
- Creator dashboard application cards.
- Creator campaign feed card press/CTA feedback.
- Application visibility for declined applications.
- CSS motion utilities for application moments.

### Out of Scope

- Brand applicant review changes.
- Backend status changes or new migrations.
- Push notifications.
- Full native Expo parity.

## Interaction Design

### Apply Click

Campaign cards should feel tappable. The action should have press scale, stronger focus state, and a short transition cue when opening a campaign brief.

### Application Submitted

After successful submission, the creator sees a success moment:

- `Application sent`
- a visible animated success/check treatment
- copy explaining that the brand is reviewing profile, pitch, and portfolio
- a timeline advanced to `Applied`
- next action: `Track application`

### Pending Review

Pending applications stay visible. They show a soft animated review rail and the label `Brand reviewing`.

### Accepted

Accepted applications should feel like a win. They show:

- `Accepted by brand`
- success tone
- next action `Coordinate details` or `Submit content`
- a timeline advanced into active work

### Declined

Declined applications should not disappear. They show:

- `Not selected`
- warm amber/tan tone, not red
- copy that says the campaign was not a match
- next action toward similar campaigns or profile improvement

## Motion Rules

- Motion must be purposeful: press feedback, submitted pulse, pending shimmer, status rail.
- Respect `prefers-reduced-motion`.
- Avoid constant bouncing or decorative noise.

## Success Criteria

- Declined applications are visible in creator application history.
- The creator detail page has explicit submitted, pending, accepted, and declined application states.
- Dashboard application cards distinguish pending, accepted, declined, completed, and disputed states.
- Focused regression tests pass.
- `npm run typecheck` and `npm run build:web` pass.
