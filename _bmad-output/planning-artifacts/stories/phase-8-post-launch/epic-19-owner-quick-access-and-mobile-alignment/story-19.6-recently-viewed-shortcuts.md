---
epic: 19
story: "19.6"
phase: "8 — Post-launch Enhancements"
title: Recently-Viewed Shortcuts
---

# Story 19.6: Recently-Viewed Shortcuts

As Owner/Admin who doesn't open the app every day,
I want to see the last few records I opened,
So that I can pick up where I left off without re-navigating to find them.

## Acceptance Criteria

**Given** I open a Site, Vendor, Team Member, or Subcontractor detail page
**When** I later return to the Dashboard
**Then** that record appears in a "Recently viewed" row, most-recent-first

**Given** more than 6 records have been viewed
**When** the row renders
**Then** only the most recent 4-6 are shown, oldest dropped

**Given** I click a recently-viewed chip
**When** it activates
**Then** I am taken directly to that record's detail page

**Given** I sign out
**When** I next sign in
**Then** the recently-viewed list is empty — device-local (localStorage), cleared on sign-out, same convention as `SiteField`'s remembered-Site

**Given** zero records have been viewed yet
**When** the Dashboard renders
**Then** the row does not appear — no empty-state placeholder needed for this lightweight, optional pattern

**Given** I view the same record twice
**When** the row updates
**Then** it moves to the front rather than appearing twice

## References

- `_bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/24-owner-quick-access-and-mobile-alignment.html` — D6
- `_bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/EXPERIENCE.md` — Component Patterns row "Recently-viewed shortcuts"
- `_bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/DESIGN.md` — Components: "Recently-viewed chip"
- `apps/web/app/(app)/_components/site-field.tsx` (`LAST_SITE_STORAGE_KEY` — the localStorage pattern to generalize)
