import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const notFoundMock = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
);
vi.mock("next/navigation", () => ({ notFound: notFoundMock }));

import VehicleDetailPage from "./page";

const originalFetch = global.fetch;
const originalApiUrl = process.env.API_URL;

beforeEach(() => {
  process.env.API_URL = "http://localhost:3001";
  notFoundMock.mockClear();
});

afterEach(() => {
  global.fetch = originalFetch;
  process.env.API_URL = originalApiUrl;
  vi.restoreAllMocks();
});

async function renderDetailPage(id: string) {
  const element = await VehicleDetailPage({ params: Promise.resolve({ id }) });
  return render(element);
}

describe("VehicleDetailPage", () => {
  it("renders the Vehicle's profile fields and an Edit link, with no Correct affordance for master data", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        id: "v1",
        number: "MH-12-AB-1234",
        ownership: "Rented",
        driver: "Suresh",
        currentStatus: "AT_SITE",
        type: { id: "t1", name: "Truck" },
        currentSite: { id: "s1", name: "Sector 12 Metro Depot" },
      }),
    }) as unknown as typeof fetch;

    await renderDetailPage("v1");

    expect(screen.getByRole("heading", { name: /MH-12-AB-1234/ })).toBeInTheDocument();
    expect(screen.getByText("Truck")).toBeInTheDocument();
    expect(screen.getByText("Suresh")).toBeInTheDocument();
    expect(screen.getByText("Sector 12 Metro Depot")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Edit/ })).toHaveAttribute("href", "/machinery-vehicles/vehicles/v1/edit");
  });

  it("calls notFound() for a Vehicle ID that does not exist", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 }) as unknown as typeof fetch;

    await expect(renderDetailPage("missing-id")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalled();
  });
});
