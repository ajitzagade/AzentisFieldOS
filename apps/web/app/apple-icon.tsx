import { renderTenantIcon } from "../lib/pwa-icon";

// iOS home-screen icon (Next metadata-file convention → apple-touch-icon link).
// 180² is Apple's recommended touch-icon size. Not maskable-padded: iOS applies
// its own rounded-rect mask and expects a full-bleed icon, so the larger
// any-purpose glyph is correct here.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return renderTenantIcon({ size: 180 });
}
