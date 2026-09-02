"use client";

import { useSyncExternalStore } from "react";

// Story 19.6: generalizes site-field.tsx's single remembered-Site idiom
// (LAST_SITE_STORAGE_KEY) into a device-local MRU list spanning four entity
// types, rendered as the Dashboard's "recently viewed" chip row. Same
// try/catch-around-`window.localStorage` safety net as SiteField (blocked
// storage in private/embedded webviews must degrade to "nothing recorded",
// never crash a detail-page mount or the Dashboard render) — but unlike
// SiteField's deliberately inert subscribe (latched at mount, since a Site
// picker mid-entry must not be swapped from under the user by another tab),
// this needs a *real* subscription: a Site/Vendor/Team Member/Subcontractor
// detail page mounted earlier in the same tab must show up in the
// Dashboard's row without a full reload, and the browser's cross-tab
// `storage` event never fires in the tab that wrote it. So this hand-rolls
// a tiny pub-sub that fires on the utility's own write calls
// (recordRecentlyViewed/clearRecentlyViewed).
const STORAGE_KEY = "azentisfieldos:recently-viewed";
const MAX_ENTRIES = 6;

export type RecentlyViewedType = "site" | "vendor" | "team-member" | "subcontractor";

const VALID_TYPES: readonly RecentlyViewedType[] = ["site", "vendor", "team-member", "subcontractor"];

export interface RecentlyViewedEntry {
  type: RecentlyViewedType;
  id: string;
  name: string;
}

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  for (const listener of listeners) listener();
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function isRecentlyViewedEntry(value: unknown): value is RecentlyViewedEntry {
  if (!value || typeof value !== "object") return false;
  const entry = value as Record<string, unknown>;
  return (
    typeof entry.id === "string" &&
    typeof entry.name === "string" &&
    typeof entry.type === "string" &&
    VALID_TYPES.includes(entry.type as RecentlyViewedType)
  );
}

const EMPTY_LIST: RecentlyViewedEntry[] = [];

function safeGetItem(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

// A malformed/corrupted value must degrade to an empty list rather than
// crash the Dashboard.
function parseList(raw: string): RecentlyViewedEntry[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY_LIST;
    return parsed.filter(isRecentlyViewedEntry);
  } catch {
    return EMPTY_LIST;
  }
}

function writeList(list: RecentlyViewedEntry[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // remembering is a convenience — never let blocked storage break the view
  }
}

// getSnapshot() must hand back a referentially-stable array whenever the
// underlying value hasn't changed (React's useSyncExternalStore re-renders
// on every reference change, and would infinite-loop if a fresh array came
// back on every call). Comparing the raw stored string is what makes that
// safe *and* correct: an out-of-band write this module didn't make itself
// (another tab, or a test seeding localStorage directly before first read)
// is still picked up the next time anything asks, unlike a plain
// read-once-and-cache-forever memo.
let cachedRaw: string | null | undefined;
let cachedList: RecentlyViewedEntry[] = EMPTY_LIST;

function readCurrentList(): RecentlyViewedEntry[] {
  const raw = safeGetItem();
  if (raw === cachedRaw) return cachedList;
  cachedRaw = raw;
  cachedList = raw ? parseList(raw) : EMPTY_LIST;
  return cachedList;
}

// Records (or re-records) a view: moves an existing type+id entry to the
// front instead of duplicating it, drops the oldest once past MAX_ENTRIES.
export function recordRecentlyViewed(entry: RecentlyViewedEntry) {
  const current = readCurrentList();
  const deduped = current.filter((item) => !(item.type === entry.type && item.id === entry.id));
  const next = [entry, ...deduped].slice(0, MAX_ENTRIES);
  writeList(next);
  cachedRaw = JSON.stringify(next);
  cachedList = next;
  notify();
}

export function clearRecentlyViewed() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // nothing to clear where storage is unavailable
  }
  cachedRaw = null;
  cachedList = EMPTY_LIST;
  notify();
}

function getSnapshot(): RecentlyViewedEntry[] {
  return readCurrentList();
}

// The server snapshot is a fixed empty array (not `[]` inline, so its
// reference is stable across calls) — SSR and hydration render no chip row,
// and the client's first post-hydration render applies whatever is
// actually on this device, matching SiteField's useSyncExternalStore idiom.
function getServerSnapshot(): RecentlyViewedEntry[] {
  return EMPTY_LIST;
}

export function useRecentlyViewed(): RecentlyViewedEntry[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
