import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TeamMembersListClient } from "./team-members-list-client";
import type { TeamMemberListItem } from "./page";

const setQuery = vi.fn();
const setPage = vi.fn();
const setSort = vi.fn();
const clearAll = vi.fn();
let hookState: { q: string; sort?: string; order?: "asc" | "desc" };

vi.mock("../../../lib/use-list-query-state", () => ({
  useListQueryState: () => ({
    ...hookState,
    setQuery,
    setPage,
    setSort,
    clearAll,
    getFilter: () => null,
    setFilter: vi.fn(),
  }),
}));

const teamMember: TeamMemberListItem = {
  id: "tm1",
  name: "Ravi Kumar",
  designation: "Bar Bender",
  isActive: true,
  employmentType: { id: "e1", name: "Weekly" },
  currentOrLastSite: null,
  todaysAttendance: null,
};

beforeEach(() => {
  hookState = { q: "" };
});

afterEach(() => {
  vi.clearAllMocks();
});

function renderClient(overrides: Partial<Parameters<typeof TeamMembersListClient>[0]> = {}) {
  return render(<TeamMembersListClient rows={[teamMember]} total={1} page={1} pageSize={25} {...overrides} />);
}

describe("TeamMembersListClient", () => {
  it("renders every row", () => {
    renderClient();
    expect(screen.getByText("Ravi Kumar")).toBeInTheDocument();
  });

  it("debounces the search box before writing to the URL", () => {
    vi.useFakeTimers();
    try {
      renderClient();
      fireEvent.change(screen.getByLabelText("Search"), { target: { value: "ravi" } });
      expect(setQuery).not.toHaveBeenCalled();
      vi.advanceTimersByTime(400);
      expect(setQuery).toHaveBeenCalledWith("ravi");
    } finally {
      vi.useRealTimers();
    }
  });

  it("shows Pagination once total exceeds pageSize", () => {
    renderClient({ total: 60, page: 1, pageSize: 25 });
    expect(screen.getByText("Showing 1–25 of 60")).toBeInTheDocument();
  });

  it("shows the zero-Team-Members-ever empty state with no active search", () => {
    renderClient({ rows: [], total: 0 });
    expect(screen.getByText("No Team Members yet.")).toBeInTheDocument();
  });

  it("shows the no-matches empty state with Clear filters when a search is active", async () => {
    hookState = { q: "nonexistent" };
    renderClient({ rows: [], total: 0 });
    expect(screen.getByText("No Team Members match your search.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(clearAll).toHaveBeenCalledOnce();
  });

  it("links each row to the Team Member detail route", () => {
    renderClient();
    expect(within(screen.getByRole("table")).getByText("Ravi Kumar").closest("a")).toHaveAttribute("href", "/team/tm1");
  });

  it("calls setSort with the column's sortKey when a sortable header is clicked", async () => {
    renderClient();
    fireEvent.click(screen.getByRole("button", { name: /^Name/ }));
    expect(setSort).toHaveBeenCalledWith("name");
  });
});
