---
epic: 11
phase: "5 — Assets & Suppliers"
status: not-started
---

# Epic 11: Expenses

## Goal

Owner/Admin and Site Supervisor record Expenses against admin-configurable categories, tagged to a Site, immutable once logged.

## FRs Covered

- FR-41: Record an Expense (date, Site, category, amount, description, payment method, person/vendor, optional document); categories admin-configurable.

## Related NFRs

- NFR-4: Expense categories must be admin-configurable, never hardcoded (category config itself lives in Epic 14, this epic consumes it).

## Implementation Notes

NFR-4 requires Expense categories to be admin-configurable data, not a hardcoded enum — model the Category as a data table with seeded defaults (material, labour, machinery/vehicle, fuel, repairs, transportation, site expenses, RMC, misc) from day one, so this epic doesn't block on Epic 14. Epic 14 later adds the admin UI to manage those categories; it doesn't gate this epic's core transactional value.

## Composition Reference

`ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/15-expenses.html`.
