import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import MachineryVehiclesPage from "./page";

vi.mock("next/navigation", () => ({
  usePathname: () => "/machinery-vehicles",
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ replace: vi.fn() }),
}));

async function renderMachineryVehiclesPage() {
  const element = await MachineryVehiclesPage({ searchParams: Promise.resolve({}) });
  render(element);
}

const originalFetch = global.fetch;
const originalApiUrl = process.env.API_URL;

function mockFetch(machinery: unknown[], vehicles: unknown[]) {
  global.fetch = vi.fn(async (url: string | URL | Request) => {
    const href = typeof url === "string" ? url : url.toString();
    if (href.includes("/vehicles?")) {
      return { ok: true, json: async () => ({ rows: vehicles, total: vehicles.length, page: 1, pageSize: 25 }) } as Response;
    }
    return { ok: true, json: async () => ({ rows: machinery, total: machinery.length, page: 1, pageSize: 25 }) } as Response;
  }) as unknown as typeof fetch;
}

beforeEach(() => {
  process.env.API_URL = "http://localhost:3001";
});

afterEach(() => {
  global.fetch = originalFetch;
  process.env.API_URL = originalApiUrl;
  vi.restoreAllMocks();
});

describe("MachineryVehiclesPage", () => {
  it("renders Machinery rows (Name/Type/Asset #/Current Site/Status) linking to the detail route, with a Correct action on the latest Movement", async () => {
    mockFetch(
      [
        {
          id: "m1",
          name: "JCB 3DX",
          assetNumber: "AST-001",
          currentStatus: "AT_SITE",
          type: { id: "t1", name: "Excavator" },
          currentSite: { id: "s1", name: "NH-48 Highway Widening" },
          movementLogs: [{ id: "log1" }],
        },
      ],
      [],
    );

    await renderMachineryVehiclesPage();

    expect(screen.getAllByText("JCB 3DX")).toHaveLength(2);
    expect(screen.getAllByText("Excavator")).toHaveLength(2);
    expect(screen.getAllByText("AST-001")).toHaveLength(2);
    expect(screen.getAllByText("NH-48 Highway Widening")).toHaveLength(2);
    expect(screen.getAllByText("In Use")).toHaveLength(2);
    for (const link of screen.getAllByRole("link", { name: "JCB 3DX" })) {
      expect(link).toHaveAttribute("href", "/machinery-vehicles/machinery/m1");
    }
    for (const link of screen.getAllByRole("link", { name: "Correct" })) {
      expect(link).toHaveAttribute("href", "/machinery-vehicles/machinery/m1/movements/log1/correct");
    }
  });

  it("omits the Correct action for a Machine with no Movement history yet", async () => {
    mockFetch(
      [
        {
          id: "m1",
          name: "Concrete Mixer",
          assetNumber: "AST-014",
          currentStatus: "AVAILABLE",
          type: { id: "t1", name: "Mixer" },
          currentSite: null,
          movementLogs: [],
        },
      ],
      [],
    );

    await renderMachineryVehiclesPage();

    expect(screen.queryByRole("link", { name: "Correct" })).not.toBeInTheDocument();
  });

  it("renders Vehicle rows (Number/Type/Driver/Current Site-Usage/Status) linking to the detail route", async () => {
    mockFetch(
      [],
      [
        {
          id: "v1",
          number: "MH-12-AB-1234",
          driver: "Suresh",
          currentStatus: "AVAILABLE",
          type: { id: "t1", name: "Truck" },
          currentSite: null,
          movementLogs: [],
        },
      ],
    );

    await renderMachineryVehiclesPage();

    expect(screen.getAllByText("MH-12-AB-1234")).toHaveLength(2);
    expect(screen.getAllByText("Suresh")).toHaveLength(2);
    expect(screen.getAllByText("Available")).toHaveLength(2);
    for (const link of screen.getAllByRole("link", { name: "MH-12-AB-1234" })) {
      expect(link).toHaveAttribute("href", "/machinery-vehicles/vehicles/v1");
    }
  });

  it("renders empty states with add-first actions when both registers are empty", async () => {
    mockFetch([], []);

    await renderMachineryVehiclesPage();

    expect(screen.getAllByText("No Machinery registered yet.")).toHaveLength(2);
    expect(screen.getAllByText("No Vehicles registered yet.")).toHaveLength(2);
    for (const link of screen.getAllByRole("link", { name: /Register your first Machine/ })) {
      expect(link).toHaveAttribute("href", "/machinery-vehicles/machinery/new");
    }
    for (const link of screen.getAllByRole("link", { name: /Register your first Vehicle/ })) {
      expect(link).toHaveAttribute("href", "/machinery-vehicles/vehicles/new");
    }
  });

  it("links the header actions and section links to the new/types routes", async () => {
    mockFetch([], []);

    await renderMachineryVehiclesPage();

    expect(screen.getByRole("link", { name: /Add Machine/ })).toHaveAttribute("href", "/machinery-vehicles/machinery/new");
    expect(screen.getByRole("link", { name: /Add Vehicle/ })).toHaveAttribute("href", "/machinery-vehicles/vehicles/new");
    expect(screen.getByRole("link", { name: "Manage Machinery Types" })).toHaveAttribute(
      "href",
      "/machinery-vehicles/machinery-types",
    );
    expect(screen.getByRole("link", { name: "Manage Vehicle Types" })).toHaveAttribute(
      "href",
      "/machinery-vehicles/vehicle-types",
    );
  });
});
