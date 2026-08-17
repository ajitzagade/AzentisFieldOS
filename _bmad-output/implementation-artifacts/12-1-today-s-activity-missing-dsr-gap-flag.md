# Story 12.1: Today's Activity & Missing-DSR Gap Flag

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As Owner/Admin,
I want to open the Dashboard and see today's activity across all Sites — sites active, labour working, materials received/consumed, RMC used, machinery in use, expenses — with an explicit flag for any Site that hasn't reported yet today,
so that I know what happened today and what needs my attention, without phoning anyone.

## Acceptance Criteria

1. **Given** DSRs and transactions exist for some Sites today, **when** I open the Dashboard, **then** each Today's Activity stat tile drills down into the real screen behind it (Daily Activity, Inventory/Movements, Team, Machinery, Expenses). (SM-3)
2. **Given** a Site has not submitted a DSR yet today, **when** I view the Dashboard, **then** a Gap Flag names that Site explicitly — never a silent absence in a list. (FR-35)

## Tasks / Subtasks

- [ ] Task 1 — `apps/api` (AC: #1, #2)
  - [ ] `apps/api/src/dashboard/dashboard.controller.ts` + `.service.ts` + `.module.ts` (`DashboardModule`, its own module — this story is purely a read-aggregation layer over seven other epics' already-existing tables, it owns no data of its own). Register in `app.module.ts`.
  - [ ] `GET /dashboard/today` returns `{ sitesReportingToday, labourWorkingToday, materialsReceivedToday, materialsConsumedToday, rmcUsedTodayM3, machineryInUse, expensesToday, sitesMissingDsrToday: [{ siteId, name }] }`. Each figure is a same-day aggregate:
    - `sitesReportingToday`: `COUNT(DISTINCT siteId)` on `DailySiteReport` where `reportDate = today` (Epic 3).
    - `labourWorkingToday`: reuse Epic 6 Story 6.3's `todaysWorkingHeadcount` computation (call `TeamMembersService`'s existing method — do not recompute the same distinct-Team-Member-with-a-Work-Record-today query a second time in this module).
    - `materialsReceivedToday` / `materialsConsumedToday`: `COUNT(*)` on `Purchase` / `Consumption` (Epic 5) where `purchasedAt`/`consumedAt = today`.
    - `rmcUsedTodayM3`: `SUM(quantityM3)` on `RmcEntry` (Epic 10) where `deliveredAt = today`.
    - `machineryInUse`: `COUNT(*)` on `Machinery` (Epic 8) where `currentStatus = 'AT_SITE'` — this one is **not** day-scoped, it's the live materialized current state (Epic 8 Story 8.2's `currentStatus` column), consistent with the mockup showing it as a snapshot, not a "today" delta.
    - `expensesToday`: `SUM(amount)` on `Expense` (Epic 11) where `incurredAt = today`.
    - `sitesMissingDsrToday`: every active `Site` whose `id` is not in the set of `siteId`s with a `DailySiteReport` where `reportDate = today` — this is a set-difference query (`Site` minus the distinct-reporting-Sites set from the first bullet), not a per-Site loop.
  - [ ] "Today" means the deployment's configured local timezone's calendar day (per the architecture spine's Consistency Conventions: "Timestamps: stored UTC ISO-8601, rendered in the deployment's configured local timezone") — compute the day boundary in that timezone, not naive UTC midnight, or a Site whose Supervisor submits a DSR at 11 PM local time could be wrongly flagged as missing.
- [ ] Task 2 — `apps/web` UI (AC: #1, #2)
  - [ ] Replace the stub `apps/web/app/(app)/page.tsx` with the real Dashboard: a "Today" section with the seven stat tiles from `01-dashboard.html` (Sites Reporting Today, Labour Working Today, Materials Received Today, Materials Consumed Today, RMC Used Today, Machinery In Use, Expenses Today), each tile a link per AC #1's drill-down requirement:
    | Tile | Links to |
    |---|---|
    | Sites Reporting Today | `/daily-activity` |
    | Labour Working Today | `/team` |
    | Materials Received Today | `/movements` |
    | Materials Consumed Today | `/movements` |
    | RMC Used Today | `/rmc` |
    | Machinery In Use | `/machinery-vehicles` |
    | Expenses Today | `/expenses` |
  - [ ] One `GapFlag` per entry in `sitesMissingDsrToday` (not a single flag naming all of them at once if more than one Site is missing — each is its own named row, matching the epic's own "never a silent absence" framing and `GapFlag`'s one-message-one-action contract from `packages/ui`), message text "‹Site name› has not submitted a Daily Site Report yet today," action "View Site" linking to `/sites/[id]` (Epic 2).
  - [ ] A Tenant with zero Sites reporting and zero Sites overall shows the ordinary empty/zero states each tile already handles (`0`, not an error) — this story doesn't need special zero-Site handling itself, Story 12.2 owns the explicit zero-Site empty state for the page as a whole.
- [ ] Task 3 — Tests (AC: all)
  - [ ] `dashboard.service.spec.ts`: each figure computed correctly against a multi-Site fixture; `sitesMissingDsrToday` correctly excludes Sites that did report and includes ones that didn't, including the zero-DSR-today case (all active Sites listed); timezone boundary test (a DSR submitted just before/after local midnight lands on the correct day).
  - [ ] `apps/web` component test: one `GapFlag` rendered per missing Site, not one combined message.

## Dev Notes

**This module reuses, it doesn't reimplement.** By this story, "distinct Team Members with a Work Record today" already exists as Epic 6 Story 6.3's `todaysWorkingHeadcount`. Call that service method rather than writing the same Prisma query a second time in `DashboardService` — this is the same discipline every prior epic has applied to its own cross-cutting queries (Epic 6 Story 6.3 on `WorkRecord`, Epic 9 Story 9.2 on `Purchase`).

**Timezone correctness is a real, easy-to-miss bug here, not a nicety.** A naive `WHERE reportDate = CURRENT_DATE` comparison evaluated in UTC will misclassify DSRs submitted in the evening in India (UTC+5:30) as "yesterday," producing false gap-flags for Sites that actually did report. The architecture spine's Consistency Conventions section is explicit that timestamps render in "the deployment's configured local timezone" — apply that same rule to this story's day-boundary queries, not just to display formatting elsewhere.

**Depends on**: Epic 2 (`Site`), Epic 3 (`DailySiteReport`), Epic 5 (`Purchase`, `Consumption`), Epic 6 Story 6.3 (`todaysWorkingHeadcount`), Epic 8 Story 8.2 (`Machinery.currentStatus`), Epic 10 (`RmcEntry`), Epic 11 (`Expense`) — this is why the epic's own Implementation Notes sequence it last among feature epics. If any of those are still mid-implementation when this story is picked up, its aggregate for that domain will legitimately read `0`, which is correct behavior, not a bug to work around.

**Architecture constraints in force:** AD-3, AD-4, AD-5, AD-6 (a zero-activity day is a real, valid state — every tile shows `0`, not an error), NFR — timezone handling per the Consistency Conventions.

### Project Structure Notes

- New `apps/api/src/dashboard/` module — read-only, owns no Prisma models of its own.
- `apps/web/app/(app)/page.tsx` already exists as a stub (Epic 1 scaffold, `EmptyState`) — this story (with Story 12.2) replaces it.

### References

- [Source: _bmad-output/specs/spec-AzentisFieldOS/functional-requirements.md#CAP-10] (FR-35)
- [Source: _bmad-output/planning-artifacts/epics/phase-6-insight-delivery/epic-12-dashboard-cross-site-rollup.md — explicit "sequenced last" dependency note]
- [Source: _bmad-output/planning-artifacts/stories/phase-6-insight-delivery/epic-12-dashboard-cross-site-rollup/story-12.1-todays-activity-gap-flag.md]
- [Source: infra/prisma/schema.prisma#DailySiteReport, Purchase, Consumption, RmcEntry, Machinery, Expense]
- [Source: _bmad-output/implementation-artifacts/6-3-work-history-team-summary.md — todaysWorkingHeadcount reused here]
- [Source: _bmad-output/planning-artifacts/architecture/architecture-AzentisFieldOS-2026-08-11/ARCHITECTURE-SPINE.md#Consistency Conventions — local-timezone rendering rule]
- [Source: packages/ui/src/components/gap-flag.tsx]
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/01-dashboard.html]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
