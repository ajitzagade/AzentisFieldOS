import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const notFoundMock = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
);
vi.mock("next/navigation", () => ({ notFound: notFoundMock }));

import SiteContractDetailPage from "./page";

const originalFetch = global.fetch;
const originalApiUrl = process.env.API_URL;

beforeEach(() => {
  process.env.API_URL = "http://localhost:3001";
  notFoundMock.mockClear();
});

afterEach(() => {
  global.fetch = originalFetch;
  process.env.API_URL = originalApiUrl;
  vi.restoreAllMocks();
});

async function renderDetailPage(siteId: string, contractId: string) {
  const element = await SiteContractDetailPage({
    params: Promise.resolve({ id: siteId, contractId }),
  });
  render(element);
}

const ACTIVE_CONTRACT = {
  id: "c1",
  subcontractorId: "sc1",
  subcontractor: { id: "sc1", name: "Ganesh Pipeline Works" },
  siteId: "site-1",
  site: { id: "site-1", name: "NH-48" },
  workCategory: "Storm-water pipe laying",
  description: null,
  rateType: "PER_PIPE",
  rateUnitLabel: null,
  rate: "250",
  fixedAmount: null,
  estimatedQuantity: "600",
  status: "ACTIVE",
  startDate: "2026-09-01T00:00:00Z",
  endDate: null,
  quantityCompleted: "260",
  amountPaid: "30000",
  amountPayable: 65000,
  outstandingAmount: 35000,
};

function mockContractPage(overrides: {
  contract?: unknown;
  contractStatus?: number;
  role?: string | null;
  workEntries?: unknown[];
  payments?: unknown[];
}) {
  global.fetch = vi.fn((url: string) => {
    if (url.includes("/site-contracts/")) {
      const status = overrides.contractStatus ?? (overrides.contract === null ? 404 : 200);
      return Promise.resolve({
        ok: status < 400,
        status,
        json: async () => overrides.contract ?? ACTIVE_CONTRACT,
      });
    }
    if (url.includes("/users/me")) {
      return Promise.resolve({ ok: true, json: async () => ({ role: overrides.role ?? "OWNER_ADMIN" }) });
    }
    if (url.includes("/subcontractor-work-entries")) {
      return Promise.resolve({ ok: true, json: async () => overrides.workEntries ?? [] });
    }
    if (url.includes("/subcontractor-payments")) {
      return Promise.resolve({ ok: true, json: async () => overrides.payments ?? [] });
    }
    return Promise.resolve({ ok: false, status: 500 });
  }) as unknown as typeof fetch;
}

