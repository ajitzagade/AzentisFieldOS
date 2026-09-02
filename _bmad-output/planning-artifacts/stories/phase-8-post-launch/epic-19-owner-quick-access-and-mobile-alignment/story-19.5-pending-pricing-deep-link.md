---
epic: 19
story: "19.5"
phase: "8 — Post-launch Enhancements"
title: Pending-Pricing Deep Link
---

# Story 19.5: Pending-Pricing Deep Link

As Owner/Admin,
I want the Dashboard's pending-pricing gap-flag to take me straight to the record(s) needing pricing,
So that I don't have to scan an unfiltered Movements list for the "Pricing pending" badge.

## Acceptance Criteria

**Given** exactly one Purchase has pending pricing
**When** I click the gap-flag's action button
**Then** I land directly on `/movements/purchases/:id/pricing` for that specific record

**Given** more than one Purchase has pending pricing
**When** I click the gap-flag's action button (labeled "Review & Price")
**Then** I land on `/movements` with a "Pricing pending" tab pre-selected, showing only unpriced entries — not the full unfiltered log

**Given** zero Purchases have pending pricing
**When** the Dashboard renders
**Then** the gap-flag does not appear (existing behavior, unchanged)

**Given** the "Pricing pending" tab is active on Movements
**When** the list renders
**Then** already-priced entries are excluded — never mixed with pending ones

**Given** a Purchase's pending-pricing state changes (priced, or corrected)
**When** the pending count is next read
**Then** it reflects the change immediately — no stale count (existing `GET /purchases/count/pending-pricing` contract, unchanged)

## References

- `_bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/24-owner-quick-access-and-mobile-alignment.html` — D2
- `_bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/EXPERIENCE.md` — Component Patterns row "Pricing pending (D7)" (extended by this story, not replaced)
- `apps/web/app/(app)/_components/owner-dashboard.tsx` (gap-flag currently links to `/movements?type=PURCHASE`)
- `apps/web/app/(app)/movements/movements-list-client.tsx` (needs a "Pricing pending" filter/tab)
