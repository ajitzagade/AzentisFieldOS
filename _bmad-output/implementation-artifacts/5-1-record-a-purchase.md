---
baseline_commit: cf5dd4dc709029a08e7c4febf34f2421f394871f
---

# Story 5.1: Record a Purchase

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As Owner/Admin,
I want to record a Purchase (Vendor, Material, Size, quantity, Unit, rate, total, invoice/challan, payment status, delivery location, vehicle, notes, destination Godown-or-Site, optional documents),
so that stock and spend are tracked from the moment material enters the business.

## Acceptance Criteria

1. **Given** I record a Purchase with Godown as the destination, **when** I submit, **then** Godown Stock for that Material/Size increases by the purchased quantity immediately, in the same transaction as the Purchase row insert. (FR-8)
2. **Given** I record a Purchase with a Site as the destination, **when** I submit, **then** that Site's Stock increases directly and Godown Stock is never touched by this transaction. (FR-8)
3. The row's "Correct" action opens a new reason-carrying entry linked to the original — never Edit/Delete. (AD-9)
4. A Purchase is individually retrievable — the Movements log lists every Purchase as its own row, never merged into a running total.
5. `siteId` is required and validated when `destination = SITE`, forbidden when `destination = GODOWN` — the API rejects a payload that mismatches these.

## Tasks / Subtasks

