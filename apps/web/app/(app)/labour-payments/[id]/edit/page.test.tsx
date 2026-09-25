import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const notFoundMock = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
);
vi.mock("next/navigation", () => ({ notFound: notFoundMock }));

vi.mock("./actions", () => ({
  updateDailyLabourerAction: Object.assign(vi.fn(async () => ({})), { bind: vi.fn(() => vi.fn(async () => ({}))) }),
}));

import EditLabourerPage from "./page";

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
  const element = await EditLabourerPage({ params: Promise.resolve({ id }) });
  render(element);
}

describe("EditLabourerPage", () => {
  it("renders the edit form pre-filled for a Labourer that exists", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "l1",
        name: "Ramesh Kumar",
        category: "Mistri",
        defaultPerDayAmount: 800,
      }),
    }) as unknown as typeof fetch;

    await renderEditPage("l1");

    expect(screen.getByLabelText("Labour Name")).toHaveValue("Ramesh Kumar");
    expect(screen.getByLabelText("Labour Category")).toHaveValue("Mistri");
    expect(screen.getByLabelText("Default Per-Day Amount")).toHaveValue(800);
  });

  it("calls notFound() for a Labourer ID that doesn't exist", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 }) as unknown as typeof fetch;

    await expect(renderEditPage("missing-id")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalled();
  });
});
