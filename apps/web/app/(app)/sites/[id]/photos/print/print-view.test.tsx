import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PhotoGalleryItem } from "@azentisfieldos/shared";
import { PhotoPrintView } from "./print-view";

function makePhoto(overrides: Partial<PhotoGalleryItem>): PhotoGalleryItem {
  return {
    id: "photo-1",
    url: "https://cloudinary.example/thumb/1.jpg",
    previewUrl: "https://cloudinary.example/preview/1.jpg",
    reportDate: "2026-08-10",
    dailySiteReportId: null,
    uploaderName: "Ramesh Yadav",
    createdAt: "2026-08-10T10:00:00.000Z",
    category: "GENERAL",
    description: null,
    ...overrides,
  };
}

describe("PhotoPrintView", () => {
  const originalPrint = window.print;

  beforeEach(() => {
    window.print = vi.fn();
  });

  afterEach(() => {
    window.print = originalPrint;
  });

  it("waits for every photo to finish loading before triggering the native print dialog", async () => {
    const { container } = render(
      <PhotoPrintView
        siteId="site-1"
        siteName="NH-48"
        photos={[makePhoto({ id: "p1" }), makePhoto({ id: "p2" })]}
        layout={2}
      />,
    );
    const images = container.querySelectorAll("img");
    expect(images).toHaveLength(2);

    // Regression (2026-09-22): printing used to fire immediately on mount,
    // before the Cloudinary <img> tags had actually loaded — the print
    // preview/PDF then captured them as blank boxes.
    expect(window.print).not.toHaveBeenCalled();
    fireEvent.load(images[0]!);
    expect(window.print).not.toHaveBeenCalled();

    fireEvent.load(images[1]!);
    await waitFor(() => expect(window.print).toHaveBeenCalledTimes(1));
  });

  it("does not trigger print automatically when nothing was selected", () => {
    render(<PhotoPrintView siteId="site-1" siteName="NH-48" photos={[]} layout={1} />);

    expect(window.print).not.toHaveBeenCalled();
    expect(screen.getByText("No photos selected.")).toBeInTheDocument();
  });

  it("chunks photos into pages of `layout` size and captions each with Site, date, and description", () => {
    const photos = [
      makePhoto({ id: "p1", reportDate: "2026-08-10" }),
      makePhoto({ id: "p2", reportDate: "2026-08-11" }),
      makePhoto({ id: "p3", reportDate: "2026-08-12", category: "MEASUREMENT", description: "Slab depth" }),
    ];
    const { container } = render(
      <PhotoPrintView siteId="site-1" siteName="NH-48" photos={photos} layout={2} />,
    );

    // 3 photos at 2-per-page = 2 page groups.
    const pageGroups = container.querySelectorAll("div.grid");
    expect(pageGroups).toHaveLength(2);
    expect(container.querySelectorAll("img")).toHaveLength(3);
    expect(screen.getByText(/NH-48 · 10\/Aug\/2026/)).toBeInTheDocument();
    expect(screen.getByText(/NH-48 · 12\/Aug\/2026 · Measurement · Slab depth/)).toBeInTheDocument();
  });

  it("re-triggers printing from the manual Print button", async () => {
    const { default: userEvent } = await import("@testing-library/user-event");
    const user = userEvent.setup();
    const { container } = render(
      <PhotoPrintView siteId="site-1" siteName="NH-48" photos={[makePhoto({ id: "p1" })]} layout={1} />,
    );
    fireEvent.load(container.querySelector("img")!);
    await waitFor(() => expect(window.print).toHaveBeenCalledTimes(1));

    await user.click(screen.getByRole("button", { name: "Print" }));

    expect(window.print).toHaveBeenCalledTimes(2);
  });

  it("links back to the Site's Photos page", () => {
    render(<PhotoPrintView siteId="site-1" siteName="NH-48" photos={[makePhoto({ id: "p1" })]} layout={1} />);

    expect(screen.getByRole("link", { name: /Back to Site Photos/ })).toHaveAttribute(
      "href",
      "/sites/site-1/photos",
    );
  });
});
