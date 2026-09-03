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
- 16.5 Global search — role-gated results & query robustness
- 16.6 Global search — full entity coverage

## Related Architecture Requirements

- AD-5 extended: one new shared pagination/filter-bar/sortable-header companion to `packages/ui`'s `DataTable` (which today has no pagination concept at all) — every list adopts the same implementation, never a per-page pager.
- AD-7 extended: paginated list query params (`page`, `pageSize`, `q`, `sort`, filter fields) are defined once per list as a shared Zod schema, imported by both apps.
- AD-3 unaffected: apps/web still never queries a database directly; pagination/search/filter are new query params on existing (or new) `apps/api` endpoints.
- Backward compatibility constraint (carried over from the product review): every changed list endpoint must default to today's existing full-list behavior when no new query params are passed — no existing caller (including any not touched by this epic) may break.
- New endpoints needed: a cross-site stock-by-material lookup (avoids the N+1-per-site pattern already flagged as a problem in Inventory) and a global search endpoint (`GET /search?q=`) — neither existed before this epic.

## Implementation Notes

Full prioritization rationale, current-state scoring, and the broader not-yet-built roadmap (alert engine, vendor payments ledger, labour costing) live in `_bmad-output/reviews/product-ux-review-2026-08-29.md` — this epic implements that review's P1-6, P2-2, and Appendix A items specifically.

### Follow-up: search audit (2026-09-03)

Stories 16.2 and 19.2 shipped Global Search + the Action Palette, but a full-application audit (2026-09-03) found it covers only 9 of the app's ~20 core entity types (missing: Movement, Consumption, WasteDisposal, Advance, AdvanceAdjustment, Machinery, Vehicles, Site Contract, Subcontractor Work Entry, Subcontractor Payment, Work Record/Attendance, DSR, Audit Log) and has no server-side role gate on `SearchController`. Verifying against the actual controllers narrowed the role-gating concern to just two entities (Subcontractor Payment, Audit Log) that are genuinely read-restricted today — Payment/Advance/AdvanceAdjustment/Expense are deliberately read-open to any authenticated user (only their write actions are owner-gated) and must not be newly restricted in search. None of this is a matching-logic bug — ranking, case-insensitivity, and per-category error isolation are all already correct.

Stories 16.5 and 16.6 close these gaps: 16.5 is the role-gating + query-robustness fix (gate Subcontractor Payment/Audit Log, add a min-query-length guard, close three test-coverage gaps), 16.6 is the entity-coverage expansion (the missing modules above, plus extending `SEARCH_ACTIONS` and unifying Recently Viewed's routing table with search's own). Neither introduces a second search system or new site-level access-control concept — see each story's References for what's explicitly out of scope.

**Indexing note:** the searched-column indexing gap identified in the 2026-09-03 audit was independently closed by commit `14bc517` (an unrelated ad-hoc performance-audit effort, not tracked through this epic) using `pg_trgm` GIN trigram indexes — the technically correct choice for leading-wildcard `contains` queries, which a plain B-tree index (this epic's original assumption) cannot serve at all. No further indexing work is needed in 16.5.
