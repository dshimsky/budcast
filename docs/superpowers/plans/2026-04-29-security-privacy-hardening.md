# Security And Privacy Hardening Implementation Plan

> **For implementation:** Follow TDD where practical. For SQL-only behavior, add migration regression checks that assert critical policy/RPC text exists, then verify against Supabase migration push and type/build commands.

**Goal:** Harden the current Supabase marketplace for real user testing by protecting privileged account fields, sensitive RPCs, social safety boundaries, feed visibility, and local ops APIs.

**Architecture:** Keep Supabase Postgres/RLS as the security boundary. Keep existing shared hooks and Next.js routes. Add narrow RPCs and RLS policies instead of adding a BFF or external service.

---

## Steps

- [ ] Add regression tests for security migration invariants.
- [ ] Add migration `022_security_privacy_hardening.sql`.
- [ ] Create `profile_blocks` and `safety_reports` with RLS.
- [ ] Replace broad profile update policy with RPC-only safe profile updates.
- [ ] Harden `apply_to_campaign_rpc` with `auth.uid()` validation.
- [ ] Fix feed visibility policies for `followers` and `private`.
- [ ] Add block checks to follows, conversations, and messages.
- [ ] Update shared profile save hook to call the safe RPC.
- [ ] Add shared safety types/helpers if needed.
- [ ] Protect `mission-control` and `agent-floor` API routes outside development.
- [ ] Run migration push, shared tests, typechecks, build, and diff check.

## Verification

- `node --test packages/shared/tests/security-hardening.test.ts`
- `npm run typecheck -w @budcast/shared`
- `npm run typecheck -w @budcast/web`
- `npm run build:web`
- `git diff --check`
- `npx supabase migration list --linked`

## Launch Notes

- This pass adds backend safety primitives. It does not build a full moderation dashboard yet.
- Reporting and blocking can be wired into more UI surfaces after the backend rules are in place.
- Account deletion/export and full legal/privacy UX should follow as a separate pass.
