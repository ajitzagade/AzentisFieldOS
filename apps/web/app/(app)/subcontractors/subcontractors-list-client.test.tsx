import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SubcontractorsListClient } from "./subcontractors-list-client";
import type { Subcontractor } from "./page";

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

const subcontractor: Subcontractor = {
  id: "s1",
  name: "Sharma Excavation Works",
  contactPerson: null,
  phone: "9876543210",
  email: null,
  address: null,
  workCategories: [],
};

beforeEach(() => {
  hookState = { q: "" };
});

afterEach(() => {
  vi.clearAllMocks();
});

function renderClient(overrides: Partial<Parameters<typeof SubcontractorsListClient>[0]> = {}) {
  return render(
    <SubcontractorsListClient rows={[subcontractor]} total={1} page={1} pageSize={25} canCreate {...overrides} />,
  );
}

describe("SubcontractorsListClient", () => {
  it("renders every row in the desktop table and as a mobile card", () => {
    renderClient();
    // Once in the md+ table row, once as the below-md card's primary line.
    expect(screen.getAllByText("Sharma Excavation Works")).toHaveLength(2);
  });

  it("renders the previously-clipping Phone column as a card label/value row below md, unchanged in the desktop table", () => {
    renderClient();
    expect(screen.getAllByText("9876543210")).toHaveLength(2);
    const list = screen.getByRole("list");
    expect(within(list).getByText("Phone")).toBeInTheDocument();
    expect(within(list).getByText("9876543210")).toBeInTheDocument();
    const table = screen.getByRole("table");
    expect(within(table).getByText("Phone")).toBeInTheDocument();
    expect(within(table).getByText("9876543210")).toBeInTheDocument();
  });

  it("debounces the search box before writing to the URL", () => {
    vi.useFakeTimers();
    try {
      renderClient();
      fireEvent.change(screen.getByLabelText("Search"), { target: { value: "sharma" } });
      expect(setQuery).not.toHaveBeenCalled();
      vi.advanceTimersByTime(400);
      expect(setQuery).toHaveBeenCalledWith("sharma");
    } finally {
      vi.useRealTimers();
    }
  });

  it("shows Pagination once total exceeds pageSize", () => {
    renderClient({ total: 60, page: 1, pageSize: 25 });
    expect(screen.getByText("Showing 1–25 of 60")).toBeInTheDocument();
  });

  it("shows the zero-Subcontractors-ever empty state with no active search", () => {
    renderClient({ rows: [], total: 0 });
    expect(screen.getAllByText("No Subcontractors yet.")).toHaveLength(2);
  });

  it("shows the no-matches empty state with Clear filters when a search is active", () => {
    hookState = { q: "nonexistent" };
    renderClient({ rows: [], total: 0 });
    expect(screen.getAllByText("No Subcontractors match your search.")).toHaveLength(2);
    fireEvent.click(screen.getAllByRole("button", { name: "Clear filters" })[0]!);
    expect(clearAll).toHaveBeenCalledOnce();
  });

  it("links each row directly to the Subcontractor detail route, with no intermediate panel", () => {
    renderClient();
    const link = within(screen.getByRole("table")).getByText("Sharma Excavation Works").closest("a") as HTMLAnchorElement;
    expect(link).toHaveAttribute("href", "/subcontractors/s1");
    const notPrevented = fireEvent.click(link);
    expect(notPrevented).toBe(true);
  });

  it("calls setSort with the column's sortKey when a sortable header is clicked", () => {
    renderClient();
    fireEvent.click(screen.getByRole("button", { name: /^Name/ }));
    expect(setSort).toHaveBeenCalledWith("name");
  });
});
