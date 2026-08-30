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

    expect(screen.getByLabelText("Site")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "NH-48 Highway Widening" })).toBeInTheDocument();
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
      />,
    );

    expect(screen.getByText("Filing a correction")).toBeInTheDocument();
    expect(screen.getByLabelText("Reason for this correction")).toBeRequired();
    expect(screen.getByLabelText("Vendor")).toBeDisabled();
    expect(screen.getByLabelText("Material / Size")).toBeDisabled();
    expect(screen.getByLabelText("Destination")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Submit Correction" })).toBeInTheDocument();
  });

  it("labels the quantity field as an adjustment with a delta hint in correct mode", () => {
    render(
      <PurchaseForm
        mode="correct"
        correctsId="p1"
        materialSizes={materialSizes}
        sites={sites}
        vendors={vendors}
        initial={{ vendorId: "v1", materialSizeId: "ms1", destination: "GODOWN", rate: "50", totalAmount: "5000", purchasedAt: "2026-08-11" }}
      />,
    );

    expect(screen.getByLabelText("Quantity adjustment")).toBeInTheDocument();
    expect(screen.getByText(/Signed delta applied on top of the current balance/)).toBeInTheDocument();
  });

  it("Story 5.3: with fixedDestination='SITE', shows the Site picker immediately and hides the Destination toggle", () => {
    render(<PurchaseForm mode="new" materialSizes={materialSizes} sites={sites} vendors={vendors} fixedDestination="SITE" />);

    expect(screen.queryByLabelText("Destination")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Site")).toBeInTheDocument();
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
