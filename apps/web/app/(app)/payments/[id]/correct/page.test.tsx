import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const notFoundMock = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
);
vi.mock("next/navigation", () => ({ notFound: notFoundMock }));
vi.mock("../../actions", () => ({
  createPaymentAction: Object.assign(vi.fn(async () => ({})), { bind: vi.fn(() => vi.fn(async () => ({}))) }),
}));

import CorrectPaymentPage from "./page";

const originalFetch = global.fetch;
const originalApiUrl = process.env.API_URL;

function mockFetchRouter(handlers: {
  payment?: unknown;
  paymentStatus?: number;
  teamMembers?: unknown[];
  advances?: unknown[];
  role?: "OWNER_ADMIN" | "SITE_SUPERVISOR";
}) {
  global.fetch = vi.fn((url: string) => {
    const urlStr = String(url);
    if (urlStr.includes("/users/me")) {
      return Promise.resolve({
        ok: true,
        json: async () => ({ role: handlers.role ?? "OWNER_ADMIN" }),
      });
    }
    if (urlStr.includes("/payments/")) {
      return Promise.resolve({
        ok: (handlers.paymentStatus ?? 200) < 400,
        status: handlers.paymentStatus ?? 200,
        json: async () => handlers.payment,
      });
    }
    if (urlStr.includes("/advances")) {
      return Promise.resolve({ ok: true, json: async () => handlers.advances ?? [] });
    }
    return Promise.resolve({ ok: true, json: async () => handlers.teamMembers ?? [] });
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

async function renderCorrectPage(id: string) {
  const element = await CorrectPaymentPage({ params: Promise.resolve({ id }) });
  return render(element);
}

const payment = {
  id: "p1",
  basePay: "15000",
  additionalAmount: "2000",
  deductions: "500",
  payPeriod: "1-15 Aug 2026",
  teamMember: { id: "tm1", name: "Ravi Kumar" },
  advanceAdjustments: [],
};

describe("CorrectPaymentPage", () => {
  it("pre-fills the fields from the original Payment and shows the correction banner", async () => {
    mockFetchRouter({ payment, teamMembers: [{ id: "tm1", name: "Ravi Kumar", outstandingAdvanceBalance: "8000" }] });

    await renderCorrectPage("p1");

    expect(screen.getByText("Filing a correction")).toBeInTheDocument();
    expect(screen.getByLabelText("Base Pay")).toHaveValue(15000);
    expect(screen.getByLabelText("Deductions")).toHaveValue(500);
  });

  it("calls notFound() for a Payment ID that does not exist", async () => {
    mockFetchRouter({ paymentStatus: 404, payment: undefined });

    await expect(renderCorrectPage("missing-id")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalled();
  });

  it("404s for SITE_SUPERVISOR, since apps/api now rejects that write", async () => {
    mockFetchRouter({ payment, role: "SITE_SUPERVISOR" });

    await expect(renderCorrectPage("p1")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalled();
  });
});
