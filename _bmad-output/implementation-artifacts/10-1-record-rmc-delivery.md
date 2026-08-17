# Story 10.1: Record RMC Delivery

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As Owner/Admin,
I want to record an RMC delivery (Vendor, date, quantity m³, grade/type, rate/m³, total, invoice/challan),
so that concrete usage is tracked as its own category, separate from general Material inventory.

## Acceptance Criteria

1. **Given** an RMC delivery to a Site, **when** I record it, **then** it's stored as its own entity, not merged into the Material Catalog or Inventory Transactions data model. (FR-26)
2. It's queryable by day, Site, or Vendor.
3. The row's "Correct" action is available, never Edit/Delete. (AD-9)

## Tasks / Subtasks

- [ ] Task 1 — Schema fix (must land before anything else) (AC: #3)
  - [ ] `infra/prisma/schema.prisma`'s `RmcEntry` model has no `correctsId`/`reason` — every genuinely append-only model in this project has this pair (`Purchase`, `Movement`, `Consumption`, `DailySiteReport`), and this story's own AC #3 requires it. Add `correctsId String?`, `reason String?` (no pre-existing `reason`/`note` field on this model to collide with, so the plain names match `Purchase`/`Movement`/`Consumption`'s convention — same as `Payment` in Epic 7, not the disambiguated `correctionReason` naming `Advance`/`AdvanceAdjustment` needed). Run `pnpm db:generate`.
- [ ] Task 2 — Shared Zod schema (AC: #1, #2, #3)
  - [ ] Create `packages/shared/src/schemas/rmc-entry.ts`: `createRmcEntrySchema` (`siteId: z.uuid()`, `vendorId: z.uuid()`, `quantityM3: z.number()`, `grade: z.string().min(1).max(50)`, `ratePerM3: z.number().positive()`, `totalAmount: z.number().positive()`, `invoiceOrChallanNo: z.string().max(200).optional()`, `deliveredAt: z.coerce.date()`, `correctsId: z.uuid().optional()`, `reason: z.string().min(1).max(500).optional()`).
  - [ ] `.superRefine()`: `reason` required when `correctsId` present; `quantityM3` positive when `correctsId` absent, non-zero either sign when present — the same delta-correction rule Epic 5 Story 5.1 established (a correcting RMC entry's `quantityM3`/`totalAmount` express the adjustment, not a restated total — this is a single-quantity ledger row, the same shape as Purchase, not a multi-field computed record like Payment, so the delta pattern applies directly here, unlike Epic 7 Story 7.3's Payment or Epic 8 Story 8.2's location correction).
  - [ ] Export from `packages/shared/src/index.ts`.
- [ ] Task 3 — `apps/api` (AC: #1, #2)
  - [ ] `apps/api/src/rmc/rmc-entries.controller.ts` + `.service.ts` + `.module.ts` (`RmcModule`, its own module — RMC is explicitly "its own entity," per the epic's Implementation Notes, not folded into `InventoryModule` from Epic 5 even though it's conceptually adjacent). Register in `app.module.ts`. `POST /rmc-entries`, `GET /rmc-entries?siteId=&vendorId=&date=` (AC #2's queryability, as filter params on one endpoint, not three separate ones).
  - [ ] No stock/balance side effect on create — RMC delivery is a direct cost/consumption record, not a Stock-increasing transaction like Purchase; don't wire it into `GodownStock`/`SiteStock` (the epic's Implementation Notes explicitly warn against merging RMC into the Inventory Transactions model).
  - [ ] `GET /rmc-entries` includes `site` and `vendor` relations for display.
- [ ] Task 4 — `apps/web` UI (AC: #1, #2, #3)
  - [ ] Replace the stub `apps/web/app/(app)/rmc/page.tsx` with the real RMC list: stat tiles (Total RMC this month — m³, Total RMC cost this month — ₹, Active RMC vendor count) and a `DataTable` (Vendor / Site / Date / Quantity / Grade / Rate / Total / Invoice # / `CorrectAction`), matching `14-rmc.html`.
  - [ ] `apps/web/app/(app)/rmc/new/page.tsx` — entry form.
  - [ ] `apps/web/app/(app)/rmc/[id]/correct/page.tsx` — correction route, established pattern.
- [ ] Task 5 — Tests (AC: all)
  - [ ] Zod tests: reason-required-on-correction, sign rule.
  - [ ] `rmc-entries.service.spec.ts`: create/list delegation and filter params; no `godownStock`/`siteStock` calls anywhere in this service (a concrete, automatable check that the Implementation Notes' "don't merge into Inventory" boundary is actually respected in code, not just in prose).

## Dev Notes

**Same correction-field gap this project has now caught in five different models across five epics** (`MaterialCategory.isActive`, Epic 4; `ReturnWastage.correctsId`, Epic 5; `Advance`/`AdvanceAdjustment`/`Payment`, Epic 7) — a model drafted ahead of its story, checked now against what the AC actually requires. `RmcEntry` follows `Purchase`/`Movement`/`Consumption`'s plain `correctsId`/`reason` naming (not `Advance`'s disambiguated `correctionReason`) because it has no pre-existing field the plain name would collide with.

**RMC deliberately does not touch `GodownStock`/`SiteStock`.** Concrete delivered via RMC is used essentially immediately at the point of delivery (poured, not stored) — the epic's Implementation Notes are explicit that this stays a separate entity from Epic 4/5's Material Catalog and Inventory Transactions models. If a future requirement needs RMC to interact with Stock, that's a scoped change to raise explicitly, not something to infer here.

**Depends on nothing new** beyond established conventions (Epic 5's correction-delta pattern, Epic 2's `Site`, Epic 9's `Vendor`). Story 10.2 depends on this one.

**Architecture constraints in force:** AD-3, AD-4, AD-5, AD-6, AD-7, AD-9.

### Project Structure Notes

- New `apps/api/src/rmc/` module — its own module, not folded into `apps/api/src/inventory/` (Epic 5), per the epic's explicit "separate entity" framing.
- `apps/web/app/(app)/rmc/page.tsx` already exists as a stub — replaced here.

### References

- [Source: _bmad-output/specs/spec-AzentisFieldOS/functional-requirements.md#CAP-7 — RMC Tracking] (FR-26)
- [Source: _bmad-output/planning-artifacts/epics/phase-5-assets-suppliers/epic-10-rmc.md — "own entity, don't merge into Materials" note]
- [Source: _bmad-output/planning-artifacts/stories/phase-5-assets-suppliers/epic-10-rmc/story-10.1-record-rmc-delivery.md]
- [Source: infra/prisma/schema.prisma#RmcEntry — missing correctsId/reason, this story's Task 1 fix]
- [Source: _bmad-output/implementation-artifacts/5-1-record-a-purchase.md — correction-delta semantics this story reuses]
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/14-rmc.html]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
