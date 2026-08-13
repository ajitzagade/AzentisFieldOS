import { render, screen } from "@testing-library/react";
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

  it("shows a correction banner with a required reason field, and locks Material/Destination in correct mode", () => {
    render(
      <MovementForm
        mode="correct"
        correctsId="m1"
        materialSizes={materialSizes}
        sites={sites}
        initial={{ materialSizeId: "ms1", destinationSiteId: "site1", movedAt: "2026-08-10" }}
      />,
    );

    expect(screen.getByText("Filing a correction")).toBeInTheDocument();
    expect(screen.getByLabelText("Reason for this correction")).toBeRequired();
    expect(screen.getByLabelText("Material / Size")).toBeDisabled();
    expect(screen.getByLabelText("Destination Site")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Submit Correction" })).toBeInTheDocument();
  });

  it("labels the quantity field as an adjustment with a delta hint in correct mode", () => {
    render(
      <MovementForm
        mode="correct"
        correctsId="m1"
        materialSizes={materialSizes}
        sites={sites}
        initial={{ materialSizeId: "ms1", destinationSiteId: "site1", movedAt: "2026-08-10" }}
      />,
    );

    expect(screen.getByLabelText("Quantity adjustment")).toBeInTheDocument();
    expect(screen.getByText(/Signed delta applied on top of the current balance/)).toBeInTheDocument();
  });

  it("Story 5.4: with kind='SITE_TO_SITE', shows a Source Site picker and labels the submit button Record Transfer", () => {
    render(<MovementForm mode="new" kind="SITE_TO_SITE" materialSizes={materialSizes} sites={sites} />);

    expect(screen.getByLabelText("Source Site")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Record Transfer" })).toBeInTheDocument();
  });

  it("does not show a Source Site picker for the default GODOWN_TO_SITE kind", () => {
    render(<MovementForm mode="new" materialSizes={materialSizes} sites={sites} />);

    expect(screen.queryByLabelText("Source Site")).not.toBeInTheDocument();
  });
});
