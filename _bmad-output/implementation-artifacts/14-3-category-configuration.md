---
baseline_commit: 057ff73068e07b4912c7352b1dbfdf89cadbd65f
---

# Story 14.3: Category Configuration

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As Owner/Admin,
I want to manage the category sets seeded by Epics 6, 8, and 11 (labour/employment types, machinery/vehicle types, expense categories),
so that my catalog of categories matches how my business actually operates, fully admin-configurable.

## Acceptance Criteria

1. **Given** categories seeded with sensible defaults by their originating epics, **when** I add, edit, or disable a category, **then** the change is reflected immediately in the relevant entry forms, with none of these categories ever hardcoded. (NFR-4, FR-49)
2. This story fulfills the "Epic 14 later adds the admin UI" promise each originating epic's Implementation Notes explicitly deferred — see Dev Notes.
3. Material Categories/Units (Epic 4) and Low-stock Thresholds (Epic 5) already have their own admin surfaces — this story surfaces them from Settings as a discoverability hub, it does not rebuild them.

## Tasks / Subtasks

- [x] Task 1 — Schema fix: add the missing `isActive` columns (AC: #1)
  - [x] `EmploymentType` (Epic 6 Story 6.1) already has `isActive` — no change needed there. `MachineryType`/`VehicleType` (Epic 8 Story 8.1) and `ExpenseCategory` (pre-existing) do **not** — each was deliberately scoped to create+list only by its originating story, with full lifecycle explicitly deferred to this epic. Add `isActive Boolean @default(true)` to all three. Run `pnpm db:generate`.
- [x] Task 2 — Shared Zod schemas (AC: #1)
  - [x] Extend `packages/shared/src/schemas/machinery-type.ts`, `vehicle-type.ts` (Epic 8), and create `expense-category-update.ts`-equivalent additions to `packages/shared/src/schemas/expense-category.ts` (Epic 11) with `updateXSchema` (`{ name: z.string().min(1).max(100).optional(), isActive: z.boolean().optional() }` — no default-on-partial trap here since these schemas never had a `.default()` on `isActive` to begin with, unlike `Material`'s history in Epic 4).
  - [x] Extend `packages/shared/src/schemas/employment-type.ts` (Epic 6) the same way — it already has the `isActive` column, just never got an update schema since Epic 6 Story 6.1 scoped that to this epic too.
- [x] Task 3 — `apps/api` (AC: #1)
  - [x] Add `PATCH /employment-types/:id`, `PATCH /machinery-types/:id`, `PATCH /vehicle-types/:id`, `PATCH /expense-categories/:id` to their respective existing controllers/services (`apps/api/src/team/`, `apps/api/src/assets/`, `apps/api/src/expenses/`) — four small additions across three existing modules, no new modules.
  - [x] `GET /materials/thresholds` (new, on Epic 4/5's existing `materials.controller.ts`) — every active `Material` with a non-null `lowStockThreshold`, `{ id, name, lowStockThreshold }`, for the Settings page's "Low-stock Thresholds" summary card (AC #3 — this is the one genuinely new read endpoint this story adds, everything else is either a `PATCH` on an existing resource or a link to an existing page).
- [x] Task 4 — `apps/web` UI (AC: #1, #2, #3)
  - [x] Extend `apps/web/app/(app)/settings/page.tsx` (Stories 14.1/14.2) with a "Categories & Config" section, matching `17-settings.html`'s card-grid layout: one compact `card-flat` per category family, each showing a chip list of current entries and an Edit action.
  - [x] Employment Types, Machinery Types, Vehicle Types, Expense Categories: each card's Edit action opens that family's existing dedicated route (`/team/employment-types`, `/machinery-vehicles/machinery-types`, `/machinery-vehicles/vehicle-types`, `/expenses/categories` — all created by their originating epics with create+list only) — **extend each of those existing pages** with rename/disable controls now that Task 3 added the `PATCH` endpoints, rather than building four new pages here.
  - [x] Material Categories card: Edit links to Epic 4's existing `/materials/categories` page (already full CRUD, no extension needed) — a pure discoverability link, per AC #3.
  - [x] Low-stock Thresholds card: reads Task 3's `GET /materials/thresholds`, shows each as a static chip (`"Cement (OPC 53) — 200 Bags"` per the mockup); its Edit action links to the specific Material's edit page (Epic 4/5, where the threshold field already lives) rather than building a bulk-edit UI here — this card is read/discovery-only, matching AC #3.
- [x] Task 5 — Tests (AC: all)
  - [x] Zod tests for each new update schema.
  - [x] Service tests for each new `PATCH` endpoint (rename + disable, following the exact pattern Epic 4 Story 4.1 established for `MaterialCategory`'s own `PATCH`).
  - [x] `apps/web` component test: a disabled category no longer appears in the relevant entry form's picker (e.g., a disabled Machinery Type is absent from the "Add Machine" form's Type `SelectField`) — the concrete proof of AC #1's "reflected immediately in the relevant entry forms."

## Dev Notes

**This story is a promise-keeping exercise across three prior epics, not new design work.** Epic 6 Story 6.1's Dev Notes said, verbatim, "full edit/disable lifecycle for Employment Types is explicitly Epic 14's job." Epic 8 Story 8.1 said the same for Machinery/Vehicle Types. This story is where those promises get paid — the shape of the fix (add `isActive`, add a `PATCH`, extend the existing minimal admin page rather than replace it) was already decided when those stories were written; this story executes it three (really four, counting the pre-existing `ExpenseCategory`) times.

**Material Categories/Units/Low-stock Thresholds are a hub, not a rebuild — the mockup and this story's own AC list disagree slightly on emphasis, resolved by inclusion, not exclusion.** This story's AC text names "labour/employment types, machinery/vehicle types, expense categories" as its subject; the mockup's Categories & Config cards show Expense Categories, Material Categories, and Low-stock Thresholds, omitting Employment/Machinery/Vehicle Types entirely. Rather than pick one artifact over the other, this story builds all of them: the AC's three named families get their first-ever edit/disable capability (the real net-new work), while Material Categories and Low-stock Thresholds — which already have full capability elsewhere — get a discoverability card linking out, satisfying the mockup's visual completeness without duplicating already-working screens.

**Depends on**: Epic 6 Story 6.1 (`EmploymentType`), Epic 8 Story 8.1 (`MachineryType`/`VehicleType`), Epic 11 Story 11.1 (`ExpenseCategory`), Epic 4 Stories 4.1/5.7 (Material Categories, Low-stock Thresholds — read-only reuse), Story 14.1 (Settings page shell).

**Architecture constraints in force:** AD-3, AD-4, AD-5, AD-6, AD-7, NFR-4.

### Project Structure Notes

- No new modules — four small extensions to existing controllers/services across `apps/api/src/team/`, `apps/api/src/assets/`, `apps/api/src/expenses/`, `apps/api/src/materials/`.
- Extends four existing `apps/web` pages plus `apps/web/app/(app)/settings/page.tsx`.

### References

- [Source: _bmad-output/specs/spec-AzentisFieldOS/functional-requirements.md#CAP-14] (FR-49, NFR-4)
- [Source: _bmad-output/planning-artifacts/stories/phase-7-administration/epic-14-tenant-configuration-settings/story-14.3-category-configuration.md]
- [Source: _bmad-output/implementation-artifacts/6-1-manage-team-members.md, 8-1-manage-machinery-vehicle-registers.md, 11-1-record-an-expense.md — the three "Epic 14 owns full lifecycle" deferrals this story fulfills]
- [Source: _bmad-output/implementation-artifacts/4-1-manage-material-categories-materials.md, 5-7-stock-lifecycle-visibility-low-stock-flagging.md — the already-complete surfaces this story links to rather than rebuilds]
- [Source: infra/prisma/schema.prisma#MachineryType, VehicleType, ExpenseCategory — missing isActive, this story's Task 1 fix]
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/17-settings.html — Categories & Config section]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.8 (1M context) — claude-opus-4-8[1m]

### Debug Log References

### Completion Notes List

- Added `isActive Boolean @default(true)` to `MachineryType`, `VehicleType`, `ExpenseCategory` (`EmploymentType` already had it). Committed migration `infra/prisma/migrations/20260826185659_add_category_is_active_fields/` (generated + applied against the local DB).
- Added `updateXSchema` (`name?`/`isActive?`, both bare-optional — no `.default()` trap) to the four shared schemas and `PATCH /:id` handlers on the four existing controllers/services (rename + disable). The new PATCH endpoints are role-gated with `@UseGuards(RolesGuard)` + `@Roles('OWNER_ADMIN')` (mirrors `users.controller.ts`); create/list reads stay open for the entry forms.
- New read endpoint `GET /materials/thresholds` (only new read this story adds) powers the Settings "Low-stock Thresholds" summary card.
- Extended the four dedicated admin pages with a shared `CategoryRowActions` client component (rename inline + disable/enable toggle, one implementation per AD-5). The editor auto-closes after a successful rename via a name-based React `key` remount (no `setState`-in-effect, which CI's jsx-a11y/react-hooks rules reject).
- Entry forms now hide disabled types (`machinery/new`, `vehicles/new`, `expenses/new` filter `isActive`; `team/new` already did) — the concrete AC #1 proof. Web tests assert a disabled Machinery/Vehicle Type is absent from the picker.
- Settings "Categories & Config" section rebuilt as a card grid: Employment/Machinery/Vehicle Types + Expense Categories + Material Categories each link out to their dedicated admin route (Edit), and Low-stock Thresholds is a read-only discovery card (AC #3).
- Verified: `pnpm --filter @azentisfieldos/api test` (749 pass) + api typecheck; `pnpm --filter @azentisfieldos/web` typecheck/lint/test (539 pass)/build; `pnpm --filter @azentisfieldos/shared typecheck`.

### File List

- infra/prisma/schema.prisma (MachineryType/VehicleType/ExpenseCategory isActive)
- infra/prisma/migrations/20260826185659_add_category_is_active_fields/migration.sql (new)
- packages/shared/src/schemas/machinery-type.ts, vehicle-type.ts, expense-category.ts, employment-type.ts (update schemas)
- apps/api/src/team/employment-types.service.ts, employment-types.controller.ts (+ .controller.spec.ts)
- apps/api/src/assets/machinery-types.service.ts, machinery-types.controller.ts (+ .controller.spec.ts)
- apps/api/src/assets/vehicle-types.service.ts, vehicle-types.controller.ts (+ .controller.spec.ts)
- apps/api/src/expenses/expense-categories.service.ts, expense-categories.controller.ts (+ .service.spec.ts)
- apps/api/src/materials/materials.service.ts, materials.controller.ts (+ .controller.spec.ts — thresholds)
- apps/web/app/(app)/_components/category-row-actions.tsx (new)
- apps/web/app/(app)/team/employment-types/page.tsx, actions.ts
- apps/web/app/(app)/machinery-vehicles/machinery-types/page.tsx, actions.ts (+ page.test.tsx)
- apps/web/app/(app)/machinery-vehicles/vehicle-types/page.tsx, actions.ts (+ page.test.tsx)
- apps/web/app/(app)/expenses/categories/page.tsx, actions.ts
- apps/web/app/(app)/machinery-vehicles/machinery/new/page.tsx (+ page.test.tsx), vehicles/new/page.tsx (+ page.test.tsx)
- apps/web/app/(app)/expenses/new/page.tsx
- apps/web/app/(app)/settings/page.tsx (Categories & Config section)
