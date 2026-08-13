import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("./actions", () => ({
  toggleMaterialCategoryAction: Object.assign(vi.fn(async () => ({})), {
    bind: vi.fn(() => vi.fn(async () => ({ formError: "Could not disable this Category. Please try again." }))),
  }),
}));

import { ToggleActiveButton } from "./toggle-active-button";

describe("ToggleActiveButton", () => {
  it('shows "Disable" for an active Category', () => {
    render(<ToggleActiveButton id="cat-1" isActive={true} />);
    expect(screen.getByRole("button", { name: "Disable" })).toBeInTheDocument();
  });

  it('shows "Enable" for a disabled Category', () => {
    render(<ToggleActiveButton id="cat-1" isActive={false} />);
    expect(screen.getByRole("button", { name: "Enable" })).toBeInTheDocument();
  });

  it("surfaces a form error instead of silently no-opping when the toggle fails", async () => {
    render(<ToggleActiveButton id="cat-1" isActive={true} />);

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Disable" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Could not disable this Category. Please try again.");
  });
});
