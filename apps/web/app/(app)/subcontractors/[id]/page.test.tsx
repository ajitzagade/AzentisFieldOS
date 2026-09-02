import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const notFoundMock = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
);
vi.mock("next/navigation", () => ({ notFound: notFoundMock }));

import SubcontractorDetailPage from "./page";

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

async function renderDetailPage(id: string) {
  const element = await SubcontractorDetailPage({ params: Promise.resolve({ id }) });
  render(element);
}

const SUBCONTRACTOR = {
  id: "sc1",
  name: "Ganesh Pipeline Works",
  contactPerson: "Suresh Ganesh",
  phone: "+91 98220 55671",
  email: null,
  address: null,
  workCategories: ["Pipe laying", "Trenching"],
};

function mockPage(overrides: {
  subcontractor?: unknown;
  subcontractorStatus?: number;
  role?: string | null;
  siteContracts?: unknown;
  siteContractsOk?: boolean;
}) {
  global.fetch = vi.fn((url: string) => {
    if (url.includes("/contracts")) {
      return Promise.resolve({
        ok: overrides.siteContractsOk ?? true,
        json: async () => overrides.siteContracts ?? [],
      });
    }
    if (url.includes("/users/me")) {
      return Promise.resolve({ ok: true, json: async () => ({ role: overrides.role ?? "OWNER_ADMIN" }) });
    }
    const status = overrides.subcontractorStatus ?? (overrides.subcontractor === null ? 404 : 200);
    return Promise.resolve({
      ok: status < 400,
      status,
      json: async () => overrides.subcontractor ?? SUBCONTRACTOR,
    });
  }) as unknown as typeof fetch;
}

describe("SubcontractorDetailPage", () => {
  it("calls notFound() for a Subcontractor that doesn't exist", async () => {
    mockPage({ subcontractor: null, subcontractorStatus: 404 });

    await expect(renderDetailPage("missing")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalled();
  });

  it("renders the Subcontractor's name, contact details, and work category tags", async () => {
    mockPage({});

    await renderDetailPage("sc1");

    expect(screen.getByRole("heading", { name: "Ganesh Pipeline Works" })).toBeInTheDocument();
    expect(screen.getByText("Suresh Ganesh")).toBeInTheDocument();
    expect(screen.getByText("Pipe laying")).toBeInTheDocument();
    expect(screen.getByText("Trenching")).toBeInTheDocument();
  });

  it("shows the Delete affordance to an Owner/Admin", async () => {
    mockPage({ role: "OWNER_ADMIN" });
    await renderDetailPage("sc1");
    expect(screen.getByRole("button", { name: /Delete Subcontractor/ })).toBeInTheDocument();
  });

  it("hides the Delete affordance from a Supervisor", async () => {
    mockPage({ role: "SITE_SUPERVISOR" });
    await renderDetailPage("sc1");
    expect(screen.queryByRole("button", { name: /Delete Subcontractor/ })).not.toBeInTheDocument();
  });

  it("renders an explicit empty state for zero Site Contracts", async () => {
    mockPage({ siteContracts: [] });

    await renderDetailPage("sc1");

    expect(screen.getByText("No Site Contracts recorded yet for this Subcontractor.")).toBeInTheDocument();
  });

  it("renders a distinct error state, not the empty state, when the Site Contracts fetch fails", async () => {
    mockPage({ siteContractsOk: false });

    await renderDetailPage("sc1");

    expect(screen.getByText("Couldn't load this Subcontractor's Site Contracts right now.")).toBeInTheDocument();
  });

  it("shows an Advance credit (not a raw negative) for a negative outstandingAmount", async () => {
    mockPage({
      siteContracts: [
        {
          id: "c1",
          workCategory: "Storm-water pipe laying",
          status: "ACTIVE",
          site: { id: "site-1", name: "NH-48" },
          amountPayable: 50000,
          amountPaid: "55000",
          outstandingAmount: -5000,
        },
      ],
    });

    await renderDetailPage("sc1");

    expect(screen.getByText(/Advance/)).toBeInTheDocument();
    expect(screen.getByText(/₹5,000/)).toBeInTheDocument();
  });
});
