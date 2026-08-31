---
baseline_commit: f712ede0bf1670bbe54676c0dcbc7330419c06c7
---

# Story 16.3: Cross-Site Material Availability & Guided Transfer

Status: done

## Story

As Owner/Admin,
I want to search for a Material, see how much of it exists at every Site and the Godown, and move some of it from one location to another in one guided flow,
so that I don't have to already know which Site has stock, or leave the search to go hunt for the right Movement form.

## Acceptance Criteria

1. **Given** I search a Material (from global search, Story 16.2, or a dedicated Material-availability page), **when** results load, **then** I see one table listing the Godown and every Site holding a balance of that Material's Sizes, with quantity and Unit, sorted by quantity descending — sourced from one aggregate query, never an N+1 fetch per Site.
2. **Given** I pick a source location with available stock, **when** I choose "Transfer from here," **then** I land in the existing Movement form (`MovementForm`) with the Material/Size and source pre-filled — this reuses the existing form and create path exactly, it does not introduce a second transfer mechanism.
3. **Given** the source I picked is a Site, **when** the form opens, **then** it's the existing `SITE_TO_SITE` kind; **given** the source is the Godown, **then** it's the existing `GODOWN_TO_SITE` kind — matching how `vendor-to-site`/`site-to-site` already reuse this same form today, no new Movement kind is added.
4. **Given** I choose a destination Site and enter a quantity, **when** the quantity exceeds the source's available stock, **then** the existing stock-floor warning and server-side floor check apply exactly as they do today for a manually-opened Movement form — no new validation logic is built for this entry point.
5. **Given** I confirm the transfer, **when** it submits, **then** a normal Movement row is created through the existing `POST /movements` path — this flow is a new front-door onto existing data, not a new table or transaction type.
6. **Given** the Material has zero stock anywhere, **when** I view its availability, **then** an honest empty state shows ("Not currently in stock at any location") rather than an empty table with no explanation.

## Tasks / Subtasks

