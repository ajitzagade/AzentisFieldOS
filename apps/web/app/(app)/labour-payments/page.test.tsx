import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import LabourPaymentsPage from "./page";

vi.mock("next/navigation", () => ({
  usePathname: () => "/labour-payments",
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ replace: vi.fn() }),
}));

async function renderLabourPaymentsPage(searchParams: Record<string, string> = {}) {
  const element = await LabourPaymentsPage({ searchParams: Promise.resolve(searchParams) });
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

function mockLabourers(labourers: unknown[], total = labourers.length) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ rows: labourers, total, page: 1, pageSize: 25 }),
  }) as unknown as typeof fetch;
}

describe("LabourPaymentsPage", () => {
  it("renders every Labourer with category, per-day amount, and outstanding advance", async () => {
    mockLabourers([
      { id: "l1", name: "Ramesh Kumar", category: "Mistri", defaultPerDayAmount: 800, isActive: true, outstandingAdvanceBalance: 0 },
      { id: "l2", name: "Suresh Patil", category: "Men", defaultPerDayAmount: null, isActive: true, outstandingAdvanceBalance: 500 },
    ]);

    await renderLabourPaymentsPage();

    // DataTable's mobileCard mode renders both a desktop and mobile copy of
    // every row simultaneously (one CSS-hidden) — assert via getAllByText,
    // not a plain single-match query (AGENTS.md's own documented gotcha).
    expect(screen.getAllByText("Ramesh Kumar").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Mistri").length).toBeGreaterThan(0);
    expect(screen.getAllByText("₹800").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Suresh Patil").length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: /Ramesh Kumar/ })[0]).toHaveAttribute("href", "/labour-payments/l1");
  });

  it("shows a clear empty state with an Add Labourer action when there are none yet", async () => {
    mockLabourers([]);

    await renderLabourPaymentsPage();

    expect(screen.getAllByText("No Labourers added yet.").length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: /Add your first Labourer/ })[0]).toHaveAttribute("href", "/labour-payments/new");
  });

  it("renders the Add Labourer link in the page header", async () => {
    mockLabourers([{ id: "l1", name: "Ramesh Kumar", category: "Mistri", defaultPerDayAmount: 800, isActive: true, outstandingAdvanceBalance: 0 }]);

    await renderLabourPaymentsPage();

    expect(screen.getByRole("link", { name: /Add Labourer/ })).toHaveAttribute("href", "/labour-payments/new");
  });

  it("shows Pagination once total exceeds pageSize", async () => {
    mockLabourers(
      [{ id: "l1", name: "Ramesh Kumar", category: "Mistri", defaultPerDayAmount: 800, isActive: true, outstandingAdvanceBalance: 0 }],
      60,
    );

    await renderLabourPaymentsPage();

    expect(screen.getByText("Showing 1–25 of 60")).toBeInTheDocument();
  });

  it("fetches isActive=true by default (the Active tab)", async () => {
    mockLabourers([]);

    await renderLabourPaymentsPage();

    const url = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as string;
    expect(url).toContain("isActive=true");
  });

  it("fetches isActive=false when the Deactivated tab is selected via ?status=deactivated", async () => {
    mockLabourers([]);

    await renderLabourPaymentsPage({ status: "deactivated" });

    const url = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as string;
    expect(url).toContain("isActive=false");
  });
});
