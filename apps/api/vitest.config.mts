import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

// NestJS relies on decorator metadata (emitDecoratorMetadata) that plain
// esbuild/Vite transforms don't emit — unplugin-swc runs the real SWC
// TS/decorator transform Nest needs, per the standard Nest+Vitest setup.
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    root: "./",
    include: ["src/**/*.spec.ts"],
    environment: "node",
  },
  plugins: [swc.vite({ module: { type: "es6" } })],
});
