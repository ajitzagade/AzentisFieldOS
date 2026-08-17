import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("./actions", () => ({
  createAssetMovementAction: Object.assign(vi.fn(async () => ({})), { bind: vi.fn(() => vi.fn(async () => ({}))) }),
}));

import { AssetMovementForm } from "./asset-movement-form";

const sites = [{ id: "site1", name: "NH-48 Highway Widening" }];

describe("AssetMovementForm", () => {
  it("renders the destination toggle, a Site picker, and a date for a new Movement", () => {
    render(<AssetMovementForm mode="new" assetType="MACHINERY" assetId="m1" sites={sites} />);

    expect(screen.getByLabelText("Move To")).toBeInTheDocument();
    expect(screen.getByLabelText("Site")).toBeInTheDocument();
    expect(screen.getByLabelText("Movement Date")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Record Movement" })).toBeInTheDocument();
  });

  it("hides the Site picker when Maintenance or Available is selected", () => {
    render(<AssetMovementForm mode="new" assetType="MACHINERY" assetId="m1" sites={sites} initial={{ toStatus: "MAINTENANCE" }} />);

    expect(screen.queryByLabelText("Site")).not.toBeInTheDocument();
  });

  it("never renders GPS/live-tracking copy anywhere in the form (AC #3)", () => {
    const { container } = render(<AssetMovementForm mode="new" assetType="VEHICLE" assetId="v1" sites={sites} />);

    expect(container.textContent).toMatch(/manually recorded/i);
    expect(container.textContent).not.toMatch(/live location|live GPS tracking is on/i);
  });

  it("shows a correction banner with a required reason field in correct mode", () => {
    render(
      <AssetMovementForm
        mode="correct"
        assetType="MACHINERY"
        assetId="m1"
        correctsId="log1"
        sites={sites}
        initial={{ toStatus: "AT_SITE", siteId: "site1", movedAt: "2026-08-10" }}
      />,
    );

    expect(screen.getByText("Filing a correction")).toBeInTheDocument();
    expect(screen.getByLabelText("Reason for this correction")).toBeRequired();
    expect(screen.getByRole("button", { name: "Submit Correction" })).toBeInTheDocument();
  });

  it("leaves Move To and Site editable in correct mode — a correction is a full restatement, not a delta", () => {
    render(
      <AssetMovementForm
        mode="correct"
        assetType="MACHINERY"
        assetId="m1"
        correctsId="log1"
        sites={sites}
        initial={{ toStatus: "AT_SITE", siteId: "site1", movedAt: "2026-08-10" }}
      />,
    );

    expect(screen.getByLabelText("Move To")).not.toBeDisabled();
  });
});
