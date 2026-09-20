// Client-side autosave for the in-progress mobile DSR form (dsr/new).
//
// This is NOT the server-side DRAFT row (POST /dsr/draft) and NOT the
// offline submission queue (lib/offline-db.ts) — both of those hold work
// the Supervisor explicitly handed over. This is the safety net underneath
// them: a continuously-written localStorage snapshot of what's typed into
// the form RIGHT NOW, so an accidental app close / tab kill / crash
// mid-entry doesn't force re-entering everything. It is cleared the moment
// the entries reach any durable home (draft saved, submitted, or queued).
//
// localStorage rather than IndexedDB: the snapshot is small JSON (no photo
// bytes — File objects aren't serializable here; the restore banner tells
// the user photos must be re-attached), and synchronous writes can't lose a
// race with the page being killed.
//
// Client-readiness batch (goal 8, 2026-09-20): keyed per (siteId,
// reportDate) — a single global key meant switching Site/Date mid-session
// showed the PREVIOUS pair's entries under the new one (and saving under
// the new one silently overwrote the previous pair's own snapshot). Every
// (Site, Date) combination now gets its own storage slot.

const STORAGE_KEY_PREFIX = "dsr-autosave-v1";

function storageKey(siteId: string, reportDate: string): string {
  return `${STORAGE_KEY_PREFIX}:${siteId}:${reportDate}`;
}

// Restores older than this are more likely to confuse (wrong-day report
// submitted from a stale restore) than to help — a Supervisor finishing an
// interrupted report comes back within a shift or two.
const MAX_AGE_MS = 48 * 60 * 60 * 1000;

interface Envelope<T> {
  savedAt: number;
  data: T;
}

export function saveDsrAutosave<T>(siteId: string, reportDate: string, data: T): void {
  try {
    const envelope: Envelope<T> = { savedAt: Date.now(), data };
    window.localStorage.setItem(storageKey(siteId, reportDate), JSON.stringify(envelope));
  } catch {
    // Quota/private-mode failures must never break the form itself.
  }
}

export function loadDsrAutosave<T>(siteId: string, reportDate: string): { savedAt: number; data: T } | null {
  try {
    const raw = window.localStorage.getItem(storageKey(siteId, reportDate));
    if (!raw) return null;
    const envelope = JSON.parse(raw) as Envelope<T>;
    if (
      typeof envelope !== "object" ||
      envelope === null ||
      typeof envelope.savedAt !== "number" ||
      envelope.data === undefined
    ) {
      return null;
    }
    if (Date.now() - envelope.savedAt > MAX_AGE_MS) {
      window.localStorage.removeItem(storageKey(siteId, reportDate));
      return null;
    }
    return envelope;
  } catch {
    return null;
  }
}

export function clearDsrAutosave(siteId: string, reportDate: string): void {
  try {
    window.localStorage.removeItem(storageKey(siteId, reportDate));
  } catch {
    // Same rationale as saveDsrAutosave.
  }
}

// Mount-time-only lookup: at page load there is no (siteId, reportDate) yet
// to key off — the whole point is discovering which pair the Supervisor was
// last mid-entry on. Scans every per-pair slot this device holds and
// returns the most recently written one (pruning any past MAX_AGE_MS along
// the way). Once a pair is known, every subsequent read goes through the
// keyed loadDsrAutosave(siteId, reportDate) above so switching between two
// already-known pairs never cross-contaminates (goal 8).
export function loadMostRecentDsrAutosave<T>(): { savedAt: number; data: T } | null {
  try {
    let best: { savedAt: number; data: T } | null = null;
    // Snapshot every matching key BEFORE removing any of them — removing an
    // expired key mid-scan shifts every later index down by one, so
    // continuing the same `localStorage.key(i)` scan by index skips
    // whatever just shifted into the removed slot (a still-valid autosave
    // for a different Site/Date could be silently skipped and never
    // offered for restore).
    const keys: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith(`${STORAGE_KEY_PREFIX}:`)) keys.push(key);
    }
    for (const key of keys) {
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;
      let envelope: Envelope<T>;
      try {
        envelope = JSON.parse(raw) as Envelope<T>;
      } catch {
        continue;
      }
      if (
        typeof envelope !== "object" ||
        envelope === null ||
        typeof envelope.savedAt !== "number" ||
        envelope.data === undefined
      ) {
        continue;
      }
      if (Date.now() - envelope.savedAt > MAX_AGE_MS) {
        window.localStorage.removeItem(key);
        continue;
      }
      if (!best || envelope.savedAt > best.savedAt) {
        best = envelope;
      }
    }
    return best;
  } catch {
    return null;
  }
}
