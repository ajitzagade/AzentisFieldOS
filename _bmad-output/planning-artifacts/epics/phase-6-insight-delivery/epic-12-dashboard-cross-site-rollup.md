---
epic: 12
phase: "6 — Insight & Delivery"
status: not-started
---

# Epic 12: Dashboard & Cross-Site Rollup

## Goal

Owner/Admin opens the Dashboard and immediately sees the full story — Today's Activity, Overall status, and an explicit gap-flag for any Site that hasn't reported yet today — with every tile drilling down into the real screen behind it.

## FRs Covered

- FR-34: Projects summary (total/active/completed Sites, per-Site DSR-activity-based progress); empty state for a zero-Site Tenant.
- FR-35: Today's activity summary across all Sites; flags any Site with no DSR yet today.

## Related UX Design Requirements

UX-DR4 (Stat Tile), UX-DR10 (Gap Flag — the missing-DSR indicator is this component's canonical use case), UX-DR14 (full state-set coverage, especially the zero-Site empty state).

## Implementation Notes

**Sequenced last among feature epics deliberately** — its promised value (real drill-downs into Sites, Inventory, Team, Machinery/Vehicles; a real gap-flag) depends on Epics 2, 3, 5, 6, 8 already existing. Building it earlier would mean shipping a dashboard that's mostly empty states, which technically satisfies AD-6 but delivers little real value until the rest of the product exists. If the team wants an earlier dashboard skeleton for stakeholder visibility, that's a valid call — flag it explicitly rather than silently reordering.

## Composition Reference

`ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/01-dashboard.html`.
