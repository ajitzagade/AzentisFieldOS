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

export interface OtherSiteStockEntry {
  siteName: string;
  quantity: number;
  unit?: string;
}

interface OtherSiteStockRow {
  siteName: string;
  quantity: number | string;
  unit?: string;
}

// Informational-only "is this Material sitting at some other Site" lookup
// (2026-09-23) — deliberately separate from useSiteStock/useGodownStock.
// This never participates in the stock-safety floor check (that's still
// 100% server-side, current Site + Godown only, unchanged); it exists
// purely so the picker can name where else a Material physically is,
// same motivation as the Godown "elsewhere" hint but for Sites, which
// have no automatic fallback — using this stock still requires a real,
// separately-recorded Site-to-Site Transfer first.
//
// A Map keyed by materialSizeId, not a single-value hook, so a form with
// several independent picker rows (DSR's Materials Used) can call this
// ONCE at the top level with every row's materialSizeId and look up each
// row's result with a plain Map.get() during render — calling a hook
// inside a per-row .map() would violate the Rules of Hooks (a variable,
// row-count-dependent number of hook calls). Works identically for a
// single-picker form (standalone Consumption) with a one-element array.
export function useOtherSiteStockMap(
  materialSizeIds: (string | null | undefined)[],
  excludeSiteId: string | null | undefined,
): Map<string, OtherSiteStockEntry> {
  const authedFetch = useAuthedFetch();
  const ids = useMemo(
    () => Array.from(new Set(materialSizeIds.filter((id): id is string => Boolean(id)))).sort(),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally
    // keyed on the joined value, not the array reference, which is a new
    // array every render even when its contents haven't changed.
    [materialSizeIds.join("|")],
  );
  const key = excludeSiteId && ids.length > 0 ? `${excludeSiteId}:${ids.join("|")}` : null;
  const [state, setState] = useState<{ key: string; map: Map<string, OtherSiteStockEntry> } | null>(null);

  useEffect(() => {
    if (!key || !excludeSiteId) return;
    let cancelled = false;
    Promise.all(
      ids.map((id) =>
        authedFetch(`/stock/material-size/${id}/other-sites?excludeSiteId=${excludeSiteId}`)
          .then((res) => (res.ok ? res.json() : []))
          .then((rows: OtherSiteStockRow[]) => [id, rows[0]] as const)
          .catch(() => [id, undefined] as const),
      ),
    ).then((results) => {
      if (cancelled) return;
      const map = new Map<string, OtherSiteStockEntry>();
      // API already sorts each Material Size's own rows by quantity
      // descending — the largest Site balance is the single most useful
      // one to name.
      for (const [id, top] of results) {
        if (top) map.set(id, { siteName: top.siteName, quantity: Number(top.quantity), unit: top.unit });
      }
      setState({ key, map });
    });
    return () => {
      cancelled = true;
    };
  }, [key, excludeSiteId, ids, authedFetch]);

  return state && state.key === key ? state.map : new Map();
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

// Unlike elsewhereEntry above (which only reports a location as "found"
// once its balance is positive — the right rule for surfacing "X available
// elsewhere"), a Unit label is still worth knowing even when the balance
// there is exactly zero. Used as a last-resort fallback so an "Insufficient
// stock" message never silently drops the Unit just because the only row
// that happens to carry one has a zero quantity.
function elsewhereUnit(materialSizeId: string, elsewhere?: ElsewhereStock): string | undefined {
  if (!elsewhere || elsewhere.stock.loading) return undefined;
  return elsewhere.stock.bySizeId.get(materialSizeId)?.unit;
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
  otherSite,
}: {
  stock: StockLookup;
  materialSizeId: string | null | undefined;
  quantity?: string;
  location: string;
  elsewhere?: ElsewhereStock;
  /** Informational only — see useOtherSiteStock's own comment. Never
   * affects the insufficient/combined-quantity math below, only shown
   * when there is otherwise nothing to say about `location`/`elsewhere`. */
  otherSite?: OtherSiteStockEntry | null;
}): { text: string; tone: FieldHintTone; insufficient: boolean } | undefined {
  if (!materialSizeId) return undefined;
  if (stock.loading) {
    return { text: "Checking available stock…", tone: "default", insufficient: false };
  }
  const entry = stock.bySizeId.get(materialSizeId);
  const elsewhereFound = elsewhereEntry(materialSizeId, elsewhere);
  // Bugfix (2026-09-23, follow-up): when `location` has nothing but
  // `elsewhere` (Godown) does, the draw will actually succeed via the
  // Site-then-Godown fallback — so this reads as reassurance, not a
  // warning. Kept short per user request; unchanged when neither location
  // has any stock (the genuine dead-end case still needs the plain
  // "No stock" wording below).
  const willUseElsewhere = elsewhereFound
    ? { text: `Not at ${location} — ${formatQuantity(elsewhereFound)} at ${elsewhere?.label}, will be used`, tone: "positive" as const, insufficient: false }
    : undefined;
  // Named-but-not-automatic (2026-09-23): unlike the Godown, there's no
  // automatic Site-to-Site fallback — the stock floor check never looks at
  // another Site's balance, so this is purely "here's where it is", never
  // a promise it'll be used. Only surfaced when Godown doesn't already
  // cover it (willUseElsewhere) — an actionable, auto-resolving answer
  // always wins over a merely informational one.
  const otherSiteHint = !willUseElsewhere && otherSite
    ? { text: `Not at ${location} — ${formatQuantity(otherSite)} at ${otherSite.siteName}, purchase for ${location}`, tone: "warning" as const, insufficient: false }
    : undefined;

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
  const quantityEntered = Boolean(quantity?.trim()) && Number.isFinite(entered);
  // Review fix (loop 1): while the elsewhere (Godown) balance is still
  // being fetched, elsewhereQty reads as 0 (elsewhereEntry itself treats a
  // loading lookup as "nothing found") — so without this guard, an amount
  // that only looks insufficient because Godown hasn't loaded yet would
  // flash "Insufficient stock" for a moment before flipping to sufficient
  // once the fetch resolves. Scoped to just the insufficiency check (not a
  // top-level early return like `stock.loading` above) so the "no balance
  // recorded/zero" wording below — shown before anything is typed — is
  // unaffected.
  const elsewhereLoading = Boolean(elsewhere && elsewhere.stock.loading);
  const insufficientCombined =
    !elsewhereLoading && quantityEntered && entered > combinedQty;
  const insufficientStatus = (): { text: string; tone: FieldHintTone; insufficient: boolean } => ({
    text: elsewhereFound
      ? `Insufficient stock — only ${formatQuantity({ quantity: combinedQty, unit: elsewhereFound.unit })} available combined (${location} + ${elsewhere?.label})`
      // Review fix (loop 1): entry can be null here (no balance row at
      // `location` at all) — fall back to elsewhere's own Unit too (even
      // a zero-quantity elsewhere row still carries one), so the message
      // never silently drops the unit.
      : `Insufficient stock — only ${formatQuantity({ quantity: combinedQty, unit: entry?.unit ?? elsewhereUnit(materialSizeId, elsewhere) })} available at ${location}`,
    tone: "danger",
    insufficient: true,
  });

  if (!entry) {
    if (insufficientCombined) return insufficientStatus();
    if (willUseElsewhere) return willUseElsewhere;
    if (otherSiteHint) return otherSiteHint;
    return { text: `No stock recorded at ${location}`, tone: "warning", insufficient: false };
  }
  if (entry.quantity <= 0) {
    if (insufficientCombined) return insufficientStatus();
    if (willUseElsewhere) return willUseElsewhere;
    if (otherSiteHint) return otherSiteHint;
    return { text: `No stock available at ${location}`, tone: "warning", insufficient: false };
  }
  const available = formatQuantity(entry);
  if (insufficientCombined) return insufficientStatus();
  // Review fix (loop 1): when the entered quantity is sufficient only
  // because of the Godown fallback (it exceeds what's at `location`
  // alone), say so — otherwise the hint reads "5 available at this Site"
  // for an entry of 20 that will actually succeed, which looks like a
  // stale/wrong number rather than a fallback draw.
  if (elsewhereFound && quantityEntered && entered > entry.quantity) {
    const fromElsewhere = formatQuantity({
      quantity: entered - entry.quantity,
      unit: elsewhereFound.unit,
    });
    return {
      text: `${available} available at ${location} — the remaining ${fromElsewhere} will draw from ${elsewhere?.label}`,
      tone: "positive",
      insufficient: false,
    };
  }
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
