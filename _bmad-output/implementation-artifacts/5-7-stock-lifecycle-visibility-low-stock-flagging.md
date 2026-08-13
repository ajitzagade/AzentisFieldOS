---
baseline_commit: cf5dd4dc709029a08e7c4febf34f2421f394871f
---

# Story 5.7: Stock Lifecycle Visibility & Low-Stock Flagging

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As Owner/Admin,
I want full stock visibility per Material/Size/Site/Godown, always derived from transaction history, with low-stock flagged automatically against a configured threshold,
so that I catch a shortage before it stalls work, not after.

## Acceptance Criteria

1. **Given** any combination of Purchase/Movement/Consumption/Wastage entries for a Material, **when** I view its stock lifecycle, **then** the displayed quantity always reconciles exactly to the sum of its transaction history — never a manually-editable "current stock" field. (FR-14)
2. **Given** a Material's stock falls below its configured per-Material threshold, **when** I view Inventory, **then** a Gap Flag names the exact Material and threshold, with a direct "Transfer Stock" action, never a bare warning badge. (FR-36)
3. Every Material type, size, and unit remains admin-configurable, and the low-stock threshold is likewise admin-configurable per Material — never hardcoded. (NFR-4)

## Tasks / Subtasks

- [x] Task 1 — Schema addition: low-stock threshold (AC: #2, #3)
  - [x] `infra/prisma/schema.prisma`'s `Material` model has no field for FR-36's "admin-defined per-Material...threshold" — add `lowStockThreshold Decimal?` (nullable: a Material with no threshold set never flags as low-stock, rather than defaulting to some arbitrary number nobody chose). Run `pnpm db:generate`.
  - [x] Extend `updateMaterialSchema` (`packages/shared/src/schemas/material.ts`, from Epic 4 Story 4.1) with an optional `lowStockThreshold: z.number().positive().optional()`. This is edited via the existing Material `PATCH` endpoint and edit page from Epic 4 — not a new endpoint.
  - [x] Add a "Low-stock threshold" `TextField` (type `number`) to `apps/web/app/(app)/materials/[id]/edit/page.tsx` (Epic 4 Story 4.1's page) — this is a small addition to an existing form, not a new screen.
- [x] Task 2 — FR-14: stock lifecycle is already correct, add a read endpoint to expose it (AC: #1)
  - [x] No new write logic — `GodownStock`/`SiteStock` have been correctly, atomically maintained by every Purchase/Movement/Consumption/Wastage write path since Stories 5.1–5.6 (AD-9's materialized-balance guarantee). This task is read-only: `apps/api/src/inventory/stock.controller.ts` + `.service.ts` (new, added to `InventoryModule`): `GET /stock/godown`, `GET /stock/site/:siteId`, both joining `MaterialSize` → `Material` → `Unit` for display, matching `05-inventory.html`'s "Stock Levels" tables (Material / Size / Unit / Qty on Hand columns).
  - [x] Add a reconciliation test (not new production code) that sums a fixture set of Purchase/Movement/Consumption/Wastage rows for one `materialSizeId` and asserts the total matches `GodownStock`/`SiteStock` after all of them apply — this is the concrete proof of AC #1, not just an assertion that the tables exist.
- [x] Task 3 — FR-36: low-stock computation and Gap Flag (AC: #2, #3)
  - [x] `stock.service.ts`: `getLowStockMaterials()` — a query joining `Material` (where `lowStockThreshold IS NOT NULL`) to `GodownStock` (summed across that Material's `MaterialSize`s, or per-Size if a Material's total is what's compared — see Dev Notes "Per-Material vs per-Size threshold, a deliberate scope call") against `lowStockThreshold`. Exposed as `GET /stock/low-stock`.
  - [x] `apps/web/app/(app)/inventory/page.tsx` — replace the stub `EmptyState` with the real Inventory page: stat tiles (Godown Stock Value, Site Stock Value, Low-stock Materials count, Purchases This Month — the last two need Task 2/Story 5.1's data; the first two need a rate/price rollup which this story does **not** build, see Dev Notes "Stat tiles this story does and doesn't build"), an "Alerts" section rendering one `GapFlag` per low-stock Material (`packages/ui`'s existing `GapFlag` component from Epic 1) with a "Transfer Stock" primary action linking to `/movements/godown-to-site/new` (Story 5.2), and the two-column "Stock Levels" table (Godown / by-Site) from Task 2's endpoints.
- [x] Task 4 — Tests (AC: all)
  - [x] `stock.service.spec.ts`: reconciliation test (Task 2); low-stock query correctly includes/excludes Materials based on threshold and current balance, and skips Materials with `lowStockThreshold: null` entirely.
  - [x] `apps/web` component test: `GapFlag` renders with the Material name and threshold in its message text (per `EXPERIENCE.md`'s Voice and Tone table — "names the exact Material and threshold," not a generic "Low stock!" message), and its action links to the Movement entry route.

## Dev Notes

**Two schema gaps found while writing this story, not by the earlier Epic 4/5 stories — both are additive, no migration conflicts:** (1) `Material.lowStockThreshold` doesn't exist yet, even though FR-36 clearly requires it and it's naturally Material-catalog data. It wasn't caught in Epic 4 because FR-36 isn't in Epic 4's FR list (CAP-10/Dashboard's FR set) — but this story (Epic 5) is the one that actually needs it to satisfy its own AC #2, so it's added here, extending Epic 4's existing Material edit form rather than opening a new one. (2) None — `ReturnWastage`'s `correctsId`/`reason` gap was already caught and fixed in Story 5.6; this story doesn't need to re-touch it.

**Per-Material vs per-Size threshold, a deliberate scope call.** `GodownStock`/`SiteStock` are keyed by `materialSizeId`, but FR-36's literal wording is "a per-Material-per-Tenant threshold," not per-Size. This story follows the FR text exactly: one `lowStockThreshold` per `Material`, compared against that Material's balance **summed across all its Sizes**. A Material with no Sizes (common — see Epic 4 Story 4.1's Dev Notes on Materials with zero `MaterialSize` rows, e.g. Cement) has exactly one implicit "size" to sum, so the summation degenerates correctly to a direct comparison in that case. Do not build a per-Size threshold — that's a different, more granular feature FR-36 doesn't ask for, and would need its own FR/story to justify.

**Stat tiles this story does and doesn't build.** `05-inventory.html`'s mockup shows four stat tiles: Godown Stock Value (₹), Site Stock Value (₹), Low-stock Materials (count), Purchases This Month (count). This story builds the **count**-based tiles (Low-stock Materials from Task 3, Purchases This Month from a simple `Purchase` count query scoped to the current month) because they're directly derivable from what Stories 5.1–5.6 already record. The **value** tiles (₹ rollups) require multiplying quantity × rate/cost per `MaterialSize` and summing — `Purchase.rate` exists per-Purchase-row but there's no single "current unit cost" concept anywhere in the schema (a Material's cost varies purchase to purchase). Computing a defensible stock valuation (latest rate? weighted average?) is a real design decision this story's ACs don't ask for and shouldn't invent silently — render the two value tiles with a `—` placeholder and a short note ("Stock valuation not yet available"), the same honest-placeholder approach `apps/web/app/(app)/sites/page.tsx` already used for "Last DSR activity" before Epic 3 existed. Do not fabricate a valuation formula to fill the tile.

**Depends on Stories 5.1–5.6** for the transaction write paths whose correctness this story's reconciliation test verifies, and on Epic 4 Story 4.1 for the Material edit page this story extends with the threshold field.

**Architecture constraints in force:** AD-3, AD-4, AD-5, AD-6 (the Inventory page's Alerts/Stock Levels sections need loading/empty/error states — a Tenant with no low-stock Materials shows no Gap Flags, not an error), AD-9 (this story only reads `GodownStock`/`SiteStock`, never writes to them directly — see Dev Notes on the write-path guarantee already established by 5.1–5.6), NFR-4.

### Project Structure Notes

- One schema edit (`Material.lowStockThreshold`) plus new `apps/api/src/inventory/stock.controller.ts`/`.service.ts`, and a full rewrite of the existing stub `apps/web/app/(app)/inventory/page.tsx`.
- Extends (doesn't recreate) `apps/web/app/(app)/materials/[id]/edit/page.tsx` from Epic 4.

### References

- [Source: _bmad-output/specs/spec-AzentisFieldOS/functional-requirements.md#CAP-3, CAP-10] (FR-14, FR-36)
- [Source: _bmad-output/planning-artifacts/stories/phase-3-materials-inventory/epic-5-inventory-transactions-stock-visibility/story-5.7-stock-visibility-low-stock.md]
- [Source: infra/prisma/schema.prisma#Material — missing lowStockThreshold, this story's Task 1 fix]
- [Source: _bmad-output/implementation-artifacts/4-1-manage-material-categories-materials.md — the Material edit page this story extends]
- [Source: _bmad-output/implementation-artifacts/5-1-record-a-purchase.md through 5-6-record-wastage-return.md — the write paths this story's reconciliation test verifies]
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/05-inventory.html]
- [Source: packages/ui/src/components/gap-flag.tsx]
- [Source: apps/web/app/(app)/sites/page.tsx — honest-placeholder precedent for not-yet-available data]

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (claude-sonnet-5)

### Debug Log References

### Completion Notes List

- Task 1: added `Material.lowStockThreshold Decimal?` via the established non-interactive migration workaround, extended `updateMaterialSchema` with `lowStockThreshold: z.number().positive().nullable()` (nullable, not just optional — an explicit `null` clears the threshold, distinct from "field omitted"), and added the field to the existing Material edit form/action. `MaterialsService.update()` needed no code change since it already spreads `input` directly into Prisma's `data`.
- Task 2: `StockService.getGodownStock`/`getSiteStock` are pure reads, no new write path. The reconciliation test (`stock.service.integration.spec.ts`) exercises the real `PurchasesService`/`MovementsService`/`ConsumptionService`/`ReturnWastageService` write paths against one `materialSizeId`, then independently re-sums the ledger tables via `prisma.*.aggregate()` (not just re-reading the materialized balance, which would be circular) and asserts they match — confirmed 70 (Godown) / 15 (Site) against a hand-verifiable scenario.
- Task 3: `getLowStockMaterials()` sums a Material's `GodownStock` across all its `MaterialSize`s (never per-Size), matching FR-36's literal per-Material wording and Dev Notes' explicit scope call — verified with unit tests including a multi-Size summation case.
- Also added `PurchasesService.countThisMonth()` / `GET /purchases/count/this-month` (not explicitly named as a new endpoint in Task 2/3's text, but required by Task 3's own instruction to build the "Purchases This Month" stat tile from "a simple Purchase count query scoped to the current month" — a backend query, not a client-side filter over the full unbounded Purchase list).
- `/movements/site-to-site` has no combined "all Sites" stock endpoint (Task 2 scopes `GET /stock/site/:siteId` to one Site at a time, matching its literal endpoint list) — the Inventory page fetches `GET /sites` then calls `GET /stock/site/:siteId` per Site in parallel and flattens, reusing only the specified endpoints rather than inventing a broader one.
- The two ₹ value stat tiles (Godown/Site Stock Value) render a `—` placeholder with an explanatory label, per Dev Notes' explicit instruction not to invent a stock-valuation formula — matching `apps/web/app/(app)/sites/page.tsx`'s existing honest-placeholder precedent.
- Final state: `apps/api` 213 tests / 28 files passing, `apps/web` 203 tests / 54 files passing. Both packages typecheck, lint, and build clean. This completes Epic 5 (all 7 stories).

### File List

- `infra/prisma/schema.prisma` (modified — added `Material.lowStockThreshold`)
- `infra/prisma/migrations/20260813130000_add_material_low_stock_threshold/migration.sql` (new)
- `packages/shared/src/schemas/material.ts` (modified — extended `updateMaterialSchema`)
- `apps/web/app/(app)/materials/page.tsx` (modified — `MaterialListItem.lowStockThreshold`)
- `apps/web/app/(app)/materials/[id]/edit/edit-material-form.tsx` (modified — Low-stock threshold field)
- `apps/web/app/(app)/materials/[id]/edit/edit-material-form.test.tsx` (modified)
- `apps/web/app/(app)/materials/[id]/edit/actions.ts` (modified — null-clearing logic)
- `apps/web/app/(app)/materials/[id]/edit/actions.test.ts` (modified)
- `apps/api/src/materials/materials.controller.spec.ts` (modified — `lowStockThreshold` Zod tests)
- `apps/api/src/inventory/stock.service.ts` (new)
- `apps/api/src/inventory/stock.controller.ts` (new)
- `apps/api/src/inventory/stock.service.spec.ts` (new)
- `apps/api/src/inventory/stock.controller.spec.ts` (new)
- `apps/api/src/inventory/stock.service.integration.spec.ts` (new — reconciliation test)
- `apps/api/src/inventory/purchases.service.ts` (modified — added `countThisMonth`)
- `apps/api/src/inventory/purchases.controller.ts` (modified — `GET /purchases/count/this-month`)
- `apps/api/src/inventory/purchases.controller.spec.ts` (modified)
- `apps/api/src/inventory/purchases.service.spec.ts` (modified)
- `apps/api/src/inventory/inventory.module.ts` (modified — registered `StockController`/`StockService`)
- `apps/web/app/(app)/inventory/page.tsx` (replaced stub — full Inventory page)
- `apps/web/app/(app)/inventory/page.test.tsx` (new)
