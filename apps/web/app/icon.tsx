import { renderTenantIcon } from "../lib/pwa-icon";

// Browser-tab / general app icon (Next metadata-file convention). Any-purpose,
// 512² so it downsamples cleanly. Coexists with the legacy favicon.ico.
export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return renderTenantIcon({ size: 512 });
}
