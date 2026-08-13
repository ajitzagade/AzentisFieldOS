# Story 4.2: Manage Sizes/Specifications & Units per Material

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As Owner/Admin,
I want to define Sizes/Specifications and a Unit of Measure per Material,
so that every transaction against that Material uses consistent, correct units and options.

## Acceptance Criteria

1. **Given** a Material (e.g. "RCC Pipe"), **when** I add Sizes/Specifications (e.g. 300mm, 450mm, 600mm, 900mm), **then** each Size is immediately selectable wherever that Material is picked. (FR-5)
2. Adding a new Size to a Material later does not disturb existing Stock records tied to that Material's prior Sizes — Sizes are purely additive; there is no update or delete path for an existing `MaterialSize`. (FR-5)
3. A Material's Unit is enforced consistently — every transaction type referencing it uses the same Unit, never a mismatched one. (FR-6 — see Dev Notes: already satisfied by the Story 4.1 schema, verified here rather than newly built.)
4. A Material with zero Sizes remains valid and displays as `—` in the Sizes column, exactly as it does today for Materials created in Story 4.1 before this story ships.

## Tasks / Subtasks

- [x] Task 1 — Shared Zod schema (AC: #1, #2)
  - [x] Add `createMaterialSizeSchema` to `packages/shared/src/schemas/material.ts`: `{ label: z.string().min(1).max(50) }`. No update/delete schema.
  - [x] Export from `packages/shared/src/index.ts`.
- [x] Task 2 — `apps/api` (AC: #1, #2)
  - [x] Add `POST /materials/:materialId/sizes` and `GET /materials/:materialId/sizes` to `materials.controller.ts`/`materials.service.ts`. `create` translates a `P2002` (duplicate `(materialId, label)`) into a `400 BadRequestException` with a clear message, and a `P2003` (materialId doesn't exist) into a `400` too.
  - [x] No `PATCH`/`DELETE` endpoint for `MaterialSize`.
  - [x] `GET /materials` already includes `sizes` (Story 4.1's Task 3).
- [x] Task 3 — `apps/web` UI (AC: #1, #2, #4)
  - [x] Added a "Sizes / Specifications" section to `apps/web/app/(app)/materials/[id]/edit/page.tsx` — read-only chips + add-Size form, as a separate `SizesSection` client component (own `<form>`, since HTML forbids nesting a form inside the main Material edit form).
  - [x] Materials list page unchanged, as expected.
- [x] Task 4 — Verify FR-6's consistency guarantee, don't build one (AC: #3)
  - [x] Confirmed (documentation-only, see Completion Notes): `Material.unitId` is the sole Unit reference in the schema; no transaction endpoints exist yet (Epic 5) for a Unit to drift from.
- [x] Task 5 — Tests (AC: all)
  - [x] `createMaterialSizeSchema` tested via `ZodValidationPipe` in `materials.controller.spec.ts` (same reasoning as Story 4.1: standalone `packages/shared` test files don't execute in this codebase — no test runner configured there).
  - [x] `materials.controller.spec.ts` extended: `createSize`/`listSizes` delegation; P2002 → 400 with the exact message; P2003 → 400; other errors re-thrown.
  - [x] `apps/web` component tests: `SizesSection` renders read-only chips with no edit/remove control, an explicit empty state for zero Sizes, and the add-Size form; `add-size-action.test.ts` covers validation/success/duplicate-400 paths.

## Dev Notes

**This story is smaller than its title suggests.** Read Story 4.1's Dev Notes first — it already explains why: FR-6's "enforced consistently" requirement is satisfied structurally by `Material.unitId` being a single required foreign key (`schema.prisma:92-93`); there is no per-transaction Unit field anywhere in the schema for it to drift from. This story's actual net-new work is **Sizes/Specifications only** (FR-5). Task 4 exists to make that verification explicit and citable, not to write a validator — do not build a "Unit consistency checker," there is nothing for it to check.

**`MaterialSize` is additive-only by design, not by omission.** The AC is explicit: "adding a new Size later doesn't disturb existing Stock records tied to prior Sizes." The simplest way to make that true and *keep* it true is to never allow an existing `MaterialSize` row to be edited or deleted — future `GodownStock`/`SiteStock`/`Purchase`/etc. rows (Epic 5) key off `materialSizeId`, so a Size that can silently change label or disappear would corrupt those relations' meaning retroactively. This is the same non-destructive principle `AD-9` applies to transaction-history tables, applied here to a master-data table for a different but compatible reason — don't add a `PATCH /materials/:materialId/sizes/:sizeId` "just for completeness."

**Depends on Story 4.1 being merged first**, specifically: the `Material`/`MaterialCategory`/`Unit` schemas, the `materials.controller.ts`/`materials.service.ts` files (this story extends them, doesn't create new ones), and the `/materials/[id]/edit` page. If Story 4.1 is not yet done, block on it rather than duplicating its scaffolding.

**Architecture constraints in force:** same set as Story 4.1 — AD-3, AD-4, AD-5, AD-6, AD-7. Nothing new introduced by this story changes those.

### Project Structure Notes

- No new top-level files beyond what Story 4.1 already created — this story is additive within `materials.controller.ts`, `materials.service.ts`, `packages/shared/src/schemas/material.ts`, and `apps/web/app/(app)/materials/[id]/edit/page.tsx`.
- No conflicts detected, provided Story 4.1 has landed first (see Dev Notes dependency callout).

### References

- [Source: _bmad-output/specs/spec-AzentisFieldOS/functional-requirements.md#CAP-2 — Material Catalog Configuration] (FR-5, FR-6)
- [Source: _bmad-output/planning-artifacts/stories/phase-3-materials-inventory/epic-4-material-catalog-configuration/story-4.2-sizes-units.md]
- [Source: infra/prisma/schema.prisma#MaterialSize — `@@unique([materialId, label])`]
- [Source: _bmad-output/implementation-artifacts/4-1-manage-material-categories-materials.md — this story's direct prerequisite]
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/06-materials.html — chip/chip-row treatment for Sizes]
- [Source: _bmad-output/planning-artifacts/architecture/architecture-AzentisFieldOS-2026-08-11/ARCHITECTURE-SPINE.md#AD-9 — append-only rationale, applied here by analogy]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

- Same verification constraints as Story 4.1: `apps/api`'s dev server can't boot outside Vitest (pre-existing, unrelated TODO), so verification is typecheck + lint + Vitest + `next build`, not a live browser session against a running API.

### Completion Notes List

- Task 4 (FR-6 verification) is confirmed exactly as the story's own Dev Notes predicted: `Material.unitId` (`schema.prisma`) is the only place a Unit is referenced anywhere in the schema — no transaction table (Purchase/Movement/Consumption/etc.) exists yet to reference a Unit independently, since those are Epic 5. There is structurally nothing for a "Unit consistency checker" to check yet; no code written for this task, as instructed.
- `SizesSection` is a separate client component with its own `<form>`/`useActionState`, rendered as a sibling `Card` below the main `EditMaterialForm`, not nested inside it — HTML doesn't allow a `<form>` inside another `<form>`, and Sizes are a genuinely separate endpoint/lifecycle (`POST /materials/:materialId/sizes`) from the Material `PATCH`, so this was the correct structure independent of the HTML constraint too.
- After a successful `addMaterialSizeAction`, `revalidatePath` on the edit page's own route is enough for the new chip to appear — Next.js re-fetches the Server Component tree (including `material.sizes`, passed down as a prop) automatically on a Server Action's `revalidatePath`, no client-side `router.refresh()` needed.
- Verification: `pnpm --filter @azentisfieldos/api test` — 95 passed (87 from Story 4.1 + 8 new); `pnpm --filter @azentisfieldos/web test` — 105 passed (99 from Story 4.1 + 6 new); `pnpm typecheck`, `pnpm lint`, and `pnpm --filter @azentisfieldos/web build` all clean.

### File List

- `packages/shared/src/schemas/material.ts` — UPDATE: `createMaterialSizeSchema`.
- `apps/api/src/materials/materials.service.ts` — UPDATE: `createSize`, `listSizes`.
- `apps/api/src/materials/materials.controller.ts` — UPDATE: `POST`/`GET /materials/:materialId/sizes`.
- `apps/api/src/materials/materials.controller.spec.ts` — UPDATE: sizes delegation + P2002/P2003 tests.
- `apps/web/app/(app)/materials/[id]/edit/add-size-action.ts` — NEW.
- `apps/web/app/(app)/materials/[id]/edit/add-size-action.test.ts` — NEW.
- `apps/web/app/(app)/materials/[id]/edit/sizes-section.tsx` — NEW.
- `apps/web/app/(app)/materials/[id]/edit/sizes-section.test.tsx` — NEW.
- `apps/web/app/(app)/materials/[id]/edit/page.tsx` — UPDATE: wires `SizesSection` in.
