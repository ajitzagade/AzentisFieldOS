import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const notFoundMock = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
);
vi.mock("next/navigation", () => ({ notFound: notFoundMock }));

import MoveVehiclePage from "./page";

const originalFetch = global.fetch;
const originalApiUrl = process.env.API_URL;

function mockFetchRouter(handlers: { vehicle?: unknown; vehicleStatus?: number; sites?: unknown }) {
  global.fetch = vi.fn((url: string) => {
    const urlStr = String(url);
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

async function renderMovePage(id: string) {
  const element = await MoveVehiclePage({ params: Promise.resolve({ id }) });
  return render(element);
}

describe("MoveVehiclePage", () => {
  it("renders the movement form with the Vehicle's number and available Sites", async () => {
    mockFetchRouter({
      vehicle: { id: "v1", number: "MH-12-AB-1234" },
      sites: [{ id: "site1", name: "Sector 12 Metro Depot" }],
    });

    await renderMovePage("v1");

    expect(screen.getByRole("heading", { name: /MH-12-AB-1234/ })).toBeInTheDocument();
    // SiteField is a searchable combobox — options render on demand.
    expect(screen.getByLabelText("Site")).toHaveAttribute("role", "combobox");
    expect(screen.getByRole("button", { name: "Record Movement" })).toBeInTheDocument();
  });

  it("calls notFound() for a Vehicle ID that does not exist", async () => {
    mockFetchRouter({ vehicleStatus: 404, vehicle: undefined, sites: [] });

    await expect(renderMovePage("missing-id")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalled();
  });
});
