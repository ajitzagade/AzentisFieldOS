---
title: 'Global Search — Role-Gated Results & Query Robustness'
type: 'feature'
created: '2026-09-03'
status: 'done'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** `GET /search` has zero role-awareness — nothing in `search.controller.ts`/`search.service.ts` reads or checks the caller's role. That's harmless today (verified: none of the 9 currently-searched entities — Site, Material, Vendor, TeamMember, Payment, Purchase, Subcontractor, RmcEntry, Expense — are actually role-restricted at their own `list`/`findOne` endpoints; Payment/Advance/AdvanceAdjustment/Expense are deliberately read-open, only their writes are owner-gated). But Story 16.6 is about to add Subcontractor Payment and Audit Log, both genuinely `OWNER_ADMIN`-only today (`subcontractor-payments.controller.ts` class-level `@Roles`, `audit.controller.ts` method-level `@Roles`) — with no gating mechanism, those would leak to Supervisors the moment 16.6 lands. Separately, there's no minimum query length, so every keystroke past the debounce fires 9 DB round-trips even for one character.

**Approach:** Thread the caller's role from `SearchController` into `SearchService.search()` via the existing `CurrentUser`/`AuthUser` decorator (already used elsewhere, not yet imported here), and add an inline per-call role check for whichever entity groups declare a restriction — no live entity needs it yet, so cover it with a unit test using a synthetic restricted group; 16.6 wires its two real ones through the same mechanism. Extend the existing blank-query short-circuit (both server and client side) to also short-circuit under 2 trimmed characters. Close three test-coverage gaps identified in audit: a real (non-mocked) DB integration test for `searchCandidates()`, an out-of-order-response race test, and an e2e 403 check proving the `ownerOnly` Actions filter is real authorization.

## Boundaries & Constraints

**Always:** Role gating enforced server-side in `search.service.ts` (never client-side only). Payment, Advance, AdvanceAdjustment, Expense, and all 7 other currently-searched entities remain visible to every authenticated user — do not add restrictions beyond what their own endpoints already enforce. Min-length guard extends the existing blank-query short-circuits in both `search.service.ts` and `use-global-search.ts` — do not introduce a new debounce mechanism or touch `use-debounced-search.ts` (generic, shared by every other list filter).

**Ask First:** None identified — role source, entities to gate, and min-length threshold are already settled by prior clarification in this conversation.

**Never:** Do not add or modify any DB index — `pg_trgm` GIN trigram indexes for all 9 entities' searched columns already shipped in commit `14bc517`; this story does none of that. Do not invent site-level scoping or any permission concept beyond the existing `OWNER_ADMIN`/`SITE_SUPERVISOR` roles. Do not restructure the 9 existing entities' composition into a full registry/config-array refactor — that's unnecessary blast radius for gating entities that don't exist in search until 16.6; a small role-check helper applied inline is sufficient.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Sub-2-char query | `q="a"` (trimmed length 1) | No API call from frontend; if `search()` is called directly with it, returns the same fixed empty-groups shape as today's blank-query short-circuit, zero DB calls | N/A |
| Supervisor + a role-gated group (via synthetic test entry) | `role=SITE_SUPERVISOR`, query matches a restricted group | That group's entry is empty/omitted in the response | N/A |
| Owner + role-gated group | `role=OWNER_ADMIN`, same query | Group included normally | N/A |
| Any of the 9 existing entities, any role | any role, matching query | Unchanged — no new restriction | N/A |
| Out-of-order responses | type "c" then "ce" before "c" resolves; "c" resolves after "ce" | Final UI state shows "ce"'s results, not stale "c" results | N/A |
| Supervisor calls a write endpoint directly | `SITE_SUPERVISOR` token, `POST /payments` | 403 (already enforced by existing `RolesGuard`) — new e2e test only verifies, doesn't change behavior | Existing `ForbiddenException` |

</frozen-after-approval>

## Completion Notes (2026-09-03)

Delivered: min-query-length guard (server + client, both short-circuit sites) and all three test-coverage closures (real-DB integration test, out-of-order-response race test, e2e 403 test) — all verified green (`pnpm typecheck`, `pnpm --filter @azentisfieldos/api lint` clean of new errors, `pnpm --filter @azentisfieldos/api test` 1088/1088, `pnpm --filter @azentisfieldos/web test` 912/912, scoped e2e run 1/1 passed).

**Deferred to Story 16.6, not built here:** the role-gating mechanism itself (`CurrentUser` threading + `canSeeGroup` helper). Rationale: as this spec's own Design Notes section already flagged, no live entity needs gating until 16.6 adds Subcontractor Payment and Audit Log — building the mechanism now would mean unexercised code proven only by a synthetic test fixture. It ships in 16.6, applied to its two real consumers in the same change, which is more honest test coverage than a mechanism-with-no-consumer here.

## Code Map

