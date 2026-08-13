import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("./actions", () => ({
  createMaterialAction: Object.assign(vi.fn(async () => ({})), { bind: vi.fn(() => vi.fn(async () => ({}))) }),
}));

import { NewMaterialForm } from "./new-material-form";

describe("NewMaterialForm", () => {
  it("renders Category and Unit options plus a Name field when both exist", () => {
    render(
      <NewMaterialForm
        categories={[{ id: "c1", name: "Pipes & Fittings" }]}
        units={[{ id: "u1", name: "Pcs" }]}
      />,
    );

    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Pipes & Fittings" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Pcs" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create Material" })).toBeInTheDocument();
  });

  it('shows "No Categories yet" guidance instead of an empty, unusable select when no Category exists', () => {
    render(<NewMaterialForm categories={[]} units={[{ id: "u1", name: "Pcs" }]} />);

    expect(screen.getByText(/No Categories yet/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "create one first" })).toHaveAttribute("href", "/materials/categories");
    expect(screen.queryByLabelText("Name")).not.toBeInTheDocument();
  });

  it('shows "No Units yet" guidance instead of an empty, unusable select when no Unit exists', () => {
    render(<NewMaterialForm categories={[{ id: "c1", name: "Pipes & Fittings" }]} units={[]} />);

    expect(screen.getByText(/No Units yet/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "create one first" })).toHaveAttribute("href", "/materials/units");
  });
});
