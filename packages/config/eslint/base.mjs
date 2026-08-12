// Shared ESLint flat config — extended, never re-authored, per app/package.
// AGENTS.md AD-15: apps/web additionally inherits jsx-a11y rules via
// eslint-config-next's core-web-vitals preset (see apps/web/eslint.config.mjs)
// to enforce the WCAG AA CI gate — not a second, separately-installed
// eslint-plugin-jsx-a11y, which would throw a duplicate-plugin error.
import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "Literal[value=/^#[0-9a-fA-F]{3,8}$/]",
          message:
            "No raw hex color literals — use a design token from packages/ui (AD-4).",
        },
      ],
    },
  },
  {
    ignores: ["dist/**", ".next/**", "coverage/**", "**/generated/**"],
  },
);
