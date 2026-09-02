# Story 18.4: Record Subcontractor Payments & Advances

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As Owner/Admin,
I want to record a Payment or Advance made to a Subcontractor against a Site Contract — amount, date, payment method, optional note,
so that money paid out is tracked immediately, and I always know what's been paid against what's owed.

## Acceptance Criteria

1. **Given** a Site Contract, **when** I record a Subcontractor Payment (type Advance or Payment, amount, date, payment method, optional note), **then** the contract's cumulative amount-paid figure increases by that amount immediately — no approval step (FR-59, mirroring FR-22's Advance's "no approval step" rule for the same reason: NFR-3, no workflow/hierarchy anywhere in this product).
2. **Given** the amount currently payable on a Site Contract, **when** I record a Payment or Advance that exceeds it, **then** the submission is accepted, not rejected — a Subcontractor advance paid ahead of completed work is a normal, legitimate business case, unlike a Team Member's Advance Adjustment (FR-23), which *is* capped. Do not port that cap here.
3. Subcontractor Payments are append-only: the row's "Correct" action opens a new reason-carrying entry linked to the original — never Edit/Delete (AD-9, FR-54).
4. **Given** a correction that would reduce cumulative amount-paid below zero, **when** it's submitted, **then** it's rejected with inline helper text — the one floor this story does enforce (a paid amount can never go negative, even though it can exceed payable).
5. Recording a Payment/Advance is Owner/Admin only — this is a money-movement action, gated the same way `DELETE /vendors/:id` and every write on `SiteContractsController` (Story 18.2) are gated.
6. The `type` (Advance vs Payment) is a display/reporting label only — both contribute identically to the same cumulative amount-paid figure; there is no separate Adjustment step netting one against the other (unlike Team Member's three-entity Advance/AdvanceAdjustment/Payment ledger) — a deliberate simplification, not a missing feature.

## Tasks / Subtasks

- [ ] Task 1 — Prisma model (AC: #1, #3, #6)
  - [ ] Add to `infra/prisma/schema.prisma`:
    ```prisma
    model SubcontractorPayment {
      id               String       @id @default(uuid(7))
      siteContractId   String
      siteContract     SiteContract @relation(fields: [siteContractId], references: [id])
      // ADVANCE | PAYMENT — plain String, Zod-enforced (same convention as
      // Purchase.paymentStatus/SiteContract.rateType), a display/reporting
      // label only per AC #6, not a different ledger effect.
      type             String
      amount           Decimal
      paymentMethod    String?
      paidAt           DateTime
      note             String?
      recordedByUserId String
      createdAt        DateTime     @default(now())
      correctsId       String?
      reason           String? // required when correctsId is set
    }
    ```
  - [ ] Run `pnpm db:generate`; author/verify the migration.
- [ ] Task 2 — Shared Zod schema (AC: #1, #3, #4)
  - [ ] Create `packages/shared/src/schemas/subcontractor-payment.ts` — `subcontractorPaymentTypeSchema = z.enum(["ADVANCE", "PAYMENT"])`; `createSubcontractorPaymentSchema`: `siteContractId: z.uuid()`, `type: subcontractorPaymentTypeSchema`, `amount: z.number()`, `paymentMethod: z.string().max(100).optional()`, `paidAt: z.coerce.date()`, `note: z.string().max(500).optional()`, `correctsId: z.uuid().optional()`, `reason: z.string().min(1).max(500).optional()`. Same single-quantity correction-delta `.superRefine()` shape as `createAdvanceSchema`/Story 18.3's work-entry schema (non-zero delta + reason on correction; positive amount otherwise). Export from `packages/shared/src/index.ts`.
- [ ] Task 3 — Floor-checked materialized amount (AC: #1, #4)
  - [ ] Add `apps/api/src/subcontractors/amount-paid.ts` — `applyAmountPaidDelta(tx, siteContractId, delta, message?)`, identical shape to Story 18.3's `applyQuantityDelta` (`updateMany({ where: { id, amountPaid: { gte: -delta } }, data: { amountPaid: { increment: delta } } })`, `count === 0` throws). **Do not reuse `decrementOutstandingBalanceWithFloorCheck`** directly — it's typed against `TeamMember`, not `SiteContract`, and this story's floor is 0, not a Team Member's Outstanding Balance; write the equivalent function for this model rather than trying to generalize the existing one into two callers' worth of abstraction for its own sake (no premature abstraction — two near-identical three-line functions in different modules is fine here, the same way Story 18.3's floor-check is its own function rather than a shared generic).
- [ ] Task 4 — `apps/api`: `PaymentsController`/`Service` (AC: #1, #2, #3, #4, #5)
  - [ ] Add `payments.controller.ts` + `.service.ts` to `apps/api/src/subcontractors/`. **Name collision warning:** `apps/api/src/team/payments.controller.ts`/`.service.ts` already exist for Team Member payments — do not let import paths or class names collide; use `SubcontractorPaymentsController`/`Service` as the class names (even though the file lives at `payments.controller.ts` within its own module directory, matching `team/payments.controller.ts`'s file-naming-is-directory-scoped convention) to keep imports unambiguous at call sites.
  - [ ] Routes, `@Roles('OWNER_ADMIN')` on the whole controller (AC #5):
    - `POST /subcontractor-payments`
    - `GET /subcontractor-payments?siteContractId=X` — the ledger for one contract, used by Story 18.5's detail-page section (this one read-heavy route can stay open to both roles like every other list endpoint in the product, but keeping the controller-level guard simple by gating the whole thing is fine too — Owner/Admin is the only role with any reason to view a Subcontractor's payment ledger, since Story 18.3's Supervisor-facing surface never links to it).
  - [ ] `SubcontractorPaymentsService.create`: load the target `SiteContract`, reject (400) if it doesn't exist or its parent is soft-deleted; in one transaction, insert the `SubcontractorPayment` row and call `applyAmountPaidDelta` with the signed `amount` — no other business-rule check (AC #2 — no payable cap).
- [ ] Task 5 — Tests (AC: all)
  - [ ] Zod tests for the correction-delta shape and the `type` enum.
  - [ ] `payments.service.spec.ts`: a Payment/Advance exceeding the contract's current payable succeeds (proves AC #2 — write a test that deliberately exercises the "no cap" case, not just the happy path, so a future refactor that accidentally reintroduces a cap fails loudly); a negative-delta correction that would drive `amountPaid` below zero is rejected.
  - [ ] `payments.controller.spec.ts`: `@Roles(['OWNER_ADMIN'])` metadata on every handler.
- [ ] Task 6 — `apps/web` UI (AC: #1, #3, #5)
  - [ ] `apps/web/app/(app)/sites/[id]/contracts/[contractId]/record-payment/page.tsx` + `parse.ts` + `actions.ts` — form fields: type (Advance/Payment radio or select), amount, date, payment method, note. Reached via a "Record Payment" button on the Site Contract detail page, visible only when `viewerRole === "OWNER_ADMIN"` (client-side hiding; server enforces regardless, same belt-and-braces pattern as every other Owner-only action in the product).
  - [ ] `.../payments/[paymentId]/correct/page.tsx` — `CorrectAction`-driven correction form, reason required.
  - [ ] If the amount entered exceeds the contract's currently-computed payable, show a plain informational note ("This exceeds the current amount payable — recorded as an advance against future work"), never a blocking validation error (AC #2) — this is the one place in the form where the UI should visibly acknowledge the "no cap" rule rather than silently accepting it with no feedback at all.

## Dev Notes

**Why this is simpler than Team Member's Advance/AdvanceAdjustment/Payment triad, deliberately:** that three-entity shape exists because a Team Member's Advance is *recoverable* — it's a debt against future wages, settled via an explicit, capped Adjustment step tied to a specific Payment (FR-23). A Subcontractor Payment or Advance has no such recovery mechanism in this product's scope — it's simply money paid out against a contract's payable, full stop. Building the same three-entity machinery here would be over-engineering against a requirement that was never asked for (re-read FR-59: "amount payable, amount already paid, outstanding amount" — a single running total, not a recoverable-balance concept). If a future need for Subcontractor advance recovery emerges, that's new scope for a later story, not something to speculatively build now.

**The `type` field is genuinely just a label (AC #6) — verify this assumption doesn't quietly drift during implementation.** It would be easy to accidentally start treating `ADVANCE` rows differently in a report or a filter "because that's what Advance means everywhere else in this codebase" (i.e. subconsciously importing Team Member's semantics). Both `type` values must behave identically everywhere in this story — the only thing `type` should ever drive is a badge label or a filter dropdown in the ledger UI (Story 18.5).

**Reused pattern, not reused code:** the floor-check *shape* (Task 3) is identical to Story 18.3's and to `outstanding-balance.ts`, but each is its own small function typed against its own model — see Task 3's explicit note on why generalizing three call sites (two different models, two different floors) into one shared helper isn't worth the indirection yet. If a fourth floor-checked materialized field shows up in a future epic, that's the point to reconsider.

**Architecture constraints in force:** AD-9 (append-only, materialized `amountPaid` updated only in the same transaction as the causing row), AD-7 (shared schema), AD-11 (`@Roles('OWNER_ADMIN')` on the whole controller), NFR-3 (no approval step, matching FR-22's Advance).

**Depends on Story 18.2** (needs a `SiteContract` to attach to — unlike Story 18.3, this one has no rate-type or status restriction: a Payment/Advance can be recorded against a contract in any status, including Draft, since paying an advance before terms are finalized is realistic). **Independent of Story 18.3** — see that story's Dev Notes on build ordering.

### Project Structure Notes

- `payments.controller.ts`/`.service.ts` join `apps/api/src/subcontractors/` — mind the class-name collision with `apps/api/src/team/payments.controller.ts`/`.service.ts` (Task 4's note); the two modules' files share a filename but live in different directories, which is fine for the file system but not for two classes both literally named `PaymentsController` imported into the same `app.module.ts`.
- `apps/web/app/(app)/sites/[id]/contracts/[contractId]/record-payment/` and `.../payments/[paymentId]/correct/` are new sub-routes under Story 18.2's `contracts/[contractId]/` tree, siblings of Story 18.3's `log-work/`.

### References

- [Source: _bmad-output/specs/spec-AzentisFieldOS/functional-requirements.md#CAP-17 — Subcontractor Management] (FR-59)
- [Source: _bmad-output/planning-artifacts/epics/phase-9-subcontractor-management/epic-18-subcontractor-management.md]
- [Source: _bmad-output/implementation-artifacts/18-2-create-and-manage-site-contracts.md — prerequisite story]
- [Source: _bmad-output/implementation-artifacts/18-3-record-subcontractor-work-progress.md — sibling story, same floor-check shape, explains build-order independence]
- [Source: packages/shared/src/schemas/advance.ts, payment.ts — read both to confirm why this story's schema follows Advance's delta shape, not Payment's full-restatement shape]
- [Source: apps/api/src/team/outstanding-balance.ts — the floor-check pattern this story's `applyAmountPaidDelta` replicates (as its own function, not a shared import — see Task 3)]
- [Source: apps/api/src/team/payments.controller.ts — the existing `PaymentsController` this story's class naming must not collide with]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
