// @vitest-environment jsdom
import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useClientValidation } from "./use-client-validation";

// A one-line regression in this shared hook would disable submission (or the
// FR-54 confirmation composition) across every server-action form at once —
// pin both branches of the guard.
function makeEvent() {
  const form = document.createElement("form");
  return {
    currentTarget: form,
    preventDefault: vi.fn(),
  } as unknown as React.FormEvent<HTMLFormElement>;
}

describe("useClientValidation", () => {
  it("blocks submission and exposes field errors when the parse fails", () => {
    const parse = vi.fn().mockReturnValue({
      success: false,
      error: { flatten: () => ({ fieldErrors: { quantity: ["Quantity must be positive"] } }) },
    });
    const next = vi.fn();
    const { result } = renderHook(() => useClientValidation(parse));

    const event = makeEvent();
    act(() => result.current.guard(next)(event));

    expect(event.preventDefault).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
    expect(result.current.errors.quantity?.[0]).toBe("Quantity must be positive");
  });

  it("lets a valid submit through, clears stale errors, and runs the next guard (ConfirmDialog composition)", () => {
    let outcome: { success: boolean; error?: { flatten(): { fieldErrors: Record<string, string[]> } } } = {
      success: false,
      error: { flatten: () => ({ fieldErrors: { quantity: ["bad"] } }) },
    };
    const parse = vi.fn(() => outcome);
    const next = vi.fn();
    const { result } = renderHook(() => useClientValidation(parse));

    act(() => result.current.guard(next)(makeEvent()));
    expect(result.current.errors.quantity).toBeDefined();

    outcome = { success: true };
    const event = makeEvent();
    act(() => result.current.guard(next)(event));

    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(event);
    expect(result.current.errors).toEqual({});
  });
});
