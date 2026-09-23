import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LabourersListClient } from "./labourers-list-client";
import type { DailyLabourerListItem } from "./page";

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

const labourer: DailyLabourerListItem = {
  id: "l1",
  name: "Ramesh Kumar",
  category: "Mistri",
  defaultPerDayAmount: 800,
  isActive: true,
  outstandingAdvanceBalance: 0,
};

beforeEach(() => {
  hookState = { q: "" };
});

afterEach(() => {
  vi.clearAllMocks();
});

function renderClient(overrides: Partial<Parameters<typeof LabourersListClient>[0]> = {}) {
  return render(<LabourersListClient rows={[labourer]} total={1} page={1} pageSize={25} {...overrides} />);
}

describe("LabourersListClient", () => {
  it("renders every row in the desktop table and as a mobile card", () => {
    // Unlike Vendors' mobileCard (which omits the primary-line column from
    // its own detail rows via omitHeaders), this table's mobileCard config
    // has always left Name unomitted — it appears once as the desktop cell,
    // once as the mobile card's primary line, and once again as a mobile
    // card detail row. getAllByText(...).length > 0 (not an exact count) is
    // the right assertion here, same as page.test.tsx's own pattern.
    renderClient();
    expect(screen.getAllByText("Ramesh Kumar").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Mistri").length).toBeGreaterThan(0);
  });

  it("debounces the search box before writing to the URL", () => {
    vi.useFakeTimers();
    try {
      renderClient();
      fireEvent.change(screen.getByLabelText("Search"), { target: { value: "mistri" } });
      expect(setQuery).not.toHaveBeenCalled();
      vi.advanceTimersByTime(400);
      expect(setQuery).toHaveBeenCalledWith("mistri");
    } finally {
      vi.useRealTimers();
    }
  });

  it("shows Pagination once total exceeds pageSize", () => {
    renderClient({ total: 60, page: 1, pageSize: 25 });
    expect(screen.getByText("Showing 1–25 of 60")).toBeInTheDocument();
  });

  it("shows the zero-Labourers-ever empty state with no active search", () => {
    renderClient({ rows: [], total: 0 });
    expect(screen.getAllByText("No Labourers added yet.").length).toBeGreaterThan(0);
  });

  it("shows the no-matches empty state with Clear filters when a search is active", () => {
    hookState = { q: "nonexistent" };
    renderClient({ rows: [], total: 0 });
    expect(screen.getAllByText("No Labourers match your search.").length).toBeGreaterThan(0);
    fireEvent.click(screen.getAllByRole("button", { name: "Clear filters" })[0]!);
    expect(clearAll).toHaveBeenCalledOnce();
  });

  it("links each row to the Labourer detail route", () => {
    renderClient();
    expect(screen.getAllByRole("link", { name: /Ramesh Kumar/ })[0]).toHaveAttribute("href", "/labour-payments/l1");
  });

  it("calls setSort with the column's sortKey when a sortable header is clicked", () => {
    renderClient();
    fireEvent.click(screen.getByRole("button", { name: /^Name/ }));
    expect(setSort).toHaveBeenCalledWith("name");
  });

  it("calls setSort with 'category' when the Category header is clicked", () => {
    renderClient();
    fireEvent.click(screen.getByRole("button", { name: /^Category/ }));
    expect(setSort).toHaveBeenCalledWith("category");
  });
});
