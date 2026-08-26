import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import DashboardPage from "./page";

async function renderDashboard() {
  const element = await DashboardPage();
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

const baseToday = {
  sitesReportingToday: 2,
  labourWorkingToday: 42,
  materialsReceivedToday: 6,
  materialsConsumedToday: 18,
  rmcUsedTodayM3: 42,
  machineryInUse: 8,
  expensesToday: 86400,
  sitesMissingDsrToday: [],
};

const baseOverall = {
  activeSites: { count: 2, names: ["NH-48 Widening", "Metro Depot"] },
  inventory: { lowStockCount: 3 },
  outstandingAdvances: { total: 314200, teamMemberCount: 9 },
  pendingPayments: { count: 4 },
};

const baseSitesPreview = [
  { id: "s1", name: "NH-48 Widening", location: "Nashik", status: "ACTIVE" },
  { id: "s2", name: "Metro Depot", location: "Pune", status: "ON_HOLD" },
];

// Route each Dashboard fetch to its own fixture — the page issues three
// parallel requests (today / overall / sites-preview).
function mockDashboard(overrides: {
  today?: Record<string, unknown>;
  overall?: Record<string, unknown>;
  sitesPreview?: unknown[];
}) {
  const today = overrides.today ?? baseToday;
  const overall = overrides.overall ?? baseOverall;
  const sitesPreview = overrides.sitesPreview ?? baseSitesPreview;

  global.fetch = vi.fn((input: RequestInfo | URL) => {
    const url = String(input);
    const body = url.includes("/dashboard/overall")
      ? overall
      : url.includes("/dashboard/sites-preview")
        ? sitesPreview
        : today;
    return Promise.resolve({ ok: true, json: async () => body });
  }) as unknown as typeof fetch;
}

describe("DashboardPage", () => {
  it("renders all seven Today tiles, each drilling into its real screen (AC #1)", async () => {
    mockDashboard({});
    await renderDashboard();

    const expectations: [string, string][] = [
      ["Sites Reporting Today", "/daily-activity"],
      ["Labour Working Today", "/team"],
      ["Materials Received Today", "/movements"],
      ["Materials Consumed Today", "/movements"],
      ["RMC Used Today", "/rmc"],
      ["Machinery In Use", "/machinery-vehicles"],
      ["Expenses Today", "/expenses"],
    ];

    for (const [label, href] of expectations) {
      const tile = screen.getByText(label).closest("a");
      expect(tile).toHaveAttribute("href", href);
    }

    expect(screen.getByText("42 m³")).toBeInTheDocument();
    expect(screen.getByText("₹86,400")).toBeInTheDocument();
  });

  it("renders one GapFlag per missing Site, each named explicitly — not one combined message (AC #2, FR-35)", async () => {
    mockDashboard({
      today: {
        ...baseToday,
        sitesMissingDsrToday: [
          { siteId: "s2", name: "Metro Depot" },
          { siteId: "s3", name: "Riverside Bridge Approach" },
        ],
      },
    });

    await renderDashboard();

    expect(
      screen.getByText("Metro Depot has not submitted a Daily Site Report yet today."),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Riverside Bridge Approach has not submitted a Daily Site Report yet today.",
      ),
    ).toBeInTheDocument();

    const viewSiteLinks = screen.getAllByRole("link", { name: /view site/i });
    expect(viewSiteLinks).toHaveLength(2);
    expect(viewSiteLinks[0]).toHaveAttribute("href", "/sites/s2");
    expect(viewSiteLinks[1]).toHaveAttribute("href", "/sites/s3");
  });

  it("shows no gap flags when every active Site has reported", async () => {
    mockDashboard({ today: { ...baseToday, sitesMissingDsrToday: [] } });
    await renderDashboard();
    expect(screen.queryByRole("link", { name: /view site/i })).toBeNull();
  });

  it("renders the Overall section — every figure links to its source screen (AC #2)", async () => {
    mockDashboard({});
    await renderDashboard();

    // Active Sites: count + the site names.
    expect(screen.getByText("Active Sites")).toBeInTheDocument();
    expect(screen.getByText("NH-48 Widening, Metro Depot")).toBeInTheDocument();

    // Inventory Status links to /inventory.
    expect(screen.getByRole("link", { name: /view inventory/i })).toHaveAttribute(
      "href",
      "/inventory",
    );

    // Outstanding Advances (₹ total + Team Member count) and Pending Payments
    // both link to /payments.
    expect(screen.getByText("₹3,14,200")).toBeInTheDocument();
    expect(screen.getByText("Across 9 Team Members")).toBeInTheDocument();
    expect(screen.getByText("Pending Payments")).toBeInTheDocument();
    const paymentLinks = screen.getAllByRole("link", { name: /view payments/i });
    expect(paymentLinks).toHaveLength(2);
    for (const link of paymentLinks) {
      expect(link).toHaveAttribute("href", "/payments");
    }
  });

  it("renders the Sites preview grid with per-Site drill-down and a View-all link (AC #2)", async () => {
    mockDashboard({});
    await renderDashboard();

    expect(screen.getByText("NH-48 Widening").closest("a")).toHaveAttribute(
      "href",
      "/sites/s1",
    );
    expect(screen.getByText("Metro Depot").closest("a")).toHaveAttribute(
      "href",
      "/sites/s2",
    );
    expect(screen.getByRole("link", { name: /view all sites/i })).toHaveAttribute(
      "href",
      "/sites",
    );
  });

  it("renders one whole-page empty state for a zero-Sites Tenant, not a wall of 0-valued tiles (AC #1, FR-34)", async () => {
    mockDashboard({
      today: {
        sitesReportingToday: 0,
        labourWorkingToday: 0,
        materialsReceivedToday: 0,
        materialsConsumedToday: 0,
        rmcUsedTodayM3: 0,
        machineryInUse: 0,
        expensesToday: 0,
        sitesMissingDsrToday: [],
      },
      overall: {
        activeSites: { count: 0, names: [] },
        inventory: { lowStockCount: 0 },
        outstandingAdvances: { total: 0, teamMemberCount: 0 },
        pendingPayments: { count: 0 },
      },
      sitesPreview: [],
    });

    await renderDashboard();

    // The single empty state, with its primary create action.
    expect(screen.getByText("No Sites yet")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /create your first site/i }),
    ).toHaveAttribute("href", "/sites/new");

    // None of the Today tiles, Overall cards, or Sites grid render.
    expect(screen.queryByText("Sites Reporting Today")).toBeNull();
    expect(screen.queryByText("Active Sites")).toBeNull();
    expect(screen.queryByRole("link", { name: /view all sites/i })).toBeNull();
  });
});
