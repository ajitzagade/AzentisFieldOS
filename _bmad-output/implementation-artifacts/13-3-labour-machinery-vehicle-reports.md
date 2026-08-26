---
baseline_commit: 7eb4d21dc68e0869f39e2e76c02544eee7963a7d
---

# Story 13.3: Labour & Machinery/Vehicle Reports

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As Owner/Admin,
I want filterable Labour reports (attendance, work history, payments, advance history) and Machinery/Vehicle reports (usage, movement, maintenance),
so that I can review workforce and asset activity in depth.

## Acceptance Criteria

1. **Given** Work Record, Payment, Advance, and Machinery/Vehicle movement data exists, **when** I open Labour or Machinery/Vehicle reports and apply filters, **then** results are scoped strictly to my Tenant and reflect exactly the underlying records. (FR-44, FR-45)
2. Tenant-scoping is true by construction under AD-1, same as Story 13.2 — no new scoping code, just composed queries over existing services.

## Tasks / Subtasks

- [x] Task 1 — `apps/api` (AC: #1, #2)
  - [x] `apps/api/src/reports/reports.controller.ts` (Story 13.1, extend): `GET /reports/labour?teamMemberId=&from=&to=` — composes Epic 6's `WorkRecord` history (`work-history` endpoint, Story 6.3), Epic 7's `Payment` history filtered by date (weekly/monthly totals — reuse Story 6.3's `team-summary` aggregate shape rather than recomputing), and Epic 7's `AdvanceAdjustment` history (outstanding + adjustment history per Team Member, Story 7.1's Advance Ledger data). Reuse each Epic 6/7 service method; this endpoint composes, it does not re-query `WorkRecord`/`Payment`/`Advance` directly.
  - [x] `GET /reports/machinery-vehicles?assetType=&assetId=&from=&to=` — composes Epic 8's usage/current-status data (`Machinery`/`Vehicle`, Story 8.1), Site movement history (`asset-movements`, Story 8.2) filtered by date, and maintenance/repair history (`asset-service-logs`, Story 8.3) filtered by date. Same composition discipline — reuse Story 8.2/8.3's existing filtered-list query capability (`GET /asset-movements?assetType=&assetId=`, extend with `from`/`to` if not already supported) rather than writing new Prisma queries against `MachineryMovementLog`/`VehicleMovementLog`/service-log tables.
- [x] Task 2 — `apps/web` UI (AC: #1)
  - [x] Extend `apps/web/app/(app)/reports/page.tsx`'s tab selector (Story 13.2) with "Labour Reports" and "Machinery/Vehicle Reports" tabs.
  - [x] "Labour Reports" tab: Team Member picker (optional — "All" shows every Team Member's data), date-range filter, sections for attendance/work history (`DataTable`), payment totals, and Advance/Adjustment history — visually consistent with Epic 6/7's existing Team Member detail page sections, since this is the same data in a filtered, report-oriented frame.
  - [x] "Machinery/Vehicle Reports" tab: asset picker (optional), date-range filter, sections for usage/current-status, movement history, and service history — same relationship to Epic 8's existing detail pages as above.
- [x] Task 3 — Tests (AC: all)
  - [x] `labour-reports.service.spec.ts` / `machinery-reports.service.spec.ts`: each composed endpoint filters and aggregates correctly across a multi-Team-Member/multi-asset fixture.

## Dev Notes

**Same composition discipline as Story 13.2 — this story's Dev Notes don't need to re-argue why (re-read 13.2's if you're implementing this one first).** The one thing worth calling out specifically here: Epic 6 Story 6.3's `team-summary` endpoint already computes weekly/monthly payment totals and outstanding-advance figures gracefully as zero/empty when Epic 7 data doesn't exist — by the time this story is built, Epic 7 will exist, so those figures will be real, but the underlying endpoint needs no changes either way; this story just adds date-range scoping on top of what's already there.

**Depends on**: Story 13.1 (`ReportsModule`, page shell), Epic 6, Epic 7, Epic 8.

**Architecture constraints in force:** AD-1, AD-3, AD-4, AD-5, AD-6.

### Project Structure Notes

- Extends `apps/api/src/reports/reports.controller.ts` (Story 13.1) and `apps/web/app/(app)/reports/page.tsx` (Story 13.2's tab selector).

### References

- [Source: _bmad-output/specs/spec-AzentisFieldOS/functional-requirements.md#CAP-13] (FR-44, FR-45)
- [Source: _bmad-output/planning-artifacts/stories/phase-6-insight-delivery/epic-13-reports-auto-delivery/story-13.3-labour-machinery-reports.md]
- [Source: _bmad-output/implementation-artifacts/13-1-auto-compile-deliver-branded-daily-report.md, 13-2-site-inventory-reports.md — ReportsModule and the composition pattern this story follows]
- [Source: _bmad-output/implementation-artifacts/6-3-work-history-team-summary.md, 7-1-record-an-advance.md, 8-2-record-movement-between-sites-maintenance.md, 8-3-log-fuel-maintenance-repair-history.md — data sources this story composes]
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/16-reports.html]

## Dev Agent Record

### Agent Model Used

claude-opus-4-8[1m] (Opus 4.8, 1M context)

### Debug Log References

### Completion Notes List

- Followed Story 13.2's composition discipline exactly: two new pure read-composition services (`LabourReportsService`, `MachineryVehicleReportsService`) that only compose EXISTING owning-epic service methods. No new Prisma queries were added in the reports module, and no schema change was needed (so no migration).
- **API endpoints** added to the existing `@Controller()` `ReportsController`:
  - `GET /reports/labour?teamMemberId=&from=&to=` → composes Epic 6 (`WorkRecordsService.list`, `TeamMembersService.getTeamSummary`) + Epic 7 (`PaymentsService.list`, `AdvancesService.list`, `AdvanceAdjustmentsService.list`, `TeamMembersService.getOutstandingAdvances`). `teamMemberId` optional = "All Team Members".
  - `GET /reports/machinery-vehicles?assetType=&assetId=&from=&to=` → composes Epic 8 (`MachineryService`/`VehicleService` registers + `findOne`, `AssetMovementsService.list`, `AssetServiceLogsService.list`). No asset selected = register-only (current-status) view; a selected asset drills into its date-windowed movement + service history. `assetType` is validated to MACHINERY|VEHICLE; a malformed value degrades to the register view rather than 400ing.
- **Owning-service `list()` extensions** (all keep the unfiltered default byte-identical, so existing callers/tests are unaffected — verified by the untouched pre-existing assertions in each service's spec):
  - `WorkRecordsService.list(siteId?, filters?)` — kept the positional `siteId` (locked by existing tests), added an optional second `LabourReportFilters` arg (teamMemberId + from/to on `workDate`).
  - `PaymentsService.list(filters?)` — teamMemberId + from/to on `createdAt` (chosen over `paidAt` so still-pending Payments aren't dropped; the paid weekly/monthly totals still come from `getTeamSummary`'s `paidAt` aggregate — documented inline).
  - `AdvancesService.list(filters?)` — on `givenAt`; `AdvanceAdjustmentsService.list(filters?)` — on `adjustedAt`, teamMemberId via the parent Advance.
  - `AssetMovementsService.list(type, id, filters?)` on `movedAt`; `AssetServiceLogsService.list(type, id, filters?)` on `serviceDate` — added an optional 3rd `ReportDateRange` arg (undefined bounds are Prisma no-ops, so the asset detail pages' queries are unchanged).
- **Module wiring**: `ReportsModule` now imports `TeamModule` + `AssetsModule`; `TeamModule` additionally exports `WorkRecordsService`/`AdvancesService`/`AdvanceAdjustmentsService`, `AssetsModule` now exports `MachineryService`/`VehicleService`/`AssetMovementsService`/`AssetServiceLogsService`.
- **Shared types**: `LabourReportFilters` + `MachineryReportFilters` added to `packages/shared/src/types/report-filters.ts` (plain query shapes, not Zod — same treatment as 13.2's filters; no `tenantId`, AD-1).
- **Web**: extended `reports/page.tsx`'s tab selector with "Labour Reports" and "Machinery/Vehicle Reports" (5 tabs total; Financial stays the 13.4 placeholder). Reused the shared `DataTable`/`Badge`/`StatTile`/`SelectField`/`TextField` primitives and the machinery-vehicles `statusBadge` helper — no one-off layouts. URL-driven native GET forms (no client JS), consistent with 13.2. The asset picker packs assetType+assetId into one `asset=MACHINERY:<id>` token so a single `<select>` drives both API params; the page splits it back apart.
- **AD-1**: no tenant-scoping anywhere. Extended `no-tenant-scoping.spec.ts` with a Story 13.3 block covering all new + extended files.
- **Verification** (apps/api can't boot outside Vitest — unit/component tests with mocked services/fetch, per prior stories):
  - `pnpm --filter @azentisfieldos/api test` → 610 passed, 51 skipped, 0 failed (the known-flaky dsr/consumption integration specs did not fail this run).
  - `pnpm --filter @azentisfieldos/web test` → 509 passed; `pnpm --filter @azentisfieldos/web build` → success.
  - Typecheck clean for `@azentisfieldos/shared`, `@azentisfieldos/api`, `@azentisfieldos/web`.
  - Lint: all new/changed source files clean (only the same pre-existing `request(app.getHttpServer())` `no-unsafe-argument` warnings the other integration specs already carry). NOTE: `apps/api` lint surfaces 7 PRE-EXISTING errors in `team/payments.service.spec.ts` (`no-unsafe-assignment`) that are unrelated to this story — confirmed present with this story's changes stashed.

### File List

**Added (API)**
- apps/api/src/reports/labour-reports.service.ts
- apps/api/src/reports/labour-reports.service.spec.ts
- apps/api/src/reports/machinery-reports.service.ts
- apps/api/src/reports/machinery-reports.service.spec.ts

**Modified (API)**
- apps/api/src/reports/reports.controller.ts
- apps/api/src/reports/reports.controller.spec.ts
- apps/api/src/reports/reports.controller.integration.spec.ts
- apps/api/src/reports/reports.module.ts
- apps/api/src/reports/no-tenant-scoping.spec.ts
- apps/api/src/team/team.module.ts
- apps/api/src/team/work-records.service.ts
- apps/api/src/team/payments.service.ts
- apps/api/src/team/advances.service.ts
- apps/api/src/team/advance-adjustments.service.ts
- apps/api/src/assets/assets.module.ts
- apps/api/src/assets/asset-movements.service.ts
- apps/api/src/assets/asset-service-logs.service.ts

**Modified (shared)**
- packages/shared/src/types/report-filters.ts

**Modified (web)**
- apps/web/app/(app)/reports/page.tsx
- apps/web/app/(app)/reports/page.test.tsx

## Suggested Review Order

**Composition (reuse, not re-query)**

- Labour report — composes WorkRecord/Payment/Advance/Adjustment history + team-summary totals.
  [`labour-reports.service.ts:1`](../../apps/api/src/reports/labour-reports.service.ts#L1)

- Machinery/Vehicle report — register/current-status + date-windowed movement + service history.
  [`machinery-reports.service.ts:1`](../../apps/api/src/reports/machinery-reports.service.ts#L1)

- Backward-compatible date-range threading into owning-service `list()` methods (unfiltered default byte-identical).
  [`payments.service.ts`](../../apps/api/src/team/payments.service.ts)
  [`asset-movements.service.ts`](../../apps/api/src/assets/asset-movements.service.ts)

- New sibling routes (distinct from `reports/daily/:id`, integration-covered).
  [`reports.controller.ts`](../../apps/api/src/reports/reports.controller.ts)

**AD-1: no tenant-scoping** — the automatable AC #2 proof (extended for this story).
  [`no-tenant-scoping.spec.ts:1`](../../apps/api/src/reports/no-tenant-scoping.spec.ts#L1)

**Web** — Labour + Machinery/Vehicle tabs wired into the existing chip-row selector.
  [`page.tsx:1`](../../apps/web/app/(app)/reports/page.tsx#L1)
