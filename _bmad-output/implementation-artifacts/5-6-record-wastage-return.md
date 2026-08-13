---
baseline_commit: cf5dd4dc709029a08e7c4febf34f2421f394871f
---

# Story 5.6: Record Wastage/Return

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As Owner/Admin or Site Supervisor,
I want to record Wastage or a Return as its own transaction type, distinct from Consumption,
so that material lost to waste is never miscounted as material actually used in the work.

## Acceptance Criteria

1. **Given** a Site with Stock for a Material, **when** I record a Wastage/Return entry, **then** it's stored as a distinct transaction type from Consumption. (FR-13)
2. Stock adjusts accordingly with a visible reason — a `WASTAGE` entry decreases Site Stock (material is gone); a `RETURN` entry also decreases Site Stock (material is leaving the Site, going back to a Vendor or Godown — see Dev Notes "RETURN direction").
3. The row's "Correct" action is available, never Edit/Delete, matching every other transaction type in this epic. (AD-9, epic-level goal: "every correction handled via the append-only Correct pattern")
4. A Wastage/Return can never drive the Site's Stock below zero — same non-negative rule as Stories 5.2/5.4/5.5.

## Tasks / Subtasks

- [x] Task 1 — Schema fix (must land before anything else in this story) (AC: #3)
  - [x] `infra/prisma/schema.prisma`'s `ReturnWastage` model is missing `correctsId String?` and `reason String?` — every sibling append-only model (`Purchase`, `Movement`, `Consumption`) has both; `ReturnWastage` does not. This is a schema gap, not a deliberate omission — the epic's own Goal states "every correction handled via the append-only Correct pattern," which is meaningless for a model with no way to record what it corrects. Add both fields, matching the exact shape used on `Consumption` (nearest sibling: no `updatedAt`, just `correctsId`/`reason`).
  - [x] Run `pnpm db:generate` after the schema change.
- [x] Task 2 — Shared Zod schema (AC: #1, #2, #3, #4)
  - [x] Create `packages/shared/src/schemas/return-wastage.ts`. Fields per the (now-fixed) `ReturnWastage` model: `siteId` (`z.uuid()`), `materialSizeId` (`z.uuid()`), `kind` (`z.enum(["RETURN", "WASTAGE"])`), `quantity` (`z.number()`), `notes` (optional string), `recordedAt` (`z.coerce.date()`), `correctsId`/`reason` (Story 5.1's correction rule).
  - [x] `.superRefine()`: `quantity` positive when `correctsId` absent, non-zero either sign when present.
  - [x] Export from `packages/shared/src/index.ts`.
- [x] Task 3 — `apps/api` (AC: #1, #2, #4)
  - [x] `apps/api/src/inventory/return-wastage.controller.ts` + `.service.ts`, added to `InventoryModule`. `POST /return-wastage`, `GET /return-wastage`.
  - [x] `ReturnWastageService.create` runs inside `prisma.$transaction`, inserting the row and applying the shared stock-safety floor-check helper (Story 5.5's extracted `applyStockDelta`, or Story 5.2's inline pattern if the helper wasn't extracted yet — extract it now if not) against `SiteStock`, for **both** `kind` values (see Dev Notes "RETURN direction" — do not special-case `RETURN` to increase stock).
- [x] Task 4 — `apps/web` UI (AC: #1, #2, #3)
  - [x] `apps/web/app/(app)/movements/return-wastage/new/page.tsx` — entry form with a `kind` toggle (Return / Wastage), Site, Material/Size, quantity, notes, date.
  - [x] `/movements` list (Story 5.1): rows show `badge-danger` "Wastage & Return" (per `07-movements.html`), Sent Qty and Received Qty both showing the same `quantity` value (matching the mockup's example row — this transaction type doesn't have a sent/received gap concept, both columns just reflect the one recorded quantity).
  - [x] Correction route following the established pattern.
- [x] Task 5 — Tests (AC: all)
  - [x] Zod sign-rule test, plus a `kind` enum test.
  - [x] `return-wastage.service.spec.ts`: both `RETURN` and `WASTAGE` decrement `SiteStock` identically; floor check rejects and rolls back on insufficient balance, mirroring prior stories' tests.
  - [x] A migration/schema test (or a quick assertion in the service spec) confirming `correctsId`/`reason` round-trip through Prisma after Task 1's schema fix — this is the one piece of this story that's easy to silently skip if the schema edit is treated as an afterthought.

## Dev Notes

**Schema gap — do this first, it blocks the rest of the story.** See Task 1. This is the same category of fix as Epic 4 Story 4.1's `MaterialCategory.isActive` addition: a model that structurally can't do what its epic's Goal and this story's own AC #3 require, discovered by cross-checking the schema against the FR/AC text rather than assuming the schema is already complete because it exists.

**RETURN direction — both kinds decrease Site Stock.** It's tempting to model `RETURN` as *increasing* stock (a returned item comes back), but re-read the Glossary: "**Wastage / Return** — Material recorded as lost, damaged, **or returned**, distinct from Consumption." A Return here means material physically leaving the Site (back to a Vendor, or in some cases back to the Godown as a separate Movement — not modeled by this transaction type), the same direction as Wastage, just a different reason. If a future story needs "returned to Godown, increasing Godown Stock," that's a `Movement` (Site→Godown isn't currently a `MovementKind` variant — flag it as a gap for whoever picks that up, don't silently repurpose `ReturnWastage` to do a `Movement`'s job). This story only implements what FR-13 and the Glossary actually describe: a Site-side stock decrease, categorized by reason.

**Reuse the stock-safety helper from Story 5.5** rather than writing a fourth copy of the floor-check pattern Story 5.2 established.

**Depends on Story 5.2** (floor-check pattern) and **Story 5.1** (`InventoryModule`, `/movements` page). Independent of Stories 5.3–5.5 otherwise.

**Architecture constraints in force:** same set as prior Epic 5 stories — AD-3, AD-4, AD-5, AD-6, AD-7, AD-9 (this story is the one that makes `ReturnWastage` actually satisfy AD-9's binding to FR-13, via Task 1).

### Project Structure Notes

- One schema edit (`infra/prisma/schema.prisma`) plus the same file shape every other Epic 5 story has added: `packages/shared/src/schemas/return-wastage.ts`, `apps/api/src/inventory/return-wastage.controller.ts`/`.service.ts`, `apps/web/app/(app)/movements/return-wastage/new/page.tsx`.

### References

- [Source: _bmad-output/specs/spec-AzentisFieldOS/functional-requirements.md#CAP-3] (FR-13, feature-level non-negative rule)
- [Source: _bmad-output/specs/spec-AzentisFieldOS/glossary.md#Wastage / Return]
- [Source: _bmad-output/planning-artifacts/stories/phase-3-materials-inventory/epic-5-inventory-transactions-stock-visibility/story-5.6-record-wastage-return.md]
- [Source: infra/prisma/schema.prisma#ReturnWastage — missing correctsId/reason, this story's Task 1 fix]
- [Source: _bmad-output/implementation-artifacts/5-2-record-godown-site-movement.md, 5-5-record-consumption.md — the stock-safety helper this story reuses]
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/07-movements.html]

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (claude-sonnet-5)

### Debug Log References

### Completion Notes List

- Task 1's schema fix: added `correctsId String?`/`reason String?` to `ReturnWastage`, matching `Consumption`'s exact shape (no `updatedAt`). Generated the migration with the established non-interactive workaround (`prisma migrate diff --from-config-datasource --to-schema ... --script` → manual migration folder → `pnpm db:migrate:deploy` → `pnpm db:generate`), applied cleanly against the local dev database.
- `ReturnWastageService.create` reuses `decrementStockWithFloorCheck` (extracted in Story 5.5) for both `kind` values — no `if (kind === 'RETURN')` branch exists anywhere in the write path, so a `RETURN` cannot accidentally increase `SiteStock`; verified with dedicated unit and integration tests asserting a `RETURN` produces the exact same `updateMany`/decrement call shape as a `WASTAGE`.
- The integration suite includes an explicit "Task 1" test (`return-wastage.service.integration.spec.ts`) asserting `correctsId`/`reason` round-trip through a real Prisma write and read — per Task 5's warning that this is the piece most likely to be silently skipped.
- Frontend: `ReturnWastageForm` has a `kind` Type toggle (Wastage/Return, defaulting to Wastage) rather than two separate forms, matching this story's single-schema, single-service design; the `/movements` list's Return/Wastage rows use `badge-danger` "Wastage & Return" with Sent Qty and Received Qty both showing the one recorded quantity (no sent/received-gap concept for this transaction type, per Task 4).
- Final state: `apps/api` 200 tests / 25 files passing, `apps/web` 192 tests / 53 files passing. Both packages typecheck, lint, and build clean.

### File List

- `infra/prisma/schema.prisma` (modified — added `ReturnWastage.correctsId`/`reason`)
- `infra/prisma/migrations/20260813120000_add_return_wastage_correction_fields/migration.sql` (new)
- `packages/shared/src/schemas/return-wastage.ts` (new)
- `packages/shared/src/index.ts` (modified — export)
- `apps/api/src/inventory/return-wastage.service.ts` (new)
- `apps/api/src/inventory/return-wastage.controller.ts` (new)
- `apps/api/src/inventory/return-wastage.controller.spec.ts` (new)
- `apps/api/src/inventory/return-wastage.service.spec.ts` (new)
- `apps/api/src/inventory/return-wastage.service.integration.spec.ts` (new)
- `apps/api/src/inventory/inventory.module.ts` (modified — registered `ReturnWastageController`/`ReturnWastageService`)
- `apps/web/app/(app)/movements/page.tsx` (modified — merged Wastage & Return rows, added header link)
- `apps/web/app/(app)/movements/page.test.tsx` (modified)
- `apps/web/app/(app)/movements/return-wastage/actions.ts` (new)
- `apps/web/app/(app)/movements/return-wastage/actions.test.ts` (new)
- `apps/web/app/(app)/movements/return-wastage/return-wastage-form.tsx` (new)
- `apps/web/app/(app)/movements/return-wastage/return-wastage-form.test.tsx` (new)
- `apps/web/app/(app)/movements/return-wastage/new/page.tsx` (new)
- `apps/web/app/(app)/movements/return-wastage/new/page.test.tsx` (new)
- `apps/web/app/(app)/movements/return-wastage/[id]/correct/page.tsx` (new)
- `apps/web/app/(app)/movements/return-wastage/[id]/correct/page.test.tsx` (new)
