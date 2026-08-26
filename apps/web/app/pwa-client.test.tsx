import { render, screen, act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PwaClient } from "./pwa-client";

const IOS_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1";
const ANDROID_UA =
  "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36";

function setUserAgent(ua: string) {
  Object.defineProperty(window.navigator, "userAgent", { value: ua, configurable: true });
}

function setStandalone(standalone: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: standalone && query.includes("standalone"),
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
  Object.defineProperty(window.navigator, "standalone", {
    value: standalone,
    configurable: true,
  });
}

function fireBeforeInstallPrompt() {
  const event = Object.assign(new Event("beforeinstallprompt"), {
    prompt: vi.fn(async () => {}),
    userChoice: Promise.resolve({ outcome: "dismissed" as const }),
  });
  window.dispatchEvent(event);
  return event;
}

beforeEach(() => {
  setUserAgent(ANDROID_UA);
  setStandalone(false);
  window.localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("PwaClient — iOS add-to-home-screen hint", () => {
  it("shows the hint on iOS Safari when not installed", () => {
    setUserAgent(IOS_UA);
    render(<PwaClient />);
    expect(screen.getByText(/Add to Home Screen/i)).toBeInTheDocument();
  });

  it("hides the hint when already running standalone", () => {
    setUserAgent(IOS_UA);
    setStandalone(true);
    render(<PwaClient />);
    expect(screen.queryByText(/Add to Home Screen/i)).not.toBeInTheDocument();
  });

  it("hides the hint once it has been dismissed", () => {
    setUserAgent(IOS_UA);
    window.localStorage.setItem("azentis:ios-install-hint-dismissed", "1");
    render(<PwaClient />);
    expect(screen.queryByText(/Add to Home Screen/i)).not.toBeInTheDocument();
  });

  it("does not show the iOS hint on a non-iOS device", () => {
    setUserAgent(ANDROID_UA);
    render(<PwaClient />);
    expect(screen.queryByText(/Add to Home Screen/i)).not.toBeInTheDocument();
  });

  it("persists dismissal and hides the hint when Dismiss is clicked", async () => {
    setUserAgent(IOS_UA);
    render(<PwaClient />);
    expect(screen.getByText(/Add to Home Screen/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /Dismiss/i }));

    expect(window.localStorage.getItem("azentis:ios-install-hint-dismissed")).toBe("1");
    expect(screen.queryByText(/Add to Home Screen/i)).not.toBeInTheDocument();
  });
});

describe("PwaClient — Android install button", () => {
  it("appears only after beforeinstallprompt fires", () => {
    render(<PwaClient />);
    expect(screen.queryByRole("button", { name: /Install app/i })).not.toBeInTheDocument();

    act(() => {
      fireBeforeInstallPrompt();
    });

    expect(screen.getByRole("button", { name: /Install app/i })).toBeInTheDocument();
  });

  it("fires the saved event's prompt() and unmounts the banner on click", async () => {
    render(<PwaClient />);
    let event!: ReturnType<typeof fireBeforeInstallPrompt>;
    act(() => {
      event = fireBeforeInstallPrompt();
    });

    await userEvent.click(screen.getByRole("button", { name: /Install app/i }));

    expect(event.prompt).toHaveBeenCalledTimes(1);
    await waitFor(() =>
      expect(screen.queryByRole("button", { name: /Install app/i })).not.toBeInTheDocument(),
    );
  });
});

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
});
