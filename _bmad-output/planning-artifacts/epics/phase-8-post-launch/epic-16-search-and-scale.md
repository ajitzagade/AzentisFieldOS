---
epic: 16
phase: "8 — Post-launch Enhancements"
status: backlog
---

# Epic 16: Search, Filtering & Scale

## Goal

Make the product usable at 1,000+ Sites and years of transaction history instead of degrading linearly with success. Today every list page (`Sites`, `Movements`, `Purchases`, `Expenses`, `Team`, `Payments`, `Vendors`, `Machinery`/`Vehicles`, `RMC`) is an unbounded full-table fetch with no search, filter, sort, or pagination, and there is no way to find a Site or a Material without already knowing where to look. This epic adds one shared, reusable pagination/search/filter platform across every list, one global search entry point, and a guided cross-site "find material → transfer it" flow — without rebuilding any existing data model or transaction path.

This work was scoped directly from `_bmad-output/reviews/product-ux-review-2026-08-29.md` (P1-6 List search/filter/sort/pagination, P2-2 Global search, Appendix A navigation/IA) — that review's own "Safe-First Execution Order" explicitly deferred this exact work out of the Tier-1/Tier-3 safe batches already shipped (Epic 15, story 15.2) because it needs its own careful, isolated change, not a drive-by fix.

## Stories

- 16.1 List search, filter, sort & pagination platform
- 16.2 Global search
- 16.3 Cross-site Material availability & guided transfer
- 16.4 Navigation & information architecture regroup

## Related Architecture Requirements

- AD-5 extended: one new shared pagination/filter-bar/sortable-header companion to `packages/ui`'s `DataTable` (which today has no pagination concept at all) — every list adopts the same implementation, never a per-page pager.
- AD-7 extended: paginated list query params (`page`, `pageSize`, `q`, `sort`, filter fields) are defined once per list as a shared Zod schema, imported by both apps.
- AD-3 unaffected: apps/web still never queries a database directly; pagination/search/filter are new query params on existing (or new) `apps/api` endpoints.
- Backward compatibility constraint (carried over from the product review): every changed list endpoint must default to today's existing full-list behavior when no new query params are passed — no existing caller (including any not touched by this epic) may break.
- New endpoints needed: a cross-site stock-by-material lookup (avoids the N+1-per-site pattern already flagged as a problem in Inventory) and a global search endpoint (`GET /search?q=`) — neither existed before this epic.

## Implementation Notes

Full prioritization rationale, current-state scoring, and the broader not-yet-built roadmap (alert engine, vendor payments ledger, labour costing) live in `_bmad-output/reviews/product-ux-review-2026-08-29.md` — this epic implements that review's P1-6, P2-2, and Appendix A items specifically.
