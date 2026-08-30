---
epic: 15
phase: "8 — Post-launch Enhancements"
status: done
---

# Epic 15: Operational Enhancements (Post-launch)

## Goal

Post-launch additions driven directly by the owner's day-to-day use of the live deployment: capture waste/debris disposal costs per trip and roll them into Site costs; give the Owner the money picture and per-Site control room the launch dashboard lacked; allow master data (Sites, Vendors) to be deleted softly with confirmation; suggest Team Members on receiver/person fields while accepting outside names; and trace every change to who made it, where, and when.

This epic was implemented before its stories were written — the stories (15.1–15.5) were authored retroactively on 2026-08-30 to keep the planning artifacts complete, each citing its implementing commit.

## Stories

- 15.1 Waste & Disposal (per-trip debris-removal cost) — commit 99d26bb
- 15.2 Owner money & site visibility (Tier-1 safe UX pass + financial-report correction fix) — commits 48e856f, dd3a0aa, 120099d
- 15.3 Soft delete for Sites and Vendors — commit b853c73
- 15.4 Audit trail — commit b853c73
- 15.5 Team-name suggestions on receiver/person fields — commit b853c73

## Related Architecture Requirements

- AD-9 extended: `WasteDisposal` joins the append-only transaction tables (corrections are signed-delta rows); `AuditLog` is write-once by construction; soft delete applies to master data ONLY — transaction rows remain correction-only, which is what makes the audit trail trustworthy.
- AD-5 extended: shared Button gains a `danger` variant; `DeleteEntityButton` is the single soft-delete affordance.

## Implementation Notes

Broader context, prioritization rationale, and the not-yet-built roadmap items (alert engine, vendor payments ledger, labour costing, supervisor field mode, role lockdown) live in `_bmad-output/reviews/product-ux-review-2026-08-29.md`.
