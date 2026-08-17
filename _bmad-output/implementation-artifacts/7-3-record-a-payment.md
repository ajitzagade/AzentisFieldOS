---
baseline_commit: d213ce16424f777bd790ee6bbec5c5f6aa54e6c7
---

# Story 7.3: Record a Payment

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As Owner/Admin,
I want to record a Payment (Base Pay + Additional − Actual Deductions − Advance Adjustment = Net Payable),
so that what a Team Member is actually paid is calculated correctly and kept as permanent history.

## Acceptance Criteria

1. **Given** Base Pay, Additional, Deductions, and an optional Advance Adjustment, **when** I record a Payment, **then** Net Payable computes automatically as Base + Additional − Deductions − Adjustment, and the full breakdown is retained, never overwritten. (FR-24)
2. The row's "Correct" action is available, never Edit/Delete.
3. Omitting an Advance Adjustment on a Payment is valid, no warning — a Payment does not require a linked Adjustment. (FR-24, functional-requirements.md's explicit "no warning" clause)
4. A Payment recorded with an Advance Adjustment applies the exact same FR-23 cap check Story 7.2 built for a standalone Adjustment — there is no separate, looser path to reduce Outstanding Balance via a Payment.
5. A Payment's `status` starts `pending` and can transition once to `paid` (with `paidAt` set) — a narrow, one-directional lifecycle completion, not a correction, and not reversible back to `pending`.

## Tasks / Subtasks

- [x] Task 1 — Schema addition (AC: #1)
  - [x] `Payment` has no field for the mockup's "Period" column (`10-payments.html`) and FR-24 doesn't name one explicitly either, but a Payment with no pay-period context is hard to read in a history list ("₹18,500 to Ramesh" — for which week?). Add `payPeriod String?` (free text, e.g. "1–15 Aug 2026" — not a structured date range; no FR requires a calendar-computed period, don't build one) to `Payment`. Run `pnpm db:generate`.
- [x] Task 2 — Shared Zod schema (AC: #1, #2, #3, #5)
  - [x] Create `packages/shared/src/schemas/payment.ts`: `createPaymentSchema` (`teamMemberId: z.uuid()`, `basePay: z.number().nonnegative()`, `additionalAmount: z.number().nonnegative().default(0)`, `deductions: z.number().nonnegative().default(0)`, `payPeriod: z.string().max(100).optional()`, `advanceAdjustment: z.object({ advanceId: z.uuid(), amount: z.number().positive(), note: z.string().max(500).optional() }).optional()` — the optional linked-Adjustment sub-object, AC #3/#4; `correctsId: z.uuid().optional()`, `reason: z.string().min(1).max(500).optional()`).
  - [x] `netPayable` is **not** a client-supplied field — it's always server-computed (`basePay + additionalAmount - deductions - (advanceAdjustment?.amount ?? 0)`) inside the service, never trusted from the request body. Do not add `netPayable` to the create schema.
  - [x] `.superRefine()`: `reason` required when `correctsId` present. `basePay`/`additionalAmount`/`deductions` non-negative always (these aren't the delta-correction quantity — see Dev Notes "What 'correction' means for a Payment, and why it's not the same shape as Purchase/Advance").
  - [x] A separate `markPaymentPaidSchema` — empty body, the `PATCH /payments/:id/mark-paid` endpoint takes no input beyond the id.
  - [x] Export from `packages/shared/src/index.ts`.
- [x] Task 3 — `apps/api` (AC: #1, #2, #4, #5)
  - [x] `apps/api/src/team/payments.controller.ts` + `.service.ts`, added to `TeamModule`. `POST /payments`, `GET /payments`, `PATCH /payments/:id/mark-paid`.
  - [x] `PaymentsService.create` runs inside one `prisma.$transaction`: compute `netPayable` server-side; insert the `Payment` row (`status: 'pending'`, `paidAt: null`); if `advanceAdjustment` is present, apply Story 7.2's exact cap-check-and-decrement logic against `TeamMember.outstandingAdvanceBalance`, then insert the `AdvanceAdjustment` row with `paymentId` set to the new Payment's id — reuse `AdvanceAdjustmentsService`'s logic (call it, or extract its transactional core into a shared function both controllers call) rather than copy-pasting the `updateMany` block a third time in this epic.
  - [x] `PaymentsService.markPaid`: `updateMany({ where: { id, status: 'pending' }, data: { status: 'paid', paidAt: new Date() } })`, checking `count === 1` — rejects (404 or 409) if the Payment doesn't exist or is already `paid`, preventing a double-transition. This mirrors Epic 5 Story 5.2's `confirmReceipt` reasoning exactly: completing a two-step lifecycle event is not the same operation as correcting a mistake, so it's allowed as a narrow, guarded update rather than routed through `correctsId`.
- [x] Task 4 — `apps/web` UI (AC: #1, #3, #5)
  - [x] Replace the stub `apps/web/app/(app)/payments/page.tsx` with the real Payments list: stat tiles (Total Paid This Month, Pending Payments count, Total Outstanding Advances — the last one is Story 7.1/7.4's materialized-balance rollup, reused here) and a `DataTable` with columns Team Member / Period / Base Pay / Additional / Deductions / Advance Adjustment / Net Payable / Status / row actions, matching `10-payments.html`.
  - [x] `apps/web/app/(app)/payments/new/page.tsx` — entry form: Team Member, Base Pay, Additional, Deductions, Period, and an optional "Advance Adjustment" sub-section (checkbox or toggle to include one; when included, an Advance picker + amount, with the same inline balance-cap helper text Story 7.2 built). Net Payable is computed and displayed live client-side as the user types (mirroring the server calculation — AC #1's "computes automatically"), but the actual persisted value always comes from the server response, never trusted from client math.
  - [x] A "Mark Paid" action on a `pending` row (icon or small secondary button, distinct from the `CorrectAction` icon-only ghost button — this is a status transition, not a correction, and must not be visually confused with one per this epic's own AD-9 discipline).
  - [x] Correction route following the established pattern.
- [x] Task 5 — Tests (AC: all)
  - [x] Zod tests: `netPayable` is never accepted as input (if present in a raw payload it's ignored, not validated — confirm the parsed output type has no such key); required-reason-on-correction rule.
  - [x] `payments.service.spec.ts`: `netPayable` computed correctly across a matrix of base/additional/deductions/adjustment combinations, including zero-adjustment (AC #3); a Payment with an over-cap Adjustment is rejected and neither the `Payment` nor the `AdvanceAdjustment` row persists (whole-transaction rollback); `markPaid` transitions `pending`→`paid` once and rejects a second call.

## Dev Notes

**What "correction" means for a Payment, and why it's not the same shape as Purchase/Advance.** Every other append-only model in this project uses a single signed `amount`/`quantity` delta for its correction semantics (Epic 5 Story 5.1's canonical rule). `Payment` doesn't have one quantity — it has four inputs (`basePay`, `additionalAmount`, `deductions`, and an optional linked Adjustment amount) that together produce `netPayable`. A "correcting" Payment is therefore a **complete new Payment row** with `correctsId` set and the full, correct set of inputs re-entered — not a delta applied to the original's fields. This is a deliberate divergence from the delta pattern, not an inconsistency: `netPayable`'s formula only makes sense evaluated against a complete input set, and trying to express "correct the deductions by −₹500" as a delta against a four-input formula would be genuinely ambiguous in a way a single-quantity delta never is. Document this choice inline in the Zod schema's comments so a future reader doesn't assume Payment corrections work like Purchase corrections.

**Reuse Story 7.2's cap-check-and-decrement logic, don't duplicate the `updateMany` block a third time this epic.** By this story, the same materialized-balance floor check is needed in three places (`AdvanceAdjustmentsService.create`, and here). Extract it once — either `AdvanceAdjustmentsService` exposes a method `PaymentsService` calls within its own transaction (pass the `tx` client through), or both live off a small shared helper in `apps/api/src/team/outstanding-balance.ts`. Either is fine; three inline copies of the same `updateMany`/count-check block is the signal to stop, per the same reasoning Epic 5's stories applied to their own floor check.

**`status`/`paidAt` narrow-update reasoning is identical to Epic 5 Story 5.2's `confirmReceipt`.** Re-read that story's Dev Notes section "Why `confirmReceipt` updates a row, and why that's not an AD-9 violation" — the same argument applies here verbatim, just with `pending`→`paid` instead of `receivedQuantity: null`→set.

**Depends on Story 7.1** (materialized balance, correction fields) and **Story 7.2** (the Adjustment logic this story's optional linked-Adjustment path reuses).

**Architecture constraints in force:** AD-3, AD-4, AD-5, AD-6, AD-7, AD-9, NFR-2, NFR-3.

### Project Structure Notes

- New `payments.controller.ts`/`.service.ts` in `apps/api/src/team/`.
- `apps/web/app/(app)/payments/page.tsx` already exists as a stub (Epic 1 scaffold) — this story replaces it, same pattern as every other epic's list-page story.
- One additive schema field (`Payment.payPeriod`).

### References

- [Source: _bmad-output/specs/spec-AzentisFieldOS/functional-requirements.md#CAP-6] (FR-24, including its explicit "Omitting an Adjustment on a Payment is valid, no warning" clause)
- [Source: _bmad-output/planning-artifacts/stories/phase-4-people-money/epic-7-advances-payments/story-7.3-record-payment.md]
- [Source: infra/prisma/schema.prisma#Payment — missing payPeriod, correctsId/reason (Story 7.1's Task 1 fix)]
- [Source: _bmad-output/implementation-artifacts/7-1-record-an-advance.md, 7-2-record-an-advance-adjustment.md — this story's direct prerequisites]
- [Source: _bmad-output/implementation-artifacts/5-2-record-godown-site-movement.md — confirmReceipt's narrow-update reasoning, reused for markPaid]
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/10-payments.html]

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (claude-sonnet-5)

### Debug Log References

- `pnpm --filter @azentisfieldos/api test`, `pnpm --filter @azentisfieldos/web test` — full suites green (281 + 321 passed, no regressions; 51 pre-existing DB-integration tests skipped, same baseline as Stories 7.1/7.2).
- `pnpm typecheck`, `pnpm build` — all clean; `/payments`, `/payments/new`, `/payments/[id]/correct` all appear in the Next.js route manifest.
- `pnpm lint` — this story's own files (`app/(app)/payments/**`, `apps/api/src/team/**`) lint clean in isolation (`npx eslint "app/(app)/payments/**/*.{ts,tsx}" "app/(app)/team/**/*.{ts,tsx}"`), but the full monorepo `pnpm lint` currently fails on an unrelated pre-existing file this story never touched (`apps/web/app/(app)/daily-activity/work-records/new/work-record-form.tsx`, Epic 3/6 scope — a `react-hooks/set-state-in-effect` violation). Flagging since AGENTS.md treats lint as a hard CI gate; out of scope to fix here.

### Completion Notes List

- Task 1: added `Payment.payPeriod String?` (free text, e.g. "1-15 Aug 2026").
- Task 2: `createPaymentSchema` and `markPaymentPaidSchema` in `packages/shared/src/schemas/payment.ts`, exported from the package index. `netPayable` is deliberately absent from the schema — always server-computed. Documented inline why a Payment correction re-enters the complete input set rather than using the signed-delta pattern every other transaction-history model in this codebase uses.
- Task 3: `PaymentsController`/`PaymentsService` registered in `TeamModule`. Extracted the cap-check-and-decrement `updateMany`/count-check block Story 7.2 first wrote for `AdvanceAdjustmentsService` into a shared `apps/api/src/team/outstanding-balance.ts` (`decrementOutstandingBalanceWithFloorCheck`), and refactored `AdvanceAdjustmentsService` to use it too — this is now the third and final consumer the story's own Dev Notes named as the "stop copy-pasting" signal, matching Epic 5's own precedent for this exact reasoning. `PaymentsService.create` runs the Payment insert, and (when `advanceAdjustment` is present) the floor-check-decrement and linked `AdvanceAdjustment` insert, all inside one transaction — a rejected cap check rolls back the Payment insert too. `markPaid` uses the guarded `updateMany` + count-check pattern, distinguishing 404 (Payment doesn't exist) from 409 (already paid) via `ConflictException`, mirroring `WorkRecordsService`'s existing double-booking-guard precedent for the 409 case. Also added `GET /payments/:id` (required by Task 4's correction pre-fill, same precedent as `AdvancesService.findOne`) and `GET /payments/count/pending` (required by Task 4's "Pending Payments" stat tile, same precedent as `PurchasesService.countThisMonth` from Story 5.7).
- Task 4: real `payments/page.tsx` list (stat tiles + combined `DataTable`, matching `10-payments.html`'s columns), `payments/new/page.tsx` entry form, and `payments/[id]/correct/page.tsx` correction route, all sharing one `PaymentForm` client component. The form shows a live Net Payable preview (Base + Additional − Deductions − linked Adjustment) purely for UX — the persisted value always comes from the server response. The optional Advance Adjustment sub-section is a checkbox toggle; when checked, the Advance picker is scoped to the selected Team Member and shows the same "Cannot exceed ₹X (current Outstanding Balance)" inline hint Story 7.2 built. `MarkPaidButton` is a small secondary-variant button (distinct from `CorrectAction`'s icon-only ghost affordance, per AD-9 discipline), implemented as its own client component + bound Server Action, same pattern as `materials/categories`' `ToggleActiveButton`. The Payments list's "Total Paid This Month" and "Total Outstanding Advances" tiles reuse the existing `GET /team-members/team-summary` rollup (Story 6.3) rather than computing a second aggregate — Story 7.4 is the one that will swap both this page's and the Team list's stat tile to the new materialized-balance-only endpoint it introduces; this story deliberately doesn't front-run that change.
- Task 5: Zod tests (netPayable-stripped, correction-reason-required, non-negative fields, advanceAdjustment sub-object validation) via `ZodValidationPipe(createPaymentSchema)` in `payments.controller.spec.ts`. `payments.service.spec.ts` covers the netPayable matrix (with/without adjustment, zero-additional/deductions), the whole-transaction rollback on an over-cap linked Adjustment, `countPending`, and `markPaid`'s pending→paid/404/409 cases. Web-side: `payment-form.test.tsx` (live Net Payable computation, Advance-picker scoping, correction-mode field locking), `actions.test.ts` (including the `ADJUSTMENT_EXCEEDS_BALANCE`-as-field-error case and `markPaymentPaidAction`'s 404/409 handling), `mark-paid-button.test.tsx`, and all three page tests.

### File List

- `infra/prisma/schema.prisma` (modified — `Payment.payPeriod`)
- `packages/shared/src/schemas/payment.ts` (added)
- `packages/shared/src/index.ts` (modified)
- `apps/api/src/team/payments.controller.ts` (added)
- `apps/api/src/team/payments.service.ts` (added)
- `apps/api/src/team/payments.controller.spec.ts` (added)
- `apps/api/src/team/payments.service.spec.ts` (added)
- `apps/api/src/team/outstanding-balance.ts` (added — shared floor-check helper)
- `apps/api/src/team/advance-adjustments.service.ts` (modified — refactored onto the shared helper)
- `apps/api/src/team/team.module.ts` (modified)
- `apps/web/app/(app)/payments/page.tsx` (modified — replaced the Epic 1 stub)
- `apps/web/app/(app)/payments/page.test.tsx` (added)
- `apps/web/app/(app)/payments/payment-form.tsx` (added)
- `apps/web/app/(app)/payments/payment-form.test.tsx` (added)
- `apps/web/app/(app)/payments/actions.ts` (added)
- `apps/web/app/(app)/payments/actions.test.ts` (added)
- `apps/web/app/(app)/payments/mark-paid-button.tsx` (added)
- `apps/web/app/(app)/payments/mark-paid-button.test.tsx` (added)
- `apps/web/app/(app)/payments/new/page.tsx` (added)
- `apps/web/app/(app)/payments/new/page.test.tsx` (added)
- `apps/web/app/(app)/payments/[id]/correct/page.tsx` (added)
- `apps/web/app/(app)/payments/[id]/correct/page.test.tsx` (added)

## Change Log

- 2026-08-15: Story implemented end-to-end (schema, shared Zod schemas, API, web UI, tests). Status set to review.
