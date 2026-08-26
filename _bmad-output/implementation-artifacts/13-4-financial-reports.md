---
baseline_commit: 5c8809f1c7225a6c85bb73de8294cf5a12fd786b
---

# Story 13.4: Financial Reports

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As Owner/Admin,
I want Financial reports showing Site expenses and cost breakdowns by Material/Labour/RMC/Machinery/Vehicle,
so that I understand where money is actually going, per Site.

## Acceptance Criteria

1. **Given** Expense, Purchase, Payment, and RMC cost data exists across Sites, **when** I open Financial reports, **then** cost breakdowns by category reconcile exactly to the sum of underlying entries. (FR-46)
2. Breakdowns are filterable by Site and date range, and roll up both per-Site and per-Contractor (across every Site).

## Tasks / Subtasks

- [x] Task 1 — `apps/api` (AC: #1, #2)
  - [x] `apps/api/src/reports/reports.controller.ts` (Story 13.1, extend): `GET /reports/financial?siteId=&from=&to=` — returns `{ bySite: [{ siteId, name, material, labour, rmc, machineryVehicle, expenses, total }], contractorTotal: { material, labour, rmc, machineryVehicle, expenses, total } }`. Five cost categories, each a direct `SUM()` over its owning table within the date range, composed here, not re-derived:
    - `material`: `SUM(Purchase.totalAmount)` (Epic 5), grouped by `siteId` (a Godown-destined Purchase has no `siteId` — attribute it to the Contractor-total only, not to any one Site, since it isn't a Site cost until it moves there; a Site-destined or Vendor→Site Purchase attributes directly).
    - `labour`: `SUM(Payment.netPayable)` (Epic 7) — `Payment` has no `siteId` (a Team Member isn't bound to a Site, Epic 6's own FR-19 rule), so this category is **Contractor-level only**, not split by Site — see Dev Notes for why this is a real, structural boundary, not a missed filter.
    - `rmc`: `SUM(RmcEntry.totalAmount)` (Epic 10), grouped by `siteId` (RMC entries are always Site-tagged).
    - `machineryVehicle`: `SUM(MachineryServiceLog.cost) + SUM(VehicleServiceLog.cost)` (Epic 8) — service logs have no `siteId` either (an asset's service history isn't Site-scoped, per Epic 8's own model shape), so this category is **Contractor-level only** too, same reasoning as `labour`.
    - `expenses`: `SUM(Expense.amount)` (Epic 11), grouped by `siteId` (every Expense is Site-tagged, FR-41).
  - [x] `bySite` therefore only ever populates `material`, `rmc`, and `expenses` per-Site (the three categories with a genuine `siteId`); `labour` and `machineryVehicle` appear only in `contractorTotal`, and the per-Site rows show them as `null`/omitted rather than a fabricated `0` that would read as "no labour cost at this Site" (false) versus "labour cost isn't attributable to a Site at all" (true) — a UI showing `₹0` there would be misleading, not just incomplete.
  - [x] `total` per row is the sum of whichever categories that row actually has (Site rows: material+rmc+expenses; Contractor row: all five) — AC #1's "reconciles exactly" applies within each row's own available categories, not across a boundary the data doesn't support.
- [x] Task 2 — `apps/web` UI (AC: #1, #2)
  - [x] Extend `apps/web/app/(app)/reports/page.tsx`'s tab selector (Stories 13.2/13.3) with a "Financial Reports" tab: Site filter (optional — "All Sites" shows the Contractor-level rollup, including Labour/Machinery-Vehicle), date-range filter, and a breakdown table/chart (Category / Amount, per the mockup's cost-breakdown treatment — reuse `packages/ui`'s `money`/`tabular` styling conventions already established across every other financial figure in this project, e.g. Epic 7's Payment table).
  - [x] When a specific Site is selected, the Labour and Machinery/Vehicle rows show explanatory copy ("Not tracked per-Site — see Contractor total") rather than a blank or zero cell, so a reader understands why those two categories don't appear there instead of assuming a bug.
- [x] Task 3 — Tests (AC: all)
  - [x] `financial-reports.service.spec.ts`: each category sums correctly; a Godown-destined Purchase is excluded from every `bySite` row's `material` figure but included in `contractorTotal.material`; `labour`/`machineryVehicle` never appear in a `bySite` row; the sum of all `bySite.total` values plus the Contractor-only categories equals `contractorTotal.total`.

## Dev Notes

**Two of five cost categories are structurally Contractor-level only — this is the data model's own shape, not a gap to fix.** `Payment` (Epic 7) has no `siteId` because Team Members aren't bound to Sites (FR-19's own explicit rule, enforced from Epic 6 Story 6.1 onward). `MachineryServiceLog`/`VehicleServiceLog` (Epic 8) have no `siteId` because an asset's fuel/maintenance/repair history belongs to the asset, not to wherever it happened to be that day. Retrofitting a `siteId` onto either to force a per-Site labour/machinery cost breakdown would mean guessing which Site a Team Member's pay period or a Machine's service visit "belongs to" — real attribution logic no FR describes and no epic before this one modeled. Report the honest boundary (these two categories are Contractor-wide) rather than fabricating a per-Site split the data can't support — the same "honest placeholder over invented precision" principle Epic 5 Story 5.7 applied to stock valuation and Epic 9 Story 9.2 applied to vendor payment status.

**"Reconciles exactly" is checked within what each row actually contains, not by forcing every row to have every category.** Don't build a per-Site "estimated" Labour/Machinery figure (e.g., splitting the Contractor total evenly across active Sites) to make the `bySite` table look more complete — that would be a fabricated number presented as if it reconciled to real entries, which directly contradicts AC #1.

**Depends on**: Story 13.1 (`ReportsModule`, page shell), Epic 5 (`Purchase`), Epic 7 (`Payment`), Epic 8 (`MachineryServiceLog`/`VehicleServiceLog`), Epic 10 (`RmcEntry`), Epic 11 (`Expense`).

**Architecture constraints in force:** AD-1, AD-3, AD-4, AD-5, AD-6.

### Project Structure Notes

- Extends `apps/api/src/reports/reports.controller.ts` (Story 13.1) and `apps/web/app/(app)/reports/page.tsx` (Stories 13.2/13.3's tab selector). No new files beyond the one new controller method/service.

### References

- [Source: _bmad-output/specs/spec-AzentisFieldOS/functional-requirements.md#CAP-13] (FR-46)
- [Source: _bmad-output/planning-artifacts/stories/phase-6-insight-delivery/epic-13-reports-auto-delivery/story-13.4-financial-reports.md]
- [Source: infra/prisma/schema.prisma#Payment, MachineryServiceLog, VehicleServiceLog — confirming no siteId exists on these, the structural basis for this story's Contractor-only categories]
- [Source: _bmad-output/implementation-artifacts/13-1-auto-compile-deliver-branded-daily-report.md, 13-2-site-inventory-reports.md, 13-3-labour-machinery-vehicle-reports.md — ReportsModule and the composition/tab pattern this story completes]
- [Source: _bmad-output/implementation-artifacts/5-7-stock-lifecycle-visibility-low-stock-flagging.md, 9-2-view-vendor-purchase-history.md — the "honest boundary, not a fabricated figure" precedent]

## Dev Agent Record

### Agent Model Used

Opus 4.8 (1M context) — claude-opus-4-8[1m]

### Debug Log References

- `pnpm --filter @azentisfieldos/api test` → 627 passed | 51 skipped (includes the 11 new `financial-reports.service.spec.ts` cases, the 2 controller-unit threading cases, the 1 HTTP route-ordering case, and the 3 no-tenant-scoping cases).
- `pnpm --filter @azentisfieldos/api typecheck` → clean.
- `pnpm --filter @azentisfieldos/web typecheck` / `lint` / `build` → all clean; `/reports` compiles as a dynamic route.
- `pnpm --filter @azentisfieldos/shared typecheck` → clean.

### Completion Notes List

- New `FinancialReportsService` (`apps/api/src/reports/financial-reports.service.ts`) computes the five cost-category SUMs directly against the (global) PrismaService — one Postgres `groupBy`/`aggregate` per owning table, each threaded with the shared `dateRangeBounds()` helper on its own business-date column (`Purchase.purchasedAt`, `Payment.createdAt`, `RmcEntry.deliveredAt`, `MachineryServiceLog`/`VehicleServiceLog.serviceDate`, `Expense.incurredAt`). No new module import was needed and no owning-service method was modified (byte-identical), so the SUMs are self-contained here.
- STRUCTURAL BOUNDARY honored exactly: `labour` (SUM `Payment.netPayable`) and `machineryVehicle` (SUM machinery + vehicle `ServiceLog.cost`) are Contractor-level only — `null` (never `0`) in every `bySite` row, present only in `contractorTotal`. A Godown-destined Purchase (`siteId = null`) is added to `contractorTotal.material` only, never to a `bySite` row. No per-Site labour/machinery split is fabricated.
- Reconciliation invariant (AC #1) is test-proven: `Σ bySite.total + labour + machineryVehicle + Godown-only material == contractorTotal.total`, and a Godown purchase is excluded from every `bySite.material` yet included in `contractorTotal.material`.
- Money coerced with Prisma `_sum` → `?.toNumber() ?? 0` (the RMC/Expense-stats convention); each category's exact Decimal SUM happens in Postgres, only a handful of already-summed category totals are added in JS — no float drift, consistent with the rest of the codebase. `_sum` nulls (no matching rows) coerce to 0.
- `contractorTotal` is always Contractor-wide (across every Site) regardless of the `siteId` filter — matching AC #2's "per-Contractor (across every Site)" and the UI's "see Contractor total" copy. The `siteId` filter narrows only which `bySite` rows are returned; a selected Site with no costs yields an honest all-zero row (0 is truthful for the three genuinely Site-tagged categories), and a non-existent Site 404s, mirroring the Site report.
- `GET /reports/financial` added as a distinct sibling of `/reports/daily/:id`; HTTP-level route-ordering coverage added to `reports.controller.integration.spec.ts`.
- Web: Financial tab now renders a Contractor-total StatTile row (all five categories), a scope-aware Category/Amount breakdown table, and — for "All Sites" — a per-Site rollup table. When a specific Site is selected, the Labour and Machinery/Vehicle category rows show the explanatory "Not tracked per-Site — see Contractor total" copy plus a fuller explanatory paragraph, never a blank/₹0 cell.
- No schema change. AD-1 respected everywhere (no tenant scoping); `no-tenant-scoping.spec.ts` extended with a Story 13.4 file set.

### File List

- `apps/api/src/reports/financial-reports.service.ts` (new)
- `apps/api/src/reports/financial-reports.service.spec.ts` (new)
- `apps/api/src/reports/reports.controller.ts` (extended — `GET /reports/financial`)
- `apps/api/src/reports/reports.module.ts` (extended — provider registration + comment)
- `apps/api/src/reports/reports.controller.spec.ts` (extended — Financial threading cases)
- `apps/api/src/reports/reports.controller.integration.spec.ts` (extended — route-ordering case)
- `apps/api/src/reports/no-tenant-scoping.spec.ts` (extended — Story 13.4 file set)
- `packages/shared/src/types/report-filters.ts` (extended — `FinancialReportFilters`)
- `apps/web/app/(app)/reports/page.tsx` (extended — Financial tab view, fetcher, types)

## Suggested Review Order

**The reconciliation-critical aggregation (AC #1)**

- Entry point: five category SUMs in Postgres; Godown-material and labour/machinery kept Contractor-only; per-Site rows carry labour/machineryVehicle as `null`, never a fabricated `0`.
  [`financial-reports.service.ts:78`](../../apps/api/src/reports/financial-reports.service.ts#L78)

- The reconciliation invariant, test-proven: Σ bySite.total + labour + machineryVehicle + Godown material == contractorTotal.total.
  [`financial-reports.service.spec.ts:129`](../../apps/api/src/reports/financial-reports.service.spec.ts#L129)

**Route + AD-1**

- New `/reports/financial` sibling route (integration-covered) and the extended no-tenant-scoping proof.
  [`reports.controller.ts`](../../apps/api/src/reports/reports.controller.ts)
  [`no-tenant-scoping.spec.ts:1`](../../apps/api/src/reports/no-tenant-scoping.spec.ts#L1)

**Web**

- Financial tab: Contractor StatTile row + scope-aware breakdown; a selected Site shows "Not tracked per-Site" for Labour/Machinery-Vehicle rather than a blank/₹0 cell.
  [`page.tsx:1`](../../apps/web/app/(app)/reports/page.tsx#L1)
