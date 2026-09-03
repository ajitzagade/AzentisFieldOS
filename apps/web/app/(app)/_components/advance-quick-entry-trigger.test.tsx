import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ToastProvider, Toaster } from "@azentisfieldos/ui";

const teamMembersFetchMock = vi.fn();

vi.mock("@/lib/use-authed-fetch", () => ({
  useAuthedFetch: () => teamMembersFetchMock,
}));

const createAdvanceQuickActionMock = vi.fn();
vi.mock("@/app/(app)/team/[id]/advances/actions", () => ({
  createAdvanceQuickAction: (...args: unknown[]) => createAdvanceQuickActionMock(...args),
}));

const createTeamMemberQuickActionMock = vi.fn();
vi.mock("@/app/(app)/team/new/actions", () => ({
  createTeamMemberQuickAction: (...args: unknown[]) => createTeamMemberQuickActionMock(...args),
}));

const refreshMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: refreshMock }),
}));

import { AdvanceQuickEntryTrigger } from "./advance-quick-entry-trigger";

function renderTrigger() {
  return render(
    <ToastProvider>
      <AdvanceQuickEntryTrigger />
      <Toaster />
    </ToastProvider>,
  );
}

describe("AdvanceQuickEntryTrigger", () => {
  beforeEach(() => {
    // Each test sets its own teamMembersFetchMock/createAdvanceQuickActionMock
    // behavior and asserts on call history — a mock's implementation and
    // call log from a prior test must never leak into the next one.
    teamMembersFetchMock.mockReset();
    createAdvanceQuickActionMock.mockReset();
    createTeamMemberQuickActionMock.mockReset();
    refreshMock.mockReset();
  });

  it("fetches Team Members only once the modal is opened, not on mount", async () => {
    teamMembersFetchMock.mockResolvedValue({
      ok: true,
      json: async () => [{ id: "11111111-1111-4111-8111-111111111111", name: "Ramesh Kumar" }],
    });
    renderTrigger();

    expect(teamMembersFetchMock).not.toHaveBeenCalled();

    await userEvent.setup().click(screen.getByRole("button", { name: /record advance/i }));

    await waitFor(() => expect(teamMembersFetchMock).toHaveBeenCalledWith("/team-members", expect.anything()));
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(await screen.findByLabelText("Team Member")).toBeInTheDocument();
  });

  it("shows an inline 'couldn't load' state on the combobox when GET /team-members fails, but still opens the modal", async () => {
    teamMembersFetchMock.mockResolvedValue({ ok: false, status: 500 });
    renderTrigger();

    await userEvent.setup().click(screen.getByRole("button", { name: /record advance/i }));

    expect(await screen.findByText("Couldn't load Team Members")).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("on a successful submit: closes the modal, shows a success toast, and never redirects — stays on the Dashboard", async () => {
    const user = userEvent.setup();
    teamMembersFetchMock.mockResolvedValue({
      ok: true,
      json: async () => [{ id: "11111111-1111-4111-8111-111111111111", name: "Ramesh Kumar" }],
    });
    createAdvanceQuickActionMock.mockResolvedValue({ success: true });
    renderTrigger();

    await user.click(screen.getByRole("button", { name: /record advance/i }));
    await screen.findByRole("dialog");

    await user.type(await screen.findByLabelText("Team Member"), "Ramesh");
    await user.click(await screen.findByText("Ramesh Kumar"));
    await user.type(screen.getByLabelText("Amount"), "1500");
    await user.click(screen.getByRole("button", { name: "Record Advance" }));

    await waitFor(() => expect(createAdvanceQuickActionMock).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Record Advance" })).not.toBeInTheDocument());
    expect(await screen.findByText("Advance recorded")).toBeInTheDocument();
    // The Outstanding Advances figure this trigger sits on is read
    // server-side by OwnerDashboard — a successful entry must refresh it.
    expect(refreshMock).toHaveBeenCalledTimes(1);
  });

  it("shows the 'couldn't load' state instead of crashing when GET /team-members returns a 2xx with a non-array body", async () => {
    teamMembersFetchMock.mockResolvedValue({ ok: true, json: async () => ({ notAnArray: true }) });
    renderTrigger();

    await userEvent.setup().click(screen.getByRole("button", { name: /record advance/i }));

    expect(await screen.findByText("Couldn't load Team Members")).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("Cancel closes the modal without calling the action, and aborts the in-flight Team Member fetch", async () => {
    const user = userEvent.setup();
    let aborted = false;
    teamMembersFetchMock.mockImplementation((_path: string, init: RequestInit) => {
      return new Promise((_resolve, reject) => {
        init.signal?.addEventListener("abort", () => {
          aborted = true;
          reject(new DOMException("Aborted", "AbortError"));
        });
      });
    });
    renderTrigger();

    await user.click(screen.getByRole("button", { name: /record advance/i }));
    await screen.findByRole("dialog");
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Record Advance" })).not.toBeInTheDocument());
    expect(aborted).toBe(true);
    expect(createAdvanceQuickActionMock).not.toHaveBeenCalled();
  });

  it("inline quick-create: + Add Team Member selects the new record into the Advance's Team Member picker", async () => {
    const user = userEvent.setup();
    teamMembersFetchMock.mockImplementation((path: string) => {
      if (path === "/team-members") {
        return Promise.resolve({
          ok: true,
          json: async () => [{ id: "11111111-1111-4111-8111-111111111111", name: "Ramesh Kumar" }],
        });
      }
      if (path === "/employment-types") {
        return Promise.resolve({
          ok: true,
          json: async () => [{ id: "22222222-2222-4222-8222-222222222222", name: "Daily Wage", isActive: true }],
        });
      }
      throw new Error(`Unexpected path ${path}`);
    });
    createTeamMemberQuickActionMock.mockResolvedValue({ success: true, id: "member-new", name: "Suresh Patil" });
    renderTrigger();

    await user.click(screen.getByRole("button", { name: /record advance/i }));
    await screen.findByRole("dialog");

    await user.click(screen.getByLabelText("Team Member"));
    await user.click(await screen.findByText("+ Add Team Member"));

    const quickCreateDialog = await screen.findByRole("dialog", { name: "Add Team Member" });
    await user.type(within(quickCreateDialog).getByLabelText("Name"), "Suresh Patil");
    await user.selectOptions(within(quickCreateDialog).getByLabelText("Employment Type"), "Daily Wage");
    await user.click(within(quickCreateDialog).getByRole("button", { name: "Create Team Member" }));

    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Add Team Member" })).not.toBeInTheDocument());
    expect(screen.getByRole("dialog", { name: "Record Advance" })).toBeInTheDocument();
    expect(screen.getByLabelText("Team Member")).toHaveValue("Suresh Patil");
  });
});
