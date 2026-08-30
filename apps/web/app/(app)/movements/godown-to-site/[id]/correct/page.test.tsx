import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const notFoundMock = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
);
vi.mock("next/navigation", () => ({ notFound: notFoundMock }));

import CorrectMovementPage from "./page";

const originalFetch = global.fetch;
const originalApiUrl = process.env.API_URL;

function mockFetchRouter(handlers: { movement?: unknown; movementStatus?: number; sites?: unknown; materials?: unknown }) {
  global.fetch = vi.fn((url: string) => {
    const urlStr = String(url);
    if (urlStr.includes("/movements/")) {
      return Promise.resolve({
        ok: (handlers.movementStatus ?? 200) < 400,
        status: handlers.movementStatus ?? 200,
        json: async () => handlers.movement,
      });
    }
    if (urlStr.includes("/team-members")) {
      return Promise.resolve({ ok: true, json: async () => [] });
    }
    if (urlStr.includes("/sites")) {
      return Promise.resolve({ ok: true, json: async () => handlers.sites ?? [] });
    }
    return Promise.resolve({ ok: true, json: async () => handlers.materials ?? [] });
  }) as unknown as typeof fetch;
}

beforeEach(() => {
  process.env.API_URL = "http://localhost:3001";
  notFoundMock.mockClear();
});

afterEach(() => {
  global.fetch = originalFetch;
  process.env.API_URL = originalApiUrl;
  vi.restoreAllMocks();
});

async function renderCorrectPage(id: string) {
  const element = await CorrectMovementPage({ params: Promise.resolve({ id }) });
  return render(element);
}

const movement = {
  id: "m1",
  destinationSiteId: "site1",
  vehicleDetails: null,
  personResponsible: null,
  notes: null,
  movedAt: "2026-08-10T00:00:00.000Z",
  materialSize: { id: "ms1" },
};

describe("CorrectMovementPage", () => {
  it("pre-fills the locked fields from the original Movement and shows the correction banner", async () => {
    mockFetchRouter({
      movement,
      sites: [{ id: "site1", name: "NH-48 Highway Widening" }],
      materials: [{ id: "m1", name: "TMT Steel", unit: { name: "kg" }, sizes: [{ id: "ms1", label: "12mm" }] }],
    });

    await renderCorrectPage("m1");

    expect(screen.getByText("Filing a correction")).toBeInTheDocument();
    expect(screen.getByLabelText("Movement Date")).toHaveValue("2026-08-10");
  });

  it("calls notFound() for a Movement ID that does not exist", async () => {
    mockFetchRouter({ movementStatus: 404, movement: undefined, sites: [], materials: [] });

    await expect(renderCorrectPage("missing-id")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalled();
  });

  it("Story 5.4: preserves kind and pre-fills the Source Site for a SITE_TO_SITE correction", async () => {
    mockFetchRouter({
      movement: {
        ...movement,
        kind: "SITE_TO_SITE",
        sourceSiteId: "site2",
      },
      sites: [
        { id: "site1", name: "NH-48 Highway Widening" },
        { id: "site2", name: "Sector 12 Metro Depot" },
      ],
      materials: [{ id: "m1", name: "TMT Steel", unit: { name: "kg" }, sizes: [{ id: "ms1", label: "12mm" }] }],
    });

    await renderCorrectPage("m1");

    expect(screen.getByLabelText("Source Site")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Submit Correction" })).toBeInTheDocument();
  });
});
