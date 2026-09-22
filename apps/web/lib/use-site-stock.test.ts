import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const authedFetchMock = vi.fn();
vi.mock("./use-authed-fetch", () => ({
  useAuthedFetch: () => authedFetchMock,
}));

// Imported after the mock above so useStock's own useAuthedFetch() call
// resolves to the mock (vi.mock is hoisted by Vitest's transform, so this
// static import already sees it).
import { stockStatus, useSiteStock, withStockMeta, type StockLookup } from "./use-site-stock";

function lookup(entries: Record<string, { quantity: number; unit?: string }>, loading = false): StockLookup {
  return { bySizeId: new Map(Object.entries(entries)), loading };
}

describe("stockStatus", () => {
  it("returns nothing until a Material is chosen", () => {
    expect(stockStatus({ stock: lookup({}), materialSizeId: null, location: "this Site" })).toBeUndefined();
  });

  it("reports that it is still checking while the balances load — never a premature 'No stock recorded'", () => {
    expect(stockStatus({ stock: lookup({}, true), materialSizeId: "ms1", location: "this Site" })).toEqual({
      text: "Checking available stock…",
      tone: "default",
      insufficient: false,
    });
  });

  it("warns when the Site has no balance row for the Material", () => {
    expect(stockStatus({ stock: lookup({}), materialSizeId: "ms1", location: "this Site" })).toEqual({
      text: "No stock recorded at this Site",
      tone: "warning",
      insufficient: false,
    });
  });

  it("warns when the recorded balance is zero — recorded but empty is not 'not recorded'", () => {
    const stock = lookup({ ms1: { quantity: 0, unit: "Bag" } });
    expect(stockStatus({ stock, materialSizeId: "ms1", location: "this Site" })).toEqual({
      text: "No stock available at this Site",
      tone: "warning",
      insufficient: false,
    });
  });

  it("shows the available balance with its Unit once chosen", () => {
    const stock = lookup({ ms1: { quantity: 1200, unit: "Bag" } });
    expect(stockStatus({ stock, materialSizeId: "ms1", location: "the Godown" })).toEqual({
      text: "1,200 Bag available at the Godown",
      tone: "positive",
      insufficient: false,
    });
  });

  it("flags an entered quantity that exceeds the balance as insufficient", () => {
    const stock = lookup({ ms1: { quantity: 80, unit: "Bag" } });
    expect(stockStatus({ stock, materialSizeId: "ms1", quantity: "81", location: "this Site" })).toEqual({
      text: "Insufficient stock — only 80 Bag available at this Site",
      tone: "danger",
      insufficient: true,
    });
  });

  it("stays positive at exactly the available balance", () => {
    const stock = lookup({ ms1: { quantity: 80 } });
    expect(stockStatus({ stock, materialSizeId: "ms1", quantity: "80", location: "this Site" })?.insufficient).toBe(false);
  });

  it("ignores an unparsable quantity instead of flagging it", () => {
    const stock = lookup({ ms1: { quantity: 80 } });
    expect(stockStatus({ stock, materialSizeId: "ms1", quantity: "abc", location: "this Site" })?.insufficient).toBe(false);
  });

  // Regression (2026-09-22): a real end-to-end report showed a bare "No
  // stock" for every Material in a DSR's Materials Consumed picker, even
  // ones with real balance at the Godown — confusing enough to be read as
  // a data bug. Root cause was never a fetch/matching defect (verified live
  // against a real Site with real Cement stock, which showed correctly);
  // it's that a Material never moved/purchased to THIS Site legitimately
  // has zero SiteStock. The fix is to say where it actually is instead of
  // leaving "No stock" ambiguous between "doesn't exist" and "not here yet".
  describe("elsewhere reference (root cause: 'No stock' looked like data loss, not a location mismatch)", () => {
    it("names the Godown when the Site has no balance row but the Godown does", () => {
      const stock = lookup({});
      const elsewhere = { label: "Godown", stock: lookup({ ms1: { quantity: 500, unit: "Bag" } }) };
      expect(stockStatus({ stock, materialSizeId: "ms1", location: "this Site", elsewhere })).toEqual({
        text: "No stock recorded at this Site — 500 Bag available at Godown",
        tone: "warning",
        insufficient: false,
      });
    });

    it("names the Godown when the Site's recorded balance is zero but the Godown has some", () => {
      const stock = lookup({ ms1: { quantity: 0 } });
      const elsewhere = { label: "Godown", stock: lookup({ ms1: { quantity: 40 } }) };
      expect(stockStatus({ stock, materialSizeId: "ms1", location: "this Site", elsewhere })?.text).toBe(
        "No stock available at this Site — 40 available at Godown",
      );
    });

    it("stays a bare 'No stock' when the elsewhere location also has none", () => {
      const stock = lookup({});
      const elsewhere = { label: "Godown", stock: lookup({ ms1: { quantity: 0 } }) };
      expect(stockStatus({ stock, materialSizeId: "ms1", location: "this Site", elsewhere })?.text).toBe(
        "No stock recorded at this Site",
      );
    });

    it("never claims elsewhere-stock while the elsewhere lookup is itself still loading", () => {
      const stock = lookup({});
      const elsewhere = { label: "Godown", stock: lookup({ ms1: { quantity: 500 } }, true) };
      expect(stockStatus({ stock, materialSizeId: "ms1", location: "this Site", elsewhere })?.text).toBe(
        "No stock recorded at this Site",
      );
    });

    it("does not mention elsewhere at all once the Site itself has stock", () => {
      const stock = lookup({ ms1: { quantity: 10, unit: "Bag" } });
      const elsewhere = { label: "Godown", stock: lookup({ ms1: { quantity: 500 } }) };
      expect(stockStatus({ stock, materialSizeId: "ms1", location: "this Site", elsewhere })?.text).toBe(
        "10 Bag available at this Site",
      );
    });
  });
});

