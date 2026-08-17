# Story 11.1: Record an Expense

Status: ready-for-dev

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

- [ ] Task 1 — Schema fix + seed data (AC: #1, #3)
  - [ ] `infra/prisma/schema.prisma`'s `Expense` model has no `correctsId`/`reason` — the now-familiar gap (Epic 5's `ReturnWastage`, Epic 7's `Advance`/`AdvanceAdjustment`/`Payment`, Epic 10's `RmcEntry`) between an AC requiring the Correct action and a model missing the fields for it. Add `correctsId String?`, `reason String?` (plain names, no collision — `Expense` has no pre-existing `reason`/`note` field). `ExpenseCategory` itself is **already** correctly modeled as a lookup table, not an enum — no schema change needed there, this epic's Implementation Notes got that part right from the start (contrast Epic 6/8, which had to fix an enum/free-string into a lookup table; here it's confirmed correct, not a gap to fix).
  - [ ] Seed the nine default `ExpenseCategory` rows the AC names verbatim: "Material," "Labour," "Machinery & Vehicle," "Fuel," "Repairs," "Transportation," "Site Expenses," "RMC," "Misc" — same seeding approach Epic 6 Story 6.1 and Epic 8 Story 8.1 used for their own lookup-table defaults. This is what "doesn't block on Epic 14" (the epic's Implementation Notes) means concretely: without these nine rows, the Expense form has nothing to pick from.
  - [ ] Run `pnpm db:generate`.
- [ ] Task 2 — Shared Zod schemas (AC: #1, #2, #3)
  - [ ] Create `packages/shared/src/schemas/expense-category.ts`: `createExpenseCategorySchema` (`{ name: z.string().min(1).max(100) }`) — create+list only, same minimal-now/Epic-14-later scope every other lookup table in this project has used.
  - [ ] Create `packages/shared/src/schemas/expense.ts`: `createExpenseSchema` (`siteId: z.uuid()`, `categoryId: z.uuid()`, `amount: z.number()`, `description: z.string().max(1000).optional()`, `paymentMethod: z.string().max(100).optional()`, `personOrVendor: z.string().max(200).optional()`, `incurredAt: z.coerce.date()`, `correctsId: z.uuid().optional()`, `reason: z.string().min(1).max(500).optional()`). No `purchaseId` in this create schema — that field links an Expense that *is* a Purchase's own cost entry, populated by a different, not-yet-built integration path (see Dev Notes), not by this story's manual entry form.
  - [ ] `.superRefine()`: `reason` required when `correctsId` present; `amount` positive when `correctsId` absent, non-zero either sign when present — Epic 5's delta-correction rule (a single-quantity ledger row, same shape as Purchase/RmcEntry).
  - [ ] Export both from `packages/shared/src/index.ts`.
- [ ] Task 3 — `apps/api` (AC: #1, #2, #3)
  - [ ] `apps/api/src/expenses/expense-categories.controller.ts` + `.service.ts`, `expenses.controller.ts` + `.service.ts`, one `ExpensesModule`. Register in `app.module.ts`. `POST /expense-categories`, `GET /expense-categories`, `POST /expenses`, `GET /expenses?siteId=&categoryId=&from=&to=`.
  - [ ] `GET /expenses/summary` — `{ totalThisMonth, totalThisWeek, largestCategoryThisMonth: { name, total } }`, all plain aggregate queries over `Expense` — no materialized column needed (same reasoning Epic 10 Story 10.2 used: this is read-only reporting over committed history, not a race-safe current-state value).
  - [ ] `GET /expenses` and `GET /sites/:id` (Epic 2, extend if not already covered by its existing activity feed) include `Expense` rows so "immediately reflected in Site... reporting" (AC #2) is actually true — confirm `site-activity-feed.ts` already surfaces Expense (it should, per Epic 3's `DailySiteReport.expenses` relation existing since the initial commit); if not, add it there rather than building a second, parallel Site-scoped Expense view.
- [ ] Task 4 — `apps/web` UI (AC: #1, #2, #3)
  - [ ] Replace the stub `apps/web/app/(app)/expenses/page.tsx` with the real Expenses list: stat tiles (Total this month, Total this week, Largest category this month) and a `DataTable` (Date / Site / Category / Amount / Description / Payment method / Person-Vendor / `CorrectAction`), matching `15-expenses.html`.
  - [ ] `apps/web/app/(app)/expenses/new/page.tsx` — entry form (Site, Category `SelectField`, amount, description, payment method, person/vendor, date). "Optional document" (FR-41) — if no file-upload primitive exists anywhere in this codebase yet, scope this story's form to the other fields and flag document upload as a follow-up rather than building a one-off uploader here (check `packages/ui` and any prior story for an existing upload pattern before deciding; DSR photo upload, Epic 3, is the most likely prior art to reuse if it exists).
  - [ ] `apps/web/app/(app)/expenses/categories/page.tsx` — minimal list+add, same dedicated-route pattern every prior lookup table has used.
  - [ ] Correction route (`/expenses/[id]/correct`), established pattern.
- [ ] Task 5 — Tests (AC: all)
  - [ ] Zod tests: reason-required rule, sign rule.
  - [ ] `expenses.service.spec.ts`: create/list delegation and filters; `summary`'s three figures computed correctly against a multi-Site/category/date fixture, including the zero-Expenses case (graceful `₹0`/`null` largest-category, not an error).

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

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
