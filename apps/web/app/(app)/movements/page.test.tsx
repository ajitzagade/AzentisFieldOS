import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import MovementsPage from "./page";

async function renderMovementsPage() {
  const element = await MovementsPage();
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

function mockFetchRouter(handlers: {
  purchases?: unknown;
  movements?: unknown;
  consumption?: unknown;
  returnWastage?: unknown;
}) {
  global.fetch = vi.fn((url: string) => {
    const urlStr = String(url);
    if (urlStr.includes("/purchases")) {
      return Promise.resolve({ ok: true, json: async () => handlers.purchases ?? [] });
    }
    if (urlStr.includes("/consumption")) {
      return Promise.resolve({ ok: true, json: async () => handlers.consumption ?? [] });
    }
    if (urlStr.includes("/return-wastage")) {
      return Promise.resolve({ ok: true, json: async () => handlers.returnWastage ?? [] });
    }
    return Promise.resolve({ ok: true, json: async () => handlers.movements ?? [] });
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
    mockFetchRouter({ purchases: [godownPurchase] });

    await renderMovementsPage();

    expect(screen.getByText("Purchase")).toBeInTheDocument();
    expect(screen.getByText("Cement (OPC 53 Grade)")).toBeInTheDocument();
    expect(screen.getByText("Godown")).toBeInTheDocument();
    expect(screen.getAllByText("200 Bags")).toHaveLength(2);
  });

  it("renders a Site-destined Purchase's flow as the Site name", async () => {
    mockFetchRouter({ purchases: [sitePurchase] });

    await renderMovementsPage();

    expect(screen.getByText("NH-48 Highway Widening")).toBeInTheDocument();
    expect(screen.getAllByText("40 Kg")).toHaveLength(2);
  });

  it("links each Purchase row's Correct action to that Purchase's correction route", async () => {
    mockFetchRouter({ purchases: [godownPurchase] });

    await renderMovementsPage();

    expect(screen.getByRole("link", { name: "Correct" })).toHaveAttribute("href", "/movements/purchases/p1/correct");
  });

  it("renders a gold Movement badge and a Godown -> destination Site flow", async () => {
    mockFetchRouter({ movements: [shortMovement] });

    await renderMovementsPage();

    expect(screen.getByText("Movement")).toBeInTheDocument();
    expect(screen.getByText("TMT Steel (12mm)")).toBeInTheDocument();
    expect(
      screen.getByText(
        (_, element) => element?.tagName === "SPAN" && element.textContent === "GodownNH-48 Highway Widening — Package 3",
      ),
    ).toBeInTheDocument();
  });

  it("shows a Pending receipt badge and a Confirm Receipt action for a Movement with no receivedQuantity yet", async () => {
    mockFetchRouter({ movements: [pendingMovement] });

    await renderMovementsPage();

    expect(screen.getByText("Pending receipt")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Confirm Receipt/ })).toHaveAttribute("href", "/movements/m1/confirm-receipt");
  });

  it("does not show a Confirm Receipt action once receivedQuantity is set", async () => {
    mockFetchRouter({ movements: [shortMovement] });

    await renderMovementsPage();

    expect(screen.queryByRole("link", { name: /Confirm Receipt/ })).not.toBeInTheDocument();
  });

  it("renders a sent/received shortfall in the warning color, not silently reconciled", async () => {
    mockFetchRouter({ movements: [shortMovement] });

    await renderMovementsPage();

    const received = screen.getByText("1240 Kg");
    expect(received).toHaveClass("text-warning-700");
  });

  it("links a Movement row's Correct action to the Godown-to-Site correction route", async () => {
    mockFetchRouter({ movements: [shortMovement] });

    await renderMovementsPage();

    expect(screen.getByRole("link", { name: "Correct" })).toHaveAttribute("href", "/movements/godown-to-site/m2/correct");
  });

  it("renders the empty state with a record-first-Purchase action when there are zero rows", async () => {
    mockFetchRouter({});

    await renderMovementsPage();

    expect(screen.getByText(/No Purchases, movements, consumption, or wastage\/return recorded yet\./)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Record your first Purchase/ })).toHaveAttribute("href", "/movements/purchases/new");
  });

  it("links the header actions to every entry form", async () => {
    mockFetchRouter({});

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
      consumption: [
        {
          id: "c1",
          quantity: "6",
          consumedAt: "2026-08-10T00:00:00.000Z",
          site: { id: "site1", name: "Sector 12 Metro Depot" },
          materialSize: { label: "600mm", material: { name: "RCC Pipe", unit: { name: "Pcs" } } },
        },
      ],
    });

    await renderMovementsPage();

    expect(screen.getByText("Consumption")).toBeInTheDocument();
    expect(screen.getByText("RCC Pipe (600mm)")).toBeInTheDocument();
    expect(screen.getByText("Sector 12 Metro Depot")).toBeInTheDocument();
    expect(screen.getByText("6 Pcs")).toBeInTheDocument();
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("links a Consumption row's Correct action to the Consumption correction route", async () => {
    mockFetchRouter({
      consumption: [
        {
          id: "c1",
          quantity: "6",
          consumedAt: "2026-08-10T00:00:00.000Z",
          site: { id: "site1", name: "Sector 12 Metro Depot" },
          materialSize: { label: "600mm", material: { name: "RCC Pipe", unit: { name: "Pcs" } } },
        },
      ],
    });

    await renderMovementsPage();

    expect(screen.getByRole("link", { name: "Correct" })).toHaveAttribute("href", "/movements/consumption/c1/correct");
  });

  it("renders a danger Wastage & Return badge with matching Sent/Received Qty (no sent/received-gap concept)", async () => {
    mockFetchRouter({
      returnWastage: [
        {
          id: "rw1",
          kind: "WASTAGE",
          quantity: "2",
          recordedAt: "2026-08-09T00:00:00.000Z",
          site: { id: "site1", name: "Godown" },
          materialSize: { label: "20mm", material: { name: "Aggregate", unit: { name: "Ton" } } },
        },
      ],
    });

    await renderMovementsPage();

    expect(screen.getByText("Wastage & Return")).toBeInTheDocument();
    expect(screen.getByText("Aggregate (20mm)")).toBeInTheDocument();
    expect(screen.getAllByText("2 Ton")).toHaveLength(2);
  });

  it("links a Wastage/Return row's Correct action to the Return/Wastage correction route", async () => {
    mockFetchRouter({
      returnWastage: [
        {
          id: "rw1",
          kind: "RETURN",
          quantity: "2",
          recordedAt: "2026-08-09T00:00:00.000Z",
          site: { id: "site1", name: "Godown" },
          materialSize: { label: "20mm", material: { name: "Aggregate", unit: { name: "Ton" } } },
        },
      ],
    });

    await renderMovementsPage();

    expect(screen.getByRole("link", { name: "Correct" })).toHaveAttribute("href", "/movements/return-wastage/rw1/correct");
  });
});
