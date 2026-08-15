import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("./actions", () => ({
  createTeamMemberAction: Object.assign(vi.fn(async () => ({})), { bind: vi.fn(() => vi.fn(async () => ({}))) }),
}));

import { NewTeamMemberForm } from "./new-team-member-form";

describe("NewTeamMemberForm", () => {
  it("renders Name, Employment Type options, and optional Designation/Contact fields", () => {
    render(<NewTeamMemberForm employmentTypes={[{ id: "e1", name: "Weekly" }]} />);

    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Role / Designation")).toBeInTheDocument();
    expect(screen.getByLabelText("Contact")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Weekly" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create Team Member" })).toBeInTheDocument();
  });

  it('shows "No Employment Types yet" guidance instead of an empty, unusable select when none exist', () => {
    render(<NewTeamMemberForm employmentTypes={[]} />);

    expect(screen.getByText(/No Employment Types yet/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "create one first" })).toHaveAttribute("href", "/team/employment-types");
    expect(screen.queryByLabelText("Name")).not.toBeInTheDocument();
  });
});
