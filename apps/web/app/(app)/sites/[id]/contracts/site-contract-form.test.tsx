import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SiteContractForm } from "./site-contract-form";

const createSubcontractorQuickActionMock = vi.fn();
vi.mock("@/app/(app)/subcontractors/new/actions", () => ({
  createSubcontractorQuickAction: (...args: unknown[]) => createSubcontractorQuickActionMock(...args),
}));

const SUBCONTRACTORS = [
  { id: "sc1", name: "Ganesh Pipeline Works" },
  { id: "sc2", name: "Bhide Electricals" },
];

function noopAction() {
  return Promise.resolve({});
}

describe("SiteContractForm", () => {
  it("shows the Fixed Amount field, and hides the Rate/Estimated Quantity fields, when Fixed Cost is selected", async () => {
    const user = userEvent.setup();
    render(
      <SiteContractForm
        mode="new"
        siteId="site-1"
        subcontractors={SUBCONTRACTORS}
        action={noopAction}
      />,
    );

    await user.selectOptions(screen.getByLabelText("Rate type"), "FIXED_COST");

    expect(screen.getByLabelText(/Total contract amount/)).not.toBeDisabled();
    expect(screen.getByLabelText(/Rate per/)).toBeDisabled();
    expect(screen.getByLabelText("Estimated quantity")).toBeDisabled();
  });

  it("shows the Unit label field only for Per Unit / Custom rate types", async () => {
    const user = userEvent.setup();
    render(
      <SiteContractForm
        mode="new"
        siteId="site-1"
        subcontractors={SUBCONTRACTORS}
        action={noopAction}
      />,
    );

    await user.selectOptions(screen.getByLabelText("Rate type"), "PER_PIPE");
    expect(screen.getByLabelText("Unit label")).toBeDisabled();

    await user.selectOptions(screen.getByLabelText("Rate type"), "PER_UNIT");
    expect(screen.getByLabelText("Unit label")).not.toBeDisabled();
  });

  it("preserves a typed rate when toggling rateType away and back", async () => {
    const user = userEvent.setup();
    render(
      <SiteContractForm
        mode="new"
        siteId="site-1"
        subcontractors={SUBCONTRACTORS}
        action={noopAction}
      />,
    );

    await user.selectOptions(screen.getByLabelText("Rate type"), "PER_PIPE");
    await user.type(screen.getByLabelText(/Rate per pipe/), "250");

    await user.selectOptions(screen.getByLabelText("Rate type"), "FIXED_COST");
    await user.selectOptions(screen.getByLabelText("Rate type"), "PER_PIPE");

    expect(screen.getByLabelText(/Rate per pipe/)).toHaveValue(250);
  });

  it("disables the Subcontractor field in edit mode — the engaged Subcontractor is not reassignable", () => {
    render(
      <SiteContractForm
        mode="edit"
        siteId="site-1"
        subcontractors={SUBCONTRACTORS}
        action={noopAction}
        initial={{
          id: "c1",
          subcontractorId: "sc1",
          workCategory: null,
          description: null,
          rateType: null,
          rateUnitLabel: null,
          rate: null,
          fixedAmount: null,
          estimatedQuantity: null,
          status: "DRAFT",
          startDate: null,
          endDate: null,
        }}
      />,
    );

    expect(screen.getByLabelText("Subcontractor")).toBeDisabled();
  });

  it("leaves the Subcontractor field enabled and required in new mode", () => {
    render(
      <SiteContractForm
        mode="new"
        siteId="site-1"
        subcontractors={SUBCONTRACTORS}
        action={noopAction}
      />,
    );

    expect(screen.getByLabelText("Subcontractor")).not.toBeDisabled();
    expect(screen.getByLabelText("Subcontractor")).toBeRequired();
  });

  it("inline quick-create: + Add Subcontractor selects the new record and leaves the typed Work category unchanged", async () => {
    const user = userEvent.setup();
    createSubcontractorQuickActionMock.mockReset();
    createSubcontractorQuickActionMock.mockResolvedValue({ success: true, id: "sc-new", name: "Fresh Electricals" });

    render(
      <SiteContractForm mode="new" siteId="site-1" subcontractors={SUBCONTRACTORS} action={noopAction} />,
    );

    await user.type(screen.getByLabelText("Work category"), "Storm-water pipe laying");

    await user.click(screen.getByLabelText("Subcontractor"));
    await user.click(await screen.findByText("+ Add Subcontractor"));

    const dialog = await screen.findByRole("dialog", { name: "Add Subcontractor" });
    await user.type(within(dialog).getByLabelText("Name"), "Fresh Electricals");
    await user.click(within(dialog).getByRole("button", { name: "Create Subcontractor" }));

    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Add Subcontractor" })).not.toBeInTheDocument());
    expect(screen.getByLabelText("Subcontractor")).toHaveValue("Fresh Electricals");
    expect(screen.getByLabelText("Work category")).toHaveValue("Storm-water pipe laying");
  });
});
