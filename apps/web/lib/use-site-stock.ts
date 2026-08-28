"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuthedFetch } from "./use-authed-fetch";

// Current Site Stock per Material Size for one Site — surfaced next to
// Material pickers so the person recording consumption sees what's
// actually available before the stock-safety floor check would reject the
// entry server-side. Read-only; the materialized SiteStock balance is the
// source of truth (FR-14).
export interface SiteStockEntry {
  quantity: number;
  unit?: string;
}

interface SiteStockRow {
  materialSizeId: string;
  quantity: number | string;
  materialSize?: { material?: { unit?: { name: string } | null } | null } | null;
}

export function useSiteStock(siteId: string | null | undefined): {
  bySizeId: Map<string, SiteStockEntry>;
  loading: boolean;
} {
  const authedFetch = useAuthedFetch();
  // Keyed by Site so switching Sites never shows the previous Site's
  // balances, without an eager synchronous reset inside the effect.
  const [state, setState] = useState<{ siteId: string; rows: SiteStockRow[] } | null>(null);

  useEffect(() => {
    if (!siteId) {
      return;
    }
    let cancelled = false;
    authedFetch(`/stock/site/${siteId}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: SiteStockRow[]) => {
        // Defensive: an auth redirect or proxy error page must degrade to
        // "no stock info", never crash the form.
        if (!cancelled) setState({ siteId, rows: Array.isArray(data) ? data : [] });
      })
      .catch(() => {
        if (!cancelled) setState({ siteId, rows: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [siteId, authedFetch]);

  // Derived, not a second state cell: loading whenever a Site is selected
  // and the rows we hold aren't for that Site yet.
  const loading = Boolean(siteId) && (!state || state.siteId !== siteId);

  const bySizeId = useMemo(() => {
    const map = new Map<string, SiteStockEntry>();
    const rows = state && state.siteId === siteId ? state.rows : [];
    for (const row of rows) {
      map.set(row.materialSizeId, {
        quantity: Number(row.quantity),
        unit: row.materialSize?.material?.unit?.name,
      });
    }
    return map;
  }, [state, siteId]);

  return { bySizeId, loading };
}

export function formatAvailableStock(entry: SiteStockEntry | undefined): string {
  if (!entry) return "No stock recorded at this Site";
  return `${entry.quantity.toLocaleString("en-IN")}${entry.unit ? ` ${entry.unit}` : ""} available at this Site`;
}
