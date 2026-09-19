import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const refreshMock = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: refreshMock }) }));

const authedFetchMock = vi.hoisted(() => vi.fn());
vi.mock("@/lib/use-authed-fetch", () => ({
  useAuthedFetch: () => authedFetchMock,
}));

import { UsersRolesSection, type UserRow } from "./users-roles-section";

const owner: UserRow = {
  id: "u-owner",
  name: "Asha Verma",
  email: "asha@azentis.in",
  role: "OWNER_ADMIN",
  isActive: true,
};
const supervisor: UserRow = {
  id: "u-sup",
  name: "Suresh Rao",
  email: "suresh@azentis.in",
  role: "SITE_SUPERVISOR",
  isActive: true,
};

beforeEach(() => {
  window.localStorage.clear();
  refreshMock.mockClear();
  authedFetchMock.mockReset();
  authedFetchMock.mockResolvedValue({ ok: true, status: 200, json: async () => ({}) });
});

afterEach(() => {
  vi.restoreAllMocks();
});

// The shared DataTable renders a desktop and a mobile (card) copy of every
// row simultaneously (one CSS-hidden) — jsdom sees both, so row-level
// queries use getAllBy* and click the first match.
describe("UsersRolesSection admin actions", () => {
  it("shows a status badge per user and never offers Deactivate on your own row", () => {
    render(
      <UsersRolesSection
        users={[owner, { ...supervisor, isActive: false }]}
        currentUserId={owner.id}
      />,
    );

    expect(screen.getAllByText("Active").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Deactivated").length).toBeGreaterThan(0);
    // Reactivate offered for the deactivated supervisor; Deactivate for no
    // one (the only active user is the acting owner's own row).
    expect(screen.getAllByRole("button", { name: "Reactivate" }).length).toBeGreaterThan(0);
    expect(screen.queryByRole("button", { name: "Deactivate" })).not.toBeInTheDocument();
  });

  it("resets a password through the dialog, validating with the shared schema first", async () => {
    render(<UsersRolesSection users={[owner, supervisor]} currentUserId={owner.id} />);
    const user = userEvent.setup();

    // Target the supervisor's table row explicitly — index math over
    // getAllByRole is fragile against the desktop+mobile duplicate DOM.
    const supervisorRow = screen
      .getAllByRole("row")
      .find((row) => within(row).queryByText("Suresh Rao"))!;
    await user.click(within(supervisorRow).getByRole("button", { name: "Reset password" }));
    const dialog = await screen.findByRole("alertdialog");

    // Too short → inline schema error, no network call.
    await user.type(within(dialog).getByLabelText("New password"), "short");
    await user.click(within(dialog).getByRole("button", { name: "Set new password" }));
    expect(await within(dialog).findByText(/8 characters/i)).toBeInTheDocument();
    expect(authedFetchMock).not.toHaveBeenCalled();

    await user.clear(within(dialog).getByLabelText("New password"));
    await user.type(within(dialog).getByLabelText("New password"), "a-strong-password");
    await user.click(within(dialog).getByRole("button", { name: "Set new password" }));

    await waitFor(() =>
      expect(authedFetchMock).toHaveBeenCalledWith(
        "/users/u-sup/password",
        expect.objectContaining({ method: "PATCH" }),
      ),
    );
    expect(
      JSON.parse((authedFetchMock.mock.calls[0]![1] as RequestInit).body as string),
    ).toEqual({ password: "a-strong-password" });
    // Dialog closes and a confirmation notice appears.
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    expect(screen.getByText(/Password for suresh@azentis.in has been reset/)).toBeInTheDocument();
  });

  it("deactivates another user after playing back their details for confirmation", async () => {
    render(<UsersRolesSection users={[owner, supervisor]} currentUserId={owner.id} />);
    const user = userEvent.setup();

    await user.click(screen.getAllByRole("button", { name: "Deactivate" })[0]!);
    const dialog = await screen.findByRole("alertdialog");
    expect(within(dialog).getByText("Suresh Rao")).toBeInTheDocument();
    expect(within(dialog).getByText("suresh@azentis.in")).toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: "Deactivate" }));

    await waitFor(() =>
      expect(authedFetchMock).toHaveBeenCalledWith(
        "/users/u-sup/active",
        expect.objectContaining({ method: "PATCH" }),
      ),
    );
    expect(
      JSON.parse((authedFetchMock.mock.calls[0]![1] as RequestInit).body as string),
    ).toEqual({ isActive: false });
    await waitFor(() => expect(refreshMock).toHaveBeenCalled());
  });
});
