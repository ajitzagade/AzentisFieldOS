import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("./actions", () => ({
  correctVendorAdvanceAction: Object.assign(vi.fn(async () => ({})), { bind: vi.fn(() => vi.fn(async () => ({}))) }),
}));

import { VendorAdvanceCorrectForm } from "./vendor-advance-correct-form";

describe("VendorAdvanceCorrectForm", () => {
  it("shows a correction banner with a required reason field", () => {
    render(<VendorAdvanceCorrectForm correctsId="adv1" originalAmount={5000} />);

    expect(screen.getByText("Filing a correction")).toBeInTheDocument();
    expect(screen.getByLabelText("Reason for this correction")).toBeRequired();
    expect(screen.getByRole("button", { name: "Submit Correction" })).toBeInTheDocument();
  });

  it("asks for the corrected amount (showing the recorded original) instead of a signed delta", () => {
    render(<VendorAdvanceCorrectForm correctsId="adv1" originalAmount={5000} />);

    expect(screen.getByLabelText("Corrected amount")).toBeInTheDocument();
    expect(screen.getByText(/Currently recorded: ₹5,000/)).toBeInTheDocument();
  });

  it("pre-fills the Payment Method field from the original row", () => {
    render(<VendorAdvanceCorrectForm correctsId="adv1" originalAmount={5000} initialPaymentMethod="Cash" />);

    expect(screen.getByLabelText("Payment Method")).toHaveValue("Cash");
  });

  it("derives and submits the signed amount delta from the corrected value typed by the user", async () => {
    const user = userEvent.setup();
    render(<VendorAdvanceCorrectForm correctsId="adv1" originalAmount={5000} />);

    await user.type(screen.getByLabelText("Corrected amount"), "4500");

    expect(document.querySelector('input[name="amount"]')).toHaveValue("-500");
  });

  it("never renders a vendorId field — the redirect target comes from the server response, not the client", () => {
    render(<VendorAdvanceCorrectForm correctsId="adv1" originalAmount={5000} />);

    expect(document.querySelector('input[name="vendorId"]')).not.toBeInTheDocument();
  });
});
