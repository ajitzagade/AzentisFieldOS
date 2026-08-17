# Story 10.2: RMC Reporting

Status: ready-for-dev

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

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
