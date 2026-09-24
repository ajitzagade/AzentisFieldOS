import Dexie, { type EntityTable } from "dexie";
import type { CreateDsrInput, SaveDraftInput } from "@azentisfieldos/shared";

// Story 3.2 (AD-8, AC #1/#4): a DSR submission that can't reach the server
// is saved here instead of being surfaced as a failure. Keyed by
// `localKey` = `${siteId}:${reportDate}` — the same natural key the server
// upserts DailySiteReport on — so a second local submission for the same
// Site/date overwrites the queued item rather than appending a duplicate
// queue entry (AC #4), mirroring the server-side upsert story 3.1's
// online-only "reject a true duplicate" rule doesn't apply to here.
export interface QueuedDsr {
  localKey: string;
  payload: CreateDsrInput;
  queuedAt: string;
}

class OfflineDb extends Dexie {
  queuedDsrs!: EntityTable<QueuedDsr, "localKey">;

  constructor() {
    super("azentisfieldos-offline");
    this.version(1).stores({
      queuedDsrs: "localKey, queuedAt",
    });
  }
}

// Client-only: Dexie needs IndexedDB, which doesn't exist during SSR.
// Every call site of this module already runs inside a "use client"
// component's event handler or effect, never at module-eval time on the
// server, so a plain lazy singleton is safe.
let db: OfflineDb | null = null;

function getDb(): OfflineDb {
  if (!db) db = new OfflineDb();
  return db;
}

export function localDsrKey(siteId: string, reportDate: string): string {
  return `${siteId}:${reportDate}`;
}

// Sub-records with no natural composite key (consumptions/rmcEntries/
// expenses) get a client-generated UUID at queue-write time, not at sync
// time, so a retried sync (e.g. the app closes and reopens mid-sync)
// reuses the same keys instead of creating duplicates.
//
// Typed against the looser SaveDraftInput (not CreateDsrInput) — its own
// caller, buildPayload() in dsr/new/page.tsx, is shared by both Save Draft
// and Submit, and a valid CreateDsrInput value already structurally
// satisfies SaveDraftInput (required fields trivially satisfy the looser
// optional ones), so this stays correct for both callers.
export function withClientGeneratedIds<T extends SaveDraftInput>(input: T): T {
  // subcontractorEntries (the one field whose shape actually differs
  // between CreateDsrInput and SaveDraftInput) passes through untouched via
  // the spread below — only consumptions/rmcEntries/expenses are rebuilt —
  // so the result is genuinely still a T, TS just can't verify an object
  // literal against a generic type parameter on its own.
  return {
    ...input,
    consumptions: input.consumptions.map((c) => ({ ...c, clientGeneratedId: c.clientGeneratedId ?? crypto.randomUUID() })),
    rmcEntries: input.rmcEntries.map((r) => ({ ...r, clientGeneratedId: r.clientGeneratedId ?? crypto.randomUUID() })),
    expenses: input.expenses.map((e) => ({ ...e, clientGeneratedId: e.clientGeneratedId ?? crypto.randomUUID() })),
  } as T;
}

export async function queueDsr(input: CreateDsrInput): Promise<void> {
  const payload = withClientGeneratedIds(input);
  const localKey = localDsrKey(payload.siteId, payload.reportDate);
  await getDb().queuedDsrs.put({ localKey, payload, queuedAt: new Date().toISOString() });
}

export async function listQueuedDsrs(): Promise<QueuedDsr[]> {
  return getDb().queuedDsrs.toArray();
}

export async function removeQueuedDsr(localKey: string): Promise<void> {
  await getDb().queuedDsrs.delete(localKey);
}

export async function isQueued(siteId: string, reportDate: string): Promise<boolean> {
  const row = await getDb().queuedDsrs.get(localDsrKey(siteId, reportDate));
  return row !== undefined;
}
