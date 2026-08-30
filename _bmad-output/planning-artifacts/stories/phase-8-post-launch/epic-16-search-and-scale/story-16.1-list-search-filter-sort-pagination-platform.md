---
epic: 16
story: "16.1"
phase: "8 — Post-launch Enhancements"
title: List Search, Filter, Sort & Pagination Platform
---

# Story 16.1: List Search, Filter, Sort & Pagination Platform

As Owner/Admin,
I want every list page (Sites, Movements, Purchases, Consumption, Return/Wastage, Expenses, Team Members, Payments, Vendors, Machinery, Vehicles, RMC) to load one page at a time with search, filters, and sortable columns,
So that the system stays fast and easy to scan at hundreds or thousands of records instead of degrading into one unscannable unbounded table.

## Acceptance Criteria

**Given** a list with more records than the default page size
**When** I open it
**Then** only the first page loads from the server, with Previous/Next controls and a "showing X–Y of Z" indicator — never the whole table fetched up front

**Given** I type in a list's search box
**When** I pause typing (debounced)
**Then** results are filtered server-side against that list's defined searchable fields, and the page resets to 1

**Given** a list has a meaningful filter dimension for it (Status, Site, Category, Vendor, date range, etc. — per list)
**When** I choose a filter value
**Then** results are narrowed server-side, combinable with search and each other

**Given** I click a sortable column header
**When** the request re-runs
**Then** results are re-sorted server-side ascending/descending, with a visible sort indicator on the active column

**Given** a list has zero records at all vs. zero records matching the current search/filters
**When** either happens
**Then** two distinct empty states show ("nothing recorded yet" with the existing create-first-entry prompt vs. "no results match your filters" with a "Clear filters" action) — the shared `DataTable` empty state, not a bespoke one per page (AD-6)

**Given** a request is loading or fails
**When** the state changes
**Then** `DataTable`'s existing loading/error states render unchanged — this story does not introduce a second state machine

**Given** no new query params are passed to a changed endpoint
**When** it's called (by this app or any other future caller)
**Then** behavior matches today's existing unbounded full-list response exactly — every change here is additive, never a breaking default

**Given** a list page is loaded with `?q=&page=&sort=&<filter>=` in the URL
**When** the page is reloaded or the URL is shared
**Then** the same search/filter/sort/page state is reproduced — the URL is the source of truth, not component-local state

## References

- `packages/ui/src/components/data-table.tsx` — has no pagination/sort-header/filter-bar concept today; add companion pieces here once, shared by every list (AD-5), not rebuilt per page
- `apps/api/src/sites/sites.service.ts` (`list()`) / `sites.controller.ts` — currently a plain unbounded `findMany`, no `take`/`skip`/search/sort; good first reference implementation for the paginated Prisma pattern (`findMany({ where, orderBy, skip, take })` + a matching `count()`)
- `apps/web/app/(app)/movements/page.tsx` — merges four unbounded histories (Purchases, Movements, Consumption, Return/Wastage) into one table; the most degraded list in the product per the 2026-08-29 product review, prioritize it early
- Every other list under `apps/web/app/(app)/{sites,movements,team,payments,vendors,machinery-vehicles,expenses,rmc}/page.tsx`
- `_bmad-output/reviews/product-ux-review-2026-08-29.md` §7 (P1-6), §9.3
