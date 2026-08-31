import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

const replace = vi.fn();
let searchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  usePathname: () => "/sites",
  useSearchParams: () => searchParams,
  useRouter: () => ({ replace }),
}));

import { useListQueryState } from "./use-list-query-state";

beforeEach(() => {
  replace.mockClear();
  searchParams = new URLSearchParams();
});

describe("useListQueryState", () => {
  it("defaults to an empty query and page 1 with no URL params", () => {
    const { result } = renderHook(() => useListQueryState());
    expect(result.current.q).toBe("");
    expect(result.current.page).toBe(1);
    expect(result.current.sort).toBeUndefined();
    expect(result.current.order).toBeUndefined();
  });

  it("reads q/page/sort/order from the current URL", () => {
    searchParams = new URLSearchParams("q=cement&page=3&sort=name&order=desc");
    const { result } = renderHook(() => useListQueryState());
    expect(result.current.q).toBe("cement");
    expect(result.current.page).toBe(3);
    expect(result.current.sort).toBe("name");
    expect(result.current.order).toBe("desc");
  });

  it("setQuery writes q and resets page to 1", () => {
    searchParams = new URLSearchParams("q=old&page=4");
    const { result } = renderHook(() => useListQueryState());

    act(() => result.current.setQuery("new"));

    expect(replace).toHaveBeenCalledWith("/sites?q=new");
  });

  it("clearing the query removes it from the URL entirely rather than leaving q=", () => {
    searchParams = new URLSearchParams("q=old&page=2");
    const { result } = renderHook(() => useListQueryState());

    act(() => result.current.setQuery(""));

    expect(replace).toHaveBeenCalledWith("/sites");
  });

  it("setPage writes only the page param, preserving q/sort/order", () => {
    searchParams = new URLSearchParams("q=cement&sort=name&order=asc");
    const { result } = renderHook(() => useListQueryState());

    act(() => result.current.setPage(2));

    expect(replace).toHaveBeenCalledWith("/sites?q=cement&sort=name&order=asc&page=2");
  });

  it("setSort on a new column defaults to ascending and resets page to 1", () => {
    searchParams = new URLSearchParams("page=3");
    const { result } = renderHook(() => useListQueryState());

    act(() => result.current.setSort("name"));

    expect(replace).toHaveBeenCalledWith("/sites?sort=name&order=asc");
  });

  it("setSort on the already-active column toggles the order", () => {
    searchParams = new URLSearchParams("sort=name&order=asc");
    const { result } = renderHook(() => useListQueryState());

    act(() => result.current.setSort("name"));

    expect(replace).toHaveBeenCalledWith("/sites?sort=name&order=desc");
  });

  it("setFilter adds/updates an arbitrary filter param and resets page to 1", () => {
    searchParams = new URLSearchParams("page=2");
    const { result } = renderHook(() => useListQueryState());

    act(() => result.current.setFilter("status", "ACTIVE"));

    expect(replace).toHaveBeenCalledWith("/sites?status=ACTIVE");
  });

  it("setFilter with null clears that filter param", () => {
    searchParams = new URLSearchParams("status=ACTIVE&q=cement");
    const { result } = renderHook(() => useListQueryState());

    act(() => result.current.setFilter("status", null));

    expect(replace).toHaveBeenCalledWith("/sites?q=cement");
  });

  it("getFilter reads an arbitrary filter param straight from the URL", () => {
    searchParams = new URLSearchParams("status=ON_HOLD");
    const { result } = renderHook(() => useListQueryState());
    expect(result.current.getFilter("status")).toBe("ON_HOLD");
    expect(result.current.getFilter("missing")).toBeNull();
  });

  it("clearAll drops q/page/sort/order but leaves an unrelated param untouched", () => {
    // e.g. RMC's independent ?report= groupBy tab, tracked by a different
    // piece of page state entirely — Clear Filters on the Entries list
    // must not reset it.
    searchParams = new URLSearchParams("q=cement&report=day&page=3&sort=name&order=desc");
    const { result } = renderHook(() => useListQueryState());

    act(() => result.current.clearAll());

    expect(replace).toHaveBeenCalledWith("/sites?report=day");
  });

  it("clearAll also drops any extra filter keys the caller passes", () => {
    searchParams = new URLSearchParams("q=cement&status=ACTIVE&report=day&page=3");
    const { result } = renderHook(() => useListQueryState());

    act(() => result.current.clearAll(["status"]));

    expect(replace).toHaveBeenCalledWith("/sites?report=day");
  });
});

describe("useListQueryState — namespaced (prefix), for two independent lists on one page", () => {
  it("reads only its own prefixed q/page, ignoring the other namespace's params", () => {
    searchParams = new URLSearchParams("mq=cement&mpage=2&vq=truck&vpage=5");
    const { result } = renderHook(() => useListQueryState("m"));
    expect(result.current.q).toBe("cement");
    expect(result.current.page).toBe(2);
  });

  it("setQuery writes only its own prefixed param, leaving the other namespace untouched", () => {
    searchParams = new URLSearchParams("vq=truck&vpage=5");
    const { result } = renderHook(() => useListQueryState("m"));

    act(() => result.current.setQuery("cement"));

    expect(replace).toHaveBeenCalledWith("/sites?vq=truck&vpage=5&mq=cement");
  });

  it("setPage on one namespace does not reset the other namespace's page", () => {
    searchParams = new URLSearchParams("mpage=3&vpage=5");
    const { result } = renderHook(() => useListQueryState("m"));

    act(() => result.current.setPage(4));

    expect(replace).toHaveBeenCalledWith("/sites?mpage=4&vpage=5");
  });

  it("clearAll on one namespace only drops that namespace's params", () => {
    searchParams = new URLSearchParams("mq=cement&mpage=2&vq=truck&vpage=5");
    const { result } = renderHook(() => useListQueryState("m"));

    act(() => result.current.clearAll());

    expect(replace).toHaveBeenCalledWith("/sites?vq=truck&vpage=5");
  });
});
