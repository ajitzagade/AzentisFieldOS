---
epic: 11
story: "11.1"
phase: "5 — Assets & Suppliers"
title: Record an Expense
---

# Story 11.1: Record an Expense

As Owner/Admin or Site Supervisor,
I want to record an Expense (date, Site, category, amount, description, payment method, person/vendor, optional document),
So that every Site cost is captured as it happens, categorized consistently.

## Acceptance Criteria

**Given** an Expense category list seeded with defaults (material, labour, machinery/vehicle, fuel, repairs, transportation, site expenses, RMC, misc) — modeled as admin-configurable data, not a hardcoded enum (NFR-4)
**When** I record an Expense against a Site and category
**Then** it's saved as permanent history, tagged to that Site, immediately reflected in Site and Financial reporting (FR-41)
**And** the row's "Correct" action is available, never Edit/Delete

## References

- FR-41, NFR-4
- `ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/15-expenses.html`
