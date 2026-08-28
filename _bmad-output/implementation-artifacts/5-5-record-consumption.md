---
baseline_commit: cf5dd4dc709029a08e7c4febf34f2421f394871f
---

# Story 5.5: Record Consumption

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As Site Supervisor or Owner/Admin,
I want to record Material Consumption at a Site against an activity reference,
so that Site Stock reflects what's actually been used, comparable against what was received.

## Acceptance Criteria

1. **Given** a Site with available Stock for a Material, **when** I record Consumption (date, material, size/spec, quantity, unit, activity reference, notes), **then** Site Stock for that Material/Size decreases by the consumed quantity. (FR-12)
2. A Consumption entry is comparable against total received to compute variance — this requires no new computed field, only that `Consumption` rows and `Movement`/`Purchase` rows for the same `siteId`+`materialSizeId` are both queryable together (Story 5.7 builds the actual variance view; this story only needs to not block it).
3. Consumption can never drive the Site's Stock below zero — same non-negative rule and technique as Story 5.2.
4. The row's "Correct" action is available, never Edit/Delete. (AD-9)

## Tasks / Subtasks

- [x] Task 1 — Shared Zod schema (AC: #1, #3, #4)
  - [x] Create `packages/shared/src/schemas/consumption.ts`. Fields per `schema.prisma`'s `Consumption` model: `siteId` (`z.uuid()`), `materialSizeId` (`z.uuid()`), `quantity` (`z.number()`), `activityReference` (optional string — free text per FR-12's "against an activity reference"; `dailySiteReportId` is left unset by this story, it's populated once Epic 3's DSR flow links a Consumption to itself, out of scope here), `notes` (optional string), `consumedAt` (`z.coerce.date()`), `recordedByUserId` (`z.uuid()` — the current authenticated user; see Dev Notes on where this comes from), `correctsId`/`reason` (Story 5.1's correction rule).
  - [x] `.superRefine()`: `quantity` positive when `correctsId` absent, non-zero either sign when present.
  - [x] Export from `packages/shared/src/index.ts`.
- [x] Task 2 — `apps/api` (AC: #1, #3)
  - [x] `apps/api/src/inventory/consumption.controller.ts` + `.service.ts`, added to `InventoryModule`. `POST /consumption`, `GET /consumption`.
  - [x] `recordedByUserId`: this story's controller does not yet have a real authenticated-request user to read (`apps/api` has no auth-token-validation middleware wired yet — that's AD-10's job, not built as of this story). Accept `recordedByUserId` as an explicit body field for now, matching how `apps/web/app/(app)/layout.tsx` currently hardcodes `role="OWNER_ADMIN"` pending a real current-user fetch (see the repo's own `AGENTS.md` TODO on this exact gap). Do not block this story on building request-scoped auth — that's a cross-cutting concern larger than one Epic 5 story.
  - [x] `ConsumptionService.create` runs inside `prisma.$transaction`, inserting the `Consumption` row and applying the **stock-safety floor check** against `SiteStock` (Story 5.2's canonical `updateMany` + count-check pattern, keyed on `{ siteId, materialSizeId }`) — reuse the same helper Story 5.4 parameterized, don't write a third copy.
- [x] Task 3 — `apps/web` UI (AC: #1, #4)
  - [x] `apps/web/app/(app)/movements/consumption/new/page.tsx` — entry form (Site, Material/Size, quantity, activity reference, notes, date).
  - [x] `/movements` list (Story 5.1): Consumption rows show `badge-neutral` "Consumption" (per `07-movements.html`), with the Received Qty column muted `—` (Consumption has only one quantity, not a sent/received pair — do not force a value into that column).
  - [x] Correction route following the established pattern.
- [x] Task 4 — Tests (AC: all)
  - [x] Zod sign-rule test.
  - [x] `consumption.service.spec.ts`: floor check rejects and rolls back on insufficient `SiteStock`, mirroring Story 5.2's test.

## Dev Notes

**Reuse Story 5.2's floor-check helper, don't re-implement it a third time.** By this story, the same `updateMany`-based non-negative check is needed for a third balance path (`GodownStock` in 5.2, `SiteStock`-as-source in 5.4, `SiteStock`-as-consumer here). If Story 5.4 didn't already extract this into a small shared helper (e.g. `applyStockDelta(tx, { model: 'godownStock' | 'siteStock', key, delta })` in `apps/api/src/inventory/stock-delta.ts`), do it now — three call sites is the signal to stop copy-pasting the pattern Story 5.2 documented inline.

**`recordedByUserId` is a known gap, not a decision to solve here.** This repo has no request-scoped current-user resolution yet (`apps/web`'s `AppShell` still hardcodes `role="OWNER_ADMIN"`, per the repo's own `AGENTS.md` TODO — the same underlying gap). Accepting it as a body field is the pragmatic, story-scoped choice; wiring a real Clerk-session-derived user through `apps/api` middleware is out of scope here and shouldn't be invented ad hoc as a side effect of this story.

**Depends on Story 5.2** for the floor-check pattern (and ideally the extracted helper) and Story 5.1 for `InventoryModule`/the `/movements` page.

**Architecture constraints in force:** same set as prior Epic 5 stories — AD-3, AD-4, AD-5, AD-6, AD-7, AD-9.

### Project Structure Notes

- Extends `apps/api/src/inventory/` and `apps/web/app/(app)/movements/page.tsx`. New files: `consumption.controller.ts`, `consumption.service.ts`, `packages/shared/src/schemas/consumption.ts`, `apps/web/app/(app)/movements/consumption/new/page.tsx`.

### References

- [Source: _bmad-output/specs/spec-AzentisFieldOS/functional-requirements.md#CAP-3] (FR-12, feature-level non-negative rule)
- [Source: _bmad-output/planning-artifacts/stories/phase-3-materials-inventory/epic-5-inventory-transactions-stock-visibility/story-5.5-record-consumption.md]
- [Source: infra/prisma/schema.prisma#Consumption]
- [Source: _bmad-output/implementation-artifacts/5-2-record-godown-site-movement.md — canonical stock-safety floor-check pattern]
- [Source: AGENTS.md — the existing `recordedByUserId`/current-user TODO this story inherits rather than solves]

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (claude-sonnet-5)

### Debug Log References

### Completion Notes List

- Extracted `decrementStockWithFloorCheck` into `apps/api/src/inventory/stock-delta.ts`, per Dev Notes' explicit instruction once a third call site needed the pattern — takes a `{ model: 'godownStock', materialSizeId }` or `{ model: 'siteStock', siteId, materialSizeId }` target, a signed `quantity`, and an insufficient-stock message. Refactored `MovementsService.create`'s two branches (Story 5.2/5.4) to call this helper instead of the two inline copies, verified with the full existing Movement test suite unchanged (the helper's internal `updateMany` calls have the identical shape the old inline code produced, so no test assertions needed updating).
- `ConsumptionService.create` follows the same shape as `PurchasesService`/`MovementsService`: `correctsId` existence check outside the transaction (Consumption rows are never deleted, so no TOCTOU risk), then `tx.consumption.create` + `decrementStockWithFloorCheck` against `SiteStock` inside one `prisma.$transaction`.
- `recordedByUserId` is a plain client-supplied `z.uuid()` field, per Dev Notes' explicit instruction not to invent request-scoped auth here. The frontend form exposes it as a free-text field with a hint explaining the gap — the same graceful-degradation pattern used for Purchase's `vendorId` (Story 5.1) before Vendor Management exists.
- `/movements` list gained a third row-producer (`consumptionToMovementRow`): `badge-neutral` "Consumption", the Site name as flow, and a muted "—" for Received Qty (never a forced value) — merged into the same sorted-by-date row list as Purchase/Movement rows, per Task 3.
- Fixed a pre-existing gap while touching the movements header: Story 5.4's Site→Site Transfer entry point (`/movements/site-to-site/new`) was never linked from `/movements`'s header, unlike every other entry route — added it alongside this story's own "Record Consumption" link.
- Final state: `apps/api` 181 tests / 22 files passing, `apps/web` 179 tests / 49 files passing. Both packages typecheck, lint, and build clean.

### Review Findings

- [x] [Review][Patch] `ConsumptionService.create` never verified a correction's `siteId`/`materialSizeId` match the original Consumption being corrected — same class of gap already patched for Purchase (Story 5.1) and Movement (Story 5.4) [apps/api/src/inventory/consumption.service.ts:17] — fixed: `create()` now rejects a mismatched correction.
- [x] [Review][Patch] `createConsumptionAction`'s 400-fallback read `body.error?.message`, but Nest's default `BadRequestException` body has no `error` object — the real backend message was never surfaced, and no test exercised this path. Same bug already fixed for Purchase (Story 5.1) [apps/web/app/(app)/movements/consumption/actions.ts:41] — fixed: now reads `body.message`, wraps `fetch()` in try/catch, and guards `res.json()` with `.catch()`; test coverage added for all three cases.
- [x] [Review][Patch] `correctsId` schema field was `z.string().min(1)` instead of `z.uuid()`, inconsistent with every other id field — same pattern already fixed for Purchase/Movement [packages/shared/src/schemas/consumption.ts:15] — fixed.
- [x] [Review][Dismiss] "`inventory.module.ts`/`movements.service.ts` appear as entirely new files, can't verify nothing was dropped from Story 5.2/5.4" — diff-scoping artifact of Epic 5 being one squashed commit relative to the pre-epic baseline; every Epic 5 file appears "new" against that baseline. `stock-delta.ts`'s extraction (this story's own genuine new file, confirmed present in the diff and in the File List) is exactly what Dev Notes instructed.
- [x] [Review][Dismiss] `consumedAt` uses `z.iso.date()` instead of Task 1's literal `z.coerce.date()` — matches the same deliberate epic-wide date-only convention already dismissed twice under Stories 5.1/5.2 (native `<input type="date">`)
- [x] [Review][Defer] No pagination on `ConsumptionService.list()` / the combined Movements page — systemic, already logged under Story 5.1
- [x] [Review][Defer] Fetch failures bypass AD-6's shared error-state policy (raw `Error()`, no shared loading/error state) — systemic, already logged under Story 5.2
- [x] [Review][Defer] No visual lineage for corrections in the combined Movements table (`correctsId`/`reason` not surfaced) — real UX gap, but applies uniformly across all four row types, not specific to Consumption; a table-wide enhancement, not this story's scope
- [x] [Review][Defer] Every row's "Correct" link shares the identical accessible name across the table — real a11y concern (WCAG 2.4.4), but pre-existing since Story 5.1's shared `CorrectAction` component, not introduced by this story
- [x] [Review][Defer] `quantity: z.number()` has no finiteness/bounds check — enhancement, not specified by any AC
- [x] [Review][Defer] No indication when correcting a Consumption that is itself already a correction (correction chains) — enhancement, not specified by any AC
- [x] [Review][Dismiss] Sent/received mismatch signaled by color only, no `confirmedByUserId` on Movement's `confirmReceipt` — both belong to Movement's own code (Stories 5.2/5.4), out of this story's Consumption-only scope
- [x] [Review][Dismiss] `formatQuantity` lacks locale-aware thousands separators — cosmetic, already logged/dismissed under Story 5.1

### File List

- `apps/api/src/inventory/stock-delta.ts` (new — extracted floor-check helper)
- `apps/api/src/inventory/movements.service.ts` (modified — refactored to use the extracted helper)
- `apps/api/src/inventory/consumption.service.ts` (new)
- `apps/api/src/inventory/consumption.controller.ts` (new)
- `apps/api/src/inventory/consumption.controller.spec.ts` (new)
- `apps/api/src/inventory/consumption.service.spec.ts` (new)
- `apps/api/src/inventory/consumption.service.integration.spec.ts` (new)
- `apps/api/src/inventory/inventory.module.ts` (modified — registered `ConsumptionController`/`ConsumptionService`)
- `packages/shared/src/schemas/consumption.ts` (new)
- `packages/shared/src/index.ts` (modified — export)
- `apps/web/app/(app)/movements/page.tsx` (modified — merged Consumption rows, added missing Site→Site Transfer + new Record Consumption header links)
- `apps/web/app/(app)/movements/page.test.tsx` (modified)
- `apps/web/app/(app)/movements/consumption/actions.ts` (new)
- `apps/web/app/(app)/movements/consumption/actions.test.ts` (new)
- `apps/web/app/(app)/movements/consumption/consumption-form.tsx` (new)
- `apps/web/app/(app)/movements/consumption/consumption-form.test.tsx` (new)
- `apps/web/app/(app)/movements/consumption/new/page.tsx` (new)
- `apps/web/app/(app)/movements/consumption/new/page.test.tsx` (new)
- `apps/web/app/(app)/movements/consumption/[id]/correct/page.tsx` (new)
- `apps/web/app/(app)/movements/consumption/[id]/correct/page.test.tsx` (new)

## Change Log
- **2026-08-28 — two gaps closed:** (1) **DSR-embedded Consumption now decrements Site Stock.** This story's stock decrement only ran on the standalone `POST /consumption` path; Consumption rows created through Epic 3's DSR transaction never touched `SiteStock` (Epic 3 shipped before this story; nobody retrofitted it), silently violating FR-12/FR-14 for the primary field entry surface. `DsrService.create()` now applies the same floor-checked decrement via `applySiteStockDelta` (new sibling of `decrementStockWithFloorCheck` in `stock-delta.ts` — signed: positive delta = floor-checked decrement, negative = upsert give-back), delta-aware for AD-8 retried-sync upserts, and `correct()` reverses the superseded report's effect before charging the restated rows. Proven by live-Postgres tests (100 − 20 = 80; retry delta; correction reversal; insufficient-stock reject with no partial write). (2) **`recordedByUserId` is no longer a request-body field.** The schema comment's "apps/api has no request-scoped current-user resolution yet" was obsolete after Story 1.8 — the controller now threads `@CurrentUser().id` exactly like the DSR controller, and the "Recorded By User ID" text input was deleted from the consumption form. The form also shows current Site Stock for the selected Material and confirms corrections via `ConfirmDialog`.
