// Post-processes nest build's dist/src/main.js for deployment: inlines
// @azentisfieldos/shared (raw TypeScript, no build step by design — AD-7 —
// so Vercel's own dependency tracer can't follow it through the pnpm
// workspace symlink into packages/shared/src/**/*.ts) into a single
// self-contained file. Every real npm package is listed as external —
// Vercel's tracer handles those correctly already; only our own
// no-build-step workspace package needs to be bundled in. Local dev/start
// scripts are untouched — they run dist/src/main.js as tsc emits it,
// unbundled.
import { build } from "esbuild";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { dependencies } = require("./package.json");
const external = Object.keys(dependencies).filter(
  (name) => name !== "@azentisfieldos/shared",
);

await build({
  entryPoints: ["dist/src/main.js"],
  outfile: "dist/src/main.js",
  allowOverwrite: true,
  bundle: true,
  platform: "node",
  target: "node22",
  format: "cjs",
  logLevel: "info",
  external,
});
