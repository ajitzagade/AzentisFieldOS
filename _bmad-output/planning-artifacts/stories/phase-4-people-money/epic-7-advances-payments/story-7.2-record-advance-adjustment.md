---
epic: 7
story: "7.2"
phase: "4 — People & Money"
title: Record an Advance Adjustment
---

# Story 7.2: Record an Advance Adjustment

As Owner/Admin,
I want to record an Advance Adjustment against a Team Member's Outstanding Balance, capped at the current balance,
So that repayments reduce what's owed accurately, and I can never accidentally push a balance negative.

## Acceptance Criteria

**Given** a Team Member with an Outstanding Balance of ₹8,000
**When** I attempt an Adjustment of ₹9,000
**Then** the submission is rejected with inline helper text stating the ₹8,000 cap — not a rejected-form surprise after submission (FR-23)

**Given** a valid Adjustment within the balance
**When** I submit it, optionally linked to a Payment
**Then** the Outstanding Balance decreases by exactly that amount, logged, timestamped, and attributed

## References

- FR-23
- `ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/09-team-member-detail.html` — Advance ledger + inline Adjustment form example
