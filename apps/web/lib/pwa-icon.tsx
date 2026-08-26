import { ImageResponse } from "next/og";
import { APP_DISPLAY_NAME, BRAND_THEME_COLOR } from "./tenant";

// One implementation of the generated tenant app icon (AD-5 spirit), shared by
// every icon surface: the manifest's any/maskable 192 & 512 entries, the
// browser-tab icon (app/icon.tsx), and the iOS apple-touch icon
// (app/apple-icon.tsx). No binary/logo asset exists yet (that's Epic 14 +
// provisioning) — this draws the tenant initials on the brand teal via
// `next/og`'s ImageResponse, so it stays zero-binary and per-tenant-ready:
// swapping APP_DISPLAY_NAME re-letters every icon.
//
// The off-white glyph color is the design system's `--ink-on-accent`
// (#F7F5EE); the teal is BRAND_THEME_COLOR. These are metadata/asset config,
// not component styling, so AD-4's no-literal-color rule is unaffected (same
// carve-out as the manifest theme color).
// next/og's ImageResponse (satori) renders to a raster and cannot resolve CSS
// design-token vars; the literal mirrors --ink-on-accent. Same AD-4 carve-out
// as BRAND_THEME_COLOR.
// eslint-disable-next-line no-restricted-syntax -- see note above (AD-4 carve-out)
const GLYPH_COLOR = "#F7F5EE";

// First letters of the first two words, e.g. "Sandeep Enterprises" -> "SE".
// Falls back to the first two characters for a single-word name.
function tenantInitials(): string {
  const words = APP_DISPLAY_NAME.trim().split(/\s+/).filter(Boolean);
  const letters =
    words.length >= 2
      ? (words[0]?.[0] ?? "") + (words[1]?.[0] ?? "")
      : (words[0] ?? "").slice(0, 2);
  return letters.toUpperCase();
}

interface RenderOptions {
  size: number;
  /** Maskable icons must keep their content inside the ~80% safe zone the
   * platform may crop to a circle/squircle; a smaller glyph guarantees it. */
  maskable?: boolean;
}

export function renderTenantIcon({ size, maskable = false }: RenderOptions): ImageResponse {
  const fontSize = Math.round(size * (maskable ? 0.38 : 0.5));
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          // Full-bleed teal so the background still fills a maskable crop.
          background: BRAND_THEME_COLOR,
          color: GLYPH_COLOR,
          fontSize,
          fontWeight: 700,
          letterSpacing: -Math.round(size * 0.01),
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        {tenantInitials()}
      </div>
    ),
    { width: size, height: size },
  );
}
