---
epic: 1
story: "1.6"
phase: "1 — Foundation"
title: Application Shell & Navigation
---

# Story 1.6: Application Shell & Navigation

As an authenticated Owner/Admin,
I want a persistent sidebar grouped into Materials / People / Assets / Insights (plus Dashboard, Sites, Daily Activity, and Settings),
So that I can navigate to every part of the product without hunting for it.

## Acceptance Criteria

**Given** I am authenticated
**When** I view any desktop screen
**Then** the sidebar renders all 15 routed surfaces from `EXPERIENCE.md`'s Information Architecture table, grouped exactly as specified
**And** the current section shows an unambiguous active state (solid pill, not just a color change)
**And** on the Site Supervisor's mobile context, no sidebar renders — only the minimal top bar per `EXPERIENCE.md`'s Responsive & Platform rules
**And** every route without a real screen yet renders a real empty-state placeholder using the shared component, never a 404 or blank page

## References

- `ux-designs/ux-AzentisFieldOS-2026-08-12/EXPERIENCE.md` §Information Architecture, §Responsive & Platform
- `ux-designs/ux-AzentisFieldOS-2026-08-12/.working/_shared-kit.html` (sidebar nav wiring block)
