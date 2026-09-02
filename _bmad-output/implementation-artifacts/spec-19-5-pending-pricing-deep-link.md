---
title: 'Pending-Pricing Deep Link (Story 19.5)'
type: 'feature'
created: '2026-09-02'
status: 'done'
baseline_commit: '8d103cd5f1f8dc58d9d5c174acc1c17fea18c5e8'
review_loop_iteration: 0
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-19-context.md', '{project-root}/_bmad-output/planning-artifacts/stories/phase-8-post-launch/epic-19-owner-quick-access-and-mobile-alignment/story-19.5-pending-pricing-deep-link.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The Dashboard's pending-pricing gap-flag links to `/movements?type=PURCHASE` — an unfiltered, mixed list — forcing the Owner to scan for the "Pricing pending" badge instead of landing on the record(s) that actually need pricing.

**Approach:** When exactly one Purchase is pending, link straight to its `/movements/purchases/:id/pricing` page; when more than one, link to `/movements` with a new pending-pricing-only filter selected — reusing the existing `totalAmount: null, correctsId: null` where-clause already written once for the count endpoint.

## Boundaries & Constraints

**Always:** `owner-dashboard.tsx` (Server Component) keeps its existing `GET /purchases/count/pending-pricing` call for the badge/count display. Only when that count `=== 1`, make one additional server-side call to fetch the single pending Purchase's id, via a new `pendingPricing` query param on the existing `GET /purchases` list endpoint (extends `PurchasesController.list()`/`PurchasesService.list()`'s `reportWhere()` with `{ totalAmount: null, correctsId: null }` when set — same clause `countPendingPricing()` already uses) — no new endpoint. The gap-flag's button at `owner-dashboard.tsx:291` becomes conditional: count `=== 1` → `href={`/movements/purchases/${id}/pricing`}`; count `> 1` → `href="/movements?type=PURCHASE_PENDING_PRICING"`. Add `PURCHASE_PENDING_PRICING` as a new value in `movements-list-client.tsx`'s existing `TYPE_OPTIONS`/"Type" `SelectField` (reuses the existing `?type=` → `page.tsx` → `GET /movements-log?type=...` plumbing) rather than introducing a new Tabs UI primitive. `movements-log.service.ts`'s `purchaseWhere` builder gains a branch for this type value: fold in `{ totalAmount: null, correctsId: null }` and force `wantMovement/wantConsumption/wantReturnWastage` false, mirroring the existing `type=PURCHASE` branch (lines 87-91). Zero-pending case is unaffected — the gap-flag already doesn't render when count is 0.

**Ask First:** The label/UI for the new filter — the story brief calls it a "tab," but there is no existing Tabs primitive in `packages/ui` and Movements today uses a plain "Type" dropdown (`SelectField`) for exactly this kind of filtering, with a `reports/page.tsx`-style hand-rolled chip-row `tablist` as the only other precedent in the codebase. Default to adding it as a new dropdown option (`"Pricing pending"`) unless the human prefers the chip-row tab-strip treatment — HALT and confirm before implementing either.

**Never:** No new endpoint beyond the `pendingPricing` query param extension. No change to `PATCH /purchases/:id/pricing` or the pricing page itself. No mixing of priced and unpriced Purchases under the new filter value.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Exactly one pending Purchase | `pendingPricingCount === 1` | Gap-flag links directly to `/movements/purchases/:id/pricing` for that record | N/A |
| More than one pending | `pendingPricingCount > 1` | Gap-flag links to `/movements?type=PURCHASE_PENDING_PRICING`, showing only unpriced Purchases | N/A |
| Zero pending | `pendingPricingCount === 0` | Gap-flag does not render (existing, unchanged) | N/A |
| Pending-pricing filter active | Movements list | Already-priced entries excluded — never mixed with pending ones | N/A |
| A pending Purchase gets priced/corrected | Count changes | Next read of `GET /purchases/count/pending-pricing` reflects it immediately (existing contract, unchanged) | N/A |

</frozen-after-approval>

## Code Map

