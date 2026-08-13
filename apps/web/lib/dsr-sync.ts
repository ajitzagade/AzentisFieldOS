import { listQueuedDsrs, removeQueuedDsr } from "./offline-db";

// AC #2/#3: drains the local queue and POSTs each entry to the server.
// Every queued payload already carries clientGeneratedId on its
// consumptions/rmcEntries/expenses (set at queue-write time in
// offline-db.ts), and the DSR/WorkRecord rows upsert on their own natural
// keys server-side (story 3.2 Task 2) — so a retried sync, including this
// same drain firing twice concurrently, can never create a duplicate.
//
// Sync is silent on success: no confirmation dialog, no navigation change
// (AC #2). A queued item that fails to sync (still offline, 5xx, or a
// genuine conflict) is left queued and retried on the next trigger —
// never surfaced as a failure, since "submitting never fails" from the
// user's point of view (Task 1).
export async function syncQueuedDsrs(apiUrl: string, onSynced?: (localKey: string) => void): Promise<void> {
  const queued = await listQueuedDsrs();

  for (const item of queued) {
    try {
      const res = await fetch(`${apiUrl}/dsr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item.payload),
      });

      if (res.ok) {
        await removeQueuedDsr(item.localKey);
        onSynced?.(item.localKey);
      }
    } catch {
      // Still offline, or the request failed outright — leave it queued.
    }
  }
}
