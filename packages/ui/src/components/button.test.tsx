import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "./button";

describe("Button", () => {
  it("renders the primary variant by default", () => {
    render(<Button>Save</Button>);
    const button = screen.getByRole("button", { name: "Save" });
    expect(button.className).toContain("bg-accent-teal-700");
  });

  it("renders the secondary variant", () => {
    render(<Button variant="secondary">Cancel</Button>);
    expect(screen.getByRole("button", { name: "Cancel" }).className).toContain("bg-surface-1");
  });

  it("renders the ghost variant", () => {
    render(<Button variant="ghost">Dismiss</Button>);
    expect(screen.getByRole("button", { name: "Dismiss" }).className).toContain("bg-transparent");
  });

  it("applies icon-only layout when iconOnly is true", () => {
    render(
      <Button iconOnly aria-label="Correct">
        <span data-testid="icon" />
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Correct" });
    expect(button.className).toContain("aspect-square");
  });

  it("defaults to the non-icon-only layout", () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole("button", { name: "Save" }).className).not.toContain("aspect-square");
  });

  it("shows a spinner and disables the button when isLoading", () => {
    render(<Button isLoading>Save</Button>);
    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });
});
