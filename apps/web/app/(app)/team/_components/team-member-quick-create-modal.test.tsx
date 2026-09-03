import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const employmentTypesFetchMock = vi.fn();
vi.mock("@/lib/use-authed-fetch", () => ({
  useAuthedFetch: () => employmentTypesFetchMock,
}));

const createTeamMemberQuickActionMock = vi.fn();
vi.mock("../new/actions", () => ({
  createTeamMemberQuickAction: (...args: unknown[]) => createTeamMemberQuickActionMock(...args),
}));

import { TeamMemberQuickCreateModal } from "./team-member-quick-create-modal";

const EMPLOYMENT_TYPE_ID = "11111111-1111-4111-8111-111111111111";

describe("TeamMemberQuickCreateModal", () => {
  beforeEach(() => {
    employmentTypesFetchMock.mockReset();
    createTeamMemberQuickActionMock.mockReset();
  });

  it("fetches Employment Types only once opened, and submits Name + Employment Type", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    employmentTypesFetchMock.mockResolvedValue({
      ok: true,
      json: async () => [{ id: EMPLOYMENT_TYPE_ID, name: "Daily Wage", isActive: true }],
    });
    createTeamMemberQuickActionMock.mockResolvedValue({ success: true, id: "member-1", name: "Ravi Kumar" });

    render(<TeamMemberQuickCreateModal open onOpenChange={() => {}} onSuccess={onSuccess} />);

    await waitFor(() => expect(employmentTypesFetchMock).toHaveBeenCalledWith("/employment-types", expect.anything()));
    await user.type(screen.getByLabelText("Name"), "Ravi Kumar");
    await screen.findByText("Daily Wage");
    await user.selectOptions(screen.getByLabelText("Employment Type"), "Daily Wage");
    await user.click(screen.getByRole("button", { name: "Create Team Member" }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith({ id: "member-1", name: "Ravi Kumar" }));
    expect(createTeamMemberQuickActionMock).toHaveBeenCalledTimes(1);
  });

  it("shows 'create one first' guidance in place of the picker when no Employment Type exists", async () => {
    employmentTypesFetchMock.mockResolvedValue({ ok: true, json: async () => [] });

    render(<TeamMemberQuickCreateModal open onOpenChange={() => {}} onSuccess={() => {}} />);

    expect(await screen.findByText(/No Employment Types yet/)).toBeInTheDocument();
    expect(screen.queryByLabelText("Employment Type")).not.toBeInTheDocument();
  });
});
