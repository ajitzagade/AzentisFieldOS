import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

// Tailwind's @theme block is a build-time (PostCSS/lightningcss) construct —
// jsdom has no CSS engine that evaluates it, so getComputedStyle can't see
// these tokens without a full Tailwind build step. Asserting on the raw
// source text is the reliable, dependency-free way to guard against a
// missing/renamed token or a light/dark value drifting from DESIGN.md.
const css = readFileSync(resolve(process.cwd(), "src/styles/theme.css"), "utf-8");

function rootBlock() {
  return css.slice(css.indexOf(":root {"), css.indexOf("\n.dark {"));
}

function darkBlock() {
  return css.slice(css.indexOf("\n.dark {"), css.indexOf("\n@theme {"));
}

describe("theme.css tokens", () => {
  it("declares every DESIGN.md light-mode color as a raw custom property", () => {
    const light = rootBlock();
    expect(light).toContain("--surface-0: #FBFAF7;");
    expect(light).toContain("--accent-teal-700: #0F5257;");
    expect(light).toContain("--gold-700: #96700F;");
    expect(light).toContain("--danger-100: #FBE7E5;");
  });

  it("overrides light tokens with DESIGN.md dark values under .dark", () => {
    const dark = darkBlock();
    expect(dark).toContain("--surface-0: #12161C;");
    expect(dark).toContain("--accent-teal-700: #4FB8AE;");
    expect(dark).toContain("--gold-700: #E3B24B;");
  });

  it("does not override accent-teal-900/accent-navy-* in dark mode (no -dark entry in DESIGN.md)", () => {
    const dark = darkBlock();
    expect(dark).not.toMatch(/--accent-teal-900:/);
    expect(dark).not.toMatch(/--accent-navy-800:/);
    expect(dark).not.toMatch(/--accent-navy-600:/);
  });

  it("bridges every color token into @theme via var(), never a literal", () => {
    const themeBlock = css.slice(css.indexOf("@theme {"));
    expect(themeBlock).toContain("--color-surface-0: var(--surface-0);");
    expect(themeBlock).toContain("--color-accent-teal-700: var(--accent-teal-700);");
    expect(themeBlock).not.toMatch(/--color-surface-0:\s*#/);
  });

  it("defines all eight DESIGN.md typography roles with paired sub-properties", () => {
    const themeBlock = css.slice(css.indexOf("@theme {"));
    for (const role of [
      "eyebrow",
      "caption",
      "body-sm",
      "body",
      "card-title",
      "section-header",
      "page-title",
      "kpi-numeral",
    ]) {
      expect(themeBlock).toContain(`--text-${role}:`);
      expect(themeBlock).toContain(`--text-${role}--line-height:`);
      expect(themeBlock).toContain(`--text-${role}--font-weight:`);
    }
    expect(themeBlock).toContain("--text-kpi-numeral: 38px;");
  });

  it("defines the DESIGN.md radius scale", () => {
    const themeBlock = css.slice(css.indexOf("@theme {"));
    expect(themeBlock).toContain("--radius-sm: 6px;");
    expect(themeBlock).toContain("--radius-md: 10px;");
    expect(themeBlock).toContain("--radius-lg: 14px;");
    expect(themeBlock).toContain("--radius-xl: 20px;");
    expect(themeBlock).toContain("--radius-full: 9999px;");
  });

  it("defines the DESIGN.md shadow scale, dark-mode-aware", () => {
    const light = rootBlock();
    const dark = darkBlock();
    // Strengthened (2026-08-28 UX pass): cards read visibly elevated, not flat.
    expect(light).toContain("--shadow-2: 0 6px 16px rgba(27, 36, 48, 0.1)");
    expect(dark).toContain("--shadow-2: 0 6px 20px rgba(0, 0, 0, 0.45);");
  });

  it("confirms the 4px spacing base matches DESIGN.md's spacing scale (already correct, not a placeholder)", () => {
    const themeBlock = css.slice(css.indexOf("@theme {"));
    expect(themeBlock).toContain("--spacing: 0.25rem;");
  });

  it("leaves motion and z-index tokens untouched (out of DESIGN.md's scope)", () => {
    const themeBlock = css.slice(css.indexOf("@theme {"));
    expect(themeBlock).toContain("--ease-standard: cubic-bezier(0.2, 0, 0, 1);");
    expect(themeBlock).toContain("--z-index-modal: 50;");
  });
});
