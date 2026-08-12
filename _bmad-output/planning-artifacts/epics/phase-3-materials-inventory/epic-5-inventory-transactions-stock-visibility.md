---
epic: 5
phase: "3 — Materials & Inventory"
status: not-started
---

# Epic 5: Inventory Transactions & Stock Visibility

## Goal

Owner/Admin and Site Supervisor record Purchases, Godown↔Site and Site↔Site Movements, Consumption, and Wastage/Return; Godown and Site-wise stock levels are always correct and derived from history, with low-stock flagged automatically and every correction handled via the append-only Correct pattern.

## FRs Covered

- FR-8: Record a Purchase (Vendor, Material, Size, quantity, Unit, rate, total, invoice/challan, payment status, delivery location, vehicle, notes, destination Godown-or-Site, optional documents).
- FR-9: Godown→Site movement (Material/Size/quantity, vehicle, person responsible, received quantity); captures shortage/damage gap.
- FR-10: Direct Vendor→Site purchase bypassing Godown, same field set as FR-8 plus receiver; never touches Godown Stock.
- FR-11: Site→Site transfer with the same field discipline as FR-9.
- FR-12: Record Consumption at a Site against an activity reference; reduces Site Stock.
- FR-13: Record Return/Wastage as a distinct transaction type from Consumption.
- FR-14: Full lifecycle visibility per Material/Size/Site/Godown, derived from transaction history, always reconciling exactly.
- FR-36: Inventory summary (Godown/Site stock, low-stock materials against a per-Material-per-Tenant threshold, recent purchases/transfers/consumption).
- FR-54 (as it applies to inventory): Purchase/Movement/Consumption/Wastage rows are append-only; a correction is a new, reason-carrying row.

## Related Architecture Requirements

- AD-9: Append-only ledger with a DB-level enforcement backstop — no `UPDATE`/`DELETE` grant on these tables for the API's DB role.

## Related UX Design Requirements

UX-DR5 (Data Table, zebra + hover, linked-row mode), UX-DR7 (the Correct action — mandatory on every row here, never Edit/Delete), UX-DR10 (Gap Flag for low-stock, always with a direct "Transfer Stock" action).

## Implementation Notes

Depends on Epic 4 (Material Catalog) existing first. Sent-vs-received quantity on Movement rows is a real, distinct field pair (not one number) — the gap between them is the shortage/damage signal, never silently discarded.

## Composition Reference

`ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/05-inventory.html`, `mockups/07-movements.html`.
