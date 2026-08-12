import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CorrectAction } from "./correct-action";

describe("CorrectAction", () => {
  it("renders as an icon-only ghost button with an accessible name", () => {
    render(<CorrectAction icon={<svg data-testid="correct-icon" />} onClick={() => {}} />);
    const button = screen.getByRole("button", { name: "Correct" });
    expect(button.className).toContain("bg-transparent");
    expect(button.className).toContain("aspect-square");
    expect(screen.getByTestId("correct-icon")).toBeInTheDocument();
  });

  it("forwards onClick", () => {
    const onClick = vi.fn();
    render(<CorrectAction icon={<svg />} onClick={onClick} />);
    screen.getByRole("button", { name: "Correct" }).click();
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("renders as a real link with the ghost icon-only styling when href is given", () => {
    render(<CorrectAction icon={<svg />} href="/purchases/123/correct" label="Correct this purchase" />);
    const link = screen.getByRole("link", { name: "Correct this purchase" });
    expect(link).toHaveAttribute("href", "/purchases/123/correct");
    expect(link.className).toContain("bg-transparent");
  });

  it("supports a custom accessible label", () => {
    render(<CorrectAction icon={<svg />} onClick={() => {}} label="Correct this advance" />);
    expect(screen.getByRole("button", { name: "Correct this advance" })).toBeInTheDocument();
  });
});
