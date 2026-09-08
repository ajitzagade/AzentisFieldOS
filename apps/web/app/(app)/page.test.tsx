import { render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ToastProvider } from "@azentisfieldos/ui";
import DashboardPage from "./page";
import { GlobalSearchContext } from "./_components/global-search";

// OwnerDashboard renders AdvanceQuickEntryTrigger (Story 19.1), which calls
// both useToast() and useRouter() (for the post-success router.refresh()) —
// in the real app these are satisfied by AppShell's <ToastProvider> ancestor
// and the Next.js App Router respectively; this test renders the page in
// isolation, so it needs the same provider plus a router mock (which also
// serves SiteOperationsTable's error-state Retry). Story 19.3's band
// "Search ⌘K" chip similarly needs AppShell's GlobalSearchContext.
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

// GET /dashboard/site-breakdown — the Site operations table's source.
// 04:12 UTC is 9:42 IST, the time the table must render.
const baseBreakdown = {
  sites: [
    {
      id: "s1",
      name: "NH-48 Widening",
      location: "Nashik",
      status: "ACTIVE",
      report: { submitted: true, submittedAt: "2026-09-08T04:12:00.000Z" },
      labour: 24,
      received: 4,
      consumed: 12,
      expenses: 61200,
    },
    {
      id: "s2",
      name: "Metro Depot",
      location: "Pune",
      status: "ON_HOLD",
      report: { submitted: false, submittedAt: null },
      labour: null,
      received: 0,
      consumed: 0,
      expenses: 0,
    },
  ],
  godown: { received: 2 },
};

// GET /dashboard/trends — 7 local days, today last.
const baseTrends = {
  days: [
    { date: "2026-09-02", sitesReporting: 2, labourWorking: 38, expensesTotal: 21000 },
    { date: "2026-09-03", sitesReporting: 2, labourWorking: 41, expensesTotal: 15000 },
    { date: "2026-09-04", sitesReporting: 1, labourWorking: 35, expensesTotal: 32000 },
    { date: "2026-09-05", sitesReporting: 2, labourWorking: 44, expensesTotal: 12000 },
    { date: "2026-09-06", sitesReporting: 2, labourWorking: 40, expensesTotal: 24000 },
    { date: "2026-09-07", sitesReporting: 1, labourWorking: 12, expensesTotal: 8000 },
    { date: "2026-09-08", sitesReporting: 2, labourWorking: 42, expensesTotal: 86400 },
  ],
};

// Route each fetch to its own fixture — the page resolves the role first
// (/users/me), then the Owner Dashboard issues its parallel requests
// (today / overall / sites-preview / trends / site-breakdown / low-stock /
// expenses summary / vendors).
function mockDashboard(overrides: {
  today?: Record<string, unknown>;
  overall?: Record<string, unknown>;
  sitesPreview?: unknown[];
  breakdown?: Record<string, unknown>;
  trends?: Record<string, unknown>;
  lowStock?: unknown[];
  role?: string;
  pendingPricing?: number;
  pendingPricingPurchases?: { id: string }[];
  draftPendingTerms?: number;
}) {
  const today = overrides.today ?? baseToday;
  const overall = overrides.overall ?? baseOverall;
  const sitesPreview = overrides.sitesPreview ?? baseSitesPreview;
  const breakdown = overrides.breakdown ?? baseBreakdown;
  const trends = overrides.trends ?? baseTrends;
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
                : url.includes("/dashboard/site-breakdown")
                  ? breakdown
                  : url.includes("/dashboard/trends")
                    ? trends
                    : url.includes("/stock/low-stock")
                      ? (overrides.lowStock ?? [])
                      : today;
    return Promise.resolve({ ok: true, json: async () => body });
  }) as unknown as typeof fetch;
}

