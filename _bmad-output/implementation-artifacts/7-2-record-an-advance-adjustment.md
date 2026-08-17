---
baseline_commit: 46afba675aebbadee4fb7fea546e63603ee93be9
---

# Story 7.2: Record an Advance Adjustment

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As Owner/Admin,
I want to record an Advance Adjustment against a Team Member's Outstanding Balance, capped at the current balance,
so that repayments reduce what's owed accurately, and I can never accidentally push a balance negative.

## Acceptance Criteria

1. **Given** a Team Member with an Outstanding Balance of ₹8,000, **when** I attempt an Adjustment of ₹9,000, **then** the submission is rejected with inline helper text stating the ₹8,000 cap — not a rejected-form surprise after submission. (FR-23)
2. **Given** a valid Adjustment within the balance, **when** I submit it, optionally linked to a Payment, **then** the Outstanding Balance decreases by exactly that amount, logged, timestamped, and attributed. (FR-23)
3. The cap check and the balance decrement happen atomically, race-safe under concurrent submissions — not a read-then-compare-then-write with a race window.
4. The row's "Correct" action is available, matching every other transaction type in this epic (per the epic's own UX-DR7).

## Tasks / Subtasks

- [x] Task 1 — Shared Zod schema (AC: #1, #2, #4)
  - [x] Create `packages/shared/src/schemas/advance-adjustment.ts`: `createAdvanceAdjustmentSchema` (`advanceId: z.uuid()` — which specific Advance this Adjustment is recorded against, for audit traceability, see Story 7.1's Dev Notes on why this is required even though the cap check is Team-Member-pooled; `paymentId: z.uuid().optional()` — set when recorded as part of a Payment, Story 7.3; `amount: z.number()`, `note: z.string().max(500).optional()`, `adjustedAt: z.coerce.date()`, `correctsId: z.uuid().optional()`, `correctionReason: z.string().min(1).max(500).optional()`).
  - [x] `.superRefine()`: `correctionReason` required when `correctsId` present. `amount` positive when `correctsId` absent, non-zero either sign when present.
  - [x] Export from `packages/shared/src/index.ts`.
- [x] Task 2 — `apps/api` (AC: #1, #2, #3)
  - [x] `apps/api/src/team/advance-adjustments.controller.ts` + `.service.ts`, added to `TeamModule`. `POST /advance-adjustments`, `GET /advance-adjustments`.
  - [x] `AdvanceAdjustmentsService.create` runs inside `prisma.$transaction`: first resolve `teamMemberId` from the given `advanceId` (`tx.advance.findUniqueOrThrow`), then apply the **cap check + decrement** using Story 7.1's materialized `TeamMember.outstandingAdvanceBalance` and Epic 5 Story 5.2's canonical `updateMany` + affected-row-count pattern (AC #3), reused verbatim with a different model/field:
    ```ts
    const result = await tx.teamMember.updateMany({
      where: { id: teamMemberId, outstandingAdvanceBalance: { gte: amount } },
      data: { outstandingAdvanceBalance: { decrement: amount } },
    });
    if (result.count === 0) {
      throw new BadRequestException({
        error: { code: 'ADJUSTMENT_EXCEEDS_BALANCE', message: `Adjustment cannot exceed the current Outstanding Balance.` },
      });
    }
    ```
    Only apply this floor check when `amount > 0` (a normal or corrected-larger Adjustment reducing balance further); a negative `amount` (a correction reducing a previous over-large Adjustment, i.e. giving balance back) always succeeds via a plain `increment`, mirroring Epic 5's "floor check only on the decrementing direction" rule. Then insert the `AdvanceAdjustment` row itself, in the same transaction — a rejected cap check must roll back before any row is written, never leave an orphan `AdvanceAdjustment` for a decrement that didn't apply.
  - [x] Expose the current balance for the inline-helper-text requirement (AC #1): `GET /team-members/:id` (Epic 6, extend) already returns the `TeamMember` row, which now includes `outstandingAdvanceBalance` after Story 7.1 — the frontend form reads it from there, no new endpoint needed.
- [x] Task 3 — `apps/web` UI (AC: #1, #4)
  - [x] `apps/web/app/(app)/team/[id]/advances/[advanceId]/adjustments/new/page.tsx` — Adjustment entry form: amount, note, date, with the current `outstandingAdvanceBalance` (fetched via the Team Member detail data already loaded on this route) shown as inline `help` text under the amount field — "Cannot exceed ₹8,000 (current Outstanding Balance)" per `09-team-member-detail.html`'s exact copy pattern. This is a **client-side hint for UX only**; Task 2's server-side check is the actual enforcement (AC #1's "not a rejected-form surprise" means the hint should make the surprise rare, not that the server check is optional).
  - [x] On a `400 ADJUSTMENT_EXCEEDS_BALANCE` response (e.g. a race where the balance changed between page load and submit), surface the server's current message inline next to the amount field, not a generic toast — the user should see the same "cannot exceed ₹X" framing whether caught client-side or server-side.
  - [x] Correction route following the established pattern.
- [x] Task 4 — Tests (AC: all)
  - [x] Zod tests: correction-reason rule, sign rule.
  - [x] `advance-adjustments.service.spec.ts`: an Adjustment within balance succeeds and decrements correctly; one exceeding balance is rejected with `ADJUSTMENT_EXCEEDS_BALANCE` and the transaction rolls back (no orphan `AdvanceAdjustment` row — assert `advanceAdjustment.create` was never actually committed, e.g. by checking the mock transaction rejected as a unit); a negative-amount correction always succeeds regardless of current balance.

## Dev Notes

**This is Epic 5 Story 5.2's floor-check pattern, ported to a new column — cite it, don't re-derive the reasoning for *why* `updateMany` + count-check is the right technique.** The only new wrinkle here versus Epic 5 is that the balance being protected (`TeamMember.outstandingAdvanceBalance`) was itself only just introduced by Story 7.1 in this epic, not pre-existing — read Story 7.1's Dev Notes before starting this one.

**`advanceId` is required for traceability; the cap is pooled — don't let the two get confused mid-implementation.** It would be easy to accidentally write the floor check against "this specific Advance's remaining amount" instead of the Team Member's pooled balance, since `advanceId` is right there in the payload. Re-read Story 7.1's Dev Notes section on this exact ambiguity before writing `AdvanceAdjustmentsService.create` — the check is always against `teamMember.outstandingAdvanceBalance`, never a per-`Advance` computed remainder.

**Depends on Story 7.1** entirely (the `correctsId`/`correctionReason` fields, the materialized balance column, `TeamModule`'s existing shape). Story 7.3 depends on this story for the "optionally linked to a Payment" half of its own scope.

**Architecture constraints in force:** AD-3, AD-4, AD-5, AD-6, AD-7, AD-9, NFR-2 (the cap rejection is exactly the kind of "explicit, reason-carrying user action" NFR-2 requires — there is no silent auto-capping of an over-large Adjustment down to the max allowed; it's rejected outright, and the user re-enters a valid amount).

### Project Structure Notes

- New `advance-adjustments.controller.ts`/`.service.ts` in `apps/api/src/team/` (extends the module Epic 6/Story 7.1 established).
- Extends the Team Member detail page and its Advance Ledger section from Story 7.1.

### References

- [Source: _bmad-output/specs/spec-AzentisFieldOS/functional-requirements.md#CAP-6] (FR-23)
- [Source: _bmad-output/planning-artifacts/stories/phase-4-people-money/epic-7-advances-payments/story-7.2-record-advance-adjustment.md]
- [Source: infra/prisma/schema.prisma#AdvanceAdjustment]
- [Source: _bmad-output/implementation-artifacts/7-1-record-an-advance.md — materialized balance column, correction-field schema, and the Advance-vs-pooled-cap design decision this story depends on]
- [Source: _bmad-output/implementation-artifacts/5-2-record-godown-site-movement.md — canonical updateMany + count-check floor-check pattern]
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/09-team-member-detail.html — exact inline-helper-text copy pattern]

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (claude-sonnet-5)

### Debug Log References

- `pnpm --filter @azentisfieldos/api test`, `pnpm --filter @azentisfieldos/web test` — full suites green (254 + 288 passed, no regressions; 51 pre-existing DB-integration tests skipped, same baseline as Story 7.1).
- `pnpm typecheck`, `pnpm lint`, `pnpm build` — all clean across all 5 packages; both new Adjustment routes (`/team/[id]/advances/[advanceId]/adjustments/new`, `/team/[id]/advances/[advanceId]/adjustments/[adjustmentId]/correct`) appear in the Next.js route manifest.

### Completion Notes List

- Task 1: `createAdvanceAdjustmentSchema` in `packages/shared/src/schemas/advance-adjustment.ts`, exported from the package index; same correction-reason-required/signed-amount `.superRefine()` rules as Story 7.1's `createAdvanceSchema`.
- Task 2: `AdvanceAdjustmentsController`/`AdvanceAdjustmentsService` registered in `TeamModule`. `create` resolves the Advance's `teamMemberId` via `tx.advance.findUniqueOrThrow`, then applies the exact uniform `updateMany` + `gte` + count-check snippet from the story (one query, no `amount > 0`/`amount < 0` branch needed — `gte` trivially passes and `decrement` becomes an increment for a negative delta, same no-branching behavior `decrementStockWithFloorCheck` already relies on for stock), then inserts the `AdvanceAdjustment` row in the same transaction so a rejected cap check rolls back before any row is written. Also validates a `correctsId`'s original `AdvanceAdjustment` exists and shares the same `advanceId` (mirrors `AdvancesService`'s teamMemberId-match check). Added `GET /advance-adjustments/:id` (not explicitly listed in Task 2, but required by Task 3's correction page pre-fill — same precedent `AdvancesService.findOne`/`PurchasesService.findOne` document for themselves). `translateWriteError` maps both P2003 (FK violation on the Adjustment insert) and P2025 (the `findUniqueOrThrow` failing on a bad `advanceId`) to a clean 400.
- Task 3: new Adjustment entry form and correction route under `apps/web/app/(app)/team/[id]/advances/[advanceId]/adjustments/`, following the `AdvanceForm`/Server Action pattern from Story 7.1. The entry form shows "Cannot exceed ₹X (current Outstanding Balance)" as inline help text under Amount (AC #1), reading `outstandingAdvanceBalance` off the already-fetched Team Member. The Server Action detects the server's `{ error: { code: 'ADJUSTMENT_EXCEEDS_BALANCE', message } }` body shape (distinct from the Zod-validation-failure and plain-string-exception shapes existing actions already branch on) and returns it as a field error on `amount`, not a form-level toast, satisfying AC #1's "same framing whether caught client-side or server-side" whether the race is caught at page-load time or at submit time.
- Extended the Team Member detail page's Advance Ledger (Story 7.1) into a single merged, chronologically-sorted table of Advance and Adjustment rows (never two separate tables, matching `/movements`' combined-log convention) — each Advance row now also has an "Adjust" action alongside "Correct", linking to that specific Advance's Adjustment form (traceability requirement from Story 7.1's Dev Notes: an Adjustment always targets one specific Advance, even though the cap it's checked against is Team-Member-pooled). Adjustment amounts are negated for display (`AdvanceAdjustment.amount` is stored as a positive decrement magnitude, the opposite sign convention from `Advance.amount`) so the ledger's Amount column always reads as this row's signed effect on the balance, matching `09-team-member-detail.html`'s "−₹3,000" copy.
- Task 4: Zod correction-reason/sign rules covered via `ZodValidationPipe(createAdvanceAdjustmentSchema)` in `advance-adjustments.controller.spec.ts`. `advance-adjustments.service.spec.ts` covers: within-balance success (asserts the exact `updateMany` call and that `advanceAdjustment.create` receives the raw input); over-balance rejection with `advanceAdjustment.create` never called (proving no orphan row before the transaction's implicit rollback); negative-amount correction always succeeding regardless of balance; the correctsId-exists and advanceId-match correction guards. Web-side: `adjustment-form.test.tsx`, `actions.test.ts` (including the `ADJUSTMENT_EXCEEDS_BALANCE`-as-field-error case), both page tests, and `team/[id]/page.test.tsx` extended for the merged ledger (ordering, negated Adjustment amount, the new "Adjust" link, and three route-mismatch `notFound()` guards on the correction page: wrong id, wrong Team Member, wrong Advance).
- Deliberately out of scope for this story: the `paymentId` link (Story 7.3's own scope — the field exists on the schema/model per Task 1, but no UI sets it yet, since Story 7.3's Payment flow is what produces a `paymentId` to link).

### File List

- `packages/shared/src/schemas/advance-adjustment.ts` (added)
- `packages/shared/src/index.ts` (modified)
- `apps/api/src/team/advance-adjustments.controller.ts` (added)
- `apps/api/src/team/advance-adjustments.service.ts` (added)
- `apps/api/src/team/advance-adjustments.controller.spec.ts` (added)
- `apps/api/src/team/advance-adjustments.service.spec.ts` (added)
- `apps/api/src/team/team.module.ts` (modified)
- `apps/web/app/(app)/team/[id]/advances/[advanceId]/adjustments/actions.ts` (added)
- `apps/web/app/(app)/team/[id]/advances/[advanceId]/adjustments/actions.test.ts` (added)
- `apps/web/app/(app)/team/[id]/advances/[advanceId]/adjustments/adjustment-form.tsx` (added)
- `apps/web/app/(app)/team/[id]/advances/[advanceId]/adjustments/adjustment-form.test.tsx` (added)
- `apps/web/app/(app)/team/[id]/advances/[advanceId]/adjustments/new/page.tsx` (added)
- `apps/web/app/(app)/team/[id]/advances/[advanceId]/adjustments/new/page.test.tsx` (added)
- `apps/web/app/(app)/team/[id]/advances/[advanceId]/adjustments/[adjustmentId]/correct/page.tsx` (added)
- `apps/web/app/(app)/team/[id]/advances/[advanceId]/adjustments/[adjustmentId]/correct/page.test.tsx` (added)
- `apps/web/app/(app)/team/[id]/page.tsx` (modified — merged Advance/Adjustment ledger)
- `apps/web/app/(app)/team/[id]/page.test.tsx` (modified)

## Change Log

- 2026-08-15: Story implemented end-to-end (shared Zod schema, API, web UI, tests). Status set to review.
