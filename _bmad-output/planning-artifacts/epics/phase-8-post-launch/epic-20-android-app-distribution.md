---
epic: 20
phase: "8 — Post-launch Enhancements"
status: backlog
---

# Epic 20: Android App Distribution (TWA, Multi-Tenant)

## Goal

Give each Tenant a real, installable Android app — own launcher icon, own splash screen, full-screen with no browser chrome — without building or maintaining a second UI codebase. `apps/web` is already a working installable PWA (`app/manifest.ts`, `public/sw.js`, per-tenant icon rendering via `app/icons/[icon]/route.tsx`); this epic wraps that existing PWA in a Trusted Web Activity (TWA) — a thin native Android shell that renders the live site through Chrome's engine with the browser UI stripped away. Distribution is manual: a signed APK handed directly to each Tenant, not published to the Play Store.

Because every Tenant is its own deployment (AD-1/AD-2), the Android app follows the same rule: one reusable wrapper *template*, built per Tenant from that Tenant's own domain and branding, never a shared cross-tenant app.

## Known Limitations — read before scoping any story

Wrapping the PWA does not add native capability. These are true today in the browser and remain true, unchanged, inside the APK:

- **No Background Sync for the offline Daily Report queue.** The service worker cannot mint the auth token, so the queue still drains via the foreground online-event handler (`lib/dsr-sync.ts`), not a background OS task. This is a pre-existing constraint (see AGENTS.md), not a regression introduced by this epic.
- **First-ever launch requires network connectivity.** The APK has no bundled UI — it's a live window onto the deployed site. A device that has never opened the app and has no connectivity will not see the app's own `/offline` fallback on that first launch.
- **No auto-update channel for shell-level changes.** Content/feature updates are free (same live site, no APK change needed). But changing the app's *shell* — icon, display name, target domain — requires building and manually redistributing a new APK; there is no Play Store to push it silently.
- **Android shows an "install unknown apps" warning on first sideload**, once per device/source. This is expected for any APK installed outside the Play Store and should be explained to the client beforehand (Story 20.6), not treated as a defect.

## Stories

Ordered so the shared build/signing primitive ships before the per-tenant surfaces that consume it.

- 20.1 TWA Wrapper Build Template & Signing Key (shared foundation — every other story consumes this)
- 20.2 Per-Tenant Digital Asset Link Verification (consumes 20.1)
- 20.3 Tenant-Branded APK Generation (consumes 20.1)
- 20.4 Provisioning Pipeline Integration (consumes 20.1–20.3)
- 20.5 Manual QA Parity Pass Inside the Wrapped Shell (consumes 20.1–20.4; drives a real built APK)
- 20.6 Manual Distribution Runbook (independent; can be written alongside 20.5)

**Deferred, not in scope:** Play Store listing/distribution, Web Push/FCM notifications, and any native-shell upgrade (e.g. Capacitor) to work around the Background Sync gap — all real future work if a hard requirement emerges, but none are needed for "installable, native-feeling Android app" as scoped here.

## Related Architecture Requirements

- AD-1/AD-2 unaffected and reinforced: no shared signing artifact, config, or app crosses a Tenant boundary at runtime — each Tenant's `assetlinks.json` is served from that Tenant's own deployment, and each APK is built against exactly one Tenant's domain and branding. The build *template* and signing *key* are shared tooling (like the provisioning script itself), not a shared runtime concept.
- AD-3 unaffected: `apps/web` gains no new data access — the TWA is a native rendering shell around the existing web app, nothing more.
- AD-11 unaffected: this introduces no in-app cross-tenant role or screen. Building and distributing a Tenant's APK is credential-level tooling run by the team (consistent with FR-52's provisioning-as-scripted-procedure), the same boundary already drawn around `infra/provisioning/`.
- Reuses existing surfaces without duplicating them: `app/manifest.ts`, `app/icons/[icon]/route.tsx` (`renderTenantIcon`), `lib/tenant.ts` (`APP_DISPLAY_NAME`/`BRAND_THEME_COLOR`), and `public/sw.js` are the sole source of the installed app's identity and offline behavior — this epic adds no parallel branding or caching config for Android.

## Implementation Notes

Recorded at sprint-planning time (2026-09-04) to close readiness-gate CONCERNS before Story 20.1 starts — these are build-tooling decisions, not product architecture, so they don't warrant a full architecture cycle or a new AD number.

- **Tooling**: [Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap) (Google's official TWA CLI) — scriptable/non-interactive, generates and signs the Android project from a manifest URL with no Android Studio GUI steps, satisfying Story 20.1's AC directly.
- **Repo location**: `infra/android/` — sibling to `infra/provisioning/`, `infra/tenants/`, `infra/prisma/`, consistent with the existing convention that `infra/` houses tooling that spans or targets a Tenant deployment rather than being one. `infra/android/template/` holds the checked-in Bubblewrap-generated wrapper project skeleton; `infra/android/build.ts` is the script that consumes a Tenant's config + the template to emit a signed APK (Story 20.1), invoked per-Tenant by both Story 20.4's provisioning step and ad hoc rebuilds.
- **Per-Tenant package naming**: a new `androidPackageId` field on `infra/tenants/<slug>.json` (e.g. `in.azentis.sandeep-enterprises`, mirroring the existing `<slug>.azentis.in` domain convention) — explicit and stable per Tenant, not derived implicitly from `slug` at build time. Story 20.3 adds this field to `infra/tenants/_example.json` and existing tenant configs.
- **Signing-key storage**: one upload keystore (`.jks`) generated once by Story 20.1, base64-encoded and stored as a deployment secret (alongside how `CLOUDINARY_*`/`DATABASE_URL` are already kept out of the repo per `_example.json`'s own "no secrets here" comment) — never committed, decoded to a temp file only at build time.
