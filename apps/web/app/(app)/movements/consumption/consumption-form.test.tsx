import { render, screen } from "@testing-library/react";
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
    expect(screen.getByLabelText("Recorded By User ID")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Record Consumption" })).toBeInTheDocument();
  });

  it("shows a correction banner with a required reason field, and locks Site/Material/Recorded By in correct mode", () => {
    render(
      <ConsumptionForm
        mode="correct"
        correctsId="c1"
        materialSizes={materialSizes}
        sites={sites}
        initial={{ siteId: "site1", materialSizeId: "ms1", consumedAt: "2026-08-10", recordedByUserId: "user1" }}
      />,
    );

    expect(screen.getByText("Filing a correction")).toBeInTheDocument();
    expect(screen.getByLabelText("Reason for this correction")).toBeRequired();
    expect(screen.getByLabelText("Site")).toBeDisabled();
    expect(screen.getByLabelText("Material / Size")).toBeDisabled();
    expect(screen.getByLabelText("Recorded By User ID")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Submit Correction" })).toBeInTheDocument();
  });

  it("labels the quantity field as an adjustment with a delta hint in correct mode", () => {
    render(
      <ConsumptionForm
        mode="correct"
        correctsId="c1"
        materialSizes={materialSizes}
        sites={sites}
        initial={{ siteId: "site1", materialSizeId: "ms1", consumedAt: "2026-08-10", recordedByUserId: "user1" }}
      />,
    );

    expect(screen.getByLabelText("Quantity adjustment")).toBeInTheDocument();
    expect(screen.getByText(/Signed delta applied on top of the current balance/)).toBeInTheDocument();
  });
});
