import { cookies } from "next/headers";
import { cache } from "react";
import { authedFetch } from "@/lib/api";
import { APP_DISPLAY_NAME } from "@/lib/tenant";

export interface Branding {
  tenantName: string;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

// Mirrors packages/ui/src/styles/theme.css's :root defaults for
// --accent-teal-700/--accent-navy-800/--gold-500 (and BrandingConfig's own
// Prisma @default values) — an unconfigured/unreachable deployment renders
// identically to the un-overridden design tokens, never a jarring fallback.
// Config defaults mirroring theme.css's :root values, not component styling
// (same AD-4 carve-out as BRAND_THEME_COLOR in lib/tenant.ts).
/* eslint-disable no-restricted-syntax */
const DEFAULT_BRANDING: Branding = {
  tenantName: APP_DISPLAY_NAME,
  logoUrl: null,
  primaryColor: "#0F5257",
  secondaryColor: "#16273E",
  accentColor: "#C7912B",
};
/* eslint-enable no-restricted-syntax */

// The live, DB-backed BrandingConfig row for every page's chrome — sidebar
// brand mark, tab title, and (via the root layout) the design tokens the
// whole app renders with — so a Settings > Branding save reflects
// immediately everywhere, not just the report preview and generated reports
// (which already read this same row). cache() dedupes the fetch per
// request: the root layout and the (app) layout both call this and only one
// network round-trip happens.
//
// The root layout calls this on EVERY route, including /sign-in, which
// renders before a session exists — skip the network round-trip entirely
// when there's no session cookie rather than firing a request guaranteed to
// 401 on every signed-out page view.
export const currentBranding = cache(async (): Promise<Branding> => {
  try {
    const cookieStore = await cookies();
    if (!cookieStore.get("session")?.value) return DEFAULT_BRANDING;

    const res = await authedFetch("/branding-config", { cache: "no-store" });
    if (res.ok) {
      const config = (await res.json()) as Partial<Branding>;
      return {
        tenantName: config.tenantName?.trim() || DEFAULT_BRANDING.tenantName,
        logoUrl: config.logoUrl ?? null,
        primaryColor: config.primaryColor || DEFAULT_BRANDING.primaryColor,
        secondaryColor: config.secondaryColor || DEFAULT_BRANDING.secondaryColor,
        accentColor: config.accentColor || DEFAULT_BRANDING.accentColor,
      };
    }
  } catch {
    // fall through to the build-time default below
  }
  return DEFAULT_BRANDING;
});
