import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("./actions", () => ({
  createVehicleAction: Object.assign(vi.fn(async () => ({})), { bind: vi.fn(() => vi.fn(async () => ({}))) }),
}));

import { NewVehicleForm } from "./new-vehicle-form";

describe("NewVehicleForm", () => {
  it("renders Number, Type options, and optional Ownership/Driver fields", () => {
    render(<NewVehicleForm vehicleTypes={[{ id: "t1", name: "Truck" }]} />);

    expect(screen.getByLabelText("Number")).toBeInTheDocument();
    expect(screen.getByLabelText("Ownership")).toBeInTheDocument();
    expect(screen.getByLabelText("Driver")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Truck" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Register Vehicle" })).toBeInTheDocument();
  });

  it('shows "No Vehicle Types yet" guidance instead of an empty, unusable select when none exist', () => {
    render(<NewVehicleForm vehicleTypes={[]} />);

    expect(screen.getByText(/No Vehicle Types yet/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "create one first" })).toHaveAttribute(
      "href",
      "/machinery-vehicles/vehicle-types",
    );
    expect(screen.queryByLabelText("Number")).not.toBeInTheDocument();
  });
});
