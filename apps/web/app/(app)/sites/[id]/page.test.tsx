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

describe("SiteDetailPage", () => {
  it("renders the Site header, status badge, and location for a Site with zero linked records", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "site-1",
        name: "NH-48 Highway Widening",
        location: "Nashik",
        status: "ACTIVE",
        contractReference: "NHAI/PKG3/2025-118",
        feed: [],
      }),
    }) as unknown as typeof fetch;

    await renderDetailPage("site-1");

    expect(screen.getByRole("heading", { name: /NH-48 Highway Widening/ })).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Nashik")).toBeInTheDocument();
    expect(screen.getByText(/NHAI\/PKG3\/2025-118/)).toBeInTheDocument();
  });

  it("renders an explicit empty-state message, not a blank feed, when there are zero linked records", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "site-1",
        name: "NH-48",
        location: "Nashik",
        status: "ACTIVE",
        contractReference: null,
        feed: [],
      }),
    }) as unknown as typeof fetch;

    await renderDetailPage("site-1");

    expect(screen.getByText("No activity logged yet for this Site.")).toBeInTheDocument();
  });

  it("renders mixed record types in one feed with type labels and amounts where present", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "site-1",
        name: "NH-48",
        location: "Nashik",
        status: "ACTIVE",
        contractReference: null,
        feed: [
          { id: "e1", type: "EXPENSE", occurredAt: "2026-08-12T18:00:00Z", summary: "Diesel refill", amount: 4200 },
          { id: "d1", type: "DSR", occurredAt: "2026-08-11T09:00:00Z", summary: "Daily Site Report submitted", amount: null },
        ],
      }),
    }) as unknown as typeof fetch;

    await renderDetailPage("site-1");

    expect(screen.getByText("Diesel refill")).toBeInTheDocument();
    expect(screen.getByText("Expense")).toBeInTheDocument();
    expect(screen.getByText("₹4,200")).toBeInTheDocument();
    expect(screen.getByText("Daily Site Report submitted")).toBeInTheDocument();
    expect(screen.getByText("DSR")).toBeInTheDocument();
  });

  it("renders an Edit Site link pointing to the edit route", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "site-1",
        name: "NH-48",
        location: "Nashik",
        status: "ACTIVE",
        contractReference: null,
        feed: [],
      }),
    }) as unknown as typeof fetch;

    await renderDetailPage("site-1");

    expect(screen.getByRole("link", { name: /Edit Site/ })).toHaveAttribute("href", "/sites/site-1/edit");
  });

  it("calls notFound() for a Site ID that doesn't exist, instead of crashing or showing an empty feed", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 }) as unknown as typeof fetch;

    await expect(renderDetailPage("missing-id")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalled();
  });
});
