import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import DailyActivityPage from "./page";

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

function mockFetchRouter(handlers: { sites?: unknown; reports?: unknown }) {
  global.fetch = vi.fn((url: string) => {
    const urlStr = String(url);
    if (urlStr.includes("/dsr?date=")) {
      return Promise.resolve({ ok: true, json: async () => handlers.reports ?? [] });
    }
    return Promise.resolve({ ok: true, json: async () => handlers.sites ?? [] });
  }) as unknown as typeof fetch;
}

async function renderLogPage() {
  const element = await DailyActivityPage();
  return render(element);
}

describe("DailyActivityPage", () => {
  it("shows a clear Submitted state, with a link, for a Site that reported today (AC #1, AC #3)", async () => {
    mockFetchRouter({
      sites: [{ id: "site-1", name: "NH-48", location: "Nashik", status: "ACTIVE", contractReference: null }],
      reports: [
        {
          id: "dsr-1",
          site: { id: "site-1", name: "NH-48" },
          submittedBy: { name: "Ramesh Yadav" },
          workCompleted: "RCC pour completed",
          _count: { workRecords: 18, consumptions: 2 },
        },
      ],
    });

    await renderLogPage();

    // Rendered once in the md+ table and once in the below-md mobile card.
    expect(screen.getAllByText("Submitted")).toHaveLength(2);
    expect(screen.getAllByText("Ramesh Yadav")).toHaveLength(2);
    expect(screen.getAllByText("RCC pour completed")).toHaveLength(2);
    const links = screen.getAllByRole("link", { name: /NH-48/ });
    expect(links).toHaveLength(2);
    for (const link of links) {
      expect(link).toHaveAttribute("href", "/daily-activity/dsr-1");
    }
  });

  it('shows "Not submitted" with no link and no row href for a Site with no report today (AC #1, AC #3)', async () => {
    mockFetchRouter({
      sites: [{ id: "site-2", name: "Sector 12 Metro Depot", location: "Pune", status: "ACTIVE", contractReference: null }],
      reports: [],
    });

    await renderLogPage();

    // Rendered once in the md+ table and once in the below-md mobile card.
    expect(screen.getAllByText("Not submitted")).toHaveLength(2);
    expect(screen.getAllByText("Not submitted yet today")).toHaveLength(2);
    expect(screen.queryByRole("link", { name: /Sector 12 Metro Depot/ })).not.toBeInTheDocument();
  });

  it("cross-references Sites against today's reports so a reported Site and an unreported Site both appear correctly in one list", async () => {
    mockFetchRouter({
      sites: [
        { id: "site-1", name: "NH-48", location: "Nashik", status: "ACTIVE", contractReference: null },
        { id: "site-2", name: "Sector 12", location: "Pune", status: "ACTIVE", contractReference: null },
      ],
      reports: [
        {
          id: "dsr-1",
          site: { id: "site-1", name: "NH-48" },
          submittedBy: { name: "Ramesh Yadav" },
          workCompleted: null,
          _count: { workRecords: 0, consumptions: 3 },
        },
      ],
    });

    await renderLogPage();

    // Rendered once in the md+ table and once in the below-md mobile card.
    expect(screen.getAllByText("3 material entries logged")).toHaveLength(2);
    expect(screen.getAllByText("Not submitted yet today")).toHaveLength(2);
  });
});
