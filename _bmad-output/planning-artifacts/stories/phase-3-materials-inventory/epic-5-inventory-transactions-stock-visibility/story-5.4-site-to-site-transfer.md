---
epic: 5
story: "5.4"
phase: "3 — Materials & Inventory"
title: Record Site→Site Transfer
---

# Story 5.4: Record Site→Site Transfer

As Owner/Admin,
I want to record a Material transfer from one Site directly to another,
So that Site Stock stays accurate when material moves between active jobsites without passing through the Godown.

## Acceptance Criteria

**Given** I record a Site→Site transfer (vehicle, person responsible, notes, received quantity)
**When** I submit
**Then** the sending Site's Stock decreases and the receiving Site's Stock increases on confirmed receipt, with the same shortage/damage-gap capture discipline as Godown→Site Movement (FR-11)

## References

- FR-11