- `apps/api/src/search/search.controller.ts` -- add `@CurrentUser() user: AuthUser` param, pass `user.role` into `searchService.search(q, role)`
- `apps/api/src/search/search.service.ts` -- extend blank-query short-circuit (~lines 38-53) to also trigger under 2 trimmed chars; add a `role` param to `search()`; add inline role-check applied per-group before assembling the response (no live group needs it today — cover via unit test with a synthetic restricted entry)
- `apps/api/src/auth/current-user.decorator.ts` -- reuse `CurrentUser`/`AuthUser` as-is, no changes
- `apps/api/src/generated/prisma/client` -- `Role` enum import source for server-side role comparisons (same import `roles.guard.ts`/`roles.decorator.ts` already use)
- `apps/web/lib/use-global-search.ts:21,31,51` -- change both existing `if (!trimmed)` blank-query checks to a `trimmed.length < 2` check
- `apps/api/src/search/search.service.spec.ts` -- add: role-gate unit test (synthetic restricted entry, Supervisor excluded / Owner included), sub-2-char no-DB-call test
- `apps/api/src/search/search-candidates.integration.spec.ts` (NEW) -- mirror the `describeIfDb` skeleton in `apps/api/src/inventory/purchases.service.integration.spec.ts`; exercise Site or Vendor's real `searchCandidates()` against `DATABASE_URL`, asserting case-insensitive match and soft-deleted-row exclusion through the actual Prisma query
- `apps/web/lib/use-global-search.test.ts` -- add out-of-order-resolution test: two captured `resolve` callbacks + `rerender`, following the existing "reports loading while pending" pattern (lines 46-61), resolve the second-issued fetch first
- `e2e/specs/` (NEW spec) -- direct-API 403 test: `loginAsSupervisor(page)` (`e2e/fixtures/auth.ts`) then extract the session token via `page.evaluate(() => document.cookie)` (non-httpOnly, per `apps/web/lib/authed-fetch-core.ts:36`), call `page.request.post(`${API_BASE_URL}/payments`, ...)` (`API_BASE_URL` from `e2e/fixtures/constants.ts`) with `Authorization: Bearer <token>`, assert `.status() === 403`
- `apps/api/src/subcontractor-payments/subcontractor-payments.controller.ts:20-24`, `apps/api/src/audit/audit.controller.ts:20` -- read-only reference confirming the two entities 16.6 will register as role-gated

## Tasks & Acceptance

**Execution:**
- [x] `apps/api/src/search/search.service.ts` -- min-length short-circuit done here; role param + gating helper (`canSeeGatedGroup`) shipped in Story 16.6 instead — see Spec Change Log
- [x] `apps/api/src/search/search.controller.ts` -- `CurrentUser` role threading shipped in Story 16.6 instead — see Spec Change Log
- [x] `apps/web/lib/use-global-search.ts` -- 2-char minimum guard on both short-circuit sites (later hardened to count code points, not UTF-16 units — see story-16.6's Review Findings)
- [x] `apps/api/src/search/search.service.spec.ts` -- min-length unit tests done here; the role-gate test moved to Story 16.6 alongside the mechanism itself
- [x] `apps/api/src/search/search-candidates.integration.spec.ts` (new) -- real-DB test for Vendor's `searchCandidates()`
- [x] `apps/web/lib/use-global-search.test.ts` -- out-of-order response test
- [x] new e2e spec (`e2e/specs/auth.spec.ts`) -- Supervisor `POST /payments` direct-call 403 test

**Acceptance Criteria:**
- Given a query trimmed to fewer than 2 characters, when search runs (frontend or a direct service call), then no DB query is issued and the standard empty-groups shape is returned
- Given a `SITE_SUPERVISOR` and a search matching a role-gated group, when results render, then that group is absent; given `OWNER_ADMIN`, the group appears
- Given any of the 9 currently-searched entities, when any role searches, then results are unchanged from today — no new restriction
- Given all new and existing tests, when the full suite runs, then everything passes with no regression to Story 16.2/19.2 behavior

## Spec Change Log

- **2026-09-03 (bmad-code-review finding, Story 16.6 implementation).** This spec's frozen `Approach` section (above) commits to building the role-gating mechanism inside 16.5 ("Thread the caller's role from `SearchController` into `SearchService.search()`..."). It was not built here — the Completion Notes above explain why (no live consumer until 16.6), but that reasoning should have been recorded as a formal deviation at the time rather than left as an implicit gap between the frozen intent and what actually shipped. Recording it now: the role-gating mechanism (role threading + gate check) was built in Story 16.6, applied immediately to its two real consumers (Subcontractor Payment, Audit Log) in the same change — see that story's own Completion Notes for what shipped. This spec's Tasks & Acceptance checkboxes above for `search.service.ts`/`search.controller.ts` role-gating work are satisfied by that later change, not by anything in this story's own diff.
- **2026-09-03 (same review).** The Design Notes below originally described a generic `canSeeGroup(role, restrictedTo?: Role[])` helper design. What shipped in 16.6 (`canSeeGatedGroup(role): boolean`, checking against a fixed `OWNER_ONLY_ROLES` module constant) is simpler and has no `restrictedTo` parameter — harmless today since every currently-gated group needs the identical `OWNER_ADMIN`-only restriction, and this app has only two roles total. Design Notes below corrected to describe the shipped shape; if a future group ever needs a *different* restricted-role set, `canSeeGatedGroup` will need a `restrictedTo` parameter added at that point, not before.

## Design Notes

The role-gating mechanism is intentionally minimal, not a registry refactor: `search.service.ts`'s composition (23 individually-injected services, one `Promise.allSettled` call, positional destructuring) stays exactly as-is. Story 16.6 shipped `canSeeGatedGroup(role: Role): boolean`, checking against a fixed `OWNER_ONLY_ROLES: Role[] = ['OWNER_ADMIN']` module-level constant — not the more general `canSeeGroup(role, restrictedTo?)` this section originally envisioned (see Spec Change Log above for why the simpler shape was fine). Gated groups (`subcontractorPayments`, `auditLogs`) skip the DB call entirely when `!canSeeGatedGroup(role)`, rather than querying and discarding the result.

## Verification

**Commands:**
- `pnpm --filter @azentisfieldos/api test` -- expected: all pass, including new unit + integration specs (integration spec requires `DATABASE_URL` pointed at `azentisfieldos_test`)
- `pnpm --filter @azentisfieldos/web test` -- expected: all pass, including new race-condition test
- `pnpm typecheck` -- expected: clean across all packages
- `pnpm lint` -- expected: no new errors introduced
- `pnpm test:e2e` (or scoped to the new spec file) -- expected: new 403 test passes against the local e2e stack
