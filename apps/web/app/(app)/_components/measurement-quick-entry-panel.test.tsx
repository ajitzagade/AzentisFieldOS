import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ToastProvider, Toaster } from "@azentisfieldos/ui";

const sitesFetchMock = vi.fn();
vi.mock("@/lib/use-authed-fetch", () => ({
  useAuthedFetch: () => sitesFetchMock,
}));

const uploadSitePhotoMock = vi.fn();
vi.mock("@/lib/site-photo-upload", () => ({
  uploadSitePhoto: (...args: unknown[]) => uploadSitePhotoMock(...args),
}));

const refreshMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: refreshMock }),
}));

import { MeasurementQuickEntryPanel } from "./measurement-quick-entry-panel";

function renderPanel(open = true) {
  const onOpenChange = vi.fn();
  const utils = render(
    <ToastProvider>
      <MeasurementQuickEntryPanel open={open} onOpenChange={onOpenChange} />
      <Toaster />
    </ToastProvider>,
  );
  return { ...utils, onOpenChange };
}

describe("MeasurementQuickEntryPanel", () => {
  beforeEach(() => {
    // A remembered Site (SiteField's own localStorage key) leaks across
    // tests otherwise — same gotcha AGENTS.md documents for every other
    // SiteField-driven form test.
    window.localStorage.clear();
    sitesFetchMock.mockReset();
    uploadSitePhotoMock.mockReset();
    refreshMock.mockReset();
    sitesFetchMock.mockResolvedValue({
      ok: true,
      json: async () => [{ id: "site-1", name: "NH-48 Highway Widening" }],
    });
  });

  it("fetches Sites only while open", async () => {
    renderPanel(false);
    expect(sitesFetchMock).not.toHaveBeenCalled();

    renderPanel(true);
    await waitFor(() => expect(sitesFetchMock).toHaveBeenCalledWith("/sites", expect.anything()));
  });

  it("blocks submit with inline errors when Site and photos are both missing", async () => {
    const user = userEvent.setup();
    renderPanel();
    await screen.findByRole("dialog");

    await user.click(screen.getByRole("button", { name: "Save Measurement" }));

    expect(await screen.findByText("Site is required")).toBeInTheDocument();
    expect(screen.getByText("At least one photo is required")).toBeInTheDocument();
    expect(uploadSitePhotoMock).not.toHaveBeenCalled();
  });

  it("uploads every selected photo tagged as MEASUREMENT with the typed description, then closes and refreshes", async () => {
    const user = userEvent.setup();
    uploadSitePhotoMock.mockResolvedValue({ storageKey: "site/site-1/x.jpg" });
    const { onOpenChange } = renderPanel();
    await screen.findByRole("dialog");

    await user.type(await screen.findByLabelText("Site"), "NH-48");
    await user.click(await screen.findByText("NH-48 Highway Widening"));

    const file1 = new File(["a"], "measurement-1.jpg", { type: "image/jpeg" });
    const file2 = new File(["b"], "measurement-2.jpg", { type: "image/jpeg" });
    const fileInput = screen.getByLabelText("Measurement photos");
    await user.upload(fileInput, [file1, file2]);

    await user.type(screen.getByLabelText("Description"), "Foundation depth at Ch. 4+200");
    await user.click(screen.getByRole("button", { name: "Save Measurement" }));

    await waitFor(() => expect(uploadSitePhotoMock).toHaveBeenCalledTimes(2));
    expect(uploadSitePhotoMock).toHaveBeenNthCalledWith(1, expect.anything(), "site-1", file1, {
      category: "MEASUREMENT",
      description: "Foundation depth at Ch. 4+200",
    });
    expect(uploadSitePhotoMock).toHaveBeenNthCalledWith(2, expect.anything(), "site-1", file2, {
      category: "MEASUREMENT",
      description: "Foundation depth at Ch. 4+200",
    });
    await waitFor(() => expect(onOpenChange.mock.calls[0]?.[0]).toBe(false));
    expect(refreshMock).toHaveBeenCalledTimes(1);
    expect(await screen.findByText("2 measurement photos saved")).toBeInTheDocument();
  });

  it("shows a form-level error and does not close when an upload fails", async () => {
    const user = userEvent.setup();
    uploadSitePhotoMock.mockRejectedValue(new Error("network blip"));
    const { onOpenChange } = renderPanel();
    await screen.findByRole("dialog");

    await user.type(await screen.findByLabelText("Site"), "NH-48");
    await user.click(await screen.findByText("NH-48 Highway Widening"));
    await user.upload(screen.getByLabelText("Measurement photos"), new File(["a"], "m.jpg", { type: "image/jpeg" }));
    await user.click(screen.getByRole("button", { name: "Save Measurement" }));

    expect(await screen.findByText("Could not save this measurement. Please try again.")).toBeInTheDocument();
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });

  it("Cancel closes the modal without uploading", async () => {
    const user = userEvent.setup();
    const { onOpenChange } = renderPanel();
    await screen.findByRole("dialog");

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onOpenChange.mock.calls[0]?.[0]).toBe(false);
    expect(uploadSitePhotoMock).not.toHaveBeenCalled();
  });
});
