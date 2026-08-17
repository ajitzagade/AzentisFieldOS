import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const notFoundMock = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
);
vi.mock("next/navigation", () => ({ notFound: notFoundMock }));

import EditMachineryPage from "./page";

const originalFetch = global.fetch;
const originalApiUrl = process.env.API_URL;

function mockFetchRouter(handlers: { machinery?: unknown; machineryStatus?: number; machineryTypes?: unknown }) {
  global.fetch = vi.fn((url: string) => {
    const urlStr = String(url);
    if (urlStr.includes("/machinery/")) {
      return Promise.resolve({
        ok: (handlers.machineryStatus ?? 200) < 400,
        status: handlers.machineryStatus ?? 200,
        json: async () => handlers.machinery,
      });
    }
    return Promise.resolve({ ok: true, json: async () => handlers.machineryTypes ?? [] });
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

async function renderEditPage(id: string) {
  const element = await EditMachineryPage({ params: Promise.resolve({ id }) });
  return render(element);
}

describe("EditMachineryPage", () => {
  it("fetches the Machine by id via the dedicated detail endpoint and renders its edit form", async () => {
    mockFetchRouter({
      machinery: {
        id: "m1",
        name: "JCB 3DX",
        assetNumber: "AST-001",
        model: null,
        ownership: null,
        operator: null,
        currentStatus: "AVAILABLE",
        type: { id: "t1", name: "Excavator" },
        currentSite: null,
      },
      machineryTypes: [{ id: "t1", name: "Excavator" }],
    });

    await renderEditPage("m1");

    expect(screen.getByLabelText("Name")).toHaveValue("JCB 3DX");
  });

  it("calls notFound() for a Machine ID that does not exist", async () => {
    mockFetchRouter({ machineryStatus: 404, machinery: undefined, machineryTypes: [] });

    await expect(renderEditPage("missing-id")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalled();
  });
});
