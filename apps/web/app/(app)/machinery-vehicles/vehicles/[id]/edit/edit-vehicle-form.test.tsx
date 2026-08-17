import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("./actions", () => ({
  updateVehicleAction: Object.assign(vi.fn(async () => ({})), { bind: vi.fn(() => vi.fn(async () => ({}))) }),
}));

import { EditVehicleForm } from "./edit-vehicle-form";
import type { VehicleDetail } from "./page";

const vehicle: VehicleDetail = {
  id: "v1",
  number: "MH-12-AB-1234",
  ownership: "Rented",
  driver: "Suresh",
  currentStatus: "AT_SITE",
  type: { id: "t1", name: "Truck" },
  currentSite: { id: "s1", name: "Sector 12 Metro Depot" },
};

const vehicleTypes = [{ id: "t1", name: "Truck" }];

describe("EditVehicleForm", () => {
  it("pre-fills every field with the Vehicle's current values", () => {
    render(<EditVehicleForm vehicle={vehicle} vehicleTypes={vehicleTypes} />);

    expect(screen.getByLabelText("Number")).toHaveValue("MH-12-AB-1234");
    expect(screen.getByLabelText("Ownership")).toHaveValue("Rented");
    expect(screen.getByLabelText("Driver")).toHaveValue("Suresh");
    expect(screen.getByLabelText("Type")).toHaveValue("t1");
  });

  it("never renders a currentStatus/currentSiteId field — those are exclusively written by Story 8.2's movement flow", () => {
    render(<EditVehicleForm vehicle={vehicle} vehicleTypes={vehicleTypes} />);

    expect(screen.queryByLabelText(/status/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/current site/i)).not.toBeInTheDocument();
  });
});
