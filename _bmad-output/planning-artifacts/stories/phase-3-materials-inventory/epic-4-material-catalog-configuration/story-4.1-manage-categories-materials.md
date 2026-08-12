---
epic: 4
story: "4.1"
phase: "3 — Materials & Inventory"
title: Manage Material Categories & Materials
---

# Story 4.1: Manage Material Categories & Materials

As Owner/Admin,
I want to add, edit, and disable Material Categories and Materials,
So that my catalog reflects what I actually stock, without losing history when something is discontinued.

## Acceptance Criteria

**Given** I create a Category and add Materials to it
**When** I save
**Then** the Category and Materials are immediately available in every Material picker across the product

**Given** a Material I disable
**When** I view existing Purchases/Movements/Consumption that reference it
**Then** that history is untouched and still displays correctly — disabling only hides it from new-entry pickers (FR-4)

## References

- `ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/06-materials.html`
