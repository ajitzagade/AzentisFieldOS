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

function mockReports(rows: unknown[]) {
  global.fetch = vi.fn(() =>
    Promise.resolve({ ok: true, status: 200, json: async () => rows }),
  ) as unknown as typeof fetch;
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

async function renderReportsPage(rows: unknown[]) {
  mockReports(rows);
  const element = await ReportsPage();
  render(element);
}

describe("ReportsPage — Recent Reports delivery log", () => {
  it("reflects each of the three delivery states in the status badge (AC #3)", async () => {
    await renderReportsPage([rowDelivered, rowPending, rowFailed]);

    expect(screen.getByText("Delivered")).toBeInTheDocument();
    expect(screen.getByText("Pending")).toBeInTheDocument();
    expect(screen.getByText("Failed")).toBeInTheDocument();
  });

  it("renders a row per Daily Site Report scoped to that type only", async () => {
    await renderReportsPage([rowDelivered, rowPending, rowFailed]);

    expect(
      screen.getByText("NH-48 Highway Widening — Package 3"),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Daily Site Report")).toHaveLength(3);
  });

  it("shows an empty state when no reports have compiled yet (AC #4)", async () => {
    await renderReportsPage([]);

    expect(screen.getByText(/No reports yet/i)).toBeInTheDocument();
  });

  it("has NO 'Send' control anywhere — reports deliver automatically (UX-DR19)", async () => {
    await renderReportsPage([rowDelivered, rowPending, rowFailed]);

    // The epic's named UX requirement: no manual send step exists on the UI.
    expect(screen.queryByText(/send/i)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /send/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /send/i })).not.toBeInTheDocument();
  });
});
