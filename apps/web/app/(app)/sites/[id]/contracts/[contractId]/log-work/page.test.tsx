import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const notFoundMock = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
);
vi.mock("next/navigation", () => ({ notFound: notFoundMock }));

import LogWorkPage from "./page";

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

async function renderPage(siteId: string, contractId: string) {
  const element = await LogWorkPage({ params: Promise.resolve({ id: siteId, contractId }) });
  render(element);
}

const ACTIVE_PER_PIPE_CONTRACT = {
  id: "c1",
  siteId: "site-1",
  site: { id: "site-1", name: "NH-48" },
  subcontractor: { id: "sc1", name: "Ganesh Pipeline Works" },
  workCategory: "Storm-water pipe laying",
  rateType: "PER_PIPE",
  rateUnitLabel: null,
  status: "ACTIVE",
};

function mockContract(contract: unknown) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => contract,
  }) as unknown as typeof fetch;
}

describe("LogWorkPage's Active/non-Fixed-Cost gate", () => {
  it("renders the Work Entry form for an Active, non-Fixed-Cost contract", async () => {
    mockContract(ACTIVE_PER_PIPE_CONTRACT);

    await renderPage("site-1", "c1");

    expect(screen.getByRole("button", { name: /Log Work|Save/ })).toBeInTheDocument();
  });

  it("renders an explanation, not the form, for a Draft contract", async () => {
    mockContract({ ...ACTIVE_PER_PIPE_CONTRACT, status: "DRAFT" });

    await renderPage("site-1", "c1");

    expect(screen.getByText(/Work can only be logged against an Active contract/)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Quantity/)).not.toBeInTheDocument();
  });

  it("renders an explanation, not the form, for a Fixed Cost contract", async () => {
    mockContract({ ...ACTIVE_PER_PIPE_CONTRACT, rateType: "FIXED_COST" });

    await renderPage("site-1", "c1");

    expect(screen.getByText(/Fixed Cost contracts don't track billable quantity/)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Quantity/)).not.toBeInTheDocument();
  });

  it("renders an explanation, not the form, when the contract has no rateType at all", async () => {
    mockContract({ ...ACTIVE_PER_PIPE_CONTRACT, rateType: null });

    await renderPage("site-1", "c1");

    expect(screen.getByText(/Work can only be logged against an Active contract/)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Quantity/)).not.toBeInTheDocument();
  });

  it("calls notFound() when the contract belongs to a different Site than the URL", async () => {
    mockContract({ ...ACTIVE_PER_PIPE_CONTRACT, siteId: "site-2" });

    await expect(renderPage("site-1", "c1")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalled();
  });
});
