import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const notFoundMock = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
);
vi.mock("next/navigation", () => ({ notFound: notFoundMock }));

import MoveMachineryPage from "./page";

const originalFetch = global.fetch;
const originalApiUrl = process.env.API_URL;

function mockFetchRouter(handlers: { machinery?: unknown; machineryStatus?: number; sites?: unknown }) {
  global.fetch = vi.fn((url: string) => {
    const urlStr = String(url);
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

async function renderMovePage(id: string) {
  const element = await MoveMachineryPage({ params: Promise.resolve({ id }) });
  return render(element);
}

describe("MoveMachineryPage", () => {
  it("renders the movement form with the Machine's name and available Sites", async () => {
    mockFetchRouter({
      machinery: { id: "m1", name: "JCB 3DX" },
      sites: [{ id: "site1", name: "NH-48 Highway Widening" }],
    });

    await renderMovePage("m1");

    expect(screen.getByRole("heading", { name: /JCB 3DX/ })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "NH-48 Highway Widening" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Record Movement" })).toBeInTheDocument();
  });

  it("calls notFound() for a Machine ID that does not exist", async () => {
    mockFetchRouter({ machineryStatus: 404, machinery: undefined, sites: [] });

    await expect(renderMovePage("missing-id")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalled();
  });
});
