import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";

// Story 1.8: the shared authed-fetch helpers call Clerk to attach a session
// token — the server variant via `auth()` from @clerk/nextjs/server, the
// client hook via `useAuth()` from @clerk/nextjs. Neither has a real request
// context under jsdom, so mock both here (globally, for every test file) to
// return a fixed token. Page/component tests keep mocking `global.fetch`; the
// helper still resolves paths against the same base URL, so those mocks match.
// A single stable getToken reference: real Clerk's `useAuth().getToken` is
// referentially stable across renders, which is what lets `useAuthedFetch`
// memoize on it. A fresh function per render would make the memoized fetcher
// change every render and re-fire every effect that depends on it.
const getToken = vi.hoisted(() => async () => "test-token");

vi.mock("@clerk/nextjs/server", () => ({
  auth: async () => ({ getToken }),
  clerkMiddleware: (handler: unknown) => handler,
  createRouteMatcher: () => () => false,
}));

vi.mock("@clerk/nextjs", () => ({
  useAuth: () => ({ getToken }),
  ClerkProvider: (props: { children?: unknown }) => props.children,
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
