---
title: 'Installable PWA (Android + iOS)'
type: 'feature'
created: '2026-08-26'
status: 'done'
review_loop_iteration: 0
baseline_commit: '215aa3ab80798738677387e164e927a4ecb3bd41'
context:
  - '_bmad-output/planning-artifacts/stories/phase-1-foundation/epic-1-platform-foundation-auth-design-system/story-1.9-installable-pwa.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The app is a plain Next.js web app — not installable, and with no service worker the app shell will not load offline at all, so field use on Android/iOS phones over poor site connectivity is fragile and non-app-like. Only DSR *data* queues offline today; the shell itself dies.

**Approach:** Add a web manifest, brand-teal maskable icons, iOS metadata, and a hand-authored (Turbopack-safe) service worker that caches the app shell for offline load while treating all Clerk/API/authenticated traffic as network-only. Add one client component that offers the Android install prompt and an iOS "Add to Home Screen" hint, reusing the shared Button.

## Boundaries & Constraints

**Always:**
- Reuse `@azentisfieldos/ui` `Button` for install/hint UI — no ad-hoc styling (AD-4/AD-5).
- Service worker is **NetworkOnly (never cached)** for: the `NEXT_PUBLIC_API_URL` host, Clerk hosts (`*.clerk.*`, `*.clerk.accounts.dev`), any request carrying an `Authorization` header, and any non-GET. Only same-origin static assets + the app shell / offline fallback are cached.
- Register the SW only in production builds; no-op in dev and test.
- Manifest `name`/`short_name` come from `APP_DISPLAY_NAME` (single binding); theme color comes from one shared `BRAND_THEME_COLOR` constant.
- Leave the existing offline DSR queue (`lib/offline-db.ts`, `lib/dsr-sync.ts`) and its foreground `online`-event drain unchanged.
- Must not regress the four Lighthouse categories below 0.95 on `/sign-in` (AD-15).

**Ask First:**
- Adding any new runtime dependency (e.g. a Serwist/PWA package) — default is a hand-authored SW with zero new deps.
- Swapping the generated placeholder icons for a real tenant logo asset.

**Never:**
- No Serwist / next-pwa / webpack-plugin PWA tooling (Turbopack-incompatible in this repo).
- No SW-based Background Sync for DSR submission — a SW cannot mint the required per-request Clerk bearer token; the foreground drain stays the mechanism on both platforms.
- No caching of authenticated or auth-provider responses (data-leak / stale-data risk).
- No web-push, no per-tenant logo-icon generation (Epic 14 / provisioning), no automated e2e install tests (Playwright not set up).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Manifest eval | Supported browser loads app | Valid manifest at `/manifest.webmanifest`: `display: standalone`, `start_url`/`scope`/`id` = `/`, any+maskable icons 192 & 512 | N/A |
| Android installable | `beforeinstallprompt` fires | In-app "Install app" Button appears; click calls the saved event's `prompt()` | User dismisses → hide affordance, do not nag |
| iOS not installed | iOS UA and not standalone | Dismissible "Add to Home Screen" hint (Share → Add to Home Screen) | Dismissal persisted in `localStorage`; never reshown |
| Already installed | `display-mode: standalone` / `navigator.standalone` | No install UI at all | N/A |
| Offline navigation | Device offline, user opens app | SW serves cached app shell; unresolved navigations fall back to the cached `/offline` page | Shell not yet cached → offline fallback page |
| API/Clerk via SW | Request to `NEXT_PUBLIC_API_URL` host, or has `Authorization`, or non-GET | NetworkOnly passthrough — never cached, never served from cache | Offline → fetch rejection bubbles to app (existing DSR queue handles submits) |
| SW in dev/test | `NODE_ENV !== 'production'` | Registration skipped entirely | N/A |

</frozen-after-approval>

## Code Map

