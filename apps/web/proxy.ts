import { NextResponse, type NextRequest } from "next/server";

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

export default function proxy(req: NextRequest) {
  if (isPublicRoute(req.nextUrl.pathname)) {
    return NextResponse.next();
  }
  const hasSession = Boolean(req.cookies.get("session")?.value);
  if (!hasSession) {
    const signInUrl = new URL("/sign-in", req.url);
    return NextResponse.redirect(signInUrl);
  }
  return NextResponse.next();
}

// Excludes /api/* (own thin routes like session-token/logout read the cookie
// themselves and must return real JSON/status codes, never a redirect).
export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
