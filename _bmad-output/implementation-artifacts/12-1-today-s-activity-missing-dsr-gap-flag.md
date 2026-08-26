---
baseline_commit: 1218a603b227b0bc12da1fadb0953dc6baf8d127
---

# Story 12.1: Today's Activity & Missing-DSR Gap Flag

Status: done

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

Opus 4.8 (1M context) — claude-opus-4-8[1m]

### Debug Log References

### Completion Notes List

- New `apps/api/src/dashboard/` module — a pure read-aggregation layer that owns no Prisma models of its own (`DashboardModule` imports `TeamModule` only). `GET /dashboard/today` returns every field the story specifies; each same-day figure is a genuine aggregate, coercing Prisma's `_sum: null` to `0` at the service boundary so a zero-activity day reads `0`, not an error (AD-6).
- **Labour reuses, doesn't reimplement.** `labourWorkingToday` comes from calling the existing `TeamMembersService.getTeamSummary().todaysWorkingHeadcount` (Epic 6 Story 6.3) — the distinct-Team-Member-with-a-Work-Record-today query is not written a second time here. Required exporting `TeamMembersService` from `TeamModule` (added `exports: [TeamMembersService]`).
- **Timezone correctness is real, not a nicety.** Introduced `apps/api/src/dashboard/local-day.ts`: `localDayRange(now, timeZone)` computes the deployment-local calendar day (`APP_TIMEZONE` env var, default `Asia/Kolkata`) via `Intl.DateTimeFormat`, returning a `@db.Date` value for `DailySiteReport.reportDate` equality and a half-open `[startUtc, endUtc)` range for the `DateTime` columns (`purchasedAt`/`consumedAt`/`deliveredAt`/`incurredAt`). This is what prevents a DSR submitted at 11 PM IST from being wrongly flagged as a missing-DSR gap. `machineryInUse` is deliberately **not** day-scoped — it's the live `Machinery.currentStatus = 'AT_SITE'` materialized snapshot (Epic 8 Story 8.2), matching the mockup.
- `sitesMissingDsrToday` is a set-difference (active `Site`s minus the distinct reporting-Site set), not a per-Site loop; the frontend renders one `GapFlag` per entry (never a single combined flag), each naming the Site and offering a "View Site" action to `/sites/[id]` (FR-35 — "never a silent absence").
- **`apps/web/app/(app)/page.tsx` note:** the story describes replacing a "stub" page, but the demo-ready commit (`ae9fc63`) had already fleshed this file into a different dashboard that client-side-aggregated across many endpoints and used a `Badge` ("Not submitted") rather than a `GapFlag`. Per "the spec is the sole source of truth," I replaced it with the story-scoped Dashboard: the seven "Today" stat tiles (each a real drill-down link per AC #1) backed by the single new `GET /dashboard/today` endpoint, plus one `GapFlag` per missing Site (AC #2). The demo page's extra "Overall"/"Sites"/charts sections were **not** carried over — they are out of this story's scope (Story 12.2 owns the rest of the page, including the explicit zero-Site empty state). This is a deliberate, called-out decision; if preserving those demo sections is desired they should be folded into Story 12.2.
- **Review patch — Labour tile now honours the same local-day boundary.** `getTeamSummary()` computed "today" as naive UTC, so on IST (UTC+5:30) the Labour tile would lag the other six same-day tiles by a full calendar day for the first 5.5 hours of every local day. Fixed by giving `getTeamSummary` an optional `{ today?: Date }` param (defaults to the prior UTC behavior, so the Team page controller's existing call is unchanged) and having `DashboardService` pass its local `dateOnly` through. Added a `dashboard.service.spec` case asserting the labour figure is derived from the local day (an instant just after IST midnight → the query is pinned to the 27th, not the UTC 26th). The Team page's own headcount still defaults to UTC — a pre-existing, already-deferred systemic item (Story 6.3 review), intentionally not widened here to avoid destabilizing Epic 6's other caller.
- No schema change (read-only aggregation), so no migration.
- **Verification:** `apps/api` typecheck clean; `apps/api` full Vitest suite 513 passed / 51 skipped (dashboard adds 13 tests across 3 files). `apps/web` typecheck + lint clean; full Vitest suite 495 passed (page adds 3 tests). All my changed files lint clean (`eslint` exit 0). A pre-existing lint failure in `apps/api/src/team/payments.service.spec.ts` (Epic 7, untouched by this story) surfaced during the fresh-worktree install's dependency resolution — not introduced here and out of scope. `apps/api`'s dev server cannot boot outside Vitest (documented repo limitation), so the endpoint was verified via unit tests with a mocked Prisma client and the page via component tests with mocked `fetch`, consistent with how prior epics on this project verified.

### File List

- `apps/api/src/dashboard/local-day.ts` (new) — timezone-correct local-day boundary helper (`APP_TIMEZONE`, default `Asia/Kolkata`).
- `apps/api/src/dashboard/local-day.spec.ts` (new) — IST day-boundary tests (instants just before/after local midnight, half-open-range width, non-IST zone).
- `apps/api/src/dashboard/dashboard.service.ts` (new) — `getToday()` aggregate.
- `apps/api/src/dashboard/dashboard.service.spec.ts` (new) — per-figure correctness, gap-flag set-difference (incl. zero-DSR-today), `_sum`-null→0, distinct-Site and AT_SITE query shapes, timezone-boundary assertion.
- `apps/api/src/dashboard/dashboard.controller.ts` (new) — `GET /dashboard/today`.
- `apps/api/src/dashboard/dashboard.controller.spec.ts` (new) — delegation test.
- `apps/api/src/dashboard/dashboard.module.ts` (new) — `DashboardModule` (imports `TeamModule`).
- `apps/api/src/app.module.ts` (modified) — registered `DashboardModule`.
- `apps/api/src/team/team.module.ts` (modified) — exports `TeamMembersService` for reuse.
- `apps/api/src/team/team-members.service.ts` (modified) — `getTeamSummary` takes an optional `{ today }` so the Dashboard can pin the working-headcount to its local-timezone day (default UTC behavior preserved for the Team page caller).
- `apps/web/app/(app)/page.tsx` (modified) — real Dashboard: seven "Today" stat tiles (drill-down links) + one `GapFlag` per missing Site, from `GET /dashboard/today`.
- `apps/web/app/(app)/page.test.tsx` (new) — seven-tile drill-down links; one GapFlag per missing Site (not combined); no flags when all reported.

## Suggested Review Order

**Timezone-correct day boundary (the story's core hazard)**

- Entry point: the local-day helper — DST-aware `Intl`-based boundary, `@db.Date` value + half-open UTC range.
  [`local-day.ts:1`](../../apps/api/src/dashboard/local-day.ts#L1)

**Aggregation**

- `getToday()` — six same-day aggregates + the reused (now local-day-pinned) labour headcount; set-difference gap flags.
  [`dashboard.service.ts:29`](../../apps/api/src/dashboard/dashboard.service.ts#L29)

- The reuse seam: `getTeamSummary` gains an optional `{ today }` (defaults to prior UTC behavior for the Team page caller).
  [`team-members.service.ts:98`](../../apps/api/src/team/team-members.service.ts#L98)

**Web UI**

- Seven drill-down "Today" tiles + one `GapFlag` per missing Site (never combined), from `GET /dashboard/today`.
  [`page.tsx:41`](../../apps/web/app/(app)/page.tsx#L41)

**Tests (supporting)**

- Per-figure correctness, gap-flag set-difference, and the labour local-day-boundary assertion.
  [`dashboard.service.spec.ts:1`](../../apps/api/src/dashboard/dashboard.service.spec.ts#L1)
