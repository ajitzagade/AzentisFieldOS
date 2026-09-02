import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const notFoundMock = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
);
vi.mock("next/navigation", () => ({ notFound: notFoundMock }));

import CorrectConsumptionPage from "./page";

const originalFetch = global.fetch;
const originalApiUrl = process.env.API_URL;

function mockFetchRouter(handlers: { consumption?: unknown; consumptionStatus?: number; sites?: unknown; materials?: unknown }) {
  global.fetch = vi.fn((url: string) => {
    const urlStr = String(url);
    if (urlStr.includes("/consumption/")) {
      return Promise.resolve({
        ok: (handlers.consumptionStatus ?? 200) < 400,
        status: handlers.consumptionStatus ?? 200,
        json: async () => handlers.consumption,
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
  const element = await CorrectConsumptionPage({ params: Promise.resolve({ id }) });
  return render(element);
}

const consumption = {
  id: "c1",
  siteId: "site1",
  quantity: "120",
  activityReference: null,
  notes: null,
  consumedAt: "2026-08-10T00:00:00.000Z",
  materialSize: { id: "ms1" },
};

describe("CorrectConsumptionPage", () => {
  it("pre-fills the locked fields from the original Consumption and shows the correction banner", async () => {
    mockFetchRouter({
      consumption,
      sites: [{ id: "site1", name: "Sector 12 Metro Depot" }],
      materials: [{ id: "m1", name: "RCC Pipe", unit: { name: "nos" }, sizes: [{ id: "ms1", label: "600mm" }] }],
    });

    await renderCorrectPage("c1");

    expect(screen.getByText("Filing a correction")).toBeInTheDocument();
  });

  it("calls notFound() for a Consumption ID that does not exist", async () => {
    mockFetchRouter({ consumptionStatus: 404, consumption: undefined, sites: [], materials: [] });

    await expect(renderCorrectPage("missing-id")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalled();
  });
});
