import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";

// lib/api.ts's server-side authedFetch reads the session cookie via
// `cookies()` from next/headers — real Next.js only provides that API
// inside an actual request scope, which jsdom has none of. Mock it globally
// (for every test file) to a fixed "test-token" session cookie, mirroring
// the old Clerk auth() mock this replaced. A test file that needs different
// behavior (e.g. app/api/auth/logout/route.test.ts) declares its own
// `vi.mock("next/headers", ...)`, which takes precedence over this one.
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) =>
      name === "session" ? { name, value: "test-token" } : undefined,
    set: () => {},
    delete: () => {},
  }),
}));

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

// jsdom ships neither ResizeObserver nor scrollIntoView; Base UI's
// popup positioning (ComboboxField) requires both at runtime.
if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
}
if (typeof Element !== "undefined" && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}
