# Story 14.5: Report Configuration

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As Owner/Admin,
I want to configure report templates, frequency, and recipients independently of the daily-DSR delivery channel,
so that I can tune reporting cadence without affecting the core daily report flow.

## Acceptance Criteria

1. **Given** I configure a report template, frequency, and recipient list, **when** I save, **then** this configuration operates independently of FR-50's daily-DSR delivery settings. (FR-51)
2. This story builds the scheduled, multi-cadence delivery of Epic 13 Stories 13.2–13.4's report types (Site, Inventory, Labour, Machinery/Vehicle, Financial) — a capability Epic 13 explicitly scoped out as not required by FR-32/FR-33. See Dev Notes.

## Tasks / Subtasks

- [ ] Task 1 — Schema addition (AC: #1, #2)
  - [ ] Add `model ReportSchedule { id String @id @default(uuid(7)), reportType String, frequency String, recipientUserIds String[] @default([]), enabled Boolean @default(false), siteId String?, lastRunAt DateTime?, createdAt DateTime @default(now()), updatedAt DateTime @updatedAt }`. `reportType`: `SITE | INVENTORY | LABOUR | MACHINERY_VEHICLE | FINANCIAL` (Epic 13 Stories 13.2–13.4's four report domains, machinery/vehicle counted as one per Story 13.3's own grouping). `frequency`: `DAILY | WEEKLY | MONTHLY`. `siteId` optional — a schedule can be Site-scoped or cover all Sites (`null`), matching those stories' own filter shape. No `correctsId`/`reason` — this is configuration, not transaction history, same category as `NotificationChannelSetting` (Story 14.4) and `BrandingConfig` (Story 13.1). Run `pnpm db:generate`.
- [ ] Task 2 — Shared Zod schema (AC: #1)
  - [ ] Create `packages/shared/src/schemas/report-schedule.ts`: `createReportScheduleSchema`/`updateReportScheduleSchema` (`reportType`/`frequency` enums, `recipientUserIds: z.array(z.uuid())`, `siteId: z.uuid().optional()`, `enabled: z.boolean().default(true)`).
- [ ] Task 3 — `apps/api` (AC: #1, #2)
  - [ ] `apps/api/src/reports/report-schedules.controller.ts` + `.service.ts` (`ReportsModule`, Story 13.1). `POST /report-schedules`, `GET /report-schedules`, `PATCH /report-schedules/:id`.
  - [ ] `POST /cron/run-report-schedules` — a second Cron target alongside Story 13.1's `compile-daily-reports` (same `CRON_SECRET` verification, same `AD-13` reasoning, added as its own `vercel.json` entry with its own schedule, e.g. hourly, since different schedules have different due-times — a schedule is "due" when `frequency`-worth of time has elapsed since `lastRunAt`, or immediately if `lastRunAt` is null). For each due, enabled `ReportSchedule`: call the corresponding Epic 13 Story 13.2/13.3/13.4 endpoint (`GET /reports/sites`, `/reports/inventory`, `/reports/labour`, `/reports/machinery-vehicles`, `/reports/financial`) with a date range derived from `frequency` (daily → yesterday; weekly → last 7 days; monthly → last calendar month), then deliver the result via `ReportDeliveryService`'s existing Email/WhatsApp/in-app machinery (Story 13.1) to `recipientUserIds` — reuse that delivery service completely, this story does not build a second delivery mechanism. Update `lastRunAt` on success.
  - [ ] This endpoint governs `ReportSchedule` rows exclusively and never touches `NotificationChannelSetting` (Story 14.4) or the daily-DSR `DailyReport`/Story 13.1 compile path — AC #1's "independently of FR-50" is satisfied by these being two entirely separate models and two separate Cron jobs, not a shared one with a mode flag.
- [ ] Task 4 — `apps/web` UI (AC: #1)
  - [ ] Extend `apps/web/app/(app)/reports/page.tsx` (Epic 13) with a "Scheduled Reports" section (or a `/reports/schedules` sub-route if the main Reports page is already dense after Epic 13 — either is acceptable, match whatever that page's actual layout looks like by the time this story is picked up): a list of configured schedules and a create form (report type, frequency, optional Site scope, recipient picker reusing Story 14.2's `GET /users`).
- [ ] Task 5 — Tests (AC: all)
  - [ ] Zod tests.
  - [ ] `report-schedules.service.spec.ts`: due-schedule detection correctly handles `null` `lastRunAt` (immediately due) and each frequency's elapsed-time threshold; the Cron handler calls the correct Epic 13 report endpoint per `reportType` and the correct `ReportDeliveryService` channels per `recipientUserIds`, without touching `NotificationChannelSetting` or `DailyReport` at all (a concrete test of AC #1's independence claim, not just a prose assertion).

## Dev Notes

**This story is the resolution to a boundary Epic 13 Story 13.1 deliberately drew — read that story's Dev Notes on "the mockup's Weekly Inventory and Monthly Labour report rows" before starting here.** That story explicitly declined to build general multi-cadence scheduled report delivery, reasoning that FR-32/FR-33 describe exactly one recurring artifact (the daily DSR report) and that a broader scheduler would be real, unscoped work belonging to whichever future story's FR actually asked for it. FR-51 is that FR — this story is the follow-through, not new discovery. The mockup rows Story 13.1 set aside ("Weekly Inventory Report," "Monthly Labour Report") are exactly what `ReportSchedule` now makes possible.

**Two Cron jobs, two models, deliberately not unified into one "reports" scheduler.** It would be tempting to generalize Story 13.1's daily-DSR compile job and this story's schedule-runner into one configurable system. Don't — FR-51's own text requires operating "independently of FR-50's daily-DSR delivery settings," and the daily DSR report has a fundamentally different compile step (it reads one Site's one DSR) than these five report types (each reads a filtered, potentially multi-Site aggregate query). Keeping them as two Cron jobs calling two different compile paths, sharing only the delivery/channel-send layer, is the simpler design that also happens to satisfy the independence requirement structurally rather than by convention.

**Reuses Epic 13's report-query endpoints and delivery service completely — the only new logic here is "is this schedule due, and if so, fetch + deliver."**

**Depends on**: Epic 13 (all four stories — the report-query endpoints this schedules against, and `ReportDeliveryService`), Story 14.2 (recipient picker).

**Architecture constraints in force:** AD-3, AD-4, AD-5, AD-6, AD-7, AD-13.

### Project Structure Notes

- New `report-schedules.controller.ts`/`.service.ts` in `apps/api/src/reports/` (Story 13.1). One new `vercel.json` Cron entry.
- Extends `apps/web/app/(app)/reports/page.tsx`.

### References

- [Source: _bmad-output/specs/spec-AzentisFieldOS/functional-requirements.md#CAP-14] (FR-51)
- [Source: _bmad-output/planning-artifacts/stories/phase-7-administration/epic-14-tenant-configuration-settings/story-14.5-report-configuration.md]
- [Source: _bmad-output/implementation-artifacts/13-1-auto-compile-deliver-branded-daily-report.md — the deliberately-deferred scope this story fulfills, and ReportDeliveryService this story reuses]
- [Source: _bmad-output/implementation-artifacts/13-2-site-inventory-reports.md, 13-3-labour-machinery-vehicle-reports.md, 13-4-financial-reports.md — the five report-query endpoints this story schedules]
- [Source: _bmad-output/implementation-artifacts/14-2-users-roles-permissions.md, 14-4-notification-channel-configuration.md — recipient picker and the sibling configuration model this story stays independent of]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
