import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("./actions", () => ({
  createAdvanceAction: Object.assign(vi.fn(async () => ({})), { bind: vi.fn(() => vi.fn(async () => ({}))) }),
}));

import { AdvanceForm } from "./advance-form";

describe("AdvanceForm", () => {
  it("renders the core fields for a new Advance entry", () => {
    render(<AdvanceForm mode="new" teamMemberId="tm1" />);

    expect(screen.getByLabelText("Amount")).toBeInTheDocument();
    expect(screen.getByLabelText("Date")).toBeInTheDocument();
    expect(screen.getByLabelText("Reason")).toBeInTheDocument();
    expect(screen.getByLabelText("Payment Method")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Record Advance" })).toBeInTheDocument();
  });

  it("shows a correction banner with a required correctionReason field in correct mode", () => {
    render(
      <AdvanceForm
        mode="correct"
        originalAmount={5000}
        teamMemberId="tm1"
        correctsId="a1"
        initial={{ reason: "Medical", paymentMethod: "Cash", givenAt: "2026-08-10" }}
      />,
    );

    expect(screen.getByText("Filing a correction")).toBeInTheDocument();
    expect(screen.getByLabelText("Reason for this correction")).toBeRequired();
    expect(screen.getByRole("button", { name: "Submit Correction" })).toBeInTheDocument();
  });

  it("labels the amount field as an adjustment with a delta hint in correct mode", () => {
    render(<AdvanceForm mode="correct"
        originalAmount={5000} teamMemberId="tm1" correctsId="a1" />);

    // D4: the user types the corrected amount; the delta is derived underneath.
    expect(screen.getByLabelText("Correct amount")).toBeInTheDocument();
    expect(screen.getByText(/Currently recorded: ₹5,000/)).toBeInTheDocument();
  });
});
