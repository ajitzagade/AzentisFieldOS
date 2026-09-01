import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("./actions", () => ({
  createRmcEntryAction: Object.assign(vi.fn(async () => ({})), { bind: vi.fn(() => vi.fn(async () => ({}))) }),
}));

import { RmcForm } from "./rmc-form";

const sites = [{ id: "site1", name: "NH-48 Highway Widening" }];
const vendors = [{ id: "vendor1", name: "Anand RMC Suppliers" }];

const correctionInitial = {
  siteId: "site1",
  vendorId: "vendor1",
  grade: "M25",
  quantityM3: "42",
  ratePerM3: "6200",
  totalAmount: "260400",
  deliveredAt: "2026-08-05",
};

describe("RmcForm", () => {
  it("renders the core fields for a new RMC delivery", () => {
    render(<RmcForm mode="new" sites={sites} vendors={vendors} />);

    expect(screen.getByLabelText("Site")).toBeInTheDocument();
    expect(screen.getByLabelText("Vendor")).toBeInTheDocument();
    expect(screen.getByLabelText("Vendor")).toHaveAttribute("role", "combobox");
    expect(screen.getByLabelText("Grade")).toBeInTheDocument();
    expect(screen.getByLabelText("Quantity (m³)")).toBeInTheDocument();
    expect(screen.getByLabelText("Rate / m³")).toBeInTheDocument();
    expect(screen.getByLabelText("Total Amount")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Record RMC Delivery" })).toBeInTheDocument();
  });

  it("marks the quantity field for the decimal on-screen keyboard", () => {
    render(<RmcForm mode="new" sites={sites} vendors={vendors} />);

    expect(screen.getByLabelText("Quantity (m³)")).toHaveAttribute("inputmode", "decimal");
  });

  it("auto-computes Total Amount = quantity × rate as either changes", async () => {
    const user = userEvent.setup();
    render(<RmcForm mode="new" sites={sites} vendors={vendors} />);

    await user.type(screen.getByLabelText("Quantity (m³)"), "42");
    await user.type(screen.getByLabelText("Rate / m³"), "6200");

    expect(screen.getByLabelText("Total Amount")).toHaveValue(260400);
  });

  it("lets the user type over the computed total, then recomputes (clearing the override) when quantity changes", async () => {
    const user = userEvent.setup();
    render(<RmcForm mode="new" sites={sites} vendors={vendors} />);

    await user.type(screen.getByLabelText("Quantity (m³)"), "10");
    await user.type(screen.getByLabelText("Rate / m³"), "100");
    expect(screen.getByLabelText("Total Amount")).toHaveValue(1000);

    // Manual override sticks…
    await user.clear(screen.getByLabelText("Total Amount"));
    await user.type(screen.getByLabelText("Total Amount"), "950");
    expect(screen.getByLabelText("Total Amount")).toHaveValue(950);

    // …until quantity or rate changes, which recomputes.
    await user.type(screen.getByLabelText("Quantity (m³)"), "0");
    expect(screen.getByLabelText("Total Amount")).toHaveValue(10000);
  });

  it("shows a correction banner with a required reason field, and locks Site/Vendor/Grade in correct mode", () => {
    render(<RmcForm mode="correct" correctsId="rmc1" sites={sites} vendors={vendors} initial={correctionInitial} />);

    expect(screen.getByText("Filing a correction")).toBeInTheDocument();
    expect(screen.getByLabelText("Reason for this correction")).toBeRequired();
    expect(screen.getByLabelText("Site")).toBeDisabled();
    expect(screen.getByLabelText("Vendor")).toBeDisabled();
    expect(screen.getByLabelText("Grade")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Submit Correction" })).toBeInTheDocument();
  });

  it("asks for corrected quantity and total (showing the recorded originals) instead of signed deltas in correct mode", () => {
    render(<RmcForm mode="correct" correctsId="rmc1" sites={sites} vendors={vendors} initial={correctionInitial} />);

    expect(screen.getByLabelText("Corrected quantity (m³)")).toBeInTheDocument();
    expect(screen.getByText(/Currently recorded: 42/)).toBeInTheDocument();
    expect(screen.getByLabelText("Corrected total amount")).toBeInTheDocument();
    expect(screen.getByText(/Currently recorded: ₹2,60,400/)).toBeInTheDocument();
    expect(screen.queryByText(/signed adjustment/i)).not.toBeInTheDocument();
  });

  it("derives and submits the signed quantity delta from the corrected value typed by the user", async () => {
    const user = userEvent.setup();
    render(<RmcForm mode="correct" correctsId="rmc1" sites={sites} vendors={vendors} initial={correctionInitial} />);

    await user.type(screen.getByLabelText("Corrected quantity (m³)"), "36");

    expect(document.querySelector('input[name="quantityM3"]')).toHaveValue("-6");
  });

  it("sources Site and Vendor fields from their respective lists, not free text", () => {
    render(<RmcForm mode="new" sites={sites} vendors={vendors} />);

    // Both are the shared searchable picker — an ARIA combobox over the
    // Site/Vendor lists, still never free text.
    expect(screen.getByLabelText("Site")).toHaveAttribute("role", "combobox");
    expect(screen.getByLabelText("Vendor")).toHaveAttribute("role", "combobox");
  });
});
