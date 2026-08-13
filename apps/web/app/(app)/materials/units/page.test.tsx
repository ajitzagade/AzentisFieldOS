import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import UnitsPage from "./page";

async function renderUnitsPage() {
  const element = await UnitsPage();
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

describe("UnitsPage", () => {
  it("renders every Unit", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ id: "u1", name: "Bags" }, { id: "u2", name: "Pcs" }],
    }) as unknown as typeof fetch;

    await renderUnitsPage();

    expect(screen.getByText("Bags")).toBeInTheDocument();
    expect(screen.getByText("Pcs")).toBeInTheDocument();
  });

  it("renders the empty state when there are zero Units", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => [] }) as unknown as typeof fetch;

    await renderUnitsPage();

    expect(screen.getByText("No Units yet.")).toBeInTheDocument();
  });
});
