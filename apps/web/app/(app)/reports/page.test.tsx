import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ReportsPage from "./page";

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

function jsonResponse(body: unknown) {
  return Promise.resolve({ ok: true, status: 200, json: async () => body });
}

const emptySiteReport = { site: null, dsrs: [], photos: [], feed: [] };
const emptyInventoryReport = {
  godownStock: [],
  siteStock: [],
  lowStock: [],
  purchases: [],
  movements: [],
  consumptions: [],
  returnWastages: [],
};

function mockFetchRouter(handlers: {
  daily?: unknown[];
  sites?: unknown[];
  materials?: unknown[];
  siteReport?: unknown;
  inventoryReport?: unknown;
  onUrl?: (url: string) => void;
}) {
  global.fetch = vi.fn((url: string) => {
    const u = String(url);
    handlers.onUrl?.(u);
    if (u.includes("/reports/daily")) return jsonResponse(handlers.daily ?? []);
    if (u.includes("/reports/sites")) return jsonResponse(handlers.siteReport ?? emptySiteReport);
    if (u.includes("/reports/inventory"))
      return jsonResponse(handlers.inventoryReport ?? emptyInventoryReport);
    if (u.includes("/materials")) return jsonResponse(handlers.materials ?? []);
    if (u.includes("/sites")) return jsonResponse(handlers.sites ?? []);
    return jsonResponse([]);
  }) as unknown as typeof fetch;
}

async function renderReportsPage(
  handlers: Parameters<typeof mockFetchRouter>[0] = {},
  searchParams: Record<string, string> = {},
) {
  mockFetchRouter(handlers);
  const element = await ReportsPage({ searchParams: Promise.resolve(searchParams) });
  render(element);
}

const rowDelivered = {
  id: "r-delivered",
  reportType: "Daily Site Report",
  siteId: "site1",
  siteName: "NH-48 Highway Widening — Package 3",
  reportDate: "2026-08-11T00:00:00.000Z",
  generatedAt: "2026-08-11T13:15:00.000Z",
  deliveries: [
    { channel: "IN_APP", status: "SENT" },
    { channel: "EMAIL", status: "SENT" },
  ],
};
const rowPending = {
  id: "r-pending",
  reportType: "Daily Site Report",
  siteId: "site2",
  siteName: "Sector 12 Metro Depot",
  reportDate: "2026-08-10T00:00:00.000Z",
  generatedAt: "2026-08-10T13:15:00.000Z",
  deliveries: [
    { channel: "IN_APP", status: "SENT" },
    { channel: "EMAIL", status: "PENDING" },
  ],
};
const rowFailed = {
  id: "r-failed",
  reportType: "Daily Site Report",
  siteId: "site3",
  siteName: "Riverside Bridge Approach",
  reportDate: "2026-08-09T00:00:00.000Z",
  generatedAt: "2026-08-09T13:15:00.000Z",
  deliveries: [
    { channel: "IN_APP", status: "SENT" },
    { channel: "EMAIL", status: "FAILED" },
  ],
};

// Story 13.1 behaviour — the "Recent Reports" auto-delivery log — must survive
// Story 13.2's chip-row/tab extension unchanged.
describe("ReportsPage — Recent Reports delivery log (Story 13.1)", () => {
  it("reflects each of the three delivery states in the status badge", async () => {
    await renderReportsPage({ daily: [rowDelivered, rowPending, rowFailed] });

    expect(screen.getByText("Delivered")).toBeInTheDocument();
    expect(screen.getByText("Pending")).toBeInTheDocument();
    expect(screen.getByText("Failed")).toBeInTheDocument();
  });

  it("renders a row per Daily Site Report scoped to that type only", async () => {
    await renderReportsPage({ daily: [rowDelivered, rowPending, rowFailed] });

    expect(screen.getAllByText("Daily Site Report")).toHaveLength(3);
  });

  it("shows an empty state when no reports have compiled yet", async () => {
    await renderReportsPage({ daily: [] });

    expect(screen.getByText(/No reports yet/i)).toBeInTheDocument();
  });

  it("has NO 'Send' control anywhere — reports deliver automatically (UX-DR19)", async () => {
    await renderReportsPage({ daily: [rowDelivered], sites: [{ id: "site1", name: "NH-48" }] });

    expect(screen.queryByText(/send/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /send/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /send/i })).not.toBeInTheDocument();
  });
});

