import { render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SitesPage from "./page";

vi.mock("next/navigation", () => ({
  usePathname: () => "/sites",
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ replace: vi.fn() }),
}));

// SitesPage is an async Server Component — calling it directly and
// rendering the resolved element tree is the standard way to test one
// with Vitest/RTL outside a full Next.js request harness.
async function renderSitesPage(searchParams?: Record<string, string>) {
  const element = await SitesPage({ searchParams: Promise.resolve(searchParams ?? {}) });
  render(element);
}

function paginatedResponse(rows: unknown[], overrides: Partial<{ total: number; page: number; pageSize: number }> = {}) {
  return {
    ok: true,
    json: async () => ({ rows, total: overrides.total ?? rows.length, page: overrides.page ?? 1, pageSize: overrides.pageSize ?? 25 }),
  };
}

const originalFetch = global.fetch;
const originalApiUrl = process.env.API_URL;

beforeEach(() => {
  process.env.API_URL = "http://localhost:3001";
});

afterEach(() => {
  global.fetch = originalFetch;
  process.env.API_URL = originalApiUrl;
  vi.restoreAllMocks();
});

describe("SitesPage", () => {
  it("renders every Site with its status badge, newest first as returned by the API", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      paginatedResponse([
        { id: "1", name: "NH-48 Highway Widening", location: "Nashik", status: "ACTIVE", contractReference: "REF-1" },
        { id: "2", name: "Riverside Bridge", location: "Nashik", status: "ON_HOLD", contractReference: null },
      ]),
    ) as unknown as typeof fetch;

    await renderSitesPage();

    const table = within(screen.getByRole("table"));
    expect(table.getByText("NH-48 Highway Widening")).toBeInTheDocument();
    expect(table.getByText("Riverside Bridge")).toBeInTheDocument();
    expect(table.getByText("Active")).toBeInTheDocument();
    expect(table.getByText("On Hold")).toBeInTheDocument();
  });

  it("links each row to its Site detail route", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      paginatedResponse([{ id: "abc", name: "NH-48", location: "Nashik", status: "ACTIVE", contractReference: null }]),
    ) as unknown as typeof fetch;

    await renderSitesPage();

    const table = within(screen.getByRole("table"));
    expect(table.getByText("NH-48").closest("a")).toHaveAttribute("href", "/sites/abc");
  });

  it("renders the empty state with a create-first-Site action when there are zero Sites and no filters are active", async () => {
    global.fetch = vi.fn().mockResolvedValue(paginatedResponse([], { total: 0 })) as unknown as typeof fetch;

    await renderSitesPage();

    // Rendered as both the desktop table panel and the mobile card panel.
    expect(screen.getAllByText("No Sites yet.")).toHaveLength(2);
    expect(screen.getAllByRole("link", { name: /Create your first Site/ })[0]).toHaveAttribute("href", "/sites/new");
  });

  it("renders the Add Site link in the page header", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      paginatedResponse([{ id: "1", name: "NH-48", location: "Nashik", status: "ACTIVE", contractReference: null }]),
    ) as unknown as typeof fetch;

    await renderSitesPage();

    expect(screen.getByRole("link", { name: /Add Site/ })).toHaveAttribute("href", "/sites/new");
  });

  it("requests page 1 / the default page size when no searchParams are given", async () => {
    const fetchMock = vi.fn().mockResolvedValue(paginatedResponse([]));
    global.fetch = fetchMock as unknown as typeof fetch;

    await renderSitesPage();

    const url = String(fetchMock.mock.calls[0]?.[0]);
    expect(url).toContain("page=1");
    expect(url).toContain("pageSize=25");
  });

  it("forwards q/page/sort/order/status search params to the API", async () => {
    const fetchMock = vi.fn().mockResolvedValue(paginatedResponse([]));
    global.fetch = fetchMock as unknown as typeof fetch;

    await renderSitesPage({ q: "nashik", page: "2", sort: "name", order: "desc", status: "ACTIVE" });

    const url = String(fetchMock.mock.calls[0]?.[0]);
    expect(url).toContain("q=nashik");
    expect(url).toContain("page=2");
    expect(url).toContain("sort=name");
    expect(url).toContain("order=desc");
    expect(url).toContain("status=ACTIVE");
  });

  it("shows the Pagination control once total exceeds the page size", async () => {
    const rows = Array.from({ length: 25 }, (_, i) => ({
      id: String(i),
      name: `Site ${i}`,
      location: "Nashik",
      status: "ACTIVE",
      contractReference: null,
    }));
    global.fetch = vi.fn().mockResolvedValue(paginatedResponse(rows, { total: 60 })) as unknown as typeof fetch;

    await renderSitesPage();

    expect(screen.getByText("Showing 1–25 of 60")).toBeInTheDocument();
  });
});
