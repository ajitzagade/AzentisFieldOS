---
epic: 4
story: "4.2"
phase: "3 — Materials & Inventory"
title: Manage Sizes/Specifications & Units per Material
---

# Story 4.2: Manage Sizes/Specifications & Units per Material

As Owner/Admin,
I want to define Sizes/Specifications and a Unit of Measure per Material,
So that every transaction against that Material uses consistent, correct units and options.

## Acceptance Criteria

**Given** a Material (e.g. "RCC Pipe")
**When** I add Sizes/Specifications (e.g. 300mm, 450mm, 600mm, 900mm)
**Then** each Size is immediately selectable wherever that Material is picked, and adding a new Size later doesn't disturb existing Stock records tied to prior Sizes
**And** a Material's Unit is enforced consistently — every transaction type referencing it uses the same Unit, never a mismatched one

## References

- FR-5, FR-6
