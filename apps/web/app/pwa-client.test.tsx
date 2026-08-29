import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PwaClient } from "./pwa-client";

describe("PwaClient — service worker registration", () => {
  it("does not register the service worker outside production", () => {
    // Vitest runs with NODE_ENV = "test", so registration must be skipped.
    const register = vi.fn(async () => ({}) as ServiceWorkerRegistration);
    Object.defineProperty(window.navigator, "serviceWorker", {
      value: { register },
      configurable: true,
    });

    render(<PwaClient />);

    expect(register).not.toHaveBeenCalled();
  });

  it("renders no visible chrome", () => {
    const { container } = render(<PwaClient />);
    expect(container).toBeEmptyDOMElement();
  });
});
