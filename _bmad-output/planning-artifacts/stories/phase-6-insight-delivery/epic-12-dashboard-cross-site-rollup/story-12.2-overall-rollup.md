---
epic: 12
story: "12.2"
phase: "6 — Insight & Delivery"
title: Overall Rollup
---

# Story 12.2: Overall Rollup

As Owner/Admin,
I want to see Overall status — active Sites, inventory status, outstanding Advances, pending payments — with drill-down into every figure,
So that I understand business-wide state at a glance.

## Acceptance Criteria

**Given** a Tenant with zero Sites
**When** I open the Dashboard
**Then** I see an explicit empty state guiding me to create a Site — never a broken or blank layout (FR-34)

**Given** Sites, Inventory, Advances, and Payments data exist
**When** I view the Overall section
**Then** every figure matches its source screen exactly and links through to it

## References

- FR-34
