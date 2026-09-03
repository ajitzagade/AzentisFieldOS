import { renderTenantIcon } from "../lib/pwa-icon";

// Browser-tab / general app icon (Next metadata-file convention). Any-purpose,
// 512² so it downsamples cleanly. The sole favicon source — a static
// app/favicon.ico was removed because it's one shared binary across every
// tenant's build, the same per-tenant-hardcoding bug APP_DISPLAY_NAME hit.
export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return renderTenantIcon({ size: 512 });
}
