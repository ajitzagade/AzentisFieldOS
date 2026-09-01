import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("./actions", () => ({
  createConsumptionAction: Object.assign(vi.fn(async () => ({})), { bind: vi.fn(() => vi.fn(async () => ({}))) }),
}));

import { ConsumptionForm } from "./consumption-form";

const materialSizes = [{ id: "ms1", label: "RCC Pipe (600mm)" }];
const sites = [{ id: "site1", name: "Sector 12 Metro Depot" }];

describe("ConsumptionForm", () => {
  it("renders the core fields for a new Consumption entry", () => {
    render(<ConsumptionForm mode="new" materialSizes={materialSizes} sites={sites} />);

    expect(screen.getByLabelText("Site")).toBeInTheDocument();
    expect(screen.getByLabelText("Material / Size")).toBeInTheDocument();
    expect(screen.getByLabelText("Quantity")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Record Consumption" })).toBeInTheDocument();
  });

  it("uses the searchable Site picker (not a native select) in new mode", () => {
    render(<ConsumptionForm mode="new" materialSizes={materialSizes} sites={sites} />);

    expect(screen.getByLabelText("Site")).toHaveAttribute("role", "combobox");
    expect(document.querySelector('input[name="siteId"]')).toBeInTheDocument();
  });

  it("marks the quantity field for the decimal on-screen keyboard", () => {
    render(<ConsumptionForm mode="new" materialSizes={materialSizes} sites={sites} />);

    expect(screen.getByLabelText("Quantity")).toHaveAttribute("inputmode", "decimal");
  });

  it("shows a correction banner with a required reason field, and locks Site/Material in correct mode", () => {
    render(
      <ConsumptionForm
        mode="correct"
        correctsId="c1"
        materialSizes={materialSizes}
        sites={sites}
        initial={{ siteId: "site1", materialSizeId: "ms1", quantity: 100, consumedAt: "2026-08-10" }}
      />,
    );

    expect(screen.getByText("Filing a correction")).toBeInTheDocument();
    expect(screen.getByLabelText("Reason for this correction")).toBeRequired();
    expect(screen.getByLabelText("Site")).toBeDisabled();
    expect(screen.getByLabelText("Material / Size")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Submit Correction" })).toBeInTheDocument();
  });

  it("asks for the corrected quantity (showing the recorded original) instead of a signed delta in correct mode", () => {
    render(
      <ConsumptionForm
        mode="correct"
        correctsId="c1"
        materialSizes={materialSizes}
        sites={sites}
        initial={{ siteId: "site1", materialSizeId: "ms1", quantity: 100, consumedAt: "2026-08-10" }}
      />,
    );

    expect(screen.getByLabelText("Corrected quantity")).toBeInTheDocument();
    expect(screen.getByText(/Currently recorded: 100/)).toBeInTheDocument();
    expect(screen.queryByText(/signed adjustment/i)).not.toBeInTheDocument();
  });

  it("derives and submits the signed delta from the corrected value typed by the user", async () => {
    const user = userEvent.setup();
    render(
      <ConsumptionForm
        mode="correct"
        correctsId="c1"
        materialSizes={materialSizes}
        sites={sites}
        initial={{ siteId: "site1", materialSizeId: "ms1", quantity: 100, consumedAt: "2026-08-10" }}
      />,
    );

    await user.type(screen.getByLabelText("Corrected quantity"), "80");

    // The user typed the value that is right; the FormData carries the delta.
    expect(document.querySelector('input[name="quantity"]')).toHaveValue("-20");
    expect(screen.getByText(/change of −20 will be recorded/)).toBeInTheDocument();
  });
});
