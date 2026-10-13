import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const authedFetchMock = vi.fn();
vi.mock("./use-authed-fetch", () => ({
  useAuthedFetch: () => authedFetchMock,
}));

// Imported after the mock above so useStock's own useAuthedFetch() call
// resolves to the mock (vi.mock is hoisted by Vitest's transform, so this
// static import already sees it).
import { stockStatus, useOtherSiteStockMap, useSiteStock, withStockMeta, type StockLookup } from "./use-site-stock";

function lookup(
  entries: Record<string, { quantity: number; unit?: string }>,
  loading = false,
  error = false,
): StockLookup {
  return { bySizeId: new Map(Object.entries(entries)), loading, error };
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

  // Regression: a failed stock fetch must never be read as "No stock" —
  // see useStock's own `error` field and its catch-block comment.
  it("reports a real error state distinctly from 'No stock' when the fetch failed", () => {
    expect(stockStatus({ stock: lookup({}, false, true), materialSizeId: "ms1", location: "this Site" })).toEqual({
      text: "Couldn't check stock — try again",
      tone: "danger",
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
    // Follow-up (2026-09-23): since Consumption now falls back to Godown
    // automatically (Site-then-Godown), a Material with real balance only
    // at the Godown isn't actually a problem — the draw will succeed. This
    // is reassurance, not a warning: shorter wording, positive tone.
    it("says the Godown balance will be used when the Site has no balance row but the Godown does", () => {
      const stock = lookup({});
      const elsewhere = { label: "Godown", stock: lookup({ ms1: { quantity: 500, unit: "Bag" } }) };
      expect(stockStatus({ stock, materialSizeId: "ms1", location: "this Site", elsewhere })).toEqual({
        text: "Not at this Site — 500 Bag at Godown, will be used",
        tone: "positive",
        insufficient: false,
      });
    });

    it("says the Godown balance will be used when the Site's recorded balance is zero but the Godown has some", () => {
      const stock = lookup({ ms1: { quantity: 0 } });
      const elsewhere = { label: "Godown", stock: lookup({ ms1: { quantity: 40 } }) };
      expect(stockStatus({ stock, materialSizeId: "ms1", location: "this Site", elsewhere })?.text).toBe(
        "Not at this Site — 40 at Godown, will be used",
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

    // Regression: an errored elsewhere fetch is unknown, not zero — must
    // not be silently read as "elsewhere has nothing" either.
    it("never claims elsewhere-stock while the elsewhere lookup itself failed", () => {
      const stock = lookup({});
      const elsewhere = { label: "Godown", stock: lookup({ ms1: { quantity: 500 } }, false, true) };
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

    // Review loop 1: the combined (location + elsewhere) insufficiency
    // check was added but never exercised with both `quantity` and
    // `elsewhere` supplied together — these cases close that gap.
    it("is NOT insufficient when the primary location alone falls short but the combined balance covers it", () => {
      const stock = lookup({ ms1: { quantity: 5, unit: "Bag" } });
      const elsewhere = { label: "Godown", stock: lookup({ ms1: { quantity: 100, unit: "Bag" } }) };
      const status = stockStatus({ stock, materialSizeId: "ms1", quantity: "20", location: "this Site", elsewhere });
      expect(status?.insufficient).toBe(false);
      expect(status?.tone).toBe("positive");
    });

    it("says the remainder will draw from the Godown when the entered quantity exceeds the Site alone but not combined", () => {
      const stock = lookup({ ms1: { quantity: 5, unit: "Bag" } });
      const elsewhere = { label: "Godown", stock: lookup({ ms1: { quantity: 100, unit: "Bag" } }) };
      const status = stockStatus({ stock, materialSizeId: "ms1", quantity: "20", location: "this Site", elsewhere });
      expect(status?.text).toBe("5 Bag available at this Site — the remaining 15 Bag will draw from Godown");
    });

    it("IS insufficient when the combined (location + elsewhere) balance still falls short", () => {
      const stock = lookup({ ms1: { quantity: 5, unit: "Bag" } });
      const elsewhere = { label: "Godown", stock: lookup({ ms1: { quantity: 10, unit: "Bag" } }) };
      const status = stockStatus({ stock, materialSizeId: "ms1", quantity: "20", location: "this Site", elsewhere });
      expect(status).toEqual({
        text: "Insufficient stock — only 15 Bag available combined (this Site + Godown)",
        tone: "danger",
        insufficient: true,
      });
    });

    it("never flashes 'Insufficient stock' while the elsewhere balance is still loading, even if the primary location alone looks short", () => {
      const stock = lookup({ ms1: { quantity: 5, unit: "Bag" } });
      const elsewhere = { label: "Godown", stock: lookup({ ms1: { quantity: 100 } }, true) };
      const status = stockStatus({ stock, materialSizeId: "ms1", quantity: "20", location: "this Site", elsewhere });
      expect(status?.insufficient).toBe(false);
      expect(status?.text).not.toContain("Insufficient");
    });
  });

  // 2026-09-23: naming another Site's balance is purely informational — no
  // automatic fallback exists for it (unlike Godown), so it's surfaced
  // distinctly (recommending a Purchase for this Site, not a Transfer —
  // matches the response the Site Engineer actually takes) and only when
  // there's otherwise nothing more useful to say.
  describe("otherSite informational hint (no automatic fallback, unlike Godown)", () => {
    it("names the other Site when neither this Site nor Godown has any balance", () => {
      const stock = lookup({});
      const status = stockStatus({
        stock,
        materialSizeId: "ms1",
        location: "this Site",
        otherSite: { siteName: "Pune Bypass", quantity: 40, unit: "Bag" },
      });
      expect(status).toEqual({
        text: "Not at this Site — 40 Bag at Pune Bypass, purchase for this Site",
        tone: "warning",
        insufficient: false,
      });
    });

    it("prefers the Godown fallback over the other-Site hint when both are present — Godown is actionable automatically, the other Site is not", () => {
      const stock = lookup({});
      const elsewhere = { label: "Godown", stock: lookup({ ms1: { quantity: 100, unit: "Bag" } }) };
      const status = stockStatus({
        stock,
        materialSizeId: "ms1",
        location: "this Site",
        elsewhere,
        otherSite: { siteName: "Pune Bypass", quantity: 40, unit: "Bag" },
      });
      expect(status?.text).toBe("Not at this Site — 100 Bag at Godown, will be used");
      expect(status?.tone).toBe("positive");
    });

    it("is ignored once this Site itself has stock", () => {
      const stock = lookup({ ms1: { quantity: 10, unit: "Bag" } });
      const status = stockStatus({
        stock,
        materialSizeId: "ms1",
        location: "this Site",
        otherSite: { siteName: "Pune Bypass", quantity: 40, unit: "Bag" },
      });
      expect(status?.text).toBe("10 Bag available at this Site");
    });

    it("never marks the entry insufficient before a quantity is typed — purely informational, the real floor check stays server-side and never looks at another Site's balance", () => {
      const stock = lookup({});
      const status = stockStatus({
        stock,
        materialSizeId: "ms1",
        location: "this Site",
        otherSite: { siteName: "Pune Bypass", quantity: 40, unit: "Bag" },
      });
      expect(status?.insufficient).toBe(false);
    });

    it("still defers to the ordinary combined-insufficient check once a quantity is typed — the other-Site name never overrides that Site+Godown is what's actually enforced server-side", () => {
      const stock = lookup({});
      const status = stockStatus({
        stock,
        materialSizeId: "ms1",
        quantity: "999",
        location: "this Site",
        otherSite: { siteName: "Pune Bypass", quantity: 40, unit: "Bag" },
      });
      expect(status?.insufficient).toBe(true);
      expect(status?.text).toContain("Insufficient stock");
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

  // Regression: a network rejection or non-ok response used to be stored
  // as an empty `rows: []` — indistinguishable from a genuinely-empty
  // balance set, which made every Material read "No stock" during an
  // outage with no indication anything had failed.
  it("surfaces a non-ok response as error:true, never as an empty (zero-stock) result", async () => {
    authedFetchMock.mockResolvedValue({ ok: false, status: 500 });

    const { result } = renderHook(() => useSiteStock("site-1"));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe(true);
    expect(result.current.bySizeId.size).toBe(0);
  });

  it("surfaces a network rejection as error:true, never as an empty (zero-stock) result", async () => {
    authedFetchMock.mockRejectedValue(new Error("network down"));

    const { result } = renderHook(() => useSiteStock("site-1"));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe(true);
    expect(result.current.bySizeId.size).toBe(0);
  });

  it("clears error:true on a successful refetch (e.g. after regaining focus)", async () => {
    authedFetchMock.mockResolvedValue({ ok: false, status: 500 });

    const { result } = renderHook(() => useSiteStock("site-1"));
    await waitFor(() => expect(result.current.error).toBe(true));

    authedFetchMock.mockResolvedValue({
      ok: true,
      json: async () => [{ materialSizeId: "ms1", quantity: 10 }],
    });
    act(() => {
      window.dispatchEvent(new Event("focus"));
    });

    await waitFor(() => expect(result.current.error).toBe(false));
    expect(result.current.bySizeId.get("ms1")?.quantity).toBe(10);
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

  // Regression: a failed fetch must not render every option as "No
  // stock" — same meta-free treatment as the loading case.
  it("leaves options meta-free when the balance fetch failed, rather than claiming 'No stock'", () => {
    expect(withStockMeta(options, lookup({}, false, true))).toEqual(options);
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

  // Regression: the Purchase form's hideNoStock:true call (a Purchase
  // creates stock, so a bare "No stock" badge is a false alarm) must omit
  // meta entirely for a zero-balance option, not just suppress it when an
  // elsewhere balance exists.
  it("omits meta entirely for a zero-balance option when hideNoStock is set, but still shows a real balance", () => {
    const stock = lookup({ ms1: { quantity: 1200, unit: "Bag" } });
    expect(withStockMeta(options, stock, undefined, { hideNoStock: true })).toEqual([
      { value: "ms1", label: "Cement — 50kg", meta: "1,200 Bag", metaTone: "default" },
      { value: "ms2", label: "TMT Steel — 12mm" },
    ]);
  });

  it("still shows the elsewhere balance when hideNoStock is set — only the bare 'No stock' case is suppressed", () => {
    const stock = lookup({ ms1: { quantity: 1200, unit: "Bag" } });
    const elsewhere = { label: "Godown", stock: lookup({ ms2: { quantity: 30 } }) };
    expect(withStockMeta(options, stock, elsewhere, { hideNoStock: true })).toEqual([
      { value: "ms1", label: "Cement — 50kg", meta: "1,200 Bag", metaTone: "default" },
      { value: "ms2", label: "TMT Steel — 12mm", meta: "30 at Godown", metaTone: "warning" },
    ]);
  });
});

describe("useOtherSiteStockMap", () => {
  beforeEach(() => {
    authedFetchMock.mockReset();
  });

  it("fetches each distinct materialSizeId's other-Sites balance, keyed by excludeSiteId, and resolves the top match per id", async () => {
    authedFetchMock.mockImplementation((path: string) => {
      if (path.includes("/stock/material-size/ms1/other-sites")) {
        return Promise.resolve({
          ok: true,
          json: async () => [{ siteName: "Pune Bypass", quantity: 40, unit: "Bag" }],
        });
      }
      if (path.includes("/stock/material-size/ms2/other-sites")) {
        return Promise.resolve({ ok: true, json: async () => [] });
      }
      return Promise.resolve({ ok: false });
    });

    const { result } = renderHook(() => useOtherSiteStockMap(["ms1", "ms2"], "site-1"));

    await waitFor(() => expect(result.current.get("ms1")).toEqual({ siteName: "Pune Bypass", quantity: 40, unit: "Bag" }));
    expect(result.current.has("ms2")).toBe(false);
    expect(authedFetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/stock/material-size/ms1/other-sites?excludeSiteId=site-1"),
    );
  });

  it("fetches each distinct id only once even when the same materialSizeId appears in multiple rows", async () => {
    authedFetchMock.mockResolvedValue({ ok: true, json: async () => [] });

    renderHook(() => useOtherSiteStockMap(["ms1", "ms1", "ms1"], "site-1"));

    await waitFor(() => expect(authedFetchMock).toHaveBeenCalledTimes(1));
  });

  it("returns an empty Map when there is no Site to exclude yet", () => {
    const { result } = renderHook(() => useOtherSiteStockMap(["ms1"], null));
    expect(result.current.size).toBe(0);
    expect(authedFetchMock).not.toHaveBeenCalled();
  });

  it("returns an empty Map when there are no materialSizeIds to look up", () => {
    const { result } = renderHook(() => useOtherSiteStockMap([null, undefined], "site-1"));
    expect(result.current.size).toBe(0);
    expect(authedFetchMock).not.toHaveBeenCalled();
  });
});
