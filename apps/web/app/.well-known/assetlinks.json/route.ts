import { ANDROID_PACKAGE_ID, ANDROID_SHA256_FINGERPRINT } from "../../../lib/tenant";

// Digital Asset Links statement (Google's fixed spec, not project-specific)
// so Chrome can verify Story 20.1's installed TWA owns this Tenant's own
// domain and render full-screen instead of falling back to a visible
// Custom Tab address bar. Baked in at this deployment's build time from
// lib/tenant.ts's two env-derived constants — never reads
// infra/tenants/*.json or any other Tenant's data at runtime (AD-1/AD-2).
// Static and unauthenticated: proxy.ts's matcher ("/((?!_next|api|.*\\..*).*)")
// already excludes any dot-containing path, so this is never redirected to
// /sign-in — same reason /manifest.webmanifest needs no allowlist entry.
export const dynamic = "force-static";

export function GET(): Response {
  if (!ANDROID_PACKAGE_ID || !ANDROID_SHA256_FINGERPRINT) {
    // Unconfigured deployment (e.g. local dev) — a valid, empty Digital
    // Asset Links statement. Verifies nothing, but is not an error: mirrors
    // APP_DISPLAY_NAME's fallback-not-throw behavior so this never 500s.
    return Response.json([]);
  }

  return Response.json([
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: ANDROID_PACKAGE_ID,
        sha256_cert_fingerprints: [ANDROID_SHA256_FINGERPRINT],
      },
    },
  ]);
}
