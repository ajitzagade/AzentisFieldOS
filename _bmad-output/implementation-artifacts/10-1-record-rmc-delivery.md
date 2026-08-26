---
baseline_commit: ae9fc6339cc3d27155dc124f2fc4801a0d02c215
---

# Story 10.1: Record RMC Delivery

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As Owner/Admin,
I want to record an RMC delivery (Vendor, date, quantity m³, grade/type, rate/m³, total, invoice/challan),
so that concrete usage is tracked as its own category, separate from general Material inventory.

## Acceptance Criteria

1. **Given** an RMC delivery to a Site, **when** I record it, **then** it's stored as its own entity, not merged into the Material Catalog or Inventory Transactions data model. (FR-26)
2. It's queryable by day, Site, or Vendor.
3. The row's "Correct" action is available, never Edit/Delete. (AD-9)

## Tasks / Subtasks

- [x] Task 1 — Schema fix (must land before anything else) (AC: #3)
  - [x] `infra/prisma/schema.prisma`'s `RmcEntry` model has no `correctsId`/`reason` — every genuinely append-only model in this project has this pair (`Purchase`, `Movement`, `Consumption`, `DailySiteReport`), and this story's own AC #3 requires it. Add `correctsId String?`, `reason String?` (no pre-existing `reason`/`note` field on this model to collide with, so the plain names match `Purchase`/`Movement`/`Consumption`'s convention — same as `Payment` in Epic 7, not the disambiguated `correctionReason` naming `Advance`/`AdvanceAdjustment` needed). Run `pnpm db:generate`.
- [x] Task 2 — Shared Zod schema (AC: #1, #2, #3)
  - [x] Create `packages/shared/src/schemas/rmc-entry.ts`: `createRmcEntrySchema` (`siteId: z.uuid()`, `vendorId: z.uuid()`, `quantityM3: z.number()`, `grade: z.string().min(1).max(50)`, `ratePerM3: z.number().positive()`, `totalAmount: z.number().positive()`, `invoiceOrChallanNo: z.string().max(200).optional()`, `deliveredAt: z.coerce.date()`, `correctsId: z.uuid().optional()`, `reason: z.string().min(1).max(500).optional()`).
  - [x] `.superRefine()`: `reason` required when `correctsId` present; `quantityM3` positive when `correctsId` absent, non-zero either sign when present — the same delta-correction rule Epic 5 Story 5.1 established (a correcting RMC entry's `quantityM3`/`totalAmount` express the adjustment, not a restated total — this is a single-quantity ledger row, the same shape as Purchase, not a multi-field computed record like Payment, so the delta pattern applies directly here, unlike Epic 7 Story 7.3's Payment or Epic 8 Story 8.2's location correction).
  - [x] Export from `packages/shared/src/index.ts`.
- [x] Task 3 — `apps/api` (AC: #1, #2)
  - [x] `apps/api/src/rmc/rmc.controller.ts` + `.service.ts` + `.module.ts` (`RmcModule`, its own module — RMC is explicitly "its own entity," per the epic's Implementation Notes, not folded into `InventoryModule` from Epic 5 even though it's conceptually adjacent). Already registered in `app.module.ts` from earlier scaffolding; extended in place rather than renamed to `rmc-entries.*` — the class names (`RmcController`/`RmcService`/`RmcModule`) already matched the task's intent and app.module.ts already wired them, so renaming the files would have been pure churn with no functional benefit. `POST /rmc-entries`, `GET /rmc-entries?siteId=&vendorId=&date=` (AC #2's queryability, as filter params on one endpoint, not three separate ones), plus `GET /rmc-entries/:id` (correction form pre-fill, same reasoning as `PurchasesService.findOne`) and `GET /rmc-entries/stats/this-month` (Task 4's stat tiles, server-computed).
  - [x] No stock/balance side effect on create — RMC delivery is a direct cost/consumption record, not a Stock-increasing transaction like Purchase; doesn't touch `GodownStock`/`SiteStock` (the epic's Implementation Notes explicitly warn against merging RMC into the Inventory Transactions model). `RmcService.create` also validates that a correction's Site/Vendor/Grade match the delivery it corrects (same reasoning as `PurchasesService`/`ConsumptionService`/`ReturnWastageService`'s match checks), even though there's no Stock row here to protect — it's the same "correction can't silently apply to a different delivery" data-integrity rule.
  - [x] `GET /rmc-entries` includes `site` and `vendor` relations for display.
- [x] Task 4 — `apps/web` UI (AC: #1, #2, #3)
  - [x] Replace the stub `apps/web/app/(app)/rmc/page.tsx` with the real RMC list: stat tiles (Total RMC this month — m³, Total RMC cost this month — ₹, Active RMC vendor count) and a `DataTable` (Vendor / Site / Date / Quantity / Grade / Rate / Total / Invoice # / `CorrectAction`), matching `14-rmc.html`.
  - [x] `apps/web/app/(app)/rmc/new/page.tsx` — entry form (`rmc-form.tsx` + `actions.ts`, mirroring `movements/purchases`' delta-correction form pattern since RMC reuses that same correction shape).
  - [x] `apps/web/app/(app)/rmc/[id]/correct/page.tsx` — correction route, established pattern.
- [x] Task 5 — Tests (AC: all)
  - [x] Zod tests: reason-required-on-correction, sign rule — in `apps/api/src/rmc/rmc.controller.spec.ts`'s `ZodValidationPipe(createRmcEntrySchema)` suite, the same location `createPurchaseSchema`'s equivalent tests live (this codebase has no standalone `packages/shared` schema test files; every existing Zod schema is tested through its controller's `ZodValidationPipe` suite).
  - [x] `rmc.service.spec.ts`: create/list delegation and filter params; no `godownStock`/`siteStock` calls anywhere in this service (a concrete, automatable check that the Implementation Notes' "don't merge into Inventory" boundary is actually respected in code, not just in prose) — the mock Prisma client has no `godownStock`/`siteStock` keys at all, so an accidental call would throw immediately.
  - [x] Also added `apps/web/app/(app)/rmc/{page,rmc-form,actions,new/page,[id]/correct/page}.test.tsx`, matching the coverage level every other list/form/correction surface in this codebase has.

## Dev Notes

**Same correction-field gap this project has now caught in five different models across five epics** (`MaterialCategory.isActive`, Epic 4; `ReturnWastage.correctsId`, Epic 5; `Advance`/`AdvanceAdjustment`/`Payment`, Epic 7) — a model drafted ahead of its story, checked now against what the AC actually requires. `RmcEntry` follows `Purchase`/`Movement`/`Consumption`'s plain `correctsId`/`reason` naming (not `Advance`'s disambiguated `correctionReason`) because it has no pre-existing field the plain name would collide with.

**RMC deliberately does not touch `GodownStock`/`SiteStock`.** Concrete delivered via RMC is used essentially immediately at the point of delivery (poured, not stored) — the epic's Implementation Notes are explicit that this stays a separate entity from Epic 4/5's Material Catalog and Inventory Transactions models. If a future requirement needs RMC to interact with Stock, that's a scoped change to raise explicitly, not something to infer here.

**Depends on nothing new** beyond established conventions (Epic 5's correction-delta pattern, Epic 2's `Site`, Epic 9's `Vendor`). Story 10.2 depends on this one.

**Architecture constraints in force:** AD-3, AD-4, AD-5, AD-6, AD-7, AD-9.

### Project Structure Notes

- New `apps/api/src/rmc/` module — its own module, not folded into `apps/api/src/inventory/` (Epic 5), per the epic's explicit "separate entity" framing.
- `apps/web/app/(app)/rmc/page.tsx` already exists as a stub — replaced here.

### References

- [Source: _bmad-output/specs/spec-AzentisFieldOS/functional-requirements.md#CAP-7 — RMC Tracking] (FR-26)
- [Source: _bmad-output/planning-artifacts/epics/phase-5-assets-suppliers/epic-10-rmc.md — "own entity, don't merge into Materials" note]
- [Source: _bmad-output/planning-artifacts/stories/phase-5-assets-suppliers/epic-10-rmc/story-10.1-record-rmc-delivery.md]
- [Source: infra/prisma/schema.prisma#RmcEntry — missing correctsId/reason, this story's Task 1 fix]
- [Source: _bmad-output/implementation-artifacts/5-1-record-a-purchase.md — correction-delta semantics this story reuses]
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/14-rmc.html]

## Dev Agent Record

### Agent Model Used

claude-sonnet-5

### Debug Log References

### Completion Notes List

- `RmcEntry` already had a partial read-only scaffold (`apps/api/src/rmc/rmc.controller.ts`/`.service.ts`/`.module.ts` with a bare `GET /rmc-entries`, wired into `app.module.ts`) from earlier work supporting the DSR-embedded RMC write path (Epic 3). Extended those files in place rather than creating new `rmc-entries.*`-named files, since the class names already matched and renaming would be pure churn with no functional difference — noted explicitly in Task 3 above.
- `RmcService.create`'s correction match-check (Site/Vendor/Grade must match the original) isn't strictly required by the letter of the ACs — RMC has no Stock row for a mismatched correction to corrupt, unlike Purchase/Consumption/ReturnWastage — but was added anyway for data-integrity parity with those services' established pattern (a correction silently detaching from the delivery it claims to correct is a real bug class this project has now hit five times per the Dev Notes). This is a judgment call, flagged here in case a reviewer disagrees.
- `deliveredAt: z.coerce.date()` (per Task 2's exact spec) makes `CreateRmcEntryInput.deliveredAt` a `Date`, not a `string` like `Purchase.purchasedAt: z.iso.date()` — the web form still submits it as a `type="date"` string, which the schema coerces server-side (and client-side, in the Server Action's own `safeParse`) into a `Date` that then serializes back to an ISO string over `JSON.stringify` for the HTTP POST body, round-tripping cleanly through `ZodValidationPipe`'s own coercion.
- No sidebar nav change needed — `/rmc` was already present in `apps/web/app/(app)/_components/nav-config.ts`'s Assets group from earlier scaffolding.
- Ran `pnpm db:generate` after the schema change; verified via `pnpm --filter @azentisfieldos/api test`, `pnpm --filter @azentisfieldos/web test`, `typecheck` on both packages, targeted `eslint` on the new/changed files, and a full `pnpm --filter @azentisfieldos/web build` (all three `/rmc*` routes compile). Did not run the full monorepo-wide `pnpm lint`, since `apps/api` already has pre-existing lint failures on `main` unrelated to this story (`apps/api/src/team/payments.service.spec.ts`, `apps/api/src/expenses/expenses.controller.ts` prettier formatting, `apps/api/src/common/patch-body-validation.integration.spec.ts` warnings) — confirmed by lint on a clean stash of `main` before starting.
- **Code review follow-up:** the initial pass ran `pnpm db:generate` after the schema edit but never generated the matching migration, so `RmcEntry`'s table would never actually get the `correctsId`/`reason` columns in a migration-managed database (Prisma Client would expect columns Postgres doesn't have). Fixed by running `pnpm db:migrate:dev --name add_rmc_entry_correction_fields` against a local Postgres instance, producing `infra/prisma/migrations/20260826084511_add_rmc_entry_correction_fields/migration.sql` — `ALTER TABLE "RmcEntry" ADD COLUMN "correctsId" TEXT, ADD COLUMN "reason" TEXT`, matching the shape of `20260825114157_add_team_member_outstanding_advance_balance`'s equivalent `Payment.correctsId`/`reason` migration. Re-ran `pnpm --filter @azentisfieldos/api test` (463 passed) and `pnpm --filter @azentisfieldos/web test` (474 passed) — both clean. Also ran the `dsr.service.integration.spec.ts` integration suite directly against the live local Postgres DB to confirm the new columns are actually reachable end-to-end (not just Client-side): 21/22 passed, with the one failure being pre-existing local-DB seed-data pollution unrelated to this change (an assertion about a placeholder user's display name), not a missing-column error.

### File List

- `infra/prisma/schema.prisma` — added `RmcEntry.correctsId`/`reason`.
- `infra/prisma/migrations/20260826084511_add_rmc_entry_correction_fields/migration.sql` — new migration for the above (code-review follow-up).
- `packages/shared/src/schemas/rmc-entry.ts` — new `createRmcEntrySchema`.
- `packages/shared/src/index.ts` — export the new schema.
- `apps/api/src/rmc/rmc.controller.ts` — extended: `POST /rmc-entries`, `GET /rmc-entries` (siteId/vendorId/date filters), `GET /rmc-entries/stats/this-month`, `GET /rmc-entries/:id`.
- `apps/api/src/rmc/rmc.service.ts` — extended: `create` (with correction match-check, no Stock writes), `list` (filters), `findOne`, `statsThisMonth`.
- `apps/api/src/rmc/rmc.controller.spec.ts` — new.
- `apps/api/src/rmc/rmc.service.spec.ts` — new.
- `apps/web/app/(app)/rmc/page.tsx` — replaced stub with real list (stat tiles + DataTable + CorrectAction).
- `apps/web/app/(app)/rmc/page.test.tsx` — new.
- `apps/web/app/(app)/rmc/rmc-form.tsx` — new.
- `apps/web/app/(app)/rmc/rmc-form.test.tsx` — new.
- `apps/web/app/(app)/rmc/actions.ts` — new.
- `apps/web/app/(app)/rmc/actions.test.ts` — new.
- `apps/web/app/(app)/rmc/new/page.tsx` — new.
- `apps/web/app/(app)/rmc/new/page.test.tsx` — new.
- `apps/web/app/(app)/rmc/[id]/correct/page.tsx` — new.
- `apps/web/app/(app)/rmc/[id]/correct/page.test.tsx` — new.

## Suggested Review Order

**Contract (schema + validation — the core of the story)**

- Entry point: the shared validation contract both API and web import — delta-correction sign rule and reason-required refinement.
  [`rmc-entry.ts:11`](../../packages/shared/src/schemas/rmc-entry.ts#L11)

- The append-only correction fields added to the model (AC #3 / AD-9).
  [`schema.prisma:509`](../../infra/prisma/schema.prisma#L509)

- The migration that actually lands those columns (code-review follow-up — was missing on first pass).
  [`migration.sql:1`](../../infra/prisma/migrations/20260826084511_add_rmc_entry_correction_fields/migration.sql#L1)

**API write path**

- `create` — correction match-check (Site/Vendor/Grade), no Stock writes, FK-error translation.
  [`rmc.service.ts:31`](../../apps/api/src/rmc/rmc.service.ts#L31)

- `list` filters (AC #2) and `statsThisMonth` server-side aggregation.
  [`rmc.service.ts:76`](../../apps/api/src/rmc/rmc.service.ts#L76)

- Route surface — note `stats/this-month` declared before `:id`.
  [`rmc.controller.ts:28`](../../apps/api/src/rmc/rmc.controller.ts#L28)

**Web UI**

- Shared new/correct form — delta-correction pattern, Site/Vendor/Grade lock in correct mode.
  [`rmc-form.tsx:73`](../../apps/web/app/(app)/rmc/rmc-form.tsx#L73)

- Server Action — dual 400-shape handling (Zod field errors vs. plain BadRequestException).
  [`actions.ts:16`](../../apps/web/app/(app)/rmc/actions.ts#L16)

- List page — stat tiles + DataTable with CorrectAction (AC #1, AC #3).
  [`page.tsx:66`](../../apps/web/app/(app)/rmc/page.tsx#L66)

- Correction route — pre-fill from original delivery, notFound on bad id.
  [`correct/page.tsx:56`](../../apps/web/app/(app)/rmc/[id]/correct/page.tsx#L56)

**Tests (supporting)**

- Service unit tests — mock Prisma has no godownStock/siteStock keys, enforcing the "no Stock" boundary.
  [`rmc.service.spec.ts:1`](../../apps/api/src/rmc/rmc.service.spec.ts#L1)

- Controller + Zod pipe tests.
  [`rmc.controller.spec.ts:1`](../../apps/api/src/rmc/rmc.controller.spec.ts#L1)
