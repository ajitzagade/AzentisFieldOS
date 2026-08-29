import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const replaceMock = vi.fn();
let searchParamsValue = new URLSearchParams();

vi.mock("next/navigation", () => ({
  usePathname: () => "/movements",
  useSearchParams: () => searchParamsValue,
  useRouter: () => ({ replace: replaceMock }),
}));

// Base UI's toast manager (which useToast wraps) is not guaranteed
// referentially stable across renders — that instability is what let this
// effect re-invoke many times before router.replace() ever cleared the
// URL, stacking duplicate toasts. Returning a brand-new object on every
// call reproduces that instability directly, rather than relying on
// real re-render conditions to happen to trigger it.
const toastSuccessSpy = vi.fn();
vi.mock("@azentisfieldos/ui", () => ({
  useToast: () => ({ success: toastSuccessSpy, error: vi.fn() }),
}));

import { FlashToast } from "./flash-toast";

describe("FlashToast", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    replaceMock.mockClear();
    toastSuccessSpy.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("announces the flash message exactly once, deferred past the initial commit", () => {
    searchParamsValue = new URLSearchParams({ flash: "Purchase recorded" });
    render(<FlashToast />);

    // Not announced synchronously — the toast fires on a deferred macrotask
    // so it never lands in the same commit as the Toast root's own
    // mount-time layout effect (see flash-toast.tsx for why).
    expect(toastSuccessSpy).not.toHaveBeenCalled();

    vi.runAllTimers();

    expect(toastSuccessSpy).toHaveBeenCalledTimes(1);
    expect(toastSuccessSpy).toHaveBeenCalledWith("Purchase recorded");
    expect(replaceMock).toHaveBeenCalledTimes(1);
    expect(replaceMock).toHaveBeenCalledWith("/movements", { scroll: false });
  });

  it("stays idempotent across repeated re-renders for the same flash value — never stacks duplicate toasts", () => {
    // useToast() (mocked above) returns a new object every call, so each
    // rerender changes the effect's `toast` dependency and re-invokes it —
    // reproducing the exact real-world trigger. The ref guard must still
    // limit this to one announcement.
    searchParamsValue = new URLSearchParams({ flash: "Movement recorded" });
    const { rerender } = render(<FlashToast />);

    for (let i = 0; i < 10; i++) {
      rerender(<FlashToast />);
    }

    vi.runAllTimers();

    expect(toastSuccessSpy).toHaveBeenCalledTimes(1);
    expect(replaceMock).toHaveBeenCalledTimes(1);
  });

  it("does nothing when there is no flash param", () => {
    searchParamsValue = new URLSearchParams();
    render(<FlashToast />);

    vi.runAllTimers();

    expect(toastSuccessSpy).not.toHaveBeenCalled();
    expect(replaceMock).not.toHaveBeenCalled();
  });
});
