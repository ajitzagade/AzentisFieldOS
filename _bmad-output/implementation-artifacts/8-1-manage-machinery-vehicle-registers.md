---
baseline_commit: 6b8f5ba921338e94d38436ffe3a232c99f1d2083
---

# Story 8.1: Manage Machinery & Vehicle Registers

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As Owner/Admin,
I want to register Machinery (name, type, asset number, model, ownership, operator) and Vehicles (number, type, ownership, driver),
so that I have one accurate list of every asset the business uses.

## Acceptance Criteria

1. **Given** I register a Machine or Vehicle, **when** I save, **then** it's immediately available in movement, fuel/maintenance log, and reporting pickers. (FR-15, FR-16)
2. Machinery/Vehicle type categories are admin-configurable data, not a hardcoded enum — Epic 14 later adds the admin UI to manage them; this story only needs the underlying data to already be configurable. (NFR-4)
3. A Machine/Vehicle's `name`/`number`, `type`, `model`, `ownership`, `operator`/`driver` are edited via a normal Edit affordance, never `CorrectAction` — this is master data (same as Material, Epic 4; Team Member, Epic 6), not transaction history. Only the asset's **current location/status** (built in Story 8.2, derived from its movement log) uses the Correct pattern — see Dev Notes "Two different affordances on what looks like one row."

## Tasks / Subtasks

