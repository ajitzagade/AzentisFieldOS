import { NextResponse, type NextRequest } from "next/server";
import { setAuthCookies, clearAuthCookies, type AuthTokens } from "@/lib/auth-cookies";

// Named proxy.ts, not middleware.ts — Next.js 16 renamed the file
// convention from Middleware to Proxy (functionality unchanged).
//
// Only /sign-in is public — every other route, including the root, requires
// a session cookie (AD-1: no tenant-selection step, straight to the app once
// signed in). This is a cheap presence check for UX redirect purposes only —
// it does NOT verify the JWT's signature or expiry. The real security
// boundary is apps/api's CustomAuthGuard, which verifies the token on every
// request; a stale/expired cookie here just means the first API call fails
// and the page shows an error state, not a security hole.
const isPublicRoute = (pathname: string) => pathname.startsWith("/sign-in");

export default async function proxy(req: NextRequest) {
  if (isPublicRoute(req.nextUrl.pathname)) {
    return NextResponse.next();
  }
  if (req.cookies.get("session")?.value) {
    return NextResponse.next();
  }

  // The access token's own cookie maxAge equals its 1h JWT expiry, so a
  // missing `session` cookie here means either never signed in, or that
  // hour just elapsed. Try a silent refresh off the httpOnly refresh_token
  // before forcing a re-login — this is what makes the shortened access
  // token invisible to a user who's still within their 30-day window.
  const refreshToken = req.cookies.get("refresh_token")?.value;
  if (refreshToken) {
    try {
      const refreshRes = await fetch(`${process.env.API_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      if (refreshRes.ok) {
        const tokens = (await refreshRes.json()) as AuthTokens;
        const response = NextResponse.next();
        setAuthCookies(response.cookies, tokens);
        return response;
      }
    } catch {
      // apps/api unreachable — fall through to the sign-in redirect below,
      // same as any other transient failure.
    }
  }

  const signInUrl = new URL("/sign-in", req.url);
  const response = NextResponse.redirect(signInUrl);
  clearAuthCookies(response.cookies);
  return response;
}

// Excludes /api/* (own thin routes like session-token/logout read the cookie
// themselves and must return real JSON/status codes, never a redirect).
export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
