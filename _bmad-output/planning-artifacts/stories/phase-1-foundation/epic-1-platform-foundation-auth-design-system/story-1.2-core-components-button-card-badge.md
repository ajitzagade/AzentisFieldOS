---
epic: 1
story: "1.2"
phase: "1 — Foundation"
title: "Core Component Library — Button, Card, Badge"
---

# Story 1.2: Core Component Library — Button, Card, Badge

As a developer building any future screen,
I want the Button (primary/secondary/ghost), Card (resting + interactive-hover), and Badge (5 semantic variants) components implemented once in `packages/ui`,
So that every screen reuses the same primitive instead of re-implementing it (AD-5).

## Acceptance Criteria

**Given** the `DESIGN.md` Components spec
**When** Button, Card, and Badge are implemented in `packages/ui`
**Then** Button supports primary/secondary/ghost variants with mandatory icon+label composition (icon-only only via an explicit prop for dense row actions)
**And** Card supports a resting `shadow-2` state and an `interactive` prop producing `shadow-2-hover` + lift on hover
**And** Badge supports all 5 semantic variants and optionally pairs with an icon
**And** all three components pass a visual check against `DESIGN.md` token values

## References

- `ux-designs/ux-AzentisFieldOS-2026-08-12/DESIGN.md` §Components
- Architecture AD-5
