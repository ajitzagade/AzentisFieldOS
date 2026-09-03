import { cache } from "react";
import { authedFetch } from "@/lib/api";
import { APP_DISPLAY_NAME } from "@/lib/tenant";

// The live, DB-backed org name (BrandingConfig.tenantName) for every
// authenticated page's chrome (sidebar, tab title) — so a Settings >
// Branding save reflects immediately instead of only affecting the report
// preview and generated reports (which already read this same row). The
// sign-in page can't do this same fetch (it renders before a session
// exists), so it and this helper's failure path both fall back to the
// same build-time APP_DISPLAY_NAME. cache() dedupes the fetch per request,
// same reasoning as currentRole() alongside it.
export const currentTenantName = cache(async (): Promise<string> => {
  try {
    const res = await authedFetch("/branding-config", { cache: "no-store" });
    if (res.ok) {
      const config = (await res.json()) as { tenantName?: string };
      return config.tenantName?.trim() || APP_DISPLAY_NAME;
    }
  } catch {
    // fall through to the build-time default below
  }
  return APP_DISPLAY_NAME;
});
