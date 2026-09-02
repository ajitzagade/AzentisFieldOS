---
epic: 17
story: "17.2"
phase: "8 — Post-launch Enhancements"
title: One Name Everywhere — "Daily Report"
---

# Story 17.2: One Name Everywhere — "Daily Report"

As any signed-in user, especially a Site Supervisor learning the app unsupervised,
I want the single most important concept in the product to have one name, not four,
So that "Daily Activity" in the menu, "Daily Site Report" in page text, "DSR" in badges, and "New Report" on a button all stop reading as different things.

## Acceptance Criteria

**Given** any user-facing surface — nav labels, page titles, buttons, badges, column headers, gap-flag messages, Help & Guides content
**When** the concept of a Site's daily submission is referenced
**Then** it reads "Daily Report" everywhere — "Daily Activity", "Daily Site Report", and the raw abbreviation "DSR" no longer appear in UI copy

**Given** existing bookmarks or shared links to the desktop DSR-creation route
**When** a user visits `/daily-activity/new`
**Then** they are redirected to the live `/dsr/new` entry form instead of hitting a 404 — the desktop-creation surface was retired in favor of the one responsive form serving both form factors

**Given** trade vocabulary already in the glossary (Godown, Challan, Advance, RMC)
**When** the rename sweep runs
**Then** those terms are untouched — only the product's own internal inconsistency changes, never domain vocabulary the field already uses

**Given** the Help & Guides content and the Client Presentation (which share one content source)
**When** a guide step instructs a user to tap a button
**Then** the instruction names the button's real, current label — no guide teaches a user to look for "Submit Daily Site Report" when the button says "Submit Daily Report"

## References

- `_bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/.working/simplicity-mockups.html` — Section 6 (terminology table)
- `_bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/EXPERIENCE.md` — "2026-09-01 simplicity revision" note
- `apps/web/app/(app)/_components/nav-config.ts`, `dsr/new/page.tsx`, `daily-activity/**`, `sites/[id]/feed-type-config.ts`
- `packages/shared/src/content/help-content.ts`

## Review Findings (code review 2026-09-02, commit b6c0950)

- [x] [Review][Patch] `dsr-desktop-form.tsx`'s correction-mode submit button and success flash still read "Submit Daily Activity" / "Daily Site Report submitted" — renamed to match the live "Daily Report" naming [dsr-desktop-form.tsx]
- [x] [Review][Patch] Site record feed's type badge still rendered the raw abbreviation "DSR" — relabeled to "Report" [sites/[id]/feed-type-config.ts]
- [x] [Review][Patch] Help & Guides content (shared with the Client Presentation) still taught "Tap Submit Daily Site Report" and referred to "the DSR form" in several module explanations — swept to "Daily Report" throughout, keeping the one first-use glossary parenthetical ("Daily Report (DSR)") so the abbreviation is still explained once, never used as the primary name [help-content.ts]
- [x] [Review][Defer] `DsrDesktopForm`'s `mode="new"` branch is now dead code — its only route (`/daily-activity/new`) was deleted and replaced with a redirect stub; the mode itself was not pruned — see `deferred-work.md` DW-CR-7
