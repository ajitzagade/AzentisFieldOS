import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const pushMock = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: pushMock, refresh: vi.fn() }) }));

const authedFetchMock = vi.hoisted(() => vi.fn());
vi.mock("@/lib/use-authed-fetch", () => ({
  useAuthedFetch: () => authedFetchMock,
}));

const uploadPhotoMock = vi.hoisted(() => vi.fn());
vi.mock("@/lib/photo-upload", () => ({
  uploadPhoto: uploadPhotoMock,
}));

vi.mock("@/lib/use-dsr-reference-data", () => ({
  useDsrReferenceData: () => ({
    materialOptions: [],
    teamMemberOptions: [],
    vendorOptions: [],
    expenseCategoryOptions: [],
    equipmentOptions: [],
    subcontractorOptions: [],
    vehicleTypeOptions: [],
    rmcGradeOptions: [],
    loading: false,
    loadFailed: false,
    addMaterialOption: vi.fn(),
    addVendorOption: vi.fn(),
    addTeamMemberOption: vi.fn(),
    addSubcontractorOption: vi.fn(),
    addVehicleOption: vi.fn(),
  }),
}));

vi.mock("@/lib/use-site-stock", () => ({
  useSiteStock: () => ({ bySizeId: new Map(), loading: false }),
  stockStatus: () => null,
  withStockMeta: (options: unknown) => options,
}));

import { DsrDesktopForm } from "./dsr-desktop-form";

const INITIAL = {
  siteId: "site-1",
  reportDate: "2026-09-19",
  workCompleted: "Original narrative",
  issuesBlockers: "",
  workRecords: [],
  consumptions: [],
  rmcEntries: [],
  expenses: [],
  equipmentUsed: [],
};

function routeFetch(correctResponse: { status: number; body: unknown }) {
  authedFetchMock.mockImplementation((path: string) => {
    if (path === "/sites") {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => [{ id: "site-1", name: "NH-48" }],
      });
    }
    if (path.endsWith("/correct")) {
      return Promise.resolve({
        ok: correctResponse.status < 400,
        status: correctResponse.status,
        json: async () => correctResponse.body,
      });
    }
    return Promise.resolve({ ok: true, status: 200, json: async () => ({}) });
  });
}

async function fillReasonAndSubmit(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/Reason for this correction/), "Wrong quantity recorded");
  await user.click(screen.getByRole("button", { name: "Submit Correction" }));
  // Correction mode plays the entry back for confirmation first; the
  // dialog's confirm button shares the page button's label, so scope to it.
  const dialog = await screen.findByRole("alertdialog");
  await user.click(within(dialog).getByRole("button", { name: "Submit Correction" }));
}

function attachPhoto() {
  const input = document.querySelector('input[type="file"]')!;
  fireEvent.change(input, {
    target: { files: [new File(["bytes"], "site.jpg", { type: "image/jpeg" })] },
  });
}

beforeEach(() => {
  window.localStorage.clear();
  pushMock.mockClear();
  authedFetchMock.mockReset();
  uploadPhotoMock.mockReset();
  // jsdom has no createObjectURL.
  global.URL.createObjectURL = vi.fn(() => "blob:preview");
  global.URL.revokeObjectURL = vi.fn();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("DsrDesktopForm correction submission (deferred navigation + photo recovery)", () => {
  it("navigates to the corrected report once the POST lands (zero-photo case)", async () => {
    routeFetch({ status: 201, body: { id: "dsr-9" } });
    render(<DsrDesktopForm mode="correct" originalId="dsr-1" initial={INITIAL} />);
    const user = userEvent.setup();

    await fillReasonAndSubmit(user);

    await waitFor(() =>
      expect(pushMock).toHaveBeenCalledWith(expect.stringContaining("/daily-activity/dsr-9")),
    );
  });

  it("never fires a second POST after a successful submission (append-only ledger, AD-9)", async () => {
    routeFetch({ status: 201, body: { id: "dsr-9" } });
    // A failed photo keeps the form mounted post-submission — the window in
    // which a duplicate submit would otherwise be possible.
    uploadPhotoMock.mockRejectedValue("upload failed");
    render(<DsrDesktopForm mode="correct" originalId="dsr-1" initial={INITIAL} />);
    const user = userEvent.setup();

    attachPhoto();
    await fillReasonAndSubmit(user);
    await screen.findByText(/failed to upload/);

    const correctPosts = () =>
      authedFetchMock.mock.calls.filter(([path]) => String(path).endsWith("/correct"));
    expect(correctPosts()).toHaveLength(1);

    // The submit button is disabled; a forced form re-dispatch (Enter key
    // path) must also be a no-op.
    expect(screen.getByRole("button", { name: "Submit Correction" })).toBeDisabled();
    fireEvent.submit(document.querySelector("form")!);
    await waitFor(() => expect(correctPosts()).toHaveLength(1));
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("holds navigation while a photo is failed, then resumes it after a successful Retry", async () => {
    routeFetch({ status: 201, body: { id: "dsr-9" } });
    uploadPhotoMock.mockRejectedValueOnce("upload failed");
    render(<DsrDesktopForm mode="correct" originalId="dsr-1" initial={INITIAL} />);
    const user = userEvent.setup();

    attachPhoto();
    await fillReasonAndSubmit(user);

    // Failed upload: no navigation, error banner, Retry + Remove offered,
    // and no new photos can be added in the recovery state.
    await screen.findByText(/failed to upload/);
    expect(pushMock).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /Report submitted — finishing photo uploads/ })).toBeDisabled();

    uploadPhotoMock.mockResolvedValueOnce({ storageKey: "dsr/x/1" });
    await user.click(screen.getByRole("button", { name: /Retry/ }));

    await waitFor(() =>
      expect(pushMock).toHaveBeenCalledWith(expect.stringContaining("/daily-activity/dsr-9")),
    );
  });

  it("resumes navigation when the last failed photo is removed instead of retried", async () => {
    routeFetch({ status: 201, body: { id: "dsr-9" } });
    uploadPhotoMock.mockRejectedValue("upload failed");
    render(<DsrDesktopForm mode="correct" originalId="dsr-1" initial={INITIAL} />);
    const user = userEvent.setup();

    attachPhoto();
    await fillReasonAndSubmit(user);
    await screen.findByText(/failed to upload/);

    await user.click(screen.getByRole("button", { name: "Remove" }));

    await waitFor(() =>
      expect(pushMock).toHaveBeenCalledWith(expect.stringContaining("/daily-activity/dsr-9")),
    );
  });
});
