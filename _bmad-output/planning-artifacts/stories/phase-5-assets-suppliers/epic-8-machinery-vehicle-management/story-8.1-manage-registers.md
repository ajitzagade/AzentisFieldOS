---
epic: 8
story: "8.1"
phase: "5 — Assets & Suppliers"
title: Manage Machinery & Vehicle Registers
---

# Story 8.1: Manage Machinery & Vehicle Registers

As Owner/Admin,
I want to register Machinery (name, type, asset number, model, ownership, operator) and Vehicles (number, type, ownership, driver),
So that I have one accurate list of every asset the business uses.

## Acceptance Criteria

**Given** I register a Machine or Vehicle
**When** I save
**Then** it's immediately available in movement, fuel/maintenance log, and reporting pickers (FR-15, FR-16)
**And** Machinery/Vehicle type categories are admin-configurable data, not a hardcoded enum (NFR-4) — Epic 14 later adds the admin UI to manage them

## References

- FR-15, FR-16, NFR-4
- `ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/11-machinery-vehicles.html`
