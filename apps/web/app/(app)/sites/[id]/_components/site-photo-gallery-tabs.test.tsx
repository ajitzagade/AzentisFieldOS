import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PhotoGalleryItem } from "@azentisfieldos/shared";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

import { SitePhotoGalleryTabs } from "./site-photo-gallery-tabs";

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

describe("SitePhotoGalleryTabs", () => {
  beforeEach(() => {
    pushMock.mockClear();
  });

  it("shows every photo under All and only Measurement photos under Measurements", async () => {
    const user = userEvent.setup();
    const photos = [
      makePhoto({ id: "p1", category: "GENERAL", uploaderName: "Ramesh Yadav" }),
      makePhoto({ id: "p2", category: "MEASUREMENT", uploaderName: "Suresh Patil", description: "Slab depth" }),
    ];
    const { container } = render(<SitePhotoGalleryTabs siteId="site-1" photos={photos} />);

    expect(screen.getByRole("button", { name: "All (2)" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Measurements (1)" })).toBeInTheDocument();
    expect(container.querySelectorAll("img")).toHaveLength(2);

    await user.click(screen.getByRole("button", { name: "Measurements (1)" }));

    expect(container.querySelectorAll("img")).toHaveLength(1);
    expect(screen.getByText(/Suresh Patil/)).toBeInTheDocument();
    expect(screen.queryByText(/Ramesh Yadav/)).not.toBeInTheDocument();
  });

  it("shows a Measurements-specific empty state when that tab has no photos", async () => {
    const user = userEvent.setup();
    const photos = [makePhoto({ id: "p1", category: "GENERAL" })];
    render(<SitePhotoGalleryTabs siteId="site-1" photos={photos} />);

    await user.click(screen.getByRole("button", { name: "Measurements (0)" }));

    expect(
      screen.getByText("No measurement photos yet — add one from the Measurement side-menu item."),
    ).toBeInTheDocument();
  });

  it("shows the general empty state when there are no photos at all", () => {
    render(<SitePhotoGalleryTabs siteId="site-1" photos={[]} />);

    expect(
      screen.getByText("No photos yet for this Site — they arrive with Daily Reports, or upload one directly above."),
    ).toBeInTheDocument();
  });

  it("selects photos and navigates to the print view with the chosen layout and ids", async () => {
    const user = userEvent.setup();
    const photos = [
      makePhoto({ id: "p1", reportDate: "2026-08-10" }),
      makePhoto({ id: "p2", reportDate: "2026-08-11" }),
    ];
    render(<SitePhotoGalleryTabs siteId="site-1" photos={photos} />);

    await user.click(screen.getByRole("button", { name: "Select to print" }));
    await user.click(screen.getByRole("button", { name: /Select photo from 10\/Aug\/2026/ }));
    expect(screen.getByText("1 selected")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Print" }));
    await user.click(screen.getByRole("button", { name: "4 per page" }));

    expect(pushMock).toHaveBeenCalledWith("/sites/site-1/photos/print?ids=p1&layout=4");
  });

  // Regression (2026-09-22): the layout dropdown used to stay visibly open
  // after choosing a layout (only unmounting once the route transition
  // finished), inviting a confusing second click.
  it("closes the layout dropdown immediately after choosing a layout", async () => {
    const user = userEvent.setup();
    render(<SitePhotoGalleryTabs siteId="site-1" photos={[makePhoto({ id: "p1", reportDate: "2026-08-10" })]} />);

    await user.click(screen.getByRole("button", { name: "Select to print" }));
    await user.click(screen.getByRole("button", { name: /Select photo from 10\/Aug\/2026/ }));
    await user.click(screen.getByRole("button", { name: "Print" }));
    expect(screen.getByRole("button", { name: "2 per page" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "2 per page" }));

    expect(screen.queryByRole("button", { name: "2 per page" })).not.toBeInTheDocument();
  });

  it("does not show the Print trigger until at least one photo is selected", async () => {
    const user = userEvent.setup();
    render(<SitePhotoGalleryTabs siteId="site-1" photos={[makePhoto({ id: "p1" })]} />);

    await user.click(screen.getByRole("button", { name: "Select to print" }));

    expect(screen.queryByRole("button", { name: "Print" })).not.toBeInTheDocument();
  });

  it("Cancel exits select mode and clears the selection", async () => {
    const user = userEvent.setup();
    render(<SitePhotoGalleryTabs siteId="site-1" photos={[makePhoto({ id: "p1", reportDate: "2026-08-10" })]} />);

    await user.click(screen.getByRole("button", { name: "Select to print" }));
    await user.click(screen.getByRole("button", { name: /Select photo from 10\/Aug\/2026/ }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.getByRole("button", { name: "Select to print" })).toBeInTheDocument();
    expect(screen.queryByText("1 selected")).not.toBeInTheDocument();
  });
});
