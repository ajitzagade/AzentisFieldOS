---
epic: 19
story: "19.2"
phase: "8 — Post-launch Enhancements"
title: Global Search & Action Palette
---

# Story 19.2: Global Search & Action Palette

As Owner/Admin,
I want the existing ⌘K search to cover every major record type and also surface quick actions,
So that I can find or do anything without remembering which of the sidebar's five groups it lives under.

## Acceptance Criteria

**Given** I open the Search palette and type a query matching a Vendor, Team Member, Payment, Purchase, Subcontractor, RMC entry, or Expense
**When** results render
**Then** each matching type appears as its own grouped result set with a "See all" option — the same mechanism already used for Sites and Materials

**Given** the existing Sites/Materials search behavior
**When** this story ships
**Then** that behavior is unchanged — no regression to existing entity groups or their "See all" routing

**Given** I type a query matching a curated action (e.g. "add advance," "new vendor," "pricing")
**When** results render
**Then** the matching entry appears in an "Actions" group, and Actions renders above any entity results when both match

**Given** I select an Action entry that needs a target (Record Payment, Record Advance)
**When** I select it
**Then** the corresponding quick-entry flow opens (Story 19.1's modal for Advance; Payment opens its existing `/payments/new` form) rather than navigating to a list page

**Given** I select an entity result (a specific Vendor, Payment, Purchase, etc.)
**When** I select it
**Then** I am taken directly to that record's detail page

**Given** the Actions list is hand-curated (New Daily Report, Record Payment, Record Advance, Add Purchase/Vendor/Team Member/Subcontractor, Review & Price, Open Reports, Open Settings)
**When** matching is performed
**Then** matching is plain-text title/keyword only — no fuzzy AI matching, consistent with the existing Help Search pattern

**Given** the palette is opened from any entry point (desktop `⌘K`, or later a mobile tap target)
**When** it renders on a narrow viewport
**Then** it is sized and interactable for touch — later stories (19.3, 19.4) wire additional entry points into this same palette, they don't change its behavior

## References

- `_bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/24-owner-quick-access-and-mobile-alignment.html` — D3
- `_bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/EXPERIENCE.md` — Component Patterns row "Search / Action palette"; Interaction Primitives (corrected "no command palette" line)
- `_bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/DESIGN.md` — Components: "Search / Action palette" (icon-tile visual spec)
- `apps/web/app/(app)/_components/global-search.tsx` (`useGlobalSearchController`, `SearchPalette` — currently `groups: [{key:"sites"}, {key:"materials"}]` only)
- `apps/api` — `SearchController` (`GET /search`) needs the additional entity coverage
