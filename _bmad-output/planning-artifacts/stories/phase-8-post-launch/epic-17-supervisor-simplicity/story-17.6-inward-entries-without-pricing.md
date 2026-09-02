---
epic: 17
story: "17.6"
phase: "8 — Post-launch Enhancements"
title: Inward Entries Without Pricing
---

# Story 17.6: Inward Entries Without Pricing

As a Site Supervisor receiving material at the gate,
I want to record what arrived — vendor, material, quantity, challan photo — without needing the bill in front of me,
So that I never have to guess at or delay recording a Rate, Total Amount, or Payment Status I don't have.

As Owner/Admin,
I want every inward entry a Supervisor recorded without pricing to show up as a clear, actionable queue,
So that I can complete the money details once I have the bill, without it ever being mistaken for a ₹0 purchase.

## Acceptance Criteria

**Given** I am a Site Supervisor recording a Material Received (Purchase) entry
**When** the form renders
**Then** it shows only the physical facts — Vendor, Material/Size, Deliver to, Quantity, Challan Photo — with no Rate, Total Amount, or Payment Status fields, and a note explaining the office adds pricing later

**Given** a Supervisor's pricing-less submission
**When** it saves
**Then** stock updates immediately (pricing never blocks material being usable) and the entry is recorded with `rate`/`totalAmount`/`paymentStatus` all null — "Pricing pending"

**Given** an unpriced Purchase appears in the Movements list or a Vendor's purchase history
**When** it renders
**Then** it wears a "Pricing pending" badge and, on the Vendor page, an amount dash — never a silent ₹0, and every money aggregate (Vendor Outstanding, Cash Tied Up) excludes it rather than treating null as zero

**Given** I am Owner/Admin
**When** one or more inward entries are pending pricing
**Then** the Dashboard shows an honest count with an "Add Pricing" action, and the Movements list offers "Add Pricing" on each pending row (Owner/Admin only — a Supervisor never sees this action)

**Given** I open the pricing-completion page for a pending entry
**When** it renders
**Then** the Supervisor-recorded quantity shows read-only for verification, Total Amount auto-computes from quantity × rate (still editable), and completing it is held for FR-54 re-verification like every other money-bearing submission

**Given** an inward entry's pricing has already been completed once
**When** anyone (including a race between two concurrent completions) attempts to complete it again
**Then** the write is refused — pricing is a one-time fill of fields recorded as "to be priced," never an overwrite of a recorded value (the one documented, deliberate exception to AD-9's append-only rule)

**Given** a correction row (a signed delta on top of an original Purchase)
**When** the pending-pricing count, the Movements badge, or the pricing-completion page considers it
**Then** it is excluded — a correction never carries its own pricing, so it can never be "pending" and never accepts a direct price

## References

- `_bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/.working/simplicity-mockups.html` — Section 8 (Supervisor form without prices, Owner pricing queue)
- `_bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/EXPERIENCE.md` — Component Patterns row "Pricing pending (D7)"
- `AGENTS.md` — Policy section, the documented AD-9 exception
- `infra/prisma/migrations/20260901165103_purchase_pricing_optional/`, `20260902000100_purchase_pricing_group_check/`
- `packages/shared/src/schemas/purchase.ts` (`completePurchasePricingSchema`, the all-or-none pricing-group refinement)
- `apps/api/src/inventory/purchases.controller.ts`, `purchases.service.ts` (`completePricing`, `countPendingPricing`)
- `apps/web/app/(app)/movements/purchases/purchase-form.tsx` (`showPricing` prop), `[id]/pricing/**`, `movements-list-client.tsx`, `_components/owner-dashboard.tsx`, `vendors/[id]/page.tsx`

## Review Findings (code review 2026-09-02, commit b6c0950)

- [x] [Review][Patch] `completePricing` was check-then-act (separate `findUnique` then `update`) — two concurrent PATCHes could both pass the null check and the second would silently overwrite the first's recorded pricing, breaching the "exactly once" contract this story's own AC promises; now a conditional `updateMany({ where: { id, totalAmount: null } })`, atomic by construction [purchases.service.ts]
- [x] [Review][Patch] Correction rows (a signed delta, `totalAmount` also null) were counted as pending, flagged on the Movements list, and offered "Add Pricing" — pricing one would compute a nonsense total from a negative delta quantity; now excluded from `countPendingPricing`, the Movements badge/action, and the pricing page (which redirects if a correction row is opened) [purchases.service.ts, movements-list-client.tsx, pricing/page.tsx]
- [x] [Review][Patch] The Vendor detail page still rendered an unpriced Purchase's amount as `Number(null).toLocaleString()` → the literal "₹0" this story's own AC bans, with a blank payment-status badge — now a "Pricing pending" badge and an amount dash [vendors/[id]/page.tsx]
- [x] [Review][Patch] `PricingForm` skipped the FR-54 confirmation every other money-bearing submission in the product has — added the same `ConfirmDialog`/`useSubmitConfirmation` pattern, replaying Rate/Total/Payment Status before submit [pricing-form.tsx]
- [x] [Review][Patch] The all-or-none pricing-group invariant (rate/totalAmount/paymentStatus travel together) was enforced only by Zod — a direct DB write could store a half-priced row; added `CHECK ((rate IS NULL) = (totalAmount IS NULL)) AND ((paymentStatus IS NULL) = (totalAmount IS NULL))` [migration 20260902000100]
- [x] [Review][Patch] `PATCH /purchases/:id/pricing`'s `@Roles('OWNER_ADMIN')` guard — the actual boundary this story's split depends on — had no test verifying the decorator was present; a deleted line would have shipped silently. Added `Reflect.getMetadata(ROLES_KEY, …)` assertion plus delegation tests for `completePricing`/`countPendingPricing`, matching the repo's existing convention for role-gated endpoints [purchases.controller.spec.ts]
- [x] [Review][Patch] The entire pricing-completion web flow (action, page, form, and the Movements list's pending badge/action) shipped with zero tests — a broken PATCH method or a flipped role check would have passed CI; added `actions.test.ts`, `pricing-form.test.tsx`, `parse.test.ts`, and `movements-list-client.test.tsx` cases covering the badge, the role-gated action, and correction-row exclusion
- [x] [Review][Defer] `POST /purchases` still accepts `rate`/`totalAmount`/`paymentStatus` from a Site Supervisor at the API layer — this story's Supervisor/Owner split is enforced by the UI hiding the fields (and a client-supplied `pricingShown` flag), not by a server-side role check on the create path — see `deferred-work.md` DW-CR-1
- [x] [Review][Defer] Pricing an original Purchase that already has quantity-correction rows against it prices the Supervisor's gate-recorded quantity, not the net corrected quantity — the pricing page shows the original read-only; whether Total should derive from the net quantity is an open product decision — see `deferred-work.md` DW-CR-3
- [x] [Review][Defer] No `pricedAt`/`pricedByUserId` columns — pricing attribution is only derivable from the audit log's `PATCH` entry, not a first-class field on the row — see `deferred-work.md` DW-CR-9
