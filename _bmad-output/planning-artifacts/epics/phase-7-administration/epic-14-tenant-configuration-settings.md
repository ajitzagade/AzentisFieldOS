---
epic: 14
phase: "7 — Administration"
status: not-started
---

# Epic 14: Tenant Configuration & Settings

## Goal

Owner/Admin configures company branding (reflected in the next generated report immediately), manages Users & Roles within the Tenant, and configures labour/machinery/vehicle/expense categories and notification/report delivery settings — all admin-configurable, none hardcoded.

## FRs Covered

- FR-47: Company/branding configuration; a change reflects in the next generated report with no separate publish step.
- FR-48: Users, Roles (Owner/Admin, Site Supervisor), and permissions within the Tenant.
- FR-49: Labour/machinery/vehicle/expense-category configuration.
- FR-50: Notification channel configuration (which channels receive automated reports, and to whom).
- FR-51: Report configuration (templates, frequency, recipients) independent of FR-50's daily-DSR delivery.

## Related Architecture Requirements

- AD-1/AD-11: Users & Roles here means the two in-Tenant roles only (Owner/Admin, Site Supervisor) — never a cross-tenant Platform Operator screen. Do not scope one, even as a "future-proofing" toggle.

## Implementation Notes

Epics 6, 8, and 11 seed their own default categories independently so they don't hard-block on this epic (see their Implementation Notes) — this epic adds the admin UI to manage those categories, plus branding and user/role management, which are genuinely this epic's own domain with no earlier substitute.

## Composition Reference

`ux-designs/ux-AzentisFieldOS-2026-08-12/mockups/17-settings.html`.
