---
title: 'Submitted Daily Reports — cross-Site list and Edit (reskinned Correct)'
type: 'feature'
created: '2026-09-23'
status: 'in-review'
review_loop_iteration: 0
context: []
baseline_commit: '21a2a2e4e384d240a74c0fa6b5b8f9a7607399fc'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Once a Daily Report is submitted there is no way to browse the full history of submitted reports across all Sites/dates — `/daily-activity` only shows one date's per-Site status board. And "Edit" isn't exposed as such: the existing append-only Correct flow works, but reads as a cryptic ledger term with no visible version history.

**Approach:** Add a new date-wise "Submitted Daily Reports" list (all Sites, filterable/sortable/paginated) linked from `/daily-activity`, and reskin the existing Correct entry point as "Edit" with a version-history view. The underlying append-only correction mechanism (AD-9) does not change — only labeling and a new list surface.

## Boundaries & Constraints

**Always:**
- Reuse Story 16.1's list platform (`useListQueryState`, `Pagination`, `DataTable` sort) — no bespoke pagination.
- `POST /dsr/:id/correct` and its persistence model are unchanged — Edit only relabels the existing UI/UX.
- Only the current (non-superseded) version of each report appears as a row — same rule as `listByDate`/`listBySiteInRange` (`superseded-dsrs.ts`).
- "Submitted Time" = the root/original submission's own `createdAt` (walk the `correctsId` chain back to its first entry). "Last Updated Time" = the current row's own `createdAt`. An unedited report has both equal.
- "Status" shows "Original" or "Edited" (chain length > 0) — not a lifecycle/void state (Void is a separate, later spec).
- DRAFT reports never appear (matches every existing submitted-report read path).

