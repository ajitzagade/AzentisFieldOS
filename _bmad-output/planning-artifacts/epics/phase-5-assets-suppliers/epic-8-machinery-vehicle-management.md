---
epic: 8
phase: "5 — Assets & Suppliers"
status: not-started
---

# Epic 8: Machinery & Vehicle Management

## Goal

Owner/Admin maintains Machinery and Vehicle registers, records movement between Sites/Maintenance, and logs fuel/maintenance/repair history — current location and full lifecycle are always visible.

## FRs Covered

- FR-15: Machinery register (name, type, asset number, model, ownership, operator, current Site); current Site updates on recorded movement.
- FR-16: Vehicle register (number, type, ownership, driver, current Site/usage); same visibility guarantee as FR-15.
- FR-17: Movement history between Sites (or to/from Maintenance) for Machinery/Vehicles; full history retained, not just latest state.
- FR-18: Fuel, maintenance, and repair logging per Machine/Vehicle, retrievable as a dated service history.
- FR-38: Machinery & Vehicle summary (available/in-use counts, per-Site allocation, maintenance flags); every dashboard tile supports drill-down.

## Implementation Notes

No GPS tracking — "current Site" is a manually recorded location, not a live map. Don't imply real-time tracking anywhere in the UI. NFR-4 requires Machinery/Vehicle type categories to be admin-configurable data (seeded defaults, not a hardcoded enum) — Epic 14 adds the admin UI later; it doesn't gate this epic.

## Composition Reference

`ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/11-machinery-vehicles.html`.
