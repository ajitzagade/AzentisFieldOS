import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { InventoryListClient, type InventoryRow } from "./inventory-list-client";

const setQuery = vi.fn();
const setPage = vi.fn();
const setSort = vi.fn();
const setFilter = vi.fn();
const clearAll = vi.fn();
let hookState: { q: string; sort?: string; order?: "asc" | "desc" };
let filters: Record<string, string | null>;

vi.mock("../../../lib/use-list-query-state", () => ({
  useListQueryState: () => ({
    ...hookState,
    setQuery,
    setPage,
    setSort,
    setFilter: (name: string, value: string | null) => {
      filters[name] = value;
      setFilter(name, value);
    },
    getFilter: (name: string) => filters[name] ?? null,
    clearAll,
  }),
}));

const godownRow: InventoryRow = {
  materialId: "mat-1",
  materialName: "Cement (OPC 53 Grade)",
  categoryId: "cat-1",
  categoryName: "Cement",
  sizeLabel: "",
  unit: "Bags",
  locationType: "GODOWN",
  siteId: null,
  siteName: null,
  quantity: "120",
  updatedAt: "2026-09-01T10:00:00.000Z",
};

const siteRow: InventoryRow = {
  materialId: "mat-2",
  materialName: "RCC Pipe",
  categoryId: "cat-2",
  categoryName: "Pipes",
  sizeLabel: "600mm",
  unit: "Pcs",
  locationType: "SITE",
  siteId: "site-1",
  siteName: "NH-48 Highway Widening",
  quantity: "22",
  updatedAt: "2026-09-02T10:00:00.000Z",
};

const categories = [{ id: "cat-1", name: "Cement" }, { id: "cat-2", name: "Pipes" }];
const sites = [{ id: "site-1", name: "NH-48 Highway Widening" }];

beforeEach(() => {
  hookState = { q: "" };
  filters = {};
});

afterEach(() => {
  vi.clearAllMocks();
});

function renderClient(overrides: Partial<Parameters<typeof InventoryListClient>[0]> = {}) {
  return render(
    <InventoryListClient
      rows={[godownRow, siteRow]}
      total={2}
      page={1}
      pageSize={25}
      categories={categories}
      sites={sites}
      {...overrides}
    />,
  );
}

describe("InventoryListClient", () => {
  it("renders every row with its Location, Location Type, Qty and Unit", () => {
    renderClient();

    expect(screen.getAllByText("Cement (OPC 53 Grade)").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Godown").length).toBeGreaterThan(0);
    expect(screen.getAllByText("RCC Pipe").length).toBeGreaterThan(0);
    expect(screen.getAllByText("NH-48 Highway Widening").length).toBeGreaterThan(0);
    expect(screen.getAllByText("120").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Pcs").length).toBeGreaterThan(0);
  });

  it("links a Material's name to its /materials/[id]/availability page", () => {
    renderClient();

    expect(screen.getAllByRole("link", { name: /^Cement \(OPC 53 Grade\)/ })[0]).toHaveAttribute(
      "href",
      "/materials/mat-1/availability",
    );
  });

  it("debounces the search box before writing to the URL", () => {
    vi.useFakeTimers();
    try {
      renderClient();
      fireEvent.change(screen.getByLabelText("Search"), { target: { value: "cement" } });
      expect(setQuery).not.toHaveBeenCalled();
      vi.advanceTimersByTime(400);
      expect(setQuery).toHaveBeenCalledWith("cement");
    } finally {
      vi.useRealTimers();
    }
  });

  it("sets the categoryId filter from the Category dropdown", () => {
    renderClient();

    fireEvent.change(screen.getByLabelText("Category"), { target: { value: "cat-2" } });

    expect(setFilter).toHaveBeenCalledWith("categoryId", "cat-2");
  });

  it("sets the siteId filter from the Site dropdown", () => {
    renderClient();

    fireEvent.change(screen.getByLabelText("Site"), { target: { value: "site-1" } });

    expect(setFilter).toHaveBeenCalledWith("siteId", "site-1");
  });

  it("sets the locationType filter via the Location Type quick-filter chips", () => {
    renderClient();

    fireEvent.click(screen.getByRole("button", { name: "Godown" }));

    expect(setFilter).toHaveBeenCalledWith("locationType", "GODOWN");
  });

  it("sets the stockLevel filter via the Stock Level quick-filter chips", () => {
    renderClient();

    fireEvent.click(screen.getByRole("button", { name: "Low Stock" }));

    expect(setFilter).toHaveBeenCalledWith("stockLevel", "LOW");
  });

  it("marks the active quick-filter chip with aria-pressed=true and the rest false", () => {
    filters.locationType = "GODOWN";
    renderClient();

    const locationGroup = within(screen.getByRole("group", { name: "Location type filter" }));
    expect(locationGroup.getByRole("button", { name: "Godown" })).toHaveAttribute("aria-pressed", "true");
    expect(locationGroup.getByRole("button", { name: "All" })).toHaveAttribute("aria-pressed", "false");
    expect(locationGroup.getByRole("button", { name: "Site" })).toHaveAttribute("aria-pressed", "false");
  });

  it("groups each quick-filter chip row under a labelled group", () => {
    renderClient();

    expect(screen.getByRole("group", { name: "Location type filter" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Stock level filter" })).toBeInTheDocument();
  });

  it("calls setSort with the column's sortKey when a sortable header is clicked", () => {
    renderClient();

    fireEvent.click(screen.getByRole("button", { name: /^Material/ }));

    expect(setSort).toHaveBeenCalledWith("materialName");
  });

  it("shows Pagination once total exceeds pageSize", () => {
    renderClient({ total: 60, page: 1, pageSize: 25 });

    expect(screen.getByText("Showing 1–25 of 60")).toBeInTheDocument();
  });

  it("shows the nothing-recorded-yet empty state with no active filters", () => {
    renderClient({ rows: [], total: 0 });

    expect(
      screen.getAllByText(
        "Nothing recorded yet — Godown and Site stock will appear here once Purchases and Movements are recorded.",
      ),
    ).toHaveLength(2);
  });

  it("shows the no-results-match empty state with Clear filters when a search is active", () => {
    hookState = { q: "xyz" };
    renderClient({ rows: [], total: 0 });

    expect(screen.getAllByText("No results match your filters.")).toHaveLength(2);
    fireEvent.click(screen.getAllByRole("button", { name: "Clear filters" })[0]!);
    expect(clearAll).toHaveBeenCalledWith(["categoryId", "siteId", "locationType", "stockLevel"]);
  });

  it("shows the no-results-match empty state when a quick filter is active even with no search text", () => {
    filters.stockLevel = "ZERO";
    renderClient({ rows: [], total: 0 });

    expect(screen.getAllByText("No results match your filters.")).toHaveLength(2);
  });
});
