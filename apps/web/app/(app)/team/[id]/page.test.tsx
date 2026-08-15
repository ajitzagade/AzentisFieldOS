import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const notFoundMock = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
);
vi.mock("next/navigation", () => ({ notFound: notFoundMock }));

import TeamMemberDetailPage from "./page";

const originalFetch = global.fetch;
const originalApiUrl = process.env.API_URL;

function mockFetchRouter(handlers: {
  teamMember?: unknown;
  teamMemberStatus?: number;
  workHistory?: unknown[];
  advances?: unknown[];
}) {
  global.fetch = vi.fn((url: string) => {
    const urlStr = String(url);
    if (urlStr.includes("/work-history")) {
      return Promise.resolve({ ok: true, json: async () => handlers.workHistory ?? [] });
    }
    if (urlStr.includes("/advances")) {
      return Promise.resolve({ ok: true, json: async () => handlers.advances ?? [] });
    }
    return Promise.resolve({
      ok: (handlers.teamMemberStatus ?? 200) < 400,
      status: handlers.teamMemberStatus ?? 200,
      json: async () => handlers.teamMember,
    });
  }) as unknown as typeof fetch;
}

beforeEach(() => {
  process.env.API_URL = "http://localhost:3001";
  notFoundMock.mockClear();
});

afterEach(() => {
  global.fetch = originalFetch;
  process.env.API_URL = originalApiUrl;
  vi.restoreAllMocks();
});

async function renderDetailPage(id: string) {
  const element = await TeamMemberDetailPage({ params: Promise.resolve({ id }) });
  return render(element);
}

const baseTeamMember = {
  id: "tm1",
  name: "Ravi Kumar",
  designation: "Bar Bender",
  contact: "+91 98765 43210",
  isActive: true,
  employmentType: { id: "e1", name: "Weekly" },
  outstandingAdvanceBalance: "8000",
};

describe("TeamMemberDetailPage", () => {
  it("renders profile fields and the Work Record History table", async () => {
    mockFetchRouter({
      teamMember: baseTeamMember,
      workHistory: [
        {
          id: "wr1",
          workDate: "2026-08-10T00:00:00.000Z",
          attended: true,
          hours: "8",
          overtimeHours: "1",
          site: { id: "s1", name: "NH-48 Highway Widening" },
        },
      ],
    });

    await renderDetailPage("tm1");

    expect(screen.getByRole("heading", { name: "Ravi Kumar" })).toBeInTheDocument();
    expect(screen.getByText("Weekly")).toBeInTheDocument();
    expect(screen.getByText("+91 98765 43210")).toBeInTheDocument();
    expect(screen.getAllByText("NH-48 Highway Widening")).toHaveLength(2);
    expect(screen.getByText("8h / 1h OT")).toBeInTheDocument();
  });

  it("derives today's attendance and current site from the most recent Work Record", async () => {
    const todayStr = new Date().toISOString();
    mockFetchRouter({
      teamMember: baseTeamMember,
      workHistory: [
        { id: "wr1", workDate: todayStr, attended: true, hours: "8", overtimeHours: null, site: { id: "s1", name: "Site A" } },
      ],
    });

    await renderDetailPage("tm1");

    expect(screen.getAllByText("Present")).toHaveLength(2);
  });

  it("shows honest placeholders when the Team Member has no Work Records or Advances yet", async () => {
    mockFetchRouter({ teamMember: { ...baseTeamMember, outstandingAdvanceBalance: "0" }, workHistory: [], advances: [] });

    await renderDetailPage("tm1");

    expect(screen.getByText("No Work Records yet for this Team Member.")).toBeInTheDocument();
    expect(screen.getByText("No Advances recorded yet for this Team Member.")).toBeInTheDocument();
    expect(screen.getByText("₹0")).toBeInTheDocument();
  });

  it("renders the Outstanding Balance and Advance Ledger table, and links Correct to the right route", async () => {
    mockFetchRouter({
      teamMember: baseTeamMember,
      workHistory: [],
      advances: [
        {
          id: "adv1",
          amount: "5000",
          reason: "Medical",
          givenAt: "2026-08-05T00:00:00.000Z",
          teamMember: { id: "tm1" },
        },
      ],
    });

    await renderDetailPage("tm1");

    expect(screen.getByText("₹8,000")).toBeInTheDocument();
    expect(screen.getByText("Medical")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Record Advance" })).toHaveAttribute("href", "/team/tm1/advances/new");
    expect(screen.getByRole("link", { name: "Correct" })).toHaveAttribute("href", "/team/tm1/advances/adv1/correct");
  });

  it("shows an Absent badge for an absent Work Record with no hours", async () => {
    mockFetchRouter({
      teamMember: baseTeamMember,
      workHistory: [
        { id: "wr1", workDate: "2026-08-10T00:00:00.000Z", attended: false, hours: null, overtimeHours: null, site: { id: "s1", name: "Site A" } },
      ],
    });

    await renderDetailPage("tm1");

    expect(screen.getByText("Absent")).toBeInTheDocument();
  });

  it("shows a Disabled badge for an inactive Team Member", async () => {
    mockFetchRouter({ teamMember: { ...baseTeamMember, isActive: false }, workHistory: [] });

    await renderDetailPage("tm1");

    expect(screen.getByText("Disabled")).toBeInTheDocument();
  });

  it("calls notFound() for a Team Member ID that does not exist", async () => {
    mockFetchRouter({ teamMemberStatus: 404, teamMember: undefined, workHistory: [] });

    await expect(renderDetailPage("missing-id")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalled();
  });

  it("links the Edit action to the Team Member edit route", async () => {
    mockFetchRouter({ teamMember: baseTeamMember, workHistory: [] });

    await renderDetailPage("tm1");

    expect(screen.getByRole("link", { name: /Edit/ })).toHaveAttribute("href", "/team/tm1/edit");
  });
});
