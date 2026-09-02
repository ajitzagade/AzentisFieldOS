// The ONE place both auth cookies' names/options/lifetimes are defined
// (AD-5's "one implementation" spirit applied to cookie handling) — the
// sign-in Server Action, the refresh route handler, and middleware.ts all
// call setAuthCookies() instead of hand-rolling cookies().set() three times
// with a chance to drift out of sync.
//
// `session` carries the short-lived access JWT and is intentionally NOT
// httpOnly: apps/web's client-side authed-fetch (lib/use-authed-fetch.ts)
// reads it directly to attach a Bearer token on direct cross-origin calls to
// apps/api. Its maxAge equals apps/api's access-token expiry, so the browser
// itself drops the cookie the moment the JWT would fail verification anyway.
//
// `refresh_token` IS httpOnly — it never needs to be read by browser JS
// (only same-origin Next.js code reads it: middleware.ts and
// app/api/auth/refresh/route.ts), so it never has to be exposed to an XSS
// payload the way the old 30-day session token was.
export const SESSION_COOKIE_MAX_AGE = 60 * 60; // 1h, matches apps/api's access-token expiry
export const REFRESH_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export interface AuthTokens {
  token: string;
  refreshToken: string;
}

interface CookieSetter {
  set(name: string, value: string, options?: Record<string, unknown>): void;
}

export function setAuthCookies(cookieStore: CookieSetter, tokens: AuthTokens): void {
  cookieStore.set("session", tokens.token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_COOKIE_MAX_AGE,
  });
  cookieStore.set("refresh_token", tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: REFRESH_COOKIE_MAX_AGE,
  });
}

export function clearAuthCookies(cookieStore: { delete(name: string): void }): void {
  cookieStore.delete("session");
  cookieStore.delete("refresh_token");
}
