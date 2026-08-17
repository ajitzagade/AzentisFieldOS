import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("./actions", () => ({
  createPaymentAction: Object.assign(vi.fn(async () => ({})), { bind: vi.fn(() => vi.fn(async () => ({}))) }),
}));

import { PaymentForm } from "./payment-form";

const teamMembers = [
  { id: "tm1", name: "Ravi Kumar", outstandingAdvanceBalance: "8000" },
  { id: "tm2", name: "Sanjay Pawar", outstandingAdvanceBalance: "0" },
];

const advances = [
  { id: "adv1", teamMemberId: "tm1", label: "₹5,000 — 5 Aug 2026 (Medical)" },
  { id: "adv2", teamMemberId: "tm2", label: "₹2,000 — 1 Aug 2026" },
];

describe("PaymentForm", () => {
  it("renders the core fields for a new Payment entry", () => {
    render(<PaymentForm mode="new" teamMembers={teamMembers} advances={advances} />);

    expect(screen.getByLabelText("Team Member")).toBeInTheDocument();
    expect(screen.getByLabelText("Base Pay")).toBeInTheDocument();
    expect(screen.getByLabelText("Additional Amount")).toBeInTheDocument();
    expect(screen.getByLabelText("Deductions")).toBeInTheDocument();
    expect(screen.getByLabelText("Period")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Record Payment" })).toBeInTheDocument();
  });

  it("computes Net Payable live from Base Pay + Additional - Deductions with no Advance Adjustment (AC #1, #3)", async () => {
    const user = userEvent.setup();
    render(<PaymentForm mode="new" teamMembers={teamMembers} advances={advances} />);

    await user.type(screen.getByLabelText("Base Pay"), "15000");
    await user.clear(screen.getByLabelText("Additional Amount"));
    await user.type(screen.getByLabelText("Additional Amount"), "2000");
    await user.clear(screen.getByLabelText("Deductions"));
    await user.type(screen.getByLabelText("Deductions"), "500");

    expect(screen.getByText("₹16,500")).toBeInTheDocument();
  });

  it("reveals the Advance Adjustment section, scoped to the selected Team Member, when the checkbox is checked", async () => {
    const user = userEvent.setup();
    render(<PaymentForm mode="new" teamMembers={teamMembers} advances={advances} />);

    expect(screen.queryByLabelText("Advance")).not.toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Team Member"), "tm1");
    await user.click(screen.getByLabelText("Include an Advance Adjustment"));

    expect(screen.getByLabelText("Advance")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "₹5,000 — 5 Aug 2026 (Medical)" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "₹2,000 — 1 Aug 2026" })).not.toBeInTheDocument();
    expect(screen.getByText("Cannot exceed ₹8,000 (current Outstanding Balance)")).toBeInTheDocument();
  });

  it("subtracts the Advance Adjustment amount from the live Net Payable preview when included (AC #1, #4)", async () => {
    const user = userEvent.setup();
    render(<PaymentForm mode="new" teamMembers={teamMembers} advances={advances} />);

    await user.type(screen.getByLabelText("Base Pay"), "15000");
    await user.selectOptions(screen.getByLabelText("Team Member"), "tm1");
    await user.click(screen.getByLabelText("Include an Advance Adjustment"));
    await user.type(screen.getByLabelText("Adjustment Amount"), "3000");

    expect(screen.getByText("₹12,000")).toBeInTheDocument();
  });

  it("shows a correction banner with a required reason field, and locks Team Member in correct mode", () => {
    render(
      <PaymentForm
        mode="correct"
        teamMembers={teamMembers}
        advances={advances}
        teamMemberId="tm1"
        correctsId="p1"
        initial={{ basePay: "15000", additionalAmount: "0", deductions: "0" }}
      />,
    );

    expect(screen.getByText("Filing a correction")).toBeInTheDocument();
    expect(screen.getByLabelText("Reason for this correction")).toBeRequired();
    expect(screen.getByLabelText("Team Member")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Submit Correction" })).toBeInTheDocument();
  });
});
