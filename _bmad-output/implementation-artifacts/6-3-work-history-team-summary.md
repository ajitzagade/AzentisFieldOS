---
baseline_commit: 69304c7c784222ac253b1fda37e51f60875149b0
---

# Story 6.3: Work History & Team Summary

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As Owner/Admin,
I want to view a Team Member's full work history by Team Member or by Site, and see a summary of today's working headcount and totals,
so that I can answer "who worked where, and how much" without cross-referencing multiple screens.

## Acceptance Criteria

1. **Given** Work Records exist across multiple Sites and dates, **when** I query by Team Member, **then** I see every Work Record for that person, chronologically, across all Sites. (FR-21)
2. **When** I query by Site, **then** I see every Team Member who worked there, by date. (FR-21)
3. The Team summary shows total Team Members, today's working headcount, and weekly/monthly payment totals — the payment totals populate once Epic 7 (Advances & Payments) exists, showing zero/empty gracefully until then. (FR-37)
4. Today's working headcount reconciles exactly to the count of distinct Team Members with a Work Record dated today — never an independently-maintained counter.

## Tasks / Subtasks

- [x] Task 1 — `apps/api` read endpoints (AC: #1, #2, #4)
  - [x] `apps/api/src/team/team-members.controller.ts` (Story 6.1, extend): `GET /team-members/:id/work-history` — every `WorkRecord` for that `teamMemberId`, `orderBy: { workDate: 'desc' }`, joined with `site` for display.
  - [x] `GET /work-records?siteId=` — extended `WorkRecordsController`/`WorkRecordsService` (Story 6.2, already in `TeamModule`) with an optional `siteId` query filter on the existing `GET /work-records`, rather than adding a new endpoint under `sites/` — one query capability, not two copies of it.
  - [x] `apps/api/src/team/team-members.controller.ts`: `GET /team-members/team-summary` — `{ totalTeamMembers, todaysWorkingHeadcount, weeklyPaymentTotal, monthlyPaymentTotal, totalOutstandingAdvances }`. `totalTeamMembers`: `count()` on active `TeamMember`s. `todaysWorkingHeadcount`: `count(distinct teamMemberId)` on `WorkRecord` where `workDate = today`. `weeklyPaymentTotal`/`monthlyPaymentTotal`/`totalOutstandingAdvances`: `sum()` queries against `Payment`/`Advance`/`AdvanceAdjustment`.
- [x] Task 2 — `apps/web` UI (AC: #1, #2, #3)
  - [x] `apps/web/app/(app)/team/[id]/page.tsx` — new Team Member detail page: profile fields (name, employment type, contact, current/last Site, today's attendance — the latter two derived client-side from the work-history response's most recent entry, not a new backend field) plus a "Work Record History" `DataTable` (Date / Site / Attendance / Hours-OT columns, per `09-team-member-detail.html`), sourced from Task 1's `work-history` endpoint. The mockup's "Advance Ledger" section is Epic 7 scope entirely — rendered as a single not-yet-available placeholder line, no Advance/Payment UI built here.
  - [x] `apps/web/app/(app)/sites/[id]/page.tsx` — confirmed already satisfied: `site-activity-feed.ts` already joins `workRecords` into the unified feed (`type: 'WORK_RECORD'`), and `feed-type-config.ts` already has a full `WORK_RECORD` entry (label/icon/badge). No new code needed for this bullet — it was already done as part of Epic 2's activity-feed work, ahead of this story.
  - [x] `apps/web/app/(app)/team/page.tsx` (Story 6.1, extend): wired all three stat tiles to the real `GET /team-members/team-summary` response — Today's working headcount and Total Outstanding Advances now render real values (`0`/`₹0` where genuinely zero, not a fabricated `—`). Also wired the list table's `Today's Attendance` and `Current / Last Site` columns from `TeamMembersService.list()`'s now-extended response (Story 6.1's own Dev Notes explicitly forward-referenced this to Story 6.3). Rows now link to the new `/team/[id]` detail page (`rowHref`); the previous inline "Edit" action column was removed since `DataTable`'s `rowHref` wraps every cell in its own `<a>`, and a nested `<Link>` inside that would be invalid/broken markup — Edit is reached via the detail page instead, matching the Sites list's existing pattern.
- [x] Task 3 — Tests (AC: all)
  - [x] `team-members.service.spec.ts` (extended Story 6.1's): `list()`'s `currentOrLastSite`/`todaysAttendance` derivation (present/absent/no-record-yet/not-today cases); `getWorkHistory()`'s 404-on-missing-id and its exact `orderBy`; `getTeamSummary()`'s `todaysWorkingHeadcount` asserted on the query's `distinct: ['teamMemberId']` shape, not just output.
  - [x] A test confirming `team-summary` returns `0` for every numeric field (not an error, not `null`, not omitted keys) when no `Advance`/`Payment` rows exist at all — the concrete proof of AC #3's "showing zero/empty gracefully."
  - [x] `work-records.service.spec.ts`/`work-records.controller.spec.ts`: extended with coverage for the new `siteId` filter on `list()` (both the filtered and unfiltered `where` shapes, and the controller passing `undefined` vs the query param through).

## Dev Notes

**Why the Epic-7-pending totals need no special-casing.** `Payment` and `Advance`/`AdvanceAdjustment` models already exist in `schema.prisma` (drafted ahead of their owning epic, same as Epic 5's inventory models were drafted ahead of Epic 5's stories) — they simply have zero rows until Epic 7 ships the endpoints that write to them. A normal `SUM()`/`aggregate()` query against an empty table returns `0` (or `null` for `_sum`, which Prisma's aggregate API distinguishes — coerce it to `0` at the service boundary so the frontend never has to branch on `null` vs `0`), which *is* "showing zero gracefully" — there is no Epic-7-awareness to build, no feature flag, no conditional rendering based on whether Epic 7 has shipped. Do not write an `if (epic7Exists)` branch or a hardcoded placeholder; a genuine aggregate query already produces the correct answer at every point in the project's timeline, before and after Epic 7 ships.

**One query capability for "Work Records by Site," not two.** Story 6.2 already built `GET /work-records` in `WorkRecordsController`. This story's by-Site view is the same underlying query with a `siteId` filter — extend that endpoint's query params rather than adding a second, slightly-different endpoint under `apps/api/src/sites/`. If `SitesService` needs Work Record data for its own detail-page activity feed, have it call into `WorkRecordsService`, not duplicate the Prisma query.

**Depends on Story 6.1** (`TeamMember`, `TeamModule`) and **Story 6.2** (`WorkRecord`, `WorkRecordsController`'s query surface). Also touches Epic 2's `sites/[id]` detail page and `site-activity-feed.ts` — read those files before extending them, don't fork a second activity-feed mechanism.

**Architecture constraints in force:** AD-3, AD-4, AD-5, AD-6 (the Team Member detail and Site detail pages both need loading/empty/error states for their history tables — a Team Member with no Work Records yet is a normal empty state, not an error).

### Project Structure Notes

- Extends `apps/api/src/team/team-members.controller.ts`/`.service.ts` (Story 6.1) and `work-records.controller.ts`/`.service.ts` (Story 6.2). Extends `apps/web/app/(app)/team/page.tsx` (Story 6.1) and Epic 2's `apps/web/app/(app)/sites/[id]/page.tsx`. New: `apps/web/app/(app)/team/[id]/page.tsx`.

### References

- [Source: _bmad-output/specs/spec-AzentisFieldOS/functional-requirements.md#CAP-5, CAP-10] (FR-21, FR-37)
- [Source: _bmad-output/planning-artifacts/stories/phase-4-people-money/epic-6-team-labour-management/story-6.3-work-history-team-summary.md]
- [Source: infra/prisma/schema.prisma#Payment, Advance, AdvanceAdjustment — pre-existing, zero-row-until-Epic-7 models]
- [Source: _bmad-output/implementation-artifacts/6-1-manage-team-members.md, 6-2-record-daily-work-record-attendance.md — modules/endpoints this story extends]
- [Source: apps/api/src/sites/site-activity-feed.ts — the existing pattern this story's Site-detail extension should follow, not fork]
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/09-team-member-detail.html, 08-team.html]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

- Confirmed before implementing that Epic 2's Site detail page already satisfied Task 2's site-side bullet in full: `site-activity-feed.ts` already includes `workRecords` (joined with `teamMember`) in its unified feed with `type: 'WORK_RECORD'`, and `feed-type-config.ts` already carries a complete config entry for it. No code changes were needed there — this was pre-existing work from Epic 2, not something this story had to build.
- `TeamMembersService.list()` was extended (not duplicated) to include the `currentOrLastSite`/`todaysAttendance` derivation Story 6.1 had explicitly deferred to this story: one Prisma query per Team Member's most-recent `WorkRecord` (`include` + `orderBy: { workDate: 'desc' }` + `take: 1`), no N+1. `todaysAttendance` is `null` unless that most-recent record's `workDate` is today's date, distinguishing "never worked" from "last worked, but not today" — both need a `—`/`null` on the frontend, but the two carry different meaning that the Site column preserves (a `null` attendance still shows the real last Site).
- The Team Member detail page derives "Current Site" and "today's attendance" from the `work-history` endpoint's most recent entry client-side, rather than adding a redundant derivation to `TeamMembersService.findOne()`. `findOne()`'s job (Story 6.1) is the Team Member's own stored fields; `getWorkHistory()`'s response already carries everything needed to compute the same "most recent record" the list page computes server-side — computing it once in `list()` (used by the summary table) and once client-side from data already being fetched for the detail page avoided a second near-identical Prisma query living in the same service.
- Removed the Team list's inline "Edit" action column when adding `rowHref` for row-level navigation to the new detail page: `DataTable`'s `rowHref` wraps every column's cell in its own `<a>`, so a `<Link>` nested inside a cell would produce invalid nested-anchor markup. This matches the Sites list's existing pattern (no inline edit action there either — edit is reached via the Site detail page). The Team Member detail page carries the Edit action instead.
- `WorkRecordsService.list()`/`WorkRecordsController.list()` extended with an optional `siteId` query filter, per Dev Notes' explicit instruction: this is the same query capability Story 6.2 built for `GET /work-records`, filtered — not a second, parallel endpoint under `apps/api/src/sites/`.
- Confirmed the Epic-7-pending totals (`weeklyPaymentTotal`, `monthlyPaymentTotal`, `totalOutstandingAdvances`) need no special-casing: `Payment`/`Advance`/`AdvanceAdjustment` already exist in the schema with zero rows, so a genuine `aggregate()`/`_sum` query against them already returns the correct `0` today, before Epic 7 ships anything. Coerced Prisma's `_sum: null` to `0` at the service boundary (existing project convention) so the frontend never branches on `null` vs `0`.
- Full verification gate run clean: `apps/api` 268 tests / 33 files (up from 254; +11 API-side tests for this story), `apps/web` 245 tests / 66 files (up from 237; +8 web-side tests), both `typecheck`/`lint`/`build` clean for both packages. One `stock.service.integration.spec.ts` failure appeared on a single run (`Stock reconciliation` assertion off by exactly the amount of one prior test's leftover row) — unrelated to this story's Inventory-untouched code, and a clean rerun immediately after passed all 268 tests; consistent with the known transient cross-test-file flakiness pattern already diagnosed in prior sessions on this project, not investigated further.

### File List

- `apps/api/src/team/team-members.service.ts` (modified) — `list()` extended with `currentOrLastSite`/`todaysAttendance` derivation; new `getWorkHistory()`, `getTeamSummary()`.
- `apps/api/src/team/team-members.controller.ts` (modified) — new `GET /team-members/team-summary` (registered before `:id` to avoid a route-matching collision), `GET /team-members/:id/work-history`.
- `apps/api/src/team/team-members.service.spec.ts` (modified) — new coverage for `list()`'s derivation, `getWorkHistory()`, `getTeamSummary()` (including the AC #3 zero/empty-state proof and the AC #4 `distinct` query-shape assertion).
- `apps/api/src/team/team-members.controller.spec.ts` (modified) — delegation tests for the two new endpoints.
- `apps/api/src/team/work-records.service.ts` (modified) — `list()` extended with an optional `siteId` filter.
- `apps/api/src/team/work-records.controller.ts` (modified) — `list()` extended with a `siteId` query param.
- `apps/api/src/team/work-records.service.spec.ts` (modified) — new coverage for `list()`'s filtered/unfiltered query shape.
- `apps/api/src/team/work-records.controller.spec.ts` (modified) — new coverage for the controller passing `siteId` (or `undefined`) through.
- `apps/web/app/(app)/team/[id]/page.tsx` (new) — Team Member detail page: profile card + Work Record History table + Advance Ledger placeholder.
- `apps/web/app/(app)/team/[id]/page.test.tsx` (new).
- `apps/web/app/(app)/team/page.tsx` (modified) — wired all three stat tiles and the Attendance/Site columns to real data; rows now link to the detail page via `rowHref`; removed the now-redundant inline Edit column.
- `apps/web/app/(app)/team/page.test.tsx` (modified) — rewritten for the new `team-summary` fetch and the real derived column values.
