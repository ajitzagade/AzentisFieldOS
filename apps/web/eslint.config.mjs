import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import sharedBase from "@azentisfieldos/config/eslint/base";

// eslint-config-next's core-web-vitals already bundles jsx-a11y's
// recommended rules — that's what enforces WCAG AA (architecture spine
// AD-15) here; layering it again throws "Cannot redefine plugin".
//
// core-web-vitals ships those jsx-a11y rules at "warn", not "error" —
// confirmed by inspecting the resolved config directly. A warning doesn't
// fail an eslint run by exit code alone, which would silently defeat
// AD-15's "CI-enforced, not discretionary" requirement. Bump them to
// "error" here rather than accepting the upstream default.
export default defineConfig([
  ...sharedBase,
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "jsx-a11y/alt-text": "error",
      "jsx-a11y/aria-props": "error",
      "jsx-a11y/aria-proptypes": "error",
      "jsx-a11y/aria-unsupported-elements": "error",
      "jsx-a11y/role-has-required-aria-props": "error",
      "jsx-a11y/role-supports-aria-props": "error",
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);
