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

const STORAGE_KEY = "dsr-autosave-v1";

// Restores older than this are more likely to confuse (wrong-day report
// submitted from a stale restore) than to help — a Supervisor finishing an
// interrupted report comes back within a shift or two.
const MAX_AGE_MS = 48 * 60 * 60 * 1000;

interface Envelope<T> {
  savedAt: number;
  data: T;
}

export function saveDsrAutosave<T>(data: T): void {
  try {
    const envelope: Envelope<T> = { savedAt: Date.now(), data };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
  } catch {
    // Quota/private-mode failures must never break the form itself.
  }
}

export function loadDsrAutosave<T>(): { savedAt: number; data: T } | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
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
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return envelope;
  } catch {
    return null;
  }
}

export function clearDsrAutosave(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Same rationale as saveDsrAutosave.
  }
}
