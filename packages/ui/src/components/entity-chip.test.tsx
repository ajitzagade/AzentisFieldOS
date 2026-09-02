import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EntityChip } from "./entity-chip";

describe("EntityChip", () => {
  it("renders as a real link to the record's detail page", () => {
    render(
      <EntityChip href="/sites/site-1" icon={<svg data-testid="chip-icon" />} name="NH-48 Widening" typeLabel="Site" />,
    );

    const link = screen.getByRole("link", { name: /NH-48 Widening/ });
    expect(link).toHaveAttribute("href", "/sites/site-1");
  });

  it("renders the record name and a muted entity-type suffix", () => {
    render(<EntityChip href="/vendors/1" icon={<svg />} name="Acme Traders" typeLabel="Vendor" />);

    expect(screen.getByText("Acme Traders")).toBeInTheDocument();
    expect(screen.getByText("· Vendor")).toBeInTheDocument();
  });

  it("renders the caller-supplied icon", () => {
    render(<EntityChip href="/team/1" icon={<svg data-testid="chip-icon" />} name="Ravi Kumar" typeLabel="Team Member" />);

    expect(screen.getByTestId("chip-icon")).toBeInTheDocument();
  });
});
