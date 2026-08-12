---
epic: 13
story: "13.1"
phase: "6 — Insight & Delivery"
title: Auto-Compile & Deliver Branded Daily Report
---

# Story 13.1: Auto-Compile & Deliver Branded Daily Report

As Owner/Admin,
I want each day's branded per-Site report to compile automatically from that day's DSR and deliver via WhatsApp/Email with no manual send step,
So that I get the day's summary without asking anyone to send it, and it always reflects my Tenant's own branding.

## Acceptance Criteria

**Given** a Site's DSR is submitted and synced for a given day
**When** the scheduled compile runs (Vercel Cron, AD-13)
**Then** a branded report auto-generates reflecting the Tenant's branding configuration — seeded with sensible defaults (Tenant name, neutral placeholder colors, no logo) from day one, so this story doesn't hard-depend on Epic 14's admin UI — and delivers via the configured channel(s) with no manual "Send" action anywhere in the UI (FR-32, UX-DR19)

**Given** delivery fails
**When** the retry policy is exhausted
**Then** the failure surfaces in-app as a visible status, never silently dropped (FR-33)

## References

- FR-32, FR-33, AD-13
- `ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/16-reports.html` — branded report preview card
