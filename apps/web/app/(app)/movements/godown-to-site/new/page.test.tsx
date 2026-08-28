import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import NewMovementPage from "./page";

async function renderNewMovementPage() {
  const element = await NewMovementPage();
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

describe("NewMovementPage", () => {
  it("flattens each Material's Sizes into Material/Size picker options", async () => {
    mockFetchRouter({
      sites: [{ id: "site1", name: "NH-48 Highway Widening" }],
      materials: [{ id: "m1", name: "TMT Steel", sizes: [{ id: "ms1", label: "12mm" }] }],
    });

    await renderNewMovementPage();

    expect(screen.getByRole("option", { name: "NH-48 Highway Widening" })).toBeInTheDocument();

    const user = userEvent.setup();
    const materialPicker = screen.getByLabelText("Material / Size");
    expect(materialPicker).toHaveAttribute("role", "combobox");
    await user.type(materialPicker, "tmt");
    expect(await screen.findByText("TMT Steel (12mm)")).toBeInTheDocument();
  });
});
