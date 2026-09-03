import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useGlobalSearch } from "./use-global-search";

const originalFetch = global.fetch;

beforeEach(() => {
  document.cookie = "";
});

afterEach(() => {
  global.fetch = originalFetch;
});

const RESPONSE = {
  sites: { results: [{ id: "s1", name: "Nashik Metro", location: "Nashik", contractReference: null }], total: 1 },
  materials: { results: [], total: 0 },
};

describe("useGlobalSearch", () => {
  it("does not call fetch for a blank/whitespace query", () => {
    const fetchMock = vi.fn();
    global.fetch = fetchMock as unknown as typeof fetch;

    const { result } = renderHook(() => useGlobalSearch("   "));

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.current).toEqual({ data: null, loading: false, error: null });
  });

  it("fetches /search with the encoded query and returns the parsed response", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: true, status: 200, json: async () => RESPONSE });
    global.fetch = fetchMock as unknown as typeof fetch;

    const { result } = renderHook(() => useGlobalSearch("nashik metro"));

    await waitFor(() => expect(result.current.data).toEqual(RESPONSE));
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    const calledUrl = fetchMock.mock.calls[0]![0] as string;
    expect(calledUrl).toContain(encodeURIComponent("nashik metro"));
  });

  it("reports loading while a non-empty query's request is pending", async () => {
    let resolveFetch!: (value: unknown) => void;
    const fetchMock = vi.fn().mockReturnValue(
      new Promise((resolve) => {
        resolveFetch = resolve;
      }),
    );
    global.fetch = fetchMock as unknown as typeof fetch;

    const { result } = renderHook(() => useGlobalSearch("cement"));

    expect(result.current.loading).toBe(true);

    resolveFetch({ ok: true, status: 200, json: async () => RESPONSE });
    await waitFor(() => expect(result.current.loading).toBe(false));
  });

  it("sets an error message on a non-ok response, without throwing", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 500, json: async () => ({}) });
    global.fetch = fetchMock as unknown as typeof fetch;

    const { result } = renderHook(() => useGlobalSearch("cement"));

    await waitFor(() => expect(result.current.error).not.toBeNull());
    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it("does not call fetch for a query trimmed below 2 characters", () => {
    const fetchMock = vi.fn();
    global.fetch = fetchMock as unknown as typeof fetch;

    const { result } = renderHook(() => useGlobalSearch(" c "));

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.current).toEqual({ data: null, loading: false, error: null });
  });

  it("does not call fetch for a single astral-plane character (e.g. an emoji) despite its .length being 2", () => {
    // "🏗" is one code point but a 2-unit UTF-16 surrogate pair — a naive
    // `.length < 2` guard would let it through as if it were 2 characters.
    const emoji = "🏗";
    expect(emoji.length).toBe(2);
    const fetchMock = vi.fn();
    global.fetch = fetchMock as unknown as typeof fetch;

    const { result } = renderHook(() => useGlobalSearch(emoji));

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.current).toEqual({ data: null, loading: false, error: null });
  });

  it("shows the most recently issued query's result even when an earlier query's response resolves later", async () => {
    const RESPONSE_CE = {
      sites: { results: [{ id: "ce1", name: "CE Site", location: "X", contractReference: null }], total: 1 },
      materials: { results: [], total: 0 },
    };
    const RESPONSE_CEM = {
      sites: { results: [{ id: "cem1", name: "Cement Site", location: "X", contractReference: null }], total: 1 },
      materials: { results: [], total: 0 },
    };

    const resolvers: Array<(value: unknown) => void> = [];
    const fetchMock = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvers.push(resolve);
        }),
    );
    global.fetch = fetchMock as unknown as typeof fetch;

    const { result, rerender } = renderHook(
      ({ query }: { query: string }) => useGlobalSearch(query),
      { initialProps: { query: "ce" } },
    );
    rerender({ query: "cem" });

    await waitFor(() => expect(resolvers.length).toBe(2));

    // Resolve the second-issued ("cem") request first, then the stale
    // first ("ce") request — the hook must end up showing "cem"'s data,
    // never overwritten by the late-arriving stale response.
    resolvers[1]!({ ok: true, status: 200, json: async () => RESPONSE_CEM });
    await waitFor(() => expect(result.current.data).toEqual(RESPONSE_CEM));

    resolvers[0]!({ ok: true, status: 200, json: async () => RESPONSE_CE });
    await new Promise((r) => setTimeout(r, 0));
    expect(result.current.data).toEqual(RESPONSE_CEM);
    expect(result.current.loading).toBe(false);
  });
});
