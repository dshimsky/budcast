# BudCast Demo Seed Pack

This folder contains reviewable, temporary demo data for local or staging QA.

Nothing here is applied automatically.

## Files

- `seed-social-marketplace-demo.sql` adds fake cannabis brands, creators, campaigns, applications, submissions, conversations, and messages.
- The seed also includes a guarded Shiminsky brand demo block. It only runs when brand profile `15bcadd8-9119-4db1-968a-978471f168e3` exists.

## Safety

- All demo emails use `@demo.budcast.local`.
- All demo IDs are deterministic UUIDs.
- The SQL starts with a cleanup block that removes the same demo data before inserting it again.
- Shiminsky-specific demo rows use `DEMO-SHIMINSKY-*` campaign numbers and the same deterministic demo creator IDs.
- Do not run this against production unless you intentionally want demo data visible there.

## Intended Test Feel

The seed pack is meant to make BudCast feel social and active during sample testing:

- Brand directory has multiple public brand storefronts.
- Campaign feed has active paid, product, and paid + product campaigns.
- Brand dashboard has applicants, accepted creators, content submissions, revision states, and payment/product status examples.
- Messages show active creator-brand coordination.
