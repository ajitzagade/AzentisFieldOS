import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("./actions", () => ({
  createRmcEntryAction: Object.assign(vi.fn(async () => ({})), { bind: vi.fn(() => vi.fn(async () => ({}))) }),
}));

import { RmcForm } from "./rmc-form";

const sites = [{ id: "site1", name: "NH-48 Highway Widening" }];
const vendors = [{ id: "vendor1", name: "Anand RMC Suppliers" }];

describe("RmcForm", () => {
  it("renders the core fields for a new RMC delivery", () => {
    render(<RmcForm mode="new" sites={sites} vendors={vendors} />);

    expect(screen.getByLabelText("Site")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "NH-48 Highway Widening" })).toBeInTheDocument();
    expect(screen.getByLabelText("Vendor")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Anand RMC Suppliers" })).toBeInTheDocument();
    expect(screen.getByLabelText("Grade")).toBeInTheDocument();
    expect(screen.getByLabelText("Quantity (m³)")).toBeInTheDocument();
    expect(screen.getByLabelText("Rate / m³")).toBeInTheDocument();
    expect(screen.getByLabelText("Total Amount")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Record RMC Delivery" })).toBeInTheDocument();
  });

  it("shows a correction banner with a required reason field, and locks Site/Vendor/Grade in correct mode", () => {
    render(
      <RmcForm
        mode="correct"
        correctsId="rmc1"
        sites={sites}
        vendors={vendors}
        initial={{ siteId: "site1", vendorId: "vendor1", grade: "M25", ratePerM3: "6200", totalAmount: "260400", deliveredAt: "2026-08-05" }}
      />,
    );

    expect(screen.getByText("Filing a correction")).toBeInTheDocument();
    expect(screen.getByLabelText("Reason for this correction")).toBeRequired();
    expect(screen.getByLabelText("Site")).toBeDisabled();
    expect(screen.getByLabelText("Vendor")).toBeDisabled();
    expect(screen.getByLabelText("Grade")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Submit Correction" })).toBeInTheDocument();
  });

  it("labels the quantity field as an adjustment with a delta hint in correct mode", () => {
    render(
      <RmcForm
        mode="correct"
        correctsId="rmc1"
        sites={sites}
        vendors={vendors}
        initial={{ siteId: "site1", vendorId: "vendor1", grade: "M25", ratePerM3: "6200", totalAmount: "260400", deliveredAt: "2026-08-05" }}
      />,
    );

    expect(screen.getByLabelText("Quantity adjustment (m³)")).toBeInTheDocument();
    expect(screen.getByText(/Signed delta applied on top of the current total/)).toBeInTheDocument();
  });

  it("sources Site and Vendor fields from their respective lists, not free text", () => {
    render(<RmcForm mode="new" sites={sites} vendors={vendors} />);

    expect(screen.getByLabelText("Site").tagName).toBe("SELECT");
    expect(screen.getByLabelText("Vendor").tagName).toBe("SELECT");
  });
});
