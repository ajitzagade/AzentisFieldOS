/*
 * Hand-authored service worker (story 1.9). Plain JS at the public root so it
 * registers at scope "/" and sidesteps the bundler entirely — no Serwist /
 * next-pwa / webpack plugin (Turbopack is Next 16's default and those tools
 * need a webpack plugin; see the story's Design Notes).
 *
 * Caching tiers (per the I/O & Edge-Case Matrix):
 *   - Precache the /offline fallback page on install.
 *   - Navigations: network-first; on network failure serve the cached /offline
 *     shell. Navigation RESPONSES ARE NEVER CACHED — apps/web server components
 *     render authenticated data into HTML (they call apps/api with a token), so
 *     caching a page could leak/stale another view. /offline is a static,
 *     unauthenticated page, safe to serve.
 *   - A closed allowlist of same-origin, genuinely-static, non-authenticated
 *     assets is cache-first (hashed/immutable build output + generated icons +
 *     manifest + favicon): /_next/static/, /_next/image, /icon, /apple-icon,
 *     /icons/, /manifest.webmanifest, /favicon.ico.
 *   - Everything else is NetworkOnly (never cached), which by construction
 *     covers all authenticated / auth-provider traffic:
 *       * any non-GET request,
 *       * any request carrying an Authorization header,
 *       * any cross-origin request — apps/api (NEXT_PUBLIC_API_URL) and Clerk
 *         (*.clerk.*, *.clerk.accounts.dev) are always a different origin than
 *         apps/web, so the same-origin gate already makes them NetworkOnly,
 *       * any other same-origin GET — critically the RSC route payloads Next's
 *         App Router fetches for client navigations/prefetches
 *         (e.g. GET /sites?_rsc=<hash>, header `RSC: 1`): these carry
 *         authenticated rendered page data, so they must NOT be cached. Only the
 *         static allowlist above is ever cached — a closed list, not a
 *         "cache anything that isn't obviously dynamic" heuristic.
 *     These pass straight through to the network and never touch Cache Storage.
 *
 * Deliberately NO Background Sync for DSR submission: a SW cannot mint the
 * per-request Clerk bearer token, so the foreground online-event drain
 * (lib/dsr-sync.ts) stays the cross-platform mechanism. This SW does not touch
 * the offline DSR queue at all.
 */

const CACHE_NAME = "azentis-shell-v1";
const OFFLINE_URL = "/offline";
const PRECACHE_URLS = [OFFLINE_URL];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

async function handleNavigation(request) {
  try {
    // Network-first: authenticated pages must always come from the network so
    // no stale/foreign data is shown. Success responses are intentionally not
    // written to the cache.
    return await fetch(request);
  } catch {
    const cache = await caches.open(CACHE_NAME);
    const offline = await cache.match(OFFLINE_URL);
    if (offline) {
      return offline;
    }
    // Precache miss (SW installed but activation raced the first offline open):
    // a minimal inline fallback beats the browser error page.
    return new Response(
      "<!doctype html><meta charset=utf-8><title>Offline</title><p>You are offline.</p>",
      { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
  }
}

// The closed allowlist of same-origin GET paths safe to cache (static,
// immutable/regenerated build output + generated icons + manifest + favicon).
// Anything not matching here is NetworkOnly — notably RSC route payloads, which
// carry authenticated page data.
function isCacheableStaticAsset(pathname) {
  return (
    pathname.startsWith("/_next/static/") ||
    pathname.startsWith("/_next/image") ||
    pathname.startsWith("/icons/") ||
    pathname === "/icon" ||
    pathname === "/apple-icon" ||
    pathname === "/manifest.webmanifest" ||
    pathname === "/favicon.ico"
  );
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) {
    return cached;
  }
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Offline with no cached copy — return a graceful error rather than letting
    // respondWith reject (which would surface the browser's failure state).
    return Response.error();
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // NetworkOnly guards — never intercept, never cache.
  if (request.method !== "GET") return; // non-GET (DSR POSTs etc.)
  if (request.headers.has("authorization")) return; // authenticated request

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // apps/api + Clerk are cross-origin

  if (request.mode === "navigate") {
    event.respondWith(handleNavigation(request));
    return;
  }

  if (isCacheableStaticAsset(url.pathname)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Any other same-origin GET — RSC route payloads (GET /sites?_rsc=<hash>,
  // header `RSC: 1`) and any other dynamic GET — is NetworkOnly. No respondWith:
  // the browser performs its normal network fetch and nothing is cached.
});
