import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatTile } from "./stat-tile";

describe("StatTile", () => {
  it.each([
    ["teal", "bg-accent-teal-100"],
    ["gold", "bg-gold-100"],
    ["success", "bg-success-100"],
    ["danger", "bg-danger-100"],
  ] as const)("applies the %s tint's token classes", (tint, expectedClass) => {
    render(<StatTile icon={<svg />} value="₹4,82,600" label="Expenses this week" tint={tint} />);
    const icon = screen.getByText("₹4,82,600").previousElementSibling as HTMLElement;
    expect(icon.className).toContain(expectedClass);
  });

  it("renders as a real link when href is provided", () => {
    render(<StatTile icon={<svg />} value="₹8,000" label="Outstanding Advances" href="/advances" />);
    expect(screen.getByText("Outstanding Advances").closest("a")).toHaveAttribute("href", "/advances");
  });

  it("renders as a non-interactive tile with no link when href is omitted", () => {
    render(<StatTile icon={<svg />} value="12" label="Sites active" />);
    expect(screen.getByText("Sites active").closest("a")).toBeNull();
  });
});
