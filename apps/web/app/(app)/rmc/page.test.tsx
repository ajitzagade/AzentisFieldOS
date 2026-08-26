import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import RmcPage from "./page";

async function renderRmcPage() {
  const element = await RmcPage();
  render(element);
}

const originalFetch = global.fetch;
const originalApiUrl = process.env.API_URL;

beforeEach(() => {
  process.env.API_URL = "http://localhost:3001";
});

afterEach(() => {
  global.fetch = originalFetch;
  process.env.API_URL = originalApiUrl;
  vi.restoreAllMocks();
});

function mockFetchRouter(handlers: { entries?: unknown; stats?: unknown }) {
  global.fetch = vi.fn((url: string) => {
    const urlStr = String(url);
    if (urlStr.includes("/rmc-entries/stats/this-month")) {
      return Promise.resolve({
        ok: true,
        json: async () => handlers.stats ?? { totalQuantityM3: 0, totalCost: 0, activeVendorCount: 0 },
      });
    }
    return Promise.resolve({ ok: true, json: async () => handlers.entries ?? [] });
  }) as unknown as typeof fetch;
}

const entry = {
  id: "rmc1",
  quantityM3: "42",
  grade: "M25",
  ratePerM3: "6200",
  totalAmount: "260400",
  invoiceOrChallanNo: "INV-RMC-1187",
  deliveredAt: "2026-08-05T00:00:00.000Z",
  site: { id: "site1", name: "NH-48 Highway Widening — Package 3" },
  vendor: { id: "vendor1", name: "Anand RMC Suppliers" },
};

describe("RmcPage", () => {
  it("renders the server-computed stat tiles (AC #1: RMC tracked as its own entity)", async () => {
    mockFetchRouter({ stats: { totalQuantityM3: 196, totalCost: 1244900, activeVendorCount: 1 } });

    await renderRmcPage();

    expect(screen.getByText("196 m³")).toBeInTheDocument();
    expect(screen.getByText("₹12,44,900")).toBeInTheDocument();
    expect(screen.getByText("Total RMC this month")).toBeInTheDocument();
    expect(screen.getByText("Total RMC cost this month")).toBeInTheDocument();
    expect(screen.getByText("Active RMC vendors")).toBeInTheDocument();
  });

  it("renders Vendor/Site/Date/Quantity/Grade/Rate/Total/Invoice columns for each RMC delivery", async () => {
    mockFetchRouter({ entries: [entry] });

    await renderRmcPage();

    expect(screen.getByText("Anand RMC Suppliers")).toBeInTheDocument();
    expect(screen.getByText("NH-48 Highway Widening — Package 3")).toBeInTheDocument();
    expect(screen.getByText("M25")).toBeInTheDocument();
    expect(screen.getByText("42 m³")).toBeInTheDocument();
    expect(screen.getByText("₹6,200")).toBeInTheDocument();
    expect(screen.getByText("₹2,60,400")).toBeInTheDocument();
    expect(screen.getByText("INV-RMC-1187")).toBeInTheDocument();
  });

  it("AC #3: offers only a Correct action per row, never Edit/Delete (AD-9)", async () => {
    mockFetchRouter({ entries: [entry] });

    await renderRmcPage();

    expect(screen.getByRole("link", { name: "Correct" })).toHaveAttribute("href", "/rmc/rmc1/correct");
    expect(screen.queryByRole("button", { name: /edit/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /delete/i })).not.toBeInTheDocument();
  });

  it("renders an empty state with a call to action when there are no RMC deliveries yet", async () => {
    mockFetchRouter({ entries: [] });

    await renderRmcPage();

    expect(screen.getByText("No RMC deliveries logged yet.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Record your first RMC Delivery/ })).toHaveAttribute("href", "/rmc/new");
  });

  it("links the header action to the RMC entry form", async () => {
    mockFetchRouter({ entries: [] });

    await renderRmcPage();

    expect(screen.getByRole("link", { name: "Add RMC Delivery" })).toHaveAttribute("href", "/rmc/new");
  });
});
