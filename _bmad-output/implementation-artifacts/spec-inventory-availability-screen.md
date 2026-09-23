---
title: 'Inventory / Available Stock screen — unified search, filters & per-material rollup'
type: 'feature'
created: '2026-09-23'
status: 'done'
review_loop_iteration: 0
context: []
baseline_commit: '42e2de708c596e661cc1041b801440d61152115d'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** `/inventory` shows two separate, unfiltered Godown/Site tables with no search, category/location/stock-level filtering, sorting, or pagination — and the parallel `/reports?tab=inventory` view disagrees with it (empty Site Stock until a Site is picked) even though both read the same `StockService`. There is no single scannable "where is my stock" view.

**Approach:** Rebuild `/inventory` as one unified table (one row per Material×Location) with search, quick filters, sort, and pagination, built entirely on the existing Story 16.1 list platform (`useListQueryState`/`useDebouncedSearch`/`Pagination`/`DataTable` sort). Fix the Reports-tab Site Stock gap in the same pass so both screens agree by default.

## Boundaries & Constraints

**Always:**
- Reuse Story 16.1's shared platform (`useListQueryState`, `useDebouncedSearch`, `Pagination`, `DataTable`'s `sortKey`) — never a bespoke filter/pagination mechanism.
- Existing `/stock/godown`, `/stock/site`, `/stock/site/:siteId`, `/stock/low-stock`, `/stock/material/:materialId` and their current consumers (Dashboard, DSR Materials Used picker, global search, `/materials/[id]/availability`) stay unchanged — the new endpoint is additive only.
- "Low Stock" quick filter reuses FR-36's existing definition exactly (a Material's Godown balance summed across all its Sizes vs. its own `lowStockThreshold`) — never invent a per-row/per-Size threshold.
- The per-material "total across all locations" view links to the existing `/materials/[id]/availability` page (Story 16.3) — reuse it, do not rebuild that aggregation.
- "Last Updated" is each `GodownStock`/`SiteStock` row's own `updatedAt` (current live balance) — no historical/point-in-time reconstruction.
- Fix `SiteInventoryReportsService.getInventoryReport` to call `getAllSiteStock(materialId)` when no `siteId` filter is given, so the Reports-tab Site Stock table matches `/inventory`'s all-Sites-by-default view.

**Never:** Change how stock is computed or written (Purchase/Movement/Consumption/ReturnWastage stock-delta logic is out of scope); add a new materialized "Inventory" table — merge/filter/sort/paginate `GodownStock`+`SiteStock` in application code, same precedent as `StockService.getStockByMaterial`/`searchCandidates`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Search only | `q=cement` | rows (any location) whose Material name contains "cement" | N/A |
| Location Type quick filter | `locationType=GODOWN` | only Godown rows | N/A |
| Stock Level = Low Stock | `stockLevel=LOW` | rows whose Material is in today's FR-36 low-stock set | N/A |
| Stock Level = No Stock | `stockLevel=ZERO` | rows with `quantity === 0` at that location | N/A |
| Combined filters + pagination | `q` + `categoryId` + `siteId` + `page=2` | filters AND-combined, then sliced to the requested page | N/A |
| Nothing recorded anywhere | zero GodownStock/SiteStock rows | "nothing recorded yet" empty state (AD-6) | N/A |
| Filters match nothing | e.g. `q=xyz` | "no results match your filters" + Clear filters (AD-6) | N/A |

</frozen-after-approval>

## Code Map

- `apps/api/src/inventory/stock.service.ts` -- add `listInventory(filters)`: extend `GODOWN_STOCK_INCLUDE`/`SITE_STOCK_INCLUDE`'s material join with `category: true`; merge Godown+Site rows into one flat `{materialId, materialName, categoryId, categoryName, sizeLabel, unit, locationType, siteId?, siteName?, quantity, updatedAt}` list; filter by `q`/`categoryId`/`siteId` (or a `"GODOWN"` sentinel)/`locationType`/`stockLevel` (`ALL|AVAILABLE|LOW|ZERO`, `LOW` cross-references `getLowStockMaterials()`'s Material-id set); sort by `materialName|quantity|updatedAt`; paginate via existing `apps/api/src/common/pagination.ts`'s `paginationParams()`.
- `apps/api/src/inventory/stock.controller.ts` -- add `GET /stock/inventory` forwarding all query params as one object (plain `@Query()`, no Zod pipe, matching `sites.controller.ts`); the 5 existing routes are untouched.
- `apps/api/src/reports/site-inventory-reports.service.ts:101-103` -- change the no-`siteId` branch from `Promise.resolve([])` to `this.stock.getAllSiteStock(materialId)`.
- `apps/web/app/(app)/inventory/page.tsx` -- keep StatTiles/Alerts sections; fetch Categories (`GET /material-categories`) + Sites (`GET /sites`) for filter dropdowns; replace today's two-table "Stock Levels" section with a new `InventoryListClient`.
- `apps/web/app/(app)/inventory/inventory-list-client.tsx` (new) -- modeled on `apps/web/app/(app)/rmc/rmc-entries-list-client.tsx`: `useListQueryState()` + `useDebouncedSearch` search box; Category/Site `SelectField`s; a chip row for Location Type (All/Godown/Site) and Stock Level (Available/Low Stock/No Stock) wired via `setFilter`; sortable `DataTable` (Material/Location/Location Type/Available Qty/Unit/Last Updated) with `mobileCard`; `Pagination`; both AD-6 empty states. Material name links (`next/link`) to `/materials/[id]/availability`.
- `apps/web/lib/format.ts` -- reuse existing `formatDate`/`formatDateTime` for Last Updated; no changes.

