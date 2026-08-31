import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RmcEntriesListClient, type RmcEntryRow } from "./rmc-entries-list-client";

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

const entry: RmcEntryRow = {
  id: "r1",
  quantityM3: "12",
  grade: "M25",
  ratePerM3: "5500",
  totalAmount: "66000",
  invoiceOrChallanNo: null,
  challanPhotoUrl: null,
  deliveredAt: "2026-08-10T00:00:00.000Z",
  site: { id: "s1", name: "NH-48 Highway Widening" },
  vendor: { id: "v1", name: "Anand RMC Suppliers" },
};

beforeEach(() => {
  hookState = { q: "" };
});

afterEach(() => {
  vi.clearAllMocks();
});

function renderClient(overrides: Partial<Parameters<typeof RmcEntriesListClient>[0]> = {}) {
  return render(<RmcEntriesListClient rows={[entry]} total={1} page={1} pageSize={25} {...overrides} />);
}

describe("RmcEntriesListClient", () => {
  it("renders every row", () => {
    renderClient();
    expect(screen.getByText("Anand RMC Suppliers")).toBeInTheDocument();
  });

  it("debounces the search box before writing to the URL", () => {
    vi.useFakeTimers();
    try {
      renderClient();
      fireEvent.change(screen.getByLabelText("Search"), { target: { value: "m25" } });
      expect(setQuery).not.toHaveBeenCalled();
      vi.advanceTimersByTime(400);
      expect(setQuery).toHaveBeenCalledWith("m25");
    } finally {
      vi.useRealTimers();
    }
  });

  it("shows Pagination once total exceeds pageSize", () => {
    renderClient({ total: 60, page: 1, pageSize: 25 });
    expect(screen.getByText("Showing 1–25 of 60")).toBeInTheDocument();
  });

  it("shows the zero-deliveries-ever empty state with no active search", () => {
    renderClient({ rows: [], total: 0 });
    expect(screen.getByText("No RMC deliveries logged yet.")).toBeInTheDocument();
  });

  it("shows the no-matches empty state with Clear filters when a search is active", () => {
    hookState = { q: "nonexistent" };
    renderClient({ rows: [], total: 0 });
    expect(screen.getByText("No RMC deliveries match your search.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(clearAll).toHaveBeenCalledOnce();
  });

  it("calls setSort with the column's sortKey when a sortable header is clicked", () => {
    renderClient();
    fireEvent.click(screen.getByRole("button", { name: /^Vendor/ }));
    expect(setSort).toHaveBeenCalledWith("vendor");
  });
});
