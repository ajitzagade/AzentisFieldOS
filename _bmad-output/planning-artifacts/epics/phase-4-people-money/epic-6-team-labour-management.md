---
epic: 6
phase: "4 — People & Money"
status: not-started
---

# Epic 6: Team & Labour Management

## Goal

Owner/Admin maintains Team Member records and records daily Work Records/attendance per Site, with a Team Member's full work history queryable either way.

## FRs Covered

- FR-19: Team Member records (name, role, contact, employment/payment type); never bound to a single Site.
- FR-20: Daily Work Record (Team Members present at a Site on a date, attendance, hours, overtime); a Team Member cannot have two Work Records at two different Sites on the same date.
- FR-21: Site-wise work history per Team Member, queryable by Team Member or by Site.
- FR-37: Team summary (total Team Members, today's working headcount, weekly/monthly payment totals, total outstanding Advances).

## Related UX Design Requirements

UX-DR13 (Team & Labour list + detail), UX-DR18 (attendance checklist defaulted from the previous day's crew at that Site).

## Implementation Notes

The same-date/two-Sites constraint on Work Records (FR-20) is a real validation rule, not a UI nicety — enforce it server-side, not just as a frontend disabled-state. NFR-4 requires labour/employment-type categories to be admin-configurable data (seeded defaults, not a hardcoded enum) — Epic 14 adds the admin UI later; it doesn't gate this epic.

## Composition Reference

`ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/08-team.html`, `mockups/09-team-member-detail.html`.
