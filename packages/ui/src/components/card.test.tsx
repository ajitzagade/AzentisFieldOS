import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Card } from "./card";

describe("Card", () => {
  it("rests at shadow-2 (not shadow-1) with no cursor-pointer by default", () => {
    const { container } = render(<Card>content</Card>);
    const card = container.firstElementChild as HTMLElement;
    expect(card.className).toContain("shadow-2");
    expect(card.className).not.toContain("shadow-1");
    expect(card.className).not.toContain("cursor-pointer");
  });

  it("adds the hover-lift affordance when interactive", () => {
    const { container } = render(<Card interactive>content</Card>);
    const card = container.firstElementChild as HTMLElement;
    expect(card.className).toContain("cursor-pointer");
    expect(card.className).toContain("hover:shadow-2-hover");
    expect(card.className).toContain("hover:-translate-y-0.5");
  });
});
