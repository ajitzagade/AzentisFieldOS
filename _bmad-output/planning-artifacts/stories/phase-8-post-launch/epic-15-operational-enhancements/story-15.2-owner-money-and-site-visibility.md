---
epic: 15
story: "15.2"
phase: "8 — Post-launch Enhancements"
title: Owner money & site visibility (Tier-1 safe UX pass)
status: Implemented 2026-08-30 (commits 48e856f, dd3a0aa, 120099d) — written retroactively alongside the build
---

# Story 15.2: Owner Money & Site Visibility

As the Owner/Admin,
I want the dashboard to show the money picture (month expenses, vendor outstanding, cash tied up) and each Site's page to show its stock, today's status, recent reports and photos,
So that I understand the business and any single Site in seconds without hunting through report tabs.

## Acceptance Criteria

**Given** the dashboard
**Then** a Money row shows Expenses This Month (with week + largest category), Vendor Outstanding (per-Vendor summaries summed), and Cash Tied Up (vendor dues + advances) — each degrading to an honest "—" on a failed read, never blanking the page

**Given** a Site detail page
**Then** it shows a "Today at this Site" panel (DSR status, crew and material-entry counts), current stock, the last 30 days of DSRs, the newest photos with a link to the full gallery, and quick actions that carry the Site into the entry forms pre-selected

**And** the Sites list shows a live "DSR today" status per Site; Daily Activity pages through past days via ?date=; Vendor detail shows the outstanding summary the list already computed; quantity labels restate the picked Material's unit; the DSR photo picker offers camera AND gallery
**And** the Financial report reads through corrections (superseded-DSR RMC/expense rows and restated Payments are excluded — no double-counting)

## References

- Product review §7 (P0/P1) + Appendix F safe-first tiers: `_bmad-output/reviews/product-ux-review-2026-08-29.md`
- FR-34/FR-35 (dashboard), FR-46 (financial report), FR-31 (site photos)
