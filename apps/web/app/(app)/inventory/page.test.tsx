import { render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import InventoryPage from "./page";

vi.mock("next/navigation", () => ({
  usePathname: () => "/inventory",
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ replace: vi.fn() }),
}));

async function renderInventoryPage(searchParams: Record<string, string> = {}) {
  const element = await InventoryPage({ searchParams: Promise.resolve(searchParams) });
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
  inventory?: unknown[];
  lowStock?: unknown;
  purchasesThisMonth?: number;
  categories?: unknown;
  sites?: unknown;
}) {
  global.fetch = vi.fn((url: string) => {
    const urlStr = String(url);
    if (urlStr.includes("/stock/inventory")) {
      const rows = handlers.inventory ?? [];
      return Promise.resolve({
        ok: true,
        json: async () => ({ rows, total: rows.length, page: 1, pageSize: 25 }),
      });
    }
    if (urlStr.includes("/stock/low-stock")) {
      return Promise.resolve({ ok: true, json: async () => handlers.lowStock ?? [] });
    }
    if (urlStr.includes("/purchases/count/this-month")) {
      return Promise.resolve({ ok: true, json: async () => handlers.purchasesThisMonth ?? 0 });
    }
    if (urlStr.includes("/material-categories")) {
      return Promise.resolve({ ok: true, json: async () => handlers.categories ?? [] });
    }
    if (urlStr.includes("/sites")) {
      return Promise.resolve({ ok: true, json: async () => handlers.sites ?? [] });
    }
    return Promise.resolve({ ok: true, json: async () => [] });
  }) as unknown as typeof fetch;
}

const godownRow = {
  materialId: "mat-1",
  materialName: "Cement (OPC 53 Grade)",
  categoryId: "cat-1",
  categoryName: "Cement",
  sizeLabel: "",
  unit: "Bags",
  locationType: "GODOWN" as const,
  siteId: null,
  siteName: null,
  quantity: "120",
  updatedAt: "2026-09-01T10:00:00.000Z",
};

const siteRow = {
  materialId: "mat-2",
  materialName: "RCC Pipe",
  categoryId: "cat-2",
  categoryName: "Pipes",
  sizeLabel: "600mm",
  unit: "Pcs",
  locationType: "SITE" as const,
  siteId: "site1",
  siteName: "Sector 12 Metro Depot",
  quantity: "22",
  updatedAt: "2026-09-02T10:00:00.000Z",
};

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

  it("renders the unified Godown + Site rows returned by GET /stock/inventory in one table", async () => {
    mockFetchRouter({ inventory: [godownRow, siteRow] });

    await renderInventoryPage();

    const table = within(screen.getAllByRole("table")[0]!);
    expect(table.getByText("Cement (OPC 53 Grade)")).toBeInTheDocument();
    expect(table.getAllByText("Godown").length).toBeGreaterThan(0);
    expect(table.getByText("RCC Pipe")).toBeInTheDocument();
    expect(table.getByText("Sector 12 Metro Depot")).toBeInTheDocument();
  });

  it("renders the nothing-recorded-yet empty state when there is no inventory data at all", async () => {
    mockFetchRouter({ inventory: [] });

    await renderInventoryPage();

    // Rendered as both the desktop table panel and the mobile card panel.
    expect(
      screen.getAllByText(
        "Nothing recorded yet — Godown and Site stock will appear here once Purchases and Movements are recorded.",
      ),
    ).toHaveLength(2);
  });

  it("threads the page's searchParams into the GET /stock/inventory request", async () => {
    let requestedUrl = "";
    global.fetch = vi.fn((url: string) => {
      const urlStr = String(url);
      if (urlStr.includes("/stock/inventory")) {
        requestedUrl = urlStr;
        return Promise.resolve({ ok: true, json: async () => ({ rows: [], total: 0, page: 2, pageSize: 25 }) });
      }
      return Promise.resolve({ ok: true, json: async () => [] });
    }) as unknown as typeof fetch;

    await renderInventoryPage({ q: "cement", stockLevel: "LOW", page: "2" });

    expect(requestedUrl).toContain("q=cement");
    expect(requestedUrl).toContain("stockLevel=LOW");
    expect(requestedUrl).toContain("page=2");
  });

  it("links the header action to the Movement entry form", async () => {
    mockFetchRouter({});

    await renderInventoryPage();

    expect(screen.getByRole("link", { name: "Godown to Site" })).toHaveAttribute("href", "/movements/godown-to-site/new");
  });
});