- `apps/web/app/(app)/_components/owner-dashboard.tsx:128,285-298` -- `pendingPricingCount` fetch and the gap-flag's `Link href="/movements?type=PURCHASE"` at line 291; add the count`===1` branch fetching the single pending purchase id.
- `apps/api/src/inventory/purchases.controller.ts:36-39,49-52` -- `list()` (no query params today) and `countPendingPricing()` (the `{ totalAmount: null, correctsId: null }` where-clause to mirror); add `pendingPricing` query param support to `list()`.
- `apps/api/src/inventory/purchases.service.ts:89-111,163-167` -- `list(filters)`/`reportWhere()` and `countPendingPricing()`; extend `reportWhere()` to fold in `{ totalAmount: null, correctsId: null }` when `filters.pendingPricing` is set.
- `apps/web/app/(app)/movements/movements-list-client.tsx:258-264,338-344` -- `TYPE_OPTIONS` array and the "Type" `SelectField`; add `PURCHASE_PENDING_PRICING` as a new option.
- `apps/web/app/(app)/movements/page.tsx:15,28,33` -- `searchParams.type` passthrough to `GET /movements-log?type=...`; unaffected, already generic.
- `apps/api/src/inventory/movements-log.service.ts:87-91,132-136` -- `purchaseWhere` builder's existing `type=PURCHASE` branch (lines 87-91) to mirror for the new `PURCHASE_PENDING_PRICING` value, folding in the pending-pricing where-clause and forcing other `want*` flags false.
- `apps/web/app/(app)/movements/movements-list-client.tsx:124` -- existing `pricingHref` construction (`/movements/purchases/${purchase.id}/pricing`), the exact pattern the Dashboard's single-id deep link mirrors.
- `apps/web/app/(app)/movements/purchases/[id]/pricing/page.tsx:33,36-38` -- target route, `OWNER_ADMIN`-gated, unaffected.

## Tasks & Acceptance

**Execution:**
- [ ] `apps/api/src/inventory/purchases.controller.ts` + `purchases.service.ts` -- add `pendingPricing` query param to `list()`/`reportWhere()`
- [ ] `apps/web/app/(app)/_components/owner-dashboard.tsx` -- when `pendingPricingCount === 1`, fetch the single pending purchase id and branch the gap-flag's href accordingly
- [ ] `apps/web/app/(app)/movements/movements-list-client.tsx` -- add `PURCHASE_PENDING_PRICING` to `TYPE_OPTIONS`
- [ ] `apps/api/src/inventory/movements-log.service.ts` -- add the `PURCHASE_PENDING_PRICING` branch to `purchaseWhere`
- [ ] Unit tests: `purchases.service` pendingPricing filter, `movements-log.service` new type branch (excludes priced Purchases), `owner-dashboard` gap-flag href branching (0/1/>1 cases)

**Acceptance Criteria:**
- Given exactly one Purchase has pending pricing, when the gap-flag's action button is clicked, then the Owner lands directly on `/movements/purchases/:id/pricing` for that record
- Given more than one Purchase has pending pricing, when "Review & Price" is clicked, then the Owner lands on `/movements` filtered to only unpriced entries — not the full unfiltered log
- Given zero Purchases are pending, then the gap-flag does not appear
- Given the pending-pricing filter is active, then already-priced entries are excluded
- Given a Purchase's pending state changes, then the next count read reflects it immediately

## Verification

**Commands:**
- `pnpm --filter @azentisfieldos/api test` -- expected: new `purchases.service`/`movements-log.service` tests pass, no regressions
- `pnpm --filter @azentisfieldos/api typecheck` -- expected: clean
- `pnpm --filter @azentisfieldos/web typecheck` -- expected: clean
- `pnpm --filter @azentisfieldos/web test` -- expected: `owner-dashboard`/`movements-list-client` tests pass

**Manual checks (if no CLI):**
- As Owner, with exactly one pending-pricing Purchase, click the gap-flag and confirm it lands on that Purchase's pricing page. Create a second pending Purchase, confirm the gap-flag now links to the filtered Movements view showing only unpriced entries.
