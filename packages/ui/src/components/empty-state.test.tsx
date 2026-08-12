import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EmptyState } from "./empty-state";

describe("EmptyState", () => {
  it("renders the message", () => {
    render(<EmptyState message="Sites will appear here once Site Management ships." />);
    expect(screen.getByText("Sites will appear here once Site Management ships.")).toBeInTheDocument();
  });

  it("renders an optional icon", () => {
    render(<EmptyState icon={<svg data-testid="empty-icon" />} message="Nothing here yet." />);
    expect(screen.getByTestId("empty-icon")).toBeInTheDocument();
  });

  it("renders an optional single action", () => {
    render(<EmptyState message="No sites yet." action={<button>Add Site</button>} />);
    expect(screen.getByRole("button", { name: "Add Site" })).toBeInTheDocument();
  });

  it("renders with no icon or action when omitted", () => {
    render(<EmptyState message="Coming soon." />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
