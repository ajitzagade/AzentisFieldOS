import type { MetadataRoute } from "next";
import { APP_DESCRIPTION, APP_DISPLAY_NAME, BRAND_THEME_COLOR } from "../lib/tenant";

// Served at /manifest.webmanifest (Next metadata convention). Makes the app
// installable on Android/Chromium and standalone-capable. `name`/`short_name`
// read the single tenant binding (APP_DISPLAY_NAME) rather than a hardcoded
// literal; `theme_color`/`background_color` use the one shared brand constant.
// Icons point at the stable, prebuilt any/maskable routes (app/icons/[icon]).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: APP_DISPLAY_NAME,
    short_name: APP_DISPLAY_NAME,
    description: APP_DESCRIPTION,
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    theme_color: BRAND_THEME_COLOR,
    background_color: BRAND_THEME_COLOR,
    icons: [
      {
        src: "/icons/icon-192",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/maskable-192",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/maskable-512",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