**Never:** Add a raw `UPDATE`/`DELETE` path for a SUBMITTED report (that's the deferred Void spec); change `/daily-activity`'s existing per-site-per-day board — it stays as-is, this is an additive new view.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Never edited | report O only | Submitted Time = Last Updated Time = `O.createdAt`, Status = "Original" | N/A |
| Edited once | O → C1 (current) | Submitted = `O.createdAt`, Last Updated = `C1.createdAt`, Status = "Edited" | N/A |
| Edited twice | O → C1 → C2 (current) | Submitted = `O.createdAt` (2-hop walk), Last Updated = `C2.createdAt` | N/A |
| Filter by Site + date range + search | `siteId`/`from`/`to`/`q` | server-side filtered, AND-combined, paginated | N/A |
| Click Edit | current row | opens the existing correct form, relabeled "Edit" | N/A |
| No reports match filters | e.g. `q=xyz` | "no results match your filters" + Clear filters (AD-6) | N/A |
| Nothing submitted yet | zero SUBMITTED rows | "nothing recorded yet" empty state (AD-6) | N/A |

</frozen-after-approval>

## Code Map

- `apps/api/src/dsr/dsr-correction-chain.ts` (new) -- `getSubmissionChain(prisma, row)`: walks `correctsId` backward (bounded loop, same pattern as `dsr.service.ts`'s existing `collectCorrectsIdAncestors`) to the root; returns `{ submittedAt, versions: {id, createdAt, submittedByName, reason}[] }` ordered oldest→newest. Shared by both the new list and `findOne`.
- `apps/api/src/dsr/dsr.service.ts` -- add `listAllSubmitted(query)`: paginated/sortable (`reportDate|createdAt`) list across all Sites, filters `siteId`/`from`/`to`/`q` (Site name + Submitted By name, same OR shape as `searchCandidates`), same `site`/`submittedBy` include as `listByDate`, current-version-only filter, then `getSubmissionChain` per page row for Submitted Time/Status. Extend `findOne` (`:1648`) to also call `getSubmissionChain` and return `versionHistory`.
- `apps/api/src/dsr/dsr.controller.ts` -- add `@Get('history')` calling `listAllSubmitted` — **must be declared before** the existing `@Get(':id')` (`:124`) so NestJS doesn't match `history` as an `:id` param, same ordering already used for `drafts`/`draft`/`defaults`.
- `apps/web/app/(app)/daily-activity/history/page.tsx` + `history-list-client.tsx` (new) -- the list screen: Site/date-range/search filters, sortable Report Date/Submitted Time/Last Updated columns, Status badge, Open/Edit row actions, Story 16.1 platform throughout.
- `apps/web/app/(app)/daily-activity/page.tsx` -- add one link to the new history view; existing per-day board unchanged.
- `apps/web/app/(app)/daily-activity/[id]/page.tsx:242-265` -- relabel "Correct" button → "Edit", "This is a correction…" banner → "This is an edited version…", "This report was corrected — view the latest version" → "This report has a newer edited version — view it"; add a small "Version history" list rendering `versionHistory` (each entry links to `/daily-activity/{id}`).
- `apps/web/app/(app)/daily-activity/[id]/correct/page.tsx` -- relabel page title/submit button "Correct" → "Edit"; `mode="correct"`, route path, and the `POST /dsr/:id/correct` call are unchanged (display-text-only rename, matching the existing "Waste Disposal"→"Waste Material" precedent).

## Tasks & Acceptance

**Execution:**
- [x] `apps/api/src/dsr/dsr-correction-chain.ts` -- add `getSubmissionChain()` -- single shared chain-walk for list + detail
- [x] `apps/api/src/dsr/dsr.service.ts` -- add `listAllSubmitted()`; extend `findOne()` with `versionHistory`
- [x] `apps/api/src/dsr/dsr.controller.ts` -- add `GET /dsr/history` (declared before `:id`)
- [x] `apps/api/src/dsr/dsr.service.spec.ts` -- unit tests covering every I/O matrix row
- [x] `apps/web/app/(app)/daily-activity/history-list-client.tsx` -- new list UI
- [x] `apps/web/app/(app)/daily-activity/history/page.tsx` -- fetch + render
- [x] `apps/web/app/(app)/daily-activity/page.tsx` -- add link to history view
- [x] `apps/web/app/(app)/daily-activity/[id]/page.tsx` -- relabel copy, add version-history list
- [x] `apps/web/app/(app)/daily-activity/[id]/correct/page.tsx` -- relabel copy only
- [x] component/page tests for the new list (filters/sort/pagination/both empty states) and the relabeled detail page's version-history rendering

**Acceptance Criteria:**
- Given a report edited twice, when I open `/daily-activity/history`, then its row shows Submitted Time = the original submission's time and Last Updated = the latest edit's time, Status "Edited".
- Given I click "Edit" on a current report, then the existing correct form opens (same behavior as today's Correct), now labeled "Edit".
- Given a report has 2 prior versions, when I open its detail page, then a "Version history" list shows all 3 versions oldest→newest, each linking to that version's detail page.
- Given a search/filter matches nothing, then the "no results match your filters" empty state with Clear filters appears.

## Design Notes

The chain-walk (`getSubmissionChain`) runs once per row on the current page only, not the whole table — matching the existing, already-accepted `collectCorrectsIdAncestors` pattern in this same file for a similar bounded lookup. Correction chains are expected to be short in practice (0–2 hops); this is a deliberate small-N walk, not a recursive SQL CTE.

## Verification

**Commands:**
- `pnpm --filter @azentisfieldos/api test -- dsr.service.spec.ts` -- all pass
- `pnpm --filter @azentisfieldos/web test -- history-list-client.test.tsx page.test.tsx` -- all pass
- `pnpm --filter @azentisfieldos/api typecheck && pnpm --filter @azentisfieldos/web typecheck` -- no errors

**Manual checks:**
- Edit a report twice; open `/daily-activity/history` and confirm Submitted/Last Updated/Status are correct; open the detail page and confirm the version-history list shows all 3 versions.
