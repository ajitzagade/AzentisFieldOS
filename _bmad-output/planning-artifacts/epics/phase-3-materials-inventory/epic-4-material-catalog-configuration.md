---
epic: 4
phase: "3 — Materials & Inventory"
status: not-started
---

# Epic 4: Material Catalog Configuration

## Goal

Owner/Admin defines Material Categories, Materials, Sizes/Specifications, Units, and Custom Fields — every later inventory transaction draws from this catalog instead of free text.

## FRs Covered

- FR-4: Owner/Admin adds/edits/disables Material Categories and Materials; disabling hides from new entries, preserves history.
- FR-5: Owner/Admin defines Sizes/Specifications per Material, addable anytime without disturbing existing Stock records.
- FR-6: Owner/Admin defines Units of Measure; a Material's Unit is enforced consistently across all transaction types.
- FR-7: Owner/Admin adds Custom Fields to a Material definition, via a `customFields` JSONB column (no per-tenant schema migration).

## Related NFRs

- NFR-4: Every material type, size, unit must be admin-configurable; none may be hardcoded.

## Related UX Design Requirements

UX-DR13 (Materials as a routed surface, grouped under the Materials nav section). Note: this screen uses a normal Edit affordance (not the Correct pattern) — catalog config is master data, not transaction history.

## Implementation Notes

Build before Epic 5 (Inventory Transactions) — every Purchase/Movement/Consumption form depends on this catalog existing with real dropdown data, not placeholders.

## Composition Reference

`ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/06-materials.html`.
