import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const notFoundMock = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
);
vi.mock("next/navigation", () => ({ notFound: notFoundMock }));

import EditMachineryServiceLogPage from "./page";

const originalFetch = global.fetch;
const originalApiUrl = process.env.API_URL;

function mockFetch(overrides: { machinery?: unknown; machineryStatus?: number; logs?: unknown[] }) {
  global.fetch = vi.fn((url: string) => {
    const urlStr = String(url);
    if (urlStr.includes("/asset-service-logs")) {
      return Promise.resolve({ ok: true, json: async () => overrides.logs ?? [] });
    }
    return Promise.resolve({
      ok: (overrides.machineryStatus ?? 200) < 400,
      status: overrides.machineryStatus ?? 200,
      json: async () => overrides.machinery,
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
  const element = await EditMachineryServiceLogPage({ params: Promise.resolve({ id, logId }) });
  return render(element);
}

const machinery = { id: "m1", name: "JCB 3DX" };
const log = { id: "sl1", kind: "REPAIR", notes: "Hydraulic leak fixed", cost: "2200", serviceDate: "2026-08-01" };

describe("EditMachineryServiceLogPage", () => {
  it("renders the form pre-filled with the entry's current values (AC #2 — a normal Edit, not a correction)", async () => {
    mockFetch({ machinery, logs: [log] });

    await renderPage("m1", "sl1");

    expect(screen.getByRole("heading", { name: /JCB 3DX/ })).toBeInTheDocument();
    expect(screen.getByDisplayValue("Hydraulic leak fixed")).toBeInTheDocument();
    expect(screen.getByDisplayValue("2200")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save Changes" })).toBeInTheDocument();
  });

  it("calls notFound() for a Machine ID that does not exist", async () => {
    mockFetch({ machineryStatus: 404, machinery: undefined, logs: [] });

    await expect(renderPage("missing-id", "sl1")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalled();
  });

  it("calls notFound() when the Service Log entry does not exist in this Machine's history", async () => {
    mockFetch({ machinery, logs: [] });

    await expect(renderPage("m1", "missing-log")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalled();
  });
});
