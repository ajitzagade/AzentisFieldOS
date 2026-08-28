import { describe, expect, it } from "vitest";
import { stockStatus, withStockMeta, type StockLookup } from "./use-site-stock";

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
});
