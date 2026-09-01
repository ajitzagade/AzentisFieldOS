import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("./actions", () => ({
  createAdvanceAdjustmentAction: Object.assign(vi.fn(async () => ({})), { bind: vi.fn(() => vi.fn(async () => ({}))) }),
}));

import { AdjustmentForm } from "./adjustment-form";

describe("AdjustmentForm", () => {
  it("renders the core fields for a new Adjustment entry, with the Outstanding Balance cap as inline help text (AC #1)", () => {
    render(<AdjustmentForm mode="new" teamMemberId="tm1" advanceId="adv1" outstandingBalance="8000" />);

    expect(screen.getByLabelText("Adjustment amount")).toBeInTheDocument();
    expect(screen.getByLabelText("Date")).toBeInTheDocument();
    expect(screen.getByLabelText("Reason")).toBeInTheDocument();
    expect(screen.getByText("Cannot exceed ₹8,000 (current Outstanding Balance)")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Record Adjustment" })).toBeInTheDocument();
  });

  it("shows a correction banner with a required correctionReason field in correct mode", () => {
    render(
      <AdjustmentForm
        mode="correct"
        originalAmount={5000}
        teamMemberId="tm1"
        advanceId="adv1"
        correctsId="aa1"
        outstandingBalance="8000"
        initial={{ note: "Adjusted against payment", adjustedAt: "2026-08-10" }}
      />,
    );

    expect(screen.getByText("Filing a correction")).toBeInTheDocument();
    expect(screen.getByLabelText("Reason for this correction")).toBeRequired();
    expect(screen.getByRole("button", { name: "Submit Correction" })).toBeInTheDocument();
  });

  it("labels the amount field as an adjustment-of-an-adjustment with a delta hint in correct mode", () => {
    render(<AdjustmentForm mode="correct"
        originalAmount={5000} teamMemberId="tm1" advanceId="adv1" correctsId="aa1" outstandingBalance="8000" />);

    // D4: the user types the corrected amount; the delta is derived underneath.
    expect(screen.getByLabelText("Correct adjustment amount")).toBeInTheDocument();
    expect(screen.getByText(/Currently recorded: ₹5,000/)).toBeInTheDocument();
  });
});
