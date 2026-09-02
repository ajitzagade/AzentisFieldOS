# Story 18.1: Manage Subcontractor Records

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As Owner/Admin,
I want to create and maintain Subcontractor records (name, contact person, phone, email, address, work categories/specialties),
so that I have one accurate list of who I outsource site work to, ready to attach Site Contracts against.

## Acceptance Criteria

1. **Given** I create a Subcontractor with contact details and work categories, **when** I save, **then** it's immediately available in the Subcontractor picker used by Story 18.2's Site Contract form. (FR-55)
2. This uses a normal Edit affordance — Subcontractor master data is not transaction history (same rule as Vendor, Epic 9 Implementation Notes).
3. "Work categories" displays as a set of discrete chips/tags, not a single free-text blob.
4. Deleting a Subcontractor is a soft delete: it disappears from every list/picker, but the row and any Site Contracts/history pointing at it stay in the database untouched. Owner/Admin only.
5. The Subcontractors list supports search by name and pagination, matching every other master-data list in the product (Epic 16 platform conventions).
6. The list, create, and edit screens carry loading/empty/success/error/validation-failure states per AD-6 — no ad-hoc partial-state screen.

## Tasks / Subtasks

- [ ] Task 1 — Prisma model (AC: #1, #2, #4)
  - [ ] Add to `infra/prisma/schema.prisma`:
    ```prisma
    model Subcontractor {
      id             String    @id @default(uuid(7))
      name           String
      contactPerson  String?
      phone          String?
      email          String?
      address        String?
      workCategories String[]  @default([])
      // Soft delete — same rule as Vendor.deletedAt/Site.deletedAt.
      deletedAt      DateTime?

      siteContracts SiteContract[]
    }
    ```
    Deliberately no `createdAt`/`updatedAt` — mirrors `Vendor` exactly (the closer analog: an external party, not the tenant's own Site), not `Site` (which does carry timestamps). `SiteContract` (Story 18.2) is a stub relation target here — its full model lands in that story; this story only needs `Subcontractor` to compile, so add the empty-array relation now and let 18.2 fill in the other side.
  - [ ] Run `pnpm db:generate` and author the migration (see Dev Notes on the local-Postgres gap Story 9.1 hit — if the same gap exists, hand-author the migration SQL following Prisma's own diff shape, as Story 8.1/9.1 did).
- [ ] Task 2 — Shared Zod schema (AC: #1, #2, #3)
  - [ ] Create `packages/shared/src/schemas/subcontractor.ts`, structured identically to `packages/shared/src/schemas/vendor.ts`:
    - `createSubcontractorSchema`: `name: z.string().min(1).max(200)`, `contactPerson`/`phone`/`address` optional strings (same max-lengths as Vendor), `email: z.email().max(200).optional()`, `workCategories: z.array(z.string().min(1).max(100)).default([])`.
    - `updateSubcontractorSchema`: spread `createSubcontractorSchema.shape`, override `contactPerson`/`phone`/`email`/`address` to `.nullable()` and `workCategories` to the bare array (no `.default()`) *before* calling `.partial()` — this is the exact default-on-partial trap `updateVendorSchema` already documents; copy its comment, don't silently drop the fix.
  - [ ] Export both from `packages/shared/src/index.ts`.
- [ ] Task 3 — Reusable tags field: promote, don't re-copy (AC: #3)
  - [ ] `apps/web/app/(app)/vendors/materials-supplied-field.tsx` was deliberately kept local to the Vendor route when it shipped (Story 9.1's Dev Notes: "a second consumer would justify promoting it to `packages/ui`"). This story *is* that second consumer. Extract the component into `packages/ui/src/components/tags-field.tsx` (generic prop names — `label`, `name`, `values`, `onChange`, not Vendor-specific), re-export it from `packages/ui`'s index, and update `apps/web/app/(app)/vendors/materials-supplied-field.tsx` to either re-export the shared component or be deleted with call sites pointed at the new one directly (confirm which by checking whether any Vendor-route test imports the old path by name). Do not leave two copies of the same tag-input behavior.
  - [ ] Use the promoted field for Subcontractor's `workCategories` in both the create and edit forms.
- [ ] Task 4 — `apps/api` module (AC: #1, #2, #4, #5)
  - [ ] `apps/api/src/subcontractors/subcontractors.controller.ts` + `.service.ts` + `.module.ts`, registered in `app.module.ts`. This module will also host Story 18.2's `SiteContractsController`/`Service`, 18.3's `WorkEntriesController`/`Service`, and 18.4's `PaymentsController`/`Service` as siblings — same shape as `apps/api/src/team/` hosting `TeamMembersController` + `AdvancesController` + `PaymentsController` + `WorkRecordsController`. Name the module `SubcontractorsModule` now so later stories add siblings, not a new module.
  - [ ] Routes, mirroring `VendorsController` exactly: `POST /subcontractors`, `GET /subcontractors` (`q`/`page`/`pageSize`/`sort`/`order` via the shared `paginationParams` helper — sortable fields `name`/`contactPerson`/`phone`), `PATCH /subcontractors/:id`, `GET /subcontractors/:id`, `DELETE /subcontractors/:id` gated `@Roles('OWNER_ADMIN')` via `@UseGuards(RolesGuard)` at controller level (a no-op on every other handler, exactly like `VendorsController`).
  - [ ] `SubcontractorsService`: `create`, `list` (soft-delete filter `deletedAt: null` + optional `q` name search, paginated-or-not via `paginationParams`), `update` (404s on a soft-deleted row, translates Prisma `P2025` to `NotFoundException` — copy `VendorsService.update` verbatim), `findOne` (throws `NotFoundException` when missing or `deletedAt` is set), `softDelete` (stamps `deletedAt`, never a hard `DELETE`, 404s if already deleted).
- [ ] Task 5 — Tests (AC: all)
  - [ ] Zod schema tests: valid payload, `workCategories` accepting `[]` and rejecting an empty-string item, `updateSubcontractorSchema.parse({})` proving a true no-op (the default-on-partial regression test).
  - [ ] `subcontractors.controller.spec.ts` / `.service.spec.ts` following `vendors.controller.spec.ts`/`.service.spec.ts` structure exactly.
  - [ ] `subcontractors-soft-delete.spec.ts` — copy `vendors-soft-delete.spec.ts`'s three cases verbatim (findOne 404s on deleted, update 404s and never calls `prisma.update`, softDelete stamps `deletedAt` and 404s if already deleted) plus the `DELETE /subcontractors/:id` → `@Roles(['OWNER_ADMIN'])` metadata assertion.
- [ ] Task 6 — `apps/web` UI (AC: #1, #2, #3, #5, #6)
  - [ ] `apps/web/app/(app)/subcontractors/page.tsx` — list page: `DataTable` (columns: Name / Contact person / Phone / Work categories chip row), search box wired to `?q=`, pagination controls, each row linking to `/subcontractors/[id]`. Follow `vendors/page.tsx` + `vendors/vendors-list-client.tsx`'s split (server component fetch, client component for search/pagination interactivity) — this list already needs pagination from day one (unlike Vendor's original story, which shipped unpaginated and was later flagged; Epic 16's platform conventions exist now, use them).
  - [ ] `apps/web/app/(app)/subcontractors/new/page.tsx` + `parse.ts` + `actions.ts` — create form. `parse.ts` holds the sole FormData→schema coercion (`parseCreateSubcontractorForm`), imported by both `actions.ts`'s Server Action and the client's `useClientValidation` hook (AD-7, mandatory per AGENTS.md's Supervisor-simplicity conventions for every new form — do not inline the coercion into the action). Copy `vendors/new/{page,parse,actions}.tsx` structure.
  - [ ] `apps/web/app/(app)/subcontractors/[id]/page.tsx` — detail page shell for this story: header (name, contact fields, work-category chips), Edit button, Delete button (`DeleteEntityButton`, gated client-side on `viewerRole === "OWNER_ADMIN"` via `getViewerRole()`, server enforces regardless). Story 18.5 adds the "Site Contracts" history section to this same page — leave a clear insertion point, don't build a placeholder table for it now.
  - [ ] `apps/web/app/(app)/subcontractors/[id]/edit/page.tsx` + `parse.ts` + `actions.ts` + `edit-subcontractor-form.tsx` — same fields as create, same `parse.ts`/`useClientValidation` pairing.
  - [ ] Every fetch (`GET /subcontractors`, `GET /subcontractors/:id`) renders the shared AD-6 state set — loading skeleton, empty state ("No Subcontractors yet — add your first one"), error state (never a raw `throw new Error(...)`; if this codebase's current Vendor/Sites pages still do that, don't copy the anti-pattern forward here even though it's an already-logged, deferred finding on those older pages).
- [ ] Task 7 — Nav (AC: #1)
  - [ ] `apps/web/app/(app)/_components/nav-config.ts`: add `{ href: "/subcontractors", label: "Subcontractors", icon: UserIcon }` to `NAV_GROUPS`'s **Money** group (alongside Vendors/Expenses/RMC — it's an external-party-with-payment-history concept, same group). `UserIcon` (singular) is unused elsewhere in nav-config today; `UsersIcon` (plural) is already Team's icon — don't reuse it and create a visual collision. Do **not** add to `SUPERVISOR_NAV_GROUPS` or `SUPERVISOR_QUICK_BAR_ITEMS` — Supervisors reach Site Contract work-entry logging via the Site detail page (Story 18.5), not via this master-data list; this follows the established de-emphasis-not-removal rule (direct URL still works, `@Roles` isn't even involved here since this list has no Supervisor-restricted read).

## Dev Notes

**Naming:** the user-facing and code-level entity is **"Subcontractor,"** never "Contractor" — `glossary.md`'s **Contractor / Company** term already means the tenant itself. Every label, route segment, table name, and variable name in this story uses "Subcontractor" — a stray "Contractor" anywhere in new code or copy is a defect, not a style nit, because it will misparse against the app's other own dashboards/reports that already use "Contractor" for the tenant.

**This is a smaller, cleaner version of Story 9.1 (Manage Vendor Records) — reuse its shape wholesale, don't rediscover it.** The one deliberate difference: Story 9.1 shipped `materialsSupplied` as a Vendor-local component and explicitly said a second consumer would justify promoting it — Task 3 above is that promotion. Do it as part of this story, not a follow-up; leaving two near-identical tag-input implementations in the tree is exactly the "reinventing wheels" mistake this workflow exists to prevent.

**Do not add an `isActive`/disable flag.** FR-55 asks for soft-delete only (mirroring Vendor, which also has no disable flag despite Material's FR-4 having one) — don't assume symmetry with a pattern this FR doesn't call for.

**Pagination/search from day one, unlike the original Vendor story.** Story 9.1 shipped without pagination and it was logged as a deferred finding; Epic 16 (`16-1-list-search-filter-sort-pagination-platform.md`) has since established the `paginationParams` helper and the `q`/`page`/`pageSize`/`sort`/`order` query-param convention used by every list built after it (see `VendorsController.list`'s current signature, which now *does* have these params — the version Story 9.1 originally shipped did not). Build this list against the current convention; don't reintroduce the gap.

**Architecture constraints in force:** AD-3 (apps/api-only DB access), AD-4/AD-5 (design tokens, one primitive per component — the `TagsField` promotion is exactly this rule), AD-6 (full state set), AD-7 (one Zod schema, two run sites via `parse.ts` + `useClientValidation`), AD-11 (two roles only — `DELETE` is the only gated route here).

**Depends on nothing new.** This is the epic's foundation story — 18.2 depends on `Subcontractor` existing to attach a `SiteContract` to.

### Project Structure Notes

- New `apps/api/src/subcontractors/` module — starts with just `SubcontractorsController`/`Service` in this story, but is designed from the start to host three more controller/service pairs across 18.2–18.4 (mirrors `apps/api/src/team/`'s multi-entity module shape, not `apps/api/src/vendors/`'s single-resource shape — don't create a second module later when 18.2 needs one).
- `apps/web/app/(app)/subcontractors/` is a new route tree — no existing stub to replace (unlike `vendors/page.tsx`, which existed as a stub before Story 9.1).
- `packages/ui/src/components/tags-field.tsx` is a new shared primitive (Task 3) — the first change to `packages/ui` this epic needs; everything else in Epic 18 reuses existing primitives.

### References

- [Source: _bmad-output/specs/spec-AzentisFieldOS/functional-requirements.md#CAP-17 — Subcontractor Management] (FR-55)
- [Source: _bmad-output/specs/spec-AzentisFieldOS/glossary.md — Subcontractor, and the Contractor/Company naming-collision note]
- [Source: _bmad-output/planning-artifacts/epics/phase-9-subcontractor-management/epic-18-subcontractor-management.md]
- [Source: _bmad-output/implementation-artifacts/9-1-manage-vendor-records.md — the direct template this story mirrors]
- [Source: apps/api/src/vendors/vendors.controller.ts, vendors.service.ts, vendors.module.ts, vendors-soft-delete.spec.ts — exact code shape to replicate]
- [Source: packages/shared/src/schemas/vendor.ts — exact schema shape, including the default-on-partial trap and nullable-on-update pattern]
- [Source: apps/web/app/(app)/vendors/new/parse.ts, actions.ts — parse.ts + Server Action pairing to replicate]
- [Source: infra/prisma/schema.prisma#Vendor — the model this story's Subcontractor model mirrors field-for-field]
- [Source: apps/api/src/common/pagination.ts — shared `paginationParams` helper]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
