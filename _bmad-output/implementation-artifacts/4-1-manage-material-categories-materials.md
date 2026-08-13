# Story 4.1: Manage Material Categories & Materials

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As Owner/Admin,
I want to add, edit, and disable Material Categories and Materials,
so that my catalog reflects what I actually stock, without losing history when something is discontinued.

## Acceptance Criteria

1. **Given** I create a Category and add Materials to it, **when** I save, **then** the Category and Materials are immediately available in every Material picker across the product. (FR-4)
2. **Given** a Material I disable, **when** I view existing Purchases/Movements/Consumption that reference it, **then** that history is untouched and still displays correctly — disabling only hides it from new-entry pickers, never deletes or hides past records. (FR-4)
3. A Material Category can likewise be disabled without deleting it or affecting Materials already assigned to it — disabling only hides it from the Category picker on new Materials. (FR-4, extending the schema per Dev Notes below)
4. Every Material Category, Material, and Unit is admin-configurable — none of these three types is ever hardcoded in `apps/web` or `apps/api`. (NFR-4)
5. Creating a Material requires selecting an existing Category and an existing Unit — the API rejects a Material payload referencing a non-existent `categoryId` or `unitId`.

## Tasks / Subtasks

- [x] Task 1 — Schema: add `isActive` to `MaterialCategory` (AC: #3, #1)
  - [x] In `infra/prisma/schema.prisma`, add `isActive Boolean @default(true)` to the `MaterialCategory` model (currently only `Material` has this field — see Dev Notes "Schema gap" below).
  - [x] Run `pnpm db:generate` from repo root to regenerate the Prisma client into `apps/api/src/generated/prisma`.
- [x] Task 2 — Shared Zod schemas (AC: #1, #2, #3, #5)
  - [x] Create `packages/shared/src/schemas/material-category.ts`: `createMaterialCategorySchema` (`name: z.string().min(1).max(200)`), `updateMaterialCategorySchema` (partial, `isActive` un-defaulted before `.partial()` — see Dev Notes "Zod default-on-partial trap").
  - [x] Create `packages/shared/src/schemas/unit.ts`: `createUnitSchema` (`name: z.string().min(1).max(50)`). No update/disable schema — Unit has no `isActive` column and no rename AC in this story (see Dev Notes "Unit scope").
  - [x] Create `packages/shared/src/schemas/material.ts`: `createMaterialSchema` (`name`, `categoryId: z.uuid()`, `unitId: z.uuid()`), `updateMaterialSchema` (partial over `{ ...createMaterialSchema.shape, isActive: z.boolean() }`, same un-defaulted-before-partial treatment for `isActive`).
  - [x] Export all three from `packages/shared/src/index.ts`.
- [x] Task 3 — `apps/api` resources (AC: #1, #2, #3, #4, #5)
  - [x] `apps/api/src/materials/material-categories.controller.ts` + `.service.ts`: `POST /material-categories`, `GET /material-categories`, `PATCH /material-categories/:id`.
  - [x] `apps/api/src/materials/units.controller.ts` + `.service.ts`: `POST /units`, `GET /units`.
  - [x] `apps/api/src/materials/materials.controller.ts` + `.service.ts`: `POST /materials`, `GET /materials`, `PATCH /materials/:id`. `create` and `update` translate a Prisma foreign-key-violation error (`P2003`) into a `400` via `BadRequestException`, matching `SitesService.update`'s `P2025` → `NotFoundException` translation.
  - [x] `apps/api/src/materials/materials.module.ts` — one `MaterialsModule` housing all three controllers/services. Registered in `apps/api/src/app.module.ts`.
  - [x] `GET /materials` includes `category`, `unit`, and `sizes` relations.
- [x] Task 4 — `apps/web` UI (AC: #1, #2, #3, #4)
  - [x] Replaced the stub `apps/web/app/(app)/materials/page.tsx` with a real list page (Category / Material / Sizes / Unit / Custom Fields / Edit action), all `DataTable` states per AD-6.
  - [x] `apps/web/app/(app)/materials/new/page.tsx` + `new-material-form.tsx` — Server Action form, same pattern as `sites/new`.
  - [x] `apps/web/app/(app)/materials/[id]/edit/page.tsx` + `edit-material-form.tsx` — name/Category/Unit/`isActive` toggle, plain in-place Edit, never `CorrectAction`.
  - [x] `apps/web/app/(app)/materials/categories/page.tsx` — Category list + inline add form + Disable/Enable action.
  - [x] `apps/web/app/(app)/materials/units/page.tsx` — Unit list + inline add form (no disable).
  - [x] Both the new-Material and (implicitly, via the edit page's own picker) forms show "No categories/units yet — create one first" guidance instead of an empty `<select>`.
- [x] Task 5 — Tests (AC: all)
  - [x] Zod schema validation tested inline via `ZodValidationPipe` in each `apps/api` controller spec (`material-categories.controller.spec.ts`, `units.controller.spec.ts`, `materials.controller.spec.ts`) rather than as standalone `packages/shared` `.test.ts` files — see Completion Notes for why the story's literal file-naming suggestion doesn't work in this codebase.
  - [x] `apps/api/src/materials/*.controller.spec.ts` — controller delegation, `ZodValidationPipe` accept/reject cases, P2025/P2003 → Nest-exception translation.
  - [x] Component/page tests for every new `apps/web` page and Server Action, following `apps/web/app/(app)/sites`'s exact test patterns (list rendering, empty state, Server Action validation/success/error paths, client-form pre-fill).

## Dev Notes

**Schema gap (must fix before anything else builds on it):** `infra/prisma/schema.prisma`'s `MaterialCategory` model currently has no `isActive` column — only `Material` does. FR-4 requires disabling *both* Categories and Materials without losing history. Add `isActive Boolean @default(true)` to `MaterialCategory` as Task 1. This is additive and non-breaking (safe to run against the not-yet-migrated schema — no migrations directory exists yet under `infra/prisma/`, so this is folded into whatever the first `pnpm db:migrate:dev` run produces, not a special case).

**Unit scope, split across 4.1/4.2:** FR-6 has two halves. The "define Units" half is this story's job (`createUnitSchema`, minimal create+list only — Unit has no `isActive`, no disable AC exists for it). The "enforced consistently across every transaction type" half needs **no additional code**: `Material.unitId` is a single required foreign key (`schema.prisma:92-93`), so every downstream transaction references `materialSizeId → material → unit` — there is structurally no code path that could attach a mismatched Unit to a Material. Story 4.2 does not need to "enforce" anything for FR-6; it only adds Sizes/Specifications (FR-5). Don't build a Unit-consistency validator — there's nothing for it to check that the schema doesn't already guarantee.

**Why dedicated routes, not a modal:** `06-materials.html`'s mockup shows only an "Add Material" button with no modal markup, and `packages/ui` has no Modal/Dialog component yet (only Button/Card/Badge/DataTable/StatTile/GapFlag/CorrectAction/EmptyState/Field — architecture AD-5 lists modals as a required primitive, but none has been built). Epic 2 already resolved this exact situation for Sites by using a dedicated `/sites/new` route instead of inventing a modal ad hoc. Follow that precedent for Materials/Categories/Units — do not build a one-off modal for this story alone; that would violate AD-5 (one implementation per primitive, living in `packages/ui`) by forking a primitive into a single feature.

**Edit, never Correct:** Material/Category/Unit are catalog config, not transaction history — `DESIGN.md`'s Components section and `EXPERIENCE.md`'s Component Patterns table both carve this out as the deliberate exception to AD-9's append-only rule. Use a normal in-place `PATCH`, exactly like `SitesService.update`. Do not reach for `CorrectAction` here.

**Zod default-on-partial trap:** `packages/shared/src/schemas/site.ts`'s `updateSiteSchema` already hit and fixed this bug — Zod re-applies a field's `.default()` whenever that key is absent from input, independent of `.partial()`. If `updateMaterialSchema`/`updateMaterialCategorySchema` naively did `createXSchema.partial()` and `isActive` had a `.default(true)` anywhere in the base schema, every edit that doesn't touch `isActive` would silently re-enable a disabled Material/Category. Follow `site.ts`'s exact pattern: define `isActive` as bare `z.boolean()` (no default) on the *update* schema specifically, spread over the create schema's shape, then `.partial()`. Write the equivalent of `site.test.ts`'s regression test for both.

**Architecture constraints in force:** AD-3 (`apps/web` never talks to Postgres directly — all calls go through `apps/api` over HTTP, same as the existing `sites` fetch pattern); AD-4 (no literal hex/px values — use the existing `packages/ui` tokens only); AD-5 (compose `Button`/`Card`/`DataTable`/`TextField`/`SelectField`, never fork them); AD-6 (list/detail pages render all of loading/empty/error/success via `DataTable`'s built-in states); AD-7 (one Zod schema per shape, shared front/back — this is the entire point of Task 2); NFR-4 (Category/Material/Unit must never be hardcoded — the whole feature *is* that configurability).

### Project Structure Notes

- Follows the `apps/api/src/sites/` shape exactly (`*.controller.ts`, `*.service.ts`, `*.module.ts`), just fanned out to three related resources under one `materials/` folder and one `MaterialsModule` (they share one Prisma dependency surface and are too small individually to justify three separate modules).
- Follows the `apps/web/app/(app)/sites/` shape for routes: list at `/materials`, create at `/materials/new`, edit at `/materials/[id]/edit`. New sub-routes `/materials/categories` and `/materials/units` have no precedent in the existing tree — first instance of a "nested config list" pattern; keep them visually consistent with the Materials list rather than inventing new layout conventions.
- No conflicts detected against the committed structure (`apps/web/app/(app)/materials/page.tsx` already exists as a stub and is the file this story replaces, not creates).

### References

- [Source: _bmad-output/specs/spec-AzentisFieldOS/functional-requirements.md#CAP-2 — Material Catalog Configuration] (FR-4, FR-6, NFR-4)
- [Source: _bmad-output/planning-artifacts/epics/phase-3-materials-inventory/epic-4-material-catalog-configuration.md]
- [Source: _bmad-output/planning-artifacts/stories/phase-3-materials-inventory/epic-4-material-catalog-configuration/story-4.1-manage-categories-materials.md]
- [Source: _bmad-output/planning-artifacts/architecture/architecture-AzentisFieldOS-2026-08-11/ARCHITECTURE-SPINE.md#AD-3, AD-4, AD-5, AD-6, AD-7]
- [Source: infra/prisma/schema.prisma#MaterialCategory, Unit, Material, MaterialSize]
- [Source: apps/api/src/sites/sites.controller.ts, sites.service.ts, sites.module.ts, sites.controller.spec.ts — the pattern this story's API layer follows verbatim]
- [Source: apps/web/app/(app)/sites/page.tsx — the pattern this story's list page follows verbatim]
- [Source: packages/shared/src/schemas/site.ts — the update-schema default-on-partial pattern this story must replicate]
- [Source: packages/ui/src/components/field.tsx — TextField/SelectField, the only form primitives available]
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/DESIGN.md#Components, EXPERIENCE.md#Component Patterns — Edit-vs-Correct distinction]
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/06-materials.html]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

- Migration for `MaterialCategory.isActive` generated via `prisma migrate diff --from-config-datasource --to-schema infra/prisma/schema.prisma --script` (the standard non-interactive workaround used throughout this project) → `pnpm db:migrate:deploy` → `pnpm db:generate`.
- `apps/api`'s dev server still can't boot outside Vitest (pre-existing, documented `AGENTS.md` TODO, not touched by this story) — verification here is typecheck + lint + Vitest (mocked unit tests, matching Epic 2's Sites-module precedent of not needing a real-Postgres integration spec for simple non-transactional CRUD) + `next build` + component/Server-Action tests with mocked `fetch`, not a live browser session against a running API. Flagging explicitly rather than claiming end-to-end verification that wasn't possible.

### Completion Notes List

- **The story's Task 5 file-naming suggestion (`packages/shared/src/schemas/material-category.test.ts` etc.) doesn't work in this codebase — caught before shipping, not after.** `packages/shared/package.json` has no `test` script and no vitest devDependency at all; standalone `.test.ts` files there would never execute under any existing `pnpm test`/CI path. This matches the story's own documented fallback ("mirror the inline Zod assertions in `sites.controller.spec.ts`... otherwise"): no `site.test.ts` exists precisely because Epic 2 already established the same pattern — Zod validation is tested via `ZodValidationPipe` inside each resource's own `apps/api` controller spec, not in standalone `packages/shared` test files. Wrote the three standalone files first, ran them, got silent non-execution, deleted them, and used the established pattern instead.
- Followed `sites/new` and `sites/[id]/edit`'s exact Server Action + `useActionState` pattern for all three new-entry/edit forms (Material, Category, Unit) rather than the plain-client-fetch pattern Epic 3's `daily-activity` desktop forms used — Sites is the more directly analogous precedent here (both are simple master-data CRUD with no offline/photo-upload concerns), and the story's own Dev Notes explicitly says "same page-not-modal pattern as `apps/web/app/(app)/sites/new`."
- **Real bug caught by the Server Action's own test, not assumed:** `FormData.get()` returns `null` (not `undefined`) for an absent field. `updateMaterialSchema`'s `categoryId`/`unitId`/`name` are `z.uuid().optional()`/`z.string().min(1).optional()` — Zod's `.optional()` accepts `undefined` but rejects `null`, so passing `formData.get("categoryId")` straight through would silently fail validation (returning field errors with no clear cause) any time a field's raw FormData value is `null`. Fixed with the same `|| undefined` coercion `sites/new/actions.ts` already uses for `contractReference`, applied to all three optional fields in `materials/[id]/edit/actions.ts`. In the actual rendered form this is unreachable today (Category/Unit/Name are always-present required `<select>`/`<input>` elements with `defaultValue`), but the fix makes the action correct on its own terms rather than correct only by accident of how the current form happens to be built.
- `GET /materials/:id` doesn't exist (out of this story's explicit endpoint list — only `POST`/`GET` (list)/`PATCH` are specified) — the edit page fetches the full `GET /materials` list and finds by id client-side, the same interim approach `sites/[id]/edit` originally used before Story 2.3 added a dedicated detail endpoint. If a later story adds one, this page should switch to it rather than keep list-scanning.
- The Material edit page keeps the Material's *own* currently-assigned Category selectable in its picker even if that Category has since been disabled (AC #3 says disabling hides a Category from the picker on *new* Materials, not from a Material already assigned to it) — filtered as `categories.filter(c => c.isActive || c.id === material.category.id)`.
- Category disable/enable is a single-field `PATCH` submitted via a bare `<form action={toggleMaterialCategoryAction.bind(...)}>` per table row — no client component needed for this, since a Server Action reference can be used directly as a Server Component's form `action` prop.
- Verification: `pnpm --filter @azentisfieldos/api test` — 87 passed (61 from Epic 3 + 26 new); `pnpm --filter @azentisfieldos/web test` — 99 passed (68 from Epic 3 + 31 new); `pnpm typecheck`, `pnpm lint`, and `pnpm --filter @azentisfieldos/web build` all clean across every package.

### File List

- `infra/prisma/schema.prisma` — UPDATE: `MaterialCategory.isActive`.
- `infra/prisma/migrations/20260813100000_add_material_category_is_active/migration.sql` — NEW.
- `packages/shared/src/schemas/material-category.ts` — NEW.
- `packages/shared/src/schemas/unit.ts` — NEW.
- `packages/shared/src/schemas/material.ts` — NEW.
- `packages/shared/src/index.ts` — UPDATE: exports the above.
- `apps/api/src/materials/material-categories.service.ts`, `.controller.ts`, `.controller.spec.ts` — NEW.
- `apps/api/src/materials/units.service.ts`, `.controller.ts`, `.controller.spec.ts` — NEW.
- `apps/api/src/materials/materials.service.ts`, `.controller.ts`, `.controller.spec.ts` — NEW.
- `apps/api/src/materials/materials.module.ts` — NEW.
- `apps/api/src/app.module.ts` — UPDATE: wires `MaterialsModule`.
- `apps/web/app/(app)/materials/page.tsx` — REPLACE (was a stub `EmptyState`).
- `apps/web/app/(app)/materials/page.test.tsx` — NEW.
- `apps/web/app/(app)/materials/new/page.tsx`, `new-material-form.tsx`, `actions.ts` — NEW.
- `apps/web/app/(app)/materials/new/page.test.tsx`, `new-material-form.test.tsx`, `actions.test.ts` — NEW.
- `apps/web/app/(app)/materials/[id]/edit/page.tsx`, `edit-material-form.tsx`, `actions.ts` — NEW.
- `apps/web/app/(app)/materials/[id]/edit/page.test.tsx`, `edit-material-form.test.tsx`, `actions.test.ts` — NEW.
- `apps/web/app/(app)/materials/categories/page.tsx`, `add-category-form.tsx`, `actions.ts` — NEW.
- `apps/web/app/(app)/materials/categories/page.test.tsx`, `actions.test.ts` — NEW.
- `apps/web/app/(app)/materials/units/page.tsx`, `add-unit-form.tsx`, `actions.ts` — NEW.
- `apps/web/app/(app)/materials/units/page.test.tsx`, `actions.test.ts` — NEW.
