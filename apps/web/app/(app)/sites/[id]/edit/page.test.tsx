import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const notFoundMock = vi.hoisted(() => vi.fn(() => { throw new Error("NEXT_NOT_FOUND"); }));
vi.mock("next/navigation", () => ({ notFound: notFoundMock }));

vi.mock("./actions", () => ({
  updateSiteAction: Object.assign(vi.fn(async () => ({})), { bind: vi.fn(() => vi.fn(async () => ({}))) }),
}));

import EditSitePage from "./page";

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

async function renderEditPage(id: string) {
  const element = await EditSitePage({ params: Promise.resolve({ id }) });
  render(element);
}

describe("EditSitePage", () => {
  it("renders the edit form pre-filled for a Site that exists", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        { id: "site-1", name: "NH-48", location: "Nashik", status: "ACTIVE", contractReference: null },
      ],
    }) as unknown as typeof fetch;

    await renderEditPage("site-1");

    expect(screen.getByLabelText("Name")).toHaveValue("NH-48");
  });

  it("calls notFound() for a Site ID that doesn't exist", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ id: "other-site", name: "X", location: "Y", status: "ACTIVE", contractReference: null }],
    }) as unknown as typeof fetch;

    await expect(renderEditPage("missing-id")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalled();
  });
});
