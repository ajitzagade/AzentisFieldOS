---
epic: 17
story: "17.1"
phase: "8 — Post-launch Enhancements"
title: Supervisor Home & Task-First Navigation
---

# Story 17.1: Supervisor Home & Task-First Navigation

As a Site Supervisor,
I want to open the app and immediately see the handful of things I actually do every day, one tap away, instead of the Owner's cross-Site financial dashboard behind a hamburger menu,
So that I can start today's Daily Report — or any other daily task — without hunting for it or asking someone where it is.

## Acceptance Criteria

**Given** I am a Site Supervisor and open the app
**When** the landing page (`/`) loads
**Then** I see a task-first Home — a full-width "Start Daily Report" hero card, a two-up grid of Material Received / Material Sent / Material Used / Attendance / Site Photos, and a "More" list for less-frequent entries (Wastage/Return, RMC Delivery, Expense) — never the Owner's rollup

**Given** one or more Sites have not yet submitted today's Daily Report
**When** Home renders
**Then** I see one gap-flag banner per missing Site, each naming that Site and deep-linking "Start Daily Report" to it (`?siteId=`) — never a single banner listing every Site at once

**Given** every Site has reported today, or the tenant has zero Sites
**When** Home renders
**Then** the "Every site has submitted" success line shows only when at least one Site genuinely reported today — never a false success message on a zero-Sites tenant

**Given** I am a Site Supervisor
**When** I open the sidebar (desktop) or drawer (mobile)
**Then** I see a trimmed 7-item nav (Home, Sites, Daily Report, Inventory, Movements, Waste & Disposal, Team & Attendance, Help) — Owner-oriented surfaces (Vendors, Payments, Expenses, RMC, Reports, Machinery, Settings) are not listed here, but remain reachable via Home's "More" list or a direct URL (trimming is de-emphasis, never removal — no capability is lost)

**Given** I am on a phone below `lg` width
**When** any screen renders
**Then** a fixed bottom quick-bar (Home · Report · Materials · Help) is visible, with "Report" deep-linking straight to `/dsr/new`

**Given** I am Owner/Admin
**When** I open the app
**Then** the Dashboard is unchanged — full sidebar, cross-Site Today/Money/Overall rollup — with one addition: a "New Daily Report" button in the header

## References

- `_bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/.working/simplicity-mockups.html` — Section 1 (Home layout 1A vs 1B), Section 2 (nav trim), Section 7 (desktop)
- `_bmad-output/planning-artifacts/ux-designs/ux-AzentisFieldOS-2026-08-12/EXPERIENCE.md` — "2026-09-01 simplicity revision" IA note; Component Patterns rows "Supervisor Home task card" and "Bottom quick-bar"
- `apps/web/app/(app)/_components/supervisor-home.tsx`, `owner-dashboard.tsx`, `app-shell.tsx`, `nav-config.ts` (`SUPERVISOR_*` exports)
- `apps/web/lib/current-role.ts` — wrapped in React `cache()` so the shell and the landing page can never resolve different roles for the same request

## Review Findings (code review 2026-09-02, commit b6c0950)

- [x] [Review][Patch] Supervisor Home joined every missing Site into one gap-flag message, violating FR-35's per-Site rule the Owner Dashboard itself follows — now one `GapFlag` per Site, each deep-linking `?siteId=` [supervisor-home.tsx]
- [x] [Review][Patch] Zero-Sites tenant read a false "every site has submitted" success line — success now requires `sitesReportingToday > 0` [supervisor-home.tsx]
- [x] [Review][Patch] `HERO_TASK.icon` was dead data — the hero card hardcoded `ClipboardIcon` instead of rendering the constant [supervisor-home.tsx]
- [x] [Review][Patch] `currentRole()` was fetched independently by both `layout.tsx` and `page.tsx` — a transient failure on either could render the Owner rail around Supervisor content or vice versa; wrapped in React `cache()` to dedupe per request [current-role.ts]
- [x] [Review][Patch] The quick-bar and the Owner-Dashboard pending-pricing flag shipped with zero test coverage (a deleted line would pass every existing test) — added `app-shell.test.tsx` quick-bar assertions and `page.test.tsx` cases for both Supervisor-Home branches
- [x] [Review][Defer] `currentRole()` folds any `/users/me` failure (including an expired-session 401) into `SITE_SUPERVISOR` instead of redirecting to sign-in — pre-existing pattern, not introduced by this story — see `deferred-work.md` DW-CR-4
- [x] [Review][Defer] `OwnerDashboard`'s vendor-outstanding figure issues one unbounded parallel fetch per Vendor — fine at current scale, needs batching as Vendors grow — see `deferred-work.md` DW-CR-5
