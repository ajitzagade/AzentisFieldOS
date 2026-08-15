import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import TeamPage from "./page";

async function renderTeamPage() {
  const element = await TeamPage();
  render(element);
}

const originalFetch = global.fetch;
const originalApiUrl = process.env.API_URL;

const defaultSummary = {
  totalTeamMembers: 0,
  todaysWorkingHeadcount: 0,
  weeklyPaymentTotal: 0,
  monthlyPaymentTotal: 0,
  totalOutstandingAdvances: 0,
};

function mockFetch(teamMembers: unknown[], summary = defaultSummary) {
  global.fetch = vi.fn(async (url: string | URL | Request) => {
    const href = typeof url === "string" ? url : url.toString();
    if (href.endsWith("/team-members/team-summary")) {
      return { ok: true, json: async () => summary } as Response;
    }
    return { ok: true, json: async () => teamMembers } as Response;
  }) as unknown as typeof fetch;
}

beforeEach(() => {
  process.env.API_URL = "http://localhost:3001";
});

afterEach(() => {
  global.fetch = originalFetch;
  process.env.API_URL = originalApiUrl;
  vi.restoreAllMocks();
});

describe("TeamPage", () => {
  it("renders Name/Role/Employment Type columns, and honest placeholders when a Team Member has no derived attendance/site yet", async () => {
    mockFetch([
      {
        id: "tm1",
        name: "Ravi Kumar",
        designation: "Bar Bender",
        isActive: true,
        employmentType: { id: "e1", name: "Weekly" },
        currentOrLastSite: null,
        todaysAttendance: null,
      },
    ]);

    await renderTeamPage();

    expect(screen.getByText("Ravi Kumar")).toBeInTheDocument();
    expect(screen.getByText("Bar Bender")).toBeInTheDocument();
    expect(screen.getByText("Weekly")).toBeInTheDocument();
    expect(screen.getAllByText("—")).toHaveLength(2);
  });

  it("renders the real Today's Attendance badge and Current/Last Site from the derived list() response", async () => {
    mockFetch([
      {
        id: "tm1",
        name: "Ravi Kumar",
        designation: "Bar Bender",
        isActive: true,
        employmentType: { id: "e1", name: "Weekly" },
        currentOrLastSite: "NH-48 Highway Widening",
        todaysAttendance: "PRESENT",
      },
    ]);

    await renderTeamPage();

    expect(screen.getByText("Present")).toBeInTheDocument();
    expect(screen.getByText("NH-48 Highway Widening")).toBeInTheDocument();
  });

  it("shows a Disabled badge for an inactive Team Member without hiding it from the list", async () => {
    mockFetch([
      {
        id: "tm1",
        name: "Old Member",
        designation: null,
        isActive: false,
        employmentType: { id: "e1", name: "Monthly" },
        currentOrLastSite: null,
        todaysAttendance: null,
      },
    ]);

    await renderTeamPage();

    expect(screen.getByText("Old Member")).toBeInTheDocument();
    expect(screen.getByText("Disabled")).toBeInTheDocument();
  });

  it("renders the real stat tiles from the team-summary endpoint, not the raw list length", async () => {
    mockFetch(
      [
        {
          id: "tm1",
          name: "A",
          designation: null,
          isActive: true,
          employmentType: { id: "e1", name: "Monthly" },
          currentOrLastSite: null,
          todaysAttendance: null,
        },
        {
          id: "tm2",
          name: "B",
          designation: null,
          isActive: true,
          employmentType: { id: "e1", name: "Monthly" },
          currentOrLastSite: null,
          todaysAttendance: null,
        },
      ],
      {
        totalTeamMembers: 2,
        todaysWorkingHeadcount: 1,
        weeklyPaymentTotal: 0,
        monthlyPaymentTotal: 0,
        totalOutstandingAdvances: 6000,
      },
    );

    await renderTeamPage();

    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("₹6,000")).toBeInTheDocument();
  });

  it("renders the empty state with an add-first-Team-Member action when there are zero rows", async () => {
    mockFetch([]);

    await renderTeamPage();

    expect(screen.getByText("No Team Members yet.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Add your first Team Member/ })).toHaveAttribute("href", "/team/new");
  });

  it("links each row to the Team Member detail route", async () => {
    mockFetch([
      {
        id: "abc",
        name: "Ravi Kumar",
        designation: null,
        isActive: true,
        employmentType: { id: "e1", name: "Weekly" },
        currentOrLastSite: null,
        todaysAttendance: null,
      },
    ]);

    await renderTeamPage();

    expect(screen.getByRole("link", { name: /Ravi Kumar/ })).toHaveAttribute("href", "/team/abc");
  });

  it("links the header actions to Add Team Member and Employment Types", async () => {
    mockFetch([]);

    await renderTeamPage();

    expect(screen.getByRole("link", { name: /Add Team Member/ })).toHaveAttribute("href", "/team/new");
    expect(screen.getByRole("link", { name: "Employment Types" })).toHaveAttribute("href", "/team/employment-types");
  });
});
