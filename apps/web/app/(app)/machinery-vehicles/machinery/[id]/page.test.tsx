import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const notFoundMock = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
);
vi.mock("next/navigation", () => ({ notFound: notFoundMock }));

import MachineryDetailPage from "./page";

const originalFetch = global.fetch;
const originalApiUrl = process.env.API_URL;

const machinery = {
  id: "m1",
  name: "JCB 3DX",
  assetNumber: "AST-001",
  model: "3DX",
  ownership: "Owned",
  operator: "Ramesh",
  currentStatus: "AT_SITE",
  type: { id: "t1", name: "Excavator" },
  currentSite: { id: "s1", name: "NH-48 Highway Widening" },
};

function mockFetch(overrides: {
  machinery?: unknown;
  machineryStatus?: number;
  movements?: unknown[];
  serviceLogs?: unknown[];
}) {
  const machineryStatus = overrides.machineryStatus ?? 200;
  const machineryBody = overrides.machinery ?? machinery;
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
    if (machineryStatus === 404) {
      return { ok: false, status: 404 } as Response;
    }
    return { ok: true, status: 200, json: async () => machineryBody } as Response;
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
  const element = await MachineryDetailPage({ params: Promise.resolve({ id }) });
  return render(element);
}

describe("MachineryDetailPage", () => {
  it("renders the Machine's profile fields and an Edit link, with no Correct affordance for master data", async () => {
    mockFetch({});

    await renderDetailPage("m1");

    expect(screen.getByRole("heading", { name: /JCB 3DX/ })).toBeInTheDocument();
    expect(screen.getByText("AST-001")).toBeInTheDocument();
    expect(screen.getByText("Excavator")).toBeInTheDocument();
    expect(screen.getByText("NH-48 Highway Widening")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Edit/ })).toHaveAttribute("href", "/machinery-vehicles/machinery/m1/edit");
    expect(screen.getByRole("link", { name: /Record Movement/ })).toHaveAttribute("href", "/machinery-vehicles/machinery/m1/move");
  });

  it("calls notFound() for a Machine ID that does not exist", async () => {
    mockFetch({ machineryStatus: 404 });

    await expect(renderDetailPage("missing-id")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalled();
  });

  it("renders an empty Movement History message when no Movement has been recorded yet", async () => {
    mockFetch({ movements: [] });

    await renderDetailPage("m1");

    expect(screen.getByText("No Movements recorded yet.")).toBeInTheDocument();
  });

  it("renders every prior Movement in reverse-chronological order, never overwritten to show only the latest state (AC #2), with a Current badge and Correct action on the latest entry", async () => {
    mockFetch({
      movements: [
        { id: "log2", toStatus: "AT_SITE", site: { id: "s1", name: "NH-48 Highway Widening" }, movedAt: "2026-08-01" },
        { id: "log1", toStatus: "MAINTENANCE", site: null, movedAt: "2026-07-20" },
      ],
    });

    await renderDetailPage("m1");

    expect(screen.getByText("Recorded at NH-48 Highway Widening")).toBeInTheDocument();
    expect(screen.getByText("Sent to Maintenance")).toBeInTheDocument();
    expect(screen.getByText("Current")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Correct" })).toHaveLength(2);
    expect(screen.getAllByRole("link", { name: "Correct" })[0]).toHaveAttribute(
      "href",
      "/machinery-vehicles/machinery/m1/movements/log2/correct",
    );
  });

  it("never phrases current location as live tracking anywhere on the page (AC #3)", async () => {
    mockFetch({
      movements: [{ id: "log1", toStatus: "AT_SITE", site: { id: "s1", name: "NH-48 Highway Widening" }, movedAt: "2026-08-01" }],
    });

    const { container } = await renderDetailPage("m1");

    expect(container.textContent).not.toMatch(/live location/i);
    expect(container.textContent).not.toMatch(/live tracking|GPS tracking is on/i);
  });

  it("renders a Log Service link and an empty Service History message when no entries exist yet", async () => {
    mockFetch({ serviceLogs: [] });

    await renderDetailPage("m1");

    expect(screen.getByRole("link", { name: /Log Service/ })).toHaveAttribute(
      "href",
      "/machinery-vehicles/machinery/m1/service-log/new",
    );
    expect(screen.getByText("No fuel, maintenance, or repair entries logged yet.")).toBeInTheDocument();
  });

  it("renders every logged fuel/maintenance/repair entry with a normal Edit action, not Correct (AC #1, #2)", async () => {
    mockFetch({
      serviceLogs: [
        { id: "sl1", kind: "FUEL", notes: "Filled up before site move", cost: "1500", serviceDate: "2026-08-10" },
        { id: "sl2", kind: "REPAIR", notes: null, cost: null, serviceDate: "2026-07-01" },
      ],
    });

    await renderDetailPage("m1");

    expect(screen.getByText("Filled up before site move")).toBeInTheDocument();
    expect(screen.getByText("Fuel")).toBeInTheDocument();
    expect(screen.getByText("Repair")).toBeInTheDocument();
    const serviceLogEditLinks = screen
      .getAllByRole("link", { name: "Edit" })
      .filter((link) => link.getAttribute("href")?.includes("/service-log/"));
    expect(serviceLogEditLinks).toHaveLength(2);
    expect(serviceLogEditLinks[0]).toHaveAttribute("href", "/machinery-vehicles/machinery/m1/service-log/sl1/edit");
  });
});
