import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MachineryListClient, type MachineryListItem } from "./machinery-list-client";

const setQuery = vi.fn();
const setPage = vi.fn();
const setSort = vi.fn();
const clearAll = vi.fn();
let hookState: { q: string; sort?: string; order?: "asc" | "desc" };

vi.mock("../../../lib/use-list-query-state", () => ({
  useListQueryState: (prefix: string) => {
    expect(prefix).toBe("m");
    return {
      ...hookState,
      setQuery,
      setPage,
      setSort,
      clearAll,
      getFilter: () => null,
      setFilter: vi.fn(),
    };
  },
}));

const machine: MachineryListItem = {
  id: "m1",
  name: "JCB 3DX",
  assetNumber: "AST-001",
  currentStatus: "AVAILABLE",
  type: { id: "t1", name: "Excavator" },
  currentSite: null,
  movementLogs: [],
};

beforeEach(() => {
  hookState = { q: "" };
});

afterEach(() => {
  vi.clearAllMocks();
});

function renderClient(overrides: Partial<Parameters<typeof MachineryListClient>[0]> = {}) {
  return render(<MachineryListClient rows={[machine]} total={1} page={1} pageSize={25} {...overrides} />);
}

describe("MachineryListClient", () => {
  it("renders every row in the desktop table and as a mobile card", () => {
    renderClient();
    // Once in the md+ table row, once as the below-md card's primary line.
    expect(screen.getAllByText("JCB 3DX")).toHaveLength(2);
  });

  it("debounces the search box before writing to the URL", () => {
    vi.useFakeTimers();
    try {
      renderClient();
      fireEvent.change(screen.getByLabelText("Search Machinery"), { target: { value: "jcb" } });
      expect(setQuery).not.toHaveBeenCalled();
      vi.advanceTimersByTime(400);
      expect(setQuery).toHaveBeenCalledWith("jcb");
    } finally {
      vi.useRealTimers();
    }
  });

  it("shows Pagination once total exceeds pageSize", () => {
    renderClient({ total: 60, page: 1, pageSize: 25 });
    expect(screen.getByText("Showing 1–25 of 60")).toBeInTheDocument();
  });

  it("shows the zero-Machinery-ever empty state with no active search", () => {
    renderClient({ rows: [], total: 0 });
    expect(screen.getAllByText("No Machinery registered yet.")).toHaveLength(2);
  });

  it("shows the no-matches empty state with Clear filters when a search is active", () => {
    hookState = { q: "nonexistent" };
    renderClient({ rows: [], total: 0 });
    expect(screen.getAllByText("No Machinery match your search.")).toHaveLength(2);
    fireEvent.click(screen.getAllByRole("button", { name: "Clear filters" })[0]!);
    expect(clearAll).toHaveBeenCalledOnce();
  });

  it("calls setSort with the column's sortKey when a sortable header is clicked", () => {
    renderClient();
    fireEvent.click(screen.getByRole("button", { name: /^Name/ }));
    expect(setSort).toHaveBeenCalledWith("name");
  });
});
