import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const notFoundMock = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
);
vi.mock("next/navigation", () => ({
  notFound: notFoundMock,
  useRouter: () => ({ push: vi.fn() }),
}));

const printMock = vi.fn();

import SitePhotosPrintPage from "./page";

const originalFetch = global.fetch;
const originalApiUrl = process.env.API_URL;
const originalPrint = window.print;

beforeEach(() => {
  process.env.API_URL = "http://localhost:3001";
  notFoundMock.mockClear();
  window.print = printMock;
  printMock.mockClear();
});

afterEach(() => {
  global.fetch = originalFetch;
  process.env.API_URL = originalApiUrl;
  window.print = originalPrint;
  vi.restoreAllMocks();
});

function mockFetchRouter(handlers: { site?: unknown; photos?: unknown }) {
  global.fetch = vi.fn((url: string) => {
    const urlStr = String(url);
    if (urlStr.endsWith("/photos")) {
      return Promise.resolve({ ok: true, json: async () => handlers.photos ?? [] });
    }
    return Promise.resolve({ ok: true, json: async () => handlers.site ?? null });
  }) as unknown as typeof fetch;
}

async function renderPrintPage(id: string, searchParams: { ids?: string; layout?: string }) {
  const element = await SitePhotosPrintPage({
    params: Promise.resolve({ id }),
    searchParams: Promise.resolve(searchParams),
  });
  return render(element);
}

describe("SitePhotosPrintPage", () => {
  it("filters the Site's full gallery down to only the requested ids, preserving gallery order", async () => {
    mockFetchRouter({
      site: { id: "site-1", name: "NH-48" },
      photos: [
        { id: "p3", url: "u3", previewUrl: "pv3", reportDate: "2026-08-12", dailySiteReportId: null, uploaderName: "A", createdAt: "2026-08-12T00:00:00Z", category: "GENERAL", description: null },
        { id: "p2", url: "u2", previewUrl: "pv2", reportDate: "2026-08-11", dailySiteReportId: null, uploaderName: "B", createdAt: "2026-08-11T00:00:00Z", category: "GENERAL", description: null },
        { id: "p1", url: "u1", previewUrl: "pv1", reportDate: "2026-08-10", dailySiteReportId: null, uploaderName: "C", createdAt: "2026-08-10T00:00:00Z", category: "GENERAL", description: null },
      ],
    });

    const { container } = await renderPrintPage("site-1", { ids: "p1,p3", layout: "4" });

    expect(container.querySelectorAll("img")).toHaveLength(2);
    expect(screen.getByText(/12\/Aug\/2026/)).toBeInTheDocument();
    expect(screen.getByText(/10\/Aug\/2026/)).toBeInTheDocument();
    expect(screen.queryByText(/11\/Aug\/2026/)).not.toBeInTheDocument();
  });

  it("defaults to a 1-per-page layout for an invalid/missing layout param", async () => {
    mockFetchRouter({
      site: { id: "site-1", name: "NH-48" },
      photos: [
        { id: "p1", url: "u1", previewUrl: "pv1", reportDate: "2026-08-10", dailySiteReportId: null, uploaderName: "A", createdAt: "2026-08-10T00:00:00Z", category: "GENERAL", description: null },
        { id: "p2", url: "u2", previewUrl: "pv2", reportDate: "2026-08-11", dailySiteReportId: null, uploaderName: "B", createdAt: "2026-08-11T00:00:00Z", category: "GENERAL", description: null },
      ],
    });

    const { container } = await renderPrintPage("site-1", { ids: "p1,p2", layout: "9" });

    // layout=1 -> one photo per page group -> 2 distinct grid groups.
    const pageGroups = container.querySelectorAll("div.grid");
    expect(pageGroups).toHaveLength(2);
  });

  it("calls notFound() for a Site ID that doesn't exist", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 }) as unknown as typeof fetch;

    await expect(renderPrintPage("missing-id", {})).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalled();
  });
});
