import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";

// RTL's automatic afterEach cleanup only self-registers when it detects
// Jest-style test globals; this project intentionally doesn't enable
// vitest's `globals: true` (explicit imports per file), so cleanup is
// wired here instead — without it, DOM nodes from earlier tests in the
// same file leak into later ones.
afterEach(() => {
  cleanup();
});

// jsdom ships neither ResizeObserver nor scrollIntoView; Base UI's
// popup positioning (floating-ui) requires both at runtime.
if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
if (typeof Element !== "undefined" && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}
