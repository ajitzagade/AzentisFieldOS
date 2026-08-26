import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const notFoundMock = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
);
vi.mock("next/navigation", () => ({ notFound: notFoundMock }));

import CorrectRmcEntryPage from "./page";

const originalFetch = global.fetch;
const originalApiUrl = process.env.API_URL;

function mockFetchRouter(handlers: {
  entry?: unknown;
  entryStatus?: number;
  sites?: unknown;
  vendors?: unknown;
}) {
  global.fetch = vi.fn((url: string) => {
    const urlStr = String(url);
    if (urlStr.includes("/rmc-entries/")) {
      return Promise.resolve({
        ok: (handlers.entryStatus ?? 200) < 400,
        status: handlers.entryStatus ?? 200,
        json: async () => handlers.entry,
      });
    }
    if (urlStr.includes("/sites")) {
      return Promise.resolve({ ok: true, json: async () => handlers.sites ?? [] });
    }
    return Promise.resolve({ ok: true, json: async () => handlers.vendors ?? [] });
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
  const element = await CorrectRmcEntryPage({ params: Promise.resolve({ id }) });
  return render(element);
}

const entry = {
  id: "rmc1",
  siteId: "site1",
  vendorId: "vendor1",
  grade: "M25",
  ratePerM3: "6200",
  totalAmount: "260400",
  invoiceOrChallanNo: null,
  deliveredAt: "2026-08-05T00:00:00.000Z",
};

describe("CorrectRmcEntryPage", () => {
  it("pre-fills the locked fields from the original RMC delivery and shows the correction banner", async () => {
    mockFetchRouter({
      entry,
      sites: [{ id: "site1", name: "NH-48 Highway Widening" }],
      vendors: [{ id: "vendor1", name: "Anand RMC Suppliers" }],
    });

    await renderCorrectPage("rmc1");

    expect(screen.getByText("Filing a correction")).toBeInTheDocument();
    expect(screen.getByLabelText("Site")).toHaveValue("site1");
    expect(screen.getByLabelText("Vendor")).toHaveValue("vendor1");
    expect(screen.getByLabelText("Grade")).toHaveValue("M25");
    expect(screen.getByLabelText("Rate / m³")).toHaveValue(6200);
  });

  it("calls notFound() for an RMC delivery ID that does not exist", async () => {
    mockFetchRouter({ entryStatus: 404, entry: undefined, sites: [], vendors: [] });

    await expect(renderCorrectPage("missing-id")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalled();
  });
});
