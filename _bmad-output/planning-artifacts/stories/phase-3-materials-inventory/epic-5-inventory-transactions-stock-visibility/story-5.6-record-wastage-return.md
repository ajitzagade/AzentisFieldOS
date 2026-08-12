---
epic: 5
story: "5.6"
phase: "3 — Materials & Inventory"
title: Record Wastage/Return
---

# Story 5.6: Record Wastage/Return

As Owner/Admin or Site Supervisor,
I want to record Wastage or a Return as its own transaction type, distinct from Consumption,
So that material lost to waste is never miscounted as material actually used in the work.

## Acceptance Criteria

**Given** a Site with Stock for a Material
**When** I record a Wastage/Return entry
**Then** it's stored as a distinct transaction type from Consumption (FR-13), and Stock adjusts accordingly with a visible reason

## References

- FR-13
