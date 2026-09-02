---
epic: 17
story: "17.4"
phase: "8 — Post-launch Enhancements"
title: Forgiving Corrections
---

# Story 17.4: Forgiving Corrections

As any user filing a correction on a quantity or amount,
I want to type the value that's actually right,
So that I never have to compute a signed delta ("-20") in my head before the app will accept it.

## Acceptance Criteria

**Given** a correction form for a quantity or amount (Purchase, Movement, Consumption, Return/Wastage, RMC delivery, Waste Disposal, Advance, Advance Adjustment, Expense)
**When** I open the correction
**Then** the field shows what's currently recorded and asks for the corrected value, not a delta

**Given** I type the corrected value
**When** it differs from the original
**Then** a live line reads "Was X → change of ±Y will be recorded" before I submit, and only the derived signed delta is sent to the server — the ledger's append-only contract (AD-9) and the API's existing FormData shape are completely unchanged underneath

**Given** I type a negative corrected value
**When** the field validates
**Then** it is refused with a visible "can't be negative" message — quantities and ₹ amounts in this domain are never negative, and a stray minus sign must never silently drive a nonsense delta onto the ledger

**Given** an RMC delivery correction where the corrected total is lower than the original
**When** I submit
**Then** the submission succeeds — the shared schema accepts a signed (possibly negative) total-amount delta on a correction, not only a positive restated total

**Given** a correction form renders without its required original value (a missing or misconfigured `initial` prop)
**When** the component mounts
**Then** it throws loudly in development rather than silently deriving a delta against 0 and putting a wrong adjustment on the ledger

## References

- `_bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/.working/simplicity-mockups.html` — Section 4 (before/after correction entry)
- `_bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/EXPERIENCE.md` — Component Patterns row "Corrected-value field"
- `packages/ui/src/components/corrected-value-field.tsx`
- `apps/web/lib/require-original.ts`
- `packages/shared/src/schemas/rmc-entry.ts`, and the ten forms listed in AC above

## Review Findings (code review 2026-09-02, commit b6c0950)

- [x] [Review][Patch] RMC's corrected-total field submitted a signed delta, but `createRmcEntrySchema.totalAmount` required `.positive()` — every downward correction (the most common case) was unsubmittable; the schema now allows a signed non-zero total on corrections while still requiring positive on a new delivery [rmc-entry.ts]
- [x] [Review][Patch] `CorrectedValueField` accepted a negative corrected value, which would derive a nonsense delta — now refused with a visible danger-toned hint and `min={0}` [corrected-value-field.tsx]
- [x] [Review][Patch] Five correction forms (Consumption, Movement, Return/Wastage, Waste Disposal, RMC) fell back to `originalValue={initial?.quantity ?? 0}` — a missing prop would silently derive a delta against 0; replaced with `requireOriginal()`, which throws loudly instead [new `lib/require-original.ts`, five form files]
- [x] [Review][Patch] Advance and Advance Adjustment correction confirm-dialogs replayed the wrong field as "Reason" (`reason`/`note` instead of `correctionReason`) — the user's typed correction reason was never actually re-verified before submit [advance-form.tsx, adjustment-form.tsx]
- [x] [Review][Patch] Correction field labels were inconsistent ("Correct amount" vs. "Corrected quantity (m³)") — unified on "Corrected …" everywhere [expense-form.tsx, advance-form.tsx, adjustment-form.tsx, purchase-form.tsx]
- [x] [Review][Patch] Waste Disposal's correction flow (unique "blank other-charges = no change" semantics) shipped with zero test coverage — added `waste-disposal-form.test.tsx` pinning both the trip-count delta and the blank-means-no-change contract
- [x] [Review][Defer] `useClientValidation` only revalidates on submit, so a fixed field keeps its stale inline error until the next submit attempt (no per-field revalidation on change/blur) — see `deferred-work.md` DW-CR-6
- [x] [Review][Defer] Shared schema correction-error messages still speak in delta vocabulary ("quantity delta must not be zero") even though the UI never shows the user a delta field — functionally safe, copy-only mismatch — see `deferred-work.md` DW-CR-6
- [x] [Review][Defer] Purchase's own money-correction sum semantics remain ambiguous (a restated positive total vs. a signed delta, unlike RMC which this story fixed) — pre-existing, not introduced here — see `deferred-work.md` DW-CR-2
