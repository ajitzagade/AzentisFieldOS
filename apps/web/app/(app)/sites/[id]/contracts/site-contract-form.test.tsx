import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { SiteContractForm } from "./site-contract-form";

const SUBCONTRACTORS = [
  { id: "sc1", name: "Ganesh Pipeline Works" },
  { id: "sc2", name: "Bhide Electricals" },
];

function noopAction() {
  return Promise.resolve({});
}

function noopParse() {
  return { success: true as const };
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
        parse={noopParse}
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
        parse={noopParse}
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
        parse={noopParse}
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
        parse={noopParse}
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
        parse={noopParse}
      />,
    );

    expect(screen.getByLabelText("Subcontractor")).not.toBeDisabled();
    expect(screen.getByLabelText("Subcontractor")).toBeRequired();
  });
});
