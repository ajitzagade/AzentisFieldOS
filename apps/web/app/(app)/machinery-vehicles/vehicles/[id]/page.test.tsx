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

const vehicle = {
  id: "v1",
  number: "MH-12-AB-1234",
  ownership: "Rented",
  driver: "Suresh",
  currentStatus: "AT_SITE",
  type: { id: "t1", name: "Truck" },
  currentSite: { id: "s1", name: "Sector 12 Metro Depot" },
};

function mockFetch(overrides: {
  vehicle?: unknown;
  vehicleStatus?: number;
  movements?: unknown[];
  serviceLogs?: unknown[];
}) {
  const vehicleStatus = overrides.vehicleStatus ?? 200;
  const vehicleBody = overrides.vehicle ?? vehicle;
  const movements = overrides.movements ?? [];
  const serviceLogs = overrides.serviceLogs ?? [];

  global.fetch = vi.fn(async (url: string | URL | Request) => {
    const href = typeof url === "string" ? url : url.toString();
    if (href.includes("/asset-movements")) {
      return { ok: true, json: async () => movements } as Response;
    }
    if (href.includes("/asset-service-logs")) {
      return { ok: true, json: async () => serviceLogs } as Response;
    }
    if (vehicleStatus === 404) {
      return { ok: false, status: 404 } as Response;
    }
    return { ok: true, status: 200, json: async () => vehicleBody } as Response;
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

async function renderDetailPage(id: string) {
  const element = await VehicleDetailPage({ params: Promise.resolve({ id }) });
  return render(element);
}

describe("VehicleDetailPage", () => {
  it("renders the Vehicle's profile fields and an Edit link, with no Correct affordance for master data", async () => {
    mockFetch({});

    await renderDetailPage("v1");

    expect(screen.getByRole("heading", { name: /MH-12-AB-1234/ })).toBeInTheDocument();
    expect(screen.getByText("Truck")).toBeInTheDocument();
    expect(screen.getByText("Suresh")).toBeInTheDocument();
    expect(screen.getByText("Sector 12 Metro Depot")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Edit/ })).toHaveAttribute("href", "/machinery-vehicles/vehicles/v1/edit");
    expect(screen.getByRole("link", { name: /Record Movement/ })).toHaveAttribute("href", "/machinery-vehicles/vehicles/v1/move");
  });

  it("calls notFound() for a Vehicle ID that does not exist", async () => {
    mockFetch({ vehicleStatus: 404 });

    await expect(renderDetailPage("missing-id")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalled();
  });

  it("renders an empty Movement History message when no Movement has been recorded yet", async () => {
    mockFetch({ movements: [] });

    await renderDetailPage("v1");

    expect(screen.getByText("No Movements recorded yet.")).toBeInTheDocument();
  });

  it("renders every prior Movement in reverse-chronological order, never overwritten to show only the latest state (AC #2), with a Current badge and Correct action on the latest entry", async () => {
    mockFetch({
      movements: [
        { id: "log2", toStatus: "AVAILABLE", site: null, movedAt: "2026-08-01" },
        { id: "log1", toStatus: "AT_SITE", site: { id: "s1", name: "Sector 12 Metro Depot" }, movedAt: "2026-07-20" },
      ],
    });

    await renderDetailPage("v1");

    expect(screen.getByText("Available")).toBeInTheDocument();
    expect(screen.getByText("Recorded at Sector 12 Metro Depot")).toBeInTheDocument();
    expect(screen.getByText("Current")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Correct" })).toHaveLength(2);
    expect(screen.getAllByRole("link", { name: "Correct" })[0]).toHaveAttribute(
      "href",
      "/machinery-vehicles/vehicles/v1/movements/log2/correct",
    );
  });

  it("renders a Log Service link and an empty Service History message when no entries exist yet", async () => {
    mockFetch({ serviceLogs: [] });

    await renderDetailPage("v1");

    expect(screen.getByRole("link", { name: /Log Service/ })).toHaveAttribute(
      "href",
      "/machinery-vehicles/vehicles/v1/service-log/new",
    );
    expect(screen.getAllByText("No fuel, maintenance, or repair entries logged yet.")).toHaveLength(2);
  });

  it("renders every logged fuel/maintenance/repair entry with a normal Edit action, not Correct (AC #1, #2)", async () => {
    mockFetch({
      serviceLogs: [{ id: "sl1", kind: "MAINTENANCE", notes: "Oil change", cost: "800", serviceDate: "2026-08-05" }],
    });

    await renderDetailPage("v1");

    expect(screen.getAllByText("Oil change")).toHaveLength(2);
    expect(screen.getAllByText("Maintenance")).toHaveLength(2);
    const serviceLogEditLinks = screen
      .getAllByRole("link", { name: "Edit" })
      .filter((link) => link.getAttribute("href")?.includes("/service-log/"));
    expect(serviceLogEditLinks).toHaveLength(2);
    for (const link of serviceLogEditLinks) {
      expect(link).toHaveAttribute("href", "/machinery-vehicles/vehicles/v1/service-log/sl1/edit");
    }
  });
});