## Tasks & Acceptance

**Execution:**
- [x] `apps/api/src/inventory/stock.service.ts` -- add `listInventory()` -- single merge/filter/sort/paginate source for the new screen
- [x] `apps/api/src/inventory/stock.controller.ts` -- add `GET /stock/inventory` -- exposes it, additive only
- [x] `apps/api/src/inventory/stock.service.spec.ts` -- unit tests covering every I/O matrix row
- [x] `apps/api/src/inventory/stock.controller.spec.ts` -- param-forwarding test (Story 16.1 convention)
- [x] `apps/api/src/reports/site-inventory-reports.service.ts` -- swap in `getAllSiteStock(materialId)` for the no-`siteId` case
- [x] `apps/api/src/reports/site-inventory-reports.service.spec.ts` -- assert the no-`siteId` case now calls `getAllSiteStock`
- [x] `apps/web/app/(app)/inventory/inventory-list-client.tsx` -- new unified table/filters/pagination
- [x] `apps/web/app/(app)/inventory/page.tsx` -- fetch categories/sites, render `InventoryListClient`
- [x] `apps/web/app/(app)/inventory/inventory-list-client.test.tsx` -- filter/search/sort/pagination + both empty states

**Acceptance Criteria:**
- Given Godown holds 120 Bags of Cement OPC and Site A holds 40, when I open `/inventory` with no filters, then both rows appear sorted by Material name, and clicking "Cement OPC" opens `/materials/[id]/availability` showing the full cross-location rollup.
- Given I select the "Low Stock" quick filter, then only rows for Materials currently below their configured `lowStockThreshold` (FR-36's existing definition) appear.
- Given I select "Godown Stock" or "Site Stock", then only rows of that location type appear.
- Given a search matches no Material, then the "no results match your filters" empty state with Clear filters appears, not the zero-ever-recorded state.
- Given no `siteId` filter, when I load `/reports?tab=inventory`, then its Site Stock table shows all Sites' balances, matching `/inventory`'s default.
- Given more rows exist than one page, clicking Next advances the URL's `page` param and renders the correct slice (Previous/Next only, no infinite scroll).

## Design Notes

`lowStockThreshold` is Material-level and Godown-only (FR-36, established in Story 5.7) — not per-Size, not per-Site. So the "Low Stock" quick filter flags a row by whether its **Material** is currently under threshold, not whether that specific row's own quantity is low. A Site-only row for a Material whose Godown balance is under threshold will still show up under "Low Stock" even though the Site row itself might be well-stocked — this is correct/existing behavior, not a bug to "fix" into a per-row check.

## Verification

**Commands:**
- `pnpm --filter @azentisfieldos/api test -- stock.service.spec.ts stock.controller.spec.ts site-inventory-reports.service.spec.ts` -- all pass
- `pnpm --filter @azentisfieldos/web test -- inventory-list-client.test.tsx` -- all pass
- `pnpm --filter @azentisfieldos/api typecheck && pnpm --filter @azentisfieldos/web typecheck` -- no errors

**Manual checks:**
- Open `/inventory` on a narrow viewport — confirm `mobileCard` rendering, apply each quick filter and Category/Site dropdown, and confirm URL params update and results narrow correctly; confirm `/reports?tab=inventory` now shows all-Sites Site Stock with no Site selected.

## Suggested Review Order

**Merge/filter/sort/paginate core**

- Entry point — merges Godown+Site into one flat, filterable list; start here to grasp the whole design.
  [`stock.service.ts:319`](../../apps/api/src/inventory/stock.service.ts#L319)

- Review-round fix: an explicit `locationType` now wins over a conflicting `siteId` instead of both canceling to empty.
  [`stock.service.ts:338`](../../apps/api/src/inventory/stock.service.ts#L338)

- `LOW` cross-references the pre-existing Material-level threshold set, not a per-row check (see Design Notes).
  [`stock.service.ts:416`](../../apps/api/src/inventory/stock.service.ts#L416)

**New endpoint**

- Additive-only route forwarding all 9 filters as one object; the 5 existing `/stock/*` routes are untouched.
  [`stock.controller.ts:17`](../../apps/api/src/inventory/stock.controller.ts#L17)

**Reports-tab consistency fix**

- No-`siteId` branch now reads all Sites, matching `/inventory`'s default instead of returning empty.
  [`site-inventory-reports.service.ts:104`](../../apps/api/src/reports/site-inventory-reports.service.ts#L104)

- Review-round fix: empty-state copy no longer implies picking a Site would change an already-all-Sites result.
  [`page.tsx:803`](../../apps/web/app/(app)/reports/page.tsx#L803)

**UI binding**

- Search/Category/Site filters, quick-filter chips, sortable columns, and both AD-6 empty states.
  [`inventory-list-client.tsx:120`](../../apps/web/app/(app)/inventory/inventory-list-client.tsx#L120)

- Review-round fix: `role="group"`/`aria-pressed` on the quick-filter chips for screen-reader users.
  [`inventory-list-client.tsx:173`](../../apps/web/app/(app)/inventory/inventory-list-client.tsx#L173)

- Column definitions and the composite row key (no synthetic id needed for a merged, non-persisted row).
  [`inventory-list-client.tsx:67`](../../apps/web/app/(app)/inventory/inventory-list-client.tsx#L67)

- Server Component fetches Categories/Sites/paginated inventory and renders the client.
  [`page.tsx:94`](../../apps/web/app/(app)/inventory/page.tsx#L94)
