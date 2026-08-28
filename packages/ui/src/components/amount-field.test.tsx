import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { AmountField } from "./amount-field";

describe("AmountField", () => {
  it("renders a ₹ numeric field and reads the typed amount back in words", async () => {
    const user = userEvent.setup();
    render(<AmountField label="Amount" name="amount" />);

    const input = screen.getByLabelText("Amount");
    expect(input).toHaveAttribute("type", "number");
    await user.type(input, "125000");

    expect(screen.getByText("One Lakh Twenty-Five Thousand Rupees")).toBeInTheDocument();
  });

  it("shows the words for an uncontrolled defaultValue (server-action correction pre-fill)", () => {
    render(<AmountField label="Amount" name="amount" defaultValue="500" />);
    expect(screen.getByText("Five Hundred Rupees")).toBeInTheDocument();
  });

  it("falls back to the caller's hint when the field is empty, and error text still wins", () => {
    const { rerender } = render(<AmountField label="Amount" name="amount" hint="Optional" />);
    expect(screen.getByText("Optional")).toBeInTheDocument();

    rerender(<AmountField label="Amount" name="amount" defaultValue="10" error="Amount is required" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Amount is required");
  });
});
