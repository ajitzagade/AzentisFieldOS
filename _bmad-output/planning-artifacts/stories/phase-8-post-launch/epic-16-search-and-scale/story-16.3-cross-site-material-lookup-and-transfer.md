---
epic: 16
story: "16.3"
phase: "8 — Post-launch Enhancements"
title: Cross-Site Material Availability & Guided Transfer
---

# Story 16.3: Cross-Site Material Availability & Guided Transfer

As Owner/Admin,
I want to search for a Material, see how much of it exists at every Site and the Godown, and move some of it from one location to another in one guided flow,
So that I don't have to already know which Site has stock, or leave the search to go hunt for the right Movement form.

## Acceptance Criteria

**Given** I search a Material (from global search, Story 16.2, or a dedicated Material-availability page)
**When** results load
**Then** I see one table listing the Godown and every Site holding a balance of that Material's Sizes, with quantity and Unit, sorted by quantity descending — sourced from one aggregate query, never an N+1 fetch per Site

**Given** I pick a source location with available stock
**When** I choose "Transfer from here"
**Then** I land in the existing Movement form (`MovementForm`) with the Material/Size and source pre-filled — this reuses the existing form and create path exactly, it does not introduce a second transfer mechanism

**Given** the source I picked is a Site
**When** the form opens
**Then** it's the existing `SITE_TO_SITE` kind; **given** the source is the Godown, **then** it's the existing `GODOWN_TO_SITE` kind — matching how `vendor-to-site`/`site-to-site` already reuse this same form today, no new Movement kind is added

**Given** I choose a destination Site and enter a quantity
**When** the quantity exceeds the source's available stock
**Then** the existing stock-floor warning and server-side floor check apply exactly as they do today for a manually-opened Movement form — no new validation logic is built for this entry point

**Given** I confirm the transfer
**When** it submits
**Then** a normal Movement row is created through the existing `POST /movements` path — this flow is a new front-door onto existing data, not a new table or transaction type

**Given** the Material has zero stock anywhere
**When** I view its availability
**Then** an honest empty state shows ("Not currently in stock at any location") rather than an empty table with no explanation

## References

- New endpoint needed: an aggregate stock-by-material lookup across all Sites + Godown in one query (e.g. `GET /stock/material/:materialId`) — today's stock lookups are per-location (`apps/web/lib/use-site-stock.ts`'s `useStock({kind: 'site'|'godown'})`), and the 2026-08-29 product review specifically flags the existing per-Site stock fetch as an N+1 pattern to not repeat here
- Reuse, do not rebuild: `apps/web/app/(app)/movements/godown-to-site/movement-form.tsx` (already parameterized by `kind`), its `?materialId=`/`?siteId=` pre-fill pattern (already used by the Inventory page's low-stock Transfer CTA and Site detail's quick actions)
- `_bmad-output/reviews/product-ux-review-2026-08-29.md` §4 item 7, §5.5, Appendix B ("Inventory" workflow map — this story adds the missing reconciliation/lookup entry point to an otherwise-complete chain)
