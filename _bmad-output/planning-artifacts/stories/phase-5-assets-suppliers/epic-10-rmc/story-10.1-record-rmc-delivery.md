---
epic: 10
story: "10.1"
phase: "5 — Assets & Suppliers"
title: Record RMC Delivery
---

# Story 10.1: Record RMC Delivery

As Owner/Admin,
I want to record an RMC delivery (Vendor, date, quantity m³, grade/type, rate/m³, total, invoice/challan),
So that concrete usage is tracked as its own category, separate from general Material inventory.

## Acceptance Criteria

**Given** an RMC delivery to a Site
**When** I record it
**Then** it's stored as its own entity, not merged into the Material Catalog or Inventory Transactions data model (FR-26)
**And** it's queryable by day, Site, or Vendor
**And** the row's "Correct" action is available, never Edit/Delete

## References

- FR-26
- `ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/14-rmc.html`
