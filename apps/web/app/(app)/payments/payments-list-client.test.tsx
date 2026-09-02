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
  return render(
    <PaymentsListClient rows={[payment]} total={1} page={1} pageSize={25} canManage={true} {...overrides} />,
  );
}

describe("PaymentsListClient", () => {
  it("renders every row in the desktop table and as a mobile card", () => {
    renderClient();
    // Once in the md+ table row, once as the below-md card's primary line.
    expect(screen.getAllByText("Ravi Kumar")).toHaveLength(2);
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
    // Rendered as both the desktop table panel and the mobile card panel.
    expect(screen.getAllByText("No Payments recorded yet.")).toHaveLength(2);
  });

  it("shows the no-matches empty state with Clear filters when a search is active", () => {
    hookState = { q: "nonexistent" };
    renderClient({ rows: [], total: 0 });
    expect(screen.getAllByText("No Payments match your search.")).toHaveLength(2);
    fireEvent.click(screen.getAllByRole("button", { name: "Clear filters" })[0]!);
    expect(clearAll).toHaveBeenCalledOnce();
  });

  it("calls setSort with the column's sortKey when a sortable header is clicked", () => {
    renderClient();
    fireEvent.click(screen.getByRole("button", { name: /^Net Payable/ }));
    expect(setSort).toHaveBeenCalledWith("netPayable");
  });

  it("hides Correct and the zero-state Record-Payment link when canManage is false (SITE_SUPERVISOR)", () => {
    renderClient({ canManage: false });
    expect(screen.queryByRole("link", { name: /Correct/ })).not.toBeInTheDocument();

    renderClient({ canManage: false, rows: [], total: 0 });
    expect(screen.queryByRole("link", { name: /Record your first Payment/ })).not.toBeInTheDocument();
  });
});
