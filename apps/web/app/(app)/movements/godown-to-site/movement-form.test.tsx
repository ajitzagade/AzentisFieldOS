import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("./actions", () => ({
  createMovementAction: Object.assign(vi.fn(async () => ({})), { bind: vi.fn(() => vi.fn(async () => ({}))) }),
}));

import { MovementForm } from "./movement-form";

const materialSizes = [{ id: "ms1", label: "TMT Steel (12mm)" }];
const sites = [{ id: "site1", name: "NH-48 Highway Widening" }];

describe("MovementForm", () => {
  it("renders the core fields for a new Movement", () => {
    render(<MovementForm mode="new" materialSizes={materialSizes} sites={sites} />);

    expect(screen.getByLabelText("Material / Size")).toBeInTheDocument();
    expect(screen.getByLabelText("Destination Site")).toBeInTheDocument();
    expect(screen.getByLabelText("Sent Quantity")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Record Movement" })).toBeInTheDocument();
  });

  it("uses the searchable Site picker for the Destination Site in new mode, and marks quantity for the decimal keyboard", () => {
    render(<MovementForm mode="new" materialSizes={materialSizes} sites={sites} />);

    expect(screen.getByLabelText("Destination Site")).toHaveAttribute("role", "combobox");
    expect(document.querySelector('input[name="destinationSiteId"]')).toBeInTheDocument();
    expect(screen.getByLabelText("Sent Quantity")).toHaveAttribute("inputmode", "decimal");
  });

  it("shows a correction banner with a required reason field, and locks Material/Destination in correct mode", () => {
    render(
      <MovementForm
        mode="correct"
        correctsId="m1"
        materialSizes={materialSizes}
        sites={sites}
        initial={{ materialSizeId: "ms1", destinationSiteId: "site1", sentQuantity: 200, movedAt: "2026-08-10" }}
      />,
    );

    expect(screen.getByText("Filing a correction")).toBeInTheDocument();
    expect(screen.getByLabelText("Reason for this correction")).toBeRequired();
    expect(screen.getByLabelText("Material / Size")).toBeDisabled();
    expect(screen.getByLabelText("Destination Site")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Submit Correction" })).toBeInTheDocument();
  });

  it("asks for the corrected sent quantity (showing the recorded original) instead of a signed delta in correct mode", () => {
    render(
      <MovementForm
        mode="correct"
        correctsId="m1"
        materialSizes={materialSizes}
        sites={sites}
        initial={{ materialSizeId: "ms1", destinationSiteId: "site1", sentQuantity: 200, movedAt: "2026-08-10" }}
      />,
    );

    expect(screen.getByLabelText("Corrected sent quantity")).toBeInTheDocument();
    expect(screen.getByText(/Currently recorded: 200/)).toBeInTheDocument();
    expect(screen.queryByText(/signed adjustment/i)).not.toBeInTheDocument();
  });

  it("derives and submits the signed delta from the corrected sent quantity typed by the user", async () => {
    const user = userEvent.setup();
    render(
      <MovementForm
        mode="correct"
        correctsId="m1"
        materialSizes={materialSizes}
        sites={sites}
        initial={{ materialSizeId: "ms1", destinationSiteId: "site1", sentQuantity: 200, movedAt: "2026-08-10" }}
      />,
    );

    await user.type(screen.getByLabelText("Corrected sent quantity"), "180");

    expect(document.querySelector('input[name="sentQuantity"]')).toHaveValue("-20");
  });

  it("Story 5.4: with kind='SITE_TO_SITE', shows a Source Site picker and labels the submit button Record Transfer", () => {
    render(<MovementForm mode="new" kind="SITE_TO_SITE" materialSizes={materialSizes} sites={sites} />);

    expect(screen.getByLabelText("Source Site")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Record Transfer" })).toBeInTheDocument();
  });

  it("submits Source and Destination Sites under distinct field names for a SITE_TO_SITE transfer", () => {
    render(<MovementForm mode="new" kind="SITE_TO_SITE" materialSizes={materialSizes} sites={sites} />);

    expect(document.querySelector('input[name="sourceSiteId"]')).toBeInTheDocument();
    expect(document.querySelector('input[name="destinationSiteId"]')).toBeInTheDocument();
  });

  it("does not show a Source Site picker for the default GODOWN_TO_SITE kind", () => {
    render(<MovementForm mode="new" materialSizes={materialSizes} sites={sites} />);

    expect(screen.queryByLabelText("Source Site")).not.toBeInTheDocument();
  });
});

describe("MovementForm — Person Responsible suggestions (story 15.5)", () => {
  it("renders team names as datalist options linked to the Person Responsible field, still free-text", () => {
    const { container } = render(
      <MovementForm mode="new" materialSizes={materialSizes} sites={sites} teamNames={["Suresh Kumar"]} />,
    );

    const input = screen.getByLabelText("Person Responsible");
    expect(input).toHaveAttribute("list", "movement-person-names");
    const options = [...container.querySelectorAll("datalist#movement-person-names option")].map((o) => o.getAttribute("value"));
    expect(options).toEqual(["Suresh Kumar"]);
    expect(input).not.toHaveAttribute("readonly");
  });
});
