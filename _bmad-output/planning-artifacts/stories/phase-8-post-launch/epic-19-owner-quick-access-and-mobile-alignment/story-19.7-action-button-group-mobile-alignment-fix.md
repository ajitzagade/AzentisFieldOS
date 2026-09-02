---
epic: 19
story: "19.7"
phase: "8 — Post-launch Enhancements"
title: Action-Button Group Mobile Alignment Fix
---

# Story 19.7: Action-Button Group Mobile Alignment Fix

As any user on a phone,
I want multi-button action rows to stack cleanly instead of wrapping unevenly,
So that buttons are consistently reachable and the page doesn't look broken.

## Acceptance Criteria

**Given** any page with an action-button group currently using plain `flex flex-wrap` — Movements, Site detail's "Today at this Site" card, Team & Labour, Vendors, Subcontractors, Machinery & Vehicles, Inventory, Expenses, Materials, Daily Activity, RMC
**When** the viewport is below the mobile breakpoint
**Then** every button in the group renders full-width, stacked in a single column

**Given** the same action-button group
**When** the viewport is at or above the `sm` breakpoint
**Then** buttons wrap inline as they do today — desktop is unaffected, no visual regression

**Given** this fix ships
**When** any of the listed pages is viewed on a 390px-wide screen
**Then** no button row produces a jagged, unevenly-spaced wrap (verified by re-running the same screenshot audit that found the bug)

**Given** this is a shared responsive rule
**When** implemented
**Then** it is a single shared utility/class applied at every listed call site — not duplicated per page

**Given** the Movements page specifically (6 buttons: Direct Vendor → Site, Record Movement, Record Transfer, Record Consumption, Record Wastage / Return, Record Purchase)
**When** viewed on both Owner and Supervisor sessions on mobile
**Then** both render identically fixed — this is one shared page, not two separate fixes

## References

- `_bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/24-owner-quick-access-and-mobile-alignment.html` — D7
- `_bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/EXPERIENCE.md` — Component Patterns row "Action-button group"
- `apps/web/app/(app)/movements/movements-list-client.tsx:302` (`flex flex-wrap justify-end gap-2` — worst-case, 6 buttons)
- `apps/web/app/(app)/sites/[id]/page.tsx:324` (`flex flex-wrap gap-2` — 3 buttons, dead space)
- Also present in: `apps/web/app/(app)/{team,vendors,subcontractors,machinery-vehicles,inventory,expenses,materials,daily-activity,rmc}/**` — grep `flex flex-wrap.*gap-2` for the full call-site list before starting
