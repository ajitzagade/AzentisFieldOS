---
epic: 7
phase: "4 — People & Money"
status: not-started
---

# Epic 7: Advances & Payments

## Goal

Owner/Admin records Advances and Advance Adjustments against a Team Member's running Outstanding Balance and records Payments (Base + Additional − Deductions − Adjustment = Net Payable), with full history retained and every correction append-only.

## FRs Covered

- FR-22: Record an Advance (amount, date, reason, payment method); updates Outstanding Balance immediately, no approval step.
- FR-23: Record an Advance Adjustment at any time against any Payment; Outstanding Balance changes only via explicit Adjustment; an Adjustment cannot exceed the current Outstanding Balance.
- FR-24: Record a Payment (Base Pay + Additional − Deductions − Advance Adjustment = Net Payable); full history retained, never overwritten.
- FR-25: Outstanding-advance visibility at a glance, drillable per Team Member, reconciling exactly to the sum of individual balances.
- FR-54 (as it applies to Advances/Payments): append-only, corrections via a new reason-carrying entry.

## Related NFRs

- NFR-2: Advances, Stock, and Payments are never auto-adjusted or auto-deducted; every change requires explicit, reason-carrying user action, logged append-only.
- NFR-3: No approval-chain or hierarchy — Advance/Adjustment/Payment recording is a direct owner action, not a workflow.

## Related Architecture Requirements

- AD-9: Append-only ledger, DB-level enforcement backstop.

## Related UX Design Requirements

UX-DR7 (Correct action on Advance/Adjustment/Payment rows), UX-DR17 (reason field, not a confirmation dialog — this is the canonical example the pattern was designed around).

## Implementation Notes

Depends on Epic 6 (Team Member entity must exist first). The "cannot exceed Outstanding Balance" rule (FR-23) must be enforced server-side and surfaced as inline helper text client-side — never a rejected-form surprise after submission.

## Composition Reference

`ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/09-team-member-detail.html` (Advance ledger + inline Adjustment form example), `mockups/10-payments.html`.
