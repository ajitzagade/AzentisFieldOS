---
epic: 19
story: "19.4"
phase: "8 — Post-launch Enhancements"
title: Owner Mobile Quick-Bar
---

# Story 19.4: Owner Mobile Quick-Bar

As Owner/Admin using my phone,
I want a persistent bottom bar for my most common actions,
So that I have fast access without falling back to only the responsive desktop layout.

## Acceptance Criteria

**Given** I am OWNER_ADMIN on a screen below the `lg` breakpoint
**When** any screen renders
**Then** a fixed bottom quick-bar is visible: Dashboard · Sites · a center "+" Quick Add · Search · More

**Given** I tap the center "+"
**When** the Quick Add sheet opens
**Then** I see the same curated action list as Story 19.2's Action palette — New Daily Report, Record Payment, Record Advance, Add Purchase, etc.

**Given** I tap "Search"
**When** it activates
**Then** Story 19.2's Search/Action palette opens, touch-first

**Given** I tap "More"
**When** it activates
**Then** the full sidebar navigation opens — no capability is hidden, only de-emphasized, matching the trimming philosophy already established for the Supervisor nav

**Given** I am SITE_SUPERVISOR
**When** I view any mobile screen
**Then** this bar does not appear — the existing Supervisor bottom quick-bar (Home · Report · Materials · Help) is unaffected and unchanged

**Given** the Owner quick-bar is visible
**When** any screen's content renders
**Then** bottom padding is added so the bar never covers a submit button or other actionable content

**Given** the active tab (Dashboard or Sites)
**When** the bar renders
**Then** active state is shown via color + weight + `aria-current` — never color alone

## References

- `_bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/24-owner-quick-access-and-mobile-alignment.html` — D5
- `_bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/EXPERIENCE.md` — Component Patterns row "Owner mobile quick-bar"; Responsive & Platform row "Owner on mobile"
- `_bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/DESIGN.md` — Components: "Owner mobile quick-bar" (FAB visual spec)
- `apps/web/app/(app)/_components/app-shell.tsx` (`SupervisorQuickBar` — the pattern to mirror, not duplicate logic from)
- `apps/web/app/(app)/_components/nav-config.ts` (`SUPERVISOR_QUICK_BAR_ITEMS` precedent for the new Owner equivalent)
