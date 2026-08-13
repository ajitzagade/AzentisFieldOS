import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import MaterialCategoriesPage from "./page";

async function renderCategoriesPage() {
  const element = await MaterialCategoriesPage();
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

describe("MaterialCategoriesPage", () => {
  it("renders every Category with a Disable/Enable action matching its current state", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        { id: "c1", name: "Pipes & Fittings", isActive: true },
        { id: "c2", name: "Discontinued", isActive: false },
      ],
    }) as unknown as typeof fetch;

    await renderCategoriesPage();

    expect(screen.getByText("Pipes & Fittings")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Disable" })).toBeInTheDocument();
    expect(screen.getByText("Discontinued")).toBeInTheDocument();
    expect(screen.getByText("Disabled")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Enable" })).toBeInTheDocument();
  });

  it("renders the empty state when there are zero Categories", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => [] }) as unknown as typeof fetch;

    await renderCategoriesPage();

    expect(screen.getByText("No Categories yet.")).toBeInTheDocument();
  });
});
