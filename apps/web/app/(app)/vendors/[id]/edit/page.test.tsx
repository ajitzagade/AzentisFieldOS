import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const notFoundMock = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
);
vi.mock("next/navigation", () => ({ notFound: notFoundMock }));

vi.mock("./actions", () => ({
  updateVendorAction: Object.assign(vi.fn(async () => ({})), { bind: vi.fn(() => vi.fn(async () => ({}))) }),
}));

import EditVendorPage from "./page";

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
  const element = await EditVendorPage({ params: Promise.resolve({ id }) });
  render(element);
}

describe("EditVendorPage", () => {
  it("renders the edit form pre-filled for a Vendor that exists", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "v1",
        name: "Shree Balaji Traders",
        contactPerson: null,
        phone: null,
        email: null,
        address: null,
        materialsSupplied: [],
      }),
    }) as unknown as typeof fetch;

    await renderEditPage("v1");

    expect(screen.getByLabelText("Name")).toHaveValue("Shree Balaji Traders");
  });

  it("calls notFound() for a Vendor ID that doesn't exist", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 }) as unknown as typeof fetch;

    await expect(renderEditPage("missing-id")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalled();
  });
});