describe("useSiteStock", () => {
  beforeEach(() => {
    authedFetchMock.mockReset();
  });

  afterEach(() => {
    // Restore jsdom's default so a later test's mount effects aren't
    // affected by a prior test's visibilityState override.
    Object.defineProperty(document, "visibilityState", {
      value: "visible",
      configurable: true,
    });
  });

  it("refetches when the window regains focus — fixes the 'No stock available' staleness bug in a long-lived DSR session", async () => {
    authedFetchMock.mockResolvedValue({
      ok: true,
      json: async () => [{ materialSizeId: "ms1", quantity: 10 }],
    });

    const { result } = renderHook(() => useSiteStock("site-1"));

    await waitFor(() => expect(authedFetchMock).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(result.current.bySizeId.get("ms1")?.quantity).toBe(10));

    authedFetchMock.mockResolvedValue({
      ok: true,
      json: async () => [{ materialSizeId: "ms1", quantity: 25 }],
    });

    act(() => {
      window.dispatchEvent(new Event("focus"));
    });

    await waitFor(() => expect(authedFetchMock).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(result.current.bySizeId.get("ms1")?.quantity).toBe(25));
  });

  it("refetches when the document becomes visible again (mobile tab-switch-back) — review fix #7", async () => {
    authedFetchMock.mockResolvedValue({
      ok: true,
      json: async () => [{ materialSizeId: "ms1", quantity: 10 }],
    });

    const { result } = renderHook(() => useSiteStock("site-1"));

    await waitFor(() => expect(authedFetchMock).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(result.current.bySizeId.get("ms1")?.quantity).toBe(10));

    authedFetchMock.mockResolvedValue({
      ok: true,
      json: async () => [{ materialSizeId: "ms1", quantity: 40 }],
    });

    Object.defineProperty(document, "visibilityState", {
      value: "visible",
      configurable: true,
    });
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });

    await waitFor(() => expect(authedFetchMock).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(result.current.bySizeId.get("ms1")?.quantity).toBe(40));
  });

  it("does not refetch when visibilitychange fires while backgrounded (hidden)", async () => {
    authedFetchMock.mockResolvedValue({
      ok: true,
      json: async () => [{ materialSizeId: "ms1", quantity: 10 }],
    });

    const { result } = renderHook(() => useSiteStock("site-1"));
    await waitFor(() => expect(authedFetchMock).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(result.current.bySizeId.get("ms1")?.quantity).toBe(10));

    Object.defineProperty(document, "visibilityState", {
      value: "hidden",
      configurable: true,
    });
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });

    expect(authedFetchMock).toHaveBeenCalledTimes(1);
  });
});

describe("withStockMeta", () => {
  const options = [
    { value: "ms1", label: "Cement — 50kg" },
    { value: "ms2", label: "TMT Steel — 12mm" },
  ];

  it("leaves options meta-free while balances are loading", () => {
    expect(withStockMeta(options, lookup({}, true))).toEqual(options);
  });

  it("annotates each option with its balance, and flags missing/zero balances", () => {
    const stock = lookup({ ms1: { quantity: 1200, unit: "Bag" } });
    expect(withStockMeta(options, stock)).toEqual([
      { value: "ms1", label: "Cement — 50kg", meta: "1,200 Bag", metaTone: "default" },
      { value: "ms2", label: "TMT Steel — 12mm", meta: "No stock", metaTone: "warning" },
    ]);
  });

  // Regression (2026-09-22) — see the matching stockStatus describe block above.
  it("shows the elsewhere balance instead of a bare 'No stock' when the Site has none but the Godown does", () => {
    const stock = lookup({ ms1: { quantity: 1200, unit: "Bag" } });
    const elsewhere = { label: "Godown", stock: lookup({ ms2: { quantity: 30 } }) };
    expect(withStockMeta(options, stock, elsewhere)).toEqual([
      { value: "ms1", label: "Cement — 50kg", meta: "1,200 Bag", metaTone: "default" },
      { value: "ms2", label: "TMT Steel — 12mm", meta: "30 at Godown", metaTone: "warning" },
    ]);
  });
});
