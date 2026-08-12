---
epic: 7
story: "7.3"
phase: "4 — People & Money"
title: Record a Payment
---

# Story 7.3: Record a Payment

As Owner/Admin,
I want to record a Payment (Base Pay + Additional − Actual Deductions − Advance Adjustment = Net Payable),
So that what a Team Member is actually paid is calculated correctly and kept as permanent history.

## Acceptance Criteria

**Given** Base Pay, Additional, Deductions, and an optional Advance Adjustment
**When** I record a Payment
**Then** Net Payable computes automatically as Base + Additional − Deductions − Adjustment, and the full breakdown is retained, never overwritten (FR-24)
**And** the row's "Correct" action is available, never Edit/Delete

## References

- FR-24
- `ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/10-payments.html`