- `apps/web/app/layout.tsx` — root (`ClerkProvider > html > body > {children}`). Add `metadata.manifest` + `appleWebApp`, a `viewport` export (`themeColor`, `viewportFit: "cover"`), mount `<PwaClient/>` in `<body>`. Only mount point that also covers `/sign-in`.
- `apps/web/lib/tenant.ts` — has `APP_DISPLAY_NAME` (`"Sandeep Enterprises"`); add `BRAND_THEME_COLOR = "#0F5257"` (light `--accent-teal-700`, `packages/ui/src/styles/theme.css:38`).
- `apps/web/app/manifest.ts` (new) — `MetadataRoute.Manifest` default export; served at `/manifest.webmanifest`.
- `apps/web/app/icon.tsx` + `apps/web/app/apple-icon.tsx` (new) — `next/og` `ImageResponse` icons (tenant initials on teal); apple 180×180; any+maskable 192/512 for the manifest (via `generateImageMetadata` or dedicated `app/icons/*` route handlers with stable URLs).
- `apps/web/public/sw.js` (new) — hand-authored SW (plain JS, root scope); tiers per I/O matrix.
- `apps/web/app/offline/page.tsx` (new) — static offline fallback, design-token styled, glossary tone.
- `apps/web/app/pwa-client.tsx` (new, `"use client"`) — prod-only SW registration + Android `beforeinstallprompt` button + iOS hint; reuse `Button` (`primary` install, `ghost` dismiss).
- `packages/ui/src/components/button.tsx` — reuse via `@azentisfieldos/ui`; variants `primary|secondary|ghost`, sizes `sm|md|lg`.
- `apps/web/lib/offline-db.ts`, `apps/web/lib/dsr-sync.ts` — **do not modify**; foreground drain preserved.
- `apps/web/vitest.config.mts` / `vitest.setup.ts` — jsdom, **no `globals`** (import from `vitest`), Clerk already mocked; tests colocated `*.test.ts(x)`.

## Tasks & Acceptance

**Execution:**
- [x] `apps/web/lib/tenant.ts` -- add exported `BRAND_THEME_COLOR` (`"#0F5257"`) -- one source for manifest + viewport theme color, per-tenant-ready alongside `APP_DISPLAY_NAME`.
- [x] `apps/web/app/manifest.ts` -- new `MetadataRoute.Manifest` (standalone; `start_url`/`scope`/`id` = `/`; `name`/`short_name` from `APP_DISPLAY_NAME`; `theme_color`/`background_color` = `BRAND_THEME_COLOR`; any+maskable icons 192 & 512) -- makes the app installable.
- [x] `apps/web/app/icon.tsx`, `apps/web/app/apple-icon.tsx` (+ maskable icon route(s) if needed) -- `ImageResponse` icons on brand teal with tenant initials, maskable-safe padding; sizes 192/512 + apple 180 -- no external/binary assets, per-tenant-ready.
- [x] `apps/web/public/sw.js` -- hand-authored service worker implementing the I/O-matrix caching tiers (precache offline fallback; network-first navigations; cache-first `/_next/static`; NetworkOnly for API/Clerk/Authorization/non-GET).
- [x] `apps/web/app/offline/page.tsx` -- offline fallback page using shared tokens/components.
- [x] `apps/web/app/pwa-client.tsx` -- client component: prod-only registration of `/sw.js`, Android install button (`beforeinstallprompt`), iOS add-to-home-screen hint (dismissal persisted); reuse `Button`.
- [x] `apps/web/app/layout.tsx` -- add `manifest` + `appleWebApp` metadata, `viewport` export (`themeColor` from `BRAND_THEME_COLOR`, `viewportFit: "cover"`), render `<PwaClient/>`.
- [x] `apps/web/app/manifest.test.ts` -- assert manifest shape: `name`/`short_name` = `APP_DISPLAY_NAME`, `display: standalone`, `start_url`/`scope` = `/`, and both 192 & 512 icons present with `any` and `maskable` purposes.
- [x] `apps/web/app/pwa-client.test.tsx` -- iOS hint shows on iOS-non-standalone, hidden when standalone, hidden after dismissal; Android button appears only after `beforeinstallprompt`; SW registration skipped when `NODE_ENV !== 'production'` (mock `navigator.serviceWorker`).
- [x] `apps/web/app/sw.test.ts` -- loads and drives the real `public/sw.js` in a mock ServiceWorkerGlobalScope; covers offline-navigation fallback + NetworkOnly for non-GET / `Authorization` / cross-origin / same-origin RSC payloads, and cache-first for `/_next/static` (matrix rows "Offline navigation" and "API/Clerk via SW").

**Acceptance Criteria:**
- Given a production build served with `next start`, when opened in Chrome, then the manifest + registered service worker satisfy the installability audit and the app launches standalone with the brand icon and title.
- Given the app is installed on Android and iOS, when opened offline, then the app shell loads from cache (never the browser error page) and any queued DSR still drains on reconnect via the existing foreground path.
- Given the service worker is active, when the app calls `apps/api` or Clerk, then those responses are never read from cache — Cache Storage contains no such entries.
- Given CI runs on this change, when lint/typecheck/test/Lighthouse execute, then all pass and no Lighthouse category on `/sign-in` drops below 0.95.

