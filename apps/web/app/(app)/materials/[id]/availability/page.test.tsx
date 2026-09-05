import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const notFoundMock = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
);
vi.mock("next/navigation", () => ({ notFound: notFoundMock }));

import MaterialAvailabilityPage from "./page";

const originalFetch = global.fetch;
const originalApiUrl = process.env.API_URL;

beforeEach(() => {
  process.env.API_URL = "http://localhost:3001";
  notFoundMock.mockClear();
});

afterEach(() => {
  global.fetch = originalFetch;
  process.env.API_URL = originalApiUrl;
});

const cementMaterial = {
  id: "mat-1",
  name: "Cement",
  unit: { name: "Bags" },
  sizes: [{ id: "ms1", label: "50kg" }],
};

function mockFetchRouter(data: { materials?: unknown; stock?: unknown }) {
  return vi.fn((url: string | URL | Request) => {
    const urlStr = String(url);
    const respond = (body: unknown, ok = true, status = 200) =>
      Promise.resolve({ ok, status, json: async () => body } as Response);
    if (urlStr.includes("/stock/material/")) return respond(data.stock ?? []);
    if (urlStr.includes("/materials")) return respond(data.materials ?? []);
    return respond([]);
  }) as unknown as typeof fetch;
}

async function renderPage(id: string) {
  const element = await MaterialAvailabilityPage({ params: Promise.resolve({ id }) });
  render(element);
}

describe("MaterialAvailabilityPage", () => {
  it("renders the Material's name in the header", async () => {
    global.fetch = mockFetchRouter({ materials: [cementMaterial], stock: [] });

    await renderPage("mat-1");

    expect(screen.getByRole("heading", { name: /Cement/ })).toBeInTheDocument();
  });

  it("calls notFound() for a Material ID that doesn't exist", async () => {
    global.fetch = mockFetchRouter({ materials: [cementMaterial], stock: [] });

    await expect(renderPage("missing-id")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalled();
  });

  it("shows an honest empty state when the Material has zero stock anywhere (AC #6)", async () => {
    global.fetch = mockFetchRouter({ materials: [cementMaterial], stock: [] });

    await renderPage("mat-1");

    // Rendered once in the md+ table's empty panel and once in the
    // below-md mobile card's empty panel.
    expect(screen.getAllByText("Not currently in stock at any location")).toHaveLength(2);
  });

  it("renders a Godown row with quantity/unit and a Transfer link to the Godown→Site form", async () => {
    global.fetch = mockFetchRouter({
      materials: [cementMaterial],
      stock: [
        { location: { kind: "godown" }, materialSizeId: "ms1", sizeLabel: "50kg", quantity: "40", unit: "Bags" },
      ],
    });

    await renderPage("mat-1");

    // Rendered once in the md+ table and once in the below-md mobile card.
    expect(screen.getAllByText("Godown")).toHaveLength(2);
    expect(screen.getAllByText("50kg")).toHaveLength(2);
    expect(screen.getAllByText("40 Bags")).toHaveLength(2);
    expect(screen.getByRole("link", { name: /Transfer from here/ })).toHaveAttribute(
      "href",
      "/movements/godown-to-site/new?materialSizeId=ms1",
    );
  });

  it("renders a Site row with a Transfer link to the Site→Site form carrying the source Site", async () => {
    global.fetch = mockFetchRouter({
      materials: [cementMaterial],
      stock: [
        {
          location: { kind: "site", id: "site-1", name: "Nashik Metro" },
          materialSizeId: "ms1",
          sizeLabel: "50kg",
          quantity: "120",
          unit: "Bags",
        },
      ],
    });

    await renderPage("mat-1");

    // Rendered once in the md+ table and once in the below-md mobile card.
    expect(screen.getAllByText("Nashik Metro")).toHaveLength(2);
    expect(screen.getByRole("link", { name: /Transfer from here/ })).toHaveAttribute(
      "href",
      "/movements/site-to-site/new?materialSizeId=ms1&sourceSiteId=site-1",
    );
  });

  it("fetches the Material and its stock concurrently rather than one after the other", async () => {
    let resolveMaterials!: (value: Response) => void;
    const materialsPromise = new Promise<Response>((resolve) => {
      resolveMaterials = resolve;
    });
    const stockFetch = vi.fn();

    global.fetch = vi.fn((url: string | URL | Request) => {
      const urlStr = String(url);
      if (urlStr.includes("/stock/material/")) {
        stockFetch();
        return Promise.resolve({ ok: true, status: 200, json: async () => [] } as Response);
      }
      return materialsPromise;
    }) as unknown as typeof fetch;

    const pagePromise = renderPage("mat-1");

    // The stock fetch must already have fired even though the Materials
    // fetch hasn't resolved yet — proves the two run in parallel, not
    // sequentially gated on `material` being resolved first.
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(stockFetch).toHaveBeenCalled();

    resolveMaterials({ ok: true, status: 200, json: async () => [cementMaterial] } as Response);
    await pagePromise;
  });
});
