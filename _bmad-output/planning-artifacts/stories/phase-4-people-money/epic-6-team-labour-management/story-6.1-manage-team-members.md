---
epic: 6
story: "6.1"
phase: "4 — People & Money"
title: Manage Team Members
---

# Story 6.1: Manage Team Members

As Owner/Admin,
I want to create and maintain Team Member records (name, role/designation, contact, employment/payment type),
So that I have one accurate roster, never bound to a single Site.

## Acceptance Criteria

**Given** I create a Team Member with a name, role, contact, and employment type (monthly/weekly/daily-wage)
**When** I save
**Then** the Team Member is immediately available in every Work Record, Advance, and Payment picker across the product
**And** a Team Member is never permanently bound to one Site — their assignment comes only from actual Work Records (FR-19)
**And** employment-type categories are admin-configurable data, not a hardcoded enum (NFR-4) — Epic 14 later adds the admin UI to manage them

## References

- FR-19, NFR-4
- `ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/08-team.html`
