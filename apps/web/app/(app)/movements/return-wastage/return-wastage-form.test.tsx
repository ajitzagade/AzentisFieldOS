import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("./actions", () => ({
  createReturnWastageAction: Object.assign(vi.fn(async () => ({})), { bind: vi.fn(() => vi.fn(async () => ({}))) }),
}));

import { ReturnWastageForm } from "./return-wastage-form";

const materialSizes = [{ id: "ms1", label: "Aggregate (20mm)" }];
const sites = [{ id: "site1", name: "Sector 12 Metro Depot" }];

describe("ReturnWastageForm", () => {
  it("renders the core fields with a Type toggle for a new entry", () => {
    render(<ReturnWastageForm mode="new" materialSizes={materialSizes} sites={sites} />);

    expect(screen.getByLabelText("Type")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Wastage" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Return" })).toBeInTheDocument();
    expect(screen.getByLabelText("Site")).toBeInTheDocument();
    expect(screen.getByLabelText("Quantity")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Record Entry" })).toBeInTheDocument();
  });

  it("uses the searchable Site picker in new mode, and marks quantity for the decimal keyboard", () => {
    render(<ReturnWastageForm mode="new" materialSizes={materialSizes} sites={sites} />);

    expect(screen.getByLabelText("Site")).toHaveAttribute("role", "combobox");
    expect(document.querySelector('input[name="siteId"]')).toBeInTheDocument();
    expect(screen.getByLabelText("Quantity")).toHaveAttribute("inputmode", "decimal");
  });

  it("shows a correction banner with a required reason field, and locks Type/Site/Material in correct mode", () => {
    render(
      <ReturnWastageForm
        mode="correct"
        correctsId="rw1"
        materialSizes={materialSizes}
        sites={sites}
        initial={{ siteId: "site1", materialSizeId: "ms1", kind: "WASTAGE", quantity: 12, recordedAt: "2026-08-09" }}
      />,
    );

    expect(screen.getByText("Filing a correction")).toBeInTheDocument();
    expect(screen.getByLabelText("Reason for this correction")).toBeRequired();
    expect(screen.getByLabelText("Type")).toBeDisabled();
    expect(screen.getByLabelText("Site")).toBeDisabled();
    expect(screen.getByLabelText("Material / Size")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Submit Correction" })).toBeInTheDocument();
  });

  it("asks for the corrected quantity (showing the recorded original) instead of a signed delta in correct mode", () => {
    render(
      <ReturnWastageForm
        mode="correct"
        correctsId="rw1"
        materialSizes={materialSizes}
        sites={sites}
        initial={{ siteId: "site1", materialSizeId: "ms1", kind: "WASTAGE", quantity: 12, recordedAt: "2026-08-09" }}
      />,
    );

    expect(screen.getByLabelText("Corrected quantity")).toBeInTheDocument();
    expect(screen.getByText(/Currently recorded: 12/)).toBeInTheDocument();
    expect(screen.queryByText(/signed adjustment/i)).not.toBeInTheDocument();
  });

  it("derives and submits the signed delta from the corrected quantity typed by the user", async () => {
    const user = userEvent.setup();
    render(
      <ReturnWastageForm
        mode="correct"
        correctsId="rw1"
        materialSizes={materialSizes}
        sites={sites}
        initial={{ siteId: "site1", materialSizeId: "ms1", kind: "WASTAGE", quantity: 12, recordedAt: "2026-08-09" }}
      />,
    );

    await user.type(screen.getByLabelText("Corrected quantity"), "10");

    expect(document.querySelector('input[name="quantity"]')).toHaveValue("-2");
  });
});
