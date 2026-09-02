// The ONE implementation of "call apps/api with the current session token
// attached" (AD-5 — one implementation, not N per call site). The client
// hook (use-authed-fetch.ts) and the server helper (api.ts) are thin
// bindings over this core: each supplies the right base URL and a
// `getToken` bound to its own token source (browser cookie read vs. server
// cookie read). apps/web still never touches a DB directly — it only calls
// apps/api over HTTP (AD-3), now authenticated.

export type AuthedFetch = (
  path: string,
  init?: RequestInit,
) => Promise<Response>;

type TokenGetter = () => Promise<string | null>;
// Returns true if a fresh access token is now available (retry the call),
// false otherwise (propagate the 401 as-is). Only the client binding
// (use-authed-fetch.ts) supplies one — the short (1h) access token means a
// mid-session 401 is now an expected event, not just an auth failure, so the
// client path gets one automatic retry instead of surfacing an error the
// user would read as "signed out" every hour.
type UnauthorizedHandler = () => Promise<boolean>;

// The token is fetched FRESH on every call (getToken runs per request), never
// captured once. This is what keeps story 3.2's offline-queue sync correct: a
// DSR queued while signed-out-of-network attaches a current token when it
// finally drains, not a stale one from queue time.
export function createAuthedFetch(
  baseUrl: string,
  getToken: TokenGetter,
  onUnauthorized?: UnauthorizedHandler,
): AuthedFetch {
  const attach = async (init?: RequestInit): Promise<RequestInit> => {
    const token = await getToken();
    const headers = new Headers(init?.headers);
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return { ...init, headers };
  };

  return async (path, init) => {
    const response = await fetch(`${baseUrl}${path}`, await attach(init));
    if (response.status !== 401 || !onUnauthorized) {
      return response;
    }
    const refreshed = await onUnauthorized();
    if (!refreshed) {
      return response;
    }
    return fetch(`${baseUrl}${path}`, await attach(init));
  };
}
