---
baseline_commit: 4f33962f5ba714deb608278e32224cdb9e049d6f
---

# Story 8.3: Log Fuel/Maintenance/Repair History

Status: in-review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As Owner/Admin,
I want to log fuel, maintenance, and repair entries per Machine/Vehicle,
so that I can retrieve a dated service history for any asset when I need it.

## Acceptance Criteria

1. **Given** a Machine or Vehicle, **when** I log a fuel, maintenance, or repair entry with a date, **then** it appears in that asset's dated service history, retrievable in full at any time. (FR-18)
2. A service log entry is edited via a normal Edit affordance, not `CorrectAction` — it is not part of FR-54's append-only enumeration (see Story 8.1's Dev Notes, which already established this and cites FR-54's exact wording).

## Tasks / Subtasks

- [x] Task 1 — Shared Zod schema (AC: #1, #2)
  - [x] Create `packages/shared/src/schemas/asset-service-log.ts`, shared by both Machinery and Vehicle (same reasoning as Story 8.2's `asset-movement.ts` — one schema, not two copies): `assetType` (`z.enum(["MACHINERY", "VEHICLE"])`), `assetId` (`z.uuid()`), `kind` (`z.enum(["FUEL", "MAINTENANCE", "REPAIR"])` — the schema's `kind String // fuel | maintenance | repair` comment documents exactly this closed set; enforce it as a real enum at the Zod layer rather than leaving it an unconstrained string, matching every other "documented but not schema-enforced" string field this project has tightened at the Zod layer, e.g. Epic 5 Story 5.1's `paymentStatus`), `notes` (optional string), `cost` (`z.number().nonnegative().optional()`), `serviceDate` (`z.coerce.date()`).
  - [x] `updateAssetServiceLogSchema` — full replace via `PATCH`, no `correctsId`/`reason` fields (AC #2 — there is nothing to add here, this model has no correction lifecycle).
  - [x] Export from `packages/shared/src/index.ts`.
- [x] Task 2 — `apps/api` (AC: #1, #2)
  - [x] `apps/api/src/assets/asset-service-logs.controller.ts` + `.service.ts`, added to `AssetsModule`. `POST /asset-service-logs`, `GET /asset-service-logs?assetType=&assetId=`, `PATCH /asset-service-logs/:id?assetType=`.
  - [x] Because `MachineryServiceLog`/`VehicleServiceLog` are two separate Prisma models with identical shape, the service branches on `assetType` to pick which Prisma delegate to call (`prisma.machineryServiceLog` vs. `prisma.vehicleServiceLog`) — same branching pattern Story 8.2 used for movement logs. No transactional current-state update is needed here (unlike Story 8.2) — a service log entry doesn't change the asset's `currentStatus`/`currentSiteId`, it's purely additive history.
- [x] Task 3 — `apps/web` UI (AC: #1, #2)
  - [x] Extend the Machinery/Vehicle detail pages (Story 8.1's shell) with a "Service History" section: a `DataTable` (Date / Kind badge / Notes / Cost / Edit action). Skipped the optional client-side `kind` filter — the AC doesn't require it and the sibling Work Record History/Advance Ledger tables on `team/[id]/page.tsx` set the precedent of keeping these history tables filter-free until a real need shows up.
  - [x] `apps/web/app/(app)/machinery-vehicles/machinery/[id]/service-log/new/page.tsx` and the Vehicle equivalent — entry form (kind, notes, cost, date).
  - [x] Edit-in-place for an existing entry (same page pattern, pre-filled) — a normal Edit affordance per AC #2, not a correction flow.
- [x] Task 4 — Tests (AC: all)
  - [x] Zod test for the `kind` enum (as part of `asset-service-logs.controller.spec.ts`'s `ZodValidationPipe(createAssetServiceLogSchema)` block — `packages/shared` has no test runner of its own, same precedent as `asset-movement.ts`, which is likewise exercised only through the API controller spec, not a dedicated `packages/shared` test file).
  - [x] `asset-service-logs.service.spec.ts`: create/list/update delegate correctly for both `assetType` branches.

## Dev Notes

**No correction machinery for this model — already established, don't second-guess it mid-implementation.** Story 8.1's Dev Notes already resolved this by citing FR-54's exact enumeration (Material movement/consumption, Advances/Adjustments, Machinery/Vehicle *location changes*, Payments — fuel/maintenance/repair logs are not on that list), and the schema itself confirms it: `MachineryServiceLog`/`VehicleServiceLog` have no `correctsId`/`reason` fields, unlike every genuinely append-only model in this project. Use a normal `PATCH`, same as Material/Team Member master-data edits.

**One shared schema/branching-service pattern, not two near-duplicate resources.** By this story, three separate features (movement in Story 8.2, service logs here) have needed to act on "Machinery or Vehicle" as a pair of structurally-identical-but-separately-modeled tables. Keep following the `assetType` discriminator + single-schema/branching-service shape Story 8.2 established rather than letting Machinery and Vehicle drift into two independently-maintained copies of the same logic.

**Depends on Story 8.1** for `AssetsModule` and the detail page shell. Independent of Story 8.2 otherwise (no shared write path, just a shared UI section pattern).

**Architecture constraints in force:** AD-3, AD-4, AD-5, AD-6, AD-7.

### Project Structure Notes

- New `asset-service-logs.controller.ts`/`.service.ts` in `apps/api/src/assets/` (Story 8.1).
- Extends the Machinery/Vehicle detail pages from Story 8.1.

### References

- [Source: _bmad-output/specs/spec-AzentisFieldOS/functional-requirements.md#CAP-4, FR-54] (FR-18; FR-54's exact append-only enumeration, which excludes this model)
- [Source: _bmad-output/planning-artifacts/stories/phase-5-assets-suppliers/epic-8-machinery-vehicle-management/story-8.3-fuel-maintenance-log.md]
- [Source: infra/prisma/schema.prisma#MachineryServiceLog, VehicleServiceLog]
- [Source: _bmad-output/implementation-artifacts/8-1-manage-machinery-vehicle-registers.md — AssetsModule, and the FR-54 citation establishing no-correction-needed here]
- [Source: _bmad-output/implementation-artifacts/8-2-record-movement-between-sites-maintenance.md — the assetType-discriminator/shared-schema pattern this story follows]

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (claude-sonnet-5)

### Debug Log References

### Completion Notes List

- `MachineryServiceLog`/`VehicleServiceLog` already existed in `infra/prisma/schema.prisma` (added ahead of time alongside the movement-log models) with no `correctsId`/`reason` columns — no schema/migration change was needed for this story, only the API/UI layers on top.
- `AssetServiceLogsService.create`/`.update` are plain (non-transactional) branches on `assetType`, unlike `AssetMovementsService` — there's no derived `currentStatus`/`currentSiteId` to keep in sync, so no `prisma.$transaction` wrapper is needed here, exactly as the Dev Notes predicted.
- `PATCH /asset-service-logs/:id?assetType=` deliberately does **not** use a method-level `@UsePipes(new ZodValidationPipe(...))` the way `MachineryController.update`/`AssetMovementsController` do elsewhere in this codebase. NestJS applies a method-scoped pipe to *every* parameter of that handler, not just `@Body()` — confirmed by reading `@nestjs/core`'s `router-execution-context.js` (`pipes.concat(paramPipes)` is applied uniformly per argument). Since this handler also takes `@Param('id')` and `@Query('assetType')`, a method-scoped Zod object-schema pipe would try to `safeParse` those plain strings against `updateAssetServiceLogSchema` and always fail. Used a parameter-scoped `@Body(new ZodValidationPipe(schema))` instead, which only runs the schema against the body. Flagging this because the same latent issue appears to already exist in `apps/api/src/assets/machinery.controller.ts`'s `PATCH :id` (and any other `update(id, body)` handler using method-level `@UsePipes`) — it's never been caught because this repo has no e2e/supertest layer exercising the real Nest HTTP pipeline (see `AGENTS.md`'s Playwright TODO), only `TestingModule`-based unit specs that call controller methods directly and bypass pipe execution entirely. Did not touch `machinery.controller.ts`/`vehicle.controller.ts` — out of scope for this story — but a future story fixing those should be aware.
- There is no single-entry `GET /asset-service-logs/:id` endpoint (Task 2 only specifies POST/GET-list/PATCH) — the Edit pages fetch the already-scoped per-asset list and find the entry by id client-side, the same pattern `team/[id]/page.tsx` already uses for filtering Advances/Adjustments down to one Team Member.
- Reused Story 8.2's shared `machinery-vehicles/actions.ts` file for the two new Server Actions (`createServiceLogAction`, `updateServiceLogAction`) rather than a new file, consistent with that file already housing `createAssetMovementAction`.
- `ServiceHistoryTable`/`ServiceLogForm` are one shared implementation each for Machinery and Vehicle (AD-5, AD-7), parameterized by `assetType`/`basePath`, same as `MovementTimeline`/`AssetMovementForm`.
- Final verification: `apps/api` (427 passing / 51 skipped, 51 files) and `apps/web` (453 passing, 116 files) both green; both packages plus `packages/shared` typecheck clean; `apps/web` builds all 4 new routes successfully (`.../service-log/new` and `.../service-log/[logId]/edit` for both Machinery and Vehicle); `apps/api`, `apps/web`, and `packages/shared` all lint clean. Did not run `apps/api`'s root `pnpm lint` broadly — an untracked, unrelated `apps/api/src/team/payments.service.spec.ts` from other in-flight work fails lint with pre-existing `no-unsafe-assignment` errors; confirmed it's untouched by this story's diff.

### File List

- `packages/shared/src/schemas/asset-service-log.ts` (new)
- `packages/shared/src/index.ts` (modified — export)
- `apps/api/src/assets/asset-service-logs.controller.ts` + `.service.ts` + `.controller.spec.ts` + `.service.spec.ts` (new)
- `apps/api/src/assets/assets.module.ts` (modified — registered `AssetServiceLogsController`/`AssetServiceLogsService`)
- `apps/web/app/(app)/machinery-vehicles/service-history.tsx` (new — shared `ServiceHistoryTable`)
- `apps/web/app/(app)/machinery-vehicles/service-log-form.tsx` (new — shared `ServiceLogForm`)
- `apps/web/app/(app)/machinery-vehicles/actions.ts` + `.test.ts` (modified — added `createServiceLogAction`/`updateServiceLogAction`)
- `apps/web/app/(app)/machinery-vehicles/machinery/[id]/service-log/new/page.tsx` + `.test.tsx` (new)
- `apps/web/app/(app)/machinery-vehicles/machinery/[id]/service-log/[logId]/edit/page.tsx` + `.test.tsx` (new)
- `apps/web/app/(app)/machinery-vehicles/vehicles/[id]/service-log/new/page.tsx` + `.test.tsx` (new)
- `apps/web/app/(app)/machinery-vehicles/vehicles/[id]/service-log/[logId]/edit/page.tsx` + `.test.tsx` (new)
- `apps/web/app/(app)/machinery-vehicles/machinery/[id]/page.tsx` + `.test.tsx` (modified — Service History section, Log Service button)
- `apps/web/app/(app)/machinery-vehicles/vehicles/[id]/page.tsx` + `.test.tsx` (modified — same)
