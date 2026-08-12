---
epic: 5
story: "5.2"
phase: "3 — Materials & Inventory"
title: Record Godown→Site Movement
---

# Story 5.2: Record Godown→Site Movement

As Owner/Admin,
I want to record a Movement of Material from Godown to a Site, capturing both sent and received quantity,
So that any shortage or damage in transit is visible as its own value, not silently absorbed.

## Acceptance Criteria

**Given** I record a Movement (Material/Size/quantity, vehicle, person responsible)
**When** I submit
**Then** Godown Stock decreases by the sent quantity at recording time

**When** the receiving Site confirms receipt with a received quantity
**Then** Site Stock increases by the received quantity, and any gap between sent and received is captured as a visible, distinct value (FR-9) — never hidden or auto-reconciled
**And** the row's "Correct" action is available, never Edit/Delete

## References

- FR-9
- `ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/07-movements.html` — the sent-vs-received-qty pattern is shown explicitly there
