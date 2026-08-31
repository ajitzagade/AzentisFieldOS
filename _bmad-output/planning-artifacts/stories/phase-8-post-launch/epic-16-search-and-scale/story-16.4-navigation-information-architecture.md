---
epic: 16
story: "16.4"
phase: "8 — Post-launch Enhancements"
title: Navigation & Information Architecture Regroup
---

# Story 16.4: Navigation & Information Architecture Regroup

As any signed-in user,
I want the sidebar grouped by what I'm trying to do (Stock, People, Money) instead of by raw entity name, with Search visible at the top,
So that I can find the right screen without already knowing which of 14 flat items it happens to be filed under.

## Acceptance Criteria

**Given** the current sidebar (14 entity-shaped items across 4 groups plus 3 ungrouped, with Vendors/RMC/Expenses under "Assets" and a single-item "Insights" group)
**When** this story ships
**Then** the groups become: Dashboard · Sites · Daily Activity (unchanged, ungrouped) — **Stock**: Inventory, Movements, Materials — **People**: Team & Labour, Payments — **Money**: Vendors, Expenses, RMC — **Machinery & Vehicles** — **Reports** — **Settings** (Owner/Admin only, unchanged)

**Given** this is a relabel/regroup only
**When** the change ships
**Then** no page routes, components, or permissions change — every existing link still points at the exact same page it does today

**Given** a Site Supervisor's sidebar (a subset of the same shell)
**When** this story ships
**Then** the same grouping applies to whichever items they see today — this story does not change what a Supervisor can or cannot access

**Given** Story 16.2's global search control
**When** the sidebar renders
**Then** search is visible near the top of the shell, above the grouped nav items

## References

- `apps/web/app/(app)/_components/nav-config.ts` — the grouping/labels live here; this is a data change to that config, not new components
- `apps/web/app/(app)/_components/app-shell.tsx` — renders `nav-config.ts`'s groups as-is; also where Story 16.2's search control mounts
- `_bmad-output/reviews/product-ux-review-2026-08-29.md` Appendix A (proposed IA — "change grouping/labels only, no page rewrites")
