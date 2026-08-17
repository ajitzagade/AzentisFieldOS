import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const notFoundMock = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
);
vi.mock("next/navigation", () => ({ notFound: notFoundMock }));

import EditVehicleServiceLogPage from "./page";

const originalFetch = global.fetch;
const originalApiUrl = process.env.API_URL;

function mockFetch(overrides: { vehicle?: unknown; vehicleStatus?: number; logs?: unknown[] }) {
  global.fetch = vi.fn((url: string) => {
    const urlStr = String(url);
    if (urlStr.includes("/asset-service-logs")) {
      return Promise.resolve({ ok: true, json: async () => overrides.logs ?? [] });
    }
    return Promise.resolve({
      ok: (overrides.vehicleStatus ?? 200) < 400,
      status: overrides.vehicleStatus ?? 200,
      json: async () => overrides.vehicle,
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

async function renderPage(id: string, logId: string) {
  const element = await EditVehicleServiceLogPage({ params: Promise.resolve({ id, logId }) });
  return render(element);
}

const vehicle = { id: "v1", number: "MH-12-AB-1234" };
const log = { id: "sl1", kind: "MAINTENANCE", notes: "Oil change", cost: "800", serviceDate: "2026-08-05" };

describe("EditVehicleServiceLogPage", () => {
  it("renders the form pre-filled with the entry's current values (AC #2 — a normal Edit, not a correction)", async () => {
    mockFetch({ vehicle, logs: [log] });

    await renderPage("v1", "sl1");

    expect(screen.getByRole("heading", { name: /MH-12-AB-1234/ })).toBeInTheDocument();
    expect(screen.getByDisplayValue("Oil change")).toBeInTheDocument();
    expect(screen.getByDisplayValue("800")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save Changes" })).toBeInTheDocument();
  });

  it("calls notFound() for a Vehicle ID that does not exist", async () => {
    mockFetch({ vehicleStatus: 404, vehicle: undefined, logs: [] });

    await expect(renderPage("missing-id", "sl1")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalled();
  });

  it("calls notFound() when the Service Log entry does not exist in this Vehicle's history", async () => {
    mockFetch({ vehicle, logs: [] });

    await expect(renderPage("v1", "missing-log")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalled();
  });
});
