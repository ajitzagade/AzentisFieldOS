import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SitesListClient } from "./sites-list-client";
import type { Site } from "./page";

const setQuery = vi.fn();
const setPage = vi.fn();
const setSort = vi.fn();
const setFilter = vi.fn();
const clearAll = vi.fn();
let hookState: {
  q: string;
  sort?: string;
  order?: "asc" | "desc";
  getFilter: (name: string) => string | null;
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

const sites: Site[] = [
  { id: "1", name: "NH-48 Highway Widening", location: "Nashik", status: "ACTIVE", contractReference: "REF-1", description: null },
  { id: "2", name: "Riverside Bridge", location: "Pune", status: "ON_HOLD", contractReference: null, description: null },
];

beforeEach(() => {
  hookState = { q: "", getFilter: () => null };
});

afterEach(() => {
  vi.clearAllMocks();
});

function renderClient(overrides: Partial<Parameters<typeof SitesListClient>[0]> = {}) {
  return render(
    <SitesListClient
      rows={sites.map((s) => ({ ...s, dsrToday: null }))}
      total={2}
      page={1}
      pageSize={25}
      {...overrides}
    />,
  );
}

describe("SitesListClient", () => {
  it("renders every row in the desktop table and as a mobile card", () => {
    renderClient();
    // Once in the md+ table row, once as the below-md card's primary line.
    expect(screen.getAllByText("NH-48 Highway Widening")).toHaveLength(2);
    expect(screen.getAllByText("Riverside Bridge")).toHaveLength(2);
  });

  it("renders the previously-clipping Location column as a card label/value row below md, unchanged in the desktop table", () => {
    renderClient();
    // Once in the md+ table's Location cell, once in the mobile card's dl.
    expect(screen.getAllByText("Nashik")).toHaveLength(2);
    const list = screen.getByRole("list");
    // One "Location" label per card (one per row) plus the value for the
    // Nashik row.
    expect(within(list).getAllByText("Location")).toHaveLength(2);
    expect(within(list).getByText("Nashik")).toBeInTheDocument();
  });

  it("debounces the search box before writing to the URL", () => {
    vi.useFakeTimers();
    try {
      renderClient();

      fireEvent.change(screen.getByLabelText("Search"), { target: { value: "nashik" } });
      expect(setQuery).not.toHaveBeenCalled();

      vi.advanceTimersByTime(400);
      expect(setQuery).toHaveBeenCalledWith("nashik");
    } finally {
      vi.useRealTimers();
    }
  });

  it("resyncs the search box when q changes externally (e.g. Clear filters), instead of showing stale typed text", async () => {
    hookState = { q: "nashik", getFilter: () => null };
    const { rerender } = renderClient();
    expect(screen.getByLabelText("Search")).toHaveValue("nashik");

    // Simulate the URL-sourced q clearing (a "Clear filters" click, or
    // browser back/forward) without the user typing anything themselves.
    hookState = { q: "", getFilter: () => null };
    rerender(
      <SitesListClient rows={sites.map((s) => ({ ...s, dsrToday: null }))} total={2} page={1} pageSize={25} />,
    );

    await waitFor(() => expect(screen.getByLabelText("Search")).toHaveValue(""));
  });

  it("calls setSort with the column's sortKey when a sortable header is clicked", async () => {
    const user = userEvent.setup();
    renderClient();

    await user.click(screen.getByRole("button", { name: /^Site/ }));
    expect(setSort).toHaveBeenCalledWith("name");
  });

  it("calls setFilter when the Status filter changes", async () => {
    const user = userEvent.setup();
    renderClient();

    await user.selectOptions(screen.getByLabelText("Status"), "ACTIVE");
    expect(setFilter).toHaveBeenCalledWith("status", "ACTIVE");
  });

  it("shows the pagination control when total exceeds pageSize", () => {
    renderClient({ total: 60, page: 1, pageSize: 25 });
    expect(screen.getByText("Showing 1–25 of 60")).toBeInTheDocument();
  });

  it("shows the zero-Sites-ever empty state when there is no active search or filter", () => {
    renderClient({ rows: [], total: 0 });
    // Rendered as both the desktop table panel and the mobile card panel.
    expect(screen.getAllByText("No Sites yet.")).toHaveLength(2);
    expect(screen.getAllByRole("link", { name: /Create your first Site/ })).toHaveLength(2);
  });

  it("shows the no-matches empty state (with Clear filters) when a search is active and nothing matches", async () => {
    hookState = { q: "nonexistent", getFilter: () => null };
    const user = userEvent.setup();
    renderClient({ rows: [], total: 0 });

    expect(screen.getAllByText("No Sites match your search or filters.")).toHaveLength(2);
    await user.click(screen.getAllByRole("button", { name: "Clear filters" })[0]!);
    expect(clearAll).toHaveBeenCalledOnce();
  });

  it("renders the full table unchanged at md+ regardless of mobileCard", () => {
    renderClient();
    const table = screen.getByRole("table");
    expect(within(table).getByText("Location")).toBeInTheDocument();
    expect(within(table).getByText("Nashik")).toBeInTheDocument();
  });
});
