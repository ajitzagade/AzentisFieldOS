import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";
// jsdom has no IndexedDB implementation; Dexie (story 3.2's offline queue)
// needs one to construct its database at module-eval time in any test that
// imports apps/web/lib/offline-db.ts, even indirectly via a page component.
import "fake-indexeddb/auto";

// See packages/ui/vitest.setup.ts — same reasoning: this project doesn't
// enable Vitest's `globals: true`, so RTL's auto-cleanup doesn't
// self-register and must be wired explicitly.
afterEach(() => {
  cleanup();
});
