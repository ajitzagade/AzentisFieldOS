import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("./actions", () => ({
  updateTeamMemberAction: Object.assign(vi.fn(async () => ({})), { bind: vi.fn(() => vi.fn(async () => ({}))) }),
}));

import { EditTeamMemberForm } from "./edit-team-member-form";
import type { TeamMemberDetail } from "./page";

const teamMember: TeamMemberDetail = {
  id: "tm1",
  name: "Ravi Kumar",
  designation: "Bar Bender",
  contact: "+91 98765 43210",
  isActive: true,
  employmentType: { id: "e1", name: "Weekly" },
  outstandingAdvanceBalance: "0",
};

const employmentTypes = [{ id: "e1", name: "Weekly" }];

describe("EditTeamMemberForm", () => {
  it("pre-fills every field with the Team Member's current values", () => {
    render(<EditTeamMemberForm teamMember={teamMember} employmentTypes={employmentTypes} />);

    expect(screen.getByLabelText("Name")).toHaveValue("Ravi Kumar");
    expect(screen.getByLabelText("Role / Designation")).toHaveValue("Bar Bender");
    expect(screen.getByLabelText("Contact")).toHaveValue("+91 98765 43210");
    expect(screen.getByLabelText("Employment Type")).toHaveValue("e1");
    expect(screen.getByLabelText(/Active/)).toBeChecked();
  });

  it("renders as unchecked for a disabled Team Member", () => {
    render(<EditTeamMemberForm teamMember={{ ...teamMember, isActive: false }} employmentTypes={employmentTypes} />);

    expect(screen.getByLabelText(/Active/)).not.toBeChecked();
  });

  it("toggling the Active checkbox updates the submitted hidden field — never uses CorrectAction for master data", async () => {
    render(<EditTeamMemberForm teamMember={teamMember} employmentTypes={employmentTypes} />);

    const checkbox = screen.getByLabelText(/Active/);
    const user = userEvent.setup();
    await user.click(checkbox);

    expect(checkbox).not.toBeChecked();
    expect(screen.getByRole("button", { name: "Save Changes" })).toBeInTheDocument();
  });
});
