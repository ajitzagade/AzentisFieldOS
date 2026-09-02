import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ToastProvider } from "@azentisfieldos/ui";
import DashboardPage from "./page";
import { GlobalSearchContext } from "./_components/global-search";

// OwnerDashboard's Outstanding Advances card renders
// AdvanceQuickEntryTrigger (Story 19.1), which calls both useToast() and
// useRouter() (for the post-success router.refresh()) — in the real app
// these are satisfied by AppShell's <ToastProvider> ancestor and the
// Next.js App Router respectively; this test renders the page in
// isolation, so it needs the same provider plus a router mock. Story 19.3's
// header "Search ⌘K" chip similarly needs AppShell's GlobalSearchContext.
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

async function renderDashboard() {
  const element = await DashboardPage();
  render(
    <ToastProvider>
      <GlobalSearchContext.Provider value={{ open: vi.fn() }}>{element}</GlobalSearchContext.Provider>
    </ToastProvider>,
  );
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

const baseToday = {
  sitesReportingToday: 2,
  labourWorkingToday: 42,
  materialsReceivedToday: 6,
  materialsConsumedToday: 18,
  rmcUsedTodayM3: 42,
  machineryInUse: 8,
  expensesToday: 86400,
  sitesMissingDsrToday: [],
};

const baseOverall = {
  activeSites: { count: 2, names: ["NH-48 Widening", "Metro Depot"] },
  inventory: { lowStockCount: 3 },
  outstandingAdvances: { total: 314200, teamMemberCount: 9 },
  pendingPayments: { count: 4 },
};

const baseSitesPreview = [
  { id: "s1", name: "NH-48 Widening", location: "Nashik", status: "ACTIVE" },
  { id: "s2", name: "Metro Depot", location: "Pune", status: "ON_HOLD" },
];

// Route each fetch to its own fixture — the page resolves the role first
// (/users/me), then the Owner Dashboard issues its parallel requests
// (today / overall / sites-preview / expenses summary / vendors).
function mockDashboard(overrides: {
  today?: Record<string, unknown>;
  overall?: Record<string, unknown>;
  sitesPreview?: unknown[];
  role?: string;
  pendingPricing?: number;
  pendingPricingPurchases?: { id: string }[];
  draftPendingTerms?: number;
}) {
  const today = overrides.today ?? baseToday;
  const overall = overrides.overall ?? baseOverall;
  const sitesPreview = overrides.sitesPreview ?? baseSitesPreview;
  const role = overrides.role ?? "OWNER_ADMIN";

  global.fetch = vi.fn((input: RequestInfo | URL) => {
    const url = String(input);
    const body = url.includes("/users/me")
      ? { role }
      : url.includes("/purchases/count/pending-pricing")
        ? (overrides.pendingPricing ?? 0)
        : url.includes("/purchases?pendingPricing=true")
          ? (overrides.pendingPricingPurchases ?? [])
          : url.includes("/site-contracts/count/draft-pending-terms")
            ? (overrides.draftPendingTerms ?? 0)
            : url.includes("/dashboard/overall")
              ? overall
              : url.includes("/dashboard/sites-preview")
                ? sitesPreview
                : today;
    return Promise.resolve({ ok: true, json: async () => body });
  }) as unknown as typeof fetch;
}

describe("DashboardPage", () => {
  it("renders all seven Today tiles, each drilling into its real screen (AC #1)", async () => {
    mockDashboard({});
    await renderDashboard();

    const expectations: [string, string][] = [
      ["Sites Reporting Today", "/daily-activity"],
      ["Labour Working Today", "/team"],
      ["Materials Received Today", "/movements"],
      ["Materials Consumed Today", "/movements"],
      ["RMC Used Today", "/rmc"],
      ["Machinery In Use", "/machinery-vehicles"],
      ["Expenses Today", "/expenses"],
    ];

    for (const [label, href] of expectations) {
      const tile = screen.getByText(label).closest("a");
      expect(tile).toHaveAttribute("href", href);
    }

    expect(screen.getByText("42 m³")).toBeInTheDocument();
    expect(screen.getByText("₹86,400")).toBeInTheDocument();
  });

  it("renders one GapFlag per missing Site, each named explicitly — not one combined message (AC #2, FR-35)", async () => {
    mockDashboard({
      today: {
        ...baseToday,
        sitesMissingDsrToday: [
          { siteId: "s2", name: "Metro Depot" },
          { siteId: "s3", name: "Riverside Bridge Approach" },
        ],
      },
    });

    await renderDashboard();

    expect(
      screen.getByText("Metro Depot has not submitted a Daily Report yet today."),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Riverside Bridge Approach has not submitted a Daily Report yet today.",
      ),
    ).toBeInTheDocument();

    const viewSiteLinks = screen.getAllByRole("link", { name: /view site/i });
    expect(viewSiteLinks).toHaveLength(2);
    expect(viewSiteLinks[0]).toHaveAttribute("href", "/sites/s2");
    expect(viewSiteLinks[1]).toHaveAttribute("href", "/sites/s3");
  });

  it("shows no gap flags when every active Site has reported", async () => {
    mockDashboard({ today: { ...baseToday, sitesMissingDsrToday: [] } });
    await renderDashboard();
    expect(screen.queryByRole("link", { name: /view site/i })).toBeNull();
  });

  it("renders the Overall section — every figure links to its source screen (AC #2)", async () => {
    mockDashboard({});
    await renderDashboard();

    // Active Sites: count + the site names.
    expect(screen.getByText("Active Sites")).toBeInTheDocument();
    expect(screen.getByText("NH-48 Widening, Metro Depot")).toBeInTheDocument();

    // Inventory Status links to /inventory.
    expect(screen.getByRole("link", { name: /view inventory/i })).toHaveAttribute(
      "href",
      "/inventory",
    );

    // Outstanding Advances (₹ total + Team Member count) and Pending Payments
    // both link to /payments.
    expect(screen.getByText("₹3,14,200")).toBeInTheDocument();
    expect(screen.getByText("Across 9 Team Members")).toBeInTheDocument();
    // Story 19.1: the Outstanding Advances card carries a quick-entry
    // trigger; Story 19.3 adds a second one in the header quick-actions bar
    // — regression guard for either being dropped from owner-dashboard.tsx.
    expect(screen.getAllByRole("button", { name: /record advance/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Pending Payments")).toBeInTheDocument();
    const paymentLinks = screen.getAllByRole("link", { name: /view payments/i });
    expect(paymentLinks).toHaveLength(2);
    for (const link of paymentLinks) {
      expect(link).toHaveAttribute("href", "/payments");
    }
  });

  it("renders the Money row — month expenses, vendor outstanding, Subcontractor outstanding, and the cash-tied-up total", async () => {
    global.fetch = vi.fn((input: RequestInfo | URL) => {
      const url = String(input);
      const body = url.includes("/dashboard/overall")
        ? baseOverall
        : url.includes("/dashboard/sites-preview")
          ? baseSitesPreview
          : url.includes("/expenses/summary")
            ? { totalThisMonth: 250000, totalThisWeek: 40000, largestCategoryThisMonth: { name: "Diesel", total: 90000 } }
            : url.includes("/purchases/outstanding-summary")
              ? { totalOutstanding: 240000 }
              : url.includes("/site-contracts/outstanding-summary")
                ? { totalOutstanding: 62500 }
                : baseToday;
      return Promise.resolve({ ok: true, json: async () => body });
    }) as unknown as typeof fetch;

    await renderDashboard();

    expect(screen.getByText("Expenses This Month")).toBeInTheDocument();
    expect(screen.getByText("₹2,50,000")).toBeInTheDocument();
    expect(screen.getByText("₹40,000 this week — largest: Diesel")).toBeInTheDocument();

    // Vendor Outstanding = one DB-side groupBy total from
    // GET /purchases/outstanding-summary, not a per-Vendor fan-out.
    expect(screen.getByText("Vendor Outstanding")).toBeInTheDocument();
    expect(screen.getByText("₹2,40,000")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /view vendors/i })).toHaveAttribute("href", "/vendors");

    // Outstanding to Subcontractors, from the Epic 18 summary endpoint.
    expect(screen.getByText("Outstanding to Subcontractors")).toBeInTheDocument();
    expect(screen.getByText("₹62,500")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /view subcontractors/i })).toHaveAttribute("href", "/subcontractors");

    // Cash Tied Up = vendor outstanding (2,40,000) + advances (3,14,200) + Subcontractor outstanding (62,500).
    expect(screen.getByText("Cash Tied Up")).toBeInTheDocument();
    expect(screen.getByText("₹6,16,700")).toBeInTheDocument();
  });

  it("degrades the Money row to honest dashes when its reads fail, without touching the rest of the page", async () => {
    // Every non-dashboard read fails — the Money row must degrade to "—"
    // per card while Today/Overall render exactly as before.
    global.fetch = vi.fn((input: RequestInfo | URL) => {
      const url = String(input);
      // The role lookup must still succeed — a failed /users/me falls back to
      // the Supervisor Home, which is its own test below.
      if (url.includes("/users/me")) return Promise.resolve({ ok: true, json: async () => ({ role: "OWNER_ADMIN" }) });
      if (url.includes("/dashboard/overall")) return Promise.resolve({ ok: true, json: async () => baseOverall });
      if (url.includes("/dashboard/sites-preview"))
        return Promise.resolve({ ok: true, json: async () => baseSitesPreview });
      if (url.includes("/dashboard/today")) return Promise.resolve({ ok: true, json: async () => baseToday });
      return Promise.resolve({ ok: false, status: 500, json: async () => ({}) });
    }) as unknown as typeof fetch;

    await renderDashboard();

    expect(screen.getByText("Expenses This Month")).toBeInTheDocument();
    expect(screen.getByText("Vendor Outstanding")).toBeInTheDocument();
    expect(screen.getByText("Outstanding to Subcontractors")).toBeInTheDocument();
    expect(screen.getByText("Cash Tied Up")).toBeInTheDocument();
    expect(screen.getAllByText("—")).toHaveLength(4);
    // The core dashboard is untouched by the Money row's failure.
    expect(screen.getByText("₹86,400")).toBeInTheDocument();
    expect(screen.getByText("Active Sites")).toBeInTheDocument();
  });

  it("renders the Sites preview grid with per-Site drill-down and a View-all link (AC #2)", async () => {
    mockDashboard({});
    await renderDashboard();

    expect(screen.getByText("NH-48 Widening").closest("a")).toHaveAttribute(
      "href",
      "/sites/s1",
    );
    expect(screen.getByText("Metro Depot").closest("a")).toHaveAttribute(
      "href",
      "/sites/s2",
    );
    expect(screen.getByRole("link", { name: /view all sites/i })).toHaveAttribute(
      "href",
      "/sites",
    );
  });

  it("renders one whole-page empty state for a zero-Sites Tenant, not a wall of 0-valued tiles (AC #1, FR-34)", async () => {
    mockDashboard({
      today: {
        sitesReportingToday: 0,
        labourWorkingToday: 0,
        materialsReceivedToday: 0,
        materialsConsumedToday: 0,
        rmcUsedTodayM3: 0,
        machineryInUse: 0,
        expensesToday: 0,
        sitesMissingDsrToday: [],
      },
      overall: {
        activeSites: { count: 0, names: [] },
        inventory: { lowStockCount: 0 },
        outstandingAdvances: { total: 0, teamMemberCount: 0 },
        pendingPayments: { count: 0 },
      },
      sitesPreview: [],
    });

    await renderDashboard();

    // The single empty state, with its primary create action.
    expect(screen.getByText("No Sites yet")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /create your first site/i }),
    ).toHaveAttribute("href", "/sites/new");

    // None of the Today tiles, Overall cards, or Sites grid render.
    expect(screen.queryByText("Sites Reporting Today")).toBeNull();
    expect(screen.queryByText("Active Sites")).toBeNull();
    expect(screen.queryByRole("link", { name: /view all sites/i })).toBeNull();
  });
  it("renders the task-first Supervisor Home for SITE_SUPERVISOR instead of the Owner rollup", async () => {
    mockDashboard({ role: "SITE_SUPERVISOR", today: { ...baseToday, sitesMissingDsrToday: [{ siteId: "s1", name: "NH-48 Widening" }] } });
    await renderDashboard();

    // The hero card and the gap-flag action both start the Daily Report —
    // the gap-flag deep-links its Site, the hero goes to the bare form.
    const startLinks = screen.getAllByRole("link", { name: /Start Daily Report/ });
    expect(startLinks.length).toBeGreaterThan(0);
    for (const link of startLinks) {
      expect(link.getAttribute("href")).toMatch(/^\/dsr\/new/);
    }
    expect(screen.getByText("Material Received")).toBeInTheDocument();
    expect(screen.getByText("Material Used")).toBeInTheDocument();
    expect(screen.getByText("Attendance")).toBeInTheDocument();
    // The report-due strip names the exact Site.
    expect(screen.getByText(/NH-48 Widening/)).toBeInTheDocument();
    // None of the Owner's financial rollup appears.
    expect(screen.queryByText("Vendor Outstanding")).not.toBeInTheDocument();
    expect(screen.queryByText("Cash Tied Up")).not.toBeInTheDocument();
  });
  // D7: the Owner's only dashboard-level signal that gate entries await
  // pricing — the endpoint returns a bare number; pin both branches.
  // Story 19.5: >1 pending Purchase deep-links to the filtered Movements
  // view, never the old unfiltered `?type=PURCHASE`.
  it("flags pending-pricing inward entries with an Add Pricing action linking to the filtered Movements view when more than one is pending", async () => {
    mockDashboard({ pendingPricing: 3 });
    await renderDashboard();

    expect(screen.getByText("3 inward entries are waiting for pricing.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Add Pricing/ })).toHaveAttribute(
      "href",
      "/movements?type=PURCHASE_PENDING_PRICING",
    );
  });

  // Story 19.5: exactly one pending Purchase skips the list entirely.
  it("links Add Pricing straight to the single pending Purchase's pricing page when exactly one is pending", async () => {
    mockDashboard({ pendingPricing: 1, pendingPricingPurchases: [{ id: "p1" }] });
    await renderDashboard();

    expect(screen.getByText("1 inward entry is waiting for pricing.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Add Pricing/ })).toHaveAttribute(
      "href",
      "/movements/purchases/p1/pricing",
    );
  });

  it("falls back to the filtered Movements view if the single-pending-Purchase read fails or comes back empty", async () => {
    mockDashboard({ pendingPricing: 1, pendingPricingPurchases: [] });
    await renderDashboard();

    expect(screen.getByRole("link", { name: /Add Pricing/ })).toHaveAttribute(
      "href",
      "/movements?type=PURCHASE_PENDING_PRICING",
    );
  });

  it("shows no pending-pricing flag when the count is zero", async () => {
    mockDashboard({ pendingPricing: 0 });
    await renderDashboard();

    expect(screen.queryByText(/waiting for pricing/)).not.toBeInTheDocument();
  });

  it("flags Draft Site Contracts still missing commercial terms with a Review Subcontractors action", async () => {
    mockDashboard({ draftPendingTerms: 2 });
    await renderDashboard();

    expect(screen.getByText("2 Site Contracts are still Draft, missing commercial terms.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Review Subcontractors/ })).toHaveAttribute("href", "/subcontractors");
  });

  it("shows no draft-pending-terms flag when the count is zero", async () => {
    mockDashboard({ draftPendingTerms: 0 });
    await renderDashboard();

    expect(screen.queryByText(/missing commercial terms/)).not.toBeInTheDocument();
  });

  it("Supervisor Home: one gap-flag per missing Site, each deep-linking that Site's report", async () => {
    mockDashboard({
      role: "SITE_SUPERVISOR",
      today: {
        ...baseToday,
        sitesMissingDsrToday: [
          { siteId: "s1", name: "NH-48 Widening" },
          { siteId: "s2", name: "Metro Depot" },
        ],
      },
    });
    await renderDashboard();

    expect(screen.getByText("Daily Report still due today for NH-48 Widening.")).toBeInTheDocument();
    expect(screen.getByText("Daily Report still due today for Metro Depot.")).toBeInTheDocument();
    const starts = screen.getAllByRole("link", { name: /Start Daily Report/ });
    // hero + one per flag; the flags carry ?siteId= deep links
    expect(starts.some((link) => link.getAttribute("href") === "/dsr/new?siteId=s1")).toBe(true);
    expect(starts.some((link) => link.getAttribute("href") === "/dsr/new?siteId=s2")).toBe(true);
  });

  it("Supervisor Home: all-submitted success line only when something actually reported", async () => {
    mockDashboard({ role: "SITE_SUPERVISOR", today: { ...baseToday, sitesMissingDsrToday: [] } });
    await renderDashboard();
    expect(screen.getByText(/Every site has submitted today/)).toBeInTheDocument();
  });

  it("Supervisor Home: zero-Sites tenant gets no false success line", async () => {
    mockDashboard({
      role: "SITE_SUPERVISOR",
      today: { ...baseToday, sitesReportingToday: 0, sitesMissingDsrToday: [] },
    });
    await renderDashboard();
    expect(screen.queryByText(/Every site has submitted today/)).not.toBeInTheDocument();
  });
});
