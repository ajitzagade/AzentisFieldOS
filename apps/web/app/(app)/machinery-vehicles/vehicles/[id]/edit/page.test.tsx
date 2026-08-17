import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const notFoundMock = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
);
vi.mock("next/navigation", () => ({ notFound: notFoundMock }));

import EditVehiclePage from "./page";

const originalFetch = global.fetch;
const originalApiUrl = process.env.API_URL;

function mockFetchRouter(handlers: { vehicle?: unknown; vehicleStatus?: number; vehicleTypes?: unknown }) {
  global.fetch = vi.fn((url: string) => {
    const urlStr = String(url);
    if (urlStr.includes("/vehicles/")) {
      return Promise.resolve({
        ok: (handlers.vehicleStatus ?? 200) < 400,
        status: handlers.vehicleStatus ?? 200,
        json: async () => handlers.vehicle,
      });
    }
    return Promise.resolve({ ok: true, json: async () => handlers.vehicleTypes ?? [] });
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

async function renderEditPage(id: string) {
  const element = await EditVehiclePage({ params: Promise.resolve({ id }) });
  return render(element);
}

describe("EditVehiclePage", () => {
  it("fetches the Vehicle by id via the dedicated detail endpoint and renders its edit form", async () => {
    mockFetchRouter({
      vehicle: {
        id: "v1",
        number: "MH-12-AB-1234",
        ownership: null,
        driver: null,
        currentStatus: "AVAILABLE",
        type: { id: "t1", name: "Truck" },
        currentSite: null,
      },
      vehicleTypes: [{ id: "t1", name: "Truck" }],
    });

    await renderEditPage("v1");

    expect(screen.getByLabelText("Number")).toHaveValue("MH-12-AB-1234");
  });

  it("calls notFound() for a Vehicle ID that does not exist", async () => {
    mockFetchRouter({ vehicleStatus: 404, vehicle: undefined, vehicleTypes: [] });

    await expect(renderEditPage("missing-id")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalled();
  });
});
