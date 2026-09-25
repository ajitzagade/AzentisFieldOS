import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HistoryListClient, type DsrHistoryRow } from "./history-list-client";

const setQuery = vi.fn();
const setPage = vi.fn();
const setSort = vi.fn();
const setFilter = vi.fn();
const clearAll = vi.fn();
let hookState: { q: string; sort?: string; order?: "asc" | "desc"; filters: Record<string, string | null> };

vi.mock("../../../lib/use-list-query-state", () => ({
  useListQueryState: () => ({
    q: hookState.q,
    sort: hookState.sort,
    order: hookState.order,
    setQuery,
    setPage,
    setSort,
    setFilter,
    clearAll,
    getFilter: (name: string) => hookState.filters[name] ?? null,
  }),
}));

const sites = [
  { id: "site-1", name: "NH-48 Highway Widening" },
  { id: "site-2", name: "Sector 12 Metro Depot" },
];

function row(overrides: Partial<DsrHistoryRow> = {}): DsrHistoryRow {
  return {
    id: "dsr-1",
    site: { id: "site-1", name: "NH-48 Highway Widening" },
    submittedBy: { name: "Ramesh Yadav" },
    reportDate: "2026-09-01T00:00:00.000Z",
    submittedAt: "2026-09-01T08:00:00.000Z",
    lastUpdatedAt: "2026-09-01T08:00:00.000Z",
    status: "ORIGINAL",
    ...overrides,
  };
}

beforeEach(() => {
  hookState = { q: "", filters: {} };
});

afterEach(() => {
  vi.clearAllMocks();
});

function renderClient(overrides: Partial<Parameters<typeof HistoryListClient>[0]> = {}) {
  return render(
    <HistoryListClient rows={[row()]} total={1} page={1} pageSize={25} sites={sites} {...overrides} />,
  );
}

describe("HistoryListClient", () => {
  it("renders every row's Site, Submitted By, and Status in the desktop table and mobile card", () => {
    renderClient();
    expect(screen.getAllByText("NH-48 Highway Widening").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Ramesh Yadav").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Original").length).toBeGreaterThan(0);
  });

  // I/O matrix: "Edited once" / "Edited twice" both surface as Status "Edited".
  it('shows an "Edited" badge (not "Original") once a report has any edit history', () => {
    renderClient({ rows: [row({ status: "EDITED" })] });
    expect(screen.getAllByText("Edited").length).toBeGreaterThan(0);
    expect(screen.queryAllByText("Original")).toHaveLength(0);
  });

  it("links each row's Edit action to the correct route", () => {
    renderClient({ rows: [row({ id: "dsr-42" })] });
    const editLinks = screen.getAllByRole("link", { name: "Edit" });
    expect(editLinks.length).toBeGreaterThan(0);
    for (const link of editLinks) {
      expect(link).toHaveAttribute("href", "/daily-activity/dsr-42/correct");
    }
  });

  it("makes the whole row a link to its own detail page, separate from the Edit action", () => {
    renderClient({ rows: [row({ id: "dsr-42" })] });

    const table = screen.getByRole("table");
    const tableSiteLink = within(table).getByText("NH-48 Highway Widening").closest("a");
    expect(tableSiteLink).toHaveAttribute("href", "/daily-activity/dsr-42");

    const list = screen.getByRole("list");
    const cardSiteLink = within(list).getByText("NH-48 Highway Widening").closest("a");
    expect(cardSiteLink).toHaveAttribute("href", "/daily-activity/dsr-42");

    // The Edit link must never be nested inside the row's own link (invalid
    // markup, and would make Edit unclickable on its own).
    for (const editLink of screen.getAllByRole("link", { name: "Edit" })) {
      expect(editLink.closest("a[href='/daily-activity/dsr-42']")).toBeNull();
    }
  });

  it("debounces the search box before writing to the URL", () => {
    vi.useFakeTimers();
    try {
      renderClient();
      fireEvent.change(screen.getByLabelText("Search"), { target: { value: "slip hazard" } });
      expect(setQuery).not.toHaveBeenCalled();
      vi.advanceTimersByTime(400);
      expect(setQuery).toHaveBeenCalledWith("slip hazard");
    } finally {
      vi.useRealTimers();
    }
  });

  it("filters by Site via setFilter", () => {
    renderClient();
    fireEvent.change(screen.getByLabelText("Site"), { target: { value: "site-2" } });
    expect(setFilter).toHaveBeenCalledWith("siteId", "site-2");
  });

  it("filters by From/To date via setFilter", () => {
    renderClient();
    fireEvent.change(screen.getByLabelText("From"), { target: { value: "2026-08-01" } });
    expect(setFilter).toHaveBeenCalledWith("from", "2026-08-01");
    fireEvent.change(screen.getByLabelText("To"), { target: { value: "2026-08-31" } });
    expect(setFilter).toHaveBeenCalledWith("to", "2026-08-31");
  });

  it("calls setSort with the column's sortKey when a sortable header is clicked", () => {
    renderClient();
    fireEvent.click(screen.getByRole("button", { name: /^Report Date/ }));
    expect(setSort).toHaveBeenCalledWith("reportDate");
    fireEvent.click(screen.getByRole("button", { name: /^Last Updated/ }));
    expect(setSort).toHaveBeenCalledWith("createdAt");
  });

  it("shows Pagination once total exceeds pageSize", () => {
    renderClient({ total: 60, page: 1, pageSize: 25 });
    expect(screen.getByText("Showing 1–25 of 60")).toBeInTheDocument();
  });

  it("shows the nothing-recorded-yet empty state with no active filter", () => {
    renderClient({ rows: [], total: 0 });
    expect(screen.getAllByText("No Daily Reports submitted yet.").length).toBeGreaterThan(0);
  });

  it("shows the no-matches empty state with Clear filters when a filter is active", () => {
    hookState = { q: "", filters: { siteId: "site-2" } };
    renderClient({ rows: [], total: 0 });
    expect(screen.getAllByText("No Daily Reports match your filters.").length).toBeGreaterThan(0);
    fireEvent.click(screen.getAllByRole("button", { name: "Clear filters" })[0]!);
    expect(clearAll).toHaveBeenCalledWith(["siteId", "from", "to"]);
  });
});
