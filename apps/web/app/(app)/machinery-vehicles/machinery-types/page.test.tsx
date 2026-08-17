import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import MachineryTypesPage from "./page";

async function renderMachineryTypesPage() {
  const element = await MachineryTypesPage();
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

describe("MachineryTypesPage", () => {
  it("renders every Machinery Type", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        { id: "t1", name: "Excavator" },
        { id: "t2", name: "Mixer" },
      ],
    }) as unknown as typeof fetch;

    await renderMachineryTypesPage();

    expect(screen.getByText("Excavator")).toBeInTheDocument();
    expect(screen.getByText("Mixer")).toBeInTheDocument();
  });

  it("renders the empty state when there are zero Machinery Types", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => [] }) as unknown as typeof fetch;

    await renderMachineryTypesPage();

    expect(screen.getByText("No Machinery Types yet.")).toBeInTheDocument();
  });
});
