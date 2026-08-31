import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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
  it("renders every row", () => {
    renderClient();
    expect(screen.getByText("NH-48 Highway Widening")).toBeInTheDocument();
    expect(screen.getByText("Riverside Bridge")).toBeInTheDocument();
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
    expect(screen.getByText("No Sites yet.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Create your first Site/ })).toBeInTheDocument();
  });

  it("shows the no-matches empty state (with Clear filters) when a search is active and nothing matches", async () => {
    hookState = { q: "nonexistent", getFilter: () => null };
    const user = userEvent.setup();
    renderClient({ rows: [], total: 0 });

    expect(screen.getByText("No Sites match your search or filters.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(clearAll).toHaveBeenCalledOnce();
  });
});
