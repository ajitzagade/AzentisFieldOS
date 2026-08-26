import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import NewVehiclePage from "./page";

async function renderNewVehiclePage() {
  const element = await NewVehiclePage();
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

describe("NewVehiclePage", () => {
  it("lists active Vehicle Types in the Type picker", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        { id: "t1", name: "Truck", isActive: true },
        { id: "t2", name: "Dumper", isActive: true },
      ],
    }) as unknown as typeof fetch;

    await renderNewVehiclePage();

    expect(screen.getByRole("option", { name: "Truck" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Dumper" })).toBeInTheDocument();
  });

  // Story 14.3 (AC #1): a disabled Vehicle Type never appears in the picker.
  it("omits a disabled Vehicle Type from the Type picker", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        { id: "t1", name: "Truck", isActive: true },
        { id: "t2", name: "Retired Tempo", isActive: false },
      ],
    }) as unknown as typeof fetch;

    await renderNewVehiclePage();

    expect(screen.getByRole("option", { name: "Truck" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Retired Tempo" })).not.toBeInTheDocument();
  });
});
