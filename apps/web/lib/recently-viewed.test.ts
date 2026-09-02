import { renderHook } from "@testing-library/react";
import { act } from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { clearRecentlyViewed, recordRecentlyViewed, useRecentlyViewed } from "./recently-viewed";

const KEY = "azentisfieldos:recently-viewed";

function storedList(): unknown[] {
  const raw = window.localStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : [];
}

beforeEach(() => {
  window.localStorage.clear();
  // Drop any accumulated pub-sub subscribers/cached snapshot from a
  // previous test's unmounted hook by clearing storage — recordRecentlyViewed
  // below always re-derives from a fresh clean slate.
  clearRecentlyViewed();
});

describe("recently-viewed", () => {
  it("records a view as the sole, front entry", () => {
    recordRecentlyViewed({ type: "site", id: "site-1", name: "NH-48 Widening" });

    expect(storedList()).toEqual([{ type: "site", id: "site-1", name: "NH-48 Widening" }]);
  });

  it("adds new views to the front, most-recent-first", () => {
    recordRecentlyViewed({ type: "site", id: "site-1", name: "NH-48 Widening" });
    recordRecentlyViewed({ type: "vendor", id: "vendor-1", name: "Acme Traders" });

    expect(storedList()).toEqual([
      { type: "vendor", id: "vendor-1", name: "Acme Traders" },
      { type: "site", id: "site-1", name: "NH-48 Widening" },
    ]);
  });

  it("moves a re-viewed record to the front instead of duplicating it", () => {
    recordRecentlyViewed({ type: "site", id: "site-1", name: "NH-48 Widening" });
    recordRecentlyViewed({ type: "vendor", id: "vendor-1", name: "Acme Traders" });
    recordRecentlyViewed({ type: "site", id: "site-1", name: "NH-48 Widening" });

    expect(storedList()).toEqual([
      { type: "site", id: "site-1", name: "NH-48 Widening" },
      { type: "vendor", id: "vendor-1", name: "Acme Traders" },
    ]);
  });

  it("dedupes by type+id, not by id alone", () => {
    recordRecentlyViewed({ type: "site", id: "1", name: "Site One" });
    recordRecentlyViewed({ type: "vendor", id: "1", name: "Vendor One" });

    expect(storedList()).toEqual([
      { type: "vendor", id: "1", name: "Vendor One" },
      { type: "site", id: "1", name: "Site One" },
    ]);
  });

  it("caps at 6, dropping the oldest", () => {
    for (let i = 1; i <= 7; i += 1) {
      recordRecentlyViewed({ type: "site", id: `site-${i}`, name: `Site ${i}` });
    }

    const list = storedList() as { id: string }[];
    expect(list).toHaveLength(6);
    expect(list.map((entry) => entry.id)).toEqual([
      "site-7",
      "site-6",
      "site-5",
      "site-4",
      "site-3",
      "site-2",
    ]);
    expect(list.some((entry) => entry.id === "site-1")).toBe(false);
  });

  it("clearRecentlyViewed wipes the list", () => {
    recordRecentlyViewed({ type: "site", id: "site-1", name: "NH-48 Widening" });
    clearRecentlyViewed();

    expect(window.localStorage.getItem(KEY)).toBeNull();
  });

  it("degrades to an empty list instead of crashing on corrupted storage", () => {
    window.localStorage.setItem(KEY, "{not json");

    const { result } = renderHook(() => useRecentlyViewed());

    expect(result.current).toEqual([]);
  });

  describe("useRecentlyViewed", () => {
    it("reflects a pre-existing stored list on first read", () => {
      window.localStorage.setItem(
        KEY,
        JSON.stringify([{ type: "site", id: "site-1", name: "NH-48 Widening" }]),
      );

      const { result } = renderHook(() => useRecentlyViewed());

      expect(result.current).toEqual([{ type: "site", id: "site-1", name: "NH-48 Widening" }]);
    });

    it("updates live when recordRecentlyViewed is called in the same tab (real subscription, not the storage event)", () => {
      const { result } = renderHook(() => useRecentlyViewed());
      expect(result.current).toEqual([]);

      act(() => {
        recordRecentlyViewed({ type: "vendor", id: "vendor-1", name: "Acme Traders" });
      });

      expect(result.current).toEqual([{ type: "vendor", id: "vendor-1", name: "Acme Traders" }]);
    });

    it("updates live when clearRecentlyViewed is called (sign-out in the same tab)", () => {
      recordRecentlyViewed({ type: "vendor", id: "vendor-1", name: "Acme Traders" });
      const { result } = renderHook(() => useRecentlyViewed());
      expect(result.current).toHaveLength(1);

      act(() => {
        clearRecentlyViewed();
      });

      expect(result.current).toEqual([]);
    });
  });
});
