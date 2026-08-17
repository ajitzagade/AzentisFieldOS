import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const notFoundMock = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
);
vi.mock("next/navigation", () => ({ notFound: notFoundMock }));

import CorrectMachineryMovementPage from "./page";

const originalFetch = global.fetch;
const originalApiUrl = process.env.API_URL;

function mockFetchRouter(handlers: {
  machinery?: unknown;
  machineryStatus?: number;
  sites?: unknown;
  movements?: unknown[];
}) {
  global.fetch = vi.fn((url: string) => {
    const urlStr = String(url);
    if (urlStr.includes("/asset-movements")) {
      return Promise.resolve({ ok: true, json: async () => handlers.movements ?? [] });
    }
    if (urlStr.includes("/sites")) {
      return Promise.resolve({ ok: true, json: async () => handlers.sites ?? [] });
    }
    return Promise.resolve({
      ok: (handlers.machineryStatus ?? 200) < 400,
      status: handlers.machineryStatus ?? 200,
      json: async () => handlers.machinery,
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

async function renderCorrectPage(id: string, movementId: string) {
  const element = await CorrectMachineryMovementPage({ params: Promise.resolve({ id, movementId }) });
  return render(element);
}

describe("CorrectMachineryMovementPage", () => {
  it("pre-fills Move To/Site/Date from the Movement being corrected and shows the correction banner", async () => {
    mockFetchRouter({
      machinery: { id: "m1", name: "JCB 3DX" },
      sites: [{ id: "site1", name: "NH-48 Highway Widening" }],
      movements: [{ id: "log1", toStatus: "AT_SITE", siteId: "site1", movedAt: "2026-08-10T00:00:00.000Z" }],
    });

    await renderCorrectPage("m1", "log1");

    expect(screen.getByText("Filing a correction")).toBeInTheDocument();
    expect(screen.getByLabelText("Movement Date")).toHaveValue("2026-08-10");
  });

  it("calls notFound() for a Machine ID that does not exist", async () => {
    mockFetchRouter({ machineryStatus: 404, machinery: undefined, sites: [], movements: [] });

    await expect(renderCorrectPage("missing-id", "log1")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalled();
  });

  it("calls notFound() for a Movement ID that does not belong to this Machine's history", async () => {
    mockFetchRouter({
      machinery: { id: "m1", name: "JCB 3DX" },
      sites: [],
      movements: [{ id: "log1", toStatus: "AT_SITE", siteId: "site1", movedAt: "2026-08-10T00:00:00.000Z" }],
    });

    await expect(renderCorrectPage("m1", "missing-log")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalled();
  });
});
