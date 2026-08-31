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
    if (urlStr.includes("/team-members")) {
      return Promise.resolve({ ok: true, json: async () => [] });
    }
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
      materials: [{ id: "m1", name: "TMT Steel", unit: { name: "kg" }, sizes: [{ id: "ms1", label: "12mm" }] }],
    });

    await renderNewMovementPage();

    expect(screen.getByRole("option", { name: "NH-48 Highway Widening" })).toBeInTheDocument();

    const user = userEvent.setup();
    const materialPicker = screen.getByLabelText("Material / Size");
    expect(materialPicker).toHaveAttribute("role", "combobox");
    await user.type(materialPicker, "tmt");
    expect(await screen.findByText("TMT Steel (12mm)")).toBeInTheDocument();
  });

  it("prefills an exact ?materialSizeId= (Story 16.3) even for a multi-Size Material the old ?materialId= heuristic can't resolve", async () => {
    mockFetchRouter({
      sites: [{ id: "site1", name: "NH-48 Highway Widening" }],
      materials: [
        {
          id: "m1",
          name: "RCC Pipe",
          unit: { name: "Pcs" },
          sizes: [
            { id: "ms1", label: "300mm" },
            { id: "ms2", label: "450mm" },
          ],
        },
      ],
    });

    const element = await NewMovementPage({
      searchParams: Promise.resolve({ materialId: "m1", materialSizeId: "ms2" }),
    });
    render(element);

    expect(document.querySelector('input[name="materialSizeId"]')).toHaveValue("ms2");
  });

  it("still prefills via the pre-existing ?materialId=/?siteId= single-Size heuristic (unchanged)", async () => {
    mockFetchRouter({
      sites: [{ id: "site1", name: "NH-48 Highway Widening" }],
      materials: [{ id: "m1", name: "TMT Steel", unit: { name: "kg" }, sizes: [{ id: "ms1", label: "12mm" }] }],
    });

    const element = await NewMovementPage({
      searchParams: Promise.resolve({ materialId: "m1", siteId: "site1" }),
    });
    render(element);

    expect(document.querySelector('input[name="materialSizeId"]')).toHaveValue("ms1");
    expect(screen.getByLabelText("Destination Site")).toHaveValue("site1");
  });

  it("prefills from a bare ?materialSizeId= with no ?materialId= at all — the exact URL shape the Material-availability page's Transfer link produces (Story 16.3)", async () => {
    mockFetchRouter({
      sites: [{ id: "site1", name: "NH-48 Highway Widening" }],
      materials: [
        {
          id: "m1",
          name: "RCC Pipe",
          unit: { name: "Pcs" },
          sizes: [
            { id: "ms1", label: "300mm" },
            { id: "ms2", label: "450mm" },
          ],
        },
      ],
    });

    const element = await NewMovementPage({
      searchParams: Promise.resolve({ materialSizeId: "ms2" }),
    });
    render(element);

    expect(document.querySelector('input[name="materialSizeId"]')).toHaveValue("ms2");
  });

  it("ignores an unrecognized ?materialSizeId= rather than crashing", async () => {
    mockFetchRouter({
      sites: [{ id: "site1", name: "NH-48 Highway Widening" }],
      materials: [{ id: "m1", name: "TMT Steel", unit: { name: "kg" }, sizes: [{ id: "ms1", label: "12mm" }] }],
    });

    const element = await NewMovementPage({
      searchParams: Promise.resolve({ materialSizeId: "does-not-exist" }),
    });
    render(element);

    expect(document.querySelector('input[name="materialSizeId"]')).toHaveValue("");
  });
});
