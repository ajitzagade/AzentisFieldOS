# Story 18.6: Cross-Site Subcontractor Payable Rollup

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As Owner/Admin,
I want to see total outstanding amount owed to Subcontractors at a glance on the Dashboard, drillable per Subcontractor, plus a flag for any Draft Site Contract still missing commercial terms,
so that I know exactly how much money is tied up in outsourced work, and nothing sits forgotten in Draft.

## Acceptance Criteria

1. **Given** Site Contracts with recorded Work Entries and Payments across multiple Subcontractors and Sites, **when** I view the Dashboard, **then** a total outstanding-to-Subcontractors figure is shown, reconciling exactly to the sum of each Site Contract's individually-computed outstanding amount. (FR-63)
2. Clicking through from the Dashboard figure opens a view drillable to the specific Subcontractor/Site Contract level — not a dead-end number (same rule FR-25's Outstanding-advance visibility and every other Dashboard tile already follows).
3. **Given** one or more Draft Site Contracts still missing required commercial terms, **when** I view the Dashboard, **then** a Gap Flag names the count and links to where they can be completed — never a silent absence.
4. The existing "cash tied up" Dashboard figure (Vendor purchases not fully paid + Team Member outstanding advances) is extended to include outstanding-to-Subcontractors — it remains "one number: how much money is currently tied up," now covering every money-owed category that exists, not a stale subset.
5. Any of this story's three new reads failing degrades that piece alone (returns `null`/omits the tile), never breaks the rest of the Dashboard — same additive-context rule the existing pending-pricing flag already follows.

## Tasks / Subtasks

- [ ] Task 1 — `apps/api`: summary endpoints (AC: #1, #3)
  - [ ] Add to `SiteContractsController`/`Service` (`apps/api/src/subcontractors/`):
    - `GET /site-contracts/outstanding-summary` — returns `{ totalOutstanding: number, bySubcontractor: Array<{ subcontractorId, subcontractorName, outstanding: number }> }`. Compute by loading every non-Cancelled `SiteContract` (a Cancelled contract's outstanding is moot — no further work/payment is expected against it; decide whether a Cancelled contract with a nonzero outstanding at the moment of cancellation should still count as money owed and settle that explicitly rather than silently excluding it without a documented reason) with Story 18.5's Task 1 computed-outstanding logic, summing `outstandingAmount` (treating `null` — pending pricing — as `0` for the *sum*, since an unpriced Draft contributes nothing to a payable total by definition, not because it's actually zero) grouped by Subcontractor.
    - `GET /site-contracts/count/draft-pending-terms` — `prisma.siteContract.count({ where: { status: 'DRAFT', OR: [{ rateType: null }, /* AND the rate-type-appropriate rate/amount field is null */] } })`, mirroring `PurchasesService.countPendingPricing()`'s shape exactly (a Draft contract that already has every required field filled in — just hasn't been flipped to Active yet — should not count here; this endpoint is about *missing* terms, not merely *unconfirmed* status).
  - [ ] Both routes open to both roles (read-only, informational — matches `GET /purchases/count/pending-pricing`'s no-guard precedent), registered before `GET /site-contracts/:id` in the controller (same ordering discipline `PurchasesController` already follows so `count/pending-pricing` doesn't get swallowed by the `:id` param route).
- [ ] Task 2 — `apps/web`: Dashboard additions (AC: #1, #2, #3, #4, #5)
  - [ ] In `apps/web/app/(app)/_components/owner-dashboard.tsx`, add `getJSONSafe` calls for both new endpoints alongside the existing `getVendorOutstandingTotal()`/pending-pricing fetch in the same `Promise.all` — same additive-context, degrades-to-null-silently pattern already documented on that pending-pricing fetch.
  - [ ] Add a `StatTile` for "Outstanding to Subcontractors" in the Money section (alongside the existing Vendor-dues/cash-tied-up tiles), linking through to a Subcontractor-outstanding breakdown view (AC #2) — reuse `apps/web/app/(app)/subcontractors/page.tsx` (Story 18.1) with a query param sorting/filtering by outstanding amount if that list doesn't already support it, rather than building a new dedicated breakdown screen; only build a new view if the existing Subcontractors list genuinely can't be adapted to double as this drill-down.
  - [ ] Add a second `GapFlag` (AC #3), same shape as the existing pending-pricing flag: icon, message ("`N` Site Contracts are still missing commercial terms"), one primary action linking to a filtered Subcontractors/Site-Contracts view (or, if no such filtered view exists yet, to the Subcontractors list generally — do not link to a screen that doesn't exist).
  - [ ] Update the `cashTiedUp` computation (AC #4): currently `vendorOutstanding === null ? null : vendorOutstanding + overall.outstandingAdvances.total` — extend to `vendorOutstanding === null || subcontractorOutstanding === null ? null : vendorOutstanding + overall.outstandingAdvances.total + subcontractorOutstanding`, preserving the existing "unknown component ⇒ unknown total, never a partial figure presented as the answer" rule verbatim for the new component too.
- [ ] Task 3 — Tests (AC: all)
  - [ ] `site-contracts.service.spec.ts`: `outstandingSummary` sums correctly across multiple Subcontractors/Sites and excludes/handles Cancelled contracts per whatever the Task 1 decision was (document the decision in a code comment, not just the test); `countDraftPendingTerms` counts only Draft contracts with a genuinely missing rate-type-appropriate field, not every Draft.
  - [ ] Dashboard component test: both new fetches failing (`null`) leaves the rest of the Dashboard rendering, the new tile/flag simply absent; `cashTiedUp` becomes `null` (not a partial sum) when any of its three components is `null`.

## Dev Notes

**This story is intentionally small** — it's two summary reads and their Dashboard wiring, reusing Story 18.5's per-contract computed-outstanding logic rather than re-deriving it. If this story's implementation starts growing new business logic beyond "sum what 18.5 already computes" and "count Draft rows missing fields," that's a sign of scope creep — stop and check against FR-63 again.

**The Cancelled-contract question in Task 1 is a real decision, not a rhetorical aside — resolve it explicitly.** A Site Contract cancelled mid-engagement, with Work Entries logged but not fully paid for, still represents real money the business owes for work actually done, even though no further work/payment is *expected*. The safest default — and the one to implement absent a stronger signal from a future mockup or the Owner's actual usage pattern — is to **include** Cancelled contracts with a nonzero outstanding in the total (money already owed doesn't stop being owed because the engagement ended), but **exclude** them from `countDraftPendingTerms` (a cancelled engagement will never need its terms completed). Write the test in Task 3 to pin whichever behavior is implemented, and leave the reasoning in a code comment — this is exactly the kind of quiet ambiguity that becomes a silent wrong-number bug if left undocumented.

**`cashTiedUp`'s existing null-propagation discipline (AC #4) is the one easy place to introduce a subtle bug** — a naive `(vendorOutstanding ?? 0) + (subcontractorOutstanding ?? 0) + ...` would silently understate the true figure whenever either fetch fails, which is exactly the "partial figure presented as the answer" anti-pattern the current code's own comment explicitly rejects. Keep the strict "any unknown component ⇒ whole total is unknown" rule.

**Architecture constraints in force:** AD-3 (apps/web reads this over HTTP, never a direct DB query), AD-6 (each new tile/flag degrades independently, per AC #5).

**Depends on Stories 18.1–18.5** (particularly 18.5's Task 1 computed-outstanding logic, which this story sums rather than reimplementing) — the last story in the epic, ships once every other piece is in place.

### Project Structure Notes

- `apps/api/src/subcontractors/site-contracts.controller.ts`/`.service.ts` (modified — two new routes, both registered before the `:id` catch-all).
- `apps/web/app/(app)/_components/owner-dashboard.tsx` (modified — two new fetches, one `StatTile`, one `GapFlag`, one formula update).
- No new pages, no new Prisma models — this story is pure aggregation over data every earlier story in this epic already writes.

### References

- [Source: _bmad-output/specs/spec-AzentisFieldOS/functional-requirements.md#CAP-17 — Subcontractor Management] (FR-63)
- [Source: _bmad-output/planning-artifacts/epics/phase-9-subcontractor-management/epic-18-subcontractor-management.md]
- [Source: _bmad-output/implementation-artifacts/18-5-subcontractor-visibility-on-site-and-detail-pages.md — the computed-outstanding logic this story sums, do not reimplement]
- [Source: apps/api/src/inventory/purchases.service.ts (`countPendingPricing`) — the exact count-query shape this story's `countDraftPendingTerms` mirrors]
- [Source: apps/web/app/(app)/_components/owner-dashboard.tsx — the existing `cashTiedUp`/pending-pricing `GapFlag` this story extends; read the full file before editing, its null-propagation discipline is load-bearing]
- [Source: _bmad-output/planning-artifacts/epics/phase-6-insight-delivery/epic-12-dashboard-cross-site-rollup.md — Story 12.2's "every figure matches its source screen exactly and links through to it" precedent this story's drill-down (AC #2) follows]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
