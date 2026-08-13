import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const notFoundMock = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
);
vi.mock("next/navigation", () => ({ notFound: notFoundMock }));

import CorrectPurchasePage from "./page";

const originalFetch = global.fetch;
const originalApiUrl = process.env.API_URL;

function mockFetchRouter(handlers: { purchase?: unknown; purchaseStatus?: number; sites?: unknown; materials?: unknown }) {
  global.fetch = vi.fn((url: string) => {
    const urlStr = String(url);
    if (urlStr.includes("/purchases/")) {
      return Promise.resolve({
        ok: (handlers.purchaseStatus ?? 200) < 400,
        status: handlers.purchaseStatus ?? 200,
        json: async () => handlers.purchase,
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
  const element = await CorrectPurchasePage({ params: Promise.resolve({ id }) });
  return render(element);
}

const purchase = {
  id: "p1",
  vendorId: "v1",
  destination: "GODOWN",
  siteId: null,
  rate: "50",
  totalAmount: "5000",
  invoiceOrChallanNo: null,
  paymentStatus: "PAID",
  deliveryLocation: null,
  vehicleDetails: null,
  receiverName: null,
  notes: null,
  purchasedAt: "2026-08-11T00:00:00.000Z",
  materialSize: { id: "ms1" },
};

describe("CorrectPurchasePage", () => {
  it("pre-fills the locked fields from the original Purchase and shows the correction banner", async () => {
    mockFetchRouter({
      purchase,
      sites: [],
      materials: [{ id: "m1", name: "Cement", sizes: [{ id: "ms1", label: "OPC 53 Grade" }] }],
    });

    await renderCorrectPage("p1");

    expect(screen.getByText("Filing a correction")).toBeInTheDocument();
    expect(screen.getByLabelText("Vendor ID")).toHaveValue("v1");
    expect(screen.getByLabelText("Rate")).toHaveValue(50);
  });

  it("calls notFound() for a Purchase ID that does not exist", async () => {
    mockFetchRouter({ purchaseStatus: 404, purchase: undefined, sites: [], materials: [] });

    await expect(renderCorrectPage("missing-id")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalled();
  });
});
