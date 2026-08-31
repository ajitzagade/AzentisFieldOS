import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ExpensesPage from "./page";

vi.mock("next/navigation", () => ({
  usePathname: () => "/expenses",
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ replace: vi.fn() }),
}));

async function renderExpensesPage() {
  const element = await ExpensesPage({ searchParams: Promise.resolve({}) });
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

function mockFetchRouter(handlers: { expenses?: unknown; summary?: unknown }) {
  global.fetch = vi.fn((url: string) => {
    const urlStr = String(url);
    if (urlStr.includes("/expenses/summary")) {
      return Promise.resolve({
        ok: true,
        json: async () =>
          handlers.summary ?? { totalThisMonth: 0, totalThisWeek: 0, largestCategoryThisMonth: null },
      });
    }
    return Promise.resolve({
      ok: true,
      json: async () => {
        const expenses = (handlers.expenses as unknown[] | undefined) ?? [];
        return { rows: expenses, total: expenses.length, page: 1, pageSize: 25 };
      },
    });
  }) as unknown as typeof fetch;
}

const expense = {
  id: "exp1",
  amount: "5000",
  description: "Diesel for site generator",
  paymentMethod: "Cash",
  personOrVendor: "HP Petrol Pump",
  incurredAt: "2026-08-05T00:00:00.000Z",
  site: { id: "site1", name: "NH-48 Highway Widening" },
  category: { id: "cat1", name: "Fuel" },
};

describe("ExpensesPage", () => {
  it("renders the server-computed stat tiles including the largest category (Task 4)", async () => {
    mockFetchRouter({
      summary: {
        totalThisMonth: 186400,
        totalThisWeek: 63700,
        largestCategoryThisMonth: { name: "Machinery & Vehicle", total: 120000 },
      },
    });

    await renderExpensesPage();

    expect(screen.getByText("₹1,86,400")).toBeInTheDocument();
    expect(screen.getByText("Total this month")).toBeInTheDocument();
    expect(screen.getByText("₹63,700")).toBeInTheDocument();
    expect(screen.getByText("Total this week")).toBeInTheDocument();
    expect(screen.getByText("Machinery & Vehicle")).toBeInTheDocument();
    expect(screen.getByText("Largest category this month")).toBeInTheDocument();
  });

  it("renders Date/Site/Category/Amount/Description/Payment method/Person-Vendor columns for each Expense", async () => {
    mockFetchRouter({ expenses: [expense] });

    await renderExpensesPage();

    expect(screen.getByText("NH-48 Highway Widening")).toBeInTheDocument();
    expect(screen.getByText("Fuel")).toBeInTheDocument();
    expect(screen.getByText("₹5,000")).toBeInTheDocument();
    expect(screen.getByText("Diesel for site generator")).toBeInTheDocument();
    expect(screen.getByText("Cash")).toBeInTheDocument();
    expect(screen.getByText("HP Petrol Pump")).toBeInTheDocument();
  });

  it("AC #3: offers only a Correct action per row, never Edit/Delete (AD-9)", async () => {
    mockFetchRouter({ expenses: [expense] });

    await renderExpensesPage();

    expect(screen.getByRole("link", { name: "Correct" })).toHaveAttribute("href", "/expenses/exp1/correct");
    expect(screen.queryByRole("button", { name: /edit/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /delete/i })).not.toBeInTheDocument();
  });

  it("renders an empty state with a call to action when there are no Expenses yet", async () => {
    mockFetchRouter({ expenses: [] });

    await renderExpensesPage();

    expect(screen.getByText("No Expenses recorded yet.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Record your first Expense/ })).toHaveAttribute("href", "/expenses/new");
  });

  it("links the header actions to the entry form and the categories admin", async () => {
    mockFetchRouter({ expenses: [] });

    await renderExpensesPage();

    expect(screen.getByRole("link", { name: "Record Expense" })).toHaveAttribute("href", "/expenses/new");
    expect(screen.getByRole("link", { name: "Categories" })).toHaveAttribute("href", "/expenses/categories");
  });
});
