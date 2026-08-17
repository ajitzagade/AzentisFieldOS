---
baseline_commit: 4f33962f5ba714deb608278e32224cdb9e049d6f
---

# Story 8.2: Record Movement Between Sites/Maintenance

Status: in-review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As Owner/Admin,
I want to record a Machine or Vehicle's movement — Available → Site A → Site B → Maintenance → Available — with full history retained,
so that I always know where an asset is now and where it's been.

## Acceptance Criteria

1. **Given** a Machine/Vehicle's current recorded location, **when** I record a movement to a new Site or to Maintenance, **then** its "current Site"/status updates immediately. (FR-17, FR-38)
2. Every prior movement remains visible in that asset's history — never overwritten to show only the latest state. (FR-17)
3. "Current Site" is a manually recorded value — no GPS or live tracking is implied anywhere in the UI copy or design. (Epic Implementation Notes)
4. The row's "Correct" action is available on a movement entry, never Edit/Delete. (AD-9, FR-54)

## Tasks / Subtasks

- [x] Task 1 — Shared Zod schema (AC: #1, #3, #4)
  - [x] Create `packages/shared/src/schemas/asset-movement.ts`, shared by both Machinery and Vehicle (identical shape, only the target model differs — one schema, not two near-duplicates): `assetType` (`z.enum(["MACHINERY", "VEHICLE"])`), `assetId` (`z.uuid()`), `toStatus` (`z.enum(["AVAILABLE", "AT_SITE", "MAINTENANCE"])`), `siteId` (`z.uuid().optional()`), `movedAt` (`z.coerce.date()`), `correctsId`/`reason` (Epic 5's correction rule).
  - [x] `.superRefine()`: `siteId` required when `toStatus === "AT_SITE"`, forbidden otherwise (mirrors Epic 5 Story 5.1's `destination`/`siteId` cross-field rule exactly).
  - [x] Export from `packages/shared/src/index.ts`.
- [x] Task 2 — `apps/api` (AC: #1, #2, #4)
  - [x] `apps/api/src/assets/asset-movements.controller.ts` + `.service.ts`, added to `AssetsModule` (Story 8.1). `POST /asset-movements`, `GET /asset-movements?assetType=&assetId=`.
  - [x] `AssetMovementsService.create` runs inside `prisma.$transaction`: insert the appropriate log row (`tx.machineryMovementLog.create` or `tx.vehicleMovementLog.create`, branching on `assetType`), then update the parent asset's materialized current-state fields in the same transaction: `tx.machinery.update({ where: { id: assetId }, data: { currentStatus: toStatus, currentSiteId: toStatus === 'AT_SITE' ? siteId : null } })` (or the `vehicle` equivalent). This mirrors Epic 5's `GodownStock`/`SiteStock` materialization exactly, just for a status+location pair instead of a quantity.
  - [x] A correcting movement (`correctsId` set) still updates `currentStatus`/`currentSiteId` to its own `toStatus`/`siteId` — a correction here means "the current recorded location was wrong, here's the actual one," which is naturally a full restatement (not a delta, unlike Purchase/Advance's numeric quantities) — see Dev Notes "Why this correction is a restatement, not a delta."
  - [x] `GET /asset-movements` orders `desc` by `movedAt` for the asset detail page's history section.
- [x] Task 3 — `apps/web` UI (AC: #1, #2, #3, #4)
  - [x] `apps/web/app/(app)/machinery-vehicles/machinery/[id]/move/page.tsx` and `.../vehicles/[id]/move/page.tsx` — movement entry form: destination toggle (Site / Maintenance / Available), Site picker shown only for the Site option, date.
  - [x] Extend the asset detail pages (Story 8.1's shell) with a "Movement History" section: reverse-chronological list/table, each entry showing `toStatus`/`siteId` and a `CorrectAction`, matching `11-machinery-vehicles.html`'s timeline treatment (`"Moved to X — Current"` badge on the latest entry). Copy anywhere referencing current location must read as a manually-recorded fact ("Recorded at NH-48 Highway Widening"), never phrasing that implies live tracking ("Live location," a map pin that updates itself, etc.) — AC #3.
  - [x] Wire the register list page's (Story 8.1) row-level status/location display and its `CorrectAction` icon to this story's correction route, resolving the affordance Story 8.1's Dev Notes flagged as deferred.
  - [x] Correction route (`/machinery-vehicles/machinery/[id]/movements/[movementId]/correct`, and the Vehicle equivalent) following the established pattern.
- [x] Task 4 — Tests (AC: all)
  - [x] Zod tests for the `toStatus`/`siteId` cross-field rule.
  - [x] `asset-movements.service.spec.ts`: creating a movement updates the parent `Machinery`/`Vehicle`'s `currentStatus`/`currentSiteId` inside the same transaction as the log insert; a `MAINTENANCE` or `AVAILABLE` movement clears `currentSiteId` to `null`.

## Dev Notes

**Why this correction is a restatement, not a delta.** Epic 5 Story 5.1 established that a correcting row's quantity is a *signed delta* for numeric ledgers (Purchase, Movement, Consumption). A location/status correction has no numeric quantity to offset — "the asset was actually moved to Site B, not Site A" isn't expressible as a delta of anything. The natural, unambiguous correction here is a brand-new movement log row with `correctsId` set, whose `toStatus`/`siteId` simply *is* the corrected value, exactly as if it were a fresh, ordinary movement entry — and because Task 2 always re-derives `currentStatus`/`currentSiteId` from whatever row was just inserted (correction or not), this falls out with no special-case branch. Document this divergence from the delta pattern inline in the schema, same as Epic 7 Story 7.3 had to document why Payment corrections don't use a delta either — this project now has two established correction shapes (delta, for single-quantity ledgers; full restatement, for state/location records), not one universal rule, and future stories should pick the one that matches their own data shape rather than forcing a delta onto something that isn't a quantity.

**Depends on Story 8.1** for `AssetsModule`, `Machinery`/`Vehicle`, and the asset detail page shell this story extends.

**Architecture constraints in force:** AD-3, AD-4, AD-5, AD-6, AD-7, AD-9, FR-54.

### Project Structure Notes

- New `asset-movements.controller.ts`/`.service.ts` in `apps/api/src/assets/` (Story 8.1).
- Extends the Machinery/Vehicle detail pages from Story 8.1.

### References

- [Source: _bmad-output/specs/spec-AzentisFieldOS/functional-requirements.md#CAP-4] (FR-17, FR-38)
- [Source: _bmad-output/planning-artifacts/epics/phase-5-assets-suppliers/epic-8-machinery-vehicle-management.md — "no GPS/live tracking" note]
- [Source: _bmad-output/planning-artifacts/stories/phase-5-assets-suppliers/epic-8-machinery-vehicle-management/story-8.2-movement-history.md]
- [Source: infra/prisma/schema.prisma#MachineryMovementLog, VehicleMovementLog]
- [Source: _bmad-output/implementation-artifacts/8-1-manage-machinery-vehicle-registers.md — AssetsModule and the deferred Correct-icon wiring this story resolves]
- [Source: _bmad-output/implementation-artifacts/5-2-record-godown-site-movement.md — the materialized-current-state-in-same-transaction pattern this story reuses]
- [Source: _bmad-output/implementation-artifacts/7-3-record-a-payment.md — the prior precedent for a non-delta ("full restatement") correction shape]
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/11-machinery-vehicles.html — movement timeline treatment]

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (claude-sonnet-5)

### Debug Log References

### Completion Notes List

- `MachineryMovementLog`/`VehicleMovementLog` had no `correctsId`/`reason` columns yet (Story 8.1 only built the master-data side) — added the same plain `correctsId`/`reason` pair used elsewhere in the schema (Purchase/Movement/Consumption convention), plus a hand-authored migration scoped to only those two tables. Verified against a scratch local Postgres database: applied all 10 pre-existing baseline migrations, applied the new one, confirmed the resulting columns via `\d`, ran `pnpm db:seed` successfully, then dropped the scratch database. Deliberately did not fold in the unrelated `Advance`/`AdvanceAdjustment`/`Payment`/`TeamMember`/`Vendor` schema drift already sitting uncommitted in the tree from other in-flight epics — same precedent Story 8.1 set for out-of-scope cross-epic drift.
- `AssetMovementsService.create` runs the log insert and the parent `Machinery`/`Vehicle` update inside one `prisma.$transaction`, branching on `assetType` (Prisma's generated client has no shared type across `machineryMovementLog`/`vehicleMovementLog`, so the branch is explicit rather than a generic helper — same style as the existing `decrementStockWithFloorCheck`'s model-name ternary). `currentStatus`/`currentSiteId` are always re-derived from the row that was just inserted, correction or not, so the "restatement, not delta" correction shape falls out with no special-case branch, exactly as the Dev Notes predicted.
- `GET /asset-movements` takes `assetType`/`assetId` as required query params (validated in the controller via `assetTypeSchema`, not a full Zod body pipe since there's no request body on a GET).
- Extended `MachineryService.list()`/`VehicleService.list()` (Story 8.1 files) to also `include` the single latest `movementLogs` entry — needed so the register list's row-level Correct icon can link straight to that entry's correction route without an N+1 fetch per row, and so a freshly-registered asset with zero Movement history renders no Correct icon (nothing to correct) rather than a broken link. Updated the two existing `list()` spec assertions to match the wider `include`.
- Reworked the register list page's row rendering: removed `DataTable`'s `rowHref` (which wraps every cell, including the new actions column, in an anchor — nesting the Correct action's own link/button inside it) in favor of an explicit trailing actions column with a `CorrectAction` + a chevron link to the detail page, mirroring `/payments`'s existing pattern. Added an `aria-label` to the chevron link (the existing `/payments` precedent omits one) so the row still has an accessible, name-addressable link to its detail page.
- Built one shared `AssetMovementForm`/`createAssetMovementAction` pair (AD-5/AD-7) used by both the Machinery and Vehicle "Record Movement" and "Correct Movement" routes — only `assetType`/`basePath` differ per call site. Correction mode leaves `toStatus`/`siteId`/`movedAt` fully editable (unlike Purchase/Movement's correction forms, which lock the identity fields and only let the quantity delta vary) — there's no quantity here, the whole point of the correction is restating the correct destination, so only `assetType`/`assetId` are fixed (hidden).
- All UI copy was written to read as manually recorded fact — "Recorded at X" on the timeline, "Manually recorded — not live GPS tracking." on the entry form — reusing the list page's pre-existing subhead copy rather than introducing new phrasing.
- Final verification: `apps/api` (404 passing / 51 skipped, 49 files) and `apps/web` (402 passing, 105 files) both green; both packages typecheck clean; `apps/web` builds all 8 new routes successfully; `apps/api`'s `src/assets/**` and all of `apps/web` lint clean in isolation. `apps/api`'s root `pnpm lint`/`pnpm typecheck` show pre-existing, unrelated failures in `purchases.service.spec.ts`/`payments.service.spec.ts` (Epic 5/7, already-tracked) and `vendors.controller.spec.ts` (an unrelated in-flight Epic 9 change already uncommitted in the tree before this story started) — none touched by or related to this story's diff.

### File List

- `infra/prisma/schema.prisma` (modified — `correctsId`/`reason` added to `MachineryMovementLog`/`VehicleMovementLog`)
- `infra/prisma/migrations/20260817080000_add_asset_movement_correction_fields/migration.sql` (new)
- `packages/shared/src/schemas/asset-movement.ts` (new)
- `packages/shared/src/index.ts` (modified — export)
- `apps/api/src/assets/asset-movements.service.ts`, `.controller.ts` + `.service.spec.ts`/`.controller.spec.ts` (new)
- `apps/api/src/assets/assets.module.ts` (modified — registered `AssetMovementsController`/`AssetMovementsService`)
- `apps/api/src/assets/machinery.service.ts`, `vehicle.service.ts` (modified — `list()` now includes the latest `movementLogs` entry)
- `apps/api/src/assets/machinery.service.spec.ts`, `vehicle.service.spec.ts` (modified — updated `list()` include assertion)
- `apps/web/app/(app)/machinery-vehicles/asset-movement-form.tsx` + `.test.tsx` (new)
- `apps/web/app/(app)/machinery-vehicles/actions.ts` + `.test.ts` (new)
- `apps/web/app/(app)/machinery-vehicles/movement-timeline.tsx` (new)
- `apps/web/app/(app)/machinery-vehicles/machinery/[id]/move/page.tsx` + `.test.tsx` (new)
- `apps/web/app/(app)/machinery-vehicles/vehicles/[id]/move/page.tsx` + `.test.tsx` (new)
- `apps/web/app/(app)/machinery-vehicles/machinery/[id]/movements/[movementId]/correct/page.tsx` + `.test.tsx` (new)
- `apps/web/app/(app)/machinery-vehicles/vehicles/[id]/movements/[movementId]/correct/page.tsx` + `.test.tsx` (new)
- `apps/web/app/(app)/machinery-vehicles/machinery/[id]/page.tsx` + `.test.tsx` (modified — Movement History section, Record Movement button)
- `apps/web/app/(app)/machinery-vehicles/vehicles/[id]/page.tsx` + `.test.tsx` (modified — same)
- `apps/web/app/(app)/machinery-vehicles/page.tsx` + `.test.tsx` (modified — row-level Correct action wired, `rowHref` replaced with an explicit actions column)
