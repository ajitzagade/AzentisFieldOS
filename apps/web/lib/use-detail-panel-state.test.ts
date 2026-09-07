import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

const replace = vi.fn();
let searchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  usePathname: () => "/vendors",
  useSearchParams: () => searchParams,
  useRouter: () => ({ replace }),
}));

import { useDetailPanelState } from "./use-detail-panel-state";

beforeEach(() => {
  replace.mockClear();
  searchParams = new URLSearchParams();
});

describe("useDetailPanelState", () => {
  it("reads no id when the URL carries no matching param", () => {
    const { result } = renderHook(() => useDetailPanelState("vendorId"));
    expect(result.current.id).toBeNull();
  });

  it("reads the initial id straight from the URL on mount — a shared/reloaded link reopens the panel", () => {
    searchParams = new URLSearchParams("vendorId=v-123");
    const { result } = renderHook(() => useDetailPanelState("vendorId"));
    expect(result.current.id).toBe("v-123");
  });

  it("normalizes a valueless param (?vendorId= with no value) to null, not an empty-string id", () => {
    searchParams = new URLSearchParams("vendorId=");
    const { result } = renderHook(() => useDetailPanelState("vendorId"));
    expect(result.current.id).toBeNull();
  });

  it("open() writes the param onto the URL", () => {
    const { result } = renderHook(() => useDetailPanelState("vendorId"));

    act(() => result.current.open("v-456"));

    expect(replace).toHaveBeenCalledWith("/vendors?vendorId=v-456");
  });

  it("open() preserves other existing params (e.g. list search/sort state)", () => {
    searchParams = new URLSearchParams("q=cement&page=2");
    const { result } = renderHook(() => useDetailPanelState("vendorId"));

    act(() => result.current.open("v-456"));

    expect(replace).toHaveBeenCalledWith("/vendors?q=cement&page=2&vendorId=v-456");
  });

  it("close() removes the param entirely, leaving no dangling '?'", () => {
    searchParams = new URLSearchParams("vendorId=v-123");
    const { result } = renderHook(() => useDetailPanelState("vendorId"));

    act(() => result.current.close());

    expect(replace).toHaveBeenCalledWith("/vendors");
  });

  it("close() leaves other params untouched", () => {
    searchParams = new URLSearchParams("vendorId=v-123&q=cement");
    const { result } = renderHook(() => useDetailPanelState("vendorId"));

    act(() => result.current.close());

    expect(replace).toHaveBeenCalledWith("/vendors?q=cement");
  });

  it("uses a distinct param name per caller so two panels on one page (or two entities) never collide", () => {
    searchParams = new URLSearchParams("vendorId=v-123");
    const { result } = renderHook(() => useDetailPanelState("subcontractorId"));
    expect(result.current.id).toBeNull();

    act(() => result.current.open("s-1"));
    expect(replace).toHaveBeenCalledWith("/vendors?vendorId=v-123&subcontractorId=s-1");
  });
});
