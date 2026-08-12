---
epic: 5
story: "5.3"
phase: "3 — Materials & Inventory"
title: Record Direct Vendor→Site Purchase
---

# Story 5.3: Record Direct Vendor→Site Purchase

As Owner/Admin,
I want to record a Purchase that goes directly from a Vendor to a Site, bypassing the Godown,
So that Site-delivered material is tracked without a false Godown Stock detour.

## Acceptance Criteria

**Given** I record a direct Vendor→Site Purchase with the same field set as a standard Purchase plus a receiver
**When** I submit
**Then** the destination Site's Stock increases directly, and Godown Stock is never touched by this transaction (FR-10)

## References

- FR-10
