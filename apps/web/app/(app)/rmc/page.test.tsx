import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import RmcPage from "./page";

vi.mock("next/navigation", () => ({
  usePathname: () => "/rmc",
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ replace: vi.fn() }),
}));

async function renderRmcPage(searchParams: { report?: string } = {}) {
  const element = await RmcPage({ searchParams: Promise.resolve(searchParams) });
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

function mockFetchRouter(handlers: {
  entries?: unknown;
  stats?: unknown;
  report?: unknown;
  onReportUrl?: (url: string) => void;
}) {
  global.fetch = vi.fn((url: string) => {
    const urlStr = String(url);
    if (urlStr.includes("/rmc-entries/stats/this-month")) {
      return Promise.resolve({
        ok: true,
        json: async () => handlers.stats ?? { totalQuantityM3: 0, totalCost: 0, activeVendorCount: 0 },
      });
    }
    if (urlStr.includes("/rmc-entries/report")) {
      handlers.onReportUrl?.(urlStr);
      return Promise.resolve({ ok: true, json: async () => handlers.report ?? [] });
    }
    const entries = (handlers.entries as unknown[] | undefined) ?? [];
    return Promise.resolve({
      ok: true,
      json: async () => ({ rows: entries, total: entries.length, page: 1, pageSize: 25 }),
    });
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

  it("renders the Daily / By Site / By Vendor reporting slice-selector tabs (FR-27)", async () => {
    mockFetchRouter({});

    await renderRmcPage();

    expect(screen.getByRole("tab", { name: "Daily" })).toHaveAttribute("href", "/rmc");
    expect(screen.getByRole("tab", { name: "By Site" })).toHaveAttribute("href", "/rmc?report=site");
    expect(screen.getByRole("tab", { name: "By Vendor" })).toHaveAttribute("href", "/rmc?report=vendor");
  });

  it("defaults to the daily slice and fetches groupBy=day", async () => {
    let reportUrl = "";
    mockFetchRouter({ onReportUrl: (url) => (reportUrl = url), report: [] });

    await renderRmcPage();

    expect(reportUrl).toContain("groupBy=day");
    expect(screen.getByRole("tab", { name: "Daily" })).toHaveAttribute("aria-selected", "true");
  });

  it("selects and fetches the Site-wise slice when ?report=site is active", async () => {
    let reportUrl = "";
    mockFetchRouter({
      onReportUrl: (url) => (reportUrl = url),
      report: [{ key: "site1", label: "NH-48 Highway Widening", totalQuantityM3: 50, totalCost: 304000, entryCount: 2 }],
    });

    await renderRmcPage({ report: "site" });

    expect(reportUrl).toContain("groupBy=site");
    expect(screen.getByRole("tab", { name: "By Site" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("NH-48 Highway Widening")).toBeInTheDocument();
    expect(screen.getByText("₹3,04,000")).toBeInTheDocument();
    expect(screen.getByText("50 m³")).toBeInTheDocument();
  });

  it("renders a genuine empty state for the report when there are no RMC deliveries", async () => {
    mockFetchRouter({ report: [] });

    await renderRmcPage();

    expect(screen.getByText("No RMC deliveries to report on yet.")).toBeInTheDocument();
  });
});