- [x] Task 1 — Schema fix: `type` must be configurable data, not a free string (AC: #2)
  - [x] `infra/prisma/schema.prisma`'s `Machinery.type` and `Vehicle.type` are currently plain `String` columns — better than a hardcoded enum (the mistake Epic 6 caught and fixed for `EmploymentType`), but still not what NFR-4's "admin-configurable data" means in practice elsewhere in this schema: an unconstrained free-text field lets "Excavator"/"excavator"/"JCB Excavator" fragment the same real type across rows, which is exactly what `MaterialCategory`/`Unit` (Epic 4) and `EmploymentType` (Epic 6) were introduced to prevent. For consistency with those precedents, add `model MachineryType { id String @id @default(uuid(7)), name String @unique }` and `model VehicleType { id String @id @default(uuid(7)), name String @unique }` (two separate tables — Machinery and Vehicle types aren't the same domain concept, don't unify them into one shared table), and change `Machinery.type String` → `Machinery.typeId String` + `type MachineryType @relation(...)`, same for `Vehicle`.
  - [x] Seed a handful of common defaults (e.g. "Excavator," "Mixer," "Crane" for Machinery; "Truck," "Dumper," "Tempo" for Vehicle) so the registers aren't unusable on day one — same reasoning and same seeding approach Epic 6 Story 6.1 used for `EmploymentType`.
  - [x] Also add the missing `currentSite Machinery.currentSiteId → Site` and `Vehicle.currentSiteId → Site` `@relation` — both fields currently exist as plain `String?` columns with no Prisma relation, unlike every other `siteId` field in this schema (`Purchase.siteId`, `WorkRecord.siteId`, etc.), which is inconsistent with no stated reason (contrast `DailySiteReport.equipmentUsed`, which the schema explicitly comments as "deliberately not a relation" — no such comment exists here, so this reads as an oversight, not a decision). Adding the relation costs nothing and enables `include`-based queries instead of a manual second lookup.
  - [x] Run `pnpm db:generate`.
- [x] Task 2 — Shared Zod schemas (AC: #1, #2, #3)
  - [x] Create `packages/shared/src/schemas/machinery-type.ts` and `vehicle-type.ts`: `createMachineryTypeSchema`/`createVehicleTypeSchema` (`{ name: z.string().min(1).max(100) }`) — create+list only, same minimal scope Epic 6 gave `EmploymentType` (Epic 14 owns the full admin lifecycle).
  - [x] Create `packages/shared/src/schemas/machinery.ts`: `createMachinerySchema` (`name`, `typeId: z.uuid()`, `assetNumber: z.string().min(1).max(100)`, `model`/`ownership`/`operator` optional strings), `updateMachinerySchema` (partial, no `isActive`/status field on this model to worry about the default-on-partial trap for — `currentStatus`/`currentSiteId` are deliberately **not** editable via this schema, see Task 3).
  - [x] Create `packages/shared/src/schemas/vehicle.ts`: same shape with `number` instead of `name`+`assetNumber`, `driver` instead of `operator`.
  - [x] Export all four from `packages/shared/src/index.ts`.
- [x] Task 3 — `apps/api` (AC: #1, #2, #3)
  - [x] `apps/api/src/assets/machinery-types.controller.ts`/`.service.ts`, `vehicle-types.controller.ts`/`.service.ts`, `machinery.controller.ts`/`.service.ts`, `vehicle.controller.ts`/`.service.ts`, one `AssetsModule` housing all four (mirrors `MaterialsModule`'s shape from Epic 4: several related resources sharing one small module). Register in `app.module.ts`.
  - [x] `MachineryService.update`/`VehicleService.update` must not accept `currentStatus`/`currentSiteId` in their body even if a caller sends them — Task 2's Zod schema already excludes those fields, so a well-behaved client can't send them, but confirm the service also doesn't blindly spread an unvalidated object into `data` anywhere. Those two fields are exclusively written by Story 8.2's movement-recording transaction.
  - [x] `GET /machinery` / `GET /vehicles` include `type` and `currentSite` relations for display.
- [x] Task 4 — `apps/web` UI (AC: #1, #2, #3)
  - [x] Replace the stub `apps/web/app/(app)/machinery-vehicles/page.tsx` with the real register: two `DataTable`s (Machinery, Vehicles) under anchor sections, columns per `11-machinery-vehicles.html` (Machinery: Name/Type/Asset #/Current Site/Status; Vehicle: Number/Type/Driver/Current Site-Usage/Status), each row linking to a detail page (Task 4 continues below) rather than the row itself carrying the `CorrectAction` seen in the mockup — see Dev Notes for why that icon belongs to Story 8.2's detail-page movement history, not this list.
  - [x] `apps/web/app/(app)/machinery-vehicles/machinery/new/page.tsx` and `.../vehicles/new/page.tsx` — create forms.
  - [x] `apps/web/app/(app)/machinery-vehicles/machinery/[id]/edit/page.tsx` and `.../vehicles/[id]/edit/page.tsx` — edit forms for the master-data fields only (AC #3).
  - [x] `apps/web/app/(app)/machinery-vehicles/machinery/[id]/page.tsx` and `.../vehicles/[id]/page.tsx` — detail pages; this story creates the shell (profile fields + Edit link), Story 8.2 adds the movement-history section with its `CorrectAction`, Story 8.3 adds the service-log section.
  - [x] `apps/web/app/(app)/machinery-vehicles/machinery-types/page.tsx` and `.../vehicle-types/page.tsx` — minimal list+add, same dedicated-route pattern Epic 4/6 established (no Modal component exists in `packages/ui`).
- [x] Task 5 — Tests (AC: all)
  - [x] Zod tests for all four new schemas.
  - [x] `machinery.service.spec.ts` / `vehicle.service.spec.ts`: create/update delegation, `P2003` (bad `typeId`) → `400`; confirm `update` never writes `currentStatus`/`currentSiteId`.

## Dev Notes

**Two different affordances on what looks like one row — resolve this before building the list page.** `11-machinery-vehicles.html`'s register table shows a row-level `CorrectAction` (rotate icon) on every Machinery/Vehicle row. Read literally, that would mean the *whole record* — including `name`, `assetNumber`, `model` — is append-only/correctable, which would contradict this story's own AC #3 and the master-data precedent every prior epic established (Material, Team Member: Edit, not Correct). The resolution: the mockup's row *displays* the asset's current derived state (`Current Site`, `Status`), which **is** append-only-derived (from `MachineryMovementLog`/`VehicleMovementLog`, per Story 8.2) — the Correct icon on this row is shorthand for "correct the most recent movement entry," not "correct this Machine's registration." This story's list page should route that icon to Story 8.2's movement-correction flow (once it exists; until Story 8.2 lands, omit the icon rather than wiring it to the wrong target), and put a separate, ordinary "Edit" entry point (row click-through to the detail page, per Task 4) for the master-data fields this story owns. Don't build a single `CorrectAction` that tries to cover both meanings.

**FR-54 is precise about what's append-only here, and Story 8.3's fuel/maintenance/repair logs are deliberately excluded.** FR-54 enumerates append-only history explicitly: "Material movement/consumption, Advances/Adjustments, **Machinery/Vehicle location changes**, and Payments." Location changes (`MachineryMovementLog`/`VehicleMovementLog`) are named; fuel/maintenance/repair logs (`MachineryServiceLog`/`VehicleServiceLog`) are not — and neither service-log model has `correctsId`/`reason` fields in the schema, unlike every genuinely append-only model in this project. This is confirmed, not a gap to fix: Story 8.3 uses a normal Edit affordance for service log entries, the same as this story's master-data fields, not `CorrectAction`.

**This story creates `AssetsModule`; Stories 8.2 and 8.3 extend it, not recreate it.**

**Architecture constraints in force:** AD-3, AD-4, AD-5, AD-6, AD-7, NFR-4.

### Project Structure Notes

- New `apps/api/src/assets/` module (four related resources, one module — same shape as `apps/api/src/materials/` from Epic 4).
- `apps/web/app/(app)/machinery-vehicles/page.tsx` already exists as a stub — replaced here.
- Schema edits: two new lookup tables, `type` FK conversion on both `Machinery`/`Vehicle`, plus the `currentSite` relation addition — all additive/non-breaking.

### References

- [Source: _bmad-output/specs/spec-AzentisFieldOS/functional-requirements.md#CAP-4 — Machinery & Vehicle Registers] (FR-15, FR-16, NFR-4)
- [Source: _bmad-output/specs/spec-AzentisFieldOS/functional-requirements.md#FR-54 — exact append-only enumeration]
- [Source: _bmad-output/planning-artifacts/epics/phase-5-assets-suppliers/epic-8-machinery-vehicle-management.md]
- [Source: _bmad-output/planning-artifacts/stories/phase-5-assets-suppliers/epic-8-machinery-vehicle-management/story-8.1-manage-registers.md]
- [Source: infra/prisma/schema.prisma#Machinery, Vehicle, MachineryMovementLog, VehicleMovementLog — type-as-string and missing currentSite relation gaps this story's Task 1 fixes]
- [Source: _bmad-output/implementation-artifacts/4-1-manage-material-categories-materials.md, 6-1-manage-team-members.md — the lookup-table-not-enum-or-free-string pattern this story follows]
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/11-machinery-vehicles.html]

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (claude-sonnet-5)

### Debug Log References

### Completion Notes List

- On starting this story, Task 1 (schema), Task 2 (shared Zod schemas), Task 3 (`apps/api`'s `AssetsModule` — controllers/services/specs), and the `apps/web` register list page (`machinery-vehicles/page.tsx`) already existed uncommitted in the working tree, along with a matching `AssetsModule` registration in `app.module.ts` and a Prisma client already regenerated for the new `MachineryType`/`VehicleType`/`typeId`/`currentSite` shape. Verified this prior work against the spec line by line rather than assuming it was correct: `apps/api`'s services correctly exclude `currentStatus`/`currentSiteId` from create/update, translate `P2003`(bad `typeId`)/`P2002`(dup `assetNumber`/`number`) to 400s and `P2025` to 404, and `list()`/`findOne()` both `include` `type`/`currentSite`. Ran the existing `apps/api` test suite to confirm — all passing. This story's actual remaining work was Task 4's create/edit/detail/type-list web routes, which didn't exist yet (only the top-level list page was present).
- Built the 8 missing route directories under `apps/web/app/(app)/machinery-vehicles/`: `machinery/new`, `vehicles/new`, `machinery/[id]/edit`, `vehicles/[id]/edit`, `machinery/[id]` (detail shell), `vehicles/[id]` (detail shell), `machinery-types`, `vehicle-types` — each following the exact Server Action + `useActionState` + shared-Zod-schema pattern Epic 6's Team Member / Employment Type routes established (`createXAction`/`updateXAction` in `actions.ts`, full-replace PATCH with explicit `null` for blanked optional fields, `body.message` read for Nest's plain-string `BadRequestException`, `revalidatePath` on the minimal type-list add forms). Detail pages are the shell only (profile fields + Edit link) per Task 4/Dev Notes — no movement-history or service-log section, since those are Story 8.2/8.3's scope, and no `CorrectAction` anywhere on this story's pages since the mockup's row-level Correct icon is Story 8.2's movement-correction flow, not this story's master-data Edit (per Dev Notes "Two different affordances").
- Added test files for every new page/form/action (`page.test.tsx`, `*-form.test.tsx`, `actions.test.ts`) plus a `page.test.tsx` for the previously-untested top-level register list, mirroring the exact assertions Epic 6's equivalent tests use (pre-fill on edit, explicit-`null`-on-clear, 404/400/network-failure form-error paths, empty-state guidance when no Machinery/Vehicle Type exists yet).
- No migration existed for Task 1's schema change (`MachineryType`/`VehicleType` tables, `Machinery.typeId`/`Vehicle.typeId` FK conversion, `Machinery.currentSiteId`/`Vehicle.currentSiteId` → `Site` FK) despite the schema and generated Prisma client already reflecting it. Verified end-to-end against a real local Postgres instance rather than trusting the schema file alone: applied the 9 pre-existing baseline migrations to a scratch database, hand-authored `infra/prisma/migrations/20260816070000_add_machinery_vehicle_type_and_current_site_relation/migration.sql` scoped to only this story's model changes (cross-checked by also running `prisma migrate dev` once to confirm Prisma's own diff engine produces byte-identical SQL for the Machinery/Vehicle/Type/Site portion — that run additionally picked up Epic 7's already-uncommitted `Advance`/`AdvanceAdjustment`/`Payment`/`TeamMember` schema changes, which have no migration of their own yet; deliberately left those out of this story's migration file, matching the precedent Story 6.1's review set for identical cross-epic schema drift ("not this story's defect, flagged separately")), applied it via `prisma migrate deploy`, ran `pnpm db:seed` (confirmed `MachineryType`/`VehicleType` rows land), and exercised `machinery.create`/`.update`/`vehicle.create` directly against the live database to confirm the FK constraints, `include`d relations, and the update path's exclusion of `currentStatus`/`currentSiteId` all behave as coded. Scratch database and role dropped afterward; no lasting changes to the developer's local Postgres beyond the new migration file itself.
- Final verification: `apps/api` (354 passing / 51 skipped, 45 files), `apps/web` (375 passing, 99 files) — both suites green, both packages `typecheck` clean, `apps/web` `lint` clean and `next build` succeeds for all 8 new routes. `apps/api`'s root `pnpm lint` shows 7 pre-existing `@typescript-eslint/no-unsafe-assignment` errors in `apps/api/src/team/payments.service.spec.ts` — untracked, Epic 7 work already sitting in the tree before this story started, not touched by or related to this story's diff; confirmed `apps/api/src/assets/**` lints clean in isolation.

### File List

- `infra/prisma/migrations/20260816070000_add_machinery_vehicle_type_and_current_site_relation/migration.sql` (new)
- `apps/web/app/(app)/machinery-vehicles/page.test.tsx` (new)
- `apps/web/app/(app)/machinery-vehicles/machinery/new/page.tsx`, `new-machinery-form.tsx`, `actions.ts` + `.test.tsx`/`.test.ts` (new)
- `apps/web/app/(app)/machinery-vehicles/vehicles/new/page.tsx`, `new-vehicle-form.tsx`, `actions.ts` + `.test.tsx`/`.test.ts` (new)
- `apps/web/app/(app)/machinery-vehicles/machinery/[id]/edit/page.tsx`, `edit-machinery-form.tsx`, `actions.ts` + `.test.tsx`/`.test.ts` (new)
- `apps/web/app/(app)/machinery-vehicles/vehicles/[id]/edit/page.tsx`, `edit-vehicle-form.tsx`, `actions.ts` + `.test.tsx`/`.test.ts` (new)
- `apps/web/app/(app)/machinery-vehicles/machinery/[id]/page.tsx` + `.test.tsx` (new)
- `apps/web/app/(app)/machinery-vehicles/vehicles/[id]/page.tsx` + `.test.tsx` (new)
- `apps/web/app/(app)/machinery-vehicles/machinery-types/page.tsx`, `add-machinery-type-form.tsx`, `actions.ts` + `.test.tsx`/`.test.ts` (new)
- `apps/web/app/(app)/machinery-vehicles/vehicle-types/page.tsx`, `add-vehicle-type-form.tsx`, `actions.ts` + `.test.tsx`/`.test.ts` (new)
- Pre-existing (present uncommitted at story start, verified rather than rebuilt): `infra/prisma/schema.prisma`, `infra/prisma/seed.ts`, `packages/shared/src/schemas/{machinery,vehicle,machinery-type,vehicle-type}.ts`, `packages/shared/src/index.ts`, `apps/api/src/assets/**`, `apps/api/src/app.module.ts`, `apps/web/app/(app)/machinery-vehicles/page.tsx`
- `apps/web/app/(app)/machinery-vehicles/status-badge.tsx` (new, post-review extraction)

## Suggested Review Order

**Schema change (the design intent origin)**

- Two new lookup tables replace free-text `type`, plus the missing `currentSite` relation both models already needed.
  [`schema.prisma:266`](../../infra/prisma/schema.prisma#L266)

- `Machinery.typeId`/`Vehicle.typeId` FK conversion — the shape everything downstream depends on.
  [`schema.prisma:281`](../../infra/prisma/schema.prisma#L281)

- Seeds common defaults so the registers aren't unusable on day one, same approach as `EmploymentType`.
  [`seed.ts:28`](../../infra/prisma/seed.ts#L28)

**API — validation and data access**

- Shared Zod schema is the single source of truth for create/update shape (AD-7); `currentStatus`/`currentSiteId` deliberately excluded.
  [`machinery.ts:8`](../../packages/shared/src/schemas/machinery.ts#L8)

- `create`/`update` now include `type`/`currentSite`, matching `list`/`findOne` and the house convention (post-review fix).
  [`machinery.service.ts:23`](../../apps/api/src/assets/machinery.service.ts#L23)

- `AssetsModule` houses all four resources — the module Stories 8.2/8.3 extend, not recreate.
  [`assets.module.ts:12`](../../apps/api/src/assets/assets.module.ts#L12)

- Registered alongside the other feature modules.
  [`app.module.ts:11`](../../apps/api/src/app.module.ts#L11)

**Web — register list and status display**

- Entry point: the register list replacing the stub, with the mockup's row-level Correct icon deliberately omitted until Story 8.2 exists.
  [`page.tsx:63`](../../apps/web/app/(app)/machinery-vehicles/page.tsx#L63)

- `statusBadge()` extracted to one shared module and imported by the list and both detail pages (post-review fix, was duplicated 3x).
  [`status-badge.tsx:10`](../../apps/web/app/(app)/machinery-vehicles/status-badge.tsx#L10)

- Detail page shell — profile fields + Edit link only; Story 8.2 adds movement history, Story 8.3 adds service logs.
  [`machinery/[id]/page.tsx`](../../apps/web/app/(app)/machinery-vehicles/machinery/[id]/page.tsx)

**Peripherals**

- Machinery/Vehicle Type minimal list+add routes — same dedicated-route pattern as Epic 4/6 (no Modal component exists).
  [`machinery-types/page.tsx`](../../apps/web/app/(app)/machinery-vehicles/machinery-types/page.tsx)

- Service specs cover P2003 (bad `typeId`) → 400 translation and confirm `update` never writes `currentStatus`/`currentSiteId`.
  [`machinery.service.spec.ts`](../../apps/api/src/assets/machinery.service.spec.ts)
