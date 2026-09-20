---
title: 'DSR/module data sync fixes + Site Activity Feed detail panel'
type: 'feature'
created: '2026-09-20'
status: 'done'
review_loop_iteration: 0
context: []
baseline_commit: '9b5f63d4ee0a68481f75d022b96cae6a8107bfaf'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** (1) The DSR Consumption picker's stock hint shows "No stock available" for materials that genuinely have stock, because `useStock` fetches once per Site and never refreshes while a long-lived DSR session (autosave/draft/resume) stays open. (2) A DSR's detail page shows only its own materialized rows — Purchases/Movements/other-module activity recorded for the same Site+Date is invisible there, which reads as "my entries didn't sync." (3) Waste Material has no DSR entry surface at all (unlike RMC/Consumption/Expense) — Supervisors must leave the Daily Report to record it. (4) DSR Subcontractor entries are JSON-only display text with no link to a real `SiteContract`, so they never contribute to `quantityCompleted`/`amountPaid`. (5) Clicking a Site's Activity Feed row does nothing — there's no way to see a record's full detail without knowing which module it came from.

**Approach:** Fix `useStock`'s staleness at its one shared source (refetch-on-focus) rather than patching every consumer. Add a read-only "Other activity" rollup to the DSR detail page by reusing `getSiteActivityFeed`, filtered to exclude this DSR's own materialized rows. Extend `WasteDisposal` with a nullable `dailySiteReportId` (mirroring `RmcEntry` exactly) and give the DSR forms a real, correction-aware Waste Material section. Extend the DSR Subcontractor entry with two new *optional* fields (`siteContractId`, `quantity`) that, when both present, create a real `SubcontractorWorkEntry` via a transaction-safe helper shared with the standalone work-entry path — entries without them stay exactly as informational as today. Wire the Site Activity Feed into the existing `DetailPanel`/`useDetailPanelState` pattern already proven on Vendors/Subcontractors, fetching full detail lazily per click via 5 new minimal `GET :id` endpoints alongside the 9 that already exist.

## Boundaries & Constraints

**Always:**
- Every new ledger write (Waste Material, Subcontractor Work Entry) goes through the same transaction as the rest of `materializeSubRecords`/`correct()` — no separate transaction, no partial-write window.
- `WasteDisposal`/`SubcontractorWorkEntry` stay append-only (AD-9): a DSR correction creates a new row with `correctsId`+`reason` pointing at the row it supersedes, matched via `clientGeneratedId` — never an UPDATE.
- `TeamMember.outstandingAdvanceBalance`-style materialized balances (here: `SiteContract.quantityCompleted`/`amountPaid` via `applyQuantityDelta`) are updated inside the same transaction as the causing row, never read-computed.
- `DailySiteReport.subcontractorEntries`'s existing JSON shape (`subcontractorId`, `workNote`, `clientGeneratedId`) and rendering stay valid for every historical row — `siteContractId`/`quantity` are additive optional fields, never a replacement.
- The Waste Material DSR entry, RMC's existing D7 nullable-rate pattern, and `WasteDisposalService`'s standalone module/pricing-pending logic are unaffected by this work outside of the new optional `dailySiteReportId` column.
- New `GET :id` endpoints mirror the exact existing 9-endpoint shape: `findUnique` + shallow `include` + `NotFoundException`, no new auth pattern invented.
- Site Activity Feed detail fetch is lazy (on click only) — no eager/prefetch-all, no new list endpoint.

**Ask First:**
- If the exact per-type "View Full Details" target route can't be confirmed to exist for a given feed type (e.g. `MOVEMENT` spans three subtypes and only `godown-to-site` has a confirmed `[id]/correct` page) — omit the link for that type rather than guessing a route, and flag it back rather than silently guessing.
- If `applyQuantityDelta`'s signature doesn't accept a plain `tx` client the way `dsr.service.ts`'s transaction needs — halt rather than forcing a nested `$transaction`.

