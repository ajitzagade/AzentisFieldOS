import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const notFoundMock = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
);
vi.mock("next/navigation", () => ({ notFound: notFoundMock }));

import CorrectAdjustmentPage from "./page";

const originalFetch = global.fetch;
const originalApiUrl = process.env.API_URL;

function mockFetchRouter(handlers: {
  adjustment?: unknown;
  adjustmentStatus?: number;
  role?: "OWNER_ADMIN" | "SITE_SUPERVISOR";
}) {
  global.fetch = vi.fn((url: string) => {
    if (String(url).includes("/users/me")) {
      return Promise.resolve({
        ok: true,
        json: async () => ({ role: handlers.role ?? "OWNER_ADMIN" }),
      });
    }
    return Promise.resolve({
      ok: (handlers.adjustmentStatus ?? 200) < 400,
      status: handlers.adjustmentStatus ?? 200,
      json: async () => handlers.adjustment,
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

async function renderCorrectPage(id: string, advanceId: string, adjustmentId: string) {
  const element = await CorrectAdjustmentPage({ params: Promise.resolve({ id, advanceId, adjustmentId }) });
  return render(element);
}

const adjustment = {
  id: "aa1",
  note: "Adjusted against payment",
  adjustedAt: "2026-08-10T00:00:00.000Z",
  advance: {
    id: "adv1",
    teamMember: { id: "tm1", name: "Ravi Kumar", outstandingAdvanceBalance: "5000" },
  },
};

describe("CorrectAdjustmentPage", () => {
  it("pre-fills the fields from the original Adjustment and shows the correction banner", async () => {
    mockFetchRouter({ adjustment });

    await renderCorrectPage("tm1", "adv1", "aa1");

    expect(screen.getByText("Filing a correction")).toBeInTheDocument();
    expect(screen.getByLabelText("Reason")).toHaveValue("Adjusted against payment");
  });

  it("calls notFound() for an Adjustment ID that does not exist", async () => {
    mockFetchRouter({ adjustmentStatus: 404, adjustment: undefined });

    await expect(renderCorrectPage("tm1", "adv1", "missing-id")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalled();
  });

  it("calls notFound() when the Adjustment belongs to a different Team Member than the route", async () => {
    mockFetchRouter({
      adjustment: { ...adjustment, advance: { ...adjustment.advance, teamMember: { id: "other-tm", name: "Other", outstandingAdvanceBalance: "0" } } },
    });

    await expect(renderCorrectPage("tm1", "adv1", "aa1")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalled();
  });

  it("calls notFound() when the Adjustment belongs to a different Advance than the route", async () => {
    mockFetchRouter({ adjustment: { ...adjustment, advance: { ...adjustment.advance, id: "a-different-advance" } } });

    await expect(renderCorrectPage("tm1", "adv1", "aa1")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalled();
  });

  it("404s for SITE_SUPERVISOR, since apps/api now rejects that write", async () => {
    mockFetchRouter({ adjustment, role: "SITE_SUPERVISOR" });

    await expect(renderCorrectPage("tm1", "adv1", "aa1")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalled();
  });
});
