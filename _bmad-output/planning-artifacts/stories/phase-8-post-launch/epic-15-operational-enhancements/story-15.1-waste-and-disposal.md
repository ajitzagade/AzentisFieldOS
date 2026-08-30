---
epic: 15
story: "15.1"
phase: "8 — Post-launch Enhancements"
title: Waste & Disposal (per-trip debris-removal cost)
status: Implemented 2026-08-30 (commit 99d26bb) — written retroactively alongside the build
---

# Story 15.1: Waste & Disposal

As Owner/Admin or Site Supervisor,
I want to record each waste/debris disposal activity (Site, date, waste type, own or hired vehicle, party if hired, trips × rate per trip + other charges, dumping location, payment status),
So that the actual cost of removing waste from each Site is captured and rolls up into that Site's total cost.

## Acceptance Criteria

**Given** a disposal by a hired third party
**When** I record it with trips, rate per trip, and other charges
**Then** the total is computed by the system (trips × rate + other charges), never typed by me, and the entry carries the Vendor and a PAID/PARTIAL/UNPAID payment status

**Given** a disposal done with our own vehicle or machine
**When** I record it
**Then** no Vendor or payment status is required (or accepted), and the asset can be picked from the existing Machinery/Vehicle registers or described in free text

**Given** recorded disposals
**When** the Owner opens Waste & Disposal
**Then** they see total disposal cost, total trips, the own-vs-hired split, vendor-wise spend, cost by waste type, and a per-Site breakdown — all filterable by Site and date range

**And** Waste & Disposal appears as a Site-tagged category in the Financial report (per-Site rows and Contractor total) and in the Site activity feed
**And** the row's "Correct" action files a signed-delta correction (AD-9) — never Edit/Delete; a correction must match the original's Site, waste type, ownership, party, and rate

## References

- FR-46 (financial report category), AD-9 (append-only ledger)
- Reuses: Site pickers, Vendor master, Machinery/Vehicle registers, shared form/table components
- Plan history: `_bmad-output/reviews/dispatch-feature-plan-2026-08-30.md` (income-flow plan this cost-flow module superseded)
