import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import NewPurchasePage from "./page";

async function renderNewPurchasePage() {
  const element = await NewPurchasePage();
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

function mockFetchRouter(handlers: { sites?: unknown; materials?: unknown; vendors?: unknown }) {
  global.fetch = vi.fn((url: string) => {
    const urlStr = String(url);
    if (urlStr.includes("/sites")) {
      return Promise.resolve({ ok: true, json: async () => handlers.sites ?? [] });
    }
    if (urlStr.includes("/vendors")) {
      return Promise.resolve({ ok: true, json: async () => handlers.vendors ?? [] });
    }
    return Promise.resolve({ ok: true, json: async () => handlers.materials ?? [] });
  }) as unknown as typeof fetch;
}

describe("NewPurchasePage", () => {
  it("flattens each Material's Sizes into Material/Size picker options", async () => {
    mockFetchRouter({
      sites: [{ id: "site1", name: "NH-48 Highway Widening" }],
      materials: [
        {
          id: "m1",
          name: "Cement",
          unit: { name: "bags" },
          sizes: [{ id: "ms1", label: "OPC 53 Grade" }],
        },
      ],
    });

    await renderNewPurchasePage();

    const user = userEvent.setup();
    const materialPicker = screen.getByLabelText("Material / Size");
    expect(materialPicker).toHaveAttribute("role", "combobox");
    await user.type(materialPicker, "cement");
    expect(await screen.findByText("Cement (OPC 53 Grade)")).toBeInTheDocument();
  });

  it("does not offer a Material with zero Sizes in the picker — it has nothing to purchase", async () => {
    mockFetchRouter({
      sites: [],
      materials: [{ id: "m1", name: "Loose Sand", unit: { name: "cft" }, sizes: [] }],
    });

    await renderNewPurchasePage();

    expect(screen.queryByRole("option", { name: /Loose Sand/ })).not.toBeInTheDocument();
  });
});
