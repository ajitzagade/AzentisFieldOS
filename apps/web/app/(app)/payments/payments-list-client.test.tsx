import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PaymentsListClient, type PaymentListItem } from "./payments-list-client";

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

vi.mock("./mark-paid-button", () => ({
  MarkPaidButton: () => null,
}));

const payment: PaymentListItem = {
  id: "p1",
  basePay: "10000",
  additionalAmount: "0",
  deductions: "0",
  netPayable: "10000",
  payPeriod: "Aug 2026",
  status: "pending",
  teamMember: { id: "tm1", name: "Ravi Kumar" },
  advanceAdjustments: [],
};

beforeEach(() => {
  hookState = { q: "" };
});

afterEach(() => {
  vi.clearAllMocks();
});

function renderClient(overrides: Partial<Parameters<typeof PaymentsListClient>[0]> = {}) {
  return render(<PaymentsListClient rows={[payment]} total={1} page={1} pageSize={25} {...overrides} />);
}

describe("PaymentsListClient", () => {
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

  it("shows the zero-Payments-ever empty state with no active search", () => {
    renderClient({ rows: [], total: 0 });
    expect(screen.getByText("No Payments recorded yet.")).toBeInTheDocument();
  });

  it("shows the no-matches empty state with Clear filters when a search is active", () => {
    hookState = { q: "nonexistent" };
    renderClient({ rows: [], total: 0 });
    expect(screen.getByText("No Payments match your search.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(clearAll).toHaveBeenCalledOnce();
  });

  it("calls setSort with the column's sortKey when a sortable header is clicked", () => {
    renderClient();
    fireEvent.click(screen.getByRole("button", { name: /^Net Payable/ }));
    expect(setSort).toHaveBeenCalledWith("netPayable");
  });
});
