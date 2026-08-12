---
epic: 1
story: "1.4"
phase: "1 — Foundation"
title: Inline Icon System
---

# Story 1.4: Inline Icon System

As a developer,
I want the finalized inline SVG icon set (24×24, 1.75 stroke, `stroke=currentColor`) available as importable components in `packages/ui`,
So that no screen needs to load an icon font or hit an external CDN, preserving the low-bandwidth budget for field users (NFR-5).

## Acceptance Criteria

**Given** the icon set documented in the UX shared kit
**When** icons are extracted into `packages/ui` as individual components
**Then** every icon renders inline with no network request
**And** icon color inherits from its container via `currentColor` without per-instance overrides

## References

- `ux-designs/ux-AzentisFieldOS-2026-08-12/.working/_shared-kit.html` (source icon library)
- NFR-5
