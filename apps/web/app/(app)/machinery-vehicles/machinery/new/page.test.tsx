import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import NewMachineryPage from "./page";

async function renderNewMachineryPage() {
  const element = await NewMachineryPage();
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

describe("NewMachineryPage", () => {
  it("lists Machinery Types in the Type picker", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        { id: "t1", name: "Excavator" },
        { id: "t2", name: "Mixer" },
      ],
    }) as unknown as typeof fetch;

    await renderNewMachineryPage();

    expect(screen.getByRole("option", { name: "Excavator" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Mixer" })).toBeInTheDocument();
  });
});
