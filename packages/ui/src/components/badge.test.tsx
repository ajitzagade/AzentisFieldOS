import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge } from "./badge";

describe("Badge", () => {
  it.each([
    ["success", "bg-success-100"],
    ["warning", "bg-warning-100"],
    ["danger", "bg-danger-100"],
    ["gold", "bg-gold-100"],
    ["neutral", "bg-surface-3"],
  ] as const)("renders the %s variant with its token-based classes", (variant, expectedClass) => {
    render(<Badge variant={variant}>Label</Badge>);
    expect(screen.getByText("Label").className).toContain(expectedClass);
  });

  it("renders an optional icon before the label", () => {
    render(
      <Badge variant="success" icon={<svg data-testid="badge-icon" />}>
        Synced
      </Badge>,
    );
    expect(screen.getByTestId("badge-icon")).toBeInTheDocument();
    expect(screen.getByText("Synced")).toBeInTheDocument();
  });

  it("renders with no icon wrapper when icon is omitted", () => {
    render(<Badge variant="danger">Overdue</Badge>);
    expect(screen.queryByTestId("badge-icon")).not.toBeInTheDocument();
  });
});
