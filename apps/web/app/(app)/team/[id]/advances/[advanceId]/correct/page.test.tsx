import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const notFoundMock = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
);
vi.mock("next/navigation", () => ({ notFound: notFoundMock }));

import CorrectAdvancePage from "./page";

const originalFetch = global.fetch;
const originalApiUrl = process.env.API_URL;

function mockFetchRouter(handlers: {
  advance?: unknown;
  advanceStatus?: number;
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
      ok: (handlers.advanceStatus ?? 200) < 400,
      status: handlers.advanceStatus ?? 200,
      json: async () => handlers.advance,
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

async function renderCorrectPage(id: string, advanceId: string) {
  const element = await CorrectAdvancePage({ params: Promise.resolve({ id, advanceId }) });
  return render(element);
}

const advance = {
  id: "a1",
  amount: "5000",
  reason: "Medical",
  paymentMethod: "Cash",
  givenAt: "2026-08-05T00:00:00.000Z",
  teamMember: { id: "tm1", name: "Ravi Kumar" },
};

describe("CorrectAdvancePage", () => {
  it("pre-fills the fields from the original Advance and shows the correction banner", async () => {
    mockFetchRouter({ advance });

    await renderCorrectPage("tm1", "a1");

    expect(screen.getByText("Filing a correction")).toBeInTheDocument();
    expect(screen.getByLabelText("Reason")).toHaveValue("Medical");
    expect(screen.getByLabelText("Payment Method")).toHaveValue("Cash");
  });

  it("calls notFound() for an Advance ID that does not exist", async () => {
    mockFetchRouter({ advanceStatus: 404, advance: undefined });

    await expect(renderCorrectPage("tm1", "missing-id")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalled();
  });

  it("calls notFound() when the Advance belongs to a different Team Member than the route", async () => {
    mockFetchRouter({ advance: { ...advance, teamMember: { id: "some-other-tm", name: "Other" } } });

    await expect(renderCorrectPage("tm1", "a1")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalled();
  });

  it("404s for SITE_SUPERVISOR, since apps/api now rejects that write", async () => {
    mockFetchRouter({ advance, role: "SITE_SUPERVISOR" });

    await expect(renderCorrectPage("tm1", "a1")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalled();
  });
});
