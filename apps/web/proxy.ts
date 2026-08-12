import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Named proxy.ts, not middleware.ts — Next.js 16 renamed the file
// convention from Middleware to Proxy (functionality unchanged); Clerk's
// clerkMiddleware() still returns a plain (request, event) => response
// handler, which is exactly what a Proxy default export expects.
//
// Only /sign-in (and its Clerk-managed subroutes) is public — every other
// route, including the root, requires an authenticated session (AD-1: no
// tenant-selection step, straight to the app once signed in).
const isPublicRoute = createRouteMatcher(["/sign-in(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
};
