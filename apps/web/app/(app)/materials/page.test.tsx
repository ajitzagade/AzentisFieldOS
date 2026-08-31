import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ToastProvider } from "@azentisfieldos/ui";
import MaterialsPage from "./page";

async function renderMaterialsPage(searchParams?: Record<string, string>) {
  const element = await MaterialsPage({ searchParams: Promise.resolve(searchParams ?? {}) });
  render(<ToastProvider>{element}</ToastProvider>);
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

interface MockData {
  categories?: unknown;
  units?: unknown;
  materials?: unknown;
}

function mockFetchRouter(data: MockData) {
  return vi.fn((url: string | URL | Request, init?: RequestInit) => {
    const urlStr = String(url);
    const respond = (body: unknown) => Promise.resolve({ ok: true, json: async () => body } as Response);
    if (urlStr.includes("/material-categories")) return respond(data.categories ?? []);
    if (urlStr.includes("/units")) return respond(data.units ?? []);
    if (urlStr.includes("/materials")) {
      if (init?.method === "POST") return respond({ id: "new", name: "created" });
      return respond(data.materials ?? []);
    }
    return respond([]);
  }) as unknown as typeof fetch;
}

const pipesCategory = { id: "c1", name: "Pipes & Fittings", isActive: true };
const rccPipe = {
  id: "m1",
  name: "RCC Pipe",
  isActive: true,
  category: { id: "c1", name: "Pipes & Fittings" },
  unit: { id: "u1", name: "Pcs" },
  sizes: [
    { id: "s1", label: "300mm" },
    { id: "s2", label: "450mm" },
  ],
  customFields: [],
  lowStockThreshold: null,
};

describe("MaterialsPage", () => {
  it("renders the selected Category's Materials with Sizes and Unit, master-detail style", async () => {
    global.fetch = mockFetchRouter({
      categories: [pipesCategory],
      units: [{ id: "u1", name: "Pcs" }],
      materials: [rccPipe],
    });

    await renderMaterialsPage();

    // Left panel lists the Category with its active count; right panel shows
    // the Materials table.
    expect(screen.getAllByText("Pipes & Fittings").length).toBeGreaterThan(0);
    // Both the left-panel caption and the detail header report the count.
    expect(screen.getAllByText("1 active Material").length).toBeGreaterThan(0);
    expect(screen.getByText("RCC Pipe")).toBeInTheDocument();
    expect(screen.getByText("300mm")).toBeInTheDocument();
    expect(screen.getByText("450mm")).toBeInTheDocument();
    expect(screen.getByText("Pcs")).toBeInTheDocument();
  });

  it("shows — for a Material with zero Sizes, not a blank cell", async () => {
    global.fetch = mockFetchRouter({
      categories: [pipesCategory],
      materials: [{ ...rccPipe, sizes: [] }],
    });

    await renderMaterialsPage();

    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("shows a Disabled badge for an inactive Material without hiding it from the list (AC #2)", async () => {
    global.fetch = mockFetchRouter({
      categories: [{ id: "c1", name: "Misc", isActive: true }],
      materials: [{ ...rccPipe, name: "Old Material", isActive: false, category: { id: "c1", name: "Misc" } }],
    });

    await renderMaterialsPage();

    expect(screen.getByText("Old Material")).toBeInTheDocument();
    expect(screen.getAllByText("Disabled").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Enable" })).toBeInTheDocument();
  });

  it("renders taxonomy stat tiles counting Categories and Materials, active and total", async () => {
    global.fetch = mockFetchRouter({
      categories: [pipesCategory, { id: "c2", name: "Cement", isActive: false }],
      materials: [rccPipe, { ...rccPipe, id: "m2", name: "Old Pipe", isActive: false }],
    });

    await renderMaterialsPage();

    // "Categories" also titles the left panel — the tile label is one of them.
    expect(screen.getAllByText("Categories").length).toBeGreaterThan(0);
    expect(screen.getByText("Active Categories")).toBeInTheDocument();
    expect(screen.getByText("Total Materials")).toBeInTheDocument();
    expect(screen.getByText("Active Materials")).toBeInTheDocument();
  });

  it("guides the user to add the first Category when none exist", async () => {
    global.fetch = mockFetchRouter({});

    await renderMaterialsPage();

    expect(screen.getByText("No Categories yet — add your first one above.")).toBeInTheDocument();
    expect(screen.getByText("Select a Category to see its Materials.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Add Category/ })).toBeInTheDocument();
  });

  it("shows an empty-Category message with the quick-add row above it", async () => {
    global.fetch = mockFetchRouter({ categories: [pipesCategory], units: [{ id: "u1", name: "Pcs" }] });

    await renderMaterialsPage();

    expect(screen.getByText("No Materials in this Category yet — add the first one above.")).toBeInTheDocument();
    expect(screen.getByLabelText("Add a Material to this Category")).toBeInTheDocument();
    expect(screen.getByLabelText("Unit")).toHaveAttribute("role", "combobox");
  });

  it("links each row's Edit action to the Material edit route", async () => {
    global.fetch = mockFetchRouter({ categories: [pipesCategory], materials: [{ ...rccPipe, id: "abc" }] });

    await renderMaterialsPage();

    expect(screen.getByRole("link", { name: /Edit/ })).toHaveAttribute("href", "/materials/abc/edit");
  });

  it("quick-adds a Material to the selected Category via POST /materials with the picked Unit", async () => {
    const fetchMock = mockFetchRouter({
      categories: [pipesCategory],
      units: [{ id: "u1", name: "Pcs" }],
      materials: [],
    });
    global.fetch = fetchMock;

    await renderMaterialsPage();

    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Add a Material to this Category"), "NP2 Pipe");
    await user.type(screen.getByLabelText("Unit"), "pcs");
    await user.click(await screen.findByRole("option", { name: /Pcs/ }));
    await user.click(screen.getByRole("button", { name: /^Add$/ }));

    const postCall = (fetchMock as unknown as ReturnType<typeof vi.fn>).mock.calls.find(
      ([, init]) => (init as RequestInit | undefined)?.method === "POST",
    );
    expect(postCall).toBeDefined();
    expect(JSON.parse(String((postCall?.[1] as RequestInit).body))).toEqual({
      name: "NP2 Pipe",
      categoryId: "c1",
      unitId: "u1",
    });
  });

  it('forwards ?q= from Story 16.2\'s global search "See all" into the Material search box (Story 16.2)', async () => {
    const bindersCategory = { id: "c2", name: "Binders", isActive: true };
    const cementMaterial = {
      ...rccPipe,
      id: "m2",
      name: "OPC Cement",
      category: { id: "c2", name: "Binders" },
    };
    global.fetch = mockFetchRouter({
      categories: [pipesCategory, bindersCategory],
      materials: [rccPipe, cementMaterial],
    });

    await renderMaterialsPage({ q: "cement" });

    // The matched Material's own Category ("Binders", not the first/default
    // "Pipes & Fittings") is auto-selected — landing on the default
    // Category with an empty result would otherwise look broken despite
    // the search term being correctly carried over.
    expect(screen.getByDisplayValue("cement")).toBeInTheDocument();
    expect(screen.getByText("OPC Cement")).toBeInTheDocument();
  });

  it("uses only the first value, without crashing, when a duplicate ?q= arrives as an array", async () => {
    global.fetch = mockFetchRouter({ categories: [pipesCategory], materials: [rccPipe] });

    await renderMaterialsPage({ q: ["cement", "steel"] } as unknown as Record<string, string>);

    expect(screen.getByDisplayValue("cement")).toBeInTheDocument();
  });
});
