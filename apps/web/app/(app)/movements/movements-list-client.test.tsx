import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MovementsListClient, type MovementLogRow } from "./movements-list-client";

const setQuery = vi.fn();
const setPage = vi.fn();
const setSort = vi.fn();
const setFilter = vi.fn();
const clearAll = vi.fn();
let hookState: {
  q: string;
  getFilter: (name: string) => string | null;
  sort?: string;
  order?: "asc" | "desc";
};

vi.mock("../../../lib/use-list-query-state", () => ({
  useListQueryState: () => ({
    ...hookState,
    setQuery,
    setPage,
    setSort,
    setFilter,
    clearAll,
  }),
}));

const godownPurchase: MovementLogRow = {
  type: "PURCHASE",
  id: "p1",
  item: {
    id: "p1",
    destination: "GODOWN",
    quantity: "200",
    purchasedAt: "2026-08-11T00:00:00.000Z",
    site: null,
    materialSize: { label: "OPC 53 Grade", material: { name: "Cement", unit: { name: "Bags" } } },
  },
};

const pendingMovement: MovementLogRow = {
  type: "MOVEMENT",
  id: "m1",
  item: {
    id: "m1",
    sentQuantity: "1300",
    receivedQuantity: null,
    movedAt: "2026-08-10T00:00:00.000Z",
    sourceSite: null,
    destinationSite: { id: "site1", name: "NH-48 Highway Widening" },
    materialSize: { label: "12mm", material: { name: "TMT Steel", unit: { name: "Kg" } } },
  },
};

beforeEach(() => {
  hookState = { q: "", getFilter: () => null };
});

afterEach(() => {
  vi.clearAllMocks();
});

function renderClient(overrides: Partial<Parameters<typeof MovementsListClient>[0]> = {}) {
  return render(
    <MovementsListClient rows={[godownPurchase, pendingMovement]} total={2} page={1} pageSize={25} sites={[]} {...overrides} />,
  );
}

describe("MovementsListClient", () => {
  it("renders a Purchase row and a Movement row using the existing per-type mapping", () => {
    renderClient();
    const table = within(screen.getByRole("table"));
    expect(table.getByText("Purchase")).toBeInTheDocument();
    expect(table.getByText("Cement (OPC 53 Grade)")).toBeInTheDocument();
    expect(table.getByText("Movement")).toBeInTheDocument();
    expect(table.getByText("TMT Steel (12mm)")).toBeInTheDocument();
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

  it("calls setFilter when the Type filter changes", async () => {
    const user = userEvent.setup();
    renderClient();
    await user.selectOptions(screen.getByLabelText("Type"), "PURCHASE");
    expect(setFilter).toHaveBeenCalledWith("type", "PURCHASE");
  });

  it("calls setFilter when the Site filter changes", async () => {
    const user = userEvent.setup();
    renderClient({ sites: [{ id: "site1", name: "NH-48 Highway Widening" }] });
    await user.selectOptions(screen.getByLabelText("Site"), "site1");
    expect(setFilter).toHaveBeenCalledWith("siteId", "site1");
  });

  it("shows the Pagination control once total exceeds pageSize", () => {
    renderClient({ total: 60, page: 1, pageSize: 25 });
    expect(screen.getByText("Showing 1–25 of 60")).toBeInTheDocument();
  });

  it("shows the zero-records-ever empty state when there is no active search or filter", () => {
    renderClient({ rows: [], total: 0 });
    expect(screen.getByText(/No Purchases, movements, consumption, or wastage\/return recorded yet\./)).toBeInTheDocument();
  });

  it("shows the no-matches empty state with Clear filters when a search is active and nothing matches", async () => {
    hookState = { q: "nonexistent", getFilter: () => null };
    const user = userEvent.setup();
    renderClient({ rows: [], total: 0 });

    expect(screen.getByText("No entries match your search or filters.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(clearAll).toHaveBeenCalledOnce();
  });

  it("shows the no-matches empty state (not the zero-ever state) when only a date-range filter is active", () => {
    hookState = { q: "", getFilter: (name) => (name === "from" ? "2026-08-01" : null) };
    renderClient({ rows: [], total: 0 });

    expect(screen.getByText("No entries match your search or filters.")).toBeInTheDocument();
    expect(
      screen.queryByText(/No Purchases, movements, consumption, or wastage\/return recorded yet\./),
    ).not.toBeInTheDocument();
  });

  it("calls setSort with the column's sortKey when the Date header is clicked", () => {
    renderClient();
    fireEvent.click(screen.getByRole("button", { name: /^Date/ }));
    expect(setSort).toHaveBeenCalledWith("date");
  });
});
