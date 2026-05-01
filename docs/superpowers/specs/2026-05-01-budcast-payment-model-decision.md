# BudCast Payment Model Decision

## Decision

BudCast launch will use manual payout/product confirmation, not platform-managed payments. Brands use credits for campaign posting. Creator service payment and product-status follow-up happen off platform, then both sides confirm completion in BudCast.

BudCast will defer Stripe Connect, defer escrow, and defer any automated payout system until legal, tax, KYC, cannabis payment-risk, refund, chargeback, and state-market operating requirements are reviewed.

## Launch Posture

- Credits are for campaign posting and platform access only.
- Paid campaign amounts describe creator services, not cannabis product transactions.
- Product campaign fields describe brand-managed collaboration status, not transfer logistics.
- BudCast records who confirmed payout/product status and when.
- BudCast does not facilitate cannabis transactions, product transfer logistics, escrow, or automated payouts.

## Required Product Behavior

- Campaign creation copy must distinguish creator service compensation from regulated product activity.
- Submission fulfillment must be a manual two-sided confirmation workflow.
- Admin moderation must surface payment disputes and product-not-received flags.
- Reviews and trust badges can use completion evidence, but must not imply BudCast processed payment.

## Deferred Work

- Stripe Connect account onboarding.
- Escrow, holdback, or milestone release flows.
- Automated creator payout.
- Cannabis product transfer, shipping, delivery, or pickup coordination.
- Refund and chargeback automation.
