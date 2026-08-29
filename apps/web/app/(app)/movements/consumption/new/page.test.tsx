import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import NewConsumptionPage from "./page";

async function renderNewConsumptionPage() {
  const element = await NewConsumptionPage();
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

function mockFetchRouter(handlers: { sites?: unknown; materials?: unknown }) {
  global.fetch = vi.fn((url: string) => {
    const urlStr = String(url);
    if (urlStr.includes("/sites")) {
      return Promise.resolve({ ok: true, json: async () => handlers.sites ?? [] });
    }
    return Promise.resolve({ ok: true, json: async () => handlers.materials ?? [] });
  }) as unknown as typeof fetch;
}

describe("NewConsumptionPage", () => {
  it("flattens each Material's Sizes into Material/Size picker options", async () => {
    mockFetchRouter({
      sites: [{ id: "site1", name: "Sector 12 Metro Depot" }],
      materials: [{ id: "m1", name: "RCC Pipe", unit: { name: "nos" }, sizes: [{ id: "ms1", label: "600mm" }] }],
    });

    await renderNewConsumptionPage();

    expect(screen.getByRole("option", { name: "Sector 12 Metro Depot" })).toBeInTheDocument();

    const user = userEvent.setup();
    const materialPicker = screen.getByLabelText("Material / Size");
    expect(materialPicker).toHaveAttribute("role", "combobox");
    await user.type(materialPicker, "rcc");
    expect(await screen.findByText("RCC Pipe (600mm)")).toBeInTheDocument();
  });
});
