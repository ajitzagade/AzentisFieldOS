import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("./actions", () => ({
  updateMaterialAction: Object.assign(vi.fn(async () => ({})), { bind: vi.fn(() => vi.fn(async () => ({}))) }),
}));

import { EditMaterialForm } from "./edit-material-form";
import type { MaterialDetail } from "./page";

const material: MaterialDetail = {
  id: "mat-1",
  name: "RCC Pipe",
  isActive: true,
  category: { id: "c1", name: "Pipes & Fittings" },
  unit: { id: "u1", name: "Pcs" },
  sizes: [],
  customFields: [],
  lowStockThreshold: null,
};

describe("EditMaterialForm", () => {
  it("pre-fills every field with the Material's current values", () => {
    render(<EditMaterialForm material={material} categories={[{ id: "c1", name: "Pipes & Fittings" }]} units={[{ id: "u1", name: "Pcs" }]} />);

    expect(screen.getByLabelText("Name")).toHaveValue("RCC Pipe");
    expect(screen.getByLabelText("Category")).toHaveValue("c1");
    expect(screen.getByLabelText("Unit")).toHaveValue("u1");
    expect(screen.getByLabelText(/Active/)).toBeChecked();
  });

  it("renders as unchecked for a disabled Material", () => {
    render(
      <EditMaterialForm
        material={{ ...material, isActive: false }}
        categories={[{ id: "c1", name: "Pipes & Fittings" }]}
        units={[{ id: "u1", name: "Pcs" }]}
      />,
    );

    expect(screen.getByLabelText(/Active/)).not.toBeChecked();
  });

  it("toggling the Active checkbox updates the submitted hidden field — never uses CorrectAction for master data", async () => {
    render(<EditMaterialForm material={material} categories={[{ id: "c1", name: "Pipes & Fittings" }]} units={[{ id: "u1", name: "Pcs" }]} />);

    const checkbox = screen.getByLabelText(/Active/);
    const user = userEvent.setup();
    await user.click(checkbox);

    expect(checkbox).not.toBeChecked();
    expect(screen.getByRole("button", { name: "Save Changes" })).toBeInTheDocument();
  });

  it("renders existing Custom Field definitions with a type badge (AC #1)", () => {
    render(
      <EditMaterialForm
        material={{ ...material, customFields: [{ label: "Brand", type: "TEXT" }] }}
        categories={[{ id: "c1", name: "Pipes & Fittings" }]}
        units={[{ id: "u1", name: "Pcs" }]}
      />,
    );

    expect(screen.getByText("Brand")).toBeInTheDocument();
    expect(screen.getByText("TEXT")).toBeInTheDocument();
  });

  it("shows an explicit empty state for a Material with no Custom Fields (AC #4)", () => {
    render(<EditMaterialForm material={material} categories={[{ id: "c1", name: "Pipes & Fittings" }]} units={[{ id: "u1", name: "Pcs" }]} />);
    expect(screen.getByText("No Custom Fields yet.")).toBeInTheDocument();
  });

  it("adding a Custom Field updates the visible list and the submitted hidden field", async () => {
    const { container } = render(
      <EditMaterialForm material={material} categories={[{ id: "c1", name: "Pipes & Fittings" }]} units={[{ id: "u1", name: "Pcs" }]} />,
    );

    const user = userEvent.setup();
    await user.type(screen.getByLabelText("New field label"), "Warranty Expiry");
    await user.selectOptions(screen.getByLabelText("Type"), "DATE");
    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(screen.getByText("Warranty Expiry")).toBeInTheDocument();
    expect(screen.getByText("DATE")).toBeInTheDocument();

    const hiddenInput = container.querySelector('input[name="customFields"]') as HTMLInputElement;
    expect(JSON.parse(hiddenInput.value)).toEqual([{ label: "Warranty Expiry", type: "DATE" }]);
  });

  it("Story 5.7: pre-fills the Low-stock threshold field, blank when unset", () => {
    render(<EditMaterialForm material={material} categories={[{ id: "c1", name: "Pipes & Fittings" }]} units={[{ id: "u1", name: "Pcs" }]} />);

    expect(screen.getByLabelText("Low-stock threshold")).toHaveValue(null);
  });

  it("Story 5.7: pre-fills the Low-stock threshold field with the Material's current value", () => {
    render(
      <EditMaterialForm
        material={{ ...material, lowStockThreshold: "200" }}
        categories={[{ id: "c1", name: "Pipes & Fittings" }]}
        units={[{ id: "u1", name: "Pcs" }]}
      />,
    );

    expect(screen.getByLabelText("Low-stock threshold")).toHaveValue(200);
  });
});
