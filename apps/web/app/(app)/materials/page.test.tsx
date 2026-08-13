import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import MaterialsPage from "./page";

async function renderMaterialsPage() {
  const element = await MaterialsPage();
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

describe("MaterialsPage", () => {
  it("renders Category/Material/Sizes/Unit/Custom Fields columns for each Material", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        {
          id: "1",
          name: "RCC Pipe",
          isActive: true,
          category: { id: "c1", name: "Pipes & Fittings" },
          unit: { id: "u1", name: "Pcs" },
          sizes: [{ id: "s1", label: "300mm" }, { id: "s2", label: "450mm" }],
          customFields: [],
        },
      ],
    }) as unknown as typeof fetch;

    await renderMaterialsPage();

    expect(screen.getByText("Pipes & Fittings")).toBeInTheDocument();
    expect(screen.getByText("RCC Pipe")).toBeInTheDocument();
    expect(screen.getByText("300mm")).toBeInTheDocument();
    expect(screen.getByText("450mm")).toBeInTheDocument();
    expect(screen.getByText("Pcs")).toBeInTheDocument();
  });

  it("shows — for a Material with zero Sizes, not a blank cell", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        {
          id: "1",
          name: "RCC Cover",
          isActive: true,
          category: { id: "c1", name: "Pipes & Fittings" },
          unit: { id: "u1", name: "Pcs" },
          sizes: [],
          customFields: {},
        },
      ],
    }) as unknown as typeof fetch;

    await renderMaterialsPage();

    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("shows a Disabled badge for an inactive Material without hiding it from the list (AC #2)", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        {
          id: "1",
          name: "Old Material",
          isActive: false,
          category: { id: "c1", name: "Misc" },
          unit: { id: "u1", name: "Pcs" },
          sizes: [],
          customFields: [],
        },
      ],
    }) as unknown as typeof fetch;

    await renderMaterialsPage();

    expect(screen.getByText("Old Material")).toBeInTheDocument();
    expect(screen.getByText("Disabled")).toBeInTheDocument();
  });

  it("shows the real Custom Fields count, not always 0 (story 4.3)", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        {
          id: "1",
          name: "RCC Pipe",
          isActive: true,
          category: { id: "c1", name: "Pipes & Fittings" },
          unit: { id: "u1", name: "Pcs" },
          sizes: [],
          customFields: [
            { label: "Brand", type: "TEXT" },
            { label: "Warranty Expiry", type: "DATE" },
          ],
        },
      ],
    }) as unknown as typeof fetch;

    await renderMaterialsPage();

    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("renders the empty state with a create-first-Material action when there are zero Materials", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => [] }) as unknown as typeof fetch;

    await renderMaterialsPage();

    expect(screen.getByText("No Materials yet.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Add your first Material/ })).toHaveAttribute("href", "/materials/new");
  });

  it("links each row's Edit action to the Material edit route", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        {
          id: "abc",
          name: "RCC Pipe",
          isActive: true,
          category: { id: "c1", name: "Pipes & Fittings" },
          unit: { id: "u1", name: "Pcs" },
          sizes: [],
          customFields: [],
        },
      ],
    }) as unknown as typeof fetch;

    await renderMaterialsPage();

    expect(screen.getByRole("link", { name: /Edit/ })).toHaveAttribute("href", "/materials/abc/edit");
  });
});
