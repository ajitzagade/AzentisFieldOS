import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const notFoundMock = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
);
vi.mock("next/navigation", () => ({ notFound: notFoundMock }));

import CorrectVehicleMovementPage from "./page";

const originalFetch = global.fetch;
const originalApiUrl = process.env.API_URL;

function mockFetchRouter(handlers: {
  vehicle?: unknown;
  vehicleStatus?: number;
  sites?: unknown;
  movements?: unknown[];
}) {
  global.fetch = vi.fn((url: string) => {
    const urlStr = String(url);
    if (urlStr.includes("/asset-movements")) {
      return Promise.resolve({ ok: true, json: async () => handlers.movements ?? [] });
    }
    if (urlStr.includes("/sites")) {
      return Promise.resolve({ ok: true, json: async () => handlers.sites ?? [] });
    }
    return Promise.resolve({
      ok: (handlers.vehicleStatus ?? 200) < 400,
      status: handlers.vehicleStatus ?? 200,
      json: async () => handlers.vehicle,
    });
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

async function renderCorrectPage(id: string, movementId: string) {
  const element = await CorrectVehicleMovementPage({ params: Promise.resolve({ id, movementId }) });
  return render(element);
}

describe("CorrectVehicleMovementPage", () => {
  it("pre-fills Move To/Site/Date from the Movement being corrected and shows the correction banner", async () => {
    mockFetchRouter({
      vehicle: { id: "v1", number: "MH-12-AB-1234" },
      sites: [{ id: "site1", name: "Sector 12 Metro Depot" }],
      movements: [{ id: "log1", toStatus: "AT_SITE", siteId: "site1", movedAt: "2026-08-10T00:00:00.000Z" }],
    });

    await renderCorrectPage("v1", "log1");

    expect(screen.getByText("Filing a correction")).toBeInTheDocument();
    expect(screen.getByLabelText("Movement Date")).toHaveValue("2026-08-10");
  });

  it("calls notFound() for a Vehicle ID that does not exist", async () => {
    mockFetchRouter({ vehicleStatus: 404, vehicle: undefined, sites: [], movements: [] });

    await expect(renderCorrectPage("missing-id", "log1")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalled();
  });

  it("calls notFound() for a Movement ID that does not belong to this Vehicle's history", async () => {
    mockFetchRouter({
      vehicle: { id: "v1", number: "MH-12-AB-1234" },
      sites: [],
      movements: [{ id: "log1", toStatus: "AT_SITE", siteId: "site1", movedAt: "2026-08-10T00:00:00.000Z" }],
    });

    await expect(renderCorrectPage("v1", "missing-log")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalled();
  });
});
