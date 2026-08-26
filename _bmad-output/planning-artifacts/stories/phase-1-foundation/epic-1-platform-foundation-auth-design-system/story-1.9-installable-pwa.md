---
epic: 1
story: "1.9"
phase: "1 — Foundation"
title: Installable PWA (Android + iOS)
---

# Story 1.9: Installable PWA (Android + iOS)

As a Site Supervisor or Owner/Admin on a phone,
I want to install AzentisFieldOS to my home screen and have it open and work like a native app — including opening while offline,
So that field use on Android and iOS is fast, full-screen, and reliable on poor site connectivity.

## Context (why this story exists)

The app is currently a plain Next.js 16 web app with **no PWA capability**:

- No web manifest, no service worker, no app icons (only `apps/web/app/favicon.ico`); `apps/web/next.config.ts` is empty.
- Offline data plumbing already exists but is **foreground-only**: `apps/web/lib/offline-db.ts` (IndexedDB queue) + `apps/web/lib/dsr-sync.ts` drain the queue on `window` `online` events (see `apps/web/app/dsr/new/page.tsx`). Because there is no service worker, **the app shell itself does not load offline**, and the app is **not installable** on either platform.
- Tenant identity is a single binding: `APP_DISPLAY_NAME` (`apps/web/lib/tenant.ts`); brand color is `#0F5257` (the `BrandingConfig.primaryColor` default / accent-teal-700 token).

This story makes the whole app an installable, offline-capable PWA on both Android (Chromium) and iOS (Safari), reusing the existing offline queue rather than replacing it.

## Dependencies / sequencing

- **Runs after Story 1.8 (API Session Authentication).** Both edit `apps/web/app/layout.tsx` and `apps/web/next.config.ts`, and — critically — the service worker's cache rules must be written against the real Clerk/API auth setup so it **never caches authenticated responses**. Do not start until 1.8 is merged (or coordinate to avoid conflicts).

## Acceptance Criteria

**Given** the app is opened in a supporting mobile browser
**When** the browser evaluates installability
**Then** a valid **web app manifest** is served (`display: standalone`, `start_url: "/"`, `scope: "/"`, `id: "/"`, `name`/`short_name` from `APP_DISPLAY_NAME`, `theme_color`/`background_color` = `#0F5257`) with **maskable + any-purpose icons at 192×192 and 512×512**
**And** a registered **service worker** controls the page in production builds

**Given** an Android/Chromium device
**When** the app becomes installable
**Then** a subtle in-app "Install app" affordance appears (driven by the captured `beforeinstallprompt` event), built from the shared `packages/ui` button primitive (AD-5) — no ad-hoc styling (AD-4)
**And** installing launches the app standalone (no browser chrome) with the correct icon and splash

**Given** an iOS Safari device (which exposes no `beforeinstallprompt`)
**When** the user has not already installed the app
**Then** a lightweight, dismissible **"Add to Home Screen" hint** is shown (Share → Add to Home Screen), suppressed when already running standalone (`navigator.standalone` / `display-mode: standalone`)
**And** an `apple-touch-icon` (180×180) and `appleWebApp` metadata (capable, title = `APP_DISPLAY_NAME`, status-bar style) are present so the installed iOS app has the right icon, title, and full-screen chrome
**And** the viewport uses `viewport-fit=cover` so content renders correctly on notched/dynamic-island devices

**Given** the device is offline
**When** the user opens the installed app
**Then** the **app shell loads from the service-worker cache** (an offline-capable navigation fallback), rather than the browser's dinosaur/error page
**And** the existing offline DSR queue behaviour is unchanged — queued submissions still drain on reconnect via the current foreground `online`-event path (`dsr-sync.ts`), which remains the **cross-platform baseline** (iOS has no Background Sync API)

**Given** the service worker is active
**When** it handles fetches
**Then** it **never caches** authenticated or auth-provider traffic — the `apps/api` host (`NEXT_PUBLIC_API_URL`), all Clerk endpoints, and any request carrying an `Authorization` header are **NetworkOnly** (no stale or cross-user data can ever be served from cache). Only the static app shell / build assets and public routes are cached.

**Given** CI runs on this change
**When** Lighthouse and the lint/typecheck/test gates run
**Then** none of the four scored Lighthouse categories (Performance / Accessibility / Best Practices / SEO) regress below 0.95 (AD-15), and the added service worker/manifest does not break the `/sign-in` audit

## Technical Notes

