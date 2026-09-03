import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import type { PhotoGalleryItem } from "@azentisfieldos/shared";
import { PhotoGalleryGrid } from "./photo-gallery-grid";

function makePhoto(overrides: Partial<PhotoGalleryItem>): PhotoGalleryItem {
  return {
    id: "photo-1",
    url: "https://cloudinary.example/thumb/1.jpg",
    previewUrl: "https://cloudinary.example/preview/1.jpg",
    reportDate: "2026-08-10",
    dailySiteReportId: "dsr-1",
    uploaderName: "Ramesh Yadav",
    createdAt: "2026-08-10T10:00:00.000Z",
    ...overrides,
  };
}

const threePhotos: PhotoGalleryItem[] = [
  makePhoto({
    id: "photo-1",
    previewUrl: "https://cloudinary.example/preview/1.jpg",
    reportDate: "2026-08-10",
    uploaderName: "Ramesh Yadav",
  }),
  makePhoto({
    id: "photo-2",
    previewUrl: "https://cloudinary.example/preview/2.jpg",
    reportDate: "2026-08-11",
    uploaderName: "Suresh Patil",
  }),
  makePhoto({
    id: "photo-3",
    previewUrl: "https://cloudinary.example/preview/3.jpg",
    reportDate: "2026-08-12",
    uploaderName: "Geeta Rao",
  }),
];

// The grid's <img>s are decorative (alt=""), so they carry no accessible
// "img" role — assert on the rendered <img src> directly within the open
// dialog instead of via getByRole("img").
function previewSrc(dialog: HTMLElement) {
  return dialog.querySelector("img")?.getAttribute("src");
}

describe("PhotoGalleryGrid", () => {
  it("opens the lightbox on the exact photo clicked, showing its previewUrl and caption", async () => {
    const user = userEvent.setup();
    render(<PhotoGalleryGrid photos={threePhotos} />);

    await user.click(screen.getByRole("button", { name: /View photo from 11 Aug 2026/ }));

    const dialog = screen.getByRole("dialog");
    expect(previewSrc(dialog)).toBe("https://cloudinary.example/preview/2.jpg");
    expect(within(dialog).getByText(/Suresh Patil/)).toBeInTheDocument();
  });

  it("navigates Next/Previous across the same array and hides the control at each boundary", async () => {
    const user = userEvent.setup();
    render(<PhotoGalleryGrid photos={threePhotos} />);

    await user.click(screen.getByRole("button", { name: /View photo from 10 Aug 2026/ }));
    let dialog = screen.getByRole("dialog");
    expect(previewSrc(dialog)).toBe("https://cloudinary.example/preview/1.jpg");
    expect(within(dialog).queryByRole("button", { name: "Previous photo" })).not.toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Next photo" })).toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: "Next photo" }));
    dialog = screen.getByRole("dialog");
    expect(previewSrc(dialog)).toBe("https://cloudinary.example/preview/2.jpg");
    expect(within(dialog).getByRole("button", { name: "Previous photo" })).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Next photo" })).toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: "Next photo" }));
    dialog = screen.getByRole("dialog");
    expect(previewSrc(dialog)).toBe("https://cloudinary.example/preview/3.jpg");
    expect(within(dialog).getByRole("button", { name: "Previous photo" })).toBeInTheDocument();
    expect(within(dialog).queryByRole("button", { name: "Next photo" })).not.toBeInTheDocument();

    // No wraparound: Next stays hidden and ArrowRight is a no-op at the end.
    await user.keyboard("{ArrowRight}");
    dialog = screen.getByRole("dialog");
    expect(previewSrc(dialog)).toBe("https://cloudinary.example/preview/3.jpg");

    // ArrowLeft moves back to the previous photo.
    await user.keyboard("{ArrowLeft}");
    dialog = screen.getByRole("dialog");
    expect(previewSrc(dialog)).toBe("https://cloudinary.example/preview/2.jpg");
  });

  it("hides Next/Previous entirely for a single-photo gallery", async () => {
    const user = userEvent.setup();
    render(<PhotoGalleryGrid photos={[threePhotos[0]!]} />);

    await user.click(screen.getByRole("button", { name: /View photo from 10 Aug 2026/ }));

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).queryByRole("button", { name: "Previous photo" })).not.toBeInTheDocument();
    expect(within(dialog).queryByRole("button", { name: "Next photo" })).not.toBeInTheDocument();
  });

  it("closes via the Close button", async () => {
    const user = userEvent.setup();
    render(<PhotoGalleryGrid photos={threePhotos} />);

    await user.click(screen.getByRole("button", { name: /View photo from 10 Aug 2026/ }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    render(<PhotoGalleryGrid photos={threePhotos} />);

    await user.click(screen.getByRole("button", { name: /View photo from 10 Aug 2026/ }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes on a backdrop click", async () => {
    const user = userEvent.setup();
    render(<PhotoGalleryGrid photos={threePhotos} />);

    await user.click(screen.getByRole("button", { name: /View photo from 10 Aug 2026/ }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    const backdrop = document.querySelector('[role="presentation"]');
    expect(backdrop).toBeInTheDocument();
    await user.click(backdrop as Element);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
