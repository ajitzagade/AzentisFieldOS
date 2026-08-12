---
epic: 10
phase: "5 — Assets & Suppliers"
status: not-started
---

# Epic 10: RMC (Ready-Mix Concrete)

## Goal

Owner/Admin records RMC deliveries per Site and Vendor, with daily/Site-wise/Vendor-wise reporting reconciling exactly to individual entries.

## FRs Covered

- FR-26: Record RMC delivery (Vendor, date, quantity m³, grade/type, rate, total, invoice/challan), queryable by day/Site/Vendor.
- FR-27: Daily, Site-wise, and Vendor-wise RMC consumption/cost reporting, reconciling exactly to individual entries.

## Implementation Notes

RMC is its own entity, separate from the Material Catalog (Epic 4) and Inventory Transactions (Epic 5) — don't merge it into the Materials data model even though it's conceptually "a material."

## Composition Reference

`ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/14-rmc.html`.