describe("DashboardPage", () => {
  it("renders the band's seven KPIs, each drilling into its real screen (AC #1)", async () => {
    mockDashboard({});
    await renderDashboard();

    // The two e2e-load-bearing accessible headings survive the redesign.
    expect(screen.getByRole("heading", { name: /owner dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /today's pulse/i })).toBeInTheDocument();

    const expectations: [string, string][] = [
      ["Sites Reporting", "/daily-activity"],
      ["Labour Working", "/team"],
      ["Materials Received", "/movements"],
      ["Materials Consumed", "/movements"],
      ["RMC Used", "/rmc"],
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

  it("renders sparklines on exactly the three trended KPIs when the trends read succeeds", async () => {
    mockDashboard({});
    await renderDashboard();

    // Sites Reporting, Labour Working, Expenses Today — and only those.
    expect(document.querySelectorAll("svg.text-sparkline-on-navy")).toHaveLength(3);
  });

  it("renders the band without sparklines and the table's shared error state when the two new reads fail (additive-context)", async () => {
    global.fetch = vi.fn((input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/users/me"))
        return Promise.resolve({ ok: true, json: async () => ({ role: "OWNER_ADMIN" }) });
      if (url.includes("/dashboard/overall")) return Promise.resolve({ ok: true, json: async () => baseOverall });
      if (url.includes("/dashboard/sites-preview"))
        return Promise.resolve({ ok: true, json: async () => baseSitesPreview });
      if (url.includes("/dashboard/today")) return Promise.resolve({ ok: true, json: async () => baseToday });
      return Promise.resolve({ ok: false, status: 500, json: async () => ({}) });
    }) as unknown as typeof fetch;

    await renderDashboard();

    // KPIs render, just without sparklines.
    expect(screen.getByText("Sites Reporting")).toBeInTheDocument();
    expect(screen.getByText("₹86,400")).toBeInTheDocument();
    expect(document.querySelectorAll("svg.text-sparkline-on-navy")).toHaveLength(0);
    // The Site operations table degrades to the shared DataTable error
    // state (rendered for both the desktop table and mobile card list).
    expect(screen.getAllByText("Couldn't load site operations right now.").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole("button", { name: "Retry" }).length).toBeGreaterThanOrEqual(1);
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

  it("folds 3+ missing Sites behind a summary, open by default — every Site stays visible, not just reachable (FR-35)", async () => {
    mockDashboard({
      today: {
        ...baseToday,
        sitesMissingDsrToday: [
          { siteId: "s1", name: "Balaji Nagar" },
          { siteId: "s2", name: "Metro Depot" },
          { siteId: "s3", name: "Riverside Bridge Approach" },
        ],
      },
    });

    await renderDashboard();

    expect(screen.getByText("3 sites have not submitted a Daily Report yet today")).toBeInTheDocument();
    expect(screen.getByText("Balaji Nagar has not submitted a Daily Report yet today.")).toBeVisible();
    expect(screen.getByText("Metro Depot has not submitted a Daily Report yet today.")).toBeVisible();
    expect(
      screen.getByText("Riverside Bridge Approach has not submitted a Daily Report yet today."),
    ).toBeVisible();
    expect(screen.getAllByRole("link", { name: /view site/i })).toHaveLength(3);
  });

  it("renders the per-Site operations table — drill-down rows, Godown bucket, honest dashes, and a reconciling totals row", async () => {
    mockDashboard({});
    await renderDashboard();

    // Site rows link to their Site pages (DataTable renders a desktop and a
    // mobile copy of every row, so names appear more than once).
    expect(screen.getAllByText("NH-48 Widening")[0]!.closest("a")).toHaveAttribute("href", "/sites/s1");
    expect(screen.getAllByText("Metro Depot")[0]!.closest("a")).toHaveAttribute("href", "/sites/s2");

    // The submitted Site shows its report time (04:12 UTC = 9:42 IST).
    expect(screen.getAllByText(/Submitted 9:42/i).length).toBeGreaterThanOrEqual(1);
    // The On Hold Site gets the honest no-report-expected state, never a
    // missing-report warning.
    expect(screen.getAllByText("On hold — no report expected").length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText("No Daily Report yet today")).toBeNull();

    // The Godown bucket row (received only — labour/consumed/expenses have
    // no Godown-side data in the schema).
    expect(screen.getAllByText("Godown").length).toBeGreaterThanOrEqual(1);

    // Totals: labour 24, received 4 + 0 + 2 (Godown) = 6, consumed 12,
    // expenses ₹61,200 — reconciling row content.
    expect(screen.getAllByText("Today across all sites").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("₹61,200").length).toBeGreaterThanOrEqual(1);

    expect(screen.getByRole("link", { name: /view all sites/i })).toHaveAttribute("href", "/sites");
  });

  it("flags a reporting-expected Site with no report in the table", async () => {
    mockDashboard({
      breakdown: {
        sites: [
          {
            id: "s1",
            name: "NH-48 Widening",
            location: "Nashik",
            status: "ACTIVE",
            report: { submitted: false, submittedAt: null },
            labour: null,
            received: 0,
            consumed: 0,
            expenses: 0,
          },
        ],
        godown: { received: 0 },
      },
    });
    await renderDashboard();

    expect(screen.getAllByText("No Daily Report yet today").length).toBeGreaterThanOrEqual(1);
  });

  it("totals row: sums received (Godown fold-in), consumed, and expenses from the rows, but takes labour from the band's distinct headcount", async () => {
    // Every totals value differs from every individual cell, so any wrong
    // source (dropped Godown bucket, summed labour, swapped column) fails.
    // Per-Site labour sums to 41; the band's distinct headcount is 42 (one
    // member attended two Sites) — the totals row must show 42.
    mockDashboard({
      breakdown: {
        sites: [
          {
            id: "s1",
            name: "NH-48 Widening",
            location: "Nashik",
            status: "ACTIVE",
            report: { submitted: true, submittedAt: "2026-09-08T04:12:00.000Z" },
            labour: 24,
            received: 3,
            consumed: 7,
            expenses: 50000,
          },
          {
            id: "s2",
            name: "Metro Depot",
            location: "Pune",
            status: "ACTIVE",
            report: { submitted: true, submittedAt: "2026-09-08T05:00:00.000Z" },
            labour: 17,
            received: 1,
            consumed: 4,
            expenses: 11200,
          },
        ],
        godown: { received: 2 },
      },
    });
    await renderDashboard();

    // Scope to the desktop totals row — DataTable also renders a mobile
    // card copy of every row.
    const totalsRow = screen.getAllByText("Today across all sites")[0]!.closest("tr")!;
    expect(within(totalsRow).getByText("42")).toBeInTheDocument(); // band figure, not 24+17
    expect(within(totalsRow).getByText("6")).toBeInTheDocument(); // 3 + 1 + godown 2
    expect(within(totalsRow).getByText("11")).toBeInTheDocument(); // 7 + 4
    expect(within(totalsRow).getByText("₹61,200")).toBeInTheDocument(); // 50,000 + 11,200
  });

  it("metric cells: a submitted Site's genuine 0 renders 0, an unsubmitted Site's 0 renders an honest dash", async () => {
    mockDashboard({
      breakdown: {
        sites: [
          {
            id: "s1",
            name: "NH-48 Widening",
            location: "Nashik",
            status: "ACTIVE",
            report: { submitted: true, submittedAt: "2026-09-08T04:12:00.000Z" },
            labour: 5,
            received: 0,
            consumed: 2,
            expenses: 0,
          },
          {
            id: "s2",
            name: "Metro Depot",
            location: "Pune",
            status: "ACTIVE",
            report: { submitted: false, submittedAt: null },
            labour: null,
            received: 0,
            consumed: 0,
            expenses: 0,
          },
        ],
        godown: { received: 0 },
      },
    });
    await renderDashboard();

    // Desktop rows (the mobile card list duplicates them).
    const submittedRow = screen.getAllByText("NH-48 Widening")[0]!.closest("tr")!;
    expect(within(submittedRow).getByText("5")).toBeInTheDocument();
    expect(within(submittedRow).getByText("0")).toBeInTheDocument(); // received: report vouched for the day
    expect(within(submittedRow).getByText("2")).toBeInTheDocument();
    expect(within(submittedRow).getByText("₹0")).toBeInTheDocument();
    expect(within(submittedRow).queryByText("—")).toBeNull();

    const unsubmittedRow = screen.getAllByText("Metro Depot")[0]!.closest("tr")!;
    // labour, received, consumed, expenses — all honest dashes, never a
    // confident 0 for an unreported day.
    expect(within(unsubmittedRow).getAllByText("—")).toHaveLength(4);
    expect(within(unsubmittedRow).queryByText("0")).toBeNull();
    expect(within(unsubmittedRow).queryByText("₹0")).toBeNull();
  });

  it("renders the low-stock strip from GET /stock/low-stock, linking to Inventory", async () => {
    mockDashboard({
      lowStock: [
        { id: "m1", name: "Cement OPC 53 Grade", unit: { name: "Bags" }, godownQuantity: "12" },
        { id: "m2", name: "River Sand", unit: { name: "Brass" }, godownQuantity: "2" },
      ],
    });
    await renderDashboard();

    expect(screen.getByText("2 materials low")).toBeInTheDocument();
    expect(screen.getByText("Cement OPC 53 Grade")).toBeInTheDocument();
    expect(screen.getByText("River Sand")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /view inventory/i })).toHaveAttribute("href", "/inventory");
  });

  it("caps the low-stock strip at six chips and folds the rest into the Inventory link", async () => {
    mockDashboard({
      lowStock: Array.from({ length: 8 }, (_, i) => ({
        id: `m${i + 1}`,
        name: `Material ${i + 1}`,
        unit: { name: "Bags" },
        godownQuantity: `${i + 1}`,
      })),
    });
    await renderDashboard();

    // Lead counts everything; chips stop at six.
    expect(screen.getByText("8 materials low")).toBeInTheDocument();
    expect(screen.getByText("Material 6")).toBeInTheDocument();
    expect(screen.queryByText("Material 7")).toBeNull();
    expect(screen.queryByText("Material 8")).toBeNull();
    const link = screen.getByRole("link", { name: /view inventory/i });
    expect(link).toHaveTextContent("+2 more · View Inventory");
    expect(link).toHaveAttribute("href", "/inventory");
  });

  it("omits the low-stock strip entirely when nothing is low (or the read fails)", async () => {
    mockDashboard({ lowStock: [] });
    await renderDashboard();

    expect(screen.queryByText(/materials low/)).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /view inventory/i })).toBeNull();
  });

  it("renders the Money strip — month expenses, vendor outstanding, Subcontractor outstanding, and the Cash Tied Up hero with advances and pending payments folded into it", async () => {
    global.fetch = vi.fn((input: RequestInfo | URL) => {
      const url = String(input);
      const body = url.includes("/dashboard/overall")
        ? baseOverall
        : url.includes("/dashboard/sites-preview")
          ? baseSitesPreview
          : url.includes("/dashboard/site-breakdown")
            ? baseBreakdown
            : url.includes("/dashboard/trends")
              ? baseTrends
              : url.includes("/stock/low-stock")
                ? []
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

    // Cash Tied Up = vendor outstanding (2,40,000) + advances (3,14,200) +
    // Subcontractor outstanding (62,500), with every component — and the
    // pending-payments count — named in the hero card's meta.
    expect(screen.getByText("Cash Tied Up")).toBeInTheDocument();
    expect(screen.getByText("₹6,16,700")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Vendor dues ₹2,40,000 + Outstanding Advances ₹3,14,200 (9 Team Members) + Subcontractor payables ₹62,500 · 4 Pending Payments",
      ),
    ).toBeInTheDocument();

    // The /payments drill-down and the Record Advance quick entry both stay
    // reachable from the card (Story 19.1/19.3 regression guard — a second
    // trigger lives in the band's quick-actions row).
    expect(screen.getByRole("link", { name: /view payments/i })).toHaveAttribute("href", "/payments");
    expect(screen.getAllByRole("button", { name: /record advance/i }).length).toBeGreaterThanOrEqual(1);
  });

  it("degrades the Money row to honest dashes when its reads fail, without touching the rest of the page", async () => {
    // Every non-dashboard read fails — the Money row must degrade to "—"
    // per card while the band renders exactly as before.
    global.fetch = vi.fn((input: RequestInfo | URL) => {
      const url = String(input);
      // The role lookup must still succeed — a failed /users/me falls back to
      // the Supervisor Home, which is its own test below.
      if (url.includes("/users/me")) return Promise.resolve({ ok: true, json: async () => ({ role: "OWNER_ADMIN" }) });
      if (url.includes("/dashboard/overall")) return Promise.resolve({ ok: true, json: async () => baseOverall });
      if (url.includes("/dashboard/sites-preview"))
        return Promise.resolve({ ok: true, json: async () => baseSitesPreview });
      if (url.includes("/dashboard/site-breakdown"))
        return Promise.resolve({ ok: true, json: async () => baseBreakdown });
      if (url.includes("/dashboard/trends")) return Promise.resolve({ ok: true, json: async () => baseTrends });
      if (url.includes("/dashboard/today")) return Promise.resolve({ ok: true, json: async () => baseToday });
      return Promise.resolve({ ok: false, status: 500, json: async () => ({}) });
    }) as unknown as typeof fetch;

    await renderDashboard();

    expect(screen.getByText("Expenses This Month")).toBeInTheDocument();
    expect(screen.getByText("Vendor Outstanding")).toBeInTheDocument();
    expect(screen.getByText("Outstanding to Subcontractors")).toBeInTheDocument();
    expect(screen.getByText("Cash Tied Up")).toBeInTheDocument();
    // Four money cards, four honest dashes (the site table renders its own
    // dashes only for unreported metrics — Metro Depot's four cells, twice
    // for the desktop + mobile row copies).
    expect(screen.getAllByText("—").length).toBeGreaterThanOrEqual(4);
    expect(screen.getAllByText("Couldn't load right now").length).toBe(4);
    // The core dashboard is untouched by the Money row's failure.
    expect(screen.getByText("₹86,400")).toBeInTheDocument();
    expect(screen.getByText("Sites Reporting")).toBeInTheDocument();
  });

  it("renders one whole-page empty state for a zero-Sites Tenant, not a 0-valued instrument band (AC #1, FR-34)", async () => {
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
      breakdown: { sites: [], godown: { received: 0 } },
    });

    await renderDashboard();

    // The single empty state, with its primary create action.
    expect(screen.getByText("No Sites yet")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /create your first site/i }),
    ).toHaveAttribute("href", "/sites/new");

    // Neither the band KPIs, the Site operations table, nor the Money strip render.
    expect(screen.queryByText("Sites Reporting")).toBeNull();
    expect(screen.queryByText("Site operations")).toBeNull();
    expect(screen.queryByText("Cash Tied Up")).toBeNull();
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
    // The Materials Received KPI carries the same honesty signal inline.
    expect(screen.getByText("3 awaiting pricing")).toBeInTheDocument();
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

  it("Supervisor Home: folds 3+ missing Sites behind a summary, open by default (FR-35)", async () => {
    mockDashboard({
      role: "SITE_SUPERVISOR",
      today: {
        ...baseToday,
        sitesMissingDsrToday: [
          { siteId: "s1", name: "NH-48 Widening" },
          { siteId: "s2", name: "Metro Depot" },
          { siteId: "s3", name: "Riverside Bridge Approach" },
        ],
      },
    });
    await renderDashboard();

    expect(screen.getByText("Daily Report still due today for 3 sites")).toBeInTheDocument();
    expect(screen.getByText("Daily Report still due today for NH-48 Widening.")).toBeVisible();
    expect(screen.getByText("Daily Report still due today for Metro Depot.")).toBeVisible();
    expect(screen.getByText("Daily Report still due today for Riverside Bridge Approach.")).toBeVisible();
    const starts = screen.getAllByRole("link", { name: /Start Daily Report/ });
    expect(starts.some((link) => link.getAttribute("href") === "/dsr/new?siteId=s3")).toBe(true);
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
