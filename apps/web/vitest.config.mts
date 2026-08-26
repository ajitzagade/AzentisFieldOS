import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // Mirror the tsconfig `@/*` -> `./*` path alias (used by the shared
  // authed-fetch helper `@/lib/api`, story 1.8) so Vitest resolves it the same
  // way tsc and the Next build do.
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
  test: {
    root: "./",
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["node_modules/**", ".next/**"],
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
  },
});
