import { afterEach, describe, expect, it } from "vitest";
import type { CreateDsrInput } from "@azentisfieldos/shared";
import { isQueued, listQueuedDsrs, localDsrKey, queueDsr, removeQueuedDsr, withClientGeneratedIds } from "./offline-db";

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

afterEach(async () => {
  const rows = await listQueuedDsrs();
  await Promise.all(rows.map((row) => removeQueuedDsr(row.localKey)));
});

describe("withClientGeneratedIds", () => {
  it("assigns a UUID to every consumption/rmcEntry/expense that doesn't already have one", () => {
    const result = withClientGeneratedIds(
      basePayload({
        consumptions: [{ materialSizeId: "m-1", quantity: 5 }],
        rmcEntries: [{ vendorId: "v-1", quantityM3: 2, grade: "M25", ratePerM3: 6000 }],
        expenses: [{ categoryId: "c-1", amount: 100 }],
      }),
    );

    expect(result.consumptions[0]?.clientGeneratedId).toMatch(/^[0-9a-f-]{36}$/);
    expect(result.rmcEntries[0]?.clientGeneratedId).toMatch(/^[0-9a-f-]{36}$/);
    expect(result.expenses[0]?.clientGeneratedId).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("preserves an existing clientGeneratedId instead of overwriting it — a retried sync must reuse the same key", () => {
    const result = withClientGeneratedIds(
      basePayload({ consumptions: [{ materialSizeId: "m-1", quantity: 5, clientGeneratedId: "fixed-id" }] }),
    );

    expect(result.consumptions[0]?.clientGeneratedId).toBe("fixed-id");
  });
});

describe("offline queue (Dexie)", () => {
  it("queues a submission and lists it back", async () => {
    await queueDsr(basePayload({ siteId: "site-a", reportDate: "2026-08-12" }));

    const queued = await listQueuedDsrs();
    expect(queued).toHaveLength(1);
    expect(queued[0]?.localKey).toBe(localDsrKey("site-a", "2026-08-12"));
    expect(await isQueued("site-a", "2026-08-12")).toBe(true);
  });

  it("overwrites the queued item for the same Site/date instead of appending a duplicate (AC #4)", async () => {
    await queueDsr(basePayload({ siteId: "site-a", reportDate: "2026-08-12", workCompleted: "First draft" }));
    await queueDsr(basePayload({ siteId: "site-a", reportDate: "2026-08-12", workCompleted: "Edited before sync" }));

    const queued = await listQueuedDsrs();
    expect(queued).toHaveLength(1);
    expect(queued[0]?.payload.workCompleted).toBe("Edited before sync");
  });

  it("removes a queued item once synced", async () => {
    await queueDsr(basePayload({ siteId: "site-b", reportDate: "2026-08-13" }));
    await removeQueuedDsr(localDsrKey("site-b", "2026-08-13"));

    expect(await isQueued("site-b", "2026-08-13")).toBe(false);
  });
});
