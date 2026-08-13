import { afterEach, describe, expect, it, vi } from "vitest";
import type { CreateDsrInput } from "@azentisfieldos/shared";
import { listQueuedDsrs, queueDsr, removeQueuedDsr } from "./offline-db";
import { syncQueuedDsrs } from "./dsr-sync";

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
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 201, json: async () => ({}) }) as unknown as typeof fetch;
    const onSynced = vi.fn();

    await syncQueuedDsrs("http://localhost:3001", onSynced);

    expect(await listQueuedDsrs()).toHaveLength(0);
    expect(onSynced).toHaveBeenCalledWith("site-a:2026-08-12");
  });

  it("leaves an item queued (never surfaces a failure) when the server rejects it or the network fails", async () => {
    await queueDsr(basePayload({ siteId: "site-b", reportDate: "2026-08-13" }));
    global.fetch = vi.fn().mockRejectedValue(new Error("offline")) as unknown as typeof fetch;
    const onSynced = vi.fn();

    await expect(syncQueuedDsrs("http://localhost:3001", onSynced)).resolves.toBeUndefined();

    expect(await listQueuedDsrs()).toHaveLength(1);
    expect(onSynced).not.toHaveBeenCalled();
  });
});
