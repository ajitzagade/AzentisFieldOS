# Epic 16 Context: Search, Filtering & Scale

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Make the product usable at 1,000+ Sites and years of transaction history instead of degrading linearly with success. Every list page today is an unbounded full-table fetch with no search, filter, sort, or pagination, and there is no way to find a Site or Material without already knowing where to look. This epic adds one shared, reusable pagination/search/filter platform across every list, one global search entry point, and a guided cross-site "find material → transfer it" flow, without rebuilding any existing data model or transaction path. It was scoped directly from a product/UX review's "Safe-First Execution Order," which deliberately deferred this work out of earlier safe batches because it needs its own isolated change.

Stories 16.5 and 16.6 are a later addition: a 2026-09-03 audit of the shipped Global Search (stories 16.2/19.2) found it covers only 9 of ~20 core entity types and (at the time) had no DB index backing any searched column. It also found `SearchController` has no server-side role gate at all — but verifying against the actual controllers showed most "financial" entities (Payment, Advance, AdvanceAdjustment, Expense) are deliberately read-open to every authenticated user today (only their write endpoints are owner-gated; e.g. `advances.controller.ts` has an explicit comment that reads stay open "e.g. a Supervisor viewing a Team Member's outstanding balance"). Only Subcontractor Payment (class-level `@Roles('OWNER_ADMIN')`) and Audit Log (`@Roles('OWNER_ADMIN')` on `@Get()`) are genuinely read-restricted today — those two are the only entities search must actually gate. 16.5 builds the role-gating mechanism plus a query-robustness fix; 16.6 closes the coverage gap and is the first story to actually apply the gate (to Subcontractor Payment and Audit Log, both new in 16.6). Neither story is a matching-logic fix — ranking, case-insensitivity, and per-category error isolation in the existing implementation are already correct.

**The indexing gap closed independently.** Commit `14bc517` (an unrelated ad-hoc performance-audit effort, landed 2026-09-03, not tracked through this epic) added `pg_trgm` GIN trigram indexes on every searched column across all 9 current entities — a technically necessary choice, since a leading-wildcard `contains`/`ILIKE '%q%'` query (what every `searchCandidates()` runs) cannot use a B-tree index at all. 16.5 no longer includes any indexing work.

## Stories

- Story 16.1: List search, filter, sort & pagination platform
- Story 16.2: Global search
- Story 16.3: Cross-site Material availability & guided transfer
- Story 16.4: Navigation & information architecture regroup
- Story 16.5: Global search — role-gated results & query robustness
- Story 16.6: Global search — full entity coverage

## Requirements & Constraints

- Backward compatibility is non-negotiable: every changed list endpoint must default to today's existing full-list response when no new query params are passed — no existing caller may break.
- RBAC is flat: only `OWNER_ADMIN` and `SITE_SUPERVISOR` exist, and there is no site-level access control concept anywhere in the app (no per-Site assignment model). Search role-gating means group-level filtering by these two roles only — never invent site-scoping as part of this epic.
- Search results must respect the same role boundary as the rest of the app — no more, no less. Only entities whose own list/detail endpoint is actually role-restricted today (Subcontractor Payment, Audit Log) must be filtered server-side in the search composition layer for a Supervisor. Payment, Advance, AdvanceAdjustment, and Expense are deliberately read-open to any authenticated user at the endpoint level (only their write actions are owner-gated) — do not gate these in search; doing so would impose a stricter restriction than the rest of the app already enforces.
- A minimum query length (2 characters after trimming) must gate whether a search request is issued at all.
- Matching is plain-text, case-insensitive substring matching only. Fuzzy/typo-tolerant matching beyond this is explicitly out of scope. Indexing is already handled (see Goal note) — `pg_trgm` GIN trigram indexes back every searched column today; do not add or change indexes as part of 16.5/16.6 unless a genuinely new, currently-uncovered column is introduced.
- Config-tier master data (Material Categories, Units, Employment Types, Machinery/Vehicle Types, Expense Categories) is explicitly out of scope for search coverage — reachable via parent-entity "manage" screens today.
- Infinite scroll is banned everywhere in this product; pagination is the only sanctioned pattern for long lists.
- Aggregate/lookup queries (e.g. cross-site stock-by-material) must be a single query, never an N+1-per-site fetch — this exact anti-pattern was already flagged as a problem in Inventory and must not be repeated.
- A Material's cross-site availability view must show an honest "not currently in stock anywhere" empty state rather than a bare empty table.
- List pages must distinguish two empty states — "nothing recorded yet" vs. "no results match your filters" — via the shared DataTable empty state, not a bespoke per-page one.

## Technical Decisions