**Never:**
- Never add the `VendorAdvance` sub-flow to the DSR-embedded Waste Material section — that stays reachable only via the standalone Waste Material form/Vendor page.
- Never touch `dsrLabourEntrySchema` or Labour's JSON-only handling — explicitly out of scope this pass.
- Never change `WasteDisposalService.summary()`/`withSettlement()`/`list()`'s existing read logic — only ensure the DSR-embedded write path populates `correctsId` correctly so those reads stay accurate.
- Never poll or eagerly fetch every Activity Feed row's detail on page load.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Stock hint after focus regain | User backgrounds the DSR tab after a Purchase lands, returns to it | `useStock` refetches on window focus; Material picker shows updated quantity | Fetch failure keeps prior snapshot, does not crash |
| DSR "Other activity" excludes own rows | DSR has 2 Consumptions + 1 RMC; Site also has an unrelated Purchase same day | Section shows only the Purchase, not the DSR's own Consumption/RMC | Empty section renders nothing (no error) when there's no other activity |
| Waste Material DSR entry, rate omitted | Supervisor logs a HIRED trip with no `ratePerTrip` | `totalAmount`/`paymentStatus` stored null — "Pricing pending", never ₹0 | N/A |
| Waste Material DSR correction | A submitted DSR's Waste Material row is corrected via DSR correction flow | New `WasteDisposal` row created with `correctsId` = original row's id, `reason` set; `WasteDisposalService.summary()` reflects only the restated amount | Missing match (no prior row with that `clientGeneratedId`) is treated as a fresh row, not an error |
| Subcontractor entry, no contract picked | Entry has `workNote` only, no `siteContractId`/`quantity` | Stored as JSON exactly as today; no `SubcontractorWorkEntry` created | N/A |
| Subcontractor entry, contract + quantity picked | Entry has `siteContractId` (ACTIVE, non-FIXED_COST) + `quantity` | Real `SubcontractorWorkEntry` created; `SiteContract.quantityCompleted`/`amountPaid` incremented in the same transaction | Deleted/inactive/FIXED_COST contract at submit time → whole DSR create/finalize fails with the same `BadRequestException` shape `WorkEntriesService.create()` already uses |
| Historical DSR render | A pre-existing DSR's `subcontractorEntries` JSON lacks `siteContractId`/`quantity` | Renders identically to before this change | N/A |
| Activity Feed row click | User clicks a `PURCHASE` row on Site Details | Panel opens, fetches `GET /purchases/:id`, renders full fields + "View Full Details" link | 404/network failure shows retry state, matching `VendorDetailPanelContent`'s pattern |
| Activity Feed row click, no natural detail page | User clicks a `WORK_RECORD`/`MACHINERY_MOVEMENT`/`VEHICLE_MOVEMENT`/`WORK_ENTRY`/`SUBCONTRACTOR_PAYMENT` row | Panel opens, fetches the new `GET :id`, renders fields, no "View Full Details" link shown | Same 404/error handling as above |

</frozen-after-approval>

## Code Map

**Goal 1 — stock staleness:**
- `apps/web/lib/use-site-stock.ts` — `useStock`'s fetch effect (lines ~48-66) is keyed only on `siteId`; add a `window` `focus` listener that bumps a nonce in the effect's dependency array. Single-file fix; all 6 consumers (`dsr/new/page.tsx`, `dsr-desktop-form.tsx`, `consumption-form.tsx`, `purchase-form.tsx`, `return-wastage-form.tsx`, `movement-form.tsx`) benefit automatically.

**Goal 2 — DSR "other activity" rollup:**
- `apps/api/src/sites/site-activity-feed.ts` — `getSiteActivityFeed(prisma, siteId, range)`, reuse as-is, called with `{ from: reportDate, to: reportDate }`.
- `apps/api/src/dsr/dsr.service.ts` — `findOne()`: after loading the DSR with its nested `workRecords`/`consumptions`/`rmcEntries`/`expenses`/`wasteDisposalEntries`(new)/`subcontractorWorkEntries`(new), call `getSiteActivityFeed` for that Site+date, then filter out feed items whose `${type}:${id}` matches one of those nested rows' own `{type, id}`, and exclude `{type: 'DSR', id: dsr.id}` itself. Return as `otherActivity: FeedItem[]` alongside the existing shape.
- `packages/shared/src/types/activity-feed.ts` — `FeedItemType` union (`DSR`, `PURCHASE`, `MOVEMENT`, `CONSUMPTION`, `RETURN_WASTAGE`, `WORK_RECORD`, `EXPENSE`, `RMC`, `MACHINERY_MOVEMENT`, `VEHICLE_MOVEMENT`, `WASTE_DISPOSAL`, `SITE_CONTRACT`, `WORK_ENTRY`, `SUBCONTRACTOR_PAYMENT`) — the exact strings to match on.
- `apps/web/app/(app)/daily-activity/[id]/page.tsx` — add a new read-only "Other activity at this Site on this date" list section rendering `otherActivity`, styled consistent with the page's existing sections; no click-through in this section (Goal 5's panel is Site-Details-page-only per the user's ask).

