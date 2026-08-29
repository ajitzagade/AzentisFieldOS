import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const notFoundMock = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
);
vi.mock("next/navigation", () => ({ notFound: notFoundMock }));

import CorrectReturnWastagePage from "./page";

const originalFetch = global.fetch;
const originalApiUrl = process.env.API_URL;

function mockFetchRouter(handlers: { entry?: unknown; entryStatus?: number; sites?: unknown; materials?: unknown }) {
  global.fetch = vi.fn((url: string) => {
    const urlStr = String(url);
    if (urlStr.includes("/return-wastage/")) {
      return Promise.resolve({
        ok: (handlers.entryStatus ?? 200) < 400,
        status: handlers.entryStatus ?? 200,
        json: async () => handlers.entry,
      });
    }
    if (urlStr.includes("/sites")) {
      return Promise.resolve({ ok: true, json: async () => handlers.sites ?? [] });
    }
    return Promise.resolve({ ok: true, json: async () => handlers.materials ?? [] });
  }) as unknown as typeof fetch;
}

beforeEach(() => {
  process.env.API_URL = "http://localhost:3001";
  notFoundMock.mockClear();
});

afterEach(() => {
  global.fetch = originalFetch;
  process.env.API_URL = originalApiUrl;
  vi.restoreAllMocks();
});

async function renderCorrectPage(id: string) {
  const element = await CorrectReturnWastagePage({ params: Promise.resolve({ id }) });
  return render(element);
}

const entry = {
  id: "rw1",
  siteId: "site1",
  kind: "WASTAGE" as const,
  notes: null,
  recordedAt: "2026-08-09T00:00:00.000Z",
  materialSize: { id: "ms1" },
};

describe("CorrectReturnWastagePage", () => {
  it("pre-fills the locked fields (including kind) from the original entry and shows the correction banner", async () => {
    mockFetchRouter({
      entry,
      sites: [{ id: "site1", name: "Sector 12 Metro Depot" }],
      materials: [{ id: "m1", name: "Aggregate", unit: { name: "cft" }, sizes: [{ id: "ms1", label: "20mm" }] }],
    });

    await renderCorrectPage("rw1");

    expect(screen.getByText("Filing a correction")).toBeInTheDocument();
    expect(screen.getByLabelText("Type")).toHaveValue("WASTAGE");
  });

  it("calls notFound() for a Return/Wastage ID that does not exist", async () => {
    mockFetchRouter({ entryStatus: 404, entry: undefined, sites: [], materials: [] });

    await expect(renderCorrectPage("missing-id")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalled();
  });
});
