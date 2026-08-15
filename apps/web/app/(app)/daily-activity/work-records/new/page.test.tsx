import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

import NewWorkRecordPage from "./page";

async function renderNewWorkRecordPage() {
  const element = await NewWorkRecordPage();
  render(element);
}

const originalFetch = global.fetch;
const originalApiUrl = process.env.API_URL;

beforeEach(() => {
  process.env.API_URL = "http://localhost:3001";
});

afterEach(() => {
  global.fetch = originalFetch;
  process.env.API_URL = originalApiUrl;
  vi.restoreAllMocks();
});

function mockFetchRouter(handlers: { sites?: unknown; teamMembers?: unknown }) {
  global.fetch = vi.fn((url: string) => {
    const urlStr = String(url);
    if (urlStr.includes("/sites")) {
      return Promise.resolve({ ok: true, json: async () => handlers.sites ?? [] });
    }
    return Promise.resolve({ ok: true, json: async () => handlers.teamMembers ?? [] });
  }) as unknown as typeof fetch;
}

describe("NewWorkRecordPage", () => {
  it("hides a disabled Team Member from the Add-crew picker, but still loads active ones", async () => {
    mockFetchRouter({
      sites: [{ id: "site1", name: "NH-48 Highway Widening" }],
      teamMembers: [
        { id: "tm1", name: "Ravi Kumar", isActive: true },
        { id: "tm2", name: "Old Member", isActive: false },
      ],
    });

    await renderNewWorkRecordPage();

    expect(screen.getByRole("option", { name: "Ravi Kumar" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Old Member" })).not.toBeInTheDocument();
  });
});
