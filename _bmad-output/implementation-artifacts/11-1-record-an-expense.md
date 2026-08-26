---
baseline_commit: bd8fd0c5da5535faede28359267525faee037440
---

# Story 11.1: Record an Expense

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As Owner/Admin or Site Supervisor,
I want to record an Expense (date, Site, category, amount, description, payment method, person/vendor, optional document),
so that every Site cost is captured as it happens, categorized consistently.

## Acceptance Criteria

1. An Expense category list is seeded with defaults (material, labour, machinery/vehicle, fuel, repairs, transportation, site expenses, RMC, misc), modeled as admin-configurable data, not a hardcoded enum. (NFR-4)
2. **Given** a Site and a category, **when** I record an Expense, **then** it's saved as permanent history, tagged to that Site, immediately reflected in Site and Financial reporting. (FR-41)
3. The row's "Correct" action is available, never Edit/Delete. (AD-9)

## Tasks / Subtasks

- [x] Task 1 — Schema fix + seed data (AC: #1, #3)
  - [x] `infra/prisma/schema.prisma`'s `Expense` model has no `correctsId`/`reason` — the now-familiar gap (Epic 5's `ReturnWastage`, Epic 7's `Advance`/`AdvanceAdjustment`/`Payment`, Epic 10's `RmcEntry`) between an AC requiring the Correct action and a model missing the fields for it. Add `correctsId String?`, `reason String?` (plain names, no collision — `Expense` has no pre-existing `reason`/`note` field). `ExpenseCategory` itself is **already** correctly modeled as a lookup table, not an enum — no schema change needed there, this epic's Implementation Notes got that part right from the start (contrast Epic 6/8, which had to fix an enum/free-string into a lookup table; here it's confirmed correct, not a gap to fix).
  - [x] Seed the nine default `ExpenseCategory` rows the AC names verbatim: "Material," "Labour," "Machinery & Vehicle," "Fuel," "Repairs," "Transportation," "Site Expenses," "RMC," "Misc" — same seeding approach Epic 6 Story 6.1 and Epic 8 Story 8.1 used for their own lookup-table defaults. This is what "doesn't block on Epic 14" (the epic's Implementation Notes) means concretely: without these nine rows, the Expense form has nothing to pick from.
  - [x] Run `pnpm db:generate`.
- [x] Task 2 — Shared Zod schemas (AC: #1, #2, #3)
  - [x] Create `packages/shared/src/schemas/expense-category.ts`: `createExpenseCategorySchema` (`{ name: z.string().min(1).max(100) }`) — create+list only, same minimal-now/Epic-14-later scope every other lookup table in this project has used.
  - [x] Create `packages/shared/src/schemas/expense.ts`: `createExpenseSchema` (`siteId: z.uuid()`, `categoryId: z.uuid()`, `amount: z.number()`, `description: z.string().max(1000).optional()`, `paymentMethod: z.string().max(100).optional()`, `personOrVendor: z.string().max(200).optional()`, `incurredAt: z.coerce.date()`, `correctsId: z.uuid().optional()`, `reason: z.string().min(1).max(500).optional()`). No `purchaseId` in this create schema — that field links an Expense that *is* a Purchase's own cost entry, populated by a different, not-yet-built integration path (see Dev Notes), not by this story's manual entry form.
  - [x] `.superRefine()`: `reason` required when `correctsId` present; `amount` positive when `correctsId` absent, non-zero either sign when present — Epic 5's delta-correction rule (a single-quantity ledger row, same shape as Purchase/RmcEntry).
  - [x] Export both from `packages/shared/src/index.ts`.
- [x] Task 3 — `apps/api` (AC: #1, #2, #3)
  - [x] `apps/api/src/expenses/expense-categories.controller.ts` + `.service.ts`, `expenses.controller.ts` + `.service.ts`, one `ExpensesModule`. Register in `app.module.ts`. `POST /expense-categories`, `GET /expense-categories`, `POST /expenses`, `GET /expenses?siteId=&categoryId=&from=&to=`.
  - [x] `GET /expenses/summary` — `{ totalThisMonth, totalThisWeek, largestCategoryThisMonth: { name, total } }`, all plain aggregate queries over `Expense` — no materialized column needed (same reasoning Epic 10 Story 10.2 used: this is read-only reporting over committed history, not a race-safe current-state value).
  - [x] `GET /expenses` and `GET /sites/:id` (Epic 2, extend if not already covered by its existing activity feed) include `Expense` rows so "immediately reflected in Site... reporting" (AC #2) is actually true — confirm `site-activity-feed.ts` already surfaces Expense (it should, per Epic 3's `DailySiteReport.expenses` relation existing since the initial commit); if not, add it there rather than building a second, parallel Site-scoped Expense view.
- [x] Task 4 — `apps/web` UI (AC: #1, #2, #3)
  - [x] Replace the stub `apps/web/app/(app)/expenses/page.tsx` with the real Expenses list: stat tiles (Total this month, Total this week, Largest category this month) and a `DataTable` (Date / Site / Category / Amount / Description / Payment method / Person-Vendor / `CorrectAction`), matching `15-expenses.html`.
  - [x] `apps/web/app/(app)/expenses/new/page.tsx` — entry form (Site, Category `SelectField`, amount, description, payment method, person/vendor, date). "Optional document" (FR-41) — if no file-upload primitive exists anywhere in this codebase yet, scope this story's form to the other fields and flag document upload as a follow-up rather than building a one-off uploader here (check `packages/ui` and any prior story for an existing upload pattern before deciding; DSR photo upload, Epic 3, is the most likely prior art to reuse if it exists).
  - [x] `apps/web/app/(app)/expenses/categories/page.tsx` — minimal list+add, same dedicated-route pattern every prior lookup table has used.
  - [x] Correction route (`/expenses/[id]/correct`), established pattern.
- [x] Task 5 — Tests (AC: all)
  - [x] Zod tests: reason-required rule, sign rule.
  - [x] `expenses.service.spec.ts`: create/list delegation and filters; `summary`'s three figures computed correctly against a multi-Site/category/date fixture, including the zero-Expenses case (graceful `₹0`/`null` largest-category, not an error).

## Dev Notes

**This epic got the lookup-table pattern right from day one — worth naming explicitly since it's the exception, not the rule, across this project's schema.** `ExpenseCategory` was already modeled as a proper data table with a plain `name` column, exactly the fix five other epics (4, 6, 8, and implicitly others) each had to apply to their own "admin-configurable, not hardcoded" field. The only gap here is the familiar `correctsId`/`reason` omission — this epic's schema author clearly internalized NFR-4's lesson before this story was written, just missed the AD-9 one.

**`Expense.purchaseId` is intentionally out of this story's scope.** The field exists ("links an Expense that IS a Purchase's cost entry") but nothing in FR-41 or this story's AC describes when or how that link gets set — it reads as reserved for a future integration (most plausibly Epic 13's Financial Reports wanting Purchases and Expenses to reconcile into one cost view without double-counting). Don't invent that integration here; leave `purchaseId` null on every Expense this story's form creates, and don't add a picker for it.

**Depends on nothing new** beyond Epic 2 (`Site`) and Epic 5's correction-delta pattern (cited, not re-derived).

**Architecture constraints in force:** AD-3, AD-4, AD-5, AD-6, AD-7, AD-9, NFR-4.

### Project Structure Notes

- New `apps/api/src/expenses/` module (two related resources, one module — same shape as Epic 4's `materials/`).
- `apps/web/app/(app)/expenses/page.tsx` already exists as a stub — replaced here.

### References

- [Source: _bmad-output/specs/spec-AzentisFieldOS/functional-requirements.md#CAP-12 — Expense Tracking] (FR-41, NFR-4)
- [Source: _bmad-output/planning-artifacts/epics/phase-5-assets-suppliers/epic-11-expenses.md — nine seeded default categories, named verbatim]
- [Source: _bmad-output/planning-artifacts/stories/phase-5-assets-suppliers/epic-11-expenses/story-11.1-record-expense.md]
- [Source: infra/prisma/schema.prisma#Expense, ExpenseCategory — missing correctsId/reason, this story's Task 1 fix]
- [Source: _bmad-output/implementation-artifacts/5-1-record-a-purchase.md — correction-delta semantics this story reuses]
- [Source: apps/api/src/sites/site-activity-feed.ts — where Expense should already surface for AC #2's Site-reporting requirement]
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/15-expenses.html]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.8 (1M context) (claude-opus-4-8[1m])

### Debug Log References

### Completion Notes List

- A partial Expense scaffold already existed on the baseline (an `ExpensesModule` with create/list only, a stub list page, a single-mode form). This story brought it up to the AC: schema `correctsId`/`reason`, the nine seeded categories, correction handling, filters, the summary endpoint, the correction route, and the categories admin — reusing rather than recreating what was there.
- Schema: added `Expense.correctsId`/`reason` (plain pair — no pre-existing `reason`/`note` on Expense to collide with, same convention as Purchase/RmcEntry). `ExpenseCategory` was already a proper lookup table, so no enum-to-table fix was needed (confirmed, per Dev Notes).
- Seed: replaced the four placeholder categories with the nine the AC names verbatim ("Material", "Labour", "Machinery & Vehicle", "Fuel", "Repairs", "Transportation", "Site Expenses", "RMC", "Misc"), idempotent `upsert` on the unique name.
- `createExpenseSchema` now uses `z.coerce.date()` for `incurredAt` (per Task 2) and adds `correctsId`/`reason` + the delta-correction `superRefine` (reason required when correcting; amount positive when fresh, non-zero either sign when correcting) — Epic 5 Story 5.1's rule, reused not re-derived.
- `ExpensesService.create` validates a correction the same way `RmcService` does: the `correctsId` must reference an existing Expense, and the correction's Site + Category must match the original (server-side enforcement; the form's locked fields are only UI convenience). A correcting row's `amount` is a signed delta, so the correction form leaves Amount blank rather than pre-filling.
- `GET /expenses/summary` returns `{ totalThisMonth, totalThisWeek, largestCategoryThisMonth: { name, total } | null }` — server-computed aggregates over committed history (no materialized column), with `largestCategoryThisMonth` gracefully `null` in the zero-Expenses case. Week is Monday-start, server-local (matching the codebase's existing stat-tile timezone convention).
- AC #2's "immediately reflected in Site reporting": `apps/api/src/sites/site-activity-feed.ts` already surfaces `Expense` rows (via `GET /sites/:id`), so no second Site-scoped Expense view was built — confirmed, not modified.
- **"Optional document" (FR-41) deferred.** No shared file-upload primitive exists in `packages/ui`; the only upload path in the codebase is the DSR photo presign flow (Epic 3), which is bespoke to `apps/api`'s R2 storage module and not a reusable form control. Per Task 4's explicit instruction, the form is scoped to the other fields and document upload is flagged as follow-up rather than building a one-off uploader.
- **No per-request auth attribution.** Expense rows carry no `createdByUserId` — consistent with the epic-wide "no request-level auth in `apps/api` yet" TODO in AGENTS.md.
- Verification: `apps/api` typecheck + build clean; new `src/expenses` unit tests 22/22 pass (mocked Prisma, no DB). `apps/web` typecheck + `next build` clean (all four `/expenses*` routes emitted); full web test suite 492/492 pass, expenses lint clean. Pre-existing lint errors in `apps/api/src/team/payments.service.spec.ts` are unrelated to this story (untouched).

**Code-review follow-ups applied (two structural fixes, matching the RMC 10.1/10.2 precedents):**

- **Migration for the Expense schema change.** `pnpm db:generate` alone doesn't produce a deployable migration — the repo ships DB changes via `pnpm db:migrate:deploy`, so the `correctsId`/`reason` columns would never land in a real DB and `POST /expenses` corrections would fail at runtime while mocked-Prisma unit tests stayed green. Ran `pnpm db:migrate:dev --name add_expense_correction_fields`, which generated + applied `infra/prisma/migrations/20260826101244_add_expense_correction_fields/migration.sql` (`ALTER TABLE "Expense" ADD COLUMN "correctsId" TEXT, ADD COLUMN "reason" TEXT;`) — mirrors `20260826084511_add_rmc_entry_correction_fields`.
- **HTTP-level route-ordering guard.** `GET /expenses/summary` resolves correctly only because it's declared before `@Get(':id')`; a reorder would silently make `/expenses/summary` → `findOne('summary')` → 404, and neither the controller spec (direct method calls) nor the web page test (fetch mocked by URL substring) would catch it. Added `apps/api/src/expenses/expenses.controller.integration.spec.ts` (real `INestApplication` + supertest + mocked `ExpensesService`) asserting `/expenses/summary` reaches `summary()` and not `findOne`, and `/expenses/:id` with a real id still reaches `findOne` — mirrors `rmc.controller.integration.spec.ts`. `/expenses` has exactly one static-before-`:id` route (`summary`), fully covered.
- Post-fix verification (real local Postgres, `DATABASE_URL` exported): `apps/api` typecheck clean; all 4 `src/expenses` spec files pass (24 tests, incl. the new integration spec). Full `apps/api` suite: 529 passed, 22 skipped — the one failing file, `dsr/dsr.service.integration.spec.ts`, is a **pre-existing** shared-local-DB test-isolation bug (its own fixture setup hits a `name` unique-constraint collision and its teardown hits `Advance_teamMemberId_fkey` on leftover cross-spec data); it touches none of this story's tables and fails identically in isolation, unrelated to this diff.

### File List

- `infra/prisma/schema.prisma` (modified — `Expense.correctsId`/`reason`)
- `infra/prisma/migrations/20260826101244_add_expense_correction_fields/migration.sql` (new — code-review follow-up; the migration for the schema change above)
- `infra/prisma/seed.ts` (modified — nine verbatim default Expense categories)
- `packages/shared/src/schemas/expense-category.ts` (new)
- `packages/shared/src/schemas/expense.ts` (modified — correction fields, superRefine, `z.coerce.date()`)
- `packages/shared/src/index.ts` (modified — export expense-category)
- `apps/api/src/expenses/expense-categories.service.ts` (new)
- `apps/api/src/expenses/expense-categories.controller.ts` (modified — POST + service delegation)
- `apps/api/src/expenses/expenses.service.ts` (modified — correction validation, filters, summary, findOne)
- `apps/api/src/expenses/expenses.controller.ts` (modified — filters, summary, findOne endpoints)
- `apps/api/src/expenses/expenses.module.ts` (modified — register ExpenseCategoriesService)
- `apps/api/src/expenses/expenses.service.spec.ts` (new)
- `apps/api/src/expenses/expenses.controller.spec.ts` (new — includes ZodValidationPipe schema tests)
- `apps/api/src/expenses/expense-categories.service.spec.ts` (new)
- `apps/api/src/expenses/expenses.controller.integration.spec.ts` (new — code-review follow-up; HTTP-level route-ordering guard for `/expenses/summary` vs `:id`)
- `apps/web/app/(app)/expenses/page.tsx` (replaced stub — stat tiles + full DataTable + CorrectAction)
- `apps/web/app/(app)/expenses/page.test.tsx` (new)
- `apps/web/app/(app)/expenses/actions.ts` (modified — correctsId/reason)
- `apps/web/app/(app)/expenses/actions.test.ts` (new)
- `apps/web/app/(app)/expenses/expense-form.tsx` (modified — dual new/correct mode)
- `apps/web/app/(app)/expenses/expense-form.test.tsx` (new)
- `apps/web/app/(app)/expenses/new/page.tsx` (modified — pass mode="new")
- `apps/web/app/(app)/expenses/categories/page.tsx` (new)
- `apps/web/app/(app)/expenses/categories/add-expense-category-form.tsx` (new)
- `apps/web/app/(app)/expenses/categories/actions.ts` (new)
- `apps/web/app/(app)/expenses/[id]/correct/page.tsx` (new)

## Suggested Review Order

**Contract (schema + validation)**

- Entry point: the shared create schema — delta-correction sign rule + reason-required refinement (AC #3).
  [`expense.ts:11`](../../packages/shared/src/schemas/expense.ts#L11)

- Append-only correction fields on the model (AC #3 / AD-9).
  [`schema.prisma:740`](../../infra/prisma/schema.prisma#L740)

- The migration that lands those columns (code-review follow-up).
  [`migration.sql:1`](../../infra/prisma/migrations/20260826101244_add_expense_correction_fields/migration.sql#L1)

- The nine seeded default categories (AC #1, NFR-4 — lookup table, not enum).
  [`seed.ts:1`](../../infra/prisma/seed.ts#L1)

**API write + reporting path**

- `create` — correction match-check (Site/Category), FK-error translation.
  [`expenses.service.ts:35`](../../apps/api/src/expenses/expenses.service.ts#L35)

- `summary` — server-computed month/week/largest-category aggregates, graceful zero case.
  [`expenses.service.ts:118`](../../apps/api/src/expenses/expenses.service.ts#L118)

- Route surface — `summary` declared before `:id` (ordering dependency).
  [`expenses.controller.ts:41`](../../apps/api/src/expenses/expenses.controller.ts#L41)

**Web UI**

- List page — stat tiles + DataTable + CorrectAction (AC #2, AC #3).
  [`page.tsx:86`](../../apps/web/app/(app)/expenses/page.tsx#L86)

- Dual new/correct form — locked Site/Category + signed-delta Amount in correct mode.
  [`expense-form.tsx:1`](../../apps/web/app/(app)/expenses/expense-form.tsx#L1)

- Categories admin (list + add) — the Epic-14-later lookup-table pattern.
  [`categories/page.tsx:1`](../../apps/web/app/(app)/expenses/categories/page.tsx#L1)

**Tests (supporting)**

- Service summary tests, incl. the zero-Expenses null-largest-category case.
  [`expenses.service.spec.ts:179`](../../apps/api/src/expenses/expenses.service.spec.ts#L179)

- HTTP-level route-ordering guard (code-review follow-up).
  [`expenses.controller.integration.spec.ts:18`](../../apps/api/src/expenses/expenses.controller.integration.spec.ts#L18)
