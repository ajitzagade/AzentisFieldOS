import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { usePwaInstall } from "./use-pwa-install";

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
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("usePwaInstall — iOS", () => {
  it("is available on iOS Safari when not installed", () => {
    setUserAgent(IOS_UA);
    const { result } = renderHook(() => usePwaInstall());
    expect(result.current.available).toBe(true);
    expect(result.current.isIos).toBe(true);
  });

  it("is unavailable when already running standalone", () => {
    setUserAgent(IOS_UA);
    setStandalone(true);
    const { result } = renderHook(() => usePwaInstall());
    expect(result.current.available).toBe(false);
  });

  it("is unavailable on a non-iOS device with no beforeinstallprompt", () => {
    setUserAgent(ANDROID_UA);
    const { result } = renderHook(() => usePwaInstall());
    expect(result.current.available).toBe(false);
    expect(result.current.isIos).toBe(false);
  });
});

describe("usePwaInstall — Android", () => {
  it("becomes available once beforeinstallprompt fires", () => {
    const { result } = renderHook(() => usePwaInstall());
    expect(result.current.available).toBe(false);

    act(() => {
      fireBeforeInstallPrompt();
    });

    expect(result.current.available).toBe(true);
    expect(result.current.isIos).toBe(false);
  });

  it("install() fires the saved event's prompt() and becomes unavailable again", async () => {
    const { result } = renderHook(() => usePwaInstall());
    let event!: ReturnType<typeof fireBeforeInstallPrompt>;
    act(() => {
      event = fireBeforeInstallPrompt();
    });

    await act(async () => {
      await result.current.install();
    });

    expect(event.prompt).toHaveBeenCalledTimes(1);
    expect(result.current.available).toBe(false);
  });
});
