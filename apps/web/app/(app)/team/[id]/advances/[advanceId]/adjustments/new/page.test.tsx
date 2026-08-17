import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const notFoundMock = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
);
vi.mock("next/navigation", () => ({ notFound: notFoundMock }));

import NewAdjustmentPage from "./page";

const originalFetch = global.fetch;
const originalApiUrl = process.env.API_URL;

function mockFetchRouter(handlers: { teamMember?: unknown; teamMemberStatus?: number }) {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: (handlers.teamMemberStatus ?? 200) < 400,
      status: handlers.teamMemberStatus ?? 200,
      json: async () => handlers.teamMember,
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

async function renderNewAdjustmentPage(id: string, advanceId: string) {
  const element = await NewAdjustmentPage({ params: Promise.resolve({ id, advanceId }) });
  return render(element);
}

describe("NewAdjustmentPage", () => {
  it("renders the Adjustment form pre-loaded with the Team Member's current Outstanding Balance", async () => {
    mockFetchRouter({ teamMember: { id: "tm1", name: "Ravi Kumar", outstandingAdvanceBalance: "8000" } });

    await renderNewAdjustmentPage("tm1", "adv1");

    expect(screen.getByRole("heading", { name: "Record an Advance Adjustment" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ravi Kumar" })).toHaveAttribute("href", "/team/tm1");
    expect(screen.getByText("Cannot exceed ₹8,000 (current Outstanding Balance)")).toBeInTheDocument();
  });

  it("calls notFound() for a Team Member ID that does not exist", async () => {
    mockFetchRouter({ teamMemberStatus: 404, teamMember: undefined });

    await expect(renderNewAdjustmentPage("missing-id", "adv1")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalled();
  });
});