**Goal 3 — real Waste Material DSR entries:**
- `infra/prisma/schema.prisma` — `WasteDisposal` model (currently lines ~845-886): add `dailySiteReportId String?` + `dailySiteReport DailySiteReport? @relation(fields: [dailySiteReportId], references: [id])` + `clientGeneratedId String? @unique`, mirroring `RmcEntry`'s exact two-plus-one field addition (lines ~638-667). Add the reverse relation array on `DailySiteReport` and `Site` as needed to match existing per-type conventions (see `rmcEntries RmcEntry[]` on `DailySiteReport` for the pattern).
- Migration — hand-write `migration.sql` for only this addition (AGENTS.md's documented `pg_trgm`/GIN-index drift danger: any `prisma migrate dev` run after this must be checked for a spurious second auto-generated migration dropping unrelated indexes); apply via `pnpm db:migrate:deploy`.
- `packages/shared/src/schemas/daily-site-report.ts` — new `dsrWasteDisposalEntrySchema`, reusing `createWasteDisposalSchema`'s (`packages/shared/src/schemas/waste-disposal.ts`) OWN/HIRED branching and three-way vendor/machinery/vehicle-or-text `.superRefine`, minus `siteId`/`disposedAt`/`recordedByUserId`/`correctsId`/`reason`/the `advance` sub-object, plus `clientGeneratedId`. Add `wasteDisposalEntries: z.array(dsrWasteDisposalEntrySchema).default([])` to `createDsrSchema`.
- `apps/api/src/dsr/dsr.service.ts` — `materializeSubRecords`: new loop mirroring the RMC loop (lines ~223-249) — server-computed `totalAmount` via `Prisma.Decimal` (matching `WasteDisposalService.create()`'s exact computation, `apps/api/src/waste-disposal/waste-disposal.service.ts:110-115` — `tripCount.mul(ratePerTrip).add(otherCharges)`, null when `ratePerTrip` is undefined), `dailySiteReportId: dsrId`, `disposedAt: reportDate`, `recordedByUserId` set to the DSR's acting user, upsert-by-`clientGeneratedId` like RMC. `correct()`: mirror RMC's correction loop (lines ~910-925) BUT additionally resolve the prior row via `clientGeneratedId` (against the superseded DSR's own `wasteDisposalEntries`) and set `correctsId`/`reason` on the new row — RMC's own loop does *not* do this and is deliberately not copied verbatim here, because `WasteDisposalService.summary()`/`withSettlement()` depend on `correctsId` chains for correct aggregation (RMC's summary logic does not have this dependency, which is why the gap there is currently harmless).
- Mobile (`apps/web/app/(app)/dsr/new/page.tsx`) and desktop (`apps/web/app/(app)/daily-activity/_components/dsr-desktop-form.tsx`) forms — new repeatable-row "Waste Material" section, structurally mirroring the RMC section (`RmcRow` state array, `clientGeneratedId` per row, add/remove buttons) but with the OWN/HIRED-branching field set from `waste-disposal-form.tsx` (lines ~251-320) minus the advance sub-flow.

