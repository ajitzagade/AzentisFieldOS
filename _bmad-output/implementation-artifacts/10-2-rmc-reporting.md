---
baseline_commit: 16f49ddee67034d0cc664e6851fffdab3a31ca1a
---

# Story 10.2: RMC Reporting

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As Owner/Admin,
I want daily, Site-wise, and Vendor-wise RMC consumption/cost reporting,
so that I can see how much concrete was used and at what cost, sliced the way I need it.

## Acceptance Criteria

1. **Given** RMC delivery entries across multiple Sites, Vendors, and dates, **when** I view RMC reporting, **then** daily, Site-wise, and Vendor-wise totals reconcile exactly to the sum of individual entries. (FR-27)

## Tasks / Subtasks

- [ ] Task 1 — `apps/api` (AC: #1)
  - [ ] `apps/api/src/rmc/rmc-entries.controller.ts` (Story 10.1, extend): `GET /rmc-entries/report?groupBy=day|site|vendor&from=&to=` — a single grouped-aggregate endpoint (`SUM(quantityM3)`, `SUM(totalAmount)`, `COUNT(*)`), not three separate endpoints for the three slices, since they're the same query with a different `GROUP BY` key. Every figure here is a live aggregate over `RmcEntry` — there is no materialized rollup to maintain (unlike `GodownStock`/`TeamMember.outstandingAdvanceBalance` from Epics 5/7), because RMC reporting has no race-safety requirement analogous to a floor check; it's read-only slicing of already-committed history, so AC #1's "reconciles exactly" is true by construction the same way FR-14 (Epic 5) and FR-37 (Epic 6) were, without needing a write-path change here.
- [ ] Task 2 — `apps/web` UI (AC: #1)
  - [ ] Extend `apps/web/app/(app)/rmc/page.tsx` (Story 10.1) with a reporting section: a `groupBy` tab/toggle (Daily / By Site / By Vendor, matching the `tab-chip` pattern already used on `07-movements.html` for a similar slice-selector), rendering Task 1's grouped totals in a `DataTable`.
- [ ] Task 3 — Tests (AC: #1)
  - [ ] `rmc-entries.service.spec.ts` (extend Story 10.1's): each `groupBy` mode sums correctly against a multi-Site/Vendor/date fixture set, and the three modes' totals all reconcile to the same grand total (the concrete proof of "reconciles exactly," not just that each query runs).

## Dev Notes

**This story is a thin, read-only extension of Story 10.1 — the same "read on top of an already-correct write path" shape as Epic 5 Story 5.7 and Epic 7 Story 7.4.** No schema changes, no new write logic. If a `groupBy` total doesn't match the sum of individual `RmcEntry` rows, that's a query bug in this story, not a sign the ledger itself (Story 10.1) needs a parallel correctness mechanism.

**One endpoint with a `groupBy` param, not three.** Daily/Site-wise/Vendor-wise are the same aggregate query with a different grouping key — resist building three near-identical service methods.

**Depends on Story 10.1 entirely.**

**Architecture constraints in force:** AD-3, AD-4, AD-5, AD-6 (an empty date range or a Tenant with no RMC entries yet shows a genuine empty state, not an error).

### Project Structure Notes

- One new endpoint on the existing `rmc-entries.controller.ts` (Story 10.1). No new files.

### References

- [Source: _bmad-output/specs/spec-AzentisFieldOS/functional-requirements.md#CAP-7] (FR-27)
- [Source: _bmad-output/planning-artifacts/stories/phase-5-assets-suppliers/epic-10-rmc/story-10.2-rmc-reporting.md]
- [Source: _bmad-output/implementation-artifacts/10-1-record-rmc-delivery.md — this story's direct prerequisite]
- [Source: _bmad-output/implementation-artifacts/5-7-stock-lifecycle-visibility-low-stock-flagging.md, 7-4-outstanding-advance-visibility.md — the parallel "read-only reconciling rollup" precedent]
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/07-movements.html — tab-chip slice-selector pattern reused here]

## Dev Agent Record

### Agent Model Used

claude-opus-4-8[1m]

### Debug Log References

### Completion Notes List

- Extended the existing `apps/api/src/rmc/rmc.controller.ts` / `rmc.service.ts` (class names `RmcController`/`RmcService`) in place — not new `rmc-entries.*`-named files — since Story 10.1 already implemented them there and `app.module.ts` already wires them.
- **Single grouped-aggregate method, not three:** `RmcService.report(groupBy, {from, to})` handles `day`/`site`/`vendor` with one code path. Each figure is summed in application code over the individual `RmcEntry` rows returned by `findMany` (Prisma Decimal `.toNumber()`), so AC #1's "totals reconcile exactly to the sum of individual entries" is provable in a unit test — the concrete reconciliation test asserts all three slices net to one grand total (qty 95 / cost 583000 / 4 entries) over a multi-Site/Vendor/date fixture that includes a negative-quantity correction (AD-9). Chose in-app summation over SQL `GROUP BY` because day-truncation isn't expressible in Prisma's `groupBy` on a `DateTime` without a computed column, and because it makes the summation itself unit-testable (a mocked `groupBy` would just return pre-summed rows). It remains a live aggregate with no materialized rollup, per the story's framing.
- Day buckets by UTC calendar day (`toISOString().slice(0,10)`), matching `list()`'s existing single-day filter boundary. `to` in the range filter is inclusive of the whole named day (`lt = to + 1 day`). Rows sort day-desc / name-asc for deterministic display.
- Controller: `GET /rmc-entries/report?groupBy=&from=&to=` declared before `@Get(':id')` (same ordering dependency as `stats/this-month`). Defaults to `day` when `groupBy` is absent; 400s on an unrecognized value before reaching the service.
- Web: the groupBy toggle is URL-driven (`/rmc?report=day|site|vendor`) so the slice is a real navigable state; the page stays a server component (matching the codebase's SSR data-fetching convention) and reads `searchParams` (a Promise in this Next 16 setup). Tab-chips use the `07-movements.html` pattern via design-token Tailwind classes (AD-4), wrapped in `role="tablist"`/`role="tab"` with `aria-selected`. Report totals render in the shared `DataTable` with a genuine empty state (AD-6).
- **Code-review follow-up — HTTP-level route-ordering protection:** added `apps/api/src/rmc/rmc.controller.integration.spec.ts` (new), following `patch-body-validation.integration.spec.ts`'s supertest + mocked-service pattern over a real `INestApplication`. Neither `rmc.controller.spec.ts` (calls handlers directly) nor the web `page.test.tsx` (mocks fetch by URL substring) would catch a decorator reorder that lets `@Get(':id')` swallow `/rmc-entries/report` → `findOne('report')` → 404 → RMC page crash. The integration spec asserts `GET /rmc-entries/report?groupBy=site` reaches `report('site', …)` and never `findOne`; `GET /rmc-entries/stats/this-month` reaches `statsThisMonth` and never `findOne` (protects the Story 10.1 route sharing the same ordering dependency); and `GET /rmc-entries/:id` with a real id still reaches `findOne` (wildcard intact). The 3 `no-unsafe-argument` lint warnings on `app.getHttpServer()` are identical to the ones the existing integration spec already carries — same supertest pattern, warnings not errors, no regression.
- Verified: `pnpm --filter @azentisfieldos/api test` (476 passed / 51 skipped), `pnpm --filter @azentisfieldos/web` RMC specs (23 passed), `typecheck` clean on both packages, `eslint` clean (errors) on all changed files, and `pnpm --filter @azentisfieldos/web build` (`/rmc` builds as a dynamic server-rendered route). Did not run repo-wide `pnpm lint` — Story 10.1 documented pre-existing unrelated `apps/api` lint failures on `main`.

### File List

- `apps/api/src/rmc/rmc.service.ts` — added `report(groupBy, {from, to})` grouped-aggregate method + `RMC_REPORT_GROUP_BYS`/`RmcReportGroupBy`/`RmcReportFilters`/`RmcReportRow` exports.
- `apps/api/src/rmc/rmc.controller.ts` — added `GET /rmc-entries/report` (declared before `:id`), with groupBy validation.
- `apps/api/src/rmc/rmc.service.spec.ts` — added `RmcService.report` suite (per-slice sums, three-slice reconciliation, range filter, empty state).
- `apps/api/src/rmc/rmc.controller.spec.ts` — added report-delegation / default-day / 400-on-bad-groupBy cases.
- `apps/api/src/rmc/rmc.controller.integration.spec.ts` — new; HTTP-level route-ordering regression coverage (code-review follow-up).
- `apps/web/app/(app)/rmc/page.tsx` — added the RMC Reporting section (URL-driven tab-chip slice-selector + report `DataTable`); page now reads `searchParams`.
- `apps/web/app/(app)/rmc/page.test.tsx` — added reporting-section tests; updated render helper for `searchParams` and fetch router for the report endpoint.

## Suggested Review Order

**Aggregation logic (the heart of the story — AC #1 reconciliation)**

- Entry point: one grouped-aggregate method keyed by `groupBy`, summed in-app over individual rows (no materialized rollup).
  [`rmc.service.ts:100`](../../apps/api/src/rmc/rmc.service.ts#L100)

- The bucketing key/label helper — day (UTC calendar day) vs siteId vs vendorId.
  [`rmc.service.ts:151`](../../apps/api/src/rmc/rmc.service.ts#L151)

**API surface**

- The `report` endpoint — `groupBy` validation + default, declared before `:id` (route-ordering dependency).
  [`rmc.controller.ts:51`](../../apps/api/src/rmc/rmc.controller.ts#L51)

**Web UI**

- URL-driven (`?report=`) tab-chip slice-selector + report `DataTable`; page now reads `searchParams`.
  [`page.tsx:191`](../../apps/web/app/(app)/rmc/page.tsx#L191)

**Tests (supporting)**

- The concrete AC #1 proof: all three slices reconcile to one grand total over a multi-Site/Vendor/date fixture with a correction.
  [`rmc.service.spec.ts:252`](../../apps/api/src/rmc/rmc.service.spec.ts#L252)

- HTTP-level route-ordering protection (code-review follow-up) — fails loudly if `:id` ever swallows `/report`.
  [`rmc.controller.integration.spec.ts:1`](../../apps/api/src/rmc/rmc.controller.integration.spec.ts#L1)
