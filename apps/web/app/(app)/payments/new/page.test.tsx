import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../actions", () => ({
  createPaymentAction: Object.assign(vi.fn(async () => ({})), { bind: vi.fn(() => vi.fn(async () => ({}))) }),
}));

import NewPaymentPage from "./page";

const originalFetch = global.fetch;
const originalApiUrl = process.env.API_URL;

function mockFetchRouter(handlers: { teamMembers?: unknown[]; advances?: unknown[] }) {
  global.fetch = vi.fn((url: string) => {
    const urlStr = String(url);
    if (urlStr.includes("/advances")) {
      return Promise.resolve({ ok: true, json: async () => handlers.advances ?? [] });
    }
    return Promise.resolve({ ok: true, json: async () => handlers.teamMembers ?? [] });
  }) as unknown as typeof fetch;
}

beforeEach(() => {
  process.env.API_URL = "http://localhost:3001";
});

afterEach(() => {
  global.fetch = originalFetch;
  process.env.API_URL = originalApiUrl;
  vi.restoreAllMocks();
});

async function renderNewPaymentPage() {
  const element = await NewPaymentPage();
  return render(element);
}

describe("NewPaymentPage", () => {
  it("renders the Payment form with Team Members loaded into the picker", async () => {
    mockFetchRouter({
      teamMembers: [{ id: "tm1", name: "Ravi Kumar", outstandingAdvanceBalance: "8000" }],
      advances: [{ id: "adv1", amount: "5000", reason: "Medical", givenAt: "2026-08-05T00:00:00.000Z", teamMember: { id: "tm1" } }],
    });

    await renderNewPaymentPage();

    expect(screen.getByRole("heading", { name: "Record Payment" })).toBeInTheDocument();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Team Member"), "ravi");
    expect(await screen.findByRole("option", { name: /Ravi Kumar/ })).toBeInTheDocument();
  });
});
