// Story 1.8 (AC #4): the ONE implementation of "call apps/api with the current
// Clerk session token attached" (AD-5 — one implementation, not N per call
// site). The client hook (use-authed-fetch.ts) and the server helper (api.ts)
// are thin bindings over this core: each supplies the right base URL and a
// `getToken` bound to its own Clerk context (browser `useAuth()` vs. server
// `auth()`). apps/web still never touches a DB directly — it only calls
// apps/api over HTTP (AD-3), now authenticated.

export type AuthedFetch = (
  path: string,
  init?: RequestInit,
) => Promise<Response>;

type TokenGetter = () => Promise<string | null>;

// The token is fetched FRESH on every call (getToken runs per request), never
// captured once. This is what keeps story 3.2's offline-queue sync correct: a
// DSR queued while signed-out-of-network attaches a current token when it
// finally drains, not a stale one from queue time.
export function createAuthedFetch(
  baseUrl: string,
  getToken: TokenGetter,
): AuthedFetch {
  return async (path, init) => {
    const token = await getToken();
    const headers = new Headers(init?.headers);
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return fetch(`${baseUrl}${path}`, { ...init, headers });
  };
}
