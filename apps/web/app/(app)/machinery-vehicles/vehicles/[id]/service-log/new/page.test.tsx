import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const notFoundMock = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
);
vi.mock("next/navigation", () => ({ notFound: notFoundMock }));

import NewVehicleServiceLogPage from "./page";

const originalFetch = global.fetch;
const originalApiUrl = process.env.API_URL;

function mockFetch(overrides: { vehicle?: unknown; vehicleStatus?: number }) {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: (overrides.vehicleStatus ?? 200) < 400,
      status: overrides.vehicleStatus ?? 200,
      json: async () => overrides.vehicle,
    }),
  ) as unknown as typeof fetch;
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

async function renderPage(id: string) {
  const element = await NewVehicleServiceLogPage({ params: Promise.resolve({ id }) });
  return render(element);
}

describe("NewVehicleServiceLogPage", () => {
  it("renders the service log form scoped to this Vehicle, with a Kind field and a Log Entry submit", async () => {
    mockFetch({ vehicle: { id: "v1", number: "MH-12-AB-1234" } });

    await renderPage("v1");

    expect(screen.getByRole("heading", { name: /MH-12-AB-1234/ })).toBeInTheDocument();
    expect(screen.getByLabelText("Kind")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Log Entry" })).toBeInTheDocument();
  });

  it("calls notFound() for a Vehicle ID that does not exist", async () => {
    mockFetch({ vehicleStatus: 404, vehicle: undefined });

    await expect(renderPage("missing-id")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalled();
  });
});
