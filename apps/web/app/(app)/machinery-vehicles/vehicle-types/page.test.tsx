import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import VehicleTypesPage from "./page";

async function renderVehicleTypesPage() {
  const element = await VehicleTypesPage();
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

describe("VehicleTypesPage", () => {
  it("renders every Vehicle Type", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        { id: "t1", name: "Truck", isActive: true },
        { id: "t2", name: "Dumper", isActive: true },
      ],
    }) as unknown as typeof fetch;

    await renderVehicleTypesPage();

    expect(screen.getByText("Truck")).toBeInTheDocument();
    expect(screen.getByText("Dumper")).toBeInTheDocument();
  });

  it("renders the empty state when there are zero Vehicle Types", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => [] }) as unknown as typeof fetch;

    await renderVehicleTypesPage();

    expect(screen.getByText("No Vehicle Types yet.")).toBeInTheDocument();
  });
});