- [x] Task 1 — Shared Zod schema (AC: #1, #2, #3, #5)
  - [x] Create `packages/shared/src/schemas/purchase.ts`. Fields per `schema.prisma`'s `Purchase` model: `vendorId` (`z.uuid()`), `materialSizeId` (`z.uuid()`), `destination` (`z.enum(["GODOWN", "SITE"])`), `siteId` (`z.uuid().optional()`), `quantity` (`z.number()`), `rate` (`z.number().positive()`), `totalAmount` (`z.number().positive()`), `invoiceOrChallanNo`/`deliveryLocation`/`vehicleDetails`/`receiverName`/`notes` (all optional strings), `paymentStatus` (`z.enum(["PAID", "PARTIAL", "UNPAID"])` — Prisma stores it as plain `String`, no schema migration needed, this is an application-level closed set only), `purchasedAt` (`z.iso.datetime()` or `z.coerce.date()`), `correctsId`/`reason` (see Dev Notes "Correction semantics — read this before writing any other Epic 5 story").
  - [x] `.superRefine()`: `destination === "SITE"` requires `siteId` present; `destination === "GODOWN"` requires `siteId` absent. This is AC #5 — do not rely on the frontend alone to enforce it.
  - [x] `.superRefine()`: `quantity` must be `> 0` when `correctsId` is absent; may be negative (but not `0`) when `correctsId` is present. Same rule for `rate`/`totalAmount`: always positive, corrections don't need negative rate/total since a correction's "delta" is expressed only through `quantity` — see Dev Notes.
  - [x] Export from `packages/shared/src/index.ts`.
- [x] Task 2 — `apps/api` (AC: #1, #2, #3, #4)
  - [x] `apps/api/src/inventory/purchases.controller.ts` + `.service.ts`: `POST /purchases`, `GET /purchases`.
  - [x] `apps/api/src/inventory/inventory.module.ts` — this story creates the module; later Epic 5 stories (5.2–5.6) extend it with sibling controllers/services, mirroring how `materials.module.ts` grew across Epic 4's stories. Register in `apps/api/src/app.module.ts`.
  - [x] `PurchasesService.create` runs inside `prisma.$transaction(async (tx) => { ... })`: insert the `Purchase` row, then `tx.godownStock.upsert(...)` (destination GODOWN) or `tx.siteStock.upsert(...)` (destination SITE) with `create: { quantity }` / `update: { quantity: { increment: quantity } }` on the composite key. Purchases only ever increase a balance, so no stock-safety floor check is needed here (contrast Story 5.2's decrement path).
  - [x] `GET /purchases` includes `materialSize` (with its `material`, itself including `unit`) and `vendor`/`site` relations — the frontend list (Task 3) needs Material name, Size label, Unit, Vendor/destination name in one request.
- [x] Task 3 — `apps/web` UI (AC: #1, #2, #3, #4)
  - [x] Replace the stub `apps/web/app/(app)/movements/page.tsx` with the combined transaction log this story starts and Stories 5.2–5.6 extend: `DataTable` with columns Type (badge) / Material / Site-or-Godown flow / Sent Qty / Received Qty / Date / row-level `CorrectAction`, matching `07-movements.html`. This story only produces `Purchase` rows (badge `success`, "Purchase"); later stories add their own row-producers to the same page — do not build a Purchase-only page that a later story has to redesign.
  - [x] `apps/web/app/(app)/movements/purchases/new/page.tsx` — the Purchase entry form (all fields from Task 1's schema; `destination` toggles whether the Vendor-or-Godown/Site picker shows a Site `SelectField`).
  - [x] `apps/web/app/(app)/movements/purchases/[id]/correct/page.tsx` — same form, pre-filled from the original Purchase, with `correctsId` set and a required `reason` `TextField` shown per the "correction banner" pattern EXPERIENCE.md documents for DSR corrections (adapt the copy, same mechanism). Wire the list page's `CorrectAction` `href` to this route.
- [x] Task 4 — Tests (AC: all)
  - [x] Zod tests: destination/siteId cross-field rule; quantity sign rule (positive when no `correctsId`, non-zero either sign when `correctsId` present).
  - [x] `purchases.controller.spec.ts` (follow `sites.controller.spec.ts`'s structure): controller delegates validated body to service.
  - [x] `purchases.service.spec.ts`: a GODOWN-destined create calls `godownStock.upsert` with the right composite key and increment; a SITE-destined create calls `siteStock.upsert` and never touches `godownStock`; both run inside `prisma.$transaction`.
  - [x] `apps/web` component/page tests for the list page's Purchase row rendering and the create form's destination-toggle behavior.

## Dev Notes

**Correction semantics — read this before writing any other Epic 5 story.** `DESIGN.md`/`EXPERIENCE.md` say a correction is "a new entry... linked to the original," and AD-9 says current-state values are updated by "the same database transaction that inserts the ledger row causing the change" — for *every* row, original or correcting, uniformly. Neither document says whether a correcting row's `quantity` restates the full intended value or expresses only the delta. This story fixes that ambiguity for the whole epic: **a correcting row's quantity field is a signed delta applied on top of whatever the running balance already is**, not a restated total. Rationale: (1) it keeps the write path for every `Purchase`/`Movement`/`Consumption`/`ReturnWastage` insert identical whether or not `correctsId` is set — same upsert/decrement code, no branch that "replays and overrides" history; (2) FR-14's "always reconciling exactly" is trivially true under simple summation, and breaks under a replace-semantics that would need every reader to know to skip corrected originals. Concretely: if a Purchase was mistakenly recorded as 100 Bags but only 80 arrived, the correction is a new Purchase row with `quantity = -20`, `correctsId` = the original's id, `reason` = "Recount: 20 Bags short of original delivery." The original row is never touched. Every later story (5.2–5.6) follows this same rule for its own quantity field(s) — don't re-derive it, cite this section.

**Stock-safety (non-negative balances) does not apply to this story.** Purchases only ever increase a balance (`upsert` + `increment`), so there is no floor check here. Stories 5.2 (Movement), 5.5 (Consumption), and 5.6 (Wastage) are the ones that decrement a balance and must implement the race-safe floor check — that pattern is specified once in Story 5.2's Dev Notes; this story doesn't need it, don't add one speculatively.

**`paymentStatus` is a Prisma `String`, not an enum column** (`schema.prisma:163`) — no migration needed to close its value set; enforce `"PAID" | "PARTIAL" | "UNPAID"` at the Zod layer only, exactly like `destination`'s Prisma enum is enforced at both layers. If a fourth status value is ever needed, it's a one-line Zod change, not a migration — this is deliberate, matching the same "config, not migration" spirit as Epic 4's `customFields`.

**This is the foundational transaction-entry story.** `apps/api/src/inventory/` and the combined `/movements` list page are created here and extended, not recreated, by Stories 5.2 through 5.6. If those stories are picked up out of order, check whether this story's module/page already exist before scaffolding new ones.

**Architecture constraints in force:** AD-3 (all writes through `apps/api`), AD-4/AD-5 (design tokens, shared primitives — `DataTable`, `Button`, `TextField`/`SelectField`, `CorrectAction`, `Badge`), AD-6 (full state set on the `/movements` list and the create form's validation-failure state), AD-7 (one Zod schema per shape), AD-9 (append-only — `PurchasesService` must never call `.update()` or `.delete()` on the `Purchase` model; the DB-role-level grant revocation AD-9 also describes is an infra/provisioning concern, not something this story's application code implements — don't attempt to configure Postgres roles here).

### Project Structure Notes

- New `apps/api/src/inventory/` module — no existing precedent beyond `apps/api/src/sites/` and `apps/api/src/materials/` (Epic 4) to follow structurally.
- `apps/web/app/(app)/movements/page.tsx` already exists as a stub (Epic 1 scaffold) — this story replaces it, matching the pattern already used for `/materials` and `/sites` in Epics 2 and 4.
- Depends on Epic 4 (Material/MaterialSize/Unit must exist to be picked in the Purchase form) — the epic's own Implementation Notes state this explicitly.

### References

- [Source: _bmad-output/specs/spec-AzentisFieldOS/functional-requirements.md#CAP-3 — Inventory Lifecycle & Movement] (FR-8, feature-level non-negative rule)
- [Source: _bmad-output/planning-artifacts/epics/phase-3-materials-inventory/epic-5-inventory-transactions-stock-visibility.md]
- [Source: _bmad-output/planning-artifacts/stories/phase-3-materials-inventory/epic-5-inventory-transactions-stock-visibility/story-5.1-record-purchase.md]
- [Source: infra/prisma/schema.prisma#Purchase, GodownStock, SiteStock]
- [Source: _bmad-output/planning-artifacts/architecture/architecture-AzentisFieldOS-2026-08-11/ARCHITECTURE-SPINE.md#AD-9]
- [Source: apps/api/src/sites/sites.controller.ts, sites.service.ts — the controller/service pattern this story's API layer follows]
- [Source: packages/ui/src/components/correct-action.tsx — CorrectAction's href/onClick contract]
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/07-movements.html — combined transaction-log table shape]
- [Source: _bmad-output/implementation-artifacts/4-1-manage-material-categories-materials.md — Material/MaterialSize/Unit this story's form depends on]

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (claude-sonnet-5)

### Debug Log References

### Completion Notes List

- `PurchasesService.create` never mutates `Purchase` (AD-9) — original and correcting rows both go through one `tx.purchase.create(...)`, and the balance write is a single `upsert`/`increment` for both cases, matching Dev Notes' "same upsert code, no replay branch" rationale.
- Unlike `DailySiteReport`/`WorkRecord` in Epic 3, `GodownStock`/`SiteStock` still have real, unrelaxed DB primary keys (`@@id([materialSizeId])`, `@@id([siteId, materialSizeId])`), so Prisma's `.upsert()` compiles to an atomic `INSERT ... ON CONFLICT` — no advisory lock was needed here (confirmed with a real-Postgres integration test of a second concurrent Purchase for the same Material Size).
- `purchasedAt` is `z.iso.date()` (date-only, matching the DSR `reportDate` precedent and a native `<input type="date">`) rather than `z.iso.datetime()`/`z.coerce.date()` — the service converts to a `Date` before the Prisma write, since `Purchase.purchasedAt` is a full `DateTime` column that rejects a bare date string (caught by the integration test, not by the mocked service spec).
- Added `GET /purchases/:id` (`PurchasesService.findOne`) — not in Task 2's endpoint list, but required for the Task 3 correction form to pre-fill from the original Purchase. No other endpoint could serve that need without fetching the entire list.
- `vendorId` is `z.uuid()` per Task 1, but Vendor Management (Epic 9) hasn't shipped yet — the create/correct forms render it as a free-text field with a hint explaining the gap, the same graceful-degradation approach Epic 3's DSR form used for `teamMemberId`/`vendorId` before Epics 6/9 existed.
- A correcting row's `quantity` is a signed delta (Dev Notes), so the correction form intentionally leaves Quantity blank rather than pre-filling the original's value — pre-filling would read as "the corrected total," which is the opposite of what the field means. `vendorId`/`materialSizeId`/`destination`/`siteId` are locked (disabled, matching the DSR correction-form precedent) since a correction must stay tied to the same underlying transaction; other fields (rate, totalAmount, payment/logistics fields) are editable, pre-filled as sensible defaults from the original.
- Server Actions (`useActionState`) can't submit `disabled` fields — the browser omits disabled controls from `FormData` entirely. The correction form pairs each locked, visibly-disabled field with a same-named `<input type="hidden">` carrying the actual value, so the locked fields still reach the server despite being non-interactive.
- Final state: `apps/api` 135 tests / 16 files passing (`pnpm --filter @azentisfieldos/api test`, requires `DATABASE_URL` exported — Turbo doesn't pass it through, per AGENTS.md's documented workaround), `apps/web` 137 tests / 37 files passing. Both packages typecheck, lint, and build clean (`next build`, `nest build`).

### Review Findings

- [x] [Review][Patch] Correction doesn't verify the original Purchase's materialSizeId/destination/siteId match the submitted correction — server-side gap, only prevented client-side by locked form fields [apps/api/src/inventory/purchases.service.ts:15] — fixed: `create()` now rejects a correction whose materialSizeId/destination/siteId diverge from the original Purchase's.
- [x] [Review][Patch] `createPurchaseAction`'s 400-fallback reads `body.error?.message`, but Nest's default BadRequestException body has no `error` object (`error` is the string `"Bad Request"`) — the real backend message is never actually surfaced, and the existing test mocks a shape that doesn't match reality, masking this [apps/web/app/(app)/movements/purchases/actions.ts:49] — fixed: now reads `body.message` (Nest's real field), and the test mocks the real `{ statusCode, message, error: 'Bad Request' }` shape.
- [x] [Review][Patch] `correctsId` schema field is `z.string().min(1)` instead of `z.uuid()`, inconsistent with every other id field in the schema [packages/shared/src/schemas/purchase.ts:20] — fixed.
- [x] [Review][Dismiss] `GET /purchases/:id` "500 on malformed id" — false positive: `Purchase.id` is a plain Prisma `String` (no `@db.Uuid`), so a malformed id simply misses the `findUnique` lookup and returns `null`, which the existing code already converts to a clean 404 via `NotFoundException`. No Postgres-level type-cast error is possible here. [apps/api/src/inventory/purchases.controller.ts:29]
- [x] [Review][Patch] `createPurchaseAction` doesn't wrap `fetch()` in try/catch — a network failure throws an unhandled rejection instead of returning `formError` [apps/web/app/(app)/movements/purchases/actions.ts:42] — fixed.
- [x] [Review][Patch] `createPurchaseAction`'s 400-handling calls `res.json()` without a `.catch()` — a non-JSON 400 body throws unhandled [apps/web/app/(app)/movements/purchases/actions.ts:49] — fixed.
- [x] [Review][Patch] `PurchaseForm`'s prop types don't enforce `correctsId`/`initial` as required together when `mode="correct"` [apps/web/app/(app)/movements/purchases/purchase-form.tsx:47] — fixed: converted to a discriminated union on `mode`.
- [x] [Review][Defer] `countThisMonth` uses server-local timezone instead of explicit IST — edge-case precision on a stat tile, not central to any AC [apps/api/src/inventory/purchases.service.ts:79] — deferred, pre-existing pattern across the codebase's stat-tile queries
- [x] [Review][Defer] No cross-field validation that totalAmount ≈ quantity × rate — enhancement, not specified by any AC — deferred, not a regression
- [x] [Review][Defer] No `createdByUserId` attribution on Purchase — deferred, matches the already-tracked epic-wide "no per-request auth yet" TODO in AGENTS.md
- [x] [Review][Defer] `PurchasesService.list()` has no pagination — deferred, systemic pattern across the whole codebase, not new to this diff
- [x] [Review][Defer] Archived Material/Site in a correction form renders the locked dropdown as visually unselected — deferred, cosmetic only; the hidden input still carries the correct id through

### File List

- `packages/shared/src/schemas/purchase.ts` (new)
- `packages/shared/src/index.ts` (modified — export)
- `apps/api/src/inventory/purchases.service.ts` (new)
- `apps/api/src/inventory/purchases.controller.ts` (new)
- `apps/api/src/inventory/inventory.module.ts` (new)
- `apps/api/src/inventory/purchases.controller.spec.ts` (new)
- `apps/api/src/inventory/purchases.service.spec.ts` (new)
- `apps/api/src/inventory/purchases.service.integration.spec.ts` (new)
- `apps/api/src/app.module.ts` (modified — registered `InventoryModule`)
- `apps/web/app/(app)/movements/page.tsx` (replaced stub)
- `apps/web/app/(app)/movements/page.test.tsx` (new)
- `apps/web/app/(app)/movements/purchases/actions.ts` (new)
- `apps/web/app/(app)/movements/purchases/actions.test.ts` (new)
- `apps/web/app/(app)/movements/purchases/purchase-form.tsx` (new)
- `apps/web/app/(app)/movements/purchases/purchase-form.test.tsx` (new)
- `apps/web/app/(app)/movements/purchases/new/page.tsx` (new)
- `apps/web/app/(app)/movements/purchases/new/page.test.tsx` (new)
- `apps/web/app/(app)/movements/purchases/[id]/correct/page.tsx` (new)
- `apps/web/app/(app)/movements/purchases/[id]/correct/page.test.tsx` (new)
