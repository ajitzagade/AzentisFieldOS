---
baseline_commit: 4f33962f5ba714deb608278e32224cdb9e049d6f
---

# Story 9.2: View Vendor Purchase History

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As Owner/Admin,
I want to see a Vendor's full Purchase→Material→Quantity→Amount history and payment status in one place,
so that I know exactly what I've bought from them and what I owe.

## Acceptance Criteria

1. **Given** a Vendor with Purchases recorded against them (from Epic 5), **when** I open their detail page, **then** I see every Purchase chronologically with Material, Quantity, Amount, Invoice/Challan #, and Payment status. (FR-40)
2. A Vendor with no Purchases yet shows a clear empty state, not a blank table.
3. This story reads Epic 5's `Purchase` records filtered by Vendor — it does not duplicate or re-store that data. (Epic Implementation Notes)
4. The Vendor list page's aggregate "amount outstanding" figure is precise about what it actually represents — see Dev Notes "What 'payment status' can and can't tell you at the Vendor level."

## Tasks / Subtasks

- [x] Task 1 — `apps/api` (AC: #1, #2, #3)
  - [x] `apps/api/src/vendors/vendors.controller.ts` (Story 9.1, extend): `GET /vendors/:id/purchases` — every `Purchase` where `vendorId = :id`, `orderBy: { purchasedAt: 'desc' }`, joined with `materialSize` (→ `material`, → `unit`) for display. Reuse `PurchasesService` (Epic 5) for the underlying query rather than writing a second Prisma query against `Purchase` in `VendorsService` — call into the existing service, don't duplicate its query shape (same "one query capability, not two copies" discipline Epic 6 Story 6.3 applied to `WorkRecord`).
  - [x] `apps/api/src/vendors/vendors.controller.ts`: `GET /vendors/:id/purchase-summary` — `{ totalThisYear, notFullyPaidTotal }`. `totalThisYear`: `SUM(totalAmount)` for that Vendor's Purchases with `purchasedAt` in the current calendar year. `notFullyPaidTotal`: `SUM(totalAmount)` for that Vendor's Purchases where `paymentStatus != 'PAID'` — see Dev Notes for why this is the precise, honest definition rather than a claimed exact "amount due."
- [x] Task 2 — `apps/web` UI (AC: #1, #2, #4)
  - [x] Extend `apps/web/app/(app)/vendors/[id]/page.tsx` (Story 9.1) with a "Purchase History" section: `DataTable` (Material / Quantity / Amount / Invoice-Challan # / Payment status badge / Date), sourced from Task 1's `purchases` endpoint, using `DataTable`'s built-in empty state (AC #2 — "No Purchases recorded yet for this Vendor," not a bare blank table).
  - [x] Extend `apps/web/app/(app)/vendors/page.tsx` (Story 9.1) with the remaining two mockup columns: "Total purchase (this year)" (`totalThisYear`) and "Payment status" — render the latter as **"Fully Paid"** (success badge) when `notFullyPaidTotal === 0`, else **"₹X not marked Paid"** (warning badge, using the exact `notFullyPaidTotal` figure) — not the mockup's literal "₹1,24,500 due" copy, which implies a precision (an exact remaining balance on partially-paid Purchases) this data model doesn't track — see Dev Notes.
- [x] Task 3 — Tests (AC: all)
  - [x] `vendors.service.spec.ts` (extend Story 9.1's): `purchases` orders correctly and delegates to the existing `PurchasesService` query capability rather than a parallel one; `purchase-summary` computes both figures correctly, including a Vendor with zero Purchases (`0`/empty, not an error — same "graceful zero" precedent Epic 6 Story 6.3 established for Epic-7-pending totals).
  - [x] `apps/web` component test: empty-state rendering for a Vendor with no Purchases.

### Review Findings

- [x] [Review][Patch] A single failed per-Vendor purchase-summary fetch crashed the entire Vendors list page [apps/web/app/(app)/vendors/page.tsx:83] — fixed: `getVendorPurchaseSummarySafe` catches per-row and returns `null`; the list page renders an honest "—" for that row's two summary columns instead of either crashing the page or fabricating a false "Fully Paid"/0 figure.
- [x] [Review][Patch] `paymentStatus` badge lookup on the Vendor detail page had no fallback for a value outside `PAID`/`PARTIAL`/`UNPAID` [apps/web/app/(app)/vendors/[id]/page.tsx:69-72] — fixed: falls back to a neutral badge showing the raw value instead of crashing.
- [x] [Review][Defer] No pagination on `GET /vendors/:id/purchases` [apps/api/src/inventory/purchases.service.ts:121] — deferred, systemic pattern across the whole codebase (`PurchasesService.list()` and every other list endpoint are unbounded too), already logged repeatedly in prior stories' reviews

## Dev Notes

**What "payment status" can and can't tell you at the Vendor level — read before wiring the list-page stat tile.** `Purchase.paymentStatus` is a per-Purchase label (`PAID`/`PARTIAL`/`UNPAID`), set once when the Purchase is recorded (or corrected, via Epic 5's existing mechanism) — there is no field anywhere in the schema tracking *how much* of a `PARTIAL` Purchase has actually been paid, because no epic (this one included) defines a workflow for recording incremental payments against a Purchase over time. The mockup's list-page figure ("₹1,24,500 due") reads as an exact remaining balance, which this data model cannot honestly compute — a `PARTIAL` Purchase's true remaining amount is unknown, not zero and not its full `totalAmount`. Building that tracking (an append-only ledger of payments made to a Vendor, analogous to Epic 7's `Payment` model for Team Members) is real, scoped work no FR in this epic asks for — don't build it as a side effect of this story. Task 1/2's resolution instead computes and labels an *honest* aggregate: the total value of Purchases not marked `PAID`, explicitly framed as that ("₹X not marked Paid"), not as a claimed precise amount owed. This is the same "honest placeholder over a fabricated formula" principle Epic 5 Story 5.7 applied to Inventory's stock-value tiles — cite it if a reviewer questions the copy change from the mockup's literal wording.

**Depends on Story 9.1** (`Vendor`, `VendorsModule`, the detail page shell) and **Epic 5** (`Purchase`, `PurchasesService` — this story is purely a filtered read on top of that existing write path, never a new one).

**Architecture constraints in force:** AD-3, AD-4, AD-5, AD-6 (empty state is AC #2's explicit requirement).

### Project Structure Notes

- Extends `apps/api/src/vendors/vendors.controller.ts`/`.service.ts` (Story 9.1) — no new files at the API layer beyond that.
- Extends `apps/web/app/(app)/vendors/[id]/page.tsx` and `apps/web/app/(app)/vendors/page.tsx` (Story 9.1).

### References

- [Source: _bmad-output/specs/spec-AzentisFieldOS/functional-requirements.md#CAP-11] (FR-40)
- [Source: _bmad-output/planning-artifacts/stories/phase-5-assets-suppliers/epic-9-vendors/story-9.2-vendor-purchase-history.md]
- [Source: _bmad-output/implementation-artifacts/9-1-manage-vendor-records.md — this story's direct prerequisite]
- [Source: _bmad-output/implementation-artifacts/5-1-record-a-purchase.md — the Purchase/PurchasesService this story reads, never duplicates]
- [Source: _bmad-output/implementation-artifacts/5-7-stock-lifecycle-visibility-low-stock-flagging.md — the "honest placeholder, not a fabricated figure" precedent this story's payment-status copy follows]
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/12-vendors.html, 13-vendor-detail.html]

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (claude-sonnet-5)

### Debug Log References

### Completion Notes List

- Implemented together with Story 9.1 in one pass (both stories share the same Vendor detail/list pages) — see that story's Completion Notes for the schema/CRUD half of the work.
- `PurchasesService` gained `listByVendor(vendorId)` and `summaryForVendor(vendorId)` rather than `VendorsService` querying `Purchase` directly, per AC #3 and Task 1's explicit instruction. `InventoryModule` now `exports: [PurchasesService]` so `VendorsModule` can import it — the only cross-module wiring this story needed.
- `notFullyPaidTotal` is computed as `SUM(totalAmount)` for Purchases where `paymentStatus != 'PAID'` (i.e. `PARTIAL` or `UNPAID`), and rendered on the list page as "₹X not marked Paid" rather than the mockup's "₹X due" — per Dev Notes, this schema has no field tracking how much of a `PARTIAL` Purchase has actually been paid, so anything claiming to be an exact "amount due" would be fabricated.
- The Vendor list page's "Total purchase (this year)" / "Payment status" columns are populated via one `GET /vendors/:id/purchase-summary` call per Vendor (`Promise.all` in the Server Component), since Task 1 only specifies a single-Vendor summary endpoint, not a batch one — matches the story's endpoint list exactly rather than inventing a new batch endpoint not asked for.
- Purchase History empty state ("No Purchases recorded yet for this Vendor.") uses `DataTable`'s built-in `status: "empty"` state, same as the Site Activity Feed precedent.
- Final verification: covered by Story 9.1's Completion Notes (same test/typecheck/lint/build run, since both stories' code was verified together).
- **Post-review:** `getVendorPurchaseSummarySafe` wraps the per-Vendor summary fetch so one Vendor's failure degrades that row to "—" instead of throwing and blanking the whole list page — deliberately not defaulted to `0`/"Fully Paid", which would misrepresent what's actually owed (same honesty principle this story's own Dev Notes already establish for `notFullyPaidTotal`). The Purchase History `paymentStatus` badge lookup also gained a fallback for values outside `PAID`/`PARTIAL`/`UNPAID`, since that column is a plain DB string, not a Prisma enum.

### File List

- `apps/api/src/inventory/purchases.service.ts` (modified — `listByVendor`, `summaryForVendor`)
- `apps/api/src/inventory/purchases.service.spec.ts` (modified — tests for both new methods)
- `apps/api/src/inventory/inventory.module.ts` (modified — exports `PurchasesService`)
- `apps/api/src/vendors/vendors.service.ts` (extended — `purchases`, `purchaseSummary`)
- `apps/api/src/vendors/vendors.controller.ts` (extended — `GET /vendors/:id/purchases`, `GET /vendors/:id/purchase-summary`)
- `apps/api/src/vendors/vendors.service.spec.ts` / `vendors.controller.spec.ts` (extended)
- `apps/web/app/(app)/vendors/[id]/page.tsx` (extended — Purchase History section)
- `apps/web/app/(app)/vendors/[id]/page.test.tsx` (extended)
- `apps/web/app/(app)/vendors/page.tsx` (extended — Total purchase / Payment status columns)
- `apps/web/app/(app)/vendors/page.test.tsx` (extended)
- Also created by Story 9.1 (see that story's File List): the rest of `apps/api/src/vendors/**` and `apps/web/app/(app)/vendors/**`
