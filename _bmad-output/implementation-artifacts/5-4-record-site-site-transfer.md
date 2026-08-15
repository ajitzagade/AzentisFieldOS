---
baseline_commit: cf5dd4dc709029a08e7c4febf34f2421f394871f
---

# Story 5.4: Record Site→Site Transfer

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As Owner/Admin,
I want to record a Material transfer from one Site directly to another,
so that Site Stock stays accurate when material moves between active jobsites without passing through the Godown.

## Acceptance Criteria

1. **Given** I record a Site→Site transfer (vehicle, person responsible, notes, received quantity), **when** I submit, **then** the sending Site's Stock decreases and the receiving Site's Stock increases on confirmed receipt, with the same shortage/damage-gap capture discipline as Godown→Site Movement. (FR-11)
2. This is `Movement.kind = SITE_TO_SITE` against the exact same `Movement` model, schema, service, and two-step (send → confirm-receipt) flow Story 5.2 built for `GODOWN_TO_SITE` — not a new transaction type.
3. A Site→Site transfer can never drive the *source* Site's Stock below zero — same non-negative rule as Story 5.2's Godown floor check, applied to `SiteStock` instead of `GodownStock`.

## Tasks / Subtasks

- [x] Task 1 — Verify, extend the floor check (AC: #2, #3)
  - [x] Confirm `createMovementSchema` (Story 5.2) already requires `sourceSiteId` when `kind = SITE_TO_SITE`. No schema change.
  - [x] `MovementsService.create` (Story 5.2) currently applies the floor check against `GodownStock` unconditionally — extend it to branch on `kind`: `GODOWN_TO_SITE` checks/decrements `GodownStock` (by `materialSizeId` alone), `SITE_TO_SITE` checks/decrements `SiteStock` (by the composite `{ siteId: sourceSiteId, materialSizeId }` key) using the exact same `updateMany` + count-check technique from Story 5.2's Dev Notes — do not write a second copy of that pattern, parameterize the existing one over which model/key it targets.
  - [x] `confirmReceipt` (Story 5.2) already increments `SiteStock` for `destinationSiteId` regardless of `kind` — no change needed there.
- [x] Task 2 — `apps/web` UI (AC: #1)
  - [x] `apps/web/app/(app)/movements/site-to-site/new/page.tsx` — same form as Story 5.2's Godown→Site entry, with a source-Site `SelectField` shown instead of an implicit "Godown" source, and `kind` set to `SITE_TO_SITE`. Reuse Story 5.2's form component/logic with a `kind` prop rather than duplicating the field list.
  - [x] The `/movements` list (Story 5.1/5.2) already renders the "Site / Godown" flow column generically (`sourceSite?.name ?? "Godown"` → `destinationSite.name`) — confirm this, don't special-case `SITE_TO_SITE` rendering if the existing column logic already handles a non-null `sourceSite`.
- [x] Task 3 — Tests (AC: #2, #3)
  - [x] Extend Story 5.2's `movements.service.spec.ts` with a `SITE_TO_SITE` case: floor check applies to the source Site's `SiteStock` row, not `GodownStock`; insufficient balance rejects and rolls back identically.

## Dev Notes

**This story is intentionally thin**, for the same reason Story 5.3 was thin relative to 5.1: FR-11 is FR-9's exact mechanism with the source changed from "the Godown" (implicit, singular) to "a Site" (explicit, selected). Story 5.2 already built the schema, the two-step send/confirm flow, and documented the canonical stock-safety pattern. The only real new work is making the floor check target the correct balance table based on `kind` — everything else is parameterization, not new logic. Do not create a second `Movement`-like model or a second controller.

**Depends on Story 5.2 entirely.**

### Project Structure Notes

- Extends `movements.service.ts`'s existing floor-check logic (parameterize, don't duplicate) and adds one new route (`/movements/site-to-site/new`). No new files at the API layer.

### References

- [Source: _bmad-output/specs/spec-AzentisFieldOS/functional-requirements.md#CAP-3] (FR-11)
- [Source: _bmad-output/planning-artifacts/stories/phase-3-materials-inventory/epic-5-inventory-transactions-stock-visibility/story-5.4-site-to-site-transfer.md]
- [Source: _bmad-output/implementation-artifacts/5-2-record-godown-site-movement.md — the Movement schema/service/floor-check pattern this story extends]
- [Source: infra/prisma/schema.prisma#Movement.kind, sourceSiteId]

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (claude-sonnet-5)

### Debug Log References

### Completion Notes List

- `MovementsService.create`'s floor check now branches on `input.kind`: `GODOWN_TO_SITE` targets `godownStock.updateMany({ where: { materialSizeId, quantity: { gte } } })`, `SITE_TO_SITE` targets `siteStock.updateMany({ where: { siteId: sourceSiteId, materialSizeId, quantity: { gte } } })` — same `updateMany` + affected-row-count technique from Story 5.2, parameterized over the target model/key rather than duplicated (per Dev Notes' explicit instruction).
- Confirmed no schema change was needed: `createMovementSchema`'s `sourceSiteId` cross-field rule (required for `SITE_TO_SITE`, forbidden for `GODOWN_TO_SITE`) and `confirmReceipt`'s unconditional `destinationSiteId`-keyed `SiteStock` increment were already correct for both kinds.
- Confirmed the `/movements` list's flow column (`movement.sourceSite?.name ?? "Godown"` → `movement.destinationSite.name`) already renders a Site→Site transfer's real source Site name with no code change, matching Task 2's "confirm, don't special-case" instruction.
- `MovementForm` (`godown-to-site/movement-form.tsx`) gained a `kind` prop (default `GODOWN_TO_SITE`) rather than a second component — when `SITE_TO_SITE`, it renders a Source Site `SelectField` (locked via the same hidden-input pairing as the other locked fields in correct mode) and labels the submit button "Record Transfer". `/movements/site-to-site/new/page.tsx` imports this form from its sibling `godown-to-site/` directory rather than duplicating it, matching Story 5.3's precedent of importing across a sibling route directory for a thin reuse wrapper.
- The correction page (`godown-to-site/[id]/correct/page.tsx`) needed a small but necessary extension beyond the story's literal task list: it now reads `kind`/`sourceSiteId` from the fetched Movement and passes them through to `MovementForm`, so correcting a `SITE_TO_SITE` Movement preserves its kind and pre-fills its Source Site instead of silently defaulting to `GODOWN_TO_SITE`. Without this, `CorrectAction` on a transfer row (routed generically to this same page per Story 5.2's design) would have produced a corrupted correction.
- Extended `movements.service.spec.ts` (mocked) and `movements.service.integration.spec.ts` (real Postgres, including a 5-concurrent-request oversell check mirroring Story 5.2's Godown floor-check rigor) with `SITE_TO_SITE` cases, per Task 3.
- Final state: `apps/api` 165 tests / 19 files passing, `apps/web` 166 tests / 45 files passing. Both packages typecheck, lint, and build clean.

### Review Findings

- [x] [Review][Patch] A SITE_TO_SITE Movement with `sourceSiteId === destinationSiteId` (a self-transfer) wasn't rejected anywhere — deferred from Story 5.2's review since this story is where SITE_TO_SITE first becomes exercisable [packages/shared/src/schemas/movement.ts:28] — fixed: `createMovementSchema`'s `superRefine` now rejects a matching source/destination Site.
- [x] [Review][Patch] `MovementsService.create` never verified a correction's `kind`/`materialSizeId`/`sourceSiteId`/`destinationSiteId` match the original Movement being corrected — same class of gap already patched for Purchase under Story 5.1 [apps/api/src/inventory/movements.service.ts:20] — fixed: `create()` now rejects a mismatched correction.
- [x] [Review][Patch] `input.kind === 'GODOWN_TO_SITE'` was computed twice (once for the stock target, once for the error message) — minor duplication risk if a third `kind` is ever introduced [apps/api/src/inventory/movements.service.ts:44] — fixed: hoisted to a single `isGodownToSite` local.
- [x] [Review][Patch] The SITE_TO_SITE concurrency test didn't assert the orphan-row-free rollback the equivalent GODOWN_TO_SITE test already checks, so "rolls back identically" (Task 3) wasn't actually verified for this path [apps/api/src/inventory/movements.service.integration.spec.ts:334] — fixed: added the matching `prisma.movement.findMany(...)` assertion.
- [x] [Review][Defer] No client-side prevention of picking the same Site for both Source and Destination — the server-side guard (now fixed) is what matters functionally; a friendlier round-trip-free UX check is a nice-to-have
- [x] [Review][Defer] `input.sourceSiteId!` in `create()` trusts the schema layer without its own guard — matches the established codebase convention of trusting Zod validation before the service layer (e.g. Purchase's `input.siteId!`), not a pattern introduced uniquely here
- [x] [Review][Defer] Correction routing lives under `/movements/godown-to-site/[id]/correct` for both kinds, and the shared form lives in a folder named after one specific kind — real naming nit, but Dev Notes explicitly call for reuse over duplication; a proper fix is a larger restructure than this "thin" story's scope. Same class as the `correctHref` naming gap already deferred under Story 5.2.
- [x] [Review][Defer] `getSites`/`getMaterials` data-fetching boilerplate is now triplicated across pages — duplicate of the systemic gap already logged under Story 5.2
- [x] [Review][Defer] Fetch failures bypass AD-6's shared error-state policy (raw `Error()`, no `error.tsx`) — duplicate of the systemic gap already logged under Story 5.2
- [x] [Review][Defer] `confirmReceipt` semantics for a correction Movement are unclear — duplicate of the same item already deferred under Story 5.2's review
- [x] [Review][Defer] No client-side guard against a zero-delta correction on the Quantity adjustment field — cosmetic, server already rejects via Zod
- [x] [Review][Defer] `MovementFormInitialValues`/`kind`/`mode` have no type-level tie ensuring `sourceSiteId` travels with `kind="SITE_TO_SITE"` — same class of prop-typing tightening already applied to `PurchaseForm` under Story 5.1; deferred here to avoid expanding this "thin" story's scope further
- [x] [Review][Dismiss] "Floor-check logic was extracted to `stock-delta.ts`, contradicting Task 1's 'parameterize in place' instruction, and that module is absent from the diff/File List" — false: this story's own Completion Notes confirm the floor check *was* parameterized in place exactly as instructed; `stock-delta.ts`'s extraction is Story 5.5's later work (the code comment says so explicitly: "extracted in Story 5.5"). Diff-scoping artifact of Epic 5 being one squashed commit — the shared file's current state reflects 5.5's later refactor, not evidence 5.4 deviated from its own task.

### File List

- `apps/api/src/inventory/movements.service.ts` (modified — parameterized floor check over `kind`)
- `apps/api/src/inventory/movements.service.spec.ts` (modified — SITE_TO_SITE cases)
- `apps/api/src/inventory/movements.service.integration.spec.ts` (modified — SITE_TO_SITE real-Postgres cases, including concurrency)
- `apps/web/app/(app)/movements/godown-to-site/movement-form.tsx` (modified — added `kind` prop and Source Site field)
- `apps/web/app/(app)/movements/godown-to-site/movement-form.test.tsx` (modified)
- `apps/web/app/(app)/movements/godown-to-site/actions.ts` (modified — reads `kind`/`sourceSiteId` from FormData instead of hardcoding)
- `apps/web/app/(app)/movements/godown-to-site/actions.test.ts` (modified)
- `apps/web/app/(app)/movements/godown-to-site/[id]/correct/page.tsx` (modified — preserves `kind`/`sourceSiteId` from the original Movement)
- `apps/web/app/(app)/movements/godown-to-site/[id]/correct/page.test.tsx` (modified)
- `apps/web/app/(app)/movements/site-to-site/new/page.tsx` (new)
- `apps/web/app/(app)/movements/site-to-site/new/page.test.tsx` (new)
