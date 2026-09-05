import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const notFoundMock = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
);
vi.mock("next/navigation", () => ({ notFound: notFoundMock }));

import SiteDetailPage from "./page";

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
  const element = await SiteDetailPage({ params: Promise.resolve({ id }) });
  render(element);
}

const DEFAULT_SITE = {
  id: "site-1",
  name: "NH-48 Highway Widening",
  location: "Nashik",
  status: "ACTIVE",
  contractReference: "NHAI/PKG3/2025-118",
  feed: [],
};

// Branches by URL (rather than one fixed response for every fetch call) so
// each section's own fetch — Site, stock, recent DSRs, photos, viewer role,
// and Epic 18's Site Contracts — is independently mockable and testable.
function mockSitePage(overrides: {
  site?: unknown;
  siteContracts?: unknown;
  siteContractsOk?: boolean;
}) {
  global.fetch = vi.fn((url: string) => {
    if (url.includes("/site-contracts")) {
      return Promise.resolve({
        ok: overrides.siteContractsOk ?? true,
        status: overrides.siteContractsOk === false ? 500 : 200,
        json: async () => overrides.siteContracts ?? [],
      });
    }
    if (url.includes("/photos")) return Promise.resolve({ ok: true, json: async () => [] });
    if (url.includes("/stock/site")) return Promise.resolve({ ok: true, json: async () => [] });
    if (url.includes("/reports/sites")) return Promise.resolve({ ok: true, json: async () => ({ dsrs: [] }) });
    if (url.includes("/dsr?")) return Promise.resolve({ ok: true, json: async () => [] });
    if (url.includes("/users/me")) return Promise.resolve({ ok: true, json: async () => ({ role: "OWNER_ADMIN" }) });
    return Promise.resolve({
      ok: overrides.site !== undefined ? true : true,
      status: 200,
      json: async () => overrides.site ?? DEFAULT_SITE,
    });
  }) as unknown as typeof fetch;
}

describe("SiteDetailPage", () => {
  it("renders the Site header, status badge, and location for a Site with zero linked records", async () => {
    mockSitePage({});

    await renderDetailPage("site-1");

    expect(screen.getByRole("heading", { name: /NH-48 Highway Widening/ })).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Nashik")).toBeInTheDocument();
    expect(screen.getByText(/NHAI\/PKG3\/2025-118/)).toBeInTheDocument();
  });

  it("renders an explicit empty-state message, not a blank feed, when there are zero linked records", async () => {
    mockSitePage({ site: { ...DEFAULT_SITE, name: "NH-48", contractReference: null } });

    await renderDetailPage("site-1");

    expect(screen.getAllByText("No activity logged yet for this Site.")).toHaveLength(2);
  });

  it("renders mixed record types in one feed with type labels and amounts where present", async () => {
    mockSitePage({
      site: {
        ...DEFAULT_SITE,
        name: "NH-48",
        contractReference: null,
        feed: [
          { id: "e1", type: "EXPENSE", occurredAt: "2026-08-12T18:00:00Z", summary: "Diesel refill", amount: 4200 },
          { id: "d1", type: "DSR", occurredAt: "2026-08-11T09:00:00Z", summary: "Daily Site Report submitted", amount: null },
        ],
      },
    });

    await renderDetailPage("site-1");

    expect(screen.getAllByText("Diesel refill")).toHaveLength(2);
    expect(screen.getAllByText("Expense")).toHaveLength(2);
    expect(screen.getAllByText("₹4,200")).toHaveLength(2);
    expect(screen.getAllByText("Daily Site Report submitted")).toHaveLength(2);
    expect(screen.getAllByText("Report")).toHaveLength(2);
  });

  it("renders an Edit Site link pointing to the edit route", async () => {
    mockSitePage({ site: { ...DEFAULT_SITE, name: "NH-48", contractReference: null } });

    await renderDetailPage("site-1");

    expect(screen.getByRole("link", { name: /Edit Site/ })).toHaveAttribute("href", "/sites/site-1/edit");
  });

  it("renders a Site Photos link pointing to the gallery route", async () => {
    mockSitePage({ site: { ...DEFAULT_SITE, name: "NH-48", contractReference: null } });

    await renderDetailPage("site-1");

    expect(screen.getByRole("link", { name: /Site Photos/ })).toHaveAttribute("href", "/sites/site-1/photos");
  });

  it("calls notFound() for a Site ID that doesn't exist, instead of crashing or showing an empty feed", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 }) as unknown as typeof fetch;

    await expect(renderDetailPage("missing-id")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalled();
  });

  it("renders an explicit empty state, with an Add Subcontractor action, when the Site has zero Site Contracts", async () => {
    mockSitePage({ siteContracts: [] });

    await renderDetailPage("site-1");

    expect(screen.getAllByText("No Subcontractors engaged at this Site yet.")).toHaveLength(2);
    expect(screen.getAllByRole("link", { name: /Add Subcontractor/ })[0]).toHaveAttribute(
      "href",
      "/sites/site-1/contracts/new",
    );
  });

  it("renders a distinct error state, not the empty state, when the Site Contracts fetch fails", async () => {
    mockSitePage({ siteContractsOk: false });

    await renderDetailPage("site-1");

    expect(screen.getAllByText("Couldn't load this Site's Subcontractors right now.")).toHaveLength(2);
  });

  it("renders each Site Contract row, and shows an Advance credit (not a raw negative) for a negative outstandingAmount", async () => {
    mockSitePage({
      siteContracts: [
        {
          id: "c1",
          workCategory: "Storm-water pipe laying",
          status: "ACTIVE",
          subcontractor: { id: "sc1", name: "Ganesh Pipeline Works" },
          amountPayable: 50000,
          outstandingAmount: -5000,
        },
      ],
    });

    await renderDetailPage("site-1");

    expect(screen.getAllByText("Ganesh Pipeline Works")).toHaveLength(2);
    expect(screen.getAllByText(/Advance/)).toHaveLength(2);
    expect(screen.getAllByText(/₹5,000/)).toHaveLength(2);
  });
});
