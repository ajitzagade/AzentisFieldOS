import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import NewSiteToSiteTransferPage from "./page";

async function renderPage(searchParams?: Record<string, string>) {
  const element = await NewSiteToSiteTransferPage({ searchParams: Promise.resolve(searchParams ?? {}) });
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
    if (urlStr.includes("/team-members")) {
      return Promise.resolve({ ok: true, json: async () => [] });
    }
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
      materials: [{ id: "m1", name: "TMT Steel", unit: { name: "kg" }, sizes: [{ id: "ms1", label: "12mm" }] }],
    });

    await renderPage();

    expect(screen.getByLabelText("Source Site")).toBeInTheDocument();
    expect(screen.getByLabelText("Destination Site")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Record Transfer" })).toBeInTheDocument();
  });

  it("prefills the Material/Size and Source Site from ?materialSizeId=/?sourceSiteId= (Story 16.3)", async () => {
    mockFetchRouter({
      sites: [
        { id: "site1", name: "NH-48 Highway Widening" },
        { id: "site2", name: "Sector 12 Metro Depot" },
      ],
      materials: [
        {
          id: "m1",
          name: "RCC Pipe",
          unit: { name: "Pcs" },
          sizes: [
            { id: "ms1", label: "300mm" },
            { id: "ms2", label: "450mm" },
          ],
        },
      ],
    });

    await renderPage({ materialSizeId: "ms2", sourceSiteId: "site1" });

    expect(document.querySelector('input[name="materialSizeId"]')).toHaveValue("ms2");
    expect(screen.getByLabelText("Source Site")).toHaveValue("site1");
  });

  it("ignores an unrecognized ?materialSizeId=/?sourceSiteId= rather than crashing", async () => {
    mockFetchRouter({
      sites: [{ id: "site1", name: "NH-48 Highway Widening" }],
      materials: [{ id: "m1", name: "TMT Steel", unit: { name: "kg" }, sizes: [{ id: "ms1", label: "12mm" }] }],
    });

    await renderPage({ materialSizeId: "does-not-exist", sourceSiteId: "does-not-exist" });

    expect(document.querySelector('input[name="materialSizeId"]')).toHaveValue("");
    expect(screen.getByLabelText("Source Site")).toHaveValue("");
  });
});
