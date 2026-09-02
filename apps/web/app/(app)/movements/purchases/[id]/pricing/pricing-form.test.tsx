import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("./actions", () => ({
  completePricingAction: Object.assign(vi.fn(async () => ({})), {
    bind: vi.fn(() => vi.fn(async () => ({}))),
  }),
}));

import { PricingForm } from "./pricing-form";

// D7: the Owner types the Rate off the bill; Total derives from the
// gate-recorded quantity and stays editable; the one-time money write is
// held for FR-54 re-verification.
describe("PricingForm", () => {
  it("auto-computes Total = recorded quantity × rate, still editable", async () => {
    const user = userEvent.setup();
    render(<PricingForm purchaseId="p1" quantity={50} />);

    await user.type(screen.getByLabelText("Rate"), "390");
    expect(screen.getByLabelText("Total Amount")).toHaveValue(19500);

    await user.clear(screen.getByLabelText("Total Amount"));
    await user.type(screen.getByLabelText("Total Amount"), "19600");
    expect(screen.getByLabelText("Total Amount")).toHaveValue(19600);
  });

  it("holds a valid submit for confirmation with the entered values replayed", async () => {
    const user = userEvent.setup();
    render(<PricingForm purchaseId="p1" quantity={50} />);

    await user.type(screen.getByLabelText("Rate"), "390");
    await user.click(screen.getByRole("button", { name: "Save Pricing" }));

    expect(await screen.findByText("Save this pricing?")).toBeInTheDocument();
    expect(screen.getByText("19500")).toBeInTheDocument();
  });

  it("blocks an invalid submit with inline errors and no confirmation dialog", async () => {
    const user = userEvent.setup();
    render(<PricingForm purchaseId="p1" quantity={50} />);

    await user.click(screen.getByRole("button", { name: "Save Pricing" }));

    expect(screen.queryByText("Save this pricing?")).not.toBeInTheDocument();
    expect(screen.getAllByRole("alert").length).toBeGreaterThan(0);
  });
});
