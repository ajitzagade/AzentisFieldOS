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

function mockToday(today: Record<string, unknown>) {
  global.fetch = vi.fn(() =>
    Promise.resolve({ ok: true, json: async () => today }),
  ) as unknown as typeof fetch;
}

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

describe("DashboardPage", () => {
  it("renders all seven Today tiles, each drilling into its real screen (AC #1)", async () => {
    mockToday(baseToday);
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
    mockToday({
      ...baseToday,
      sitesMissingDsrToday: [
        { siteId: "s2", name: "Metro Depot" },
        { siteId: "s3", name: "Riverside Bridge Approach" },
      ],
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
    mockToday({ ...baseToday, sitesMissingDsrToday: [] });
    await renderDashboard();
    expect(screen.queryByRole("link", { name: /view site/i })).toBeNull();
  });
});
