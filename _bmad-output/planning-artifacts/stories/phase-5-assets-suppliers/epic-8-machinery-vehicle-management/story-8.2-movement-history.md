---
epic: 8
story: "8.2"
phase: "5 — Assets & Suppliers"
title: Record Movement Between Sites/Maintenance
---

# Story 8.2: Record Movement Between Sites/Maintenance

As Owner/Admin,
I want to record a Machine or Vehicle's movement — Available → Site A → Site B → Maintenance → Available — with full history retained,
So that I always know where an asset is now and where it's been.

## Acceptance Criteria

**Given** a Machine/Vehicle's current recorded location
**When** I record a movement to a new Site or to Maintenance
**Then** its "current Site" updates immediately, and every prior movement remains visible in its history — never overwritten to show only the latest state (FR-17, FR-38)
**And** "current Site" is a manually recorded value — no GPS or live tracking is implied anywhere in the UI

## References

- FR-17, FR-38
