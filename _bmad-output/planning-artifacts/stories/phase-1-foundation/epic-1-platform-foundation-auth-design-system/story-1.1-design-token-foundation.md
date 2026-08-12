---
epic: 1
story: "1.1"
phase: "1 — Foundation"
title: Design Token Foundation
---

# Story 1.1: Design Token Foundation

As the implementer of any future screen,
I want the finalized `DESIGN.md` token system (colors light+dark, typography, spacing, radius) implemented as Tailwind v4 `@theme` tokens in `packages/ui`,
So that every component renders the approved visual identity from one source, with no scattered hex/px literals.

## Acceptance Criteria

**Given** the `DESIGN.md` token frontmatter as source of truth
**When** `theme.css` is updated in `packages/ui`
**Then** every named token (colors incl. `-dark` variants, typography roles, spacing scale, radius scale) exists as a CSS custom property consumable via Tailwind v4 `@theme`
**And** no component in `packages/ui` contains a raw hex/px/rgba literal (AD-4)
**And** toggling a `dark` scope class switches every color token to its dark counterpart without per-component logic

## References

- `ux-designs/ux-AzentisFieldOS-2026-08-12/DESIGN.md` (frontmatter tokens)
- Architecture AD-4
