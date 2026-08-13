import { render, screen } from "@testing-library/react";
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

  it("shows a correction banner with a required reason field, and locks Type/Site/Material in correct mode", () => {
    render(
      <ReturnWastageForm
        mode="correct"
        correctsId="rw1"
        materialSizes={materialSizes}
        sites={sites}
        initial={{ siteId: "site1", materialSizeId: "ms1", kind: "WASTAGE", recordedAt: "2026-08-09" }}
      />,
    );

    expect(screen.getByText("Filing a correction")).toBeInTheDocument();
    expect(screen.getByLabelText("Reason for this correction")).toBeRequired();
    expect(screen.getByLabelText("Type")).toBeDisabled();
    expect(screen.getByLabelText("Site")).toBeDisabled();
    expect(screen.getByLabelText("Material / Size")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Submit Correction" })).toBeInTheDocument();
  });

  it("labels the quantity field as an adjustment with a delta hint in correct mode", () => {
    render(
      <ReturnWastageForm
        mode="correct"
        correctsId="rw1"
        materialSizes={materialSizes}
        sites={sites}
        initial={{ siteId: "site1", materialSizeId: "ms1", kind: "WASTAGE", recordedAt: "2026-08-09" }}
      />,
    );

    expect(screen.getByLabelText("Quantity adjustment")).toBeInTheDocument();
    expect(screen.getByText(/Signed delta applied on top of the current balance/)).toBeInTheDocument();
  });
});
