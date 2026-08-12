---
epic: 2
phase: "2 — Field Operations Core"
status: partially-started
---

# Epic 2: Site Management

## Goal

Owner/Admin creates and maintains Sites and sees each Site's full chronological activity feed; the contractor-wide rollup lists every Site automatically as they're added.

## FRs Covered

- FR-1: Owner/Admin creates and maintains Sites (name, location, status, contract reference); new Site appears immediately in Site list and dashboard.
- FR-2: Individual Site view shows every DSR, stock movement, Work Record, expense, RMC entry, and photo tagged to that Site, chronologically.
- FR-3: Consolidated contractor-wide rollup across all active Sites; a new Site is included automatically.

## Related Architecture Requirements

- AD-3: `apps/web` never imports a DB client — all writes go through `apps/api` over HTTP.
- AD-6: Full state-set coverage (loading/empty/success/error/validation-failure) for the Sites list and detail screens.
- AD-7: Site create/edit validation via a shared Zod schema in `packages/shared`.

## Related UX Design Requirements

UX-DR13 (Sites list + Site detail as routed surfaces), UX-DR5 (Data Table for the Sites list, linked-row mode).

## Implementation Notes (checked against working tree, 2026-08-12)

`apps/api/src/sites/` already has a module/controller/service with `create` and `list` endpoints, Zod-validated against `packages/shared/src/schemas/site.ts` (AD-7 pattern already correctly followed). No `update`/status-change endpoint, no single-Site detail endpoint, no frontend at all yet.

Still needed: Site status transitions (active/completed/on-hold, timestamped per the glossary), a Site detail endpoint aggregating DSR/Movement/Work Record/Expense/RMC/photo records chronologically, and the full frontend (list + detail) per the mockups.

## Composition Reference

`ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/02-sites.html`, `mockups/03-site-detail.html`. Note the mockup's "Activity Pulse" — a 14-day DSR-volume visual, explicitly NOT a percent-complete bar (there is no BOQ in this product).