## Design Notes

- **Hand-authored SW, not Serwist/next-pwa:** Turbopack is Next 16's default bundler; those tools need a webpack plugin. A plain `public/sw.js` at root scope sidesteps the bundler entirely (no new deps). SW caching tiers are the I/O matrix rows: precache `/offline`; navigations network-first → `/offline`; `/_next/static` cache-first; API/Clerk/`Authorization`/non-GET NetworkOnly.
- **Background Sync deliberately omitted:** DSR POSTs need a fresh Clerk bearer minted by `useAuthedFetch` in page context; a SW has no token. Story 3.2's foreground `online` drain already covers reconnect on both platforms.
- **theme_color:** a manifest can't read a CSS var, so `BRAND_THEME_COLOR` (`#0F5257`, light-mode teal) is the single literal shared by manifest + viewport — acceptable because manifest/metadata are config, not component code (AD-4 unaffected).

## Verification

**Commands:**
- `pnpm --filter @azentisfieldos/web typecheck` -- expected: clean
- `pnpm --filter @azentisfieldos/web lint` -- expected: clean
- `pnpm --filter @azentisfieldos/web test` -- expected: all pass (incl. new manifest + pwa-client tests)
- `pnpm --filter @azentisfieldos/web build` -- expected: success (manifest route + icon routes compile)

**Manual checks:**
- Chrome DevTools → Application → Manifest (installable, icons render) and Service Workers (active); toggle Offline → a navigation serves the shell / `/offline`; Cache Storage shows no `apps/api` or Clerk entries.
- Real device: Android install prompt → standalone launch; iOS Share → Add to Home Screen → standalone launch with correct icon/title; airplane-mode open loads the shell.

## Suggested Review Order

**Service worker — cache policy (security-critical core)**

- Entry point: the fetch handler's NetworkOnly guards (non-GET / `Authorization` / cross-origin) then the closed static allowlist — this is the whole security design.
  [`sw.js:121`](../../apps/web/public/sw.js#L121)
- The closed allowlist that keeps RSC route payloads (authenticated) out of cache — the review fix.
  [`sw.js:90`](../../apps/web/public/sw.js#L90)
- Navigation network-first with `/offline` fallback; success responses are never cached.
  [`sw.js:65`](../../apps/web/public/sw.js#L65)
- `cacheFirst` with the offline-safe try/catch so an uncached asset offline degrades gracefully.
  [`sw.js:102`](../../apps/web/public/sw.js#L102)

**Install UX (client)**

- Prod-only SW registration + Android `beforeinstallprompt` + iOS hint + a11y banner — the client design intent.
  [`pwa-client.tsx:47`](../../apps/web/app/pwa-client.tsx#L47)
- iPadOS-on-Mac-UA detection so tablets still get the hint.
  [`pwa-client.tsx:37`](../../apps/web/app/pwa-client.tsx#L37)

**Manifest & icons (installability)**

- Manifest: standalone, single-binding name/theme, any+maskable icons.
  [`manifest.ts:9`](../../apps/web/app/manifest.ts#L9)
- Generated brand-teal icons; SSG route serves the four stable manifest URLs (`dynamicParams=false`).
  [`route.tsx:18`](../../apps/web/app/icons/[icon]/route.tsx#L18)
- Shared `ImageResponse` renderer (initials on teal, maskable padding).
  [`pwa-icon.tsx:1`](../../apps/web/lib/pwa-icon.tsx#L1)

**Layout wiring & config**

- Root layout: `manifest`/`appleWebApp`/`viewport` (`viewportFit: cover`) + `<PwaClient/>` mount.
  [`layout.tsx:24`](../../apps/web/app/layout.tsx#L24)
- Single-source brand constants (theme color + deduped description).
  [`tenant.ts:12`](../../apps/web/lib/tenant.ts#L12)
- Static, token-styled offline fallback page.
  [`offline/page.tsx:13`](../../apps/web/app/offline/page.tsx#L13)

**Tests (peripherals)**

- Real `sw.js` driven in a mock SW scope — offline fallback + NetworkOnly for auth/RSC/cross-origin.
  [`sw.test.ts:1`](../../apps/web/app/sw.test.ts#L1)
- Install-click, iOS dismiss, and install-UI gating.
  [`pwa-client.test.tsx:1`](../../apps/web/app/pwa-client.test.tsx#L1)
- Manifest shape + icons route param validation.
  [`manifest.test.ts:1`](../../apps/web/app/manifest.test.ts#L1)
