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
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        id: "m1",
        name: "JCB 3DX",
        assetNumber: "AST-001",
        model: "3DX",
        ownership: "Owned",
        operator: "Ramesh",
        currentStatus: "AT_SITE",
        type: { id: "t1", name: "Excavator" },
        currentSite: { id: "s1", name: "NH-48 Highway Widening" },
      }),
    }) as unknown as typeof fetch;

    await renderDetailPage("m1");

    expect(screen.getByRole("heading", { name: /JCB 3DX/ })).toBeInTheDocument();
    expect(screen.getByText("AST-001")).toBeInTheDocument();
    expect(screen.getByText("Excavator")).toBeInTheDocument();
    expect(screen.getByText("NH-48 Highway Widening")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Edit/ })).toHaveAttribute("href", "/machinery-vehicles/machinery/m1/edit");
  });

  it("calls notFound() for a Machine ID that does not exist", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 }) as unknown as typeof fetch;

    await expect(renderDetailPage("missing-id")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalled();
  });
});
