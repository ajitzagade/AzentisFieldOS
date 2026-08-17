# Story 13.2: Site & Inventory Reports

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As Owner/Admin,
I want filterable Site reports (DSR history, activity, photos) and Inventory reports (stock, consumption, purchases, movements, wastage, low-stock), scoped to my Tenant,
so that I can review either domain in depth without exporting data elsewhere.

## Acceptance Criteria

1. **Given** DSR and Inventory transaction data exists, **when** I open Site or Inventory reports and apply a date-range filter, **then** results are scoped strictly to my Tenant and reflect exactly the underlying records. (FR-42, FR-43)
2. Every report here is Tenant-scoped under any filter combination — true by construction under AD-1 (a deployment's database belongs to exactly one Tenant, there is no cross-tenant data to accidentally leak), not something this story adds a filter for.

## Tasks / Subtasks

- [ ] Task 1 — `apps/api` (AC: #1, #2)
  - [ ] `apps/api/src/reports/reports.controller.ts` (Story 13.1, extend): `GET /reports/sites?siteId=&from=&to=` — composes Epic 2's Site data, Epic 3's `DailySiteReport` history, and Epic 3's Photo gallery (FR-42's "DSR history, progress report, activity history, photo history"), all filtered by the given date range. "Progress report"/"activity history" are read directly from Epic 2's existing `site-activity-feed.ts` (Epic 2 Story 2.3) with the date range applied as an additional filter — do not build a second activity-aggregation query, extend the existing one with `from`/`to` params if it doesn't already accept them.
  - [ ] `GET /reports/inventory?siteId=&materialId=&from=&to=` — composes: current stock (`GodownStock`/`SiteStock`, Epic 5 Story 5.7's `stock.service.ts`), consumption/purchase/movement/wastage history within the date range (Epic 5 Stories 5.1–5.6's respective services, each already queryable — this endpoint calls into each, it doesn't re-implement any of their queries), and low-stock flags (Epic 5 Story 5.7's `getLowStockMaterials()`). One composed response, several existing sources.
  - [ ] Neither endpoint introduces a `tenantId`/Tenant-scoping filter of any kind — per AC #2, add a code-review-style check (or a test, Task 3) confirming no query in this story references any such concept; if a reviewer asks "where's the Tenant filter," the answer is "there is no Tenant filter, by construction" (AD-1), not a missing requirement.
- [ ] Task 2 — `apps/web` UI (AC: #1)
  - [ ] Extend `apps/web/app/(app)/reports/page.tsx` (Story 13.1) with the `chip-row` tab selector from `16-reports.html` (Site Reports / Inventory Reports / Labour Reports / Financial Reports — this story implements the first two tabs, Stories 13.3/13.4 implement the remaining two on the same selector).
  - [ ] "Site Reports" tab: Site picker, date-range filter, and sections for DSR history (`DataTable`, linking each row to its DSR detail — Epic 3), and a photo gallery grid (reusing Epic 3's chronological photo gallery component if one exists from that epic, rather than building a second gallery layout).
  - [ ] "Inventory Reports" tab: filters (Site, Material, date range) plus sections mirroring Epic 5 Story 5.7's Inventory page structure (current stock table, transaction history table, low-stock alerts) — this is deliberately a filtered, report-oriented re-presentation of data Epic 5 Story 5.7 already displays live on `/inventory`, not a competing data source.
- [ ] Task 3 — Tests (AC: all)
  - [ ] `reports.service.spec.ts` (or split into `site-reports.service.spec.ts`/`inventory-reports.service.spec.ts`): each composed endpoint returns correctly filtered data across a multi-Site, multi-date fixture; a query with no matching date range returns an empty result set, not an error.
  - [ ] A test (or a static check documented in the PR) confirming no `tenantId`/tenant-scoping code exists anywhere in this story's files — the concrete, automatable version of AC #2's "true by construction" claim.

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

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