**Goal 4 — real Subcontractor work entries:**
- `apps/api/src/subcontractors/work-entries.service.ts` — `create()` (full validation: contract exists, not soft-deleted, `status===ACTIVE`, `rateType!==FIXED_COST`, correction-match validation) + `apps/api/src/subcontractors/quantity-completed.ts`'s `applyQuantityDelta()` (already `tx`-parameterized) — extract the validation-plus-`applyQuantityDelta` body into a new exported, `tx`-accepting function (e.g. `apps/api/src/subcontractors/work-entry-write.ts`), called by both `WorkEntriesService.create()` (opening its own `$transaction`) and `dsr.service.ts` (passing its already-open `tx`).
- `apps/api/src/dsr/dsr.module.ts` — import whatever module now exports the extracted helper (currently `WasteDisposalModule`-equivalent for subcontractors is `SubcontractorsModule`/`WorkEntriesModule` — confirm exact module name at implementation time).
- `packages/shared/src/schemas/daily-site-report.ts` — `dsrSubcontractorEntrySchema` gains **optional** `siteContractId: z.string().optional()` and `quantity: z.number().positive().optional()`, alongside the existing `subcontractorId`/`workNote`/`clientGeneratedId` (all unchanged, so historical JSON keeps validating and rendering as-is).
- `apps/api/src/dsr/dsr.service.ts` — `materializeSubRecords`/`correct()`: for each subcontractor entry, if both `siteContractId` and `quantity` are present, call the new helper to create a real `SubcontractorWorkEntry` (correction path resolves the prior entry via `clientGeneratedId` the same way as Goal 3); the JSON write to `DailySiteReport.subcontractorEntries` happens exactly as it does today regardless.
- `apps/api/src/subcontractors/site-contracts.controller.ts` — `GET /site-contracts?siteId=&status=ACTIVE` already exists; reuse directly for the DSR form's contract picker, no new endpoint.
- DSR forms — extend the existing Subcontractor section with an optional contract picker (searchable combobox scoped to the selected Site's ACTIVE contracts) + quantity field, left blank/unselected by default so existing informational-only usage is unaffected.

**Goal 5 — Activity Feed detail panel:**
- `apps/web/app/(app)/sites/[id]/page.tsx` — extract the Activity Feed `DataTable` (lines ~511-525, plus `feedColumns`/`feedMobileCard`, lines ~173-203) into a new client component, e.g. `apps/web/app/(app)/sites/[id]/_components/site-activity-feed-client.tsx`, taking `feed: FeedItem[]` as its only data prop — mirroring `apps/web/app/(app)/vendors/vendors-list-client.tsx`'s split from its server-component parent exactly.
- New client component wires `onRowClick={(item) => panel.open(\`${item.type}:${item.id}\`)}` (`useDetailPanelState("feedItem")`), a `useFeedItemDetail(compoundId)` hook (mirrors `useVendorDetail`, `vendors-list-client.tsx` lines ~90-116) that splits `type:id`, maps `type` to the right endpoint path, and fetches via `useAuthedFetch`. `packages/ui`'s `DetailPanel` + `isPlainLeftClick` reused as-is.
- Panel content: per-type field rendering (label/value pairs) covering the fields each source table has beyond `FeedItem`'s 5 (see `site-activity-feed.ts`'s per-type `include`/summary construction for the field lists). "View Full Details" link only for types with a confirmed existing target:
  - `PURCHASE` → `/movements/purchases/[id]/correct`
  - `CONSUMPTION` → `/movements/consumption/[id]/correct`
  - `RETURN_WASTAGE` → `/movements/return-wastage/[id]/correct`
  - `EXPENSE` → `/expenses/[id]/correct`
  - `RMC` → `/rmc/[id]/correct`
  - `WASTE_DISPOSAL` → `/waste-disposal/[id]/correct`
  - `SITE_CONTRACT` → `/sites/[id]/contracts/[contractId]` (confirmed existing detail page, not a correct form)
  - `DSR` → `/daily-activity/[id]` (plain detail view, not `/correct`)
  - `MOVEMENT` → **no confirmed single route** (only `godown-to-site/[id]/correct` exists among the 3 Movement subtypes; `site-to-site`/`vendor-to-site` have no `[id]/correct` folder) — omit the link per the Ask-First boundary above unless implementation confirms otherwise.
  - `WORK_RECORD`, `MACHINERY_MOVEMENT`, `VEHICLE_MOVEMENT`, `WORK_ENTRY`, `SUBCONTRACTOR_PAYMENT` → no link (no natural target page exists).
