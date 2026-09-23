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
  // Goal 1 (DSR/module data sync fixes): a long-lived DSR session
  // (autosave/draft/resume) can stay open across a Purchase/Movement
  // recorded elsewhere — the fetch effect below is keyed only on
  // key/path/authedFetch, so it never re-runs on its own. Bumping this
  // nonce on window focus forces a refetch without an eager poll, fixing
  // staleness at this one shared source for every consumer.
  const [focusNonce, setFocusNonce] = useState(0);

  useEffect(() => {
    function handleFocus() {
      setFocusNonce((n) => n + 1);
    }
    // Review fix (finding #7): this is a PWA/mobile-first app where
    // backgrounding/foregrounding a mobile browser tab — not a desktop
    // window losing/regaining OS focus — is the primary usage pattern.
    // `visibilitychange` is the more reliable "came back to foreground"
    // signal there (a mobile browser often doesn't fire `focus` at all on
    // tab-switch-back); `document.visibilityState === "visible"` guards
    // against the paired "went to background" firing too.
    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        setFocusNonce((n) => n + 1);
      }
    }
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

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
    // focusNonce is a deliberate refetch trigger — included in the deps
    // array below (not read inside the effect body) so a window focus
    // event forces a re-run of this same fetch.
  }, [key, path, authedFetch, focusNonce]);

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

/** A second location to check when the primary one has none — so "No
 * stock" never reads as "doesn't exist anywhere" when it's really "hasn't
 * been moved/purchased to this location yet" (a real, reported point of
 * confusion: a Material with real balance at the Godown showed a bare "No
 * stock" for a Site that simply never received it). */
export interface ElsewhereStock {
  label: string;
  stock: StockLookup;
}

function elsewhereEntry(materialSizeId: string, elsewhere?: ElsewhereStock): StockEntry | undefined {
  if (!elsewhere || elsewhere.stock.loading) return undefined;
  const entry = elsewhere.stock.bySizeId.get(materialSizeId);
  return entry && entry.quantity > 0 ? entry : undefined;
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
  elsewhere,
}: {
  stock: StockLookup;
  materialSizeId: string | null | undefined;
  quantity?: string;
  location: string;
  elsewhere?: ElsewhereStock;
}): { text: string; tone: FieldHintTone; insufficient: boolean } | undefined {
  if (!materialSizeId) return undefined;
  if (stock.loading) {
    return { text: "Checking available stock…", tone: "default", insufficient: false };
  }
  const entry = stock.bySizeId.get(materialSizeId);
  const elsewhereFound = elsewhereEntry(materialSizeId, elsewhere);
  const elsewhereHint = elsewhereFound
    ? ` — ${formatQuantity(elsewhereFound)} available at ${elsewhere?.label}`
    : "";

  // Bugfix (2026-09-23): Consumption now draws `location` stock first,
  // then falls back to `elsewhere` (the Godown) for the shortfall — so
  // whether an entered quantity is "insufficient" must be evaluated
  // against the combined balance, not `location` alone, or a Material
  // sitting in the Godown but never Moved to this Site would wrongly show
  // "Insufficient stock" even though the combined draw would succeed
  // server-side. Only this insufficiency check changes; the "no balance
  // recorded"/"balance is zero" informational wording below (shown while
  // nothing has been typed yet) is unchanged.
  const locationQty = entry && entry.quantity > 0 ? entry.quantity : 0;
  const elsewhereQty = elsewhereFound ? elsewhereFound.quantity : 0;
  const combinedQty = locationQty + elsewhereQty;
  const entered = Number(quantity);
  const insufficientCombined =
    Boolean(quantity?.trim()) && Number.isFinite(entered) && entered > combinedQty;
  const insufficientStatus = (): { text: string; tone: FieldHintTone; insufficient: boolean } => ({
    text: elsewhereFound
      ? `Insufficient stock — only ${formatQuantity({ quantity: combinedQty, unit: elsewhereFound.unit })} available combined (${location} + ${elsewhere?.label})`
      : `Insufficient stock — only ${formatQuantity({ quantity: combinedQty, unit: entry?.unit })} available at ${location}`,
    tone: "danger",
    insufficient: true,
  });

  if (!entry) {
    if (insufficientCombined) return insufficientStatus();
    return { text: `No stock recorded at ${location}${elsewhereHint}`, tone: "warning", insufficient: false };
  }
  if (entry.quantity <= 0) {
    if (insufficientCombined) return insufficientStatus();
    return { text: `No stock available at ${location}${elsewhereHint}`, tone: "warning", insufficient: false };
  }
  const available = formatQuantity(entry);
  if (insufficientCombined) return insufficientStatus();
  return { text: `${available} available at ${location}`, tone: "positive", insufficient: false };
}

// Right-aligned stock figure for each option in a Material picker's list,
// so availability is visible while searching — before anything is chosen.
// While the balances are still loading the options stay meta-free rather
// than claiming "No stock".
export function withStockMeta(
  options: ComboboxFieldOption[],
  stock: StockLookup,
  elsewhere?: ElsewhereStock,
): ComboboxFieldOption[] {
  if (stock.loading) return options;
  return options.map((option) => {
    const entry = stock.bySizeId.get(option.value);
    if (!entry || entry.quantity <= 0) {
      const found = elsewhereEntry(option.value, elsewhere);
      if (found) {
        return { ...option, meta: `${formatQuantity(found)} at ${elsewhere?.label}`, metaTone: "warning" as const };
      }
      return { ...option, meta: "No stock", metaTone: "warning" as const };
    }
    return { ...option, meta: formatQuantity(entry), metaTone: "default" as const };
  });
}
