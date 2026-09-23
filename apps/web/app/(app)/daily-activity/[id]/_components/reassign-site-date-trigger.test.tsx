import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ToastProvider, Toaster } from "@azentisfieldos/ui";

const sitesFetchMock = vi.fn();

vi.mock("@/lib/use-authed-fetch", () => ({
  useAuthedFetch: () => sitesFetchMock,
}));

const reassignActionMock = vi.fn();
vi.mock("../reassign-actions", () => ({
  reassignDsrSiteDateAction: (...args: unknown[]) => reassignActionMock(...args),
}));

const refreshMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: refreshMock }),
}));

import { ReassignSiteDateTrigger } from "./reassign-site-date-trigger";

function renderTrigger() {
  return render(
    <ToastProvider>
      <ReassignSiteDateTrigger dsrId="dsr-1" currentSiteId="site-1" currentReportDate="2026-09-20" />
      <Toaster />
    </ToastProvider>,
  );
}

// spec-dsr-reassign-site-date: Owner-only "Reassign Site/Date" — this
// trigger owns the on-open Site fetch, the bound Server Action, and the
// success toast + router.refresh(). Same shape/precedent as
// AdvanceQuickEntryTrigger's own test file.
describe("ReassignSiteDateTrigger", () => {
  beforeEach(() => {
    sitesFetchMock.mockReset();
    reassignActionMock.mockReset();
    refreshMock.mockReset();
  });

  it("fetches Sites only once the modal is opened, not on mount, and pre-selects the current Site", async () => {
    sitesFetchMock.mockResolvedValue({
      ok: true,
      json: async () => [
        { id: "site-1", name: "NH-48 Highway Widening" },
        { id: "site-2", name: "Ring Road Flyover" },
      ],
    });
    renderTrigger();

    expect(sitesFetchMock).not.toHaveBeenCalled();

    await userEvent.setup().click(screen.getByRole("button", { name: /reassign site\/date/i }));

    await waitFor(() => expect(sitesFetchMock).toHaveBeenCalledWith("/sites", expect.anything()));
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(await screen.findByLabelText("Site")).toHaveValue("NH-48 Highway Widening");
    expect(screen.getByLabelText("Date")).toHaveValue("2026-09-20");
  });

  it("shows an inline 'couldn't load' state on the Site combobox when GET /sites fails, but still opens the modal", async () => {
    sitesFetchMock.mockResolvedValue({ ok: false, status: 500 });
    renderTrigger();

    await userEvent.setup().click(screen.getByRole("button", { name: /reassign site\/date/i }));

    expect(await screen.findByText("Couldn't load Sites")).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("on a successful submit: closes the modal, shows a success toast, and refreshes — never navigates away", async () => {
    const user = userEvent.setup();
    sitesFetchMock.mockResolvedValue({
      ok: true,
      json: async () => [
        { id: "site-1", name: "NH-48 Highway Widening" },
        { id: "site-2", name: "Ring Road Flyover" },
      ],
    });
    reassignActionMock.mockResolvedValue({ success: true });
    renderTrigger();

    await user.click(screen.getByRole("button", { name: /reassign site\/date/i }));
    await screen.findByRole("dialog");

    await user.click(screen.getByRole("button", { name: "Reassign" }));

    await waitFor(() => expect(reassignActionMock).toHaveBeenCalledTimes(1));
    // Base UI's Toast item also carries role="dialog" — scope by accessible
    // name (same convention as advance-quick-entry-trigger.test.tsx) so the
    // success toast that follows isn't mistaken for the modal still being open.
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Reassign Site/Date" })).not.toBeInTheDocument());
    expect(await screen.findByText("Report reassigned")).toBeInTheDocument();
    expect(refreshMock).toHaveBeenCalledTimes(1);
  });

  it("surfaces a rejected reassignment (e.g. a target collision) as an inline form error without closing the modal", async () => {
    const user = userEvent.setup();
    sitesFetchMock.mockResolvedValue({
      ok: true,
      json: async () => [{ id: "site-1", name: "NH-48 Highway Widening" }],
    });
    reassignActionMock.mockResolvedValue({
      formError: "A report already exists for that Site and Date",
    });
    renderTrigger();

    await user.click(screen.getByRole("button", { name: /reassign site\/date/i }));
    await screen.findByRole("dialog");
    await user.click(screen.getByRole("button", { name: "Reassign" }));

    expect(await screen.findByText("A report already exists for that Site and Date")).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(refreshMock).not.toHaveBeenCalled();
  });

  it("Cancel closes the modal without calling the action, and aborts the in-flight Site fetch", async () => {
    const user = userEvent.setup();
    let aborted = false;
    sitesFetchMock.mockImplementation((_path: string, init: RequestInit) => {
      return new Promise((_resolve, reject) => {
        init.signal?.addEventListener("abort", () => {
          aborted = true;
          reject(new DOMException("Aborted", "AbortError"));
        });
      });
    });
    renderTrigger();

    await user.click(screen.getByRole("button", { name: /reassign site\/date/i }));
    await screen.findByRole("dialog");
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(aborted).toBe(true);
    expect(reassignActionMock).not.toHaveBeenCalled();
  });
});
