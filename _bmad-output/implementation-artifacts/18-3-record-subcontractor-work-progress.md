# Story 18.3: Record Subcontractor Work Progress

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Site Supervisor or Owner/Admin,
I want to log a quantity of work done today against an Active Site Contract — trips run, pipes laid, units installed — with a date and optional note,
so that work completed is tracked as it happens, in a form as quick as recording Consumption, without me needing to know or touch commercial terms.

## Acceptance Criteria

1. **Given** an Active Site Contract with a rate type of Per Trip, Per Pipe, Per Unit, or Custom, **when** I record a Work Entry (quantity, date, optional note), **then** the contract's cumulative quantity-completed figure increases by that quantity immediately. (FR-58)
2. **Given** a Site Contract with rate type Fixed Cost, **when** I try to record a Work Entry against it, **then** the action is rejected with a clear message — Fixed Cost contracts track completion via status only (Draft→Active→Completed), not a billable quantity; this is a deliberate product rule, not a missing feature.
3. **Given** a Site Contract that is Draft, Completed, or Cancelled, **when** I try to record a Work Entry against it, **then** the action is rejected — Work Entries only attach to an Active contract.
4. Work Entries are append-only: the row's "Correct" action opens a new reason-carrying entry linked to the original — never Edit/Delete (AD-9, FR-54).
5. **Given** a correction that would reduce cumulative quantity-completed below zero, **when** it's submitted, **then** it's rejected with inline helper text stating the current floor — not a rejected-form surprise after submission (same discipline as Advance Adjustment's balance-floor check, FR-23's pattern).
6. The entry form is reachable from the Site Contract detail page (Story 18.2's shell) with no Owner-only gate — a Site Supervisor can log work without navigating through any Owner-facing screen.

## Tasks / Subtasks

- [ ] Task 1 — Prisma model (AC: #1, #4)
  - [ ] Add to `infra/prisma/schema.prisma`:
    ```prisma
    model SubcontractorWorkEntry {
      id               String       @id @default(uuid(7))
      siteContractId   String
      siteContract     SiteContract @relation(fields: [siteContractId], references: [id])
      quantity         Decimal
      workDate         DateTime
      note             String?
      recordedByUserId String
      createdAt        DateTime     @default(now())
      correctsId       String?
      reason           String? // required when correctsId is set — same shape as Consumption/Movement's `reason`, not Advance's disambiguated `correctionReason`, since this model has no other business-meaning "reason" field to collide with.
    }
    ```
  - [ ] Run `pnpm db:generate`; author/verify the migration.
- [ ] Task 2 — Shared Zod schema (AC: #1, #4, #5)
  - [ ] Create `packages/shared/src/schemas/subcontractor-work-entry.ts` — `createSubcontractorWorkEntrySchema`, structured like `createAdvanceSchema` (a single-quantity delta on correction, not `Payment`'s full-restatement shape): `siteContractId: z.uuid()`, `quantity: z.number()`, `workDate: z.coerce.date()`, `note: z.string().max(500).optional()`, `correctsId: z.uuid().optional()`, `reason: z.string().min(1).max(500).optional()`. `.superRefine()`: if `correctsId` is set, `quantity` must be non-zero and `reason` required; else `quantity` must be positive. Export from `packages/shared/src/index.ts`.
- [ ] Task 3 — Floor-checked materialized quantity (AC: #1, #5)
  - [ ] Add `apps/api/src/subcontractors/quantity-completed.ts` (or a shared `common/` location if a third floor-checked balance shows up later — for now this is the second instance after `decrementOutstandingBalanceWithFloorCheck`, not yet a "systemic helper," so keep it local to this module, mirroring where `outstanding-balance.ts` itself lives inside `team/`, not `common/`): an `applyQuantityDelta(tx, siteContractId, delta, message?)` function using the exact `updateMany({ where: { id, quantityCompleted: { gte: -delta } }, data: { quantityCompleted: { increment: delta } } })` shape — a positive `delta` (new entry) always succeeds the `gte` check trivially (since `-delta` is negative and any stored value is `>= a negative number`); a negative `delta` (a reducing correction) is the case the floor check actually guards. `count === 0` throws a `BadRequestException` with a clear "cannot reduce completed quantity below zero" message. This is the same shape as `decrementOutstandingBalanceWithFloorCheck` and `decrementStockWithFloorCheck` — read both before writing this one, don't rederive the pattern from scratch.
- [ ] Task 4 — `apps/api`: `WorkEntriesController`/`Service` (AC: #1, #2, #3, #4, #5, #6)
  - [ ] Add `work-entries.controller.ts` + `.service.ts` to `apps/api/src/subcontractors/` (sibling of 18.1/18.2's controllers — update `SubcontractorsModule`).
  - [ ] Routes, **no `@Roles()` gate** on `POST` (AC #6 — Supervisor and Owner both write here, same as `ConsumptionController`/`MovementsController`):
    - `POST /subcontractor-work-entries`
    - `GET /subcontractor-work-entries?siteContractId=X` — the ledger for one contract, used by Story 18.5's detail-page section.
  - [ ] `WorkEntriesService.create`: load the target `SiteContract`; reject (400) if `status !== 'ACTIVE'` (AC #3) or `rateType === 'FIXED_COST'` (AC #2) — check `rateType` regardless of whether the request is a fresh entry or a correction, since a correction targets the same contract and the same rule applies; in one transaction, insert the `SubcontractorWorkEntry` row and call `applyQuantityDelta` (Task 3) with the signed `quantity` — both succeed or both roll back.
- [ ] Task 5 — Tests (AC: all)
  - [ ] Zod tests for the correction-delta superRefine shape.
  - [ ] `work-entries.service.spec.ts`: rejects on Draft/Completed/Cancelled contract, rejects on Fixed Cost contract, accepts on Active non-Fixed contract and increments `quantityCompleted`, a negative-delta correction that would drive `quantityCompleted` below zero is rejected with the floor message, a same-magnitude negative correction that stays at/above zero succeeds.
  - [ ] `work-entries.controller.spec.ts`: confirm `POST` carries no `@Roles()` metadata (a regression here would silently lock Supervisors out).
- [ ] Task 6 — `apps/web` UI (AC: #1, #4, #6)
  - [ ] `apps/web/app/(app)/sites/[id]/contracts/[contractId]/log-work/page.tsx` + `parse.ts` + `actions.ts` — a short form (quantity, date defaulting to today, optional note), reached via a "Log Work" button on the Site Contract detail page (Story 18.2's shell — Story 18.5 wires this button in alongside the ledger section it also adds; if 18.5 hasn't landed yet when this story ships, link the button directly from the minimal 18.2 shell instead of blocking on 18.5). If the target contract is Fixed Cost or not Active, do not render the "Log Work" action at all — client-side hiding backed by the server's real 400 rejection (AD-11's usual belt-and-braces: hide the affordance, but the server enforces regardless).
  - [ ] `.../work-entries/[entryId]/correct/page.tsx` — `CorrectAction`-driven correction form, reason field required (UX-DR17: reason field, never a confirmation dialog).
  - [ ] Quantity's unit label on this form should read from the contract's `rateUnitLabel`/`rateType` (e.g. "Quantity (trips)", "Quantity (bags)") rather than a bare unlabeled number input — small UX-DR20 accessibility/clarity win, not a separate field.

## Dev Notes

**This is the epic's one Supervisor-facing write surface** — everything else in Epic 18 (Subcontractor CRUD, Site Contract terms, Payments) is Owner/Admin-only. Keep this form genuinely simple: quantity + date + note, nothing else, matching the user's original request that Supervisor-facing UX stay "extremely simple." Resist any temptation to surface rate/pricing information on this form — a Supervisor logging work doesn't need to see or think about money.

**The floor-check on corrections is the one piece of real logic here** — everything else is a thin create/list pair. `decrementOutstandingBalanceWithFloorCheck` (`apps/api/src/team/outstanding-balance.ts`) and the equivalent stock floor-check (Story 5.2, referenced in its own comment) are the two existing instances of this exact `updateMany` + `count === 0` → reject shape; this story's `applyQuantityDelta` is the third. Read both before writing it — the pattern is small but easy to get subtly wrong (e.g. checking `gte: delta` instead of `gte: -delta` for a signed increment/decrement in one function).

**Why Fixed Cost contracts don't get Work Entries (AC #2):** the product has no BOQ/percent-complete concept anywhere (confirmed by Epic 2's mockup note: the Site "Activity Pulse" is DSR-recency-based, explicitly not a percent-complete bar, because there's no budget-of-work to measure against). A Fixed Cost Subcontractor engagement is billed as one lump sum regardless of measured quantity — there is nothing for a "quantity" field to mean. Its completion signal is simply the Site Contract's own status moving to Completed (Story 18.2). Don't invent a synthetic quantity/percentage for Fixed Cost contracts to make this story's UI more uniform — the rejection in AC #2 is the correct, intentional behavior.

**Architecture constraints in force:** AD-9 (append-only, `correctsId`/`reason`, materialized `quantityCompleted` updated only in the same transaction as the causing row), AD-7 (shared schema + `parse.ts`/`useClientValidation`), UX-DR7 (Correct action, never Edit/Delete on this row type), UX-DR17 (reason field, not a confirm dialog).

**Depends on Story 18.2** (needs an Active, non-Fixed-Cost `SiteContract` to attach to). **Independent of Story 18.4** (Payments) — the two ledgers don't interact with each other, only both interact with `SiteContract`'s separate materialized fields (`quantityCompleted` here, `amountPaid` there), so these two stories can be built in either order or in parallel once 18.2 is done.

### Project Structure Notes

- `work-entries.controller.ts`/`.service.ts` join `apps/api/src/subcontractors/` as siblings.
- `quantity-completed.ts` lives beside them in the same module (not `common/`) — same placement rule `outstanding-balance.ts` follows inside `team/`: a floor-check helper used by exactly one module's write paths doesn't need to be promoted to a shared location until a second module needs the identical shape.
- `apps/web/app/(app)/sites/[id]/contracts/[contractId]/log-work/` and `.../work-entries/[entryId]/correct/` are new sub-routes under Story 18.2's `contracts/[contractId]/` tree.

### References

- [Source: _bmad-output/specs/spec-AzentisFieldOS/functional-requirements.md#CAP-17 — Subcontractor Management] (FR-58)
- [Source: _bmad-output/planning-artifacts/epics/phase-9-subcontractor-management/epic-18-subcontractor-management.md]
- [Source: _bmad-output/implementation-artifacts/18-2-create-and-manage-site-contracts.md — prerequisite story, `SiteContract` model this attaches to]
- [Source: apps/api/src/team/outstanding-balance.ts — the floor-check helper shape this story's `applyQuantityDelta` replicates]
- [Source: packages/shared/src/schemas/advance.ts — the single-quantity correction-delta superRefine shape this story's schema replicates]
- [Source: _bmad-output/planning-artifacts/epics/phase-2-field-operations-core/epic-2-site-management.md — the "no BOQ/percent-complete" product rule Fixed Cost contracts' Work-Entry exclusion follows]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
