import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("./actions", () => ({
  createPurchaseAction: Object.assign(vi.fn(async () => ({})), { bind: vi.fn(() => vi.fn(async () => ({}))) }),
}));

import { PurchaseForm } from "./purchase-form";

const materialSizes = [{ id: "ms1", label: "Cement (OPC 53 Grade)" }];
const sites = [{ id: "site1", name: "NH-48 Highway Widening" }];
const vendors = [{ id: "v1", name: "Shree Balaji Traders" }];

describe("PurchaseForm", () => {
  it("renders the core fields for a new Purchase with Godown selected by default", () => {
    render(<PurchaseForm mode="new" materialSizes={materialSizes} sites={sites} vendors={vendors} />);

    expect(screen.getByLabelText("Vendor")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Shree Balaji Traders" })).toBeInTheDocument();
    expect(screen.getByLabelText("Material / Size")).toHaveAttribute("role", "combobox");
    expect(screen.getByLabelText("Quantity")).toBeInTheDocument();
    expect(screen.queryByLabelText("Site")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Record Purchase" })).toBeInTheDocument();
  });

  it("shows the Site picker only when destination is switched to Site", async () => {
    const user = userEvent.setup();
    render(<PurchaseForm mode="new" materialSizes={materialSizes} sites={sites} vendors={vendors} />);

    await user.selectOptions(screen.getByLabelText("Destination"), "SITE");

    // D5: the Site picker is the searchable SiteField combobox, not a native select.
    expect(screen.getByLabelText("Site")).toHaveAttribute("role", "combobox");
  });

  it("shows a correction banner with a required reason field, and locks Vendor/Material/Destination in correct mode", () => {
    render(
      <PurchaseForm
        mode="correct"
        correctsId="p1"
        materialSizes={materialSizes}
        sites={sites}
        vendors={vendors}
        initial={{ vendorId: "v1", materialSizeId: "ms1", destination: "GODOWN", rate: "50", totalAmount: "5000", purchasedAt: "2026-08-11" }}
        original={{ quantity: 100, priced: true }}
      />,
    );

    expect(screen.getByText("Filing a correction")).toBeInTheDocument();
    expect(screen.getByLabelText("Reason for this correction")).toBeRequired();
    expect(screen.getByLabelText("Vendor")).toBeDisabled();
    expect(screen.getByLabelText("Material / Size")).toBeDisabled();
    expect(screen.getByLabelText("Destination")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Submit Correction" })).toBeInTheDocument();
  });

  it("D4: correct mode asks for the corrected quantity and derives the signed delta underneath", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <PurchaseForm
        mode="correct"
        correctsId="p1"
        materialSizes={materialSizes}
        sites={sites}
        vendors={vendors}
        initial={{ vendorId: "v1", materialSizeId: "ms1", destination: "GODOWN", rate: "50", totalAmount: "5000", purchasedAt: "2026-08-11" }}
        original={{ quantity: 100, priced: true }}
      />,
    );

    const field = screen.getByLabelText("Corrected quantity");
    expect(screen.getByText(/Currently recorded: 100/)).toBeInTheDocument();
    await user.type(field, "80");
    expect(screen.getByText(/Was 100 → change of −20 will be recorded/)).toBeInTheDocument();
    // The FormData contract is unchanged: a hidden `quantity` carries the delta.
    expect(container.querySelector('input[type="hidden"][name="quantity"]')).toHaveValue("-20");
  });

  it("D7: correcting a still-unpriced Purchase renders no pricing fields, only the pending note", () => {
    render(
      <PurchaseForm
        mode="correct"
        correctsId="p1"
        materialSizes={materialSizes}
        sites={sites}
        vendors={vendors}
        initial={{ vendorId: "v1", materialSizeId: "ms1", destination: "GODOWN", purchasedAt: "2026-08-11" }}
        original={{ quantity: 100, priced: false }}
      />,
    );

    expect(screen.queryByLabelText("Rate")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Total Amount")).not.toBeInTheDocument();
    expect(screen.getByText(/no pricing yet/)).toBeInTheDocument();
  });

  it("Story 5.3: with fixedDestination='SITE', shows the Site picker immediately and hides the Destination toggle", () => {
    render(<PurchaseForm mode="new" materialSizes={materialSizes} sites={sites} vendors={vendors} fixedDestination="SITE" />);

    expect(screen.queryByLabelText("Destination")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Site")).toHaveAttribute("role", "combobox");
  });

  it("Story 9.1: sources the Vendor field from the Vendor list, not free text", () => {
    render(<PurchaseForm mode="new" materialSizes={materialSizes} sites={sites} vendors={vendors} />);

    expect(screen.getByLabelText("Vendor").tagName).toBe("SELECT");
  });
});

describe("PurchaseForm — Receiver Name suggestions (story 15.5)", () => {
  it("renders team names as datalist options linked to the Receiver field, still free-text", () => {
    const { container } = render(
      <PurchaseForm mode="new" materialSizes={materialSizes} sites={sites} vendors={vendors} teamNames={["Suresh Kumar", "Ganesh Jadhav"]} />,
    );

    const input = screen.getByLabelText("Receiver Name");
    expect(input).toHaveAttribute("list", "purchase-receiver-names");
    const datalist = container.querySelector("datalist#purchase-receiver-names");
    expect(datalist).not.toBeNull();
    const options = [...datalist!.querySelectorAll("option")].map((o) => o.getAttribute("value"));
    expect(options).toEqual(["Suresh Kumar", "Ganesh Jadhav"]);
    // Plain text input — a name outside the team is always accepted.
    expect(input).not.toHaveAttribute("readonly");
  });

  it("renders an empty datalist (plain text field) when no team names are provided", () => {
    const { container } = render(<PurchaseForm mode="new" materialSizes={materialSizes} sites={sites} vendors={vendors} />);
    expect(container.querySelectorAll("datalist#purchase-receiver-names option")).toHaveLength(0);
  });
});

describe("PurchaseForm — pricing visibility and auto-total (D5/D7)", () => {
  it("hides Rate/Total/Payment Status for a Supervisor and shows the office note", () => {
    render(
      <PurchaseForm mode="new" materialSizes={materialSizes} sites={sites} vendors={vendors} showPricing={false} />,
    );

    expect(screen.queryByLabelText("Rate")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Total Amount")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Payment Status")).not.toBeInTheDocument();
    expect(screen.getByText(/Rates & amounts are entered by the office/)).toBeInTheDocument();
  });

  it("auto-computes Total = quantity × rate for the Owner, still editable", async () => {
    const user = userEvent.setup();
    render(<PurchaseForm mode="new" materialSizes={materialSizes} sites={sites} vendors={vendors} />);

    await user.type(screen.getByLabelText("Quantity"), "50");
    await user.type(screen.getByLabelText("Rate"), "390");
    expect(screen.getByLabelText("Total Amount")).toHaveValue(19500);
    // The amount-in-words readback confirms the auto-computed figure.
    expect(screen.getByText(/Nineteen Thousand Five Hundred/i)).toBeInTheDocument();

    // Manual override wins until quantity/rate change again.
    await user.clear(screen.getByLabelText("Total Amount"));
    await user.type(screen.getByLabelText("Total Amount"), "19600");
    expect(screen.getByLabelText("Total Amount")).toHaveValue(19600);
  });

  it("folds the optional paperwork fields behind a More details disclosure", () => {
    const { container } = render(<PurchaseForm mode="new" materialSizes={materialSizes} sites={sites} vendors={vendors} />);
    const details = container.querySelector("details");
    expect(details).not.toBeNull();
    expect(details).not.toHaveAttribute("open");
    expect(screen.getByText(/More details/)).toBeInTheDocument();
  });
});
