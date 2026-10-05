import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CorrectAction } from "./correct-action";

describe("CorrectAction", () => {
  it("renders as a labelled secondary button with an accessible name", () => {
    render(<CorrectAction icon={<svg data-testid="correct-icon" />} onClick={() => {}} />);
    const button = screen.getByRole("button", { name: "Edit" });
    expect(button.className).toContain("border-border-strong");
    expect(screen.getByText("Edit")).toBeInTheDocument();
    expect(screen.getByTestId("correct-icon")).toBeInTheDocument();
  });

  it("forwards onClick", () => {
    const onClick = vi.fn();
    render(<CorrectAction icon={<svg />} onClick={onClick} />);
    screen.getByRole("button", { name: "Edit" }).click();
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("renders as a real link with the same labelled styling when href is given", () => {
    render(<CorrectAction icon={<svg />} href="/purchases/123/correct" label="Correct this purchase" />);
    const link = screen.getByRole("link", { name: "Correct this purchase" });
    expect(link).toHaveAttribute("href", "/purchases/123/correct");
    expect(link.className).toContain("border-border-strong");
  });

  it("supports a custom label", () => {
    render(<CorrectAction icon={<svg />} onClick={() => {}} label="Correct this advance" />);
    expect(screen.getByRole("button", { name: "Correct this advance" })).toBeInTheDocument();
  });
});
