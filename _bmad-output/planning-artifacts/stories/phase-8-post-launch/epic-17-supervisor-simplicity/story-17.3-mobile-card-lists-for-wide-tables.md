---
epic: 17
story: "17.3"
phase: "8 — Post-launch Enhancements"
title: Mobile Card Lists for Wide Tables
---

# Story 17.3: Mobile Card Lists for Wide Tables

As any user on a phone,
I want a 7–9 column list (Payments, RMC, Expenses, Movements, Waste & Disposal) to show me the key facts and the row action without sideways scrolling,
So that I don't have to swipe every row to find the amount, the status, or the Correct button.

## Acceptance Criteria

**Given** a list screen with more columns than comfortably fit a phone width
**When** the viewport is below `md`
**Then** each row renders as a card — a primary line with the key identifying fields, secondary label/value pairs for the rest, status shown as a colored pill with a text label (never color alone), and the row's action (Correct icon, chevron link, or a new context-specific action) always visible without scrolling

**Given** the same list screen at `md` width or above
**When** the viewport is desktop-sized
**Then** the existing full-column table renders exactly as before — the card mode is phone-only, and the desktop table's sortable headers and layout are unchanged

**Given** the shared `DataTable` component's existing state machine (loading, empty, error, success)
**When** `mobileCard` mode is active
**Then** loading shows pulsing card skeletons (not a table skeleton), and empty/error states render the same message-and-action pattern as the desktop table

**Given** a list row is wrapped in `rowHref`
**When** rendered as a mobile card
**Then** the whole card is the tap target, matching the desktop table's whole-row-is-a-link pattern

## References

- `_bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/.working/simplicity-mockups.html` — Section 3 (Payments table vs. card comparison)
- `_bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/EXPERIENCE.md` — Component Patterns row "Mobile card list"
- `packages/ui/src/components/data-table.tsx` — the `mobileCard` prop and `DataTableMobileCard` type
- `apps/web/app/(app)/payments/payments-list-client.tsx`, `rmc/rmc-entries-list-client.tsx`, `expenses/expenses-list-client.tsx`, `movements/movements-list-client.tsx`, `waste-disposal/page.tsx`

## Review Findings (code review 2026-09-02, commit b6c0950)

No findings specific to this story survived triage — the `mobileCard` implementation and its dual desktop/mobile rendering were exercised directly by `data-table.test.tsx` and the five adopting list-client tests (`toHaveLength(2)` assertions pinning both renders) from initial delivery.
