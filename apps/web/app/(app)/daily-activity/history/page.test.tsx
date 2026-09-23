import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import DsrHistoryPage from "./page";

vi.mock("next/navigation", () => ({
  usePathname: () => "/daily-activity/history",
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ replace: vi.fn() }),
}));

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

function mockFetchRouter(handlers: { history?: unknown; sites?: unknown }) {
  global.fetch = vi.fn((url: string) => {
    const urlStr = String(url);
    if (urlStr.includes("/dsr/history")) {
      return Promise.resolve({
        ok: true,
        json: async () => handlers.history ?? { rows: [], total: 0, page: 1, pageSize: 25 },
      });
    }
    return Promise.resolve({ ok: true, json: async () => handlers.sites ?? [] });
  }) as unknown as typeof fetch;
}

async function renderHistoryPage(searchParams: Record<string, string> = {}) {
  const element = await DsrHistoryPage({ searchParams: Promise.resolve(searchParams) });
  return render(element);
}

describe("DsrHistoryPage", () => {
  it("fetches GET /dsr/history with the page's search params and renders the rows", async () => {
    mockFetchRouter({
      history: {
        rows: [
          {
            id: "dsr-1",
            site: { id: "site-1", name: "NH-48 Highway Widening" },
            submittedBy: { name: "Ramesh Yadav" },
            reportDate: "2026-09-01T00:00:00.000Z",
            submittedAt: "2026-09-01T08:00:00.000Z",
            lastUpdatedAt: "2026-09-01T08:00:00.000Z",
            status: "ORIGINAL",
          },
        ],
        total: 1,
        page: 1,
        pageSize: 25,
      },
      sites: [{ id: "site-1", name: "NH-48 Highway Widening" }],
    });

    await renderHistoryPage({ siteId: "site-1", q: "slip" });

    expect(screen.getByRole("heading", { name: "Submitted Daily Reports" })).toBeInTheDocument();
    expect(screen.getAllByText("NH-48 Highway Widening").length).toBeGreaterThan(0);

    const historyCall = (global.fetch as ReturnType<typeof vi.fn>).mock.calls.find((call) =>
      String(call[0]).includes("/dsr/history"),
    );
    expect(historyCall).toBeDefined();
    const calledUrl = String(historyCall![0]);
    expect(calledUrl).toContain("siteId=site-1");
    expect(calledUrl).toContain("q=slip");
  });

  it('shows the "nothing recorded yet" empty state when no reports have ever been submitted', async () => {
    mockFetchRouter({ history: { rows: [], total: 0, page: 1, pageSize: 25 }, sites: [] });

    await renderHistoryPage();

    expect(screen.getAllByText("No Daily Reports submitted yet.").length).toBeGreaterThan(0);
  });

  it("links back to the per-day board", async () => {
    mockFetchRouter({});

    await renderHistoryPage();

    expect(screen.getByRole("link", { name: /Daily Reports/ })).toHaveAttribute("href", "/daily-activity");
  });
});
