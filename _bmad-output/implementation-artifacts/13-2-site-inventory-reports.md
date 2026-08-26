---
baseline_commit: 5c9cbe4cf27e4169f8b9ef82f645502e7ba4c338
---

# Story 13.2: Site & Inventory Reports

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As Owner/Admin,
I want filterable Site reports (DSR history, activity, photos) and Inventory reports (stock, consumption, purchases, movements, wastage, low-stock), scoped to my Tenant,
so that I can review either domain in depth without exporting data elsewhere.

## Acceptance Criteria

1. **Given** DSR and Inventory transaction data exists, **when** I open Site or Inventory reports and apply a date-range filter, **then** results are scoped strictly to my Tenant and reflect exactly the underlying records. (FR-42, FR-43)
2. Every report here is Tenant-scoped under any filter combination — true by construction under AD-1 (a deployment's database belongs to exactly one Tenant, there is no cross-tenant data to accidentally leak), not something this story adds a filter for.

## Tasks / Subtasks

- [x] Task 1 — `apps/api` (AC: #1, #2)
  - [x] `apps/api/src/reports/reports.controller.ts` (Story 13.1, extend): `GET /reports/sites?siteId=&from=&to=` — composes Epic 2's Site data, Epic 3's `DailySiteReport` history, and Epic 3's Photo gallery (FR-42's "DSR history, progress report, activity history, photo history"), all filtered by the given date range. "Progress report"/"activity history" are read directly from Epic 2's existing `site-activity-feed.ts` (Epic 2 Story 2.3) with the date range applied as an additional filter — do not build a second activity-aggregation query, extend the existing one with `from`/`to` params if it doesn't already accept them.
  - [x] `GET /reports/inventory?siteId=&materialId=&from=&to=` — composes: current stock (`GodownStock`/`SiteStock`, Epic 5 Story 5.7's `stock.service.ts`), consumption/purchase/movement/wastage history within the date range (Epic 5 Stories 5.1–5.6's respective services, each already queryable — this endpoint calls into each, it doesn't re-implement any of their queries), and low-stock flags (Epic 5 Story 5.7's `getLowStockMaterials()`). One composed response, several existing sources.
  - [x] Neither endpoint introduces a `tenantId`/Tenant-scoping filter of any kind — per AC #2, add a code-review-style check (or a test, Task 3) confirming no query in this story references any such concept; if a reviewer asks "where's the Tenant filter," the answer is "there is no Tenant filter, by construction" (AD-1), not a missing requirement.
- [x] Task 2 — `apps/web` UI (AC: #1)
  - [x] Extend `apps/web/app/(app)/reports/page.tsx` (Story 13.1) with the `chip-row` tab selector from `16-reports.html` (Site Reports / Inventory Reports / Labour Reports / Financial Reports — this story implements the first two tabs, Stories 13.3/13.4 implement the remaining two on the same selector).
  - [x] "Site Reports" tab: Site picker, date-range filter, and sections for DSR history (`DataTable`, linking each row to its DSR detail — Epic 3), and a photo gallery grid (reusing Epic 3's chronological photo gallery component if one exists from that epic, rather than building a second gallery layout).
  - [x] "Inventory Reports" tab: filters (Site, Material, date range) plus sections mirroring Epic 5 Story 5.7's Inventory page structure (current stock table, transaction history table, low-stock alerts) — this is deliberately a filtered, report-oriented re-presentation of data Epic 5 Story 5.7 already displays live on `/inventory`, not a competing data source.
- [x] Task 3 — Tests (AC: all)
  - [x] `reports.service.spec.ts` (or split into `site-reports.service.spec.ts`/`inventory-reports.service.spec.ts`): each composed endpoint returns correctly filtered data across a multi-Site, multi-date fixture; a query with no matching date range returns an empty result set, not an error.
  - [x] A test (or a static check documented in the PR) confirming no `tenantId`/tenant-scoping code exists anywhere in this story's files — the concrete, automatable version of AC #2's "true by construction" claim.

## Dev Notes

**This story reuses eight existing services across four prior epics — if you're writing a new Prisma query instead of calling one, stop and check first.** Epic 2 (Site, activity feed), Epic 3 (DailySiteReport, Photo), Epic 5 Stories 5.1–5.7 (Purchase, Movement, Consumption, ReturnWastage, Stock, low-stock) all already have the query capability this story needs. This story's only genuinely new code is the date-range filter parameter threading and the response composition — the same discipline Epic 12 applied throughout.

**"Tenant-scoped" needs no code here, and adding any would be a defect, not a safety measure.** AD-1's Rule is explicit: "No table, model, query, or API route may reference a 'current tenant' selector... A pull request introducing tenant-scoping logic is solving a problem this architecture doesn't have — reject it, don't merge it." AC #2 is satisfied by the *absence* of such logic, not its presence — don't add a `WHERE tenantId = ?` clause anywhere in this story out of habit from other multi-tenant systems.

**Depends on**: Story 13.1 (`ReportsModule`, the page shell), Epic 2, Epic 3, Epic 5.

**Architecture constraints in force:** AD-1 (explicitly, per above), AD-3, AD-4, AD-5, AD-6.

### Project Structure Notes

- Extends `apps/api/src/reports/reports.controller.ts` (Story 13.1) and `apps/web/app/(app)/reports/page.tsx`.

### References

- [Source: _bmad-output/specs/spec-AzentisFieldOS/functional-requirements.md#CAP-13 — Reports] (FR-42, FR-43, and the shared "scoped to the requesting Tenant only" clause)
- [Source: _bmad-output/planning-artifacts/stories/phase-6-insight-delivery/epic-13-reports-auto-delivery/story-13.2-site-inventory-reports.md]
- [Source: _bmad-output/planning-artifacts/architecture/architecture-AzentisFieldOS-2026-08-11/ARCHITECTURE-SPINE.md#AD-1 — exact "reject, don't merge" wording on tenant-scoping logic]
- [Source: _bmad-output/implementation-artifacts/13-1-auto-compile-deliver-branded-daily-report.md — ReportsModule this story extends]
- [Source: _bmad-output/implementation-artifacts/5-7-stock-lifecycle-visibility-low-stock-flagging.md — inventory data sources this story composes]
- [Source: apps/api/src/sites/site-activity-feed.ts — Site report data source]
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/16-reports.html]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.8 (1M context) — claude-opus-4-8[1m]

### Debug Log References

- `pnpm --filter @azentisfieldos/api typecheck` — clean
- `pnpm --filter @azentisfieldos/api test` — 586 passed | 51 skipped
- `pnpm --filter @azentisfieldos/web typecheck` — clean
- `pnpm --filter @azentisfieldos/web test` — 506 passed
- `pnpm --filter @azentisfieldos/web build` — compiled successfully; `/reports` is dynamic
- `pnpm --filter @azentisfieldos/web lint` — clean; `pnpm typecheck` (shared/ui/api/web) — all pass
- Story's own files add 0 lint errors (verified via `eslint --no-cache` on the changed files; the repo-wide `pnpm lint` failure is pre-existing on `main` in `payments.service.spec.ts` et al., unrelated to this story).

### Completion Notes List

- **Pure read-composition layer, no new Prisma queries in the reports module.** Two endpoints added to the Story 13.1 controller — `GET /reports/sites` and `GET /reports/inventory` — served by a new `SiteInventoryReportsService` that composes each owning epic's existing service methods (the DashboardService/Epic 12 discipline). `ReportsModule` now imports `DsrModule`, `InventoryModule`, `StorageModule`.
- **Date-range threading is the only genuinely new query code.** A shared `dateRangeBounds(from, to)` helper (`apps/api/src/common/date-range.ts`) builds an inclusive `[from, to]` filter (`to` is made end-of-day-inclusive via next-UTC-midnight `lt`, correct for both `@db.Date` and DateTime business-date fields). It is threaded into the existing queries: `getSiteActivityFeed`, `getSitePhotoGallery`, a new `DsrService.listBySiteInRange` (current-version-only, reusing the listByDate filtering rule), the four inventory transaction `list()` methods (Purchase/Movement/Consumption/ReturnWastage — now `list(filters = {})`, unfiltered default = unchanged behaviour), and `StockService.getGodownStock/getSiteStock` (optional `materialId`; stock is a snapshot so it carries no from/to). Filters accept optional `siteId`/`materialId` too (`materialId` → `materialSize.materialId`; Movement's `siteId` matches source-or-destination).
- **AD-1 / AC #2 satisfied by absence.** No `tenantId`/current-tenant filter exists anywhere in this story's code. `apps/api/src/reports/no-tenant-scoping.spec.ts` is the automatable proof: it strips comments (the prose deliberately *discusses* the absence) from every file this story touches and asserts none contains the substring `tenant` in code.
- **Web:** `reports/page.tsx` gains the `chip-row` tab selector (Site / Inventory / Labour / Financial), URL-driven (`?tab=&siteId=&materialId=&from=&to=`) like the RMC report tabs — server-rendered, no client fetch, filters via a native GET form. Site Reports tab shows DSR history (rows link to `/daily-activity/[id]`), Activity History, and a photo gallery grid; Inventory Reports tab shows low-stock alerts, current stock (Godown + Site), and a merged transaction history. Labour/Financial tabs are honest "arrive in a later story" placeholders (Stories 13.3/13.4). The Story 13.1 "Recent Reports" delivery log is retained (always visible). Epic 3's photo-gallery grid was extracted to a shared `_components/photo-gallery-grid.tsx` and reused by both this view and the Site Photos page (one gallery layout, not two).
- **Route ordering:** `/reports/sites` and `/reports/inventory` are distinct sibling paths; the `/reports/daily/:id` wildcard requires the literal `daily` segment so it cannot shadow them. HTTP-level integration coverage asserts this in `reports.controller.integration.spec.ts`.
- **No schema change** — no migration generated.
- **Known/left open:** (1) date filters are interpreted in UTC (consistent with the app's existing date handling; the same 6 PM-local timezone question flagged in Story 13.1 applies). (2) Site-Stock in the Inventory report is empty when no Site is selected, because Epic 5 Story 5.7 exposes Site Stock one Site at a time and no combined-all-Sites stock endpoint exists (Godown stock, low-stock, and all-Site transaction history still compose). (3) `dsr.service.integration.spec.ts`'s known pre-existing shared-local-DB isolation flake is unrelated to this work.

### File List

**apps/api (new):**
- `src/common/date-range.ts`
- `src/common/date-range.spec.ts`
- `src/reports/site-inventory-reports.service.ts`
- `src/reports/site-inventory-reports.service.spec.ts`
- `src/reports/no-tenant-scoping.spec.ts`
- `src/dsr/dsr.service.spec.ts`

**apps/api (modified):**
- `src/reports/reports.controller.ts`
- `src/reports/reports.module.ts`
- `src/reports/reports.controller.spec.ts`
- `src/reports/reports.controller.integration.spec.ts`
- `src/dsr/dsr.service.ts`
- `src/dsr/dsr.module.ts`
- `src/inventory/purchases.service.ts`
- `src/inventory/movements.service.ts`
- `src/inventory/consumption.service.ts`
- `src/inventory/return-wastage.service.ts`
- `src/inventory/stock.service.ts`
- `src/inventory/inventory.module.ts`
- `src/sites/site-activity-feed.ts`
- `src/sites/site-photo-gallery.ts`

**packages/shared (new/modified):**
- `src/types/report-filters.ts` (new)
- `src/index.ts` (modified — export report-filters)

**apps/web (new):**
- `app/(app)/_components/photo-gallery-grid.tsx`

**apps/web (modified):**
- `app/(app)/reports/page.tsx`
- `app/(app)/reports/page.test.tsx`
- `app/(app)/sites/[id]/photos/page.tsx`

## Suggested Review Order

**Composition (reuse, not re-query — the story's discipline)**

- Entry point: the composition service — both endpoints compose owning-epic service methods, no new Prisma queries.
  [`site-inventory-reports.service.ts:1`](../../apps/api/src/reports/site-inventory-reports.service.ts#L1)

- The one genuinely new bit of query code: the shared inclusive date-range → Prisma filter helper.
  [`date-range.ts:1`](../../apps/api/src/common/date-range.ts#L1)

- Backward-compatible date-range threading into existing services (each `list()` → `list(filters={})`, default unchanged).
  [`purchases.service.ts:81`](../../apps/api/src/inventory/purchases.service.ts#L81)
  [`site-activity-feed.ts:1`](../../apps/api/src/sites/site-activity-feed.ts#L1)

- New sibling routes (distinct from `reports/daily/:id`, integration-covered).
  [`reports.controller.ts:110`](../../apps/api/src/reports/reports.controller.ts#L110)

**AD-1 (explicit): no tenant-scoping**

- The automatable proof of AC #2 — asserts no `tenant` substring survives in this story's code.
  [`no-tenant-scoping.spec.ts:1`](../../apps/api/src/reports/no-tenant-scoping.spec.ts#L1)

**Web UI**

- Reports page — chip-row tab selector (Site/Inventory tabs; Labour/Financial placeholders for 13.3/13.4), URL-driven filters, extracted shared photo-gallery grid.
  [`page.tsx:1`](../../apps/web/app/(app)/reports/page.tsx#L1)
