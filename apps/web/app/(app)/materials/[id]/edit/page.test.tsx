import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const notFoundMock = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
);
vi.mock("next/navigation", () => ({ notFound: notFoundMock }));

import EditMaterialPage from "./page";

const originalFetch = global.fetch;
const originalApiUrl = process.env.API_URL;

function mockFetchRouter(handlers: { materials?: unknown; categories?: unknown; units?: unknown }) {
  global.fetch = vi.fn((url: string) => {
    const urlStr = String(url);
    if (urlStr.includes("/material-categories")) {
      return Promise.resolve({ ok: true, json: async () => handlers.categories ?? [] });
    }
    if (urlStr.includes("/units")) {
      return Promise.resolve({ ok: true, json: async () => handlers.units ?? [] });
    }
    return Promise.resolve({ ok: true, json: async () => handlers.materials ?? [] });
  }) as unknown as typeof fetch;
}

beforeEach(() => {
  process.env.API_URL = "http://localhost:3001";
  notFoundMock.mockClear();
});

afterEach(() => {
  global.fetch = originalFetch;
  process.env.API_URL = originalApiUrl;
  vi.restoreAllMocks();
});

async function renderEditPage(id: string) {
  const element = await EditMaterialPage({ params: Promise.resolve({ id }) });
  return render(element);
}

describe("EditMaterialPage", () => {
  it("finds the Material by id from the list and renders its edit form", async () => {
    mockFetchRouter({
      materials: [
        {
          id: "mat-1",
          name: "RCC Pipe",
          isActive: true,
          category: { id: "c1", name: "Pipes & Fittings" },
          unit: { id: "u1", name: "Pcs" },
          sizes: [],
          customFields: [],
        },
      ],
      categories: [{ id: "c1", name: "Pipes & Fittings", isActive: true }],
      units: [{ id: "u1", name: "Pcs" }],
    });

    await renderEditPage("mat-1");

    expect(screen.getByLabelText("Name")).toHaveValue("RCC Pipe");
  });

  it("calls notFound() for a Material ID that does not exist", async () => {
    mockFetchRouter({ materials: [] });

    await expect(renderEditPage("missing-id")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalled();
  });

  it("keeps the Material's own current Category selectable even if it has since been disabled", async () => {
    mockFetchRouter({
      materials: [
        {
          id: "mat-1",
          name: "RCC Pipe",
          isActive: true,
          category: { id: "c1", name: "Discontinued Category" },
          unit: { id: "u1", name: "Pcs" },
          sizes: [],
          customFields: [],
        },
      ],
      categories: [{ id: "c1", name: "Discontinued Category", isActive: false }],
      units: [{ id: "u1", name: "Pcs" }],
    });

    await renderEditPage("mat-1");

    expect(screen.getByRole("option", { name: "Discontinued Category" })).toBeInTheDocument();
  });
});
