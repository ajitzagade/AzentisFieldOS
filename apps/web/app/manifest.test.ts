import { describe, expect, it } from "vitest";
import manifest from "./manifest";
import { APP_DISPLAY_NAME, BRAND_THEME_COLOR } from "../lib/tenant";

describe("web app manifest", () => {
  const m = manifest();

  it("names the app from the single tenant binding", () => {
    expect(m.name).toBe(APP_DISPLAY_NAME);
    expect(m.short_name).toBe(APP_DISPLAY_NAME);
  });

  it("is a standalone, root-scoped installable app", () => {
    expect(m.display).toBe("standalone");
    expect(m.start_url).toBe("/");
    expect(m.scope).toBe("/");
    expect(m.id).toBe("/");
  });

  it("uses the shared brand color for theme + background", () => {
    expect(m.theme_color).toBe(BRAND_THEME_COLOR);
    expect(m.background_color).toBe(BRAND_THEME_COLOR);
  });

  it("provides 192 & 512 icons in both any and maskable purposes", () => {
    const icons = m.icons ?? [];
    for (const size of ["192x192", "512x512"]) {
      for (const purpose of ["any", "maskable"]) {
        const match = icons.find(
          (icon) => icon.sizes === size && icon.purpose === purpose,
        );
        expect(match, `${size} ${purpose} icon`).toBeDefined();
        expect(match?.type).toBe("image/png");
        expect(match?.src).toMatch(/^\/icons\//);
      }
    }
  });
});
