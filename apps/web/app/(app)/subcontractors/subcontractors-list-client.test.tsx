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

// The detail panel's own open state is exercised by
// use-detail-panel-state.test.ts — mocked out here (backed by a plain
// variable, same pattern as hookState above) so this file's row/panel
// assertions don't also need a real next/navigation router context.
const panelOpen = vi.fn();
const panelClose = vi.fn();
let panelId: string | null = null;
vi.mock("../../../lib/use-detail-panel-state", () => ({
  useDetailPanelState: () => ({ id: panelId, open: panelOpen, close: panelClose }),
}));

const authedFetchMock = vi.fn();
vi.mock("../../../lib/use-authed-fetch", () => ({
  useAuthedFetch: () => authedFetchMock,
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
  panelId = null;
});

afterEach(() => {
  vi.clearAllMocks();
});

function renderClient(overrides: Partial<Parameters<typeof SubcontractorsListClient>[0]> = {}) {
  return render(<SubcontractorsListClient rows={[subcontractor]} total={1} page={1} pageSize={25} {...overrides} />);
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

  it("links each row to the Subcontractor detail route", () => {
    renderClient();
    expect(
      within(screen.getByRole("table")).getByText("Sharma Excavation Works").closest("a"),
    ).toHaveAttribute("href", "/subcontractors/s1");
  });

  it("calls setSort with the column's sortKey when a sortable header is clicked", () => {
    renderClient();
    fireEvent.click(screen.getByRole("button", { name: /^Name/ }));
    expect(setSort).toHaveBeenCalledWith("name");
  });

  describe("detail panel", () => {
    it("opens the panel (via panel.open) on a plain left-click, instead of navigating", () => {
      renderClient();
      const link = within(screen.getByRole("table")).getByText("Sharma Excavation Works").closest("a") as HTMLAnchorElement;
      const notPrevented = fireEvent.click(link);
      expect(notPrevented).toBe(false);
      expect(panelOpen).toHaveBeenCalledWith("s1");
    });

    it("fetches and renders the Subcontractor's contact/address/work-category fields when the panel is open", async () => {
      panelId = "s1";
      authedFetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          id: "s1",
          name: "Sharma Excavation Works",
          contactPerson: "Meena Shah",
          phone: "9876543210",
          email: "meena@example.com",
          address: "Plot 12, MIDC",
          workCategories: ["Excavation"],
        }),
      });

      renderClient();

      expect(await screen.findByText("Meena Shah")).toBeInTheDocument();
      expect(screen.getByText("Plot 12, MIDC")).toBeInTheDocument();
      expect(screen.getByText("Excavation")).toBeInTheDocument();
      const detailLink = screen.getByRole("link", { name: /View full details/ });
      expect(detailLink).toHaveAttribute("href", "/subcontractors/s1");
      fireEvent.click(detailLink);
      expect(panelClose).toHaveBeenCalled();
    });

    it("shows a not-found state when the fetch 404s", async () => {
      panelId = "missing";
      authedFetchMock.mockResolvedValue({ ok: false, status: 404 });

      renderClient();

      expect(await screen.findByText("This Subcontractor could not be found.")).toBeInTheDocument();
    });

    it("shows an error state with a working retry on a fetch failure", async () => {
      panelId = "s1";
      authedFetchMock.mockResolvedValueOnce({ ok: false, status: 500 });

      renderClient();

      expect(await screen.findByText("Couldn't load this Subcontractor.")).toBeInTheDocument();

      authedFetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          id: "s1",
          name: "Sharma Excavation Works",
          contactPerson: "Meena Shah",
          phone: null,
          email: null,
          address: null,
          workCategories: [],
        }),
      });
      fireEvent.click(screen.getByRole("button", { name: "Try again" }));

      expect(await screen.findByText("Meena Shah")).toBeInTheDocument();
    });
  });
});
