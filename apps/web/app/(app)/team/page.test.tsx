import { render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import TeamPage from "./page";

vi.mock("next/navigation", () => ({
  usePathname: () => "/team",
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ replace: vi.fn() }),
}));

async function renderTeamPage() {
  const element = await TeamPage({ searchParams: Promise.resolve({}) });
  render(element);
}

const originalFetch = global.fetch;
const originalApiUrl = process.env.API_URL;

const defaultSummary = {
  totalTeamMembers: 0,
  todaysWorkingHeadcount: 0,
  weeklyPaymentTotal: 0,
  monthlyPaymentTotal: 0,
};

const defaultOutstandingAdvances = { total: 0, byTeamMember: [] };

function mockFetch(
  teamMembers: unknown[],
  summary = defaultSummary,
  outstandingAdvances: unknown = defaultOutstandingAdvances,
) {
  global.fetch = vi.fn(async (url: string | URL | Request) => {
    const href = typeof url === "string" ? url : url.toString();
    if (href.endsWith("/team-members/team-summary")) {
      return { ok: true, json: async () => summary } as Response;
    }
    if (href.endsWith("/team-members/outstanding-advances")) {
      return { ok: true, json: async () => outstandingAdvances } as Response;
    }
    return {
      ok: true,
      json: async () => ({ rows: teamMembers, total: teamMembers.length, page: 1, pageSize: 25 }),
    } as Response;
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

    const table = within(screen.getAllByRole("table")[0]!);
    expect(table.getByText("Ravi Kumar")).toBeInTheDocument();
    expect(table.getByText("Bar Bender")).toBeInTheDocument();
    expect(table.getByText("Weekly")).toBeInTheDocument();
    expect(table.getAllByText("—")).toHaveLength(2);
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

    const table = within(screen.getAllByRole("table")[0]!);
    expect(table.getByText("Present")).toBeInTheDocument();
    expect(table.getByText("NH-48 Highway Widening")).toBeInTheDocument();
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

    const table = within(screen.getAllByRole("table")[0]!);
    expect(table.getByText("Old Member")).toBeInTheDocument();
    expect(table.getByText("Disabled")).toBeInTheDocument();
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
      },
      {
        total: 6000,
        byTeamMember: [{ teamMemberId: "tm1", name: "A", outstandingAdvanceBalance: "6000" }],
      },
    );

    await renderTeamPage();

    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getAllByText("₹6,000")).toHaveLength(2);
  });

  it("renders the Outstanding Advances drill-down table, linking each row to the Team Member detail route (AC #2)", async () => {
    mockFetch(
      [],
      defaultSummary,
      {
        total: 6000,
        byTeamMember: [
          { teamMemberId: "tm1", name: "Ravi Kumar", outstandingAdvanceBalance: "6000" },
          { teamMemberId: "tm2", name: "Fully Repaid", outstandingAdvanceBalance: "0" },
        ],
      },
    );

    await renderTeamPage();

    expect(screen.getByText("Outstanding Advances")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Ravi Kumar/ })).toHaveAttribute("href", "/team/tm1");
    expect(screen.queryByText("Fully Repaid")).not.toBeInTheDocument();
  });

  it("shows an honest empty state in the Outstanding Advances section when no one owes anything", async () => {
    mockFetch([]);

    await renderTeamPage();

    expect(screen.getByText("No Team Member currently has an Outstanding Advance.")).toBeInTheDocument();
  });

  it("renders the empty state with an add-first-Team-Member action when there are zero rows", async () => {
    mockFetch([]);

    await renderTeamPage();

    // Rendered as both the desktop table panel and the mobile card panel.
    expect(screen.getAllByText("No Team Members yet.")).toHaveLength(2);
    expect(screen.getAllByRole("link", { name: /Add your first Team Member/ })[0]).toHaveAttribute(
      "href",
      "/team/new",
    );
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

    const table = within(screen.getAllByRole("table")[0]!);
    expect(table.getByRole("link", { name: /Ravi Kumar/ })).toHaveAttribute("href", "/team/abc");
  });

  it("links the header actions to Add Team Member and Employment Types", async () => {
    mockFetch([]);

    await renderTeamPage();

    expect(screen.getByRole("link", { name: /Add Team Member/ })).toHaveAttribute("href", "/team/new");
    expect(screen.getByRole("link", { name: "Employment Types" })).toHaveAttribute("href", "/team/employment-types");
  });
});
