import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SubcontractorsPage from "./page";

vi.mock("next/navigation", () => ({
  usePathname: () => "/subcontractors",
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ replace: vi.fn() }),
}));

async function renderSubcontractorsPage() {
  const element = await SubcontractorsPage({ searchParams: Promise.resolve({}) });
  render(element);
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

function mockFetch(subcontractors: unknown[]) {
  global.fetch = vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes("/subcontractors?")) {
      return {
        ok: true,
        json: async () => ({ rows: subcontractors, total: subcontractors.length, page: 1, pageSize: 25 }),
      } as Response;
    }
    throw new Error(`Unexpected fetch: ${url}`);
  }) as unknown as typeof fetch;
}

describe("SubcontractorsPage", () => {
  it("renders every Subcontractor with contact info and work-category chips", async () => {
    mockFetch([
      {
        id: "1",
        name: "Ganesh Pipeline Works",
        contactPerson: "Ramesh Kadam",
        phone: "+91 98220 55671",
        email: null,
        address: null,
        workCategories: ["Pipe laying", "Trenching"],
      },
    ]);

    await renderSubcontractorsPage();

    expect(screen.getAllByText("Ganesh Pipeline Works")).toHaveLength(2);
    expect(screen.getAllByText("Ramesh Kadam")).toHaveLength(2);
    expect(screen.getAllByText("Pipe laying")).toHaveLength(2);
    expect(screen.getAllByText("Trenching")).toHaveLength(2);
  });

  it("links each row to its Subcontractor detail route", async () => {
    mockFetch([
      { id: "abc", name: "Om Sai Earthmovers", contactPerson: null, phone: null, email: null, address: null, workCategories: [] },
    ]);

    await renderSubcontractorsPage();

    for (const el of screen.getAllByText("Om Sai Earthmovers")) {
      expect(el.closest("a")).toHaveAttribute("href", "/subcontractors/abc");
    }
  });

  it("renders the empty state with an add-first-Subcontractor action when there are zero Subcontractors", async () => {
    mockFetch([]);

    await renderSubcontractorsPage();

    expect(screen.getAllByText("No Subcontractors yet.")).toHaveLength(2);
    for (const link of screen.getAllByRole("link", { name: /Add your first Subcontractor/ })) {
      expect(link).toHaveAttribute("href", "/subcontractors/new");
    }
  });

  it("renders the Add Subcontractor link in the page header", async () => {
    mockFetch([
      { id: "1", name: "Ganesh Pipeline Works", contactPerson: null, phone: null, email: null, address: null, workCategories: [] },
    ]);

    await renderSubcontractorsPage();

    expect(screen.getByRole("link", { name: /Add Subcontractor/ })).toHaveAttribute("href", "/subcontractors/new");
  });
});
