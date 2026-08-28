"use client";

import { useEffect, useMemo, useState } from "react";
import type { ComboboxFieldOption, FieldHintTone } from "@azentisfieldos/ui";
import { useAuthedFetch } from "./use-authed-fetch";

// Current stock per Material Size for one stock location (a Site or the
// Godown) — surfaced next to Material pickers so the person recording an
// outflow sees what's actually available before the stock-safety floor
// check would reject the entry server-side. Read-only; the materialized
// SiteStock/GodownStock balances are the source of truth (FR-14).
export interface StockEntry {
  quantity: number;
  unit?: string;
}

export type StockScope = { kind: "site"; siteId: string } | { kind: "godown" };

interface StockRow {
  materialSizeId: string;
  quantity: number | string;
  materialSize?: { material?: { unit?: { name: string } | null } | null } | null;
}

export interface StockLookup {
  bySizeId: Map<string, StockEntry>;
  loading: boolean;
}

function scopeKey(scope: StockScope | null): string | null {
  if (!scope) return null;
  return scope.kind === "godown" ? "godown" : `site:${scope.siteId}`;
}

function scopePath(scope: StockScope): string {
  return scope.kind === "godown" ? "/stock/godown" : `/stock/site/${scope.siteId}`;
}

export function useStock(scope: StockScope | null): StockLookup {
  const authedFetch = useAuthedFetch();
  const key = scopeKey(scope);
  const path = scope ? scopePath(scope) : null;
  // Keyed by location so switching Sites never shows the previous
  // location's balances, without an eager synchronous reset inside the
  // effect.
  const [state, setState] = useState<{ key: string; rows: StockRow[] } | null>(null);

  useEffect(() => {
    if (!key || !path) {
      return;
    }
    let cancelled = false;
    authedFetch(path)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: StockRow[]) => {
        // Defensive: an auth redirect or proxy error page must degrade to
        // "no stock info", never crash the form.
        if (!cancelled) setState({ key, rows: Array.isArray(data) ? data : [] });
      })
      .catch(() => {
        if (!cancelled) setState({ key, rows: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [key, path, authedFetch]);

  // Derived, not a second state cell: loading whenever a location is
  // selected and the rows we hold aren't for that location yet.
  const loading = Boolean(key) && (!state || state.key !== key);

  const bySizeId = useMemo(() => {
    const map = new Map<string, StockEntry>();
    const rows = state && state.key === key ? state.rows : [];
    for (const row of rows) {
      map.set(row.materialSizeId, {
        quantity: Number(row.quantity),
        unit: row.materialSize?.material?.unit?.name,
      });
    }
    return map;
  }, [state, key]);

  return { bySizeId, loading };
}

export function useSiteStock(siteId: string | null | undefined): StockLookup {
  return useStock(siteId ? { kind: "site", siteId } : null);
}

export function useGodownStock(enabled = true): StockLookup {
  return useStock(enabled ? { kind: "godown" } : null);
}

function formatQuantity(entry: StockEntry): string {
  return `${entry.quantity.toLocaleString("en-IN")}${entry.unit ? ` ${entry.unit}` : ""}`;
}

export interface StockStatus {
  text: string;
  tone: FieldHintTone;
  /** True when the entered quantity exceeds the available balance. */
  insufficient: boolean;
}

// One shared wording for every Material picker in the app: what is
// available at the chosen location right now, and — once a quantity is
// typed — whether that entry would overdraw it. The warning is advisory;
// the API's stock floor remains the enforcing check.
export function stockStatus({
  stock,
  materialSizeId,
  quantity,
  location,
}: {
  stock: StockLookup;
  materialSizeId: string | null | undefined;
  quantity?: string;
  location: string;
}): { text: string; tone: FieldHintTone; insufficient: boolean } | undefined {
  if (!materialSizeId) return undefined;
  if (stock.loading) {
    return { text: "Checking available stock…", tone: "default", insufficient: false };
  }
  const entry = stock.bySizeId.get(materialSizeId);
  if (!entry) {
    return { text: `No stock recorded at ${location}`, tone: "warning", insufficient: false };
  }
  if (entry.quantity <= 0) {
    return { text: `No stock available at ${location}`, tone: "warning", insufficient: false };
  }
  const available = formatQuantity(entry);
  const entered = Number(quantity);
  if (quantity?.trim() && Number.isFinite(entered) && entered > entry.quantity) {
    return {
      text: `Insufficient stock — only ${available} available at ${location}`,
      tone: "danger",
      insufficient: true,
    };
  }
  return { text: `${available} available at ${location}`, tone: "positive", insufficient: false };
}

// Right-aligned stock figure for each option in a Material picker's list,
// so availability is visible while searching — before anything is chosen.
// While the balances are still loading the options stay meta-free rather
// than claiming "No stock".
export function withStockMeta(options: ComboboxFieldOption[], stock: StockLookup): ComboboxFieldOption[] {
  if (stock.loading) return options;
  return options.map((option) => {
    const entry = stock.bySizeId.get(option.value);
    if (!entry || entry.quantity <= 0) {
      return { ...option, meta: "No stock", metaTone: "warning" as const };
    }
    return { ...option, meta: formatQuantity(entry), metaTone: "default" as const };
  });
}
