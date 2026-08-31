import { render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import MovementsPage from "./page";

vi.mock("next/navigation", () => ({
  usePathname: () => "/movements",
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ replace: vi.fn() }),
}));

async function renderMovementsPage(searchParams?: Record<string, string>) {
  const element = await MovementsPage({ searchParams: Promise.resolve(searchParams ?? {}) });
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

type LogRow = { type: string; id: string; item: unknown };

function mockFetchRouter(handlers: { rows?: LogRow[]; total?: number; sites?: unknown[] }) {
  global.fetch = vi.fn((url: string) => {
    const urlStr = String(url);
    if (urlStr.includes("/sites")) {
      return Promise.resolve({ ok: true, json: async () => handlers.sites ?? [] });
    }
    return Promise.resolve({
      ok: true,
      json: async () => ({
        rows: handlers.rows ?? [],
        total: handlers.total ?? (handlers.rows?.length ?? 0),
        page: 1,
        pageSize: 25,
      }),
    });
  }) as unknown as typeof fetch;
}

const godownPurchase = {
  id: "p1",
  destination: "GODOWN",
  quantity: "200",
  purchasedAt: "2026-08-11T00:00:00.000Z",
  site: null,
  materialSize: { label: "OPC 53 Grade", material: { name: "Cement", unit: { name: "Bags" } } },
};

const sitePurchase = {
  id: "p2",
  destination: "SITE",
  quantity: "40",
  purchasedAt: "2026-08-12T00:00:00.000Z",
  site: { id: "site1", name: "NH-48 Highway Widening" },
  materialSize: { label: "12mm", material: { name: "TMT Steel", unit: { name: "Kg" } } },
};

const pendingMovement = {
  id: "m1",
  sentQuantity: "1300",
  receivedQuantity: null,
  movedAt: "2026-08-10T00:00:00.000Z",
  sourceSite: null,
  destinationSite: { id: "site1", name: "NH-48 Highway Widening — Package 3" },
  materialSize: { label: "12mm", material: { name: "TMT Steel", unit: { name: "Kg" } } },
};

const shortMovement = {
  ...pendingMovement,
  id: "m2",
  receivedQuantity: "1240",
};

describe("MovementsPage", () => {
  it("renders a Purchase row with a success badge, Godown flow, and matching Sent/Received Qty", async () => {
    mockFetchRouter({ rows: [{ type: "PURCHASE", id: "p1", item: godownPurchase }] });

    await renderMovementsPage();

    const table = within(screen.getByRole("table"));
    expect(table.getByText("Purchase")).toBeInTheDocument();
    expect(table.getByText("Cement (OPC 53 Grade)")).toBeInTheDocument();
    expect(table.getByText("Godown")).toBeInTheDocument();
    expect(table.getAllByText("200 Bags")).toHaveLength(2);
  });

  it("renders a Site-destined Purchase's flow as the Site name", async () => {
    mockFetchRouter({ rows: [{ type: "PURCHASE", id: "p2", item: sitePurchase }] });

    await renderMovementsPage();

    const table = within(screen.getByRole("table"));
    expect(table.getByText("NH-48 Highway Widening")).toBeInTheDocument();
    expect(table.getAllByText("40 Kg")).toHaveLength(2);
  });

  it("links each Purchase row's Correct action to that Purchase's correction route", async () => {
    mockFetchRouter({ rows: [{ type: "PURCHASE", id: "p1", item: godownPurchase }] });

    await renderMovementsPage();

    expect(screen.getByRole("link", { name: "Correct" })).toHaveAttribute("href", "/movements/purchases/p1/correct");
  });

  it("renders a gold Movement badge and a Godown -> destination Site flow", async () => {
    mockFetchRouter({ rows: [{ type: "MOVEMENT", id: "m2", item: shortMovement }] });

    await renderMovementsPage();

    const table = within(screen.getByRole("table"));
    expect(table.getByText("Movement")).toBeInTheDocument();
    expect(table.getByText("TMT Steel (12mm)")).toBeInTheDocument();
    expect(
      table.getByText(
        (_, element) => element?.tagName === "SPAN" && element.textContent === "GodownNH-48 Highway Widening — Package 3",
      ),
    ).toBeInTheDocument();
  });

  it("shows a Pending receipt badge and a Confirm Receipt action for a Movement with no receivedQuantity yet", async () => {
    mockFetchRouter({ rows: [{ type: "MOVEMENT", id: "m1", item: pendingMovement }] });

    await renderMovementsPage();

    expect(screen.getByText("Pending receipt")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Confirm Receipt/ })).toHaveAttribute("href", "/movements/m1/confirm-receipt");
  });

  it("does not show a Confirm Receipt action once receivedQuantity is set", async () => {
    mockFetchRouter({ rows: [{ type: "MOVEMENT", id: "m2", item: shortMovement }] });

    await renderMovementsPage();

    expect(screen.queryByRole("link", { name: /Confirm Receipt/ })).not.toBeInTheDocument();
  });

  it("renders a sent/received shortfall in the warning color, not silently reconciled", async () => {
    mockFetchRouter({ rows: [{ type: "MOVEMENT", id: "m2", item: shortMovement }] });

    await renderMovementsPage();

    const received = screen.getByText("1240 Kg");
    expect(received).toHaveClass("text-warning-700");
  });

  it("links a Movement row's Correct action to the Godown-to-Site correction route", async () => {
    mockFetchRouter({ rows: [{ type: "MOVEMENT", id: "m2", item: shortMovement }] });

    await renderMovementsPage();

    expect(screen.getByRole("link", { name: "Correct" })).toHaveAttribute("href", "/movements/godown-to-site/m2/correct");
  });

  it("renders the empty state with a record-first-Purchase action when there are zero rows", async () => {
    mockFetchRouter({ rows: [] });

    await renderMovementsPage();

    expect(screen.getByText(/No Purchases, movements, consumption, or wastage\/return recorded yet\./)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Record your first Purchase/ })).toHaveAttribute("href", "/movements/purchases/new");
  });

  it("links the header actions to every entry form", async () => {
    mockFetchRouter({ rows: [] });

    await renderMovementsPage();

    expect(screen.getByRole("link", { name: /Record Purchase/ })).toHaveAttribute("href", "/movements/purchases/new");
    expect(screen.getByRole("link", { name: /Record Movement/ })).toHaveAttribute("href", "/movements/godown-to-site/new");
    expect(screen.getByRole("link", { name: /Direct Vendor → Site/ })).toHaveAttribute("href", "/movements/vendor-to-site/new");
    expect(screen.getByRole("link", { name: /Record Transfer/ })).toHaveAttribute("href", "/movements/site-to-site/new");
    expect(screen.getByRole("link", { name: /Record Consumption/ })).toHaveAttribute("href", "/movements/consumption/new");
    expect(screen.getByRole("link", { name: /Record Wastage \/ Return/ })).toHaveAttribute("href", "/movements/return-wastage/new");
  });

  it("renders a neutral Consumption badge, the Site as flow, and a muted dash for Received Qty", async () => {
    mockFetchRouter({
      rows: [
        {
          type: "CONSUMPTION",
          id: "c1",
          item: {
            id: "c1",
            quantity: "6",
            consumedAt: "2026-08-10T00:00:00.000Z",
            site: { id: "site1", name: "Sector 12 Metro Depot" },
            materialSize: { label: "600mm", material: { name: "RCC Pipe", unit: { name: "Pcs" } } },
          },
        },
      ],
    });

    await renderMovementsPage();

    const table = within(screen.getByRole("table"));
    expect(table.getByText("Consumption")).toBeInTheDocument();
    expect(table.getByText("RCC Pipe (600mm)")).toBeInTheDocument();
    expect(table.getByText("Sector 12 Metro Depot")).toBeInTheDocument();
    expect(table.getByText("6 Pcs")).toBeInTheDocument();
    expect(table.getByText("—")).toBeInTheDocument();
  });

  it("links a Consumption row's Correct action to the Consumption correction route", async () => {
    mockFetchRouter({
      rows: [
        {
          type: "CONSUMPTION",
          id: "c1",
          item: {
            id: "c1",
            quantity: "6",
            consumedAt: "2026-08-10T00:00:00.000Z",
            site: { id: "site1", name: "Sector 12 Metro Depot" },
            materialSize: { label: "600mm", material: { name: "RCC Pipe", unit: { name: "Pcs" } } },
          },
        },
      ],
    });

    await renderMovementsPage();

    expect(screen.getByRole("link", { name: "Correct" })).toHaveAttribute("href", "/movements/consumption/c1/correct");
  });

  it("renders a danger Wastage & Return badge with matching Sent/Received Qty (no sent/received-gap concept)", async () => {
    mockFetchRouter({
      rows: [
        {
          type: "RETURN_WASTAGE",
          id: "rw1",
          item: {
            id: "rw1",
            kind: "WASTAGE",
            quantity: "2",
            recordedAt: "2026-08-09T00:00:00.000Z",
            site: { id: "site1", name: "Godown" },
            materialSize: { label: "20mm", material: { name: "Aggregate", unit: { name: "Ton" } } },
          },
        },
      ],
    });

    await renderMovementsPage();

    const table = within(screen.getByRole("table"));
    expect(table.getByText("Wastage & Return")).toBeInTheDocument();
    expect(table.getByText("Aggregate (20mm)")).toBeInTheDocument();
    expect(table.getAllByText("2 Ton")).toHaveLength(2);
  });

  it("links a Wastage/Return row's Correct action to the Return/Wastage correction route", async () => {
    mockFetchRouter({
      rows: [
        {
          type: "RETURN_WASTAGE",
          id: "rw1",
          item: {
            id: "rw1",
            kind: "RETURN",
            quantity: "2",
            recordedAt: "2026-08-09T00:00:00.000Z",
            site: { id: "site1", name: "Godown" },
            materialSize: { label: "20mm", material: { name: "Aggregate", unit: { name: "Ton" } } },
          },
        },
      ],
    });

    await renderMovementsPage();

    expect(screen.getByRole("link", { name: "Correct" })).toHaveAttribute("href", "/movements/return-wastage/rw1/correct");
  });

  it("requests page 1 / the default page size when no searchParams are given", async () => {
    const fetchMock = vi.fn((url: string) => {
      if (String(url).includes("/sites")) return Promise.resolve({ ok: true, json: async () => [] });
      return Promise.resolve({ ok: true, json: async () => ({ rows: [], total: 0, page: 1, pageSize: 25 }) });
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    await renderMovementsPage();

    const logCall = fetchMock.mock.calls.find((call) => String(call[0]).includes("/movements-log"));
    expect(String(logCall?.[0])).toContain("page=1");
    expect(String(logCall?.[0])).toContain("pageSize=25");
  });

  it("forwards q/type/siteId/from/to search params to the movements-log API", async () => {
    const fetchMock = vi.fn((url: string) => {
      if (String(url).includes("/sites")) return Promise.resolve({ ok: true, json: async () => [] });
      return Promise.resolve({ ok: true, json: async () => ({ rows: [], total: 0, page: 1, pageSize: 25 }) });
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    await renderMovementsPage({ q: "cement", type: "PURCHASE", siteId: "site1", from: "2026-08-01", to: "2026-08-31" });

    const logCall = fetchMock.mock.calls.find((call) => String(call[0]).includes("/movements-log"));
    const url = String(logCall?.[0]);
    expect(url).toContain("q=cement");
    expect(url).toContain("type=PURCHASE");
    expect(url).toContain("siteId=site1");
    expect(url).toContain("from=2026-08-01");
    expect(url).toContain("to=2026-08-31");
  });
});
