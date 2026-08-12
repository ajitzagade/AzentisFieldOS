import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";

// See packages/ui/vitest.setup.ts — same reasoning: this project doesn't
// enable Vitest's `globals: true`, so RTL's auto-cleanup doesn't
// self-register and must be wired explicitly.
afterEach(() => {
  cleanup();
});
