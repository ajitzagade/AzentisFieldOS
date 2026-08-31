import { renderHook, waitFor } from "@testing-library/react";
import { act } from "react";
import { describe, expect, it, vi } from "vitest";
import { useDebouncedSearch } from "./use-debounced-search";

describe("useDebouncedSearch", () => {
  it("reflects the typed value immediately, without calling onDebouncedChange yet", () => {
    const onDebouncedChange = vi.fn();
    const { result } = renderHook(() => useDebouncedSearch("", onDebouncedChange));

    act(() => result.current.onChange("cement"));

    expect(result.current.value).toBe("cement");
    expect(onDebouncedChange).not.toHaveBeenCalled();
  });

  it("calls onDebouncedChange after the debounce delay", async () => {
    const onDebouncedChange = vi.fn();
    const { result } = renderHook(() => useDebouncedSearch("", onDebouncedChange));

    act(() => result.current.onChange("cement"));

    await waitFor(() => expect(onDebouncedChange).toHaveBeenCalledWith("cement"), { timeout: 1000 });
  });

  it("only fires once for rapid successive keystrokes, with the final value", async () => {
    const onDebouncedChange = vi.fn();
    const { result } = renderHook(() => useDebouncedSearch("", onDebouncedChange));

    act(() => result.current.onChange("c"));
    act(() => result.current.onChange("ce"));
    act(() => result.current.onChange("cem"));

    await waitFor(() => expect(onDebouncedChange).toHaveBeenCalledTimes(1), { timeout: 1000 });
    expect(onDebouncedChange).toHaveBeenCalledWith("cem");
  });

  it("resyncs the visible value when the external (URL-sourced) value changes — fixes the stale-search-box-after-Clear-filters bug", () => {
    const onDebouncedChange = vi.fn();
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedSearch(value, onDebouncedChange),
      { initialProps: { value: "cement" } },
    );

    expect(result.current.value).toBe("cement");

    // Simulate an external clear (Clear filters, browser back/forward) —
    // the URL-sourced `value` prop changes without the user typing anything.
    rerender({ value: "" });

    expect(result.current.value).toBe("");
  });
});
