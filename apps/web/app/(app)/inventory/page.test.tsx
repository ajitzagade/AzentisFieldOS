import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import InventoryPage from "./page";

async function renderInventoryPage() {
  const element = await InventoryPage();
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
  sites?: unknown;
  godownStock?: unknown;
  siteStockBySite?: Record<string, unknown>;
  lowStock?: unknown;
  purchasesThisMonth?: number;
}) {
  global.fetch = vi.fn((url: string) => {
    const urlStr = String(url);
    if (urlStr.includes("/stock/godown")) {
      return Promise.resolve({ ok: true, json: async () => handlers.godownStock ?? [] });
    }
    if (urlStr.includes("/stock/site/")) {
      const siteId = urlStr.split("/stock/site/")[1];
      return Promise.resolve({ ok: true, json: async () => handlers.siteStockBySite?.[siteId!] ?? [] });
    }
    if (urlStr.includes("/stock/low-stock")) {
      return Promise.resolve({ ok: true, json: async () => handlers.lowStock ?? [] });
    }
    if (urlStr.includes("/purchases/count/this-month")) {
      return Promise.resolve({ ok: true, json: async () => handlers.purchasesThisMonth ?? 0 });
    }
    if (urlStr.includes("/sites")) {
      return Promise.resolve({ ok: true, json: async () => handlers.sites ?? [] });
    }
    return Promise.resolve({ ok: true, json: async () => [] });
  }) as unknown as typeof fetch;
}

describe("InventoryPage", () => {
  it("renders placeholder ₹ value tiles, and real counts for Low-stock Materials and Purchases This Month", async () => {
    mockFetchRouter({
      lowStock: [
        { id: "mat-1", name: "Cement (OPC 53 Grade)", unit: { name: "Bags" }, lowStockThreshold: "200", godownQuantity: "120" },
      ],
      purchasesThisMonth: 14,
    });

    await renderInventoryPage();

    expect(screen.getByText("Godown Stock Value (not yet available)")).toBeInTheDocument();
    expect(screen.getByText("Site Stock Value (not yet available)")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("14")).toBeInTheDocument();
  });

  it("renders a Gap Flag naming the exact Material and threshold, with a Transfer Stock action (AC #2)", async () => {
    mockFetchRouter({
      lowStock: [
        { id: "mat-1", name: "Cement (OPC 53 Grade)", unit: { name: "Bags" }, lowStockThreshold: "200", godownQuantity: "120" },
      ],
    });

    await renderInventoryPage();

    expect(
      screen.getByText("Cement (OPC 53 Grade) is low in Godown stock — 120 Bags on hand against a 200 Bags configured threshold."),
    ).toBeInTheDocument();
    // The flag deep-links the movement form with the low Material carried
    // along (?materialId=) so the user doesn't re-find what's low.
    expect(screen.getByRole("link", { name: "Transfer Stock" })).toHaveAttribute(
      "href",
      "/movements/godown-to-site/new?materialId=mat-1",
    );
  });

  it("shows an explicit no-alerts message instead of an empty Alerts section when nothing is low-stock", async () => {
    mockFetchRouter({ lowStock: [] });

    await renderInventoryPage();

    expect(screen.getByText("No Materials are currently below their configured threshold.")).toBeInTheDocument();
  });

  it("never renders a bare warning badge in the Godown Stock table for a low Material — AC #2's low-stock signal is the GapFlag alone", async () => {
    mockFetchRouter({
      godownStock: [
        {
          materialSizeId: "ms1",
          quantity: "120",
          materialSize: { label: "", material: { name: "Cement (OPC 53 Grade)", unit: { name: "Bags" } } },
        },
        {
          materialSizeId: "ms2",
          quantity: "86",
          materialSize: { label: "300mm", material: { name: "RCC Pipe", unit: { name: "Pcs" } } },
        },
      ],
      lowStock: [{ id: "mat-1", name: "Cement (OPC 53 Grade)", unit: { name: "Bags" }, lowStockThreshold: "200", godownQuantity: "120" }],
    });

    await renderInventoryPage();

    expect(screen.queryByText("Low")).not.toBeInTheDocument();
    expect(screen.getByText("RCC Pipe")).toBeInTheDocument();
    expect(screen.getByText("300mm")).toBeInTheDocument();
  });

  it("renders Site Stock rows fetched per-Site and flattened into one table", async () => {
    mockFetchRouter({
      sites: [
        { id: "site1", name: "NH-48 Highway Widening" },
        { id: "site2", name: "Sector 12 Metro Depot" },
      ],
      siteStockBySite: {
        site1: [
          {
            materialSizeId: "ms1",
            quantity: "64",
            site: { id: "site1", name: "NH-48 Highway Widening" },
            materialSize: { label: "OPC 53 Grade", material: { name: "Cement", unit: { name: "Bags" } } },
          },
        ],
        site2: [
          {
            materialSizeId: "ms2",
            quantity: "22",
            site: { id: "site2", name: "Sector 12 Metro Depot" },
            materialSize: { label: "600mm", material: { name: "RCC Pipe", unit: { name: "Pcs" } } },
          },
        ],
      },
    });

    await renderInventoryPage();

    expect(screen.getByText("NH-48 Highway Widening")).toBeInTheDocument();
    expect(screen.getByText("Cement (OPC 53 Grade)")).toBeInTheDocument();
    expect(screen.getByText("64 Bags")).toBeInTheDocument();
    expect(screen.getByText("Sector 12 Metro Depot")).toBeInTheDocument();
    expect(screen.getByText("22 Pcs")).toBeInTheDocument();
  });

  it("renders empty states for both Stock Levels tables when there is no data", async () => {
    mockFetchRouter({});

    await renderInventoryPage();

    expect(screen.getByText("No Godown Stock recorded yet.")).toBeInTheDocument();
    expect(screen.getByText("No Site Stock recorded yet.")).toBeInTheDocument();
  });

  it("links the header action to the Movement entry form", async () => {
    mockFetchRouter({});

    await renderInventoryPage();

    expect(screen.getByRole("link", { name: "Record Movement" })).toHaveAttribute("href", "/movements/godown-to-site/new");
  });
});
