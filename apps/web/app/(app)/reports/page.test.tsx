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
const emptyLabourReport = {
  summary: {
    totalTeamMembers: 0,
    todaysWorkingHeadcount: 0,
    weeklyPaymentTotal: 0,
    monthlyPaymentTotal: 0,
  },
  outstanding: { total: 0, byTeamMember: [] },
  workRecords: [],
  payments: [],
  advances: [],
  adjustments: [],
};
const emptyMachineryReport = {
  machinery: [],
  vehicles: [],
  asset: null,
  movements: [],
  serviceLogs: [],
};

function mockFetchRouter(handlers: {
  daily?: unknown[];
  sites?: unknown[];
  materials?: unknown[];
  teamMembers?: unknown[];
  siteReport?: unknown;
  inventoryReport?: unknown;
  labourReport?: unknown;
  machineryReport?: unknown;
  onUrl?: (url: string) => void;
}) {
  global.fetch = vi.fn((url: string) => {
    const u = String(url);
    handlers.onUrl?.(u);
    if (u.includes("/reports/daily")) return jsonResponse(handlers.daily ?? []);
    if (u.includes("/reports/sites")) return jsonResponse(handlers.siteReport ?? emptySiteReport);
    if (u.includes("/reports/inventory"))
      return jsonResponse(handlers.inventoryReport ?? emptyInventoryReport);
    if (u.includes("/reports/labour"))
      return jsonResponse(handlers.labourReport ?? emptyLabourReport);
    if (u.includes("/reports/machinery-vehicles"))
      return jsonResponse(handlers.machineryReport ?? emptyMachineryReport);
    if (u.includes("/team-members")) return jsonResponse(handlers.teamMembers ?? []);
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
  it("renders all five tab chips, with Site Reports selected by default", async () => {
    await renderReportsPage({ sites: [{ id: "site1", name: "NH-48" }] });

    const tabs = screen.getAllByRole("tab");
    expect(tabs.map((t) => t.textContent)).toEqual([
      "Site Reports",
      "Inventory Reports",
      "Labour Reports",
      "Machinery/Vehicle Reports",
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

// Story 13.3 — the Labour and Machinery/Vehicle report tabs.
describe("ReportsPage — Labour & Machinery/Vehicle report tabs (Story 13.3)", () => {
  it("Labour tab renders its sections and threads teamMemberId/from/to into the request", async () => {
    let labourUrl = "";
    await renderReportsPage(
      {
        teamMembers: [{ id: "tm1", name: "Ravi Kumar" }],
        labourReport: {
          summary: {
            totalTeamMembers: 12,
            todaysWorkingHeadcount: 8,
            weeklyPaymentTotal: 45000,
            monthlyPaymentTotal: 180000,
          },
          outstanding: {
            total: 5000,
            byTeamMember: [
              { teamMemberId: "tm1", name: "Ravi Kumar", outstandingAdvanceBalance: "5000" },
            ],
          },
          workRecords: [
            {
              id: "wr1",
              workDate: "2026-08-11T00:00:00.000Z",
              attended: true,
              hours: "8",
              overtimeHours: null,
              teamMember: { id: "tm1", name: "Ravi Kumar" },
              site: { id: "site1", name: "NH-48" },
            },
          ],
          payments: [],
          advances: [
            {
              id: "adv1",
              amount: "5000",
              reason: "Medical",
              givenAt: "2026-08-05T00:00:00.000Z",
              teamMember: { id: "tm1", name: "Ravi Kumar" },
            },
          ],
          adjustments: [],
        },
        onUrl: (u) => {
          if (u.includes("/reports/labour")) labourUrl = u;
        },
      },
      { tab: "labour", teamMemberId: "tm1", from: "2026-08-01", to: "2026-08-31" },
    );

    expect(screen.getByText("Attendance & Work History")).toBeInTheDocument();
    expect(screen.getByText("Payment History")).toBeInTheDocument();
    expect(screen.getByText("Outstanding Advances")).toBeInTheDocument();
    expect(screen.getByText("Advance & Adjustment History")).toBeInTheDocument();
    expect(screen.getByText("Medical")).toBeInTheDocument();
    expect(labourUrl).toContain("teamMemberId=tm1");
    expect(labourUrl).toContain("from=2026-08-01");
    expect(labourUrl).toContain("to=2026-08-31");
  });

  it("Machinery tab shows the register when no asset is selected", async () => {
    await renderReportsPage(
      {
        machineryReport: {
          ...emptyMachineryReport,
          machinery: [
            {
              id: "m1",
              name: "Excavator EX-01",
              assetNumber: "EX-01",
              type: { name: "Excavator" },
              currentStatus: "AT_SITE",
              currentSite: { name: "NH-48" },
            },
          ],
        },
      },
      { tab: "machinery" },
    );

    expect(screen.getByText("Machinery — Current Status")).toBeInTheDocument();
    expect(screen.getByText("Vehicles — Current Status")).toBeInTheDocument();
    expect(screen.getByText("Excavator EX-01")).toBeInTheDocument();
    expect(screen.getByText(/Select an asset above/i)).toBeInTheDocument();
  });

  it("Machinery tab drills into a selected asset and threads assetType/assetId into the request", async () => {
    let machineryUrl = "";
    await renderReportsPage(
      {
        machineryReport: {
          ...emptyMachineryReport,
          asset: {
            id: "m1",
            name: "Excavator EX-01",
            assetNumber: "EX-01",
            type: { name: "Excavator" },
            currentStatus: "MAINTENANCE",
            currentSite: null,
          },
          movements: [
            {
              id: "mov1",
              toStatus: "MAINTENANCE",
              site: null,
              movedAt: "2026-08-10T00:00:00.000Z",
              reason: "Hydraulic fault",
            },
          ],
          serviceLogs: [
            {
              id: "svc1",
              kind: "REPAIR",
              notes: "Replaced hydraulic hose",
              cost: "12000",
              serviceDate: "2026-08-10T00:00:00.000Z",
            },
          ],
        },
        onUrl: (u) => {
          if (u.includes("/reports/machinery-vehicles")) machineryUrl = u;
        },
      },
      { tab: "machinery", asset: "MACHINERY:m1", from: "2026-08-01", to: "2026-08-31" },
    );

    expect(screen.getByText("Movement History")).toBeInTheDocument();
    expect(screen.getByText("Fuel, Maintenance & Repair History")).toBeInTheDocument();
    expect(screen.getByText("Hydraulic fault")).toBeInTheDocument();
    expect(screen.getByText("Replaced hydraulic hose")).toBeInTheDocument();
    expect(machineryUrl).toContain("assetType=MACHINERY");
    expect(machineryUrl).toContain("assetId=m1");
    expect(machineryUrl).toContain("from=2026-08-01");
  });
});
