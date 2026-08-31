import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { VehicleListClient, type VehicleListItem } from "./vehicle-list-client";

const setQuery = vi.fn();
const setPage = vi.fn();
const setSort = vi.fn();
const clearAll = vi.fn();
let hookState: { q: string; sort?: string; order?: "asc" | "desc" };

vi.mock("../../../lib/use-list-query-state", () => ({
  useListQueryState: (prefix: string) => {
    expect(prefix).toBe("v");
    return {
      ...hookState,
      setQuery,
      setPage,
      setSort,
      clearAll,
      getFilter: () => null,
      setFilter: vi.fn(),
    };
  },
}));

const vehicle: VehicleListItem = {
  id: "v1",
  number: "MH12AB1234",
  driver: null,
  currentStatus: "AVAILABLE",
  type: { id: "t1", name: "Dumper" },
  currentSite: null,
  movementLogs: [],
};

beforeEach(() => {
  hookState = { q: "" };
});

afterEach(() => {
  vi.clearAllMocks();
});

function renderClient(overrides: Partial<Parameters<typeof VehicleListClient>[0]> = {}) {
  return render(<VehicleListClient rows={[vehicle]} total={1} page={1} pageSize={25} {...overrides} />);
}

describe("VehicleListClient", () => {
  it("renders every row", () => {
    renderClient();
    expect(screen.getByText("MH12AB1234")).toBeInTheDocument();
  });

  it("debounces the search box before writing to the URL", () => {
    vi.useFakeTimers();
    try {
      renderClient();
      fireEvent.change(screen.getByLabelText("Search Vehicles"), { target: { value: "mh12" } });
      expect(setQuery).not.toHaveBeenCalled();
      vi.advanceTimersByTime(400);
      expect(setQuery).toHaveBeenCalledWith("mh12");
    } finally {
      vi.useRealTimers();
    }
  });

  it("shows Pagination once total exceeds pageSize", () => {
    renderClient({ total: 60, page: 1, pageSize: 25 });
    expect(screen.getByText("Showing 1–25 of 60")).toBeInTheDocument();
  });

  it("shows the zero-Vehicles-ever empty state with no active search", () => {
    renderClient({ rows: [], total: 0 });
    expect(screen.getByText("No Vehicles registered yet.")).toBeInTheDocument();
  });

  it("shows the no-matches empty state with Clear filters when a search is active", () => {
    hookState = { q: "nonexistent" };
    renderClient({ rows: [], total: 0 });
    expect(screen.getByText("No Vehicles match your search.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(clearAll).toHaveBeenCalledOnce();
  });

  it("calls setSort with the column's sortKey when a sortable header is clicked", () => {
    renderClient();
    fireEvent.click(screen.getByRole("button", { name: /^Number/ }));
    expect(setSort).toHaveBeenCalledWith("number");
  });
});
