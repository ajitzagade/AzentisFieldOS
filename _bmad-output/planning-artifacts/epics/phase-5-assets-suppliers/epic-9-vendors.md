---
epic: 9
phase: "5 — Assets & Suppliers"
status: not-started
---

# Epic 9: Vendors

## Goal

Owner/Admin maintains Vendor records and sees each Vendor's full Purchase history and payment status in one place.

## FRs Covered

- FR-39: Vendor records (name, contact, phone, email, address, materials/services supplied).
- FR-40: Per-Vendor Purchase→Material→Quantity→Amount history and payment status.

## Implementation Notes

Vendor master data (name/contact/address) uses a normal Edit affordance — it's config data, not transaction history. The Purchase history shown on the Vendor detail page reads from Epic 5's Purchase records (FR-8); this epic doesn't duplicate that data, it surfaces it filtered by Vendor.

## Composition Reference

`ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/12-vendors.html`, `mockups/13-vendor-detail.html`.