- New endpoints, mirroring the existing 6-no-guard/1-open-override pattern exactly:
  - `apps/api/src/team/work-records.service.ts` + `.controller.ts` — add `findOne(id)` (`include: { teamMember: true, site: true }`) + `@Get(':id')`, declared **after** the existing `@Get('default-crew')` route.
  - `apps/api/src/assets/asset-movements.service.ts` + `.controller.ts` — add `findOne(assetType, id)` branching like `list()` does, `include: { site: true }`; `@Get(':id')` with `assetType` as a required query param.
  - `apps/api/src/subcontractors/work-entries.service.ts` + `.controller.ts` — add `findOne(id)` (`include: { siteContract: { include: { subcontractor: true, site: true } } }`, matching `searchCandidates`'s include shape) + `@Get(':id')`.
  - `apps/api/src/subcontractors/subcontractor-payments.service.ts` + `.controller.ts` — add `findOne(id)` (same include pattern) + `@Get(':id')` with an explicit `@Roles()` override (this controller is class-level `@Roles('OWNER_ADMIN')`; mirror `SiteContractsController.findOne`'s override so a Supervisor viewing the Site feed isn't blocked).

## Tasks & Acceptance

**Execution:**
- [x] `apps/web/lib/use-site-stock.ts` -- add focus-triggered refetch nonce -- fixes Goal 1 root cause at its one shared source
- [x] `apps/web/lib/use-site-stock.test.ts` -- add a test that a mounted hook refetches on a simulated window focus event -- closes the confirmed test gap
- [x] `apps/api/src/sites/site-activity-feed.ts`, `apps/api/src/dsr/dsr.service.ts` (`findOne`) -- add filtered `otherActivity` -- Goal 2
- [x] `apps/web/app/(app)/daily-activity/[id]/page.tsx` -- render "Other activity" section -- Goal 2
- [x] `infra/prisma/schema.prisma`, hand-written migration -- add `WasteDisposal.dailySiteReportId`/`clientGeneratedId` -- Goal 3 schema
- [x] `packages/shared/src/schemas/daily-site-report.ts` -- `dsrWasteDisposalEntrySchema` + wire into `createDsrSchema` -- Goal 3
- [x] `apps/api/src/dsr/dsr.service.ts` (`materializeSubRecords`, `correct()`) -- Waste Material loops with correctsId-chain-correct corrections -- Goal 3
- [x] `apps/web/app/(app)/dsr/new/page.tsx`, `apps/web/app/(app)/daily-activity/_components/dsr-desktop-form.tsx` -- Waste Material repeatable section -- Goal 3
- [x] `apps/api/src/subcontractors/work-entry-write.ts` (new) -- extract tx-safe validation+increment helper -- Goal 4, avoids duplicating `WorkEntriesService.create()`'s logic
- [x] `apps/api/src/subcontractors/work-entries.service.ts` -- use the extracted helper -- Goal 4, no behavior change to standalone path
- [x] `packages/shared/src/schemas/daily-site-report.ts` -- optional `siteContractId`/`quantity` on `dsrSubcontractorEntrySchema` -- Goal 4, backward-compatible
- [x] `apps/api/src/dsr/dsr.service.ts` (`materializeSubRecords`, `correct()`) -- conditional real `SubcontractorWorkEntry` creation -- Goal 4
- [x] DSR forms -- optional Site Contract + quantity fields on the Subcontractor section -- Goal 4
- [x] `apps/web/app/(app)/sites/[id]/_components/site-activity-feed-client.tsx` (new) -- extracted client component with `DetailPanel`/`onRowClick` -- Goal 5
- [x] `apps/web/app/(app)/sites/[id]/page.tsx` -- render the extracted client component in place of the current inline `DataTable` -- Goal 5
- [x] 5 new `findOne`/`GET :id` pairs across `work-records`, `asset-movements`, `work-entries`, `subcontractor-payments` -- Goal 5
- [x] Integration/unit tests for every new endpoint, the Waste Material materialize/correct loops (mirroring `dsr.service.integration.spec.ts`'s existing RMC test set, including the "aggregates skip the superseded report's sub-rows" correction test), and the conditional Subcontractor ledger write -- required per this codebase's existing coverage bar

**Acceptance Criteria:**
- Given a Site with a positive `SiteStock` row, when a DSR form regains window focus, then the Material picker's stock hint reflects the current quantity without a page reload.
- Given a submitted DSR and a same-day Purchase recorded via standalone Inventory, when viewing the DSR's detail page, then the Purchase appears under "Other activity" and the DSR's own Consumption/RMC/Expense/Waste Material/Work Entry rows do not appear twice.
- Given a DSR Waste Material entry with no rate, when saved, then `totalAmount`/`paymentStatus` are null and the standalone Waste Material list still shows it as "Pricing pending."
- Given a DSR correction that changes a Waste Material entry's trip count, when the correction is submitted, then `WasteDisposalService.summary()` for that Vendor reflects only the corrected total, not both the original and corrected amounts.
- Given a DSR Subcontractor entry with a picked Active, non-fixed-cost Site Contract and a quantity, when the DSR is created, then a `SubcontractorWorkEntry` exists and `SiteContract.quantityCompleted` has incremented by exactly that quantity.
- Given a historical DSR whose `subcontractorEntries` JSON has no `siteContractId`, when viewed, then it renders exactly as it did before this change.
- Given any Activity Feed row on Site Details, when clicked, then a panel opens and shows that record's full fields via one on-demand API call, with no other rows' detail pre-fetched.

## Design Notes

**Why focus-refetch, not per-consumer refetch:** the alternative (call `refresh()` after every Consumption-row add) needs per-form wiring in 2 files and still misses staleness caused by actions taken in *other* tabs/sessions. A focus listener inside `useStock` itself fixes all 6 consumers uniformly with one file changed, matching "fix the root cause, don't over-engineer."

**Why `subcontractorEntries`/`siteContractId` is additive, not a schema migration:** `DailySiteReport.subcontractorEntries` is a JSON column with no schema versioning. Changing the required shape would silently break every historical DSR's render (the exact regression the user explicitly ruled out). Making the new fields optional means old rows (`{subcontractorId, workNote, clientGeneratedId}`) keep validating and rendering; only newly-submitted entries that opt into the picker create a real ledger row.

**Why Waste Material's DSR-correction loop diverges from RMC's:** RMC's DSR-correction loop creates a fresh `RmcEntry` with no `correctsId` because nothing downstream sums RMC amounts via a `correctsId` chain — the DSR-level correction chain alone is sufficient there. `WasteDisposalService.summary()`/`withSettlement()` (used by the standalone Waste Material list and the Vendor page's Advance/Pending columns) *do* sum via `correctsId` chains. Copying RMC's loop verbatim would make a DSR-corrected Waste Material entry silently double-count in those existing screens — this is exactly the kind of regression the user asked to avoid, so the Waste Material loop must set `correctsId`/`reason`, RMC's loop must not be touched, and the two are intentionally NOT symmetric.

## Verification

**Commands:**
- `pnpm --filter @azentisfieldos/api test` -- expected: all existing + new DSR/Waste Material/Work Entry/endpoint tests pass, including the RMC-pattern correction tests re-run against Waste Material
- `pnpm --filter @azentisfieldos/web test` -- expected: existing DSR form/Site Details/Vendor-pattern tests pass; new focus-refetch and detail-panel tests pass
- `pnpm typecheck` -- expected: no errors, especially around the extended `dsrSubcontractorEntrySchema` and new Prisma fields
- `pnpm db:migrate:deploy` against a scratch DB -- expected: the hand-written `WasteDisposal` migration applies cleanly with no unrelated index drops

**Manual checks (if no CLI):**
- In the deployed preview: open a DSR draft, background the tab, record a Purchase for that Site elsewhere, return to the tab, confirm the stock hint updates without reload.
- Submit a DSR with a Waste Material entry and a linked Subcontractor entry, then confirm both the Vendor page's settlement figures and the Site Contract's `quantityCompleted` reflect it correctly.

## Suggested Review Order

**Correction-chain math (the highest-risk part of this change — caught and fixed by adversarial review, not the original implementation)**

- Entry point: resolves a Waste Material entry's true cumulative state by walking its correction chain forward from the root, not just one hop back — the bug that corrupted second-and-later corrections.
  [`dsr.service.ts:111`](../../apps/api/src/dsr/dsr.service.ts#L111)

- Same fix for Subcontractor Work Entry's `quantity` — `SiteContract.quantityCompleted` is the same class of materialized-running-total bug.
  [`dsr.service.ts:178`](../../apps/api/src/dsr/dsr.service.ts#L178)

- Delta computed as `(new absolute total) − (old absolute total)`, not `tripCountDelta × newRate` — the formula that silently zeroed a rate-only correction.
  [`dsr.service.ts:1284`](../../apps/api/src/dsr/dsr.service.ts#L1284)

- Walks every `correctsId` ancestor (not just the current tip) so a corrected DSR's own pre-correction row can't leak into "Other activity" as if it were someone else's.
  [`dsr.service.ts:239`](../../apps/api/src/dsr/dsr.service.ts#L239)

- Server-side guard: a correction that drops an already-materialized entry now rejects with a clear error instead of silently orphaning its ledger contribution.
  [`dsr.service.ts:1272`](../../apps/api/src/dsr/dsr.service.ts#L1272)

**Waste Material DSR entry (goal 3)**

- Conditional branching schema mirroring `createWasteDisposalSchema`'s OWN/HIRED split, minus the advance sub-flow.
  [`daily-site-report.ts:138`](../../packages/shared/src/schemas/daily-site-report.ts#L138)

- Materialize loop — server-computed total, upsert-by-`clientGeneratedId`, same shape as the RMC loop it mirrors.
  [`dsr.service.ts:446`](../../apps/api/src/dsr/dsr.service.ts#L446)

- New nullable FK + idempotency key, hand-written to avoid the documented pg_trgm/GIN migration-drift trap.
  [`migration.sql`](../../infra/prisma/migrations/20260920140000_dsr_waste_and_subcontractor_link/migration.sql#L1)

**Subcontractor Work Entry via DSR (goal 4)**

- Validation-plus-`applyQuantityDelta` extracted into a `tx`-accepting helper, shared by the standalone path and the DSR path — avoids duplicating Active/non-Fixed-Cost/correction-match rules.
  [`work-entry-write.ts:38`](../../apps/api/src/subcontractors/work-entry-write.ts#L38)

- `siteContractId`/`quantity` are additive optional fields on the existing JSON entry — historical DSRs with neither field keep rendering exactly as before.
  [`daily-site-report.ts:120`](../../packages/shared/src/schemas/daily-site-report.ts#L120)

**DSR "Other activity" rollup (goal 2)**

- Reuses `getSiteActivityFeed` as-is, filtered by an ownership-exclusion set built from this DSR's own materialized rows plus their correction ancestors.
  [`dsr.service.ts:1682`](../../apps/api/src/dsr/dsr.service.ts#L1682)

**Stock staleness fix (goal 1)**

- Refetches on both `focus` and `visibilitychange` — one shared-hook fix benefits all 6 consumers instead of patching each form.
  [`use-site-stock.ts:55`](../../apps/web/lib/use-site-stock.ts#L55)

**Site Activity Feed detail panel (goal 5)**

- Extracted client component — `onRowClick` opens a `DetailPanel`, fetching full detail lazily per click via a `type:id` compound URL param.
  [`site-activity-feed-client.tsx:410`](../../apps/web/app/(app)/sites/[id]/_components/site-activity-feed-client.tsx#L410)

- New `findOne`/`GET :id` endpoints mirroring the existing 9-endpoint shape, for the 5 types that had no single-record read before.
  [`work-records.controller.ts:55`](../../apps/api/src/team/work-records.controller.ts#L55),
  [`asset-movements.controller.ts:50`](../../apps/api/src/assets/asset-movements.controller.ts#L50),
  [`work-entries.controller.ts:45`](../../apps/api/src/subcontractors/work-entries.controller.ts#L45),
  [`subcontractor-payments.controller.ts:51`](../../apps/api/src/subcontractors/subcontractor-payments.controller.ts#L51)

**Peripherals**

- Schema addition backing goals 3–4.
  [`schema.prisma`](../../infra/prisma/schema.prisma#L1)

- Integration coverage for the correction-chain fixes above, including the repeat-correction and rate-only-change regression tests.
  [`dsr.service.integration.spec.ts:1590`](../../apps/api/src/dsr/dsr.service.integration.spec.ts#L1590)
