import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import NewSiteToSiteTransferPage from "./page";

async function renderPage() {
  const element = await NewSiteToSiteTransferPage();
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

function mockFetchRouter(handlers: { sites?: unknown; materials?: unknown }) {
  global.fetch = vi.fn((url: string) => {
    const urlStr = String(url);
    if (urlStr.includes("/sites")) {
      return Promise.resolve({ ok: true, json: async () => handlers.sites ?? [] });
    }
    return Promise.resolve({ ok: true, json: async () => handlers.materials ?? [] });
  }) as unknown as typeof fetch;
}

describe("NewSiteToSiteTransferPage", () => {
  it("renders a Source Site picker alongside the Destination Site picker (FR-11)", async () => {
    mockFetchRouter({
      sites: [
        { id: "site1", name: "NH-48 Highway Widening" },
        { id: "site2", name: "Sector 12 Metro Depot" },
      ],
      materials: [{ id: "m1", name: "TMT Steel", sizes: [{ id: "ms1", label: "12mm" }] }],
    });

    await renderPage();

    expect(screen.getByLabelText("Source Site")).toBeInTheDocument();
    expect(screen.getByLabelText("Destination Site")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Record Transfer" })).toBeInTheDocument();
  });
});
