---
epic: 16
story: "16.2"
phase: "8 — Post-launch Enhancements"
title: Global Search
---

# Story 16.2: Global Search

As any signed-in user,
I want one search entry point in the app shell that finds a Site or a Material by typing,
So that I never have to remember which of hundreds of Sites I'm looking for, or manually scroll a list to find it.

## Acceptance Criteria

**Given** I open the global search (a visible control in the app shell, plus a keyboard shortcut)
**When** I type a query
**Then** matching Sites (by name, location, or contract reference) and active Materials (by name) appear grouped by type, updated as I type (debounced), ranked with best matches first

**Given** I select a Site result
**When** I confirm the selection
**Then** I land directly on that Site's detail page

**Given** I select a Material result
**When** I confirm the selection
**Then** I land on the cross-site availability view for that Material (Story 16.3)

**Given** more results exist than fit inline
**When** I reach the end of the inline list
**Then** a "See all N results" action opens the corresponding filtered list from Story 16.1's platform — search does not duplicate list pagination logic

**Given** a tenant has 1,000+ Sites
**When** I search
**Then** matching happens via a server-side query against the database, never a client-side filter over a fully fetched list, and responds fast enough to feel instant while typing

**Given** the search box is empty
**When** it's focused
**Then** it shows nothing (or, optionally, recently visited Sites) — never an error or a loading spinner with nothing to load

**Given** I am a Site Supervisor
**When** I use global search
**Then** results are the same shape as for Owner/Admin — this story does not add new role-based data restrictions beyond what each result's own detail page already enforces

## References

- New endpoint needed: `GET /search?q=` (apps/api) — no search endpoint exists anywhere in the API today
- Mount point: `apps/web/app/(app)/_components/app-shell.tsx` — the same shell that already hosts the sidebar's install/download action; add the search control alongside it, not as a separate ad-hoc component
- Depends on Story 16.1 for the "see all results" destination (a filtered, paginated list) and Story 16.3 for the Material result's landing page
- `_bmad-output/reviews/product-ux-review-2026-08-29.md` §4 item 7, §7 (P2-2)
