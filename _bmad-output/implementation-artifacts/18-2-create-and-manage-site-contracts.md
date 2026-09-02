# Story 18.2: Create and Manage Site Contracts

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As Owner/Admin,
I want to create a Site Contract engaging a Subcontractor on a specific Site — work category, a flexible rate type (Fixed Cost, Per Trip, Per Pipe, Per Unit, or Custom), the agreed rate or fixed amount, and a Draft/Active/Completed/Cancelled status,
so that every outsourced work arrangement is recorded against the Site it belongs to, under whatever commercial terms actually apply, without forcing every job into one rigid pricing shape.

## Acceptance Criteria

1. **Given** I create a Site Contract for a Subcontractor on a Site, **when** I choose a rate type, **then** the form asks only for the fields that type needs — Fixed Cost asks for one total amount; Per Trip/Per Pipe/Per Unit ask for a rate; Custom asks for a rate plus a free-text unit label (e.g. "per bag") — never a one-size-fits-all field set. (FR-56)
2. A Site Contract always belongs to exactly one Site and one Subcontractor — created only from a Site's context (`/sites/[id]/contracts/new`), never as a bare cross-Site/cross-Subcontractor entity. (FR-56)
3. **Given** a new Site Contract, **when** I save it without commercial terms filled in, **then** it saves as **Draft** — status defaults to Draft, terms are optional at this stage. (FR-57)
4. **Given** a Draft Site Contract, **when** I attempt to set its status to **Active**, **then** the save is rejected with inline field errors unless work category, rate type, the rate-type-appropriate rate/amount, and a start date are all present — Active means "this engagement is live and billable," never an engagement with unknown terms. (FR-57)
5. **Given** a Site Contract's terms or status, **when** I edit it, **then** this is a normal in-place Edit — Site Contract terms are agreement/master data, not transaction history, so AD-9's Correct pattern does not apply here (same rule as Site's own status transitions, Story 2.2).
6. Status badge (Draft/Active/Completed/Cancelled) uses distinct colors, never color-alone signaling (paired with a label, per UX-DR6/UX-DR20).
7. The Site Contract detail page (this story builds the terms-only shell; Story 18.5 adds ledger sections) shows every field entered, with a pending rate/amount rendered as an explicit "—" / "Pending" state, never as ₹0 (same convention as Purchase's D7 pricing fields).

## Tasks / Subtasks

- [ ] Task 1 — Prisma model (AC: #1, #2, #3, #4)
  - [ ] Add to `infra/prisma/schema.prisma`:
    ```prisma
    enum ContractStatus {
      DRAFT
      ACTIVE
      COMPLETED
      CANCELLED
    }

    model SiteContract {
      id                String         @id @default(uuid(7))
      subcontractorId   String
      subcontractor     Subcontractor  @relation(fields: [subcontractorId], references: [id])
      siteId            String
      site              Site           @relation(fields: [siteId], references: [id])
      workCategory      String?
      description       String?
      // FIXED_COST | PER_TRIP | PER_PIPE | PER_UNIT | CUSTOM — plain String,
      // Zod-enforced vocabulary (same pattern as Purchase.paymentStatus and
      // WasteDisposal.ownership), not a Prisma enum: PER_UNIT/CUSTOM's
      // free-text rateUnitLabel needs the tri-state nullability flexibility
      // a hard enum doesn't buy anything extra for here.
      rateType          String?
      // Required when rateType is PER_UNIT or CUSTOM (e.g. "bag", "sq ft",
      // "running ft"); null otherwise.
      rateUnitLabel     String?
      // Per-unit rate; null when rateType is FIXED_COST or still unset.
      rate              Decimal?
      // Total for FIXED_COST; null for every other rateType.
      fixedAmount       Decimal?
      estimatedQuantity Decimal?
      status            ContractStatus @default(DRAFT)
      startDate         DateTime?
      endDate           DateTime?
      // Materialized, write-path-only figures (AD-9 discipline) — updated
      // only inside the same transaction as the causing WorkEntry/Payment
      // row (Stories 18.3/18.4), never summed on read.
      quantityCompleted Decimal        @default(0)
      amountPaid        Decimal        @default(0)
      createdAt         DateTime       @default(now())
      updatedAt         DateTime       @updatedAt

      workEntries SubcontractorWorkEntry[]
      payments    SubcontractorPayment[]
    }
    ```
  - [ ] Add `contracts SiteContract[]` to `Site` (alongside its other back-relations) and `siteContracts SiteContract[]` to `Subcontractor` (Story 18.1 left this relation empty — fill it in here).
  - [ ] Run `pnpm db:generate`; author/verify the migration.
  - [ ] **Why nullable-until-Active, not the D7 "atomic once" mechanism:** D7 (`PATCH /purchases/:id/pricing`) exists because `Purchase` is an append-only AD-9 table that's otherwise immutable — a special one-time-fill endpoint is the only way to complete a field after creation. `SiteContract` is master/agreement data like `Site`, edited in place via a normal `PATCH` (AC #5) — so there is no immutability problem to work around, and no separate pricing-completion endpoint is needed here. The nullable columns plus a status-transition validation rule (AC #4) achieve the same "start incomplete, finish before it's real" outcome with strictly less machinery. Do not port `completePricing`'s atomic-`updateMany`-exactly-once pattern into this story — it solves a problem this model doesn't have.
- [ ] Task 2 — Shared Zod schema (AC: #1, #3, #4)
  - [ ] Create `packages/shared/src/schemas/site-contract.ts`:
    - `rateTypeSchema = z.enum(["FIXED_COST", "PER_TRIP", "PER_PIPE", "PER_UNIT", "CUSTOM"])` — the sole source of truth for this vocabulary (same role `paymentStatusSchema` plays for `Purchase.paymentStatus`).
    - `createSiteContractSchema`: `siteId: z.uuid()`, `subcontractorId: z.uuid()`, `workCategory: z.string().min(1).max(200).optional()`, `description: z.string().max(1000).optional()`, `rateType: rateTypeSchema.optional()`, `rateUnitLabel: z.string().max(100).optional()`, `rate: z.number().positive().optional()`, `fixedAmount: z.number().positive().optional()`, `estimatedQuantity: z.number().positive().optional()`, `status: z.enum(["DRAFT", "ACTIVE", "COMPLETED", "CANCELLED"]).default("DRAFT")`, `startDate: z.coerce.date().optional()`, `endDate: z.coerce.date().optional()`.
    - `.superRefine()` rules (all must produce field-level issues, not one generic error):
      - `rateType === "FIXED_COST"` → `fixedAmount` required, `rate`/`rateUnitLabel` must be absent.
      - `rateType` in `["PER_TRIP", "PER_PIPE", "PER_UNIT"]` → `rate` required, `fixedAmount` must be absent; `rateUnitLabel` required only for `PER_UNIT`.
      - `rateType === "CUSTOM"` → `rate` and `rateUnitLabel` both required, `fixedAmount` absent.
      - **If `status === "ACTIVE"`:** `workCategory`, `rateType`, the rate-type-appropriate rate/amount field, and `startDate` must all be present — this is AC #4's enforcement point. Emit one issue per missing field, on that field's path, so the form can show inline errors rather than one generic rejection.
      - `endDate`, when present, must not be before `startDate`.
    - `updateSiteContractSchema`: same shape and superRefine rules, `.partial()` with the same nullable-on-clear treatment `updateVendorSchema` uses for its optional strings (a full-replace PATCH from the edit form needs to represent "user cleared this field" as explicit `null`) — but note `status` and the ACTIVE-requires-terms rule must still run against the *resulting* merged record's fields, not just the fields present in this particular PATCH body; see Dev Notes for how the service layer handles this without re-deriving the validation twice.
  - [ ] Export all from `packages/shared/src/index.ts`.
- [ ] Task 3 — `apps/api`: `SiteContractsController`/`Service` (AC: #1–#5, #7)
  - [ ] Add `site-contracts.controller.ts` + `.service.ts` to the `apps/api/src/subcontractors/` module started in Story 18.1 (sibling, not a new module — update `SubcontractorsModule`'s `controllers`/`providers` arrays).
  - [ ] Routes, all `@Roles('OWNER_ADMIN')` (commercial-terms data — unlike Vendor/Subcontractor's read-open, write-gated-only-on-delete shape, this whole resource is Owner-only end to end, since only Owner/Admin engages a Subcontractor and sets terms; Story 18.3 is the one Supervisor-writable piece of this epic, and it's a separate controller):
    - `POST /site-contracts`
    - `GET /site-contracts?siteId=&subcontractorId=&status=` — filterable list, no auth gate on read (matches every other list in the product; Story 18.5 uses this from both the Site detail page, filtered by `siteId`, and the Subcontractor detail page's nested route)
    - `GET /site-contracts/:id`
    - `PATCH /site-contracts/:id`
  - [ ] `SiteContractsService.create`/`update`: after Zod validation passes the per-request superRefine rules, if the request would leave (or set) `status: "ACTIVE"`, re-check the *merged* record (existing DB row's fields overlaid with this PATCH's fields) has every AC #4 field present before writing — a PATCH that only sends `{ status: "ACTIVE" }` on a Draft row still missing `rate` must be rejected with the same field-level errors, not silently accepted because the Zod schema only saw `{ status: "ACTIVE" }` in isolation. Implement this as a service-layer check after loading the current row, not by trying to push it into the Zod schema (which only ever sees one request body, never the stored state).
  - [ ] `findOne` 404s if the contract or its parent Subcontractor is soft-deleted (join check, same discipline `VendorsService`/`PurchasesService` apply for their FK parents).
- [ ] Task 4 — Tests (AC: all)
  - [ ] Zod tests: every rate-type branch (valid/invalid field combinations), the ACTIVE-requires-terms rule, `endDate` before `startDate` rejection.
  - [ ] `site-contracts.service.spec.ts`: the merged-record ACTIVE check (a PATCH sending only `{status: "ACTIVE"}` against a Draft row missing terms is rejected; the same PATCH against a Draft row that already has all terms filled succeeds).
  - [ ] `site-contracts.controller.spec.ts`: `@Roles(['OWNER_ADMIN'])` metadata present on every mutating handler.
- [ ] Task 5 — `apps/web` UI (AC: #1, #2, #3, #4, #6, #7)
  - [ ] `apps/web/app/(app)/sites/[id]/contracts/new/page.tsx` + `parse.ts` + `actions.ts` — `siteId` comes from the route param, never a picker; Subcontractor is a `ComboboxField` sourced from `GET /subcontractors` (mirrors the `SelectField`-from-`GET /vendors` pattern already wired into `PurchaseForm`). Rate type is a plain `Field` `<select>` with the 5 options; choosing a type client-side-conditionally reveals only the fields that type needs (AC #1) — implement this as local component state driving which inputs render, not a `DetailsDisclosure` (these aren't optional extras, they're type-determined required fields).
  - [ ] `apps/web/app/(app)/sites/[id]/contracts/[contractId]/page.tsx` — detail shell for this story: header (Subcontractor name linking to `/subcontractors/[id]`, work category, status Badge, start/end dates), terms section (rate type + rate/fixed amount, rendering a pending rate/amount as "—"/"Pending", never ₹0 — same convention `vendors/[id]/page.tsx` uses for `Purchase.totalAmount === null`), Edit button. Story 18.5 adds the Work Entry and Payment ledger sections plus computed payable/paid/outstanding `StatTile`s to this same page — build the shell so those sections have an obvious insertion point, don't stub empty placeholder tables for them now.
  - [ ] `apps/web/app/(app)/sites/[id]/contracts/[contractId]/edit/page.tsx` + `parse.ts` + `actions.ts` + `edit-site-contract-form.tsx` — same conditional-fields behavior as the create form, plus the status `<select>` (Draft/Active/Completed/Cancelled). Submitting a status change that the server rejects (AC #4) must surface the server's field-level errors inline — this PATCH's rejection reason depends on stored state the client form doesn't necessarily have loaded for every field, so don't try to fully replicate the ACTIVE-requires-terms check client-side; let the server's `state.errors` carry it, same fallback `useClientValidation`'s doc comment already describes for "anything it can't know client-side."
  - [ ] Badge variant mapping for status: Draft → `neutral`, Active → `success`, Completed → `success` (or a distinct completed treatment if the mockup set already has one — check `packages/ui`'s `Badge` variants before inventing a sixth), Cancelled → `danger`.

## Dev Notes

**This is the epic's most novel story — the other five all mirror an existing pattern closely; this one's flexible rate-type shape doesn't have a direct precedent in the codebase.** The closest partial analogs, and exactly what each does and doesn't contribute:
- **`Purchase.paymentStatus`** (plain `String?`, Zod-enforced vocabulary) — the precedent for `SiteContract.rateType` being a `String`, not a Prisma enum, specifically because `CUSTOM`'s free-text `rateUnitLabel` needs the schema-level (not DB-level) flexibility a hard enum doesn't help with.
- **`WasteDisposal.ownership`** (`OWN | HIRED`, branches which other fields are required/nullable) — the precedent for one field's value determining which sibling fields are required, exactly what `rateType` does across `rate`/`fixedAmount`/`rateUnitLabel` here.
- **D7's nullable-pricing-group-completed-later idea** — the precedent for "may be incomplete at creation, completed before it counts," but **not** its atomic-`updateMany`-exactly-once mechanism (see Task 1's explicit note on why that doesn't apply — `SiteContract` isn't an AD-9 append-only table).
- **`Site`'s status-lifecycle + plain-Edit pattern (Story 2.2)** — the precedent for "status transitions are just a normal field update, timestamped via `updatedAt`, no separate transition endpoint."

None of these is a copy-paste template the way Story 18.1 mirrors Vendor almost verbatim — read all four, then design this one from first principles within AD-9/AD-7's constraints, don't force-fit a single borrowed shape.

**Why Owner/Admin-only for the whole resource, unlike Purchase's Supervisor-can-create-Draft split:** Purchase's D7 split exists because Supervisors record inward material in the field and Owner reconciles pricing later — a genuine two-role workflow. Engaging a Subcontractor and setting commercial terms is inherently an Owner decision (who to hire, what to pay them) — there's no equivalent "Supervisor captures it in the field, Owner prices it later" need here. Story 18.3 (Work Entries) is where Supervisor involvement actually belongs — recording how much work got done against an already-Active contract, which is a field observation, not a commercial decision.

**Architecture constraints in force:** AD-7 (one schema, `parse.ts`/`useClientValidation` pairing per AGENTS.md's mandatory-for-new-forms rule), AD-9 (materialized `quantityCompleted`/`amountPaid` — write-path-only, this story just declares the columns; 18.3/18.4 are what actually write to them), AD-11 (`@Roles('OWNER_ADMIN')` on the whole controller, not per-handler, since every handler here is Owner-only — unlike `VendorsController`/`SubcontractorsController` where only delete is gated).

**Depends on Story 18.1** (`Subcontractor` must exist). **Blocks Stories 18.3 and 18.4** (both need an Active `SiteContract` to attach a Work Entry/Payment to) **and 18.5** (the detail-page ledger sections extend this story's shell).

### Project Structure Notes

- `site-contracts.controller.ts`/`.service.ts` join `apps/api/src/subcontractors/` as siblings of Story 18.1's `SubcontractorsController`/`Service` — update `subcontractors.module.ts`'s arrays, do not create a `site-contracts` module.
- `apps/web/app/(app)/sites/[id]/contracts/` is a new sub-tree under the existing `sites/[id]/` route — `apps/web/app/(app)/sites/[id]/page.tsx` itself is only touched by Story 18.5 (which adds the "Subcontractors" section), not this story.
- No standalone top-level `/site-contracts` list page exists or is needed — every entry point into a Site Contract is nested (`/sites/[id]/contracts/...` to create/view from the Site side, `/subcontractors/[id]` to browse from the Subcontractor side in Story 18.5). Do not build a bare top-level list route.

### References

- [Source: _bmad-output/specs/spec-AzentisFieldOS/functional-requirements.md#CAP-17 — Subcontractor Management] (FR-56, FR-57)
- [Source: _bmad-output/planning-artifacts/epics/phase-9-subcontractor-management/epic-18-subcontractor-management.md]
- [Source: _bmad-output/implementation-artifacts/18-1-manage-subcontractor-records.md — prerequisite story, `Subcontractor` model/module this story extends]
- [Source: apps/api/src/inventory/purchases.controller.ts, purchases.service.ts (`completePricing`/`countPendingPricing`) — read to understand D7 and confirm why it does NOT transfer to this story's mechanism]
- [Source: infra/prisma/schema.prisma#WasteDisposal — the `ownership`-branches-required-fields precedent]
- [Source: infra/prisma/schema.prisma#Purchase — the plain-String-Zod-enforced-vocabulary precedent for `paymentStatus`]
- [Source: _bmad-output/planning-artifacts/epics/phase-2-field-operations-core/epic-2-site-management.md — Story 2.2's plain-Edit, timestamped-status-transition precedent]
- [Source: apps/web/app/(app)/movements/purchases/purchase-form.tsx — the Vendor `SelectField` picker pattern this story's Subcontractor picker replicates]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