describe("SiteContractDetailPage", () => {
  it("calls notFound() when the Site Contract belongs to a different Site than the URL", async () => {
    mockContractPage({ contract: { ...ACTIVE_CONTRACT, siteId: "site-2" } });

    await expect(renderDetailPage("site-1", "c1")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalled();
  });

  it("calls notFound() when the Site Contract does not exist", async () => {
    mockContractPage({ contract: null, contractStatus: 404 });

    await expect(renderDetailPage("site-1", "missing")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalled();
  });

  it("renders all four StatTiles — quantity, payable, paid, and outstanding — for a rate-based Active contract", async () => {
    mockContractPage({});

    await renderDetailPage("site-1", "c1");

    expect(screen.getByText("Amount payable")).toBeInTheDocument();
    expect(screen.getByText("Amount paid")).toBeInTheDocument();
    expect(screen.getByText("Outstanding")).toBeInTheDocument();
    expect(screen.getByText(/Quantity completed/)).toBeInTheDocument();
    expect(screen.getByText("₹30,000")).toBeInTheDocument();
  });

  it("labels a negative outstandingAmount as an Advance with a positive-toned value, not a raw negative", async () => {
    mockContractPage({ contract: { ...ACTIVE_CONTRACT, outstandingAmount: -5000 } });

    await renderDetailPage("site-1", "c1");

    expect(screen.getByText("Advance — recovers against future work")).toBeInTheDocument();
    expect(screen.getByText("₹5,000")).toBeInTheDocument();
  });

  it("renders 'Pending terms' — italic, not ₹0 — when the rate/amount is not yet set", async () => {
    mockContractPage({
      contract: { ...ACTIVE_CONTRACT, status: "DRAFT", rate: null, amountPayable: null, outstandingAmount: null },
    });

    await renderDetailPage("site-1", "c1");

    const pendingLabels = screen.getAllByText("Pending terms");
    expect(pendingLabels.length).toBeGreaterThan(0);
    expect(screen.queryByText("₹0")).not.toBeInTheDocument();
  });

  it("shows Edit terms and Record Payment to an Owner/Admin", async () => {
    mockContractPage({ role: "OWNER_ADMIN" });
    await renderDetailPage("site-1", "c1");
    expect(screen.getByRole("link", { name: /Edit terms/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Record Payment/ })).toBeInTheDocument();
  });

  it("hides Edit terms and Record Payment from a Supervisor", async () => {
    mockContractPage({ role: "SITE_SUPERVISOR" });
    await renderDetailPage("site-1", "c1");
    expect(screen.queryByRole("link", { name: /Edit terms/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Record Payment/ })).not.toBeInTheDocument();
  });

  it("shows Log Work to both roles when the contract is Active and not Fixed Cost", async () => {
    mockContractPage({ role: "SITE_SUPERVISOR" });

    await renderDetailPage("site-1", "c1");

    expect(screen.getByRole("link", { name: /Log Work/ })).toBeInTheDocument();
  });

  it("hides Log Work for a Fixed Cost contract", async () => {
    mockContractPage({ contract: { ...ACTIVE_CONTRACT, rateType: "FIXED_COST", rate: null, fixedAmount: "200000" } });

    await renderDetailPage("site-1", "c1");

    expect(screen.queryByRole("link", { name: /Log Work/ })).not.toBeInTheDocument();
  });

  it("renders empty-state messages, not blank tables, when there are zero Work Entries or Payments", async () => {
    mockContractPage({});

    await renderDetailPage("site-1", "c1");

    expect(screen.getByText("No Work Entries logged yet for this Site Contract.")).toBeInTheDocument();
    expect(screen.getByText("No Payments recorded yet for this Site Contract.")).toBeInTheDocument();
  });

  it("shows a Correct action on Payment rows to an Owner/Admin — money movement is Owner/Admin-only", async () => {
    const payments = [
      { id: "p1", type: "PAYMENT", amount: "5000", paymentMethod: "UPI", paidAt: "2026-09-02T00:00:00Z", note: null },
    ];

    mockContractPage({ role: "OWNER_ADMIN", payments });
    await renderDetailPage("site-1", "c1");
    expect(screen.getByRole("link", { name: /Correct/ })).toBeInTheDocument();
  });

  it("hides the Correct action on Payment rows from a Supervisor", async () => {
    const payments = [
      { id: "p1", type: "PAYMENT", amount: "5000", paymentMethod: "UPI", paidAt: "2026-09-02T00:00:00Z", note: null },
    ];

    mockContractPage({ role: "SITE_SUPERVISOR", payments });
    await renderDetailPage("site-1", "c1");
    expect(screen.queryByRole("link", { name: /Correct/ })).not.toBeInTheDocument();
  });

  it("renders a distinct 'couldn't load' message, not a crash, when the Work Entries fetch fails", async () => {
    global.fetch = vi.fn((url: string) => {
      if (url.includes("/site-contracts/")) return Promise.resolve({ ok: true, status: 200, json: async () => ACTIVE_CONTRACT });
      if (url.includes("/users/me")) return Promise.resolve({ ok: true, json: async () => ({ role: "OWNER_ADMIN" }) });
      if (url.includes("/subcontractor-work-entries")) return Promise.resolve({ ok: false, status: 500 });
      if (url.includes("/subcontractor-payments")) return Promise.resolve({ ok: true, json: async () => [] });
      return Promise.resolve({ ok: false, status: 500 });
    }) as unknown as typeof fetch;

    await renderDetailPage("site-1", "c1");

    expect(screen.getByText("Couldn't load Work Entries right now.")).toBeInTheDocument();
  });
});
