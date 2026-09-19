import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/all-payments",
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ replace: vi.fn() }),
}));

import AllPaymentsPage from "./page";
import type { PaymentOverviewRow } from "./all-payments-client";

const originalFetch = global.fetch;
const originalApiUrl = process.env.API_URL;

function mockFetchRouter(handlers: {
  rows?: PaymentOverviewRow[];
  summary?: unknown;
  onOverviewUrl?: (url: string) => void;
}) {
  global.fetch = vi.fn((url: string) => {
    const urlStr = String(url);
    if (urlStr.includes("/payments-overview/summary")) {
      return Promise.resolve({
        ok: true,
        json: async () => handlers.summary ?? { paidTotal: 0, outstandingTotal: 0, pendingPricingCount: 0 },
      });
    }
    handlers.onOverviewUrl?.(urlStr);
    return Promise.resolve({
      ok: true,
      json: async () => ({
        rows: handlers.rows ?? [],
        total: handlers.rows?.length ?? 0,
        page: 1,
        pageSize: 25,
      }),
    });
  }) as unknown as typeof fetch;
}

beforeEach(() => {
  process.env.API_URL = "http://localhost:3001";
});

afterEach(() => {
  global.fetch = originalFetch;
  process.env.API_URL = originalApiUrl;
  vi.restoreAllMocks();
});

async function renderPage(searchParams: Record<string, string> = {}) {
  const element = await AllPaymentsPage({ searchParams: Promise.resolve(searchParams) });
  return render(element);
}

const employeePayment: PaymentOverviewRow = {
  kind: "EMPLOYEE_PAYMENT",
  id: "pay1",
  date: "2026-09-10T00:00:00.000Z",
  partyName: "Ravi Kumar",
  siteName: null,
  detail: "1-15 Sep 2026",
  amount: "13500",
  status: "PENDING",
  isCorrection: false,
  refs: { teamMemberId: "tm1" },
};

const pricingPendingPurchase: PaymentOverviewRow = {
  kind: "PURCHASE",
  id: "pur1",
  date: "2026-09-12T00:00:00.000Z",
  partyName: "Balaji Traders",
  siteName: "Site A",
  detail: "Cement",
  amount: null,
  status: "PRICING_PENDING",
  isCorrection: false,
  refs: {},
};

const subcontractorPayment: PaymentOverviewRow = {
  kind: "SUBCONTRACTOR",
  id: "sp1",
  date: "2026-09-11T00:00:00.000Z",
  partyName: "Sharma Constructions",
  siteName: "Site B",
  detail: "Advance — Plumbing",
  amount: "20000",
  status: "PAID",
  isCorrection: false,
  refs: { siteId: "s2", contractId: "c1" },
};

describe("AllPaymentsPage", () => {
  it("renders the summary tiles from the summary endpoint", async () => {
    mockFetchRouter({
      summary: { paidTotal: 184600, outstandingTotal: 31500, pendingPricingCount: 2 },
    });

    await renderPage();

    expect(screen.getByText("₹1,84,600")).toBeInTheDocument();
    expect(screen.getByText("₹31,500")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("Paid (This Month)")).toBeInTheDocument();
  });

  it("renders rows from every kind with normalized status badges and per-kind links", async () => {
    mockFetchRouter({ rows: [pricingPendingPurchase, subcontractorPayment, employeePayment] });

    await renderPage();

    // DataTable's mobileCard mode renders a desktop and a mobile copy of
    // every row — assert with getAllBy*, same as the other list pages.
    expect(screen.getAllByText("Ravi Kumar").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Balaji Traders").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Sharma Constructions").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Pending").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Pricing pending").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Paid").length).toBeGreaterThan(0);
    expect(screen.getAllByText("₹13,500").length).toBeGreaterThan(0);
    expect(screen.getAllByText("₹20,000").length).toBeGreaterThan(0);

    expect(screen.getAllByRole("link", { name: /View Employee Payment for Ravi Kumar/ })[0]).toHaveAttribute(
      "href",
      "/team/tm1",
    );
    expect(screen.getAllByRole("link", { name: /View Subcontractor for Sharma Constructions/ })[0]).toHaveAttribute(
      "href",
      "/sites/s2/contracts/c1",
    );
    expect(screen.getAllByRole("link", { name: /View Purchase for Balaji Traders/ })[0]).toHaveAttribute(
      "href",
      "/movements",
    );
  });

  it("D7: a pricing-pending Purchase renders no amount, never ₹0", async () => {
    // Non-zero summary values so the only possible ₹0 would be the row's.
    mockFetchRouter({
      rows: [pricingPendingPurchase],
      summary: { paidTotal: 100, outstandingTotal: 200, pendingPricingCount: 1 },
    });

    await renderPage();

    expect(screen.queryByText("₹0")).not.toBeInTheDocument();
  });

  it("defaults to This Month bounds and passes range presets through to the API", async () => {
    const urls: string[] = [];
    mockFetchRouter({ onOverviewUrl: (url) => urls.push(url) });

    await renderPage();

    expect(urls[0]).toContain("from=");
    expect(urls[0]).toContain("to=");

    urls.length = 0;
    await renderPage({ range: "all" });
    expect(urls[0]).not.toContain("from=");
  });

  it("passes status and kind filters through to the API", async () => {
    const urls: string[] = [];
    mockFetchRouter({ onOverviewUrl: (url) => urls.push(url) });

    await renderPage({ status: "UNPAID", kind: "PURCHASE" });

    expect(urls[0]).toContain("status=UNPAID");
    expect(urls[0]).toContain("kind=PURCHASE");
  });

  it("shows the empty state when nothing is recorded in the period", async () => {
    mockFetchRouter({ rows: [] });

    await renderPage();

    expect(screen.getAllByText("No payments recorded in this period.").length).toBeGreaterThan(0);
  });
});
