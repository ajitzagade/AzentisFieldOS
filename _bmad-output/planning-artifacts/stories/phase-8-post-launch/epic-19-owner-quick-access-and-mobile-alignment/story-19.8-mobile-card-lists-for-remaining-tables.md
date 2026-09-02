---
epic: 19
story: "19.8"
phase: "8 — Post-launch Enhancements"
title: Mobile Card Lists for Sites, Vendors, Team & Labour, Inventory
---

# Story 19.8: Mobile Card Lists for Sites, Vendors, Team & Labour, Inventory

As any user on a phone,
I want these four list tables to render as cards instead of a horizontal-scrolling table,
So that I can read every column without scrolling sideways.

## Acceptance Criteria

**Given** I view the Sites list, Vendors list, Team & Labour roster, or Inventory's Godown/Site stock tables on a screen below the `md` breakpoint
**When** the list renders
**Then** each row appears as a card — key facts first, status as a text+color pill, the row action always visible

**Given** the same four lists on a screen at or above `md` width
**When** the list renders
**Then** the full table renders as it does today — desktop is unaffected

**Given** this fix ships
**When** any of these four lists is viewed at 390px width
**Then** no column is clipped and no horizontal scrolling is required

**Given** this reuses the existing `DataTable` `mobileCard` prop
**When** implemented
**Then** no new table component is created — only the `mobileCard` config is wired onto these four call sites, following the same primary/secondary field mapping pattern already used by Payments/RMC/Expenses/Movements/Waste

**Given** a list is empty or in an error/loading state
**When** `mobileCard` is active
**Then** the existing loading/empty/error state patterns (AD-6) still render correctly — `mobileCard` only changes the success-state row rendering

## References

- `_bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/24-owner-quick-access-and-mobile-alignment.html` — D8
- `_bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/EXPERIENCE.md` — Component Patterns row "Mobile card list" (extended by this story)
- `packages/ui/src/components/data-table.tsx` (`mobileCard` prop — already implemented, unused by these four)
- `apps/web/app/(app)/sites/sites-list-client.tsx`, `apps/web/app/(app)/vendors/vendors-list-client.tsx`, `apps/web/app/(app)/team/team-members-list-client.tsx`, `apps/web/app/(app)/inventory/page.tsx`
- Reference implementations already using `mobileCard`: `apps/web/app/(app)/payments/payments-list-client.tsx`, `expenses/expenses-list-client.tsx`, `rmc/rmc-entries-list-client.tsx`, `movements/movements-list-client.tsx`, `waste-disposal/page.tsx`
