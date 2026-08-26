import { afterEach, describe, expect, it, vi } from "vitest";
import type { CreateDsrInput } from "@azentisfieldos/shared";
import { listQueuedDsrs, queueDsr, removeQueuedDsr } from "./offline-db";
import { syncQueuedDsrs } from "./dsr-sync";
import type { AuthedFetch } from "./authed-fetch-core";

// Story 1.8: syncQueuedDsrs now takes the shared authed-fetch helper (which
// attaches a fresh Clerk token per call) instead of a base URL. These tests
// stand in a mock authedFetch for it.
function authedFetchThat(impl: (path: string, init?: RequestInit) => Promise<Response>): AuthedFetch {
  return vi.fn(impl) as unknown as AuthedFetch;
}

function basePayload(overrides: Partial<CreateDsrInput> = {}): CreateDsrInput {
  return {
    siteId: "site-1",
    reportDate: "2026-08-12",
    workRecords: [],
    consumptions: [],
    rmcEntries: [],
    expenses: [],
    equipmentUsed: [],
    ...overrides,
  };
}

const originalFetch = global.fetch;

afterEach(async () => {
  global.fetch = originalFetch;
  const rows = await listQueuedDsrs();
  await Promise.all(rows.map((row) => removeQueuedDsr(row.localKey)));
  vi.restoreAllMocks();
});

describe("syncQueuedDsrs", () => {
  it("POSTs every queued item and removes it from the queue on success, notifying via onSynced", async () => {
    await queueDsr(basePayload({ siteId: "site-a", reportDate: "2026-08-12" }));
    const authedFetch = authedFetchThat(async () => ({ ok: true, status: 201, json: async () => ({}) }) as Response);
    const onSynced = vi.fn();

    await syncQueuedDsrs(authedFetch, onSynced);

    expect(authedFetch).toHaveBeenCalledWith("/dsr", expect.objectContaining({ method: "POST" }));
    expect(await listQueuedDsrs()).toHaveLength(0);
    expect(onSynced).toHaveBeenCalledWith("site-a:2026-08-12");
  });

  it("leaves an item queued (never surfaces a failure) when the server rejects it or the network fails", async () => {
    await queueDsr(basePayload({ siteId: "site-b", reportDate: "2026-08-13" }));
    const authedFetch = authedFetchThat(() => Promise.reject(new Error("offline")));
    const onSynced = vi.fn();

    await expect(syncQueuedDsrs(authedFetch, onSynced)).resolves.toBeUndefined();

    expect(await listQueuedDsrs()).toHaveLength(1);
    expect(onSynced).not.toHaveBeenCalled();
  });
});
