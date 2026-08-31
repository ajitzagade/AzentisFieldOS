import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import VendorsPage from "./page";

vi.mock("next/navigation", () => ({
  usePathname: () => "/vendors",
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ replace: vi.fn() }),
}));

async function renderVendorsPage() {
  const element = await VendorsPage({ searchParams: Promise.resolve({}) });
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

function mockFetch(vendors: unknown[], summaries: Record<string, { totalThisYear: number; notFullyPaidTotal: number }>) {
  global.fetch = vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes("/vendors?")) {
      return {
        ok: true,
        json: async () => ({ rows: vendors, total: vendors.length, page: 1, pageSize: 25 }),
      } as Response;
    }
    const match = /\/vendors\/([^/]+)\/purchase-summary$/.exec(url);
    if (match) {
      return { ok: true, json: async () => summaries[match[1]!] } as Response;
    }
    throw new Error(`Unexpected fetch: ${url}`);
  }) as unknown as typeof fetch;
}

describe("VendorsPage", () => {
  it("renders every Vendor with contact info and materials chips", async () => {
    mockFetch(
      [
        {
          id: "1",
          name: "Shree Balaji Traders",
          contactPerson: "Vikram Shah",
          phone: "+91 98200 41267",
          email: null,
          address: null,
          materialsSupplied: ["Cement", "Steel"],
        },
      ],
      { "1": { totalThisYear: 1842300, notFullyPaidTotal: 0 } },
    );

    await renderVendorsPage();

    expect(screen.getByText("Shree Balaji Traders")).toBeInTheDocument();
    expect(screen.getByText("Vikram Shah")).toBeInTheDocument();
    expect(screen.getByText("Cement")).toBeInTheDocument();
    expect(screen.getByText("Steel")).toBeInTheDocument();
    expect(screen.getByText("₹18,42,300")).toBeInTheDocument();
  });

  it("links each row to its Vendor detail route", async () => {
    mockFetch(
      [{ id: "abc", name: "Om Steel Corporation", contactPerson: null, phone: null, email: null, address: null, materialsSupplied: [] }],
      { abc: { totalThisYear: 0, notFullyPaidTotal: 0 } },
    );

    await renderVendorsPage();

    expect(screen.getByText("Om Steel Corporation").closest("a")).toHaveAttribute("href", "/vendors/abc");
  });

  it("shows Fully Paid when nothing is outstanding, and the honest 'not marked Paid' figure otherwise", async () => {
    mockFetch(
      [
        { id: "1", name: "Anand RMC Suppliers", contactPerson: null, phone: null, email: null, address: null, materialsSupplied: [] },
        { id: "2", name: "Shree Balaji Traders", contactPerson: null, phone: null, email: null, address: null, materialsSupplied: [] },
      ],
      {
        "1": { totalThisYear: 3260000, notFullyPaidTotal: 0 },
        "2": { totalThisYear: 1842300, notFullyPaidTotal: 124500 },
      },
    );

    await renderVendorsPage();

    expect(screen.getByText("Fully Paid")).toBeInTheDocument();
    expect(screen.getByText("₹1,24,500 not marked Paid")).toBeInTheDocument();
  });

  it("renders the empty state with an add-first-Vendor action when there are zero Vendors", async () => {
    mockFetch([], {});

    await renderVendorsPage();

    expect(screen.getByText("No Vendors yet.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Add your first Vendor/ })).toHaveAttribute("href", "/vendors/new");
  });

  it("renders the Add Vendor link in the page header", async () => {
    mockFetch(
      [{ id: "1", name: "Shree Balaji Traders", contactPerson: null, phone: null, email: null, address: null, materialsSupplied: [] }],
      { "1": { totalThisYear: 0, notFullyPaidTotal: 0 } },
    );

    await renderVendorsPage();

    expect(screen.getByRole("link", { name: /Add Vendor/ })).toHaveAttribute("href", "/vendors/new");
  });
});
