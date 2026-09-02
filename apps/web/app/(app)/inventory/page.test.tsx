import { render, screen, within } from "@testing-library/react";
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
  godownStock?: unknown;
  siteStock?: unknown;
  lowStock?: unknown;
  purchasesThisMonth?: number;
}) {
  global.fetch = vi.fn((url: string) => {
    const urlStr = String(url);
    if (urlStr.includes("/stock/godown")) {
      return Promise.resolve({ ok: true, json: async () => handlers.godownStock ?? [] });
    }
    // The batch all-Sites endpoint (GET /stock/site, no trailing /:id) —
    // replaces the old per-Site GET /stock/site/:id loop.
    if (urlStr.includes("/stock/site")) {
      return Promise.resolve({ ok: true, json: async () => handlers.siteStock ?? [] });
    }
    if (urlStr.includes("/stock/low-stock")) {
      return Promise.resolve({ ok: true, json: async () => handlers.lowStock ?? [] });
    }
    if (urlStr.includes("/purchases/count/this-month")) {
      return Promise.resolve({ ok: true, json: async () => handlers.purchasesThisMonth ?? 0 });
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
    const table = within(screen.getAllByRole("table")[0]!);
    expect(table.getByText("RCC Pipe")).toBeInTheDocument();
    expect(table.getByText("300mm")).toBeInTheDocument();
  });

  it("renders Site Stock rows from the batched all-Sites endpoint in one table", async () => {
    mockFetchRouter({
      siteStock: [
        {
          materialSizeId: "ms1",
          quantity: "64",
          site: { id: "site1", name: "NH-48 Highway Widening" },
          materialSize: { label: "OPC 53 Grade", material: { name: "Cement", unit: { name: "Bags" } } },
        },
        {
          materialSizeId: "ms2",
          quantity: "22",
          site: { id: "site2", name: "Sector 12 Metro Depot" },
          materialSize: { label: "600mm", material: { name: "RCC Pipe", unit: { name: "Pcs" } } },
        },
      ],
    });

    await renderInventoryPage();

    const siteTable = within(screen.getAllByRole("table")[1]!);
    expect(siteTable.getByText("NH-48 Highway Widening")).toBeInTheDocument();
    expect(siteTable.getByText("Cement (OPC 53 Grade)")).toBeInTheDocument();
    expect(siteTable.getByText("64 Bags")).toBeInTheDocument();
    expect(siteTable.getByText("Sector 12 Metro Depot")).toBeInTheDocument();
    expect(siteTable.getByText("22 Pcs")).toBeInTheDocument();
  });

  it("renders empty states for both Stock Levels tables when there is no data", async () => {
    mockFetchRouter({});

    await renderInventoryPage();

    // Rendered as both the desktop table panel and the mobile card panel.
    expect(screen.getAllByText("No Godown Stock recorded yet.")).toHaveLength(2);
    expect(screen.getAllByText("No Site Stock recorded yet.")).toHaveLength(2);
  });

  it("renders the previously-clipping Qty columns as card label/value rows below md, unchanged in the desktop tables (Story 19.8)", async () => {
    mockFetchRouter({
      godownStock: [
        {
          materialSizeId: "ms1",
          quantity: "120",
          materialSize: { label: "", material: { name: "Cement", unit: { name: "Bags" } } },
        },
      ],
      siteStock: [
        {
          materialSizeId: "ms2",
          quantity: "64",
          site: { id: "site1", name: "NH-48 Highway Widening" },
          materialSize: { label: "", material: { name: "Cement", unit: { name: "Bags" } } },
        },
      ],
    });

    await renderInventoryPage();

    // Desktop tables (unchanged) plus one mobile card list per DataTable.
    const tables = screen.getAllByRole("table");
    const lists = screen.getAllByRole("list");
    expect(tables).toHaveLength(2);
    expect(lists).toHaveLength(2);

    const [godownTable, siteTable] = tables;
    const [godownList, siteList] = lists;

    expect(within(godownTable!).getByText("Qty on Hand")).toBeInTheDocument();
    expect(within(godownTable!).getByText("120")).toBeInTheDocument();
    expect(within(godownList!).getByText("Qty on Hand")).toBeInTheDocument();
    expect(within(godownList!).getByText("120")).toBeInTheDocument();

    expect(within(siteTable!).getByText("Qty")).toBeInTheDocument();
    expect(within(siteTable!).getByText("64 Bags")).toBeInTheDocument();
    expect(within(siteList!).getByText("Qty")).toBeInTheDocument();
    expect(within(siteList!).getByText("64 Bags")).toBeInTheDocument();

    // Site Stock's mobile card primary line folds Material and Site
    // together ("Cement · NH-48 Highway Widening"); both headers are
    // omitted from the card's detail rows, but the table still shows them.
    expect(within(siteList!).queryByText("Material")).not.toBeInTheDocument();
    expect(within(siteList!).queryByText("Site")).not.toBeInTheDocument();
    expect(within(siteTable!).getByText("Material")).toBeInTheDocument();
    expect(within(siteTable!).getByText("Site")).toBeInTheDocument();
  });

  it("links the header action to the Movement entry form", async () => {
    mockFetchRouter({});

    await renderInventoryPage();

    expect(screen.getByRole("link", { name: "Record Movement" })).toHaveAttribute("href", "/movements/godown-to-site/new");
  });
});
