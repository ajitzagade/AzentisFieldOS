import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import NewReturnWastagePage from "./page";

async function renderPage() {
  const element = await NewReturnWastagePage();
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

describe("NewReturnWastagePage", () => {
  it("flattens each Material's Sizes into Material/Size picker options", async () => {
    mockFetchRouter({
      sites: [{ id: "site1", name: "Sector 12 Metro Depot" }],
      materials: [{ id: "m1", name: "Aggregate", unit: { name: "cft" }, sizes: [{ id: "ms1", label: "20mm" }] }],
    });

    await renderPage();

    const user = userEvent.setup();
    const materialPicker = screen.getByLabelText("Material / Size");
    expect(materialPicker).toHaveAttribute("role", "combobox");
    await user.type(materialPicker, "aggregate");
    expect(await screen.findByText("Aggregate (20mm)")).toBeInTheDocument();
  });
});
