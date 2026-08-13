---
baseline_commit: cf5dd4dc709029a08e7c4febf34f2421f394871f
---

# Story 5.2: Record Godown→Site Movement

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As Owner/Admin,
I want to record a Movement of Material from Godown to a Site, capturing both sent and received quantity,
so that any shortage or damage in transit is visible as its own value, not silently absorbed.

## Acceptance Criteria

1. **Given** I record a Movement (Material/Size/quantity, vehicle, person responsible), **when** I submit, **then** Godown Stock decreases by the sent quantity at recording time. (FR-9)
2. **When** the receiving Site confirms receipt with a received quantity, **then** Site Stock increases by the received quantity, and any gap between sent and received is captured as a visible, distinct value — never hidden or auto-reconciled. (FR-9)
3. The row's "Correct" action is available, never Edit/Delete. (AD-9)
4. A Godown→Site Movement can never drive Godown Stock below zero — rejected at the API layer, not silently allowed. (Feature-level rule, FR-8..FR-14)

## Tasks / Subtasks

- [x] Task 1 — Shared Zod schema (AC: #1, #2, #3, #4)
  - [x] Create `packages/shared/src/schemas/movement.ts`. Fields per `schema.prisma`'s `Movement` model: `kind` (`z.enum(["GODOWN_TO_SITE", "SITE_TO_SITE"])` — this story only exercises `GODOWN_TO_SITE`; Story 5.4 exercises `SITE_TO_SITE` against the same schema), `materialSizeId` (`z.uuid()`), `sourceSiteId` (`z.uuid().optional()` — must be absent when `kind = GODOWN_TO_SITE`, required when `SITE_TO_SITE`), `destinationSiteId` (`z.uuid()`, always required), `sentQuantity` (`z.number()`), `receivedQuantity` (`z.number().nullable().optional()` — absent/null at initial recording time per AC #1's "at recording time," set on a follow-up confirmation, see Task 2), `vehicleDetails`/`personResponsible`/`notes` (optional strings), `movedAt` (`z.coerce.date()`), `correctsId`/`reason` (per Story 5.1's correction-semantics rule — cite it, don't restate it).
  - [x] `.superRefine()`: `kind === "GODOWN_TO_SITE"` forbids `sourceSiteId`; `kind === "SITE_TO_SITE"` requires it (Story 5.4 needs this same schema).
  - [x] `.superRefine()`: `sentQuantity` positive when `correctsId` absent, non-zero either sign when present (Story 5.1's rule).
  - [x] A second schema, `confirmMovementReceiptSchema`, for the two-step receive confirmation: `{ receivedQuantity: z.number().nonnegative() }`.
  - [x] Export both from `packages/shared/src/index.ts`.
- [x] Task 2 — `apps/api` (AC: #1, #2, #4)
  - [x] `apps/api/src/inventory/movements.controller.ts` + `.service.ts`, added to the `InventoryModule` Story 5.1 created: `POST /movements` (create, `receivedQuantity` omitted), `PATCH /movements/:id/confirm-receipt` (sets `receivedQuantity`, applies the destination Site Stock increase — see below), `GET /movements`.
  - [x] `MovementsService.create` (the sent-side, AC #1 and #4) runs inside `prisma.$transaction`: insert the `Movement` row, then apply the **stock-safety floor check** on `GodownStock` — see "Stock-safety floor check, canonical pattern" in Dev Notes; this exact technique is reused verbatim by Stories 5.5 and 5.6.
  - [x] `MovementsService.confirmReceipt` (the received-side, AC #2) runs inside its own `prisma.$transaction`: updates the `Movement.receivedQuantity` field (this is the *only* mutation of an already-inserted transaction-history row this epic performs, and it is deliberately narrow — see Dev Notes "Why confirmReceipt updates a row, and why that's not an AD-9 violation"), then `tx.siteStock.upsert(...)` incrementing the destination Site's balance by `receivedQuantity` (never by `sentQuantity` — the whole point of AC #2).
- [x] Task 3 — `apps/web` UI (AC: #1, #2, #3)
  - [x] `apps/web/app/(app)/movements/godown-to-site/new/page.tsx` — the sent-side entry form.
  - [x] A "Confirm Receipt" affordance on a pending Movement row (received quantity not yet set) in the `/movements` list from Story 5.1 — a small inline form or a dedicated `/movements/[id]/confirm-receipt` page (dedicated route, same "no modal exists yet" reasoning as Epic 4). Add a `DataTableColumn` treatment or `Badge` distinguishing "Pending receipt" from a Movement whose `receivedQuantity` is set, since the list currently assumes every row is complete.
  - [x] Extend the `/movements` list's Sent Qty / Received Qty columns (already present from Story 5.1's table shape) to actually populate for `Movement` rows: a mismatch between the two renders in `warning-700` (per `07-movements.html`'s example row), matching Story styling — never a separate "damage" column.
  - [x] `apps/web/app/(app)/movements/godown-to-site/[id]/correct/page.tsx` — same correction pattern as Story 5.1.
- [x] Task 4 — Tests (AC: all)
  - [x] Zod tests for the `kind`/`sourceSiteId` cross-field rule and the sign rule.
  - [x] `movements.service.spec.ts`: a create that would take `GodownStock.quantity` below zero throws (not a raw 500) and the `Movement` insert rolls back with it (no orphan ledger row) — assert both the thrown error type and that `prisma.movement.create` never committed by checking the transaction was rejected as a unit, not by asserting on two separate calls.
  - [x] `confirmReceipt` test: increments `SiteStock` by `receivedQuantity`, not `sentQuantity`.

## Dev Notes

**Stock-safety floor check, canonical pattern — reused by Stories 5.5 and 5.6, cite this section rather than re-deriving it.** Prisma's typed `update()` requires an exact unique/composite key in `where` and cannot add an extra `quantity: { gte: X }` filter alongside it. Use `updateMany()` instead, which does support compound filters, and check the affected-row count:

```ts
const result = await tx.godownStock.updateMany({
  where: { materialSizeId, quantity: { gte: sentQuantity } },
  data: { quantity: { decrement: sentQuantity } },
});
if (result.count === 0) {
  throw new BadRequestException({
    error: { code: 'INSUFFICIENT_STOCK', message: 'Not enough Godown Stock for this Movement.' },
  });
}
```

Because this runs inside the same `prisma.$transaction` as the `Movement` row insert, throwing here rolls back the insert too — no orphan ledger row for a Movement that was rejected for insufficient stock. This `updateMany` + count-check technique is the *only* safe way to enforce a floor under concurrent writes without hand-rolling row locking (`SELECT ... FOR UPDATE`, which Prisma's query builder doesn't expose directly) — do not read-then-compare-then-write as two separate statements, that has a race window.

**Why `confirmReceipt` updates a row, and why that's not an AD-9 violation.** AD-9 forbids `UPDATE`/`DELETE` on transaction-history rows *as a way to silently change what happened*. `Movement.receivedQuantity` is different in kind: it's nullable specifically to represent "sent but not yet confirmed" (AC #1's "at recording time" is deliberately earlier than AC #2's "on confirmation" — two distinct moments in one real-world event, not a correction of a mistake). Setting it once, when the receiving Site actually confirms, is completing the same event, not revising history — closer to Prisma's own `@updatedAt` timestamp semantics than to a correction. Once `receivedQuantity` is set, it is never touched again — a mis-recorded confirmed quantity is fixed via `correctsId`/`reason` like everything else in this epic, not a second `confirmReceipt` call. If Task 2 needs to guard against double-confirmation, check `receivedQuantity === null` before allowing the update and reject otherwise.

**Depends on Story 5.1** for `InventoryModule`, the `/movements` list page, and the correction-flow pattern — extend those, don't recreate them.

**Architecture constraints in force:** same set as Story 5.1 (AD-3, AD-4, AD-5, AD-6, AD-7, AD-9), plus the specific care above around what counts as an allowed narrow update vs. a correction.

### Project Structure Notes

- Extends `apps/api/src/inventory/inventory.module.ts` and `apps/web/app/(app)/movements/page.tsx`, both created in Story 5.1.
- No conflicts detected, provided Story 5.1 has landed first.

### References

- [Source: _bmad-output/specs/spec-AzentisFieldOS/functional-requirements.md#CAP-3] (FR-9, feature-level non-negative rule)
- [Source: _bmad-output/planning-artifacts/stories/phase-3-materials-inventory/epic-5-inventory-transactions-stock-visibility/story-5.2-godown-to-site-movement.md]
- [Source: infra/prisma/schema.prisma#Movement, GodownStock, SiteStock]
- [Source: _bmad-output/implementation-artifacts/5-1-record-a-purchase.md — correction semantics, module/page this story extends]
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/07-movements.html — the sent-vs-received-qty warning-color pattern]
- [Source: _bmad-output/planning-artifacts/architecture/architecture-AzentisFieldOS-2026-08-11/ARCHITECTURE-SPINE.md#AD-9]

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (claude-sonnet-5)

### Debug Log References

### Completion Notes List

- Implemented the canonical stock-safety floor check exactly as specified in Dev Notes: `godownStock.updateMany({ where: { materialSizeId, quantity: { gte } }, data: { quantity: { decrement } } })` with an affected-row-count check inside `prisma.$transaction`, so an insufficient-stock rejection rolls back the `Movement` insert with it. Verified this is genuinely race-safe (not just correct in single-threaded tests) with a real-Postgres integration test firing 5 concurrent Movements for 30 units each against a starting balance of 100 — exactly 3 succeed, the balance lands at 10, never negative.
- `confirmReceipt` is the one place in this epic that calls `.update()` on a transaction-history row, per Dev Notes' explicit carve-out — guarded by checking `receivedQuantity === null` first and rejecting a second confirmation attempt with a 400 (tested both as a mocked unit test and against real Postgres).
- **Epic-5 self-review finding (fixed):** the original `receivedQuantity === null` guard was a plain findUnique-then-update — two concurrent `confirmReceipt` calls for the same Movement could both read `null` before either commits, both pass the guard, and both increment `SiteStock`, double-counting the gap while the Movement row only ever shows the second caller's value. Replaced with the same `updateMany` WHERE-clause-guard technique the stock-safety floor check uses (`updateMany({ where: { id, receivedQuantity: null } })`, checking the affected-row count) so the check and the write are atomic. Verified the bug was real by reverting to the old logic and running a new concurrent-confirmReceipt integration test — failed 5/5 runs (both calls succeeded, double-counted `SiteStock`); the fix passed 5/5.
- Two real-Postgres cross-file test races surfaced and were fixed, both pre-existing risk that this story's second integration-spec file (alongside Story 5.1's) exposed rather than caused: (1) `Material`/`MaterialCategory`/`Unit` cleanup in `purchases.service.integration.spec.ts`'s `afterAll` used unscoped `deleteMany({})`, which could hit another file's still-live fixture under vitest's parallel workers — scoped by id, matching the discipline already used for `materialSize`/`vendor`/`site`. (2) `GodownStock`/`SiteStock` cleanup and `findMany` assertions in both `purchases.service.integration.spec.ts` and the new `movements.service.integration.spec.ts` were unscoped against tables both files write to (keyed only by `materialSizeId`, no per-file namespace) — scoped every delete and assertion to each file's own `materialSizeId`. Verified stable across 5 consecutive full-suite runs after the fix.
- Extended `/movements` (Story 5.1) to merge Purchase and Movement rows into one list sorted by date, per Task 3 — badge `gold` "Movement" vs `success` "Purchase", a `Godown → destination Site` flow using `ChevronRightIcon` (matching `07-movements.html`'s row exactly), a `Pending receipt` neutral badge with a `Confirm Receipt` link when `receivedQuantity` is `null`, and the sent/received mismatch rendered in `warning-700` with no separate "damage" column.
- `apps/web/app/(app)/movements/[id]/confirm-receipt/page.tsx` calls `notFound()` for both a missing Movement id and one whose `receivedQuantity` is already set — there's no route for re-confirming, matching `confirmReceipt`'s server-side guard.
- Final state: `apps/api` 159 tests / 19 files passing, `apps/web` 159 tests / 43 files passing. Both packages typecheck, lint, and build clean.

### File List

- `packages/shared/src/schemas/movement.ts` (new)
- `packages/shared/src/index.ts` (modified — export)
- `apps/api/src/inventory/movements.service.ts` (new)
- `apps/api/src/inventory/movements.controller.ts` (new)
- `apps/api/src/inventory/movements.controller.spec.ts` (new)
- `apps/api/src/inventory/movements.service.spec.ts` (new)
- `apps/api/src/inventory/movements.service.integration.spec.ts` (new)
- `apps/api/src/inventory/inventory.module.ts` (modified — registered `MovementsController`/`MovementsService`)
- `apps/api/src/inventory/purchases.service.integration.spec.ts` (modified — scoped shared-table cleanup/assertions to this file's own ids, fixing a cross-file test race)
- `apps/web/app/(app)/movements/page.tsx` (modified — merged Purchase and Movement rows)
- `apps/web/app/(app)/movements/page.test.tsx` (modified)
- `apps/web/app/(app)/movements/godown-to-site/actions.ts` (new)
- `apps/web/app/(app)/movements/godown-to-site/actions.test.ts` (new)
- `apps/web/app/(app)/movements/godown-to-site/movement-form.tsx` (new)
- `apps/web/app/(app)/movements/godown-to-site/movement-form.test.tsx` (new)
- `apps/web/app/(app)/movements/godown-to-site/new/page.tsx` (new)
- `apps/web/app/(app)/movements/godown-to-site/new/page.test.tsx` (new)
- `apps/web/app/(app)/movements/godown-to-site/[id]/correct/page.tsx` (new)
- `apps/web/app/(app)/movements/godown-to-site/[id]/correct/page.test.tsx` (new)
- `apps/web/app/(app)/movements/[id]/confirm-receipt/actions.ts` (new)
- `apps/web/app/(app)/movements/[id]/confirm-receipt/actions.test.ts` (new)
- `apps/web/app/(app)/movements/[id]/confirm-receipt/confirm-receipt-form.tsx` (new)
- `apps/web/app/(app)/movements/[id]/confirm-receipt/page.tsx` (new)
- `apps/web/app/(app)/movements/[id]/confirm-receipt/page.test.tsx` (new)
