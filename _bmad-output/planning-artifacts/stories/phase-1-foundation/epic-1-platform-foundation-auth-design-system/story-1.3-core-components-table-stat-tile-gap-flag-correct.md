---
epic: 1
story: "1.3"
phase: "1 — Foundation"
title: "Core Component Library — Data Table, Stat Tile, Gap Flag, Correct Action"
---

# Story 1.3: Core Component Library — Data Table, Stat Tile, Gap Flag, Correct Action

As a developer building any future list/detail screen,
I want the Data Table (zebra+hover, linked-row and non-link-row modes), Stat Tile, Gap Flag, and the "Correct" action component implemented once in `packages/ui`,
So that every transaction/list screen across the product behaves identically.

## Acceptance Criteria

**Given** the `DESIGN.md` Components spec and `EXPERIENCE.md` Component Patterns table
**When** Data Table, Stat Tile, Gap Flag, and CorrectAction are implemented in `packages/ui`
**Then** Data Table renders zebra-striped rows with a hover highlight, and supports a linked-row mode (whole row is a real link) vs. a non-link-row mode with no false-affordance cursor
**And** Stat Tile renders a meaning-tinted icon, tabular KPI numeral, and caption label
**And** Gap Flag renders an icon + message + one primary action, never a bare warning with no next step
**And** CorrectAction renders as an icon-only ghost button that, when wired by a consuming screen, opens a reason-required entry linked to the original record — never an Edit/Delete affordance

## References

- `ux-designs/ux-AzentisFieldOS-2026-08-12/EXPERIENCE.md` §Component Patterns
- Caught during UX review: `mockups/18-daily-activities.html` originally had `cursor:pointer` rows with no real link — the Data Table component must make that class of bug structurally impossible
- Architecture AD-9 (Correct pattern, backstopped at the DB grant level)
