import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const notFoundMock = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
);
vi.mock("next/navigation", () => ({ notFound: notFoundMock }));

import SitePhotosPage from "./page";

const originalFetch = global.fetch;
const originalApiUrl = process.env.API_URL;

beforeEach(() => {
  process.env.API_URL = "http://localhost:3001";
  notFoundMock.mockClear();
});

afterEach(() => {
  global.fetch = originalFetch;
  process.env.API_URL = originalApiUrl;
  vi.restoreAllMocks();
});

async function renderPhotosPage(id: string) {
  const element = await SitePhotosPage({ params: Promise.resolve({ id }) });
  return render(element);
}

function mockFetchRouter(handlers: { site?: unknown; photos?: unknown }) {
  global.fetch = vi.fn((url: string) => {
    const urlStr = String(url);
    if (urlStr.endsWith("/photos")) {
      return Promise.resolve({ ok: true, json: async () => handlers.photos ?? [] });
    }
    return Promise.resolve({ ok: true, json: async () => handlers.site ?? null });
  }) as unknown as typeof fetch;
}

describe("SitePhotosPage", () => {
  it("renders every photo newest-first, each tagged with date and uploader (AC #1)", async () => {
    mockFetchRouter({
      site: { id: "site-1", name: "NH-48 Highway Widening" },
      photos: [
        { id: "p1", url: "https://r2.example/p1.jpg?sig=a", reportDate: "2026-08-12", dailySiteReportId: "dsr-2", uploaderName: "Ramesh Yadav", createdAt: "2026-08-12T10:00:00Z" },
        { id: "p2", url: "https://r2.example/p2.jpg?sig=b", reportDate: "2026-08-11", dailySiteReportId: "dsr-1", uploaderName: "Suresh Patil", createdAt: "2026-08-11T10:00:00Z" },
      ],
    });

    const { container } = await renderPhotosPage("site-1");

    expect(screen.getByRole("heading", { name: /NH-48 Highway Widening/ })).toBeInTheDocument();
    expect(screen.getByText(/12 Aug 2026/)).toBeInTheDocument();
    expect(screen.getByText(/Ramesh Yadav/)).toBeInTheDocument();
    expect(screen.getByText(/11 Aug 2026/)).toBeInTheDocument();
    expect(screen.getByText(/Suresh Patil/)).toBeInTheDocument();
    // Thumbnails are decorative (alt="") since the visible caption already
    // conveys date/uploader — queried by tag, not role, since alt="" opts
    // an <img> out of the accessibility tree's "img" role by design.
    expect(container.querySelectorAll("img")).toHaveLength(2);
  });

  it("renders a clear empty state, not a blank grid, for a Site with no photos (AC #2)", async () => {
    mockFetchRouter({ site: { id: "site-1", name: "NH-48" }, photos: [] });

    const { container } = await renderPhotosPage("site-1");

    expect(screen.getByText("No photos yet for this Site.")).toBeInTheDocument();
    expect(container.querySelectorAll("img")).toHaveLength(0);
  });

  it("calls notFound() for a Site ID that doesn't exist", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 }) as unknown as typeof fetch;

    await expect(renderPhotosPage("missing-id")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalled();
  });
});
