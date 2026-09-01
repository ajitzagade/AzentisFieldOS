import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import NewVendorToSitePurchasePage from "./page";

async function renderPage() {
  const element = await NewVendorToSitePurchasePage();
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

function mockFetchRouter(handlers: { sites?: unknown; materials?: unknown; vendors?: unknown }) {
  global.fetch = vi.fn((url: string) => {
    const urlStr = String(url);
    if (urlStr.includes("/team-members")) {
      return Promise.resolve({ ok: true, json: async () => [] });
    }
    if (urlStr.includes("/sites")) {
      return Promise.resolve({ ok: true, json: async () => handlers.sites ?? [] });
    }
    if (urlStr.includes("/vendors")) {
      return Promise.resolve({ ok: true, json: async () => handlers.vendors ?? [] });
    }
    return Promise.resolve({ ok: true, json: async () => handlers.materials ?? [] });
  }) as unknown as typeof fetch;
}

describe("NewVendorToSitePurchasePage", () => {
  it("skips the destination toggle and shows the Site picker up front (FR-10)", async () => {
    mockFetchRouter({
      sites: [{ id: "site1", name: "NH-48 Highway Widening" }],
      materials: [{ id: "m1", name: "Cement", unit: { name: "bags" }, sizes: [{ id: "ms1", label: "OPC 53 Grade" }] }],
    });

    await renderPage();

    expect(screen.queryByLabelText("Destination")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Site")).toBeInTheDocument();
    // SiteField is a searchable combobox — options render on demand; the
    // labelled combobox itself proves the Site picker is wired.
    expect(screen.getByLabelText("Site")).toHaveAttribute("role", "combobox");
  });
});
