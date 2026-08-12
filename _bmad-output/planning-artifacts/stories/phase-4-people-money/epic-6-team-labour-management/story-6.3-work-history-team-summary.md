---
epic: 6
story: "6.3"
phase: "4 — People & Money"
title: Work History & Team Summary
---

# Story 6.3: Work History & Team Summary

As Owner/Admin,
I want to view a Team Member's full work history by Team Member or by Site, and see a summary of today's working headcount and totals,
So that I can answer "who worked where, and how much" without cross-referencing multiple screens.

## Acceptance Criteria

**Given** Work Records exist across multiple Sites and dates
**When** I query by Team Member
**Then** I see every Work Record for that person, chronologically, across all Sites (FR-21)

**When** I query by Site
**Then** I see every Team Member who worked there, by date
**And** the Team summary shows total Team Members, today's working headcount, and weekly/monthly payment totals — the latter populated once Epic 7 (Advances & Payments) exists, showing zero/empty gracefully until then (FR-37)

## References

- FR-21, FR-37
- `ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/09-team-member-detail.html`
