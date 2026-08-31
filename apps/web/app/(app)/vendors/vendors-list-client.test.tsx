import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { VendorsListClient, type VendorRow } from "./vendors-list-client";

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

const vendor: VendorRow = {
  id: "v1",
  name: "Anand RMC Suppliers",
  contactPerson: null,
  phone: null,
  email: null,
  address: null,
  materialsSupplied: [],
  summary: null,
};

beforeEach(() => {
  hookState = { q: "" };
});

afterEach(() => {
  vi.clearAllMocks();
});

function renderClient(overrides: Partial<Parameters<typeof VendorsListClient>[0]> = {}) {
  return render(<VendorsListClient rows={[vendor]} total={1} page={1} pageSize={25} {...overrides} />);
}

describe("VendorsListClient", () => {
  it("renders every row", () => {
    renderClient();
    expect(screen.getByText("Anand RMC Suppliers")).toBeInTheDocument();
  });

  it("debounces the search box before writing to the URL", () => {
    vi.useFakeTimers();
    try {
      renderClient();
      fireEvent.change(screen.getByLabelText("Search"), { target: { value: "anand" } });
      expect(setQuery).not.toHaveBeenCalled();
      vi.advanceTimersByTime(400);
      expect(setQuery).toHaveBeenCalledWith("anand");
    } finally {
      vi.useRealTimers();
    }
  });

  it("shows Pagination once total exceeds pageSize", () => {
    renderClient({ total: 60, page: 1, pageSize: 25 });
    expect(screen.getByText("Showing 1–25 of 60")).toBeInTheDocument();
  });

  it("shows the zero-Vendors-ever empty state with no active search", () => {
    renderClient({ rows: [], total: 0 });
    expect(screen.getByText("No Vendors yet.")).toBeInTheDocument();
  });

  it("shows the no-matches empty state with Clear filters when a search is active", () => {
    hookState = { q: "nonexistent" };
    renderClient({ rows: [], total: 0 });
    expect(screen.getByText("No Vendors match your search.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(clearAll).toHaveBeenCalledOnce();
  });

  it("links each row to the Vendor detail route", () => {
    renderClient();
    expect(within(screen.getByRole("table")).getByText("Anand RMC Suppliers").closest("a")).toHaveAttribute(
      "href",
      "/vendors/v1",
    );
  });

  it("calls setSort with the column's sortKey when a sortable header is clicked", () => {
    renderClient();
    fireEvent.click(screen.getByRole("button", { name: /^Vendor/ }));
    expect(setSort).toHaveBeenCalledWith("name");
  });
});
