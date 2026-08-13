# Story 4.3: Add Custom Fields to a Material

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As Owner/Admin,
I want to add Custom Fields to a Material definition,
so that I can capture Tenant-specific attributes without needing a schema change.

## Acceptance Criteria

1. **Given** a Material, **when** I add a Custom Field (label + value type), **then** it is stored in the Material's `customFields` JSONB column, with no per-tenant database migration required. (FR-7)
2. The Custom Field definition appears on that Material's entry forms going forward — this story defines and persists the *definition* (label + type); actually rendering the field on Purchase/Movement/Consumption entry forms happens when those forms are built in Epic 5, which reads this same `customFields` array. (FR-7 — see Dev Notes on scope boundary.)
3. No cross-tenant shared catalog or marketplace exists — each Tenant's Custom Field definitions live only in that Tenant's own database, which is already true by construction under AD-1 (single-tenant-per-deployment) and requires no additional code in this story.
4. A Material with no Custom Fields behaves exactly as it does today (`customFields` defaults to `{}`/`[]` — see Dev Notes on the shape decision) — this story must not change behavior for existing Materials that never use this feature.

## Tasks / Subtasks

- [x] Task 1 — Decide and document the `customFields` shape (AC: #1)
  - [x] Store `customFields` as a JSON **array** of `{ label: string, type: "TEXT" | "NUMBER" | "DATE" }` objects.
  - [x] No Prisma schema change made — confirmed the existing `Json @default("{}")` column, handled the `{}`-vs-`[]` mismatch at the service layer (Task 2), not via migration.
- [x] Task 2 — Shared Zod schema (AC: #1, #4)
  - [x] Added `customFieldTypeSchema`, `customFieldDefinitionSchema`, `customFieldsSchema` (`.max(20)`) to `packages/shared/src/schemas/material.ts`.
  - [x] Extended `updateMaterialSchema` with optional `customFields: customFieldsSchema`.
  - [x] `materials.service.ts` normalizes `{}` → `[]` in every response path that returns a Material (`create`, `list`, `update`) via a shared private `normalizeCustomFields` helper — not just the one path the story called out.
- [x] Task 3 — `apps/web` UI (AC: #1, #2, #4)
  - [x] Added a "Custom Fields" section to `edit-material-form.tsx`: existing definitions (label + type `Badge`), an add-row form, staged in local state and submitted as one JSON-encoded hidden field within the same `<form>`/PATCH as the rest of the Material edit — no separate save action.
  - [x] Materials list page's Custom Fields count column now reflects real array length.
- [x] Task 4 — Tests (AC: all)
  - [x] `customFieldsSchema`/`updateMaterialSchema` tested via `ZodValidationPipe` in `materials.controller.spec.ts` (same reasoning as Stories 4.1/4.2: no standalone `packages/shared` test runner exists).
  - [x] `MaterialsService` tests: `customFields` round-trips through `update()`; `create()`/`update()`/`list()` all normalize a legacy `{}` default to `[]`.
  - [x] `apps/web` component tests: adding a Custom Field updates both the visible list and the serialized hidden field; malformed/invalid `customFields` JSON is handled as a form/validation error, not a crash; the list page's count column reflects real data.

## Dev Notes

**Scope boundary — read this before starting:** this story ends at *persisting the field definition*. It does **not** build the Purchase/Movement/Consumption entry forms that would actually render a "Brand" or "Warranty Expiry" input using this definition — those forms don't exist yet (Epic 5, per the epic's own Implementation Notes: "Build before Epic 5 — every Purchase/Movement/Consumption form depends on this catalog existing"). Confirm each Task against this boundary before adding scope: if a task starts sounding like "render the custom field on a transaction form," it belongs to Epic 5, not here.

**Why an array, and why a closed type enum:** the FR text says "label + value type" (singular field with two properties, repeated per field) — an array of `{label, type}` objects matches that shape directly and is trivially iterable by future entry-form rendering code. A free-form JSON object (`{ [label]: type }`) was considered and rejected: it can't express duplicate labels cleanly, doesn't preserve insertion order guarantees the same way across all JSON consumers, and makes "list of fields with stable identity" (needed once Epic 5 reads it to render inputs) harder than it needs to be. The type enum is closed (`TEXT`/`NUMBER`/`DATE`) rather than a free string because an open string type would let an admin type `"txt"` in one Material and `"text"` in another, silently fragmenting what should be one of three renderable input kinds — this is exactly the kind of "configurable but not hardcoded" tension NFR-4 raises; the *set of fields* is configurable (that's the feature), but the *kind* of each field must stay a closed, small set for any future renderer to handle deterministically.

**The Prisma column default mismatch is intentional to route around, not fix:** `Material.customFields Json @default("{}")` was written before this story clarified the shape should be an array. Changing the Postgres-level default to `"[]"` would need a migration touching every existing row — not worth it for a default that's only ever read, never compared for equality. Instead, Task 2's service-layer normalization (`{}` → `[]` on read) fully neutralizes the mismatch for every consumer without a migration. Do not "fix" the Prisma default as part of this story.

**Depends on Story 4.1** (the `Material` schema/resource/edit page this story extends) and is independent of Story 4.2 (Sizes) — the two can be built in either order relative to each other, but both depend on 4.1.

**Architecture constraints in force:** same set as Stories 4.1/4.2 — AD-3, AD-4, AD-5, AD-6, AD-7. The Consistency Conventions table's own line on Custom Fields ("an admin adding a custom field is a data change, not a migration, keeping every tenant's schema identical, required by AD-2's scripted, non-branching provisioning") is this story's core invariant — never introduce a code path where adding a Custom Field requires a schema migration for one tenant and not another.

### Project Structure Notes

- No new top-level files — this story is additive within `packages/shared/src/schemas/material.ts`, `apps/api/src/materials/materials.service.ts`, and `apps/web/app/(app)/materials/[id]/edit/page.tsx`, all created/extended by Stories 4.1 and 4.2.
- No conflicts detected, provided Story 4.1 (and ideally 4.2, for a single coherent edit-page diff) has landed first.

### References

- [Source: _bmad-output/specs/spec-AzentisFieldOS/functional-requirements.md#CAP-2 — Material Catalog Configuration] (FR-7)
- [Source: _bmad-output/planning-artifacts/stories/phase-3-materials-inventory/epic-4-material-catalog-configuration/story-4.3-custom-fields.md]
- [Source: infra/prisma/schema.prisma#Material.customFields — existing `Json @default("{}")` column]
- [Source: _bmad-output/planning-artifacts/architecture/architecture-AzentisFieldOS-2026-08-11/ARCHITECTURE-SPINE.md#Consistency Conventions — Custom Fields JSONB rationale, AD-2]
- [Source: _bmad-output/implementation-artifacts/4-1-manage-material-categories-materials.md — this story's direct prerequisite]
- [Source: _bmad-output/planning-artifacts/epics/phase-3-materials-inventory/epic-4-material-catalog-configuration.md — "Build before Epic 5" scope boundary]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

- Same verification constraints as Stories 4.1/4.2: `apps/api`'s dev server can't boot outside Vitest (pre-existing, unrelated TODO) — verified via typecheck + lint + Vitest + `next build`, not a live browser session against a running API.

### Completion Notes List

- **Normalization applied more broadly than the story's literal wording.** Task 2 said to normalize `{}` → `[]` "when reading a Material" — but `create()` and `update()` also return a Material object directly as their HTTP response (not just `list()`/a hypothetical `findOne()`), and a freshly-created Material (via `createMaterialSchema`, which deliberately has no `customFields` field per Dev Notes) would have the raw `{}` Prisma default the very first time it's returned. Applied the same `normalizeCustomFields` helper to all three response paths (`create`, `list`, `update`) rather than just one, so AC #4 ("a Material with no Custom Fields behaves exactly as it does today") holds everywhere a Material is returned, not only on the list endpoint.
- Custom Fields are staged as local React state in `edit-material-form.tsx` (starting from `material.customFields`) and serialized into one JSON-encoded `<input type="hidden">` inside the *same* `<form>` as the rest of the Material edit fields — matching the story's explicit "no separate save action for this section" instruction. The Server Action (`updateMaterialAction`) parses that JSON before validating it against `updateMaterialSchema`; a malformed JSON string returns a form error rather than throwing.
- No remove/delete affordance was added for an existing Custom Field definition — the story's Task 3 describes only "existing field definitions listed... a small add-row form," with no update/delete AC stated (unlike Story 4.2's explicit "no update or delete" AC for Sizes). Kept it purely additive to match the story's literal, minimal scope rather than inventing a delete capability nobody asked for.
- Confirmed the scope boundary the story's own Dev Notes draws: this story ends at persisting `{label, type}` definitions. No Purchase/Movement/Consumption entry-form rendering was touched — those forms don't exist yet (Epic 5).
- Verification: `pnpm --filter @azentisfieldos/api test` — 103 passed (95 from Stories 4.1/4.2 + 8 new); `pnpm --filter @azentisfieldos/web test` — 112 passed (105 from Stories 4.1/4.2 + 7 new); `pnpm typecheck`, `pnpm lint`, and `pnpm --filter @azentisfieldos/web build` all clean across every package.

### File List

- `packages/shared/src/schemas/material.ts` — UPDATE: `customFieldTypeSchema`, `customFieldDefinitionSchema`, `customFieldsSchema`, `updateMaterialSchema` extended with `customFields`.
- `apps/api/src/materials/materials.service.ts` — UPDATE: `normalizeCustomFields` applied to `create`/`list`/`update`.
- `apps/api/src/materials/materials.controller.spec.ts` — UPDATE: `customFields` Zod + normalization tests.
- `apps/web/app/(app)/materials/page.tsx` — UPDATE: `MaterialListItem.customFields` typed as `CustomFieldDefinition[]`.
- `apps/web/app/(app)/materials/page.test.tsx` — UPDATE: real-count test.
- `apps/web/app/(app)/materials/[id]/edit/edit-material-form.tsx` — UPDATE: Custom Fields section.
- `apps/web/app/(app)/materials/[id]/edit/edit-material-form.test.tsx` — UPDATE: Custom Fields tests.
- `apps/web/app/(app)/materials/[id]/edit/actions.ts` — UPDATE: parses the JSON-encoded `customFields` hidden field.
- `apps/web/app/(app)/materials/[id]/edit/actions.test.ts` — UPDATE: parsing/validation tests.