- AD-5 extended: pagination/filter-bar/sortable-header become new shared companion components to `packages/ui`'s `DataTable` (which has no pagination concept today) — one implementation, adopted by every list, never rebuilt per page.
- AD-7 extended: paginated list query params (`page`, `pageSize`, `q`, `sort`, filter fields) are defined once per list as a shared Zod schema, imported by both apps — same one-validator convention as every other form.
- AD-3 unaffected: `apps/web` still never queries a database directly; pagination/search/filter are new query params on existing (or new) `apps/api` endpoints only.
- The paginated-list server pattern is Prisma `findMany({ where, orderBy, skip, take })` paired with a matching `count()`.
- Two new endpoints are introduced that don't exist anywhere today: a global search endpoint (`GET /search?q=`) and a cross-site aggregate stock-by-material lookup (e.g. `GET /stock/material/:materialId`).
- The guided Material-transfer flow reuses the existing parameterized Movement form and its `?materialId=`/`?siteId=` pre-fill pattern exactly — no new Movement kind, no new transaction table, no new validation logic; it is a new front door onto the existing `POST /movements` path and existing stock-floor checks.
- The URL is the source of truth for a list's search/filter/sort/page state (not component-local state), so a reloaded or shared URL reproduces the same view.
- Search role-gating (16.5) is enforced in the search composition/service layer and the entity registry, not the controller layer alone and not client-side.
- Recently Viewed's per-type routing table and Global Search's per-group `handleSelect` routing are unified onto one shared `entityHref(type, id)` helper (16.6) — removes the risk of a route rename updating one table and not the other.
- The curated Search "Actions" list (`SEARCH_ACTIONS`) is a single shared list consumed by both the Search palette and the Owner Quick Bar — never duplicated into a second list, and gains one natural create/record action per newly-covered module in 16.6.

## UX & Interaction Patterns

- Global Search is a Search/Action palette (`⌘K` desktop, a tap target in the Owner mobile quick-bar), rendering results grouped by uppercase entity-type labels with a "See all N results" action that opens the corresponding filtered, paginated list from 16.1 — search must never duplicate list pagination logic.
- A curated Actions group (one entry per primary flow, e.g. Record Payment, Add Vendor) always renders above entity groups when a query matches both; entity rows use a tinted icon tile, action rows a solid-color tile with a white icon — visually distinct "opens a record" vs. "does something," without introducing a new color.
- Selecting an action that needs a target (e.g. Record Payment) opens its quick-entry modal rather than navigating away; selecting an entity result opens that record directly.
- An empty/unfocused search box shows nothing or recently-visited items — never an error or a spinner with nothing to load.
- The target sidebar grouping (already live in code, ahead of the original mockups) is: Dashboard · Sites · Daily Activity (ungrouped) — Stock (Inventory, Movements, Materials, Waste & Disposal) — People (Team & Labour, Payments) — Money (Vendors, Expenses, RMC) — Machinery & Vehicles — Reports — Settings (Owner/Admin only, includes Audit Log). Story 16.4 is a relabel/regroup of `nav-config.ts` only — no route, component, or permission changes. Search is placed near the top of the shell, above the grouped nav items.
- Every list page needs: a "showing X–Y of Z" indicator with Previous/Next controls, a visible sort indicator on the active sorted column, and combinable search + filters that reset the page to 1 on change.
- This audience is click/tap-first, not keyboard-first; the palette's `⌘K` shortcut is an optional accelerator only — every flow it reaches must also be reachable via ordinary navigation.

## Cross-Story Dependencies

- 16.2 (Global Search) depends on 16.1 for its "see all results" destination (a filtered, paginated list) and on 16.3 for a Material result's landing page (cross-site availability view).
- 16.4 (Navigation regroup) mounts 16.2's search control in the app shell; it does not depend on 16.2's data behavior, only its presence as a component.
- 16.6 (full entity coverage) depends on 16.5's role-gating mechanism specifically for its two owner-only new groups, Subcontractor Payment and Audit Log — every other new group in 16.6 (Movement, Consumption, WasteDisposal, Advance, AdvanceAdjustment, Machinery, Vehicles, Site Contract, Subcontractor Work Entry, Work Record, DSR) is read-open to any authenticated user today and must stay that way in search. 16.6 does not introduce a second access-control concept.
- 16.6's `SEARCH_ACTIONS` and Recently Viewed routing work touches the same surfaces Epic 19's Action Palette / recently-viewed-shortcuts stories (19.2, 19.6) shipped — extend the existing shared list/helpers, don't fork a parallel one.
- 16.3's new stock-by-material endpoint and transfer entry point sit downstream of the existing Inventory low-stock Transfer CTA and Site detail quick actions, which already use the same `MovementForm` pre-fill pattern this story reuses.
