# Story 13.3: Labour & Machinery/Vehicle Reports

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As Owner/Admin,
I want filterable Labour reports (attendance, work history, payments, advance history) and Machinery/Vehicle reports (usage, movement, maintenance),
so that I can review workforce and asset activity in depth.

## Acceptance Criteria

1. **Given** Work Record, Payment, Advance, and Machinery/Vehicle movement data exists, **when** I open Labour or Machinery/Vehicle reports and apply filters, **then** results are scoped strictly to my Tenant and reflect exactly the underlying records. (FR-44, FR-45)
2. Tenant-scoping is true by construction under AD-1, same as Story 13.2 — no new scoping code, just composed queries over existing services.

## Tasks / Subtasks

- [ ] Task 1 — `apps/api` (AC: #1, #2)
  - [ ] `apps/api/src/reports/reports.controller.ts` (Story 13.1, extend): `GET /reports/labour?teamMemberId=&from=&to=` — composes Epic 6's `WorkRecord` history (`work-history` endpoint, Story 6.3), Epic 7's `Payment` history filtered by date (weekly/monthly totals — reuse Story 6.3's `team-summary` aggregate shape rather than recomputing), and Epic 7's `AdvanceAdjustment` history (outstanding + adjustment history per Team Member, Story 7.1's Advance Ledger data). Reuse each Epic 6/7 service method; this endpoint composes, it does not re-query `WorkRecord`/`Payment`/`Advance` directly.
  - [ ] `GET /reports/machinery-vehicles?assetType=&assetId=&from=&to=` — composes Epic 8's usage/current-status data (`Machinery`/`Vehicle`, Story 8.1), Site movement history (`asset-movements`, Story 8.2) filtered by date, and maintenance/repair history (`asset-service-logs`, Story 8.3) filtered by date. Same composition discipline — reuse Story 8.2/8.3's existing filtered-list query capability (`GET /asset-movements?assetType=&assetId=`, extend with `from`/`to` if not already supported) rather than writing new Prisma queries against `MachineryMovementLog`/`VehicleMovementLog`/service-log tables.
- [ ] Task 2 — `apps/web` UI (AC: #1)
  - [ ] Extend `apps/web/app/(app)/reports/page.tsx`'s tab selector (Story 13.2) with "Labour Reports" and "Machinery/Vehicle Reports" tabs.
  - [ ] "Labour Reports" tab: Team Member picker (optional — "All" shows every Team Member's data), date-range filter, sections for attendance/work history (`DataTable`), payment totals, and Advance/Adjustment history — visually consistent with Epic 6/7's existing Team Member detail page sections, since this is the same data in a filtered, report-oriented frame.
  - [ ] "Machinery/Vehicle Reports" tab: asset picker (optional), date-range filter, sections for usage/current-status, movement history, and service history — same relationship to Epic 8's existing detail pages as above.
- [ ] Task 3 — Tests (AC: all)
  - [ ] `labour-reports.service.spec.ts` / `machinery-reports.service.spec.ts`: each composed endpoint filters and aggregates correctly across a multi-Team-Member/multi-asset fixture.

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

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
