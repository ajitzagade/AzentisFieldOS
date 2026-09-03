---
epic: 16
story: "16.5"
phase: "8 — Post-launch Enhancements"
title: Global Search — Role-Gated Results & Query Robustness
---

# Story 16.5: Global Search — Role-Gated Results & Query Robustness

As any signed-in user,
I want global search results to respect the same role boundaries as the rest of the app, and to avoid wasted requests on trivially short queries,
So that I never see data I'm not authorized to see through search, and typing doesn't fire unnecessary lookups on every keystroke.

**Scope note (2026-09-03):** this story originally also covered adding DB indexes to the searched text columns. That work shipped independently, ahead of this story, in commit `14bc517` ("perf: search indexes, compression, rate-limit backstop, pool sizing, log fetch fix") as part of an unrelated ad-hoc performance-audit effort — and shipped as `pg_trgm` GIN trigram indexes, not the plain B-tree this story originally specified. That distinction matters: a leading-wildcard `contains`/`ILIKE '%q%'` query (which is what every one of these 9 `searchCandidates()` calls runs) cannot use a B-tree index at all — only a trigram/GIN index can serve it. The already-shipped approach is strictly correct where this story's original AC was not. **The indexing AC is removed from this story as already satisfied; no further indexing work is needed.**

**Status: done (2026-09-03).** Delivered: the min-query-length guard (both `search.service.ts` and `use-global-search.ts`) and all three test-coverage closures below. The role-gating *mechanism* itself was deliberately **not** built here — with no live entity to gate yet (Subcontractor Payment/Audit Log don't exist in search until Story 16.6), building it now would mean dead code exercised only by a synthetic test fixture. It ships together with 16.6, applied to its first two real consumers in the same change. The two role-gating ACs below are 16.6's responsibility to close; everything else in this story is done and verified (`pnpm typecheck`/`lint`/`test` on both apps, plus the new e2e spec, all green).

## Background

Audit (2026-09-03) of the Story 16.2/19.2 implementation found `SearchController` carries no `@Roles()` guard at all. Initial analysis assumed this meant every financially-sensitive entity (Payment, Advance, AdvanceAdjustment, Subcontractor Payment) leaked to Supervisors through search. **Verified against the actual controllers, that assumption was wrong for three of the four:**

- `payments.controller.ts`, `advances.controller.ts`, `advance-adjustments.controller.ts` — `@Roles('OWNER_ADMIN')` guards only `create`/`mark-paid`. `list`/`findOne` carry no guard at all, and `advances.controller.ts:24-25` has an explicit code comment: *"Reads stay open to any authenticated user (e.g. a Supervisor viewing a Team Member's outstanding balance)."* A Supervisor can already open `/payments` and `/advances` directly today and see everything. Gating these out of search only would be a **new, inconsistent restriction**, not a fix — the opposite of this story's goal.
- `subcontractor-payments.controller.ts:20-24` — `@Roles('OWNER_ADMIN')` is a **class-level** decorator, gating the entire controller including `list`. Explicit comment: *"money movement against a Subcontractor is an Owner decision."* This one genuinely is read-restricted today.
- `audit.controller.ts:20` — `@Roles('OWNER_ADMIN')` on `@Get()`. Also genuinely read-restricted.
- `expenses.controller.ts` — no `@Roles` anywhere, not even on create. Fully open.

So the actual, code-grounded gap is narrower than first thought: only **Subcontractor Payment** and **Audit Log** need a role gate in search to match existing app behavior; Payment, Advance, AdvanceAdjustment, and Expense should remain visible to every authenticated user, exactly as their list endpoints already are.

Separately — and still live, unlike the indexing gap above — there is no minimum query length, so every keystroke past the debounce triggers 9 concurrent DB round-trips even for a single character.

## Acceptance Criteria

**Given** I am signed in as `SITE_SUPERVISOR`
**When** I search a term matching a Subcontractor Payment record, or an Audit Log entry (once these groups exist — Subcontractor Payment ships in Story 16.6, Audit Log also ships in Story 16.6 using this story's role-gating mechanism)
**Then** neither group appears in my results at all — filtered server-side in `search.service.ts`/the entity registry, not hidden client-side

**Given** I am signed in as `OWNER_ADMIN`
**When** I run the same search
**Then** both groups appear — matching the existing `@Roles('OWNER_ADMIN')` boundary already enforced on `SubcontractorPaymentsController` (class-level) and `AuditController.list()`

**Given** I am signed in as `SITE_SUPERVISOR`
**When** I search a term matching a Payment, Advance, AdvanceAdjustment, or Expense record
**Then** results appear exactly as they do for `OWNER_ADMIN` — no new restriction, since a Supervisor can already view these entities' full list/detail pages directly today (`payments.controller.ts`, `advances.controller.ts`, `advance-adjustments.controller.ts`, `expenses.controller.ts` all leave `list`/`findOne` unguarded)

**Given** the query is fewer than 2 characters after trimming
**When** I search
**Then** no request is issued to the API — extends the existing blank-query short-circuit in `search.service.ts` rather than replacing it

**Given** the existing Story 16.2/19.2 test suites (`search.service.spec.ts`, `search.controller.spec.ts`, `global-search.test.tsx`, `use-global-search.test.ts`)
**When** this story ships
**Then** all existing tests continue to pass unchanged, plus new tests cover: a Supervisor's request excluding owner-only groups, an Owner's request including them, and the sub-2-character no-request guard

**Given** `search.service.spec.ts` today mocks every entity's `searchCandidates()`, so the actual Prisma `where` clause (case-insensitive `contains`, soft-delete/`isActive` filtering) is never exercised at the search layer itself
**When** this story ships
**Then** at least one integration-level test runs a real `searchCandidates()` (e.g. Site or Vendor) against a test database and asserts case-insensitive matching and correct exclusion of soft-deleted/inactive rows through the actual query, not a mock

**Given** `use-global-search.ts`'s closure-based cancellation is believed correct but only exercised today by a single "reports loading while pending" test
**When** this story ships
**Then** a new test issues two overlapping searches (e.g. type "c", then "ce" before the first resolves) with the first response resolving after the second, and asserts the UI shows the second (correct) result set, not the first (stale) one

**Given** the frontend `ownerOnly` filter on `SEARCH_ACTIONS` is currently a UI convenience backed only by a code comment asserting the underlying write endpoints are separately `@Roles('OWNER_ADMIN')`-gated
**When** this story ships
**Then** an integration/e2e test signs in as `SITE_SUPERVISOR` and calls the underlying endpoint for at least one `ownerOnly` action (e.g. `POST /payments`) directly, asserting a 403 — verifying the real authorization boundary, not just the UI hiding the entry point

## References

- `apps/api/src/search/search.controller.ts` — no `@Roles()` today; `apps/api/src/auth/roles.guard.ts` has the existing pattern to reuse
- `apps/api/src/search/search.service.ts` — composition point where the per-entity role gate (a `roles?: Role[]` on each registry entry, defaulting to "all roles" when absent) must be enforced
- `apps/api/src/subcontractor-payments/subcontractor-payments.controller.ts:20-24` — reference pattern for a genuinely read-restricted entity (class-level `@Roles('OWNER_ADMIN')`)
- `apps/api/src/audit/audit.controller.ts:20` — reference pattern for a genuinely read-restricted entity (method-level `@Roles('OWNER_ADMIN')` on `@Get()`)
- `apps/api/src/team/payments.controller.ts`, `apps/api/src/advances/advances.controller.ts`, `apps/api/src/advance-adjustments/advance-adjustments.controller.ts`, `apps/api/src/expenses/expenses.controller.ts` — confirmed unguarded on `list`/`findOne`; these must NOT be role-gated in search, to avoid introducing a restriction stricter than the endpoints themselves
- `infra/prisma/migrations/20260902200934_add_pg_trgm_search_indexes/` — already-shipped indexing fix (commit `14bc517`); no further indexing work needed in this story
- `packages/shared/src/content/help-content.ts:627-634` — existing comment documenting the write-side `ownerOnly` gating on `SEARCH_ACTIONS`; unrelated to entity-result gating (this story only touches entity results, not the Actions list)
- Note for whoever picks this up: as of this story, no currently-searched entity (Site, Material, Vendor, TeamMember, Payment, Purchase, Subcontractor, RmcEntry, Expense) actually needs a role gate — the mechanism built here has no live consumer until Story 16.6 adds Subcontractor Payment and Audit Log. Build the registry's role-gating support and cover it with a unit test using a synthetic restricted entry; the end-to-end Given/When/Then above becomes fully verifiable once 16.6 lands.
- Audit findings, this conversation (2026-09-03): no site-level access control exists anywhere in the app today (flat `OWNER_ADMIN`/`SITE_SUPERVISOR` roles, no `SiteAssignment` model) — this story does not add site-scoping, only role-scoping consistent with what every other endpoint already enforces

### Review Findings (2026-09-03 — bmad-code-review, covering 16.5+16.6 jointly)

- [ ] [Review][Patch] Min-query-length guard counts UTF-16 code units, not code points — a single astral-plane character (most emoji) has `.length === 2` and slips past the intended "at least 2 real characters" threshold [`apps/api/src/search/search.service.ts:90`, `apps/web/lib/use-global-search.ts:31,51`]
- [ ] [Review][Patch] AC "any of the 9 currently-searched entities, when any role searches, results unchanged" has no explicit test — only the 2 gated groups' exclusion/inclusion is tested for role; no spot-check that an unrelated group (e.g. Sites) still returns normally for a Supervisor. Implementation is correct; this is a coverage gap only [`apps/api/src/search/search.service.spec.ts`]
- [ ] [Review][Patch] The frozen `<frozen-after-approval>` Approach section in `spec-16-5-search-security-and-performance-hardening.md` commits to building the role-gating mechanism in 16.5; the Completion Notes below it say it was deliberately deferred to 16.6. That's a real deviation from a frozen block, and the doc's own `## Spec Change Log` section (which exists to record exactly this) was left empty. Related: the same doc's Design Notes describe a generic `canSeeGroup(role, restrictedTo?)` helper; the shipped code is a simpler hardcoded `canSeeGatedGroup(role)` with no `restrictedTo` param — harmless today (only one restricted-role set exists in the whole app) but the doc no longer matches the code [`_bmad-output/implementation-artifacts/spec-16-5-search-security-and-performance-hardening.md`]
