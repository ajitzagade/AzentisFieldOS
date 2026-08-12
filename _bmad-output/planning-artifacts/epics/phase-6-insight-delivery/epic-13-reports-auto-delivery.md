---
epic: 13
phase: "6 — Insight & Delivery"
status: not-started
---

# Epic 13: Reports & Auto-Delivery

## Goal

Owner/Admin sees Site, Inventory, Labour, and Financial reports, filterable and Tenant-scoped; each day's branded report auto-compiles from that day's DSR and delivers automatically via WhatsApp/Email with no manual send step, retrying and surfacing failure rather than silently dropping.

## FRs Covered

- FR-32: Auto-compile a branded per-Site daily report from that day's DSR, reflecting the Tenant's own branding configuration.
- FR-33: Automated delivery via WhatsApp/Email/in-app, no manual send; failed delivery retries then surfaces in-app rather than silently dropping.
- FR-42: Site reports (DSR history, progress, activity history, photo history), filterable by date range.
- FR-43: Inventory reports (current/Godown/Site stock, consumption, purchase, movement, wastage, low-stock).
- FR-44: Labour reports (attendance, work history, payments, advance outstanding/adjustment history).
- FR-45: Machinery & Vehicle reports (usage, Site movement history, maintenance/repair history).
- FR-46: Financial reports (Site expenses, cost breakdowns by Material/Labour/RMC/Machinery/Vehicle).

## Related Architecture Requirements

- AD-13: Scheduled background work via Vercel Cron inside `apps/api`, no separate worker service — this is the report-generation/delivery epic AD-13 was written for.

## Related UX Design Requirements

UX-DR19 (no manual "Send Report" button anywhere — delivery is fully automatic, UI only shows status).

## Implementation Notes

Depends on Epic 3 (DSR) as the data source, which precedes it in sequence — no issue there. Branding is different: Epic 14 (branding config) comes *after* this epic in phase order, so this epic must NOT hard-depend on it. Tenant branding is modeled as a data record with sensible seeded defaults (Tenant name, neutral placeholder colors, no logo) from day one — the report renders correctly with defaults the moment this epic ships. Epic 14 later adds the admin UI to customize it; it doesn't gate this epic.

## Composition Reference

`ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/16-reports.html` — note the branded report preview card, styled to read as a distinct document from the surrounding app chrome.