// Story 13.2 — the chip-row tab selector and the Site / Inventory report views.
describe("ReportsPage — Site & Inventory report tabs (Story 13.2)", () => {
  it("renders all four tab chips, with Site Reports selected by default", async () => {
    await renderReportsPage({ sites: [{ id: "site1", name: "NH-48" }] });

    const tabs = screen.getAllByRole("tab");
    expect(tabs.map((t) => t.textContent)).toEqual([
      "Site Reports",
      "Inventory Reports",
      "Labour Reports",
      "Financial Reports",
    ]);
    expect(screen.getByRole("tab", { name: "Site Reports" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("Site Reports tab renders DSR history and threads siteId/from/to into the request", async () => {
    let siteReportUrl = "";
    await renderReportsPage(
      {
        sites: [{ id: "site1", name: "NH-48" }],
        siteReport: {
          site: { id: "site1", name: "NH-48", location: "Ch. 4+200", status: "ACTIVE" },
          dsrs: [
            {
              id: "dsr1",
              reportDate: "2026-08-11T00:00:00.000Z",
              submittedBy: { name: "Ramesh Yadav" },
              workCompleted: "RCC pour completed",
              _count: { workRecords: 42, consumptions: 3 },
            },
          ],
          photos: [],
          feed: [],
        },
        onUrl: (u) => {
          if (u.includes("/reports/sites")) siteReportUrl = u;
        },
      },
      { siteId: "site1", from: "2026-08-01", to: "2026-08-31" },
    );

    expect(screen.getByText("DSR History")).toBeInTheDocument();
    expect(screen.getByText("RCC pour completed")).toBeInTheDocument();
    expect(screen.getByText("Ramesh Yadav")).toBeInTheDocument();
    expect(siteReportUrl).toContain("siteId=site1");
    expect(siteReportUrl).toContain("from=2026-08-01");
    expect(siteReportUrl).toContain("to=2026-08-31");
  });

  it("Site Reports tab shows an empty DSR state for a window with no reports", async () => {
    await renderReportsPage({ sites: [{ id: "site1", name: "NH-48" }] }, { tab: "site" });

    expect(screen.getByText(/No Daily Site Reports in this date range/i)).toBeInTheDocument();
  });

  it("Inventory Reports tab renders its sections and threads siteId/materialId into the request", async () => {
    let inventoryUrl = "";
    await renderReportsPage(
      {
        sites: [{ id: "site1", name: "NH-48" }],
        materials: [{ id: "mat1", name: "Cement" }],
        inventoryReport: {
          ...emptyInventoryReport,
          consumptions: [
            {
              id: "co1",
              consumedAt: "2026-08-11T00:00:00.000Z",
              quantity: "40",
              site: { name: "NH-48" },
              materialSize: {
                label: "50kg",
                material: { name: "Cement", unit: { name: "Bags" } },
              },
            },
          ],
        },
        onUrl: (u) => {
          if (u.includes("/reports/inventory")) inventoryUrl = u;
        },
      },
      { tab: "inventory", siteId: "site1", materialId: "mat1" },
    );

    expect(screen.getByText("Low-stock Alerts")).toBeInTheDocument();
    expect(screen.getByText("Current Stock")).toBeInTheDocument();
    expect(screen.getByText("Transaction History")).toBeInTheDocument();
    expect(screen.getByText("Consumption")).toBeInTheDocument();
    expect(screen.getByText("Cement (50kg)")).toBeInTheDocument();
    expect(inventoryUrl).toContain("siteId=site1");
    expect(inventoryUrl).toContain("materialId=mat1");
  });
});
