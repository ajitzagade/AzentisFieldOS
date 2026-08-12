import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GapFlag } from "./gap-flag";

describe("GapFlag", () => {
  it("renders the icon, message, and required action", () => {
    render(
      <GapFlag
        icon={<svg data-testid="flag-icon" />}
        message="NH-48 Highway Widening — Package 3 has not submitted a Daily Site Report yet today"
        action={<button>View Daily Activity</button>}
      />,
    );
    expect(screen.getByTestId("flag-icon")).toBeInTheDocument();
    expect(
      screen.getByText("NH-48 Highway Widening — Package 3 has not submitted a Daily Site Report yet today"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "View Daily Activity" })).toBeInTheDocument();
  });

  it("uses the warning token palette, not a raw literal", () => {
    const { container } = render(
      <GapFlag icon={<svg />} message="Low stock" action={<button>Transfer Stock</button>} />,
    );
    const flag = container.firstElementChild as HTMLElement;
    expect(flag.className).toContain("bg-warning-100");
    expect(flag.className).toContain("text-warning-700");
    expect(flag.className).toContain("border-gap-flag-border");
  });
});
