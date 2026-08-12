---
epic: 4
story: "4.3"
phase: "3 — Materials & Inventory"
title: Add Custom Fields to a Material
---

# Story 4.3: Add Custom Fields to a Material

As Owner/Admin,
I want to add Custom Fields to a Material definition,
So that I can capture Tenant-specific attributes without needing a schema change.

## Acceptance Criteria

**Given** a Material
**When** I add a Custom Field (label + value type)
**Then** it's stored in the Material's `customFields` JSONB column, with no per-tenant database migration required
**And** the Custom Field appears on that Material's entry forms going forward

## References

- FR-7
