import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const notFoundMock = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
);
vi.mock("next/navigation", () => ({ notFound: notFoundMock }));

import NewMachineryServiceLogPage from "./page";

const originalFetch = global.fetch;
const originalApiUrl = process.env.API_URL;

function mockFetch(overrides: { machinery?: unknown; machineryStatus?: number }) {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: (overrides.machineryStatus ?? 200) < 400,
      status: overrides.machineryStatus ?? 200,
      json: async () => overrides.machinery,
    }),
  ) as unknown as typeof fetch;
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

async function renderPage(id: string) {
  const element = await NewMachineryServiceLogPage({ params: Promise.resolve({ id }) });
  return render(element);
}

describe("NewMachineryServiceLogPage", () => {
  it("renders the service log form scoped to this Machine, with a Kind field and a Log Entry submit", async () => {
    mockFetch({ machinery: { id: "m1", name: "JCB 3DX" } });

    await renderPage("m1");

    expect(screen.getByRole("heading", { name: /JCB 3DX/ })).toBeInTheDocument();
    expect(screen.getByLabelText("Kind")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Fuel" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Maintenance" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Repair" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Log Entry" })).toBeInTheDocument();
  });

  it("calls notFound() for a Machine ID that does not exist", async () => {
    mockFetch({ machineryStatus: 404, machinery: undefined });

    await expect(renderPage("missing-id")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalled();
  });
});