### Manifest + metadata (`apps/web`)
- Add `apps/web/app/manifest.ts` (`MetadataRoute.Manifest`) reading `APP_DISPLAY_NAME` for `name`/`short_name` (keep the single-binding pattern — do not hardcode the tenant name). `theme_color`/`background_color`: `#0F5257` (mirror `BrandingConfig` default; not a new arbitrary literal).
- Extend `apps/web/app/layout.tsx`:
  - `metadata.manifest`, `metadata.appleWebApp` (`{ capable: true, title: APP_DISPLAY_NAME, statusBarStyle: "default" }`).
  - export `viewport` with `themeColor: "#0F5257"` and `viewportFit: "cover"`.
- Icons: generate **maskable-safe** icons (192, 512) + apple-touch (180) on the brand teal. No logo asset exists yet — generate placeholder icons (e.g. tenant initials on `#0F5257`, matching how `BrandingConfig` defaults to teal). Either static PNGs in `apps/web/public/` **or** Next `ImageResponse` routes (`app/icon.tsx` / `app/apple-icon.tsx`) — implementer's choice; ImageResponse keeps zero binary assets and is per-tenant-ready. Manifest `icons` must reference stable URLs with correct `sizes`/`purpose`.

### Service worker
- Prefer **Serwist (`@serwist/next`)** — the maintained App-Router successor to `next-pwa`. **Verify Turbopack compatibility** against this repo's Next 16.3 build first; if Serwist + Turbopack does not integrate cleanly, fall back to a **minimal hand-authored service worker** registered by a small client component in the layout. Either way, **disable the SW in dev** to avoid caching friction.
- Cache strategy:
  - **Precache** the static app shell / build assets.
  - **Navigations**: network-first with an offline navigation fallback so the shell opens offline.
  - **NetworkOnly (never cached)**: `NEXT_PUBLIC_API_URL` host, Clerk endpoints (`*.clerk.*`, Clerk frontend/api hosts), and any request with an `Authorization` header. This is a security requirement, not an optimization — auth'd/API responses must never be served from cache.
- **Do not remove or rewrite** `lib/offline-db.ts` / `lib/dsr-sync.ts`. Progressive enhancement only: optionally add a Background Sync (`sync`) handler for Android/Chromium to drain the queue in the background, but the foreground `online`-event drain stays as the iOS-safe baseline.

### Install UX
- Android/Chromium: capture `beforeinstallprompt`, gate a shared-UI "Install app" button, call `prompt()` on click.
- iOS Safari: detect iOS + not-standalone, show a dismissible "Add to Home Screen" hint (remember dismissal). Both suppressed when already installed.

### Tests (Vitest, jsdom)
- `app/manifest.ts` output: correct `name`/`short_name` (from `APP_DISPLAY_NAME`), `display: standalone`, `start_url`/`scope`, and 192/512 maskable icons.
- SW registration component: registers only in production, no-ops in dev/test.
- Install-hint component: shows on iOS-non-standalone, hidden when standalone, hidden after dismissal; Android affordance appears only after `beforeinstallprompt`.
- Keep on Vitest (`pnpm --filter @azentisfieldos/web test`).

## Verification (partly manual — no device farm / Playwright yet)
- Chrome DevTools → Application → Manifest & Service Workers: installable, SW active, offline navigation serves the shell.
- Real-device checks: Android install prompt + standalone launch; iOS Share → Add to Home Screen → standalone launch with correct icon/title; airplane-mode app open loads the shell; queued DSR drains on reconnect on both platforms.
- Confirm no Clerk/`/api` response is present in Cache Storage.

## Out of scope
- Per-tenant icon/name generation from `BrandingConfig` at provision/build time — ties into **Epic 14 branding** + `infra/provisioning`; this story ships the `APP_DISPLAY_NAME`/teal default.
- Web push notifications (separate feature; iOS 16.4+ only for installed PWAs).
- Automated e2e install/offline tests (blocked on the Playwright TODO).

## References
- Architecture AD-4 (design tokens, no literal styling), AD-5 (one shared primitive per UI element), AD-15 (Lighthouse ≥0.95 gate)
- `apps/web/lib/offline-db.ts`, `apps/web/lib/dsr-sync.ts`, `apps/web/app/dsr/new/page.tsx` (existing offline queue — reuse, don't replace)
- `apps/web/lib/tenant.ts` (`APP_DISPLAY_NAME`), `BrandingConfig.primaryColor` default `#0F5257`
- Story 1.8 (auth) — sequencing dependency; SW must not cache authenticated traffic
