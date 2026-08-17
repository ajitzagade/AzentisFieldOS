import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./mark-paid-button", () => ({
  MarkPaidButton: ({ id }: { id: string }) => <button data-testid={`mark-paid-${id}`}>Mark Paid</button>,
}));

import PaymentsPage from "./page";

const originalFetch = global.fetch;
const originalApiUrl = process.env.API_URL;

function mockFetchRouter(handlers: {
  payments?: unknown[];
  pendingCount?: number;
  teamSummary?: unknown;
  outstandingAdvances?: unknown;
}) {
  global.fetch = vi.fn((url: string) => {
    const urlStr = String(url);
    if (urlStr.includes("/payments/count/pending")) {
      return Promise.resolve({ ok: true, json: async () => handlers.pendingCount ?? 0 });
    }
    if (urlStr.includes("/team-members/outstanding-advances")) {
      return Promise.resolve({ ok: true, json: async () => handlers.outstandingAdvances ?? { total: 0, byTeamMember: [] } });
    }
    if (urlStr.includes("/team-members/team-summary")) {
      return Promise.resolve({
        ok: true,
        json: async () => handlers.teamSummary ?? { monthlyPaymentTotal: 0 },
      });
    }
    return Promise.resolve({ ok: true, json: async () => handlers.payments ?? [] });
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

async function renderPaymentsPage() {
  const element = await PaymentsPage();
  return render(element);
}

const payment = {
  id: "p1",
  basePay: "15000",
  additionalAmount: "2000",
  deductions: "500",
  netPayable: "13500",
  payPeriod: "1-15 Aug 2026",
  status: "pending" as const,
  teamMember: { id: "tm1", name: "Ravi Kumar" },
  advanceAdjustments: [{ amount: "3000" }],
};

describe("PaymentsPage", () => {
  it("renders the stat tiles from the team-summary, pending-count, and outstanding-advances endpoints", async () => {
    mockFetchRouter({
      payments: [],
      pendingCount: 2,
      teamSummary: { monthlyPaymentTotal: 284600 },
      outstandingAdvances: { total: 31500, byTeamMember: [] },
    });

    await renderPaymentsPage();

    expect(screen.getByText("₹2,84,600")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("₹31,500")).toBeInTheDocument();
  });

  it("renders a Payment row with the negated Advance Adjustment amount and a Mark Paid action for a pending row", async () => {
    mockFetchRouter({ payments: [payment] });

    await renderPaymentsPage();

    expect(screen.getByText("Ravi Kumar")).toBeInTheDocument();
    expect(screen.getByText("1-15 Aug 2026")).toBeInTheDocument();
    expect(screen.getByText("₹13,500")).toBeInTheDocument();
    expect(screen.getByText("−₹3,000")).toBeInTheDocument();
    expect(screen.getByText("Pending")).toBeInTheDocument();
    expect(screen.getByTestId("mark-paid-p1")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Correct" })).toHaveAttribute("href", "/payments/p1/correct");
  });

  it("does not render a Mark Paid action for an already-paid row", async () => {
    mockFetchRouter({ payments: [{ ...payment, status: "paid" }] });

    await renderPaymentsPage();

    expect(screen.getByText("Paid")).toBeInTheDocument();
    expect(screen.queryByTestId("mark-paid-p1")).not.toBeInTheDocument();
  });

  it("shows ₹0 for the Advance Adjustment column when a Payment has none linked (AC #3)", async () => {
    mockFetchRouter({
      payments: [{ ...payment, advanceAdjustments: [] }],
      teamSummary: { monthlyPaymentTotal: 284600 },
      outstandingAdvances: { total: 31500, byTeamMember: [] },
    });

    await renderPaymentsPage();

    expect(screen.getByText("₹0")).toBeInTheDocument();
  });

  it("shows the empty state with a Record-your-first-Payment action when there are zero rows", async () => {
    mockFetchRouter({ payments: [] });

    await renderPaymentsPage();

    expect(screen.getByText("No Payments recorded yet.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Record your first Payment/ })).toHaveAttribute("href", "/payments/new");
  });

  it("links the header action to /payments/new", async () => {
    mockFetchRouter({ payments: [] });

    await renderPaymentsPage();

    expect(screen.getByRole("link", { name: /Record Payment/ })).toHaveAttribute("href", "/payments/new");
  });
});
