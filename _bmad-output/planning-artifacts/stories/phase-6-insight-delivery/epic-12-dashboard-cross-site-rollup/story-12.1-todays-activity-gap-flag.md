---
epic: 12
story: "12.1"
phase: "6 — Insight & Delivery"
title: Today's Activity & Missing-DSR Gap Flag
---

# Story 12.1: Today's Activity & Missing-DSR Gap Flag

As Owner/Admin,
I want to open the Dashboard and see today's activity across all Sites — sites active, labour working, materials received/consumed, RMC used, machinery in use, expenses — with an explicit flag for any Site that hasn't reported yet today,
So that I know what happened today and what needs my attention, without phoning anyone (SM-3).

## Acceptance Criteria

**Given** DSRs and transactions exist for some Sites today
**When** I open the Dashboard
**Then** each Today's Activity stat tile drills down into the real screen behind it (Daily Activity, Inventory, Team, Machinery, Expenses)

**Given** a Site has not submitted a DSR yet today
**When** I view the Dashboard
**Then** a Gap Flag names that Site explicitly — never a silent absence in a list (FR-35)

## References

- FR-35, SM-3
- `ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/01-dashboard.html`
