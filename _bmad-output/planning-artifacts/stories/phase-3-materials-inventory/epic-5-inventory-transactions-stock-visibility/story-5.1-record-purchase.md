---
epic: 5
story: "5.1"
phase: "3 — Materials & Inventory"
title: Record a Purchase
---

# Story 5.1: Record a Purchase

As Owner/Admin,
I want to record a Purchase (Vendor, Material, Size, quantity, Unit, rate, total, invoice/challan, payment status, delivery location, vehicle, notes, destination Godown-or-Site, optional documents),
So that stock and spend are tracked from the moment material enters the business.

## Acceptance Criteria

**Given** I record a Purchase with Godown as the destination
**When** I submit
**Then** Godown Stock for that Material/Size increases by the purchased quantity immediately

**Given** I record a Purchase with a Site as the destination
**When** I submit
**Then** that Site's Stock increases directly, bypassing Godown Stock entirely (FR-8)
**And** the row's "Correct" action opens a new reason-carrying entry linked to the original — never Edit/Delete (AD-9)

## References

- FR-8, AD-9
- `ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/07-movements.html`
