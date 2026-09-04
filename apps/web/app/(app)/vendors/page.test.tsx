import { render, screen, within } from "@testing-library/react";
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
    // Perf review 2026-09-03: one batched call for the whole page instead
    // of one per Vendor row — see getVendorPurchaseSummaries in page.tsx.
    if (url.includes("/vendors/purchase-summary?ids=")) {
      return { ok: true, json: async () => summaries } as Response;
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

    const table = within(screen.getByRole("table"));
    expect(table.getByText("Shree Balaji Traders")).toBeInTheDocument();
    expect(table.getByText("Vikram Shah")).toBeInTheDocument();
    expect(table.getByText("Cement")).toBeInTheDocument();
    expect(table.getByText("Steel")).toBeInTheDocument();
    expect(table.getByText("₹18,42,300")).toBeInTheDocument();
  });

  it("links each row to its Vendor detail route", async () => {
    mockFetch(
      [{ id: "abc", name: "Om Steel Corporation", contactPerson: null, phone: null, email: null, address: null, materialsSupplied: [] }],
      { abc: { totalThisYear: 0, notFullyPaidTotal: 0 } },
    );

    await renderVendorsPage();

    const table = within(screen.getByRole("table"));
    expect(table.getByText("Om Steel Corporation").closest("a")).toHaveAttribute("href", "/vendors/abc");
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

    const table = within(screen.getByRole("table"));
    expect(table.getByText("Fully Paid")).toBeInTheDocument();
    expect(table.getByText("₹1,24,500 not marked Paid")).toBeInTheDocument();
  });

  it("renders the empty state with an add-first-Vendor action when there are zero Vendors", async () => {
    mockFetch([], {});

    await renderVendorsPage();

    // Rendered as both the desktop table panel and the mobile card panel.
    expect(screen.getAllByText("No Vendors yet.")).toHaveLength(2);
    expect(screen.getAllByRole("link", { name: /Add your first Vendor/ })[0]).toHaveAttribute("href", "/vendors/new");
  });

  // Code review 2026-09-04: batching the per-row summary fetch into one
  // call (perf review) means a single failure now blanks every row's
  // summary instead of isolating one — this pins that tradeoff down so a
  // future regression (e.g. the whole page crashing instead of degrading)
  // gets caught.
  it("shows the honest '—' fallback on every row, not a crash, when the batched purchase-summary call fails", async () => {
    global.fetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/vendors?")) {
        return {
          ok: true,
          json: async () => ({
            rows: [
              { id: "1", name: "Anand RMC Suppliers", contactPerson: null, phone: null, email: null, address: null, materialsSupplied: [] },
              { id: "2", name: "Shree Balaji Traders", contactPerson: null, phone: null, email: null, address: null, materialsSupplied: [] },
            ],
            total: 2,
            page: 1,
            pageSize: 25,
          }),
        } as Response;
      }
      if (url.includes("/vendors/purchase-summary?ids=")) {
        return { ok: false, status: 500, json: async () => ({}) } as Response;
      }
      throw new Error(`Unexpected fetch: ${url}`);
    }) as unknown as typeof fetch;

    await renderVendorsPage();

    const table = within(screen.getByRole("table"));
    expect(table.getByText("Anand RMC Suppliers")).toBeInTheDocument();
    expect(table.getByText("Shree Balaji Traders")).toBeInTheDocument();
    // Both rows' money columns fall back to "—", not a thrown error.
    expect(table.getAllByText("—").length).toBeGreaterThanOrEqual(2);
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
