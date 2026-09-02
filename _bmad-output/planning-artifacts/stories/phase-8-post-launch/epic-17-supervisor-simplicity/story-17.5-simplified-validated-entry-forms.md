---
epic: 17
story: "17.5"
phase: "8 — Post-launch Enhancements"
title: Simplified, Validated Entry Forms
---

# Story 17.5: Simplified, Validated Entry Forms

As a Site Supervisor entering data in the field, and as anyone filling out any server-action form in the product,
I want the required fields to read short, the Site I'm working at to be remembered, and mistakes to be flagged as I type,
So that a 15-field form doesn't feel like an obstacle and I don't have to submit-and-wait to find out I made an error.

## Acceptance Criteria

**Given** any form with a Site field (Purchase, Consumption, Movement, RMC, Expense, Waste Disposal, Work Records, the Daily Report itself, and Machinery/Vehicle asset movements)
**When** I pick a Site
**Then** the picker is a searchable combobox, never a long native dropdown, and it remembers my last-picked Site on this device as the default next time — with an explicit `?siteId=` deep link always winning over the remembered value

**Given** the remembered-Site convenience
**When** the device's storage is blocked, another browser tab changes the stored value, or I sign out
**Then** the form never crashes (storage access is guarded), another tab's change never silently swaps my in-progress Site, and signing out clears the remembered Site so the next person on a shared phone doesn't inherit it

**Given** the Purchase entry form's six least-used fields (Invoice/Challan No., Challan Photo, Delivery Location, Vehicle Details, Receiver Name, Notes)
**When** the form renders for a new entry
**Then** they are collapsed behind one "More details" toggle — open by default only if a value is already present — and still submit correctly when left collapsed

**Given** the Purchase or RMC entry form
**When** I enter a Quantity and a Rate
**Then** Total Amount auto-computes as their product, remains editable for a bill that carries rounding or extra charges, and clears itself (rather than showing a stale figure) if I blank either input

**Given** any server-action form
**When** I submit invalid input
**Then** an inline, per-field error appears immediately, using the exact same validation the Server Action itself runs (one shared `parse.ts` per form, run by both the client hook and the action) — never a submit-and-wait-for-the-server round trip for input the shared schema already rejects

## References

- `_bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/.working/simplicity-mockups.html` — Section 5 (Purchase form before/after)
- `_bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/EXPERIENCE.md` — Component Patterns rows "Site picker (SiteField)", "More-details fold", "Inline validation"
- `apps/web/app/(app)/_components/site-field.tsx`, `lib/use-client-validation.ts`
- `packages/ui/src/components/details-disclosure.tsx`
- `apps/web/app/(app)/movements/purchases/purchase-form.tsx`, `rmc/rmc-form.tsx`, and every form's sibling `parse.ts`

## Review Findings (code review 2026-09-02, commit b6c0950)

- [x] [Review][Patch] `SiteField` read `localStorage` unguarded — on devices/browsers that block storage access (exactly the low-end field devices this feature targets), the form would crash instead of degrading to "no remembered Site" [site-field.tsx]
- [x] [Review][Patch] A deep-linked `?siteId=` that no longer exists in the options list was trusted blindly, submitting an invalid id with a blank-looking picker — now validated against the loaded Site list [site-field.tsx]
- [x] [Review][Patch] Another browser tab changing the remembered-Site key could swap this form's Site mid-entry — the value is now latched at mount, immune to cross-tab storage events [site-field.tsx]
- [x] [Review][Patch] The remembered Site survived sign-out — on a shared phone the next signed-in user inherited the previous user's default Site; sign-out now clears it [site-field.tsx `clearRememberedSite()`, app-shell.tsx]
- [x] [Review][Patch] RMC's auto-total kept a stale computed value when quantity or rate was blanked after computing — now clears to empty on a blanked input [rmc-form.tsx]
- [x] [Review][Patch] Asset Movement's Site field was left as a native dropdown when every other entry form's Site field was converted — now `SiteField` [machinery-vehicles/asset-movement-form.tsx]
- [x] [Review][Patch] The Add Material Size form had a `parse.ts` created for it but was never wired to `useClientValidation` — now validated inline like its sibling forms [materials/[id]/edit/sizes-section.tsx]
- [x] [Review][Patch] Material edit's `customFields` JSON was validated differently client vs. server (two different error surfaces for the same bad input, and the Server Action parsed it twice) — now one validation path through the shared `parse.ts` [materials/[id]/edit/actions.ts, parse.ts, edit-material-form.tsx]
- [x] [Review][Patch] Payment form's linked Advance Adjustment fields are nested under `advanceAdjustment` in the schema; `flatten().fieldErrors` only yields top-level keys, so inline errors for `advanceId`/`adjustmentAmount`/`adjustmentNote` were invisible in both run sites and the new client guard could block submission with nothing shown — nested issue paths are now remapped to the flat field names the form renders [payments/parse.ts]
- [x] [Review][Patch] The shared `useClientValidation` hook and the entire remembered-Site behavior shipped with zero direct tests — a one-line regression could have disabled every server-action form's submission at once with no test failing; added `use-client-validation.test.ts` and `site-field.test.tsx`
- [x] [Review][Defer] `useClientValidation` doesn't revalidate per-field on change/blur, only on the next submit — see `deferred-work.md` DW-CR-6 (shared with Story 17.4)
