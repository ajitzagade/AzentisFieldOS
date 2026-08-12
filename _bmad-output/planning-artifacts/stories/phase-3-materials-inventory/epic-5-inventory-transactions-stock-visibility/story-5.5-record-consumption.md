---
epic: 5
story: "5.5"
phase: "3 — Materials & Inventory"
title: Record Consumption
---

# Story 5.5: Record Consumption

As Site Supervisor or Owner/Admin,
I want to record Material Consumption at a Site against an activity reference,
So that Site Stock reflects what's actually been used, comparable against what was received.

## Acceptance Criteria

**Given** a Site with available Stock for a Material
**When** I record Consumption (date, material, size/spec, quantity, unit, activity reference, notes)
**Then** Site Stock for that Material/Size decreases by the consumed quantity, and the entry is comparable against total received to compute variance (FR-12)

## References

- FR-12