- [x] Task 1: Aggregate stock-by-material endpoint (AC: #1)
  - [x] Added `StockService.getStockByMaterial(materialId)` to the existing `apps/api/src/inventory/stock.service.ts` (alongside `getGodownStock`/`getSiteStock`/`getLowStockMaterials`, same file — no new service). Two plain `findMany` calls in parallel (`quantity: { gt: 0 }` on both), merged into one flat array of rows (`{ location: { kind: 'godown' } | { kind: 'site'; id; name }, materialSizeId, sizeLabel, quantity, unit }`), sorted by quantity descending.
  - [x] Added `GET /stock/material/:materialId` to the existing `stock.controller.ts` (alongside `godown`/`site/:siteId`/`low-stock` — no new controller).
  - [x] 3 new tests in `stock.service.spec.ts` (both findMany calls scoped correctly with the zero-quantity exclusion; Godown + Site rows merged and sorted descending; empty array when nothing anywhere) + 1 new test in `stock.controller.spec.ts` (param forwarding).
- [x] Task 2: Material availability page (AC: #1, #6)
  - [x] Added `apps/web/app/(app)/materials/[id]/availability/page.tsx` — fetches `GET /materials` (existing, bounded catalog data — same full-list-then-find-by-id pattern every movement "new" page already uses for Material pickers) to resolve the Material's own name for the header, 404s via Next's `notFound()` if the id doesn't match any Material, and `GET /stock/material/:id` for the balance rows. Renders one `DataTable` (columns: Location, Size, Quantity+Unit combined, a "Transfer from here" action) with `state={rows.length === 0 ? {status:"empty", message:"Not currently in stock at any location"} : {status:"success", rows}}` — `DataTable`'s own empty state (AD-6), mirroring `apps/web/app/(app)/rmc/page.tsx`'s existing pattern exactly.
  - [x] Each row's "Transfer from here" is a `Link` styled as a secondary button — a Godown row links to `/movements/godown-to-site/new?materialSizeId=<id>`; a Site row links to `/movements/site-to-site/new?materialSizeId=<id>&sourceSiteId=<siteId>` (Task 3 makes both pages understand these new params).
  - [x] 5 new tests: Material name in the header, 404 for an unknown id, empty state with zero stock rows, correct Godown-row href/quantity/size rendering, correct Site-row href.
- [x] Task 3: Wire the pre-fill query params into the existing Movement forms (AC: #2, #3, #4, #5)
  - [x] `apps/web/app/(app)/movements/godown-to-site/new/page.tsx`: added a new `?materialSizeId=` search param, read alongside the existing `?materialId=`/`?siteId=` (that pair's single-size-only heuristic and its `destinationSiteId` prefill are untouched). When `materialSizeId` matches a real Size it wins over the `materialId`-derived guess.
  - [x] `apps/web/app/(app)/movements/site-to-site/new/page.tsx`: had **no** `searchParams` handling at all — added `?materialSizeId=`/`?sourceSiteId=`, prefilling `initial.materialSizeId`/`initial.sourceSiteId` (the existing `MovementFormInitialValues` shape already had both fields; `MovementForm` already renders a Source Site picker for `kind="SITE_TO_SITE"` — only the page-level wiring was missing). An unrecognized id in either param is silently ignored (no prefill), never a crash.
  - [x] No changes to `MovementForm`, its Zod schema, `createMovementAction`, or `POST /movements` — confirmed by construction: the stock-floor warning (`useStock`/`stockStatus`) and the server-side floor check are unaware of how a field got its value, so they run identically whether a field was typed or prefilled (AC #4/#5 satisfied without new validation code).
  - [x] Tests: `godown-to-site/new/page.test.tsx` gained 2 tests (explicit `?materialSizeId=` wins over an ambiguous multi-Size `?materialId=`; the pre-existing `?materialId=`/`?siteId=` single-Size heuristic still works unchanged). `site-to-site/new/page.test.tsx` gained 2 tests (`?materialSizeId=`/`?sourceSiteId=` prefill both fields; an unrecognized id in either param is ignored, not crashed).
- [x] Task 4: Discoverability — link out from the Material's own page (AC: #1)
  - [x] `apps/web/app/(app)/materials/[id]/edit/page.tsx` (the only existing per-Material page — there is no separate `/materials/[id]` detail page) gained a "View availability across Sites" link to `/materials/[id]/availability`, satisfying the planning story's "or a dedicated Material-availability page" entry point without building a second search mechanism.
  - [x] 1 new test confirming the link renders with the correct href.
- [x] Task 5: Close the loop with Story 16.2's global search (fixes a real bug, not just a refinement)
  - [x] Confirmed the bug found while researching this story: Story 16.2's `global-search.tsx` pointed a selected Material result at `/materials/${id}` — a route that doesn't exist (`apps/web/app/(app)/materials/[id]/` only has an `edit/` subroute). Repointed `handleSelect`'s `materials` branch to `/materials/${item.id}/availability` and removed the now-stale "interim landing page" comment.
  - [x] Updated `global-search.test.tsx`'s Material-selection test to expect `/materials/m1/availability`.
- [x] Task 6: Regression & test coverage (AC: all)
  - [x] Per-file unit/integration tests added for every new/changed file (listed per-task above) — 15 new tests total (4 API: 3 `StockService.getStockByMaterial` + 1 `StockController.getStockByMaterial`; 11 web: 5 availability page + 2 godown-to-site/new + 2 site-to-site/new + 1 edit-page link + 1 modified global-search retarget assertion, plus the pre-existing tests each touched file already had). **Corrected 2026-08-31**: the original Completion Notes miscounted this as "20 new tests / 16 web" — caught by the code-review Acceptance Auditor; the itemized breakdown was always correct, only the headline sum was wrong.
  - [x] Full root `pnpm typecheck` — all 4 packages clean. Full root `pnpm test` — 827 API (56 skipped) + 685 web + 143 UI, all passing. Full root `pnpm lint` — `apps/api`'s 33 errors / 35 warnings confirmed **byte-identical** (via `diff` on the two lint runs' flagged-file lists) to Story 16.1/16.2's baseline; zero new issues from this story's 8 touched/new files.
  - [x] Confirmed no regression: every pre-existing `stock.controller`/`stock.service` test still passes unchanged, both `godown-to-site`/`site-to-site` "new" pages' pre-existing tests are unaffected by the additive param handling, and Story 16.2's `global-search.test.tsx` suite passes with only the one intentionally-updated Material-destination assertion changed.

### Review Findings

- [x] [Review][Patch] No test exercises the exact URL shape `MaterialAvailabilityPage.transferHref()` actually produces for a Godown row (`?materialSizeId=` alone, no `materialId`) against the receiving `godown-to-site/new` page — the existing "prefills an exact ?materialSizeId=" test there passes both `materialId` and `materialSizeId` together (a different scenario: precedence when both happen to coexist), so the real availability-page→movement-form handoff is never directly tested [apps/web/app/(app)/movements/godown-to-site/new/page.test.tsx].
- [x] [Review][Patch] `godown-to-site/new/page.test.tsx` has no equivalent to `site-to-site/new/page.test.tsx`'s "ignores an unrecognized ?materialSizeId=/?sourceSiteId= rather than crashing" test — asymmetric coverage between the two pages this story touches identically.
- [x] [Review][Patch] `MaterialAvailabilityPage` fetches `getMaterial(id)` and `getStockByMaterial(id)` sequentially (`await` one, then `await` the other) instead of concurrently via `Promise.all` — an easy, low-risk latency win on every page load [apps/web/app/(app)/materials/[id]/availability/page.tsx].
- [x] [Review][Defer] `GET /stock/material/:materialId` returns `200 []` for both a nonexistent Material and a real Material with zero stock — indistinguishable at the API level. Deferred: the web page already handles the 404 case via a separate `getMaterial()` existence check before ever calling this endpoint, so no current consumer is affected; only relevant if another consumer calls the stock endpoint directly in the future.

## Dev Notes

- **This story is a new front-door onto existing data, not a new transaction type.** No Prisma schema/migration is expected — `GodownStock`/`SiteStock` are read-only here (`StockService` already only ever reads them, per its own file header comment), and the transfer itself goes through the exact same `POST /movements` path (`MovementForm` → `createMovementAction` → the Movement Prisma model) that `godown-to-site`/`site-to-site` already use today. Do not add a new Movement kind, a new schema, or a duplicate floor-check.
- **The aggregate query is the one genuinely new piece.** `StockService.getGodownStock(materialId?)` and `getSiteStock(siteId, materialId?)` already exist and already support an optional `materialId` filter — this story's `getStockByMaterial` is a third method in the same file, calling the Godown and Site sides in parallel (2 total queries) and merging, not a per-Site loop. This is the same "no N+1" discipline the 2026-08-29 product review flagged the current per-Site stock fetch pattern for.
- **A stock-by-material row is per (location, Size), not per (location, Material) summed across Sizes.** A Site holding two different Sizes of the same Material appears as two separate rows — this is what makes "Transfer from here" unambiguous per row (it already carries one specific `materialSizeId`), unlike the pre-existing Inventory low-stock `?materialId=` deep link, which can only guess a Size when the Material happens to have exactly one.
- **Two different pre-fill vocabularies coexist in `godown-to-site/new/page.tsx`, deliberately.** The existing `?materialId=`/`?siteId=` pair (used today by the Inventory page's low-stock "Transfer Stock" CTA) stays exactly as it is — same single-size-only heuristic, same meaning (`siteId` = destination). This story adds a second, unambiguous `?materialSizeId=` param for callers (this story's availability page) that already know the exact Size; when present it takes priority. Do not change or remove the existing param's behavior — the low-stock CTA is a live caller.
- **`site-to-site/new/page.tsx` has zero pre-fill support today** — adding `?materialSizeId=`/`?sourceSiteId=` here is net-new for that page, not an extension of an existing pattern the way `godown-to-site` is.
- **Story 16.2 shipped a real bug this story fixes**: its global search pointed a selected Material at a page (`/materials/[id]`) that was never built (the codebase only has `/materials/[id]/edit`). Task 5 is not optional polish — it's closing a 404 that exists in the current tree.
- **AD-6 discipline**: the availability table's empty state is `DataTable`'s own `state="empty"` variant (mirroring `apps/web/app/(app)/rmc/page.tsx`'s existing report table exactly), never a bespoke "no stock" screen.
- **Backward compatibility**: every change here is additive — a new `StockService` method, a new controller route, a new page, and new *optional* search params on two existing pages whose current callers (Inventory's low-stock CTA) don't pass the new param and are therefore unaffected.

### Project Structure Notes

- `apps/api/src/inventory/stock.service.ts`, `stock.controller.ts` — extend in place, no new module.
- `apps/web/app/(app)/materials/[id]/availability/` — new route, sibling to the existing `[id]/edit/`.
- `apps/web/app/(app)/movements/godown-to-site/new/page.tsx`, `apps/web/app/(app)/movements/site-to-site/new/page.tsx` — extend `searchParams` handling in place; `movement-form.tsx` itself is untouched (its `MovementFormInitialValues` already has every field this story needs).
- `apps/web/app/(app)/_components/global-search.tsx` — one-line destination fix.

### References

- [Source: `_bmad-output/planning-artifacts/stories/phase-8-post-launch/epic-16-search-and-scale/story-16.3-cross-site-material-lookup-and-transfer.md`] — original planning story.
- [Source: `_bmad-output/implementation-artifacts/16-2-global-search.md`] — the interim `/materials/[id]` destination this story replaces, and the reasoning recorded there for why.
- [Source: `infra/prisma/schema.prisma#GodownStock,SiteStock`] — both keyed by `materialSizeId` ( + `siteId` for Site), confirming the per-(location, Size) row model.
- [Source: `apps/api/src/inventory/stock.service.ts`, `stock.controller.ts`] — `getGodownStock`/`getSiteStock`/`getLowStockMaterials` and their routes; the file/controller this story extends in place.
- [Source: `apps/web/app/(app)/movements/godown-to-site/movement-form.tsx`] — `MovementFormInitialValues` (`materialSizeId`, `sourceSiteId`, `destinationSiteId`), the `kind` prop, read completely before Task 3.
- [Source: `apps/web/app/(app)/movements/godown-to-site/new/page.tsx`] — the existing `?materialId=`/`?siteId=` single-size-heuristic prefill this story adds an unambiguous alternative alongside, not in place of.
- [Source: `apps/web/app/(app)/movements/site-to-site/new/page.tsx`] — confirmed to have zero `searchParams` handling today.
- [Source: `apps/web/app/(app)/inventory/page.tsx`] — the existing `?materialId=` "Transfer Stock" CTA this story's new param must not break.
- [Source: `apps/web/app/(app)/rmc/page.tsx`] — the `DataTable` `state="empty"` vs `state="success"` pattern this story's availability table copies exactly.
- [Source: `apps/web/app/(app)/_components/global-search.tsx`] — the Material `handleSelect` destination this story fixes.

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

- Built the aggregate `GET /stock/material/:materialId` endpoint (two parallel `findMany` calls, never per-Site), a new Material-availability page presenting one row per (location, Size) sorted by quantity, and wired "Transfer from here" into the existing `MovementForm` via two new, purely additive query params (`?materialSizeId=` on `godown-to-site/new`, `?materialSizeId=`/`?sourceSiteId=` on `site-to-site/new`) — no new Movement kind, no schema change, no new validation logic; the existing stock-floor warning and server-side floor check apply unchanged because they're unaware of how a field's value was set.
- Found and fixed a real bug while researching this story: Story 16.2's global search pointed a selected Material result at `/materials/${id}`, a route that has never existed in this codebase (only `/materials/[id]/edit` exists). Repointed it to this story's new `/materials/[id]/availability` page.
- Also added a "View availability across Sites" link from the Material edit page, satisfying the planning story's "or a dedicated Material-availability page" entry point without building a second search mechanism.
- Key design decision: a stock-by-material row is per (location, Size), never summed across Sizes — this is what makes "Transfer from here" carry an exact, unambiguous `materialSizeId` on every row, unlike the pre-existing Inventory low-stock `?materialId=` deep link (which can only guess a Size when the Material happens to have exactly one).
- Full regression sweep clean: root `pnpm typecheck` (4/4 packages), `pnpm test` (827 API / 685 web / 143 UI, all passing), `pnpm lint` (apps/api's 33 errors/35 warnings confirmed byte-identical to the Story 16.1/16.2 baseline via `diff`).
- Stayed local-only per standing instruction — no deploy/push performed as part of this story.

### File List

**New files:**
- `apps/web/app/(app)/materials/[id]/availability/page.tsx` (+ `.test.tsx`)

**Modified files:**
- `apps/api/src/inventory/stock.service.ts` (+ `.spec.ts`) — `getStockByMaterial`
- `apps/api/src/inventory/stock.controller.ts` (+ `.spec.ts`) — `GET /stock/material/:materialId`
- `apps/web/app/(app)/movements/godown-to-site/new/page.tsx` (+ `.test.tsx`) — `?materialSizeId=` prefill
- `apps/web/app/(app)/movements/site-to-site/new/page.tsx` (+ `.test.tsx`) — `?materialSizeId=`/`?sourceSiteId=` prefill (net-new searchParams support)
- `apps/web/app/(app)/materials/[id]/edit/page.tsx` (+ `.test.tsx`) — availability link
- `apps/web/app/(app)/_components/global-search.tsx` (+ `.test.tsx`) — Material destination fix
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

## Change Log

- **2026-08-31 — cross-site Material availability and guided transfer.** Added `GET /stock/material/:materialId` (one aggregate query across the Godown and every Site, never per-Site) and a new `/materials/[id]/availability` page listing every location/Size balance with a "Transfer from here" action that opens the existing Movement form pre-filled — `GODOWN_TO_SITE` or `SITE_TO_SITE` depending on the row's location, reusing the exact same create path and stock-floor checks as a manually-filled form. Fixed a real bug from Story 16.2: its global search Material result pointed at a route that never existed; it now lands on this story's new page. No schema/migration changes; this is a new front-door onto existing data.