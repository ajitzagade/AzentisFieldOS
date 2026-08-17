---
baseline_commit: 69304c7c784222ac253b1fda37e51f60875149b0
---

# Story 7.1: Record an Advance

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As Owner/Admin,
I want to record an Advance to a Team Member (amount, date, reason, payment method),
so that the money given is tracked immediately, with no approval step slowing down a same-day need.

## Acceptance Criteria

1. **Given** a Team Member, **when** I record an Advance, **then** their Outstanding Balance updates immediately — no approval gate, no workflow. (FR-22, NFR-3)
2. The row's "Correct" action opens a new reason-carrying entry linked to the original — never Edit/Delete. (AD-9)
3. Outstanding Balance is a materialized, write-path-only value per Team Member, updated atomically in the same transaction as the Advance insert — never a value derived by summing on every read, and never editable independent of a ledger-causing row. (AD-9, FR-25's "reconciles exactly")

## Tasks / Subtasks

- [x] Task 1 — Schema fixes (must land before anything else in this epic) (AC: #2, #3)
  - [x] `infra/prisma/schema.prisma`'s `Advance` model has no `correctsId`/`reason`-for-correction field — unlike `Purchase`/`Movement`/`Consumption`/`DailySiteReport`, all of which already carry this exact pair. `Advance` already has a `reason String?` field, but that field means "why the Advance was given" (business context, e.g. "medical emergency") — a **different question** from "why is this entry correcting another one." Add a second, distinct field for the correction reason (following `DailySiteReport`'s naming, the newest precedent in the schema): `correctsId String?`, `correctionReason String?` (named `correctionReason`, not `reason`, specifically to avoid colliding with the existing business-reason field — do not repurpose `reason` for both meanings, that would silently lose the original business reason on any corrected Advance).
  - [x] `AdvanceAdjustment` has the same gap (`note String?` is a free-form business note, not a correction reason) and the epic's own UX-DR7 explicitly requires "Correct action on Advance/Adjustment/Payment rows" — all three, not just two. Add `correctsId String?`, `correctionReason String?` to `AdvanceAdjustment`.
  - [x] `Payment` has no correction fields at all. Add `correctsId String?`, `reason String?` (Payment has no pre-existing `reason`/`note` field to collide with, so the plain name matches `Purchase`/`Movement`/`Consumption`'s convention exactly — only `Advance`/`AdvanceAdjustment` need the disambiguated `correctionReason` name).
  - [x] **The materialized Outstanding Balance column doesn't exist yet.** `TeamMember` has no balance field at all. AD-9 explicitly names "Outstanding Balance" as one of exactly three values this architecture requires to be materialized and write-path-only (the other two, `GodownStock`/`SiteStock`, already exist from Epic 5) — this is not optional or inferred, it's spelled out in the architecture spine's own text. Add `outstandingAdvanceBalance Decimal @default(0)` to `TeamMember`.
  - [x] Run `pnpm db:generate` after these changes.
- [x] Task 2 — Shared Zod schema (AC: #1, #2, #3)
  - [x] Create `packages/shared/src/schemas/advance.ts`: `createAdvanceSchema` (`teamMemberId: z.uuid()`, `amount: z.number()`, `reason: z.string().max(500).optional()` — the business reason, `paymentMethod: z.string().max(100).optional()`, `givenAt: z.coerce.date()`, `correctsId: z.uuid().optional()`, `correctionReason: z.string().min(1).max(500).optional()`).
  - [x] `.superRefine()`: `correctionReason` required when `correctsId` present (Epic 5 Story 5.1's correction-semantics rule — `reason` on this model is a different field than `correctionReason`, don't confuse the two in the refine logic). `amount` positive when `correctsId` absent, non-zero either sign when present — same delta-correction rule Epic 5 established, cited not re-derived.
  - [x] Export from `packages/shared/src/index.ts`.
- [x] Task 3 — `apps/api` (AC: #1, #2, #3)
  - [x] `apps/api/src/team/advances.controller.ts` + `.service.ts`, added to `TeamModule` (Epic 6 Story 6.1). `POST /advances`, `GET /advances`.
  - [x] `AdvancesService.create` runs inside `prisma.$transaction`: insert the `Advance` row, then `tx.teamMember.update({ where: { id: teamMemberId }, data: { outstandingAdvanceBalance: { increment: amount } } })` — `amount` is the (possibly negative, for a correction) signed delta from Task 2, so this one `increment` call correctly handles both an original Advance and a correcting one with no branching.
  - [x] `GET /advances` includes `teamMember` for display.
- [x] Task 4 — `apps/web` UI (AC: #1, #2)
  - [x] `apps/web/app/(app)/team/[id]/advances/new/page.tsx` — Advance entry form (amount, reason, payment method, date), reached from the Team Member detail page (Epic 6 Story 6.3).
  - [x] Extend `apps/web/app/(app)/team/[id]/page.tsx` (Epic 6 Story 6.3) with an "Advance Ledger" section: Outstanding Balance figure at top (from the materialized `TeamMember.outstandingAdvanceBalance`, not computed client-side), a `DataTable` of Advances/Adjustments with a `CorrectAction` per row, matching `09-team-member-detail.html`.
  - [x] Correction route (`/team/[id]/advances/[advanceId]/correct`) following the established pattern from Epic 5.
- [x] Task 5 — Tests (AC: all)
  - [x] Zod tests: correction-reason-required-when-correctsId rule; sign rule.
  - [x] `advances.service.spec.ts`: create increments `teamMember.outstandingAdvanceBalance` by exactly `amount` inside the same transaction as the `Advance` insert; a correction with a negative `amount` decrements the balance correctly.

## Dev Notes

**Three schema gaps found while writing this story — all additive, no migration conflicts with existing data (there is none yet; no `infra/prisma/migrations/` directory exists in this repo as of this story, same as every prior epic's Dev Notes have observed).** (1)/(2) `Advance`/`AdvanceAdjustment` lack correction fields entirely, and the ones that superficially look like they could serve double duty (`reason`, `note`) already mean something else — conflating them would silently destroy the original business context on any corrected row. (3) `Payment` lacks correction fields with no pre-existing field to confuse with. (4) — the significant one — **`TeamMember.outstandingAdvanceBalance` doesn't exist at all**, despite AD-9's own text explicitly listing "Outstanding Balance" alongside `GodownStock`/`SiteStock` as one of exactly three values this architecture requires to be materialized. This is the same class of fix as Epic 4's `MaterialCategory.isActive` and Epic 5's `ReturnWastage.correctsId` — a model drafted ahead of its owning story, checked now against what the architecture/FR text actually requires rather than assumed complete because it exists.

**Why a materialized column here, not a summed-on-read aggregate.** FR-25 says the Outstanding Advances total "reconciles exactly to the sum of individual balances" — under a naive read-time `SUM()` aggregate that's true by definition but says nothing about race safety; under AD-9's materialized-column approach it's true by construction *and* gives Story 7.2 an atomic, race-safe value to check the FR-23 cap against, using the exact same `updateMany` + affected-row-count technique Epic 5 Story 5.2 established for `GodownStock`/`SiteStock` — cite that pattern directly in Story 7.2, don't re-derive it. A summed-on-read aggregate would force Story 7.2 into Serializable-transaction-plus-retry territory instead, a meaningfully more complex technique for the same guarantee this codebase already has a simpler, proven answer for.

**Which specific `Advance` an `AdvanceAdjustment` targets vs. what the cap checks against — a design decision, not a schema accident.** `AdvanceAdjustment.advanceId` is a required FK to one specific `Advance` row, but the Outstanding Balance shown to the Owner/Admin (`09-team-member-detail.html`'s "Total Advance − Total Adjusted") and the FR-23 cap are both **Team-Member-pooled**, not per-individual-Advance. Story 7.2 resolves this by having the Adjustment form require picking which specific Advance it's recorded against (for audit traceability — "this repayment relates to the Aug 3rd advance"), while validating the cap against the pooled `TeamMember.outstandingAdvanceBalance`, never a per-Advance remaining amount. This is deliberate: silent FIFO auto-allocation across a Team Member's Advances was considered and rejected as "hidden magic" that would work against this product's explicit "state what happened, no hidden magic" voice-and-tone principle (`EXPERIENCE.md`).

**Depends on Epic 6 Story 6.1** (`TeamMember`, `TeamModule`) and **Story 6.3** (the Team Member detail page this story's Advance Ledger section extends).

**Architecture constraints in force:** AD-3, AD-4, AD-5, AD-6, AD-7, AD-9, NFR-2 (no auto-adjustment — every balance change is one explicit, reason-carrying user action, which the transactional `increment` in Task 3 satisfies exactly), NFR-3 (no approval chain — `AdvancesService.create` has no status/approval field or intermediate state, it applies immediately).

### Project Structure Notes

- New `advances.controller.ts`/`.service.ts` in the existing `apps/api/src/team/` module (Epic 6).
- Extends `apps/web/app/(app)/team/[id]/page.tsx` (Epic 6 Story 6.3) rather than creating a competing detail page.
- Schema edits touch `Advance`, `AdvanceAdjustment`, `Payment`, and `TeamMember` — all additive.

### References

- [Source: _bmad-output/specs/spec-AzentisFieldOS/functional-requirements.md#CAP-6 — Labour Advances & Payments] (FR-22, FR-25, NFR-2, NFR-3)
- [Source: _bmad-output/planning-artifacts/epics/phase-4-people-money/epic-7-advances-payments.md]
- [Source: _bmad-output/planning-artifacts/stories/phase-4-people-money/epic-7-advances-payments/story-7.1-record-advance.md]
- [Source: infra/prisma/schema.prisma#Advance, AdvanceAdjustment, Payment, TeamMember — the correction-field and materialized-balance gaps this story's Task 1 fixes]
- [Source: _bmad-output/planning-artifacts/architecture/architecture-AzentisFieldOS-2026-08-11/ARCHITECTURE-SPINE.md#AD-9 — "Outstanding Balance" named explicitly alongside GodownStock/SiteStock]
- [Source: _bmad-output/implementation-artifacts/5-2-record-godown-site-movement.md — the materialized-balance + updateMany floor-check pattern Story 7.2 reuses]
- [Source: _bmad-output/implementation-artifacts/6-1-manage-team-members.md, 6-3-work-history-team-summary.md — TeamModule and the Team Member detail page this story extends]
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/09-team-member-detail.html]

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (claude-sonnet-5)

### Debug Log References

- `pnpm db:generate` — clean regeneration of the Prisma client after the schema edits.
- `pnpm --filter @azentisfieldos/api test`, `pnpm --filter @azentisfieldos/web test` — full suites green (239 + 270 passed, no regressions; 51 pre-existing DB-integration tests skipped, same as before this story).
- `pnpm typecheck`, `pnpm lint`, `pnpm build` — all clean across all 5 packages, including both new Advance routes appearing in the Next.js route manifest.

### Completion Notes List

- Task 1: added `correctsId`/`correctionReason` to `Advance` and `AdvanceAdjustment`, `correctsId`/`reason` to `Payment`, and the materialized `TeamMember.outstandingAdvanceBalance Decimal @default(0)` column — all additive, no migration directory existed yet.
- Task 2: `createAdvanceSchema` in `packages/shared/src/schemas/advance.ts`, exported from the package index; `.superRefine()` enforces the correction-reason-required and signed-amount rules exactly as Epic 5 established.
- Task 3: `AdvancesController`/`AdvancesService` registered in `TeamModule`. `create` validates a `correctsId`'s original Advance exists and shares the same `teamMemberId` (mirrors `PurchasesService`/`ConsumptionService`'s existing-original + matching-identity-field check, since an Advance's balance is Team-Member-pooled), then inserts the Advance and increments `TeamMember.outstandingAdvanceBalance` by the signed `amount` in one `$transaction`, no branching. Also added `GET /advances/:id` (not explicitly listed in Task 3, but required by Task 4's correction page pre-fill — same precedent `PurchasesService.findOne` documents for itself).
- Task 4: new Advance entry form and correction route under `apps/web/app/(app)/team/[id]/advances/`, following the `ConsumptionForm`/Server Action pattern exactly (shared `AdvanceForm` component for both `new`/`correct` modes). Extended the Team Member detail page with an Outstanding Balance card and an Advance ledger `DataTable` with a `CorrectAction` per row. **Scope note:** the ledger table currently renders Advances only — `AdvanceAdjustment` rows are Story 7.2's own scope (its endpoints don't exist yet); the table and `getAdvances` fetch are structured so 7.2 can add Adjustment rows into the same list without a rework. `GET /advances` has no per-Team-Member filter endpoint (not in Task 3's list), so the detail page fetches the global list and filters client-side by `teamMember.id`.
- Task 5: Zod correction-reason/sign rules covered via `ZodValidationPipe(createAdvanceSchema)` in `advances.controller.spec.ts` (same pattern `consumption.controller.spec.ts` uses — this codebase tests schema rules through the validation pipe, not as standalone schema unit tests). `advances.service.spec.ts` covers the balance increment/decrement, the correction-target-exists check, and the teamMemberId-mismatch rejection. Web-side: `advance-form.test.tsx`, `actions.test.ts`, and both page tests added; `team/[id]/page.test.tsx` extended for the ledger/Outstanding Balance rendering.
- Deliberately out of scope for this story (left untouched): `TeamMembersService.getTeamSummary`'s roster-page "Total Outstanding Advances" tile still sums `Advance`/`AdvanceAdjustment` on read — Story 7.4 (Outstanding Advance Visibility) owns switching that to the materialized balance.

### File List

- `infra/prisma/schema.prisma` (modified)
- `packages/shared/src/schemas/advance.ts` (added)
- `packages/shared/src/index.ts` (modified)
- `apps/api/src/team/advances.controller.ts` (added)
- `apps/api/src/team/advances.service.ts` (added)
- `apps/api/src/team/advances.controller.spec.ts` (added)
- `apps/api/src/team/advances.service.spec.ts` (added)
- `apps/api/src/team/team.module.ts` (modified)
- `apps/web/app/(app)/team/[id]/advances/actions.ts` (added)
- `apps/web/app/(app)/team/[id]/advances/actions.test.ts` (added)
- `apps/web/app/(app)/team/[id]/advances/advance-form.tsx` (added)
- `apps/web/app/(app)/team/[id]/advances/advance-form.test.tsx` (added)
- `apps/web/app/(app)/team/[id]/advances/new/page.tsx` (added)
- `apps/web/app/(app)/team/[id]/advances/new/page.test.tsx` (added)
- `apps/web/app/(app)/team/[id]/advances/[advanceId]/correct/page.tsx` (added)
- `apps/web/app/(app)/team/[id]/advances/[advanceId]/correct/page.test.tsx` (added)
- `apps/web/app/(app)/team/[id]/page.tsx` (modified)
- `apps/web/app/(app)/team/[id]/page.test.tsx` (modified)
- `apps/web/app/(app)/team/[id]/edit/page.tsx` (modified — `TeamMemberDetail.outstandingAdvanceBalance`)
- `apps/web/app/(app)/team/[id]/edit/edit-team-member-form.test.tsx` (modified — fixture updated for the new field)

## Change Log

- 2026-08-15: Story implemented end-to-end (schema, shared Zod schema, API, web UI, tests). Status set to review.
