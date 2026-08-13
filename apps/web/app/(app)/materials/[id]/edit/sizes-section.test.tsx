import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("./add-size-action", () => ({
  addMaterialSizeAction: Object.assign(vi.fn(async () => ({})), { bind: vi.fn(() => vi.fn(async () => ({}))) }),
}));

import { SizesSection } from "./sizes-section";

describe("SizesSection", () => {
  it("renders existing Sizes as read-only chips — no edit/remove control present (AC #2)", () => {
    render(
      <SizesSection
        materialId="mat-1"
        sizes={[
          { id: "s1", label: "300mm" },
          { id: "s2", label: "450mm" },
        ]}
      />,
    );

    expect(screen.getByText("300mm")).toBeInTheDocument();
    expect(screen.getByText("450mm")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /remove/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /edit/i })).not.toBeInTheDocument();
  });

  it("shows an explicit empty state, not a blank section, for a Material with zero Sizes (AC #4)", () => {
    render(<SizesSection materialId="mat-1" sizes={[]} />);

    expect(screen.getByText("No Sizes yet.")).toBeInTheDocument();
  });

  it("renders an add-Size form with a text input and submit button", async () => {
    render(<SizesSection materialId="mat-1" sizes={[]} />);

    const input = screen.getByLabelText("New Size / Specification");
    const user = userEvent.setup();
    await user.type(input, "600mm");

    expect(input).toHaveValue("600mm");
    expect(screen.getByRole("button", { name: /Add Size/ })).toBeInTheDocument();
  });
});
