---
baseline_commit: 4f33962f5ba714deb608278e32224cdb9e049d6f
---

# Story 9.1: Manage Vendor Records

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As Owner/Admin,
I want to create and maintain Vendor records (name, contact person, phone, email, address, materials/services supplied),
so that I have one accurate list of who I buy from.

## Acceptance Criteria

1. **Given** I create a Vendor with contact and supplied materials/services, **when** I save, **then** the Vendor is immediately available in every Purchase/RMC picker across the product. (FR-39)
2. This uses a normal Edit affordance — Vendor master data is not transaction history. (Epic Implementation Notes)
3. "Materials / services supplied" displays as a set of discrete chips/tags (per the mockup), not a single free-text blob a reader has to parse.

## Tasks / Subtasks

- [x] Task 1 — Schema fix: `materialsSupplied` must be a list, not a single string (AC: #3)
  - [x] `infra/prisma/schema.prisma`'s `Vendor.materialsSupplied` is currently `String?` — a single free-text field — but `12-vendors.html`'s list page and the "Materials & services supplied" section on `13-vendor-detail.html` both render it as multiple independent chips ("Cement," "Steel," "Aggregates"). A single string forces either a fragile comma-split at render time (breaks the moment a single item legitimately contains a comma, e.g. "Aggregates, Fine & Coarse") or loses the discrete-item structure the design calls for. Change it to `materialsSupplied String[] @default([])` — Postgres/Prisma supports native scalar arrays, and these are free-text tags rather than FKs to `Material`, so no join table is needed (contrast Epic 4's `MaterialSize`, which needed a real relation because it's referenced by Stock rows — these tags aren't referenced by anything).
  - [x] Run `pnpm db:generate`.
- [x] Task 2 — Shared Zod schema (AC: #1, #2, #3)
  - [x] Create `packages/shared/src/schemas/vendor.ts`: `createVendorSchema` (`name: z.string().min(1).max(200)`, `contactPerson`/`phone`/`email`/`address` optional strings, `email` using `z.email()` when present, `materialsSupplied: z.array(z.string().min(1).max(100)).default([])`), `updateVendorSchema` (`.partial()`).
  - [x] Export from `packages/shared/src/index.ts`.
- [x] Task 3 — `apps/api` (AC: #1, #2)
  - [x] `apps/api/src/vendors/vendors.controller.ts` + `.service.ts` + `.module.ts`, registered in `app.module.ts`. `POST /vendors`, `GET /vendors`, `PATCH /vendors/:id`, `GET /vendors/:id`. `update` translates `P2025` the same way `SitesService.update` does.
- [x] Task 4 — `apps/web` UI (AC: #1, #2, #3)
  - [x] Replace the stub `apps/web/app/(app)/vendors/page.tsx` with the real Vendor list: `DataTable` with columns Vendor / Contact person / Phone / Materials-services (chip row) / [Story 9.2 adds the remaining two columns] , each row linking to the Vendor detail page.
  - [x] `apps/web/app/(app)/vendors/new/page.tsx` — create form. "Materials / services supplied" is a simple repeatable tag input (add-on-Enter or add-on-comma, rendered as removable chips) — a small, self-contained control; if `packages/ui` doesn't have one yet, build the minimal version inline in this form rather than generalizing it into a new shared primitive prematurely (a second consumer would justify promoting it to `packages/ui`, per this project's stated "no premature abstraction" convention — none exists yet).
  - [x] `apps/web/app/(app)/vendors/[id]/page.tsx` — detail page shell (profile fields, matching `13-vendor-detail.html`'s "meta" layout: Contact person / Phone / Email / Address / Materials & services supplied). Story 9.2 adds the Purchase history section to this same page.
  - [x] `apps/web/app/(app)/vendors/[id]/edit/page.tsx` — edit form, same fields as create.
- [x] Task 5 — Tests (AC: all)
  - [x] Zod tests, including `materialsSupplied` accepting an empty array and rejecting an empty-string item.
  - [x] `vendors.controller.spec.ts` / `.service.spec.ts` following `sites.controller.spec.ts`'s structure.

### Review Findings

- [x] [Review][Decision] AC #1 unmet: Vendor not wired into existing Purchase/RMC "picker" forms [apps/web/app/(app)/movements/purchases/purchase-form.tsx, apps/web/app/(app)/daily-activity/_components/dsr-desktop-form.tsx] — **resolved: user chose to extend this story's scope now.** `PurchaseForm`'s "Vendor ID" `TextField` (and all 3 of its call sites — Purchase new/correct, Vendor→Site new) replaced with a `SelectField` sourced from `GET /vendors`; `DsrDesktopForm`'s RMC-row "Vendor ID" `TextField` replaced with the same, fetched via the same `useEffect` pattern already used for Sites in that component. Tests added/updated at each call site.
- [x] [Review][Patch] Migration destroyed existing `Vendor.materialsSupplied` data with no backfill [infra/prisma/migrations/20260817090000_vendor_materials_supplied_array/migration.sql] — fixed: migration now renames the old column, backfills by splitting on comma (trimmed, empty entries dropped) into the new array column, then drops the old column. Verified against a scratch Postgres database.
- [x] [Review][Patch] `MaterialsSuppliedField`'s tag dedupe was case-sensitive, so "Cement" and "cement" could coexist as separate chips on one Vendor (whitespace was already trimmed before this fix) [apps/web/app/(app)/vendors/materials-supplied-field.tsx:22] — fixed: dedupe now compares `.toLowerCase()`
- [x] [Review][Defer] No pagination or search/filter on `GET /vendors` (nor its list-page UI) [apps/api/src/vendors/vendors.service.ts:15] — deferred, systemic pattern across the whole codebase (Sites/Materials/Team lists are all unbounded too), already logged repeatedly in prior stories' reviews
- [x] [Review][Defer] No authorization guard on `VendorsController`'s mutating endpoints [apps/api/src/vendors/vendors.controller.ts] — deferred, matches the already-tracked epic-wide "no per-request auth yet" TODO in AGENTS.md, zero controllers in `apps/api` have guards today
- [x] [Review][Defer] Vendor pages `throw new Error(...)` on fetch failure instead of AD-6's shared error-state component [apps/web/app/(app)/vendors/page.tsx:26] — deferred, identical to the established pattern in `sites/page.tsx`/`materials/page.tsx`/`team/page.tsx`, already logged repeatedly in prior stories' reviews

## Dev Notes

**Small, additive schema fix — the only one this story needs.** Unlike several prior epics, `Vendor`'s core fields already match FR-39 exactly; the only mismatch found was the array-vs-string shape for `materialsSupplied`, driven directly by the mockup's chip-based display rather than by an FR/architecture gap. No `isActive`/disable field is added here — FR-39 and the epic doc don't ask for one (unlike Material, FR-4, which explicitly said "disables"), so don't assume symmetry with Epic 4's pattern where the requirement doesn't call for it.

**Depends on nothing new** beyond the conventions every prior epic already established. Story 9.2 depends on this one for `Vendor` and the detail-page shell.

**Architecture constraints in force:** AD-3, AD-4, AD-5, AD-6, AD-7.

### Project Structure Notes

- New `apps/api/src/vendors/` module (single resource, simplest shape yet — no sibling lookup tables needed, unlike Epic 4/6/8's category/type tables).
- `apps/web/app/(app)/vendors/page.tsx` already exists as a stub — replaced here.

### References

- [Source: _bmad-output/specs/spec-AzentisFieldOS/functional-requirements.md#CAP-11 — Vendor Management] (FR-39)
- [Source: _bmad-output/planning-artifacts/epics/phase-5-assets-suppliers/epic-9-vendors.md]
- [Source: _bmad-output/planning-artifacts/stories/phase-5-assets-suppliers/epic-9-vendors/story-9.1-manage-vendor-records.md]
- [Source: infra/prisma/schema.prisma#Vendor — materialsSupplied array-vs-string gap this story's Task 1 fixes]
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/12-vendors.html, 13-vendor-detail.html]

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (claude-sonnet-5)

### Debug Log References

### Completion Notes List

- Implemented together with Story 9.2 in one pass (same Vendor detail page, same list page) — see that story's Completion Notes for the Purchase History / summary-column half of the work.
- Task 1: `Vendor.materialsSupplied` changed `String?` → `String[] @default([])`. No local Postgres reachable in this environment to run `prisma migrate dev` (`DATABASE_URL` points at a role/database that doesn't exist here — pre-existing environment gap, not introduced by this story), so the migration was hand-authored at `infra/prisma/migrations/20260817090000_vendor_materials_supplied_array/migration.sql` following the same drop-and-recreate-column shape Prisma's own diff engine produces for an incompatible scalar→array type change (same approach Story 8.1 documented for its own migration). `pnpm db:generate` ran cleanly (schema→client codegen doesn't require a live DB connection).
- Task 2: `updateVendorSchema` deviates from the story text in one place — the story says "no default-on-partial trap here," but `materialsSupplied` does carry `.default([])` in `createVendorSchema`, which is exactly the trap `updateSiteSchema` guards against for `status`. Applied the same override-before-`.partial()` fix, and additionally made `contactPerson`/`phone`/`email`/`address` `.nullable()` in the update schema (matching `updateTeamMemberSchema`'s established precedent) so the edit form's full-replace PATCH can actually clear a field, not just silently drop it.
- Task 3/4: `VendorsService.purchases`/`.purchaseSummary` (Story 9.2) call into `PurchasesService.listByVendor`/`.summaryForVendor` rather than querying `Purchase` directly — `InventoryModule` now exports `PurchasesService` for `VendorsModule` to import.
- The `MaterialsSuppliedField` tag input lives at `apps/web/app/(app)/vendors/materials-supplied-field.tsx`, shared by both the create and edit forms — not promoted to `packages/ui` per the story's explicit guidance (no second consumer outside this route yet).
- Final verification: `apps/api` (404 passing / 51 skipped, 49 files) and `apps/web` (429 passing, 112 files) both green; both packages' `typecheck` clean; root `pnpm lint` clean except 7 pre-existing `@typescript-eslint/no-unsafe-assignment` errors in `apps/api/src/team/payments.service.spec.ts` (Epic 7 work already uncommitted in the tree before this story started, untouched by this diff — confirmed `apps/api/src/vendors/**` and `apps/api/src/inventory/purchases.service.spec.ts` lint clean in isolation); `apps/web` production build succeeds and registers all four new `/vendors` routes.

### File List

- `infra/prisma/schema.prisma` (modified — `Vendor.materialsSupplied`)
- `infra/prisma/migrations/20260817090000_vendor_materials_supplied_array/migration.sql` (new)
- `packages/shared/src/schemas/vendor.ts` (new)
- `packages/shared/src/index.ts` (modified)
- `apps/api/src/vendors/vendors.controller.ts` (new)
- `apps/api/src/vendors/vendors.service.ts` (new)
- `apps/api/src/vendors/vendors.module.ts` (new)
- `apps/api/src/vendors/vendors.controller.spec.ts` (new)
- `apps/api/src/vendors/vendors.service.spec.ts` (new)
- `apps/api/src/app.module.ts` (modified — registers `VendorsModule`)
- `apps/web/app/(app)/vendors/page.tsx` (replaced stub)
- `apps/web/app/(app)/vendors/page.test.tsx` (new)
- `apps/web/app/(app)/vendors/materials-supplied-field.tsx` (new)
- `apps/web/app/(app)/vendors/materials-supplied-field.test.tsx` (new)
- `apps/web/app/(app)/vendors/new/page.tsx` (new)
- `apps/web/app/(app)/vendors/new/page.test.tsx` (new)
- `apps/web/app/(app)/vendors/new/actions.ts` (new)
- `apps/web/app/(app)/vendors/new/actions.test.ts` (new)
- `apps/web/app/(app)/vendors/[id]/page.tsx` (new — includes Story 9.2's Purchase History section)
- `apps/web/app/(app)/vendors/[id]/page.test.tsx` (new)
- `apps/web/app/(app)/vendors/[id]/edit/page.tsx` (new)
- `apps/web/app/(app)/vendors/[id]/edit/page.test.tsx` (new)
- `apps/web/app/(app)/vendors/[id]/edit/actions.ts` (new)
- `apps/web/app/(app)/vendors/[id]/edit/actions.test.ts` (new)
- `apps/web/app/(app)/vendors/[id]/edit/edit-vendor-form.tsx` (new)
- Also touched by Story 9.2 (see that story's File List): `apps/api/src/inventory/purchases.service.ts`, `apps/api/src/inventory/purchases.service.spec.ts`, `apps/api/src/inventory/inventory.module.ts`

**Post-review (resolving the AC #1 decision item — wiring the Vendor picker into existing Purchase/RMC forms):**

- `apps/web/app/(app)/movements/purchases/purchase-form.tsx` (modified — Vendor `TextField` → `SelectField`)
- `apps/web/app/(app)/movements/purchases/purchase-form.test.tsx` (modified)
- `apps/web/app/(app)/movements/purchases/new/page.tsx` (modified — fetches and passes `vendors`)
- `apps/web/app/(app)/movements/purchases/new/page.test.tsx` (modified)
- `apps/web/app/(app)/movements/purchases/[id]/correct/page.tsx` (modified)
- `apps/web/app/(app)/movements/purchases/[id]/correct/page.test.tsx` (modified)
- `apps/web/app/(app)/movements/vendor-to-site/new/page.tsx` (modified)
- `apps/web/app/(app)/movements/vendor-to-site/new/page.test.tsx` (modified)
- `apps/web/app/(app)/daily-activity/_components/dsr-desktop-form.tsx` (modified — RMC-row Vendor `TextField` → `SelectField`, fetched client-side)
- `apps/web/app/(app)/daily-activity/new/page.test.tsx` (modified)
- `apps/web/app/(app)/daily-activity/[id]/correct/page.test.tsx` (modified)
