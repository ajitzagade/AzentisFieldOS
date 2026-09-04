---
epic: 20
story: "20.3"
phase: "8 — Post-launch Enhancements"
title: Tenant-Branded APK Generation
---

# Story 20.3: Tenant-Branded APK Generation

As Owner/Admin,
I want my Tenant's Android app to carry my own business's name, icon, and color — not a generic AzentisFieldOS default,
So that the app installed on my team's phones looks and feels like it's ours.

## Acceptance Criteria

**Given** a Tenant deployment's existing branding (`lib/tenant.ts`'s `APP_DISPLAY_NAME`/`BRAND_THEME_COLOR`, and the icon rendered by `app/icons/[icon]/route.tsx`)
**When** the APK is generated for that Tenant using Story 20.1's template
**Then** the installed app's launcher icon, app name, and splash screen match that Tenant's live web deployment exactly, with no separate branding configuration maintained in the Android layer

**Given** two different Tenants' APKs are built from the same template
**When** both are installed on different devices
**Then** each shows only its own Tenant's identity — no shared icon, name, or color ever leaks between them

**Given** a Tenant's branding is changed later at the web-deployment level
**When** that change happens after the APK was already distributed
**Then** the installed app's shell (icon/name) does not update automatically — this is the epic's documented "no auto-update for shell-level changes" limitation, not a bug in this story's implementation

## References

- Consumes Story 20.1's build template.
- Reuses `app/manifest.ts` / `app/icons/[icon]/route.tsx` as the single source of branding — adds no parallel branding config (see epic's "Related Architecture Requirements").
