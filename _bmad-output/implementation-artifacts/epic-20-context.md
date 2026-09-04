# Epic 20 Context: Android App Distribution (TWA, Multi-Tenant)

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Give each Tenant a real, installable Android app — own launcher icon, own splash screen, full-screen with no browser chrome — without building or maintaining a second UI codebase. `apps/web` is already a working installable PWA (manifest, service worker, per-tenant icon rendering); this epic wraps that existing PWA in a Trusted Web Activity (TWA), a thin native Android shell that renders the live site through Chrome's engine with the browser UI stripped away. Distribution is manual: a signed APK handed directly to each Tenant, not published to the Play Store — the product's original "no native app" decision was later narrowed to "no *Play Store* app" when the installable PWA shipped, and this epic delivers the remaining native-shell piece without reopening that boundary. Because every Tenant is its own deployment, the Android app follows the same rule as everything else in the system: one reusable wrapper template, built per Tenant from that Tenant's own domain and branding, never a shared cross-tenant app.

Wrapping the PWA adds no native capability beyond what the browser already does — these limitations are pre-existing and carry over unchanged into the APK, not regressions introduced by this epic: no Background Sync for the offline Daily Report queue (the service worker still can't mint the auth token, so the queue drains via the foreground online-event handler); first-ever launch requires network connectivity (no bundled UI, so a device with no connectivity and no prior launch won't see the app's own offline fallback); no auto-update channel for shell-level changes (icon/name/domain changes require a rebuilt, manually redistributed APK — content updates are free since it's the same live site); and Android shows a one-time-per-device "install unknown apps" warning on sideload, expected behavior to explain to the client, not a defect.

## Stories

Ordered so the shared build/signing primitive ships before the per-tenant surfaces that consume it.

- Story 20.1: TWA Wrapper Build Template & Signing Key
- Story 20.2: Per-Tenant Digital Asset Link Verification
- Story 20.3: Tenant-Branded APK Generation
- Story 20.4: Provisioning Pipeline Integration
- Story 20.5: Manual QA Parity Pass Inside the Wrapped Shell
- Story 20.6: Manual Distribution Runbook

## Requirements & Constraints

- Tenant provisioning is a scripted procedure, never a manual/console step or an in-app action by any role; the Android build is a step inside that same script, not a separate task someone has to remember to run.
- Every Tenant operates within its own isolated deployment boundary; no feature, config, or credential may cross that boundary — the Android build/signing tooling is shared *tooling* (like the provisioning script itself), never a shared *runtime* concept.
- Offline Daily Report submission (queue on-device, sync automatically on reconnect, clear pending-vs-synced state, per-sub-record idempotency) must behave identically inside the wrapped app as it does in the browser — this is an existing guarantee the TWA must not silently break, not new scope.
- Automated report delivery (WhatsApp/Email/in-app, retried on failure, visibly surfaced if it ultimately fails) is the existing channel this epic's distribution runbook should reuse for handing a Tenant their APK, rather than inventing an ad hoc delivery method per Tenant.
- The product's mobile operating environment target (low-end Android phone, degraded connectivity) applies unchanged to the wrapped app — it is the same rendering surface, not a new one to re-validate against different assumptions.
- Deferred, explicitly out of scope for this epic: Play Store listing/distribution, Web Push/FCM notifications, and any native-shell upgrade (e.g. Capacitor) to work around the Background Sync gap.

## Technical Decisions

- Tenant isolation by deployment (no shared "current tenant" concept, no cross-tenant config) is unaffected and reinforced: each Tenant's `assetlinks.json` is served only from that Tenant's own deployment, and each APK is built against exactly one Tenant's domain and branding.
- Onboarding-as-a-script is extended, not replaced: the Android build step plugs into the existing `infra/provisioning/provision.ts` procedure. A failure at that step must surface loudly and halt provisioning — never silently skip the APK and complete as if it succeeded (mirrors the existing "a failed migration fails the build" principle).
- The API-is-the-only-database-client boundary is unaffected: the TWA is a native rendering shell around the existing web app with no new data access of its own.
- The "no in-app cross-tenant Platform Operator" boundary is unaffected: building/distributing a Tenant's APK is credential-level tooling run by the team, the same boundary already drawn around `infra/provisioning/` — not a new in-app role or screen.
- No parallel branding or caching config is introduced for Android: the existing web manifest, per-tenant icon route, tenant branding constants (display name/theme color), and service worker remain the sole source of the installed app's identity and offline behavior.
- Tooling: Bubblewrap (Google's official TWA CLI) — scriptable/non-interactive, generates and signs the Android project from a manifest URL with no Android Studio GUI steps.
- Repo location: `infra/android/`, sibling to `infra/provisioning/`/`infra/tenants/`/`infra/prisma/` — the existing convention for tooling that spans or targets a Tenant deployment. `infra/android/template/` holds the checked-in Bubblewrap-generated wrapper project skeleton; `infra/android/build.ts` consumes a Tenant's config plus the template to emit a signed APK, invoked both by provisioning and for ad hoc rebuilds.
- Per-Tenant package naming: a new `androidPackageId` field on each `infra/tenants/<slug>.json` (e.g. `in.azentis.sandeep-enterprises`), explicit and stable per Tenant rather than derived implicitly from `slug` at build time — added to `_example.json` and existing tenant configs.
- Signing-key storage: one upload keystore (`.jks`), generated once, base64-encoded and stored as a deployment secret outside the repo (same convention as other per-deployment secrets) — never committed, decoded to a temp file only at build time. All Tenants' APKs are signed with this single shared key so the Digital Asset Link fingerprint is valid across all of them; it is one key to protect and rotate, not one per Tenant.

## Cross-Story Dependencies

- Story 20.1 is the shared foundation (build template + signing key); every other story in the epic consumes it.
- Story 20.2 and Story 20.3 both consume 20.1 and can proceed independently of each other.
- Story 20.4 consumes 20.1–20.3 (wires the completed build/branding/verification pieces into the provisioning script).
- Story 20.5 consumes 20.1–20.4 — it is a manual verification pass that requires a real APK built through the full pipeline, not new implementation work.
- Story 20.6 documents the end-to-end flow produced by 20.1–20.5 and ships no code; it is independent and can be written alongside 20.5.
