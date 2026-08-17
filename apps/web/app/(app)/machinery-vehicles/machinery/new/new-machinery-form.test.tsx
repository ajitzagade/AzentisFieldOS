import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("./actions", () => ({
  createMachineryAction: Object.assign(vi.fn(async () => ({})), { bind: vi.fn(() => vi.fn(async () => ({}))) }),
}));

import { NewMachineryForm } from "./new-machinery-form";

describe("NewMachineryForm", () => {
  it("renders Name, Type options, Asset Number, and optional Model/Ownership/Operator fields", () => {
    render(<NewMachineryForm machineryTypes={[{ id: "t1", name: "Excavator" }]} />);

    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Asset / Registration Number")).toBeInTheDocument();
    expect(screen.getByLabelText("Model")).toBeInTheDocument();
    expect(screen.getByLabelText("Ownership")).toBeInTheDocument();
    expect(screen.getByLabelText("Operator")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Excavator" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Register Machine" })).toBeInTheDocument();
  });

  it('shows "No Machinery Types yet" guidance instead of an empty, unusable select when none exist', () => {
    render(<NewMachineryForm machineryTypes={[]} />);

    expect(screen.getByText(/No Machinery Types yet/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "create one first" })).toHaveAttribute(
      "href",
      "/machinery-vehicles/machinery-types",
    );
    expect(screen.queryByLabelText("Name")).not.toBeInTheDocument();
  });
});
