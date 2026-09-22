import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PhotoThumbnail } from "./photo-thumbnail";

// Regression (2026-09-22): a report reopened well after a real, successful
// upload showed the browser's own unstyled broken-image icon with zero
// context — indistinguishable from "the upload never worked". Every screen
// that renders a stored photo goes through this one component (AD-5) so a
// failed load always degrades to the same clear, in-brand placeholder.
describe("PhotoThumbnail", () => {
  it("renders the image by default", () => {
    render(<PhotoThumbnail src="https://example.com/photo.jpg" alt="Site photo" />);
    expect(screen.getByRole("img", { name: "Site photo" })).toBeInTheDocument();
  });

  it("swaps to a clear placeholder instead of the browser's broken-image icon when the load fails", () => {
    render(<PhotoThumbnail src="https://example.com/missing.jpg" alt="Site photo" />);
    fireEvent.error(screen.getByRole("img", { name: "Site photo" }));
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByText("Photo unavailable")).toBeInTheDocument();
  });

  it("lazy-loads by default but skips it when eager", () => {
    const { rerender } = render(<PhotoThumbnail src="https://example.com/a.jpg" alt="a" />);
    expect(screen.getByRole("img")).toHaveAttribute("loading", "lazy");

    rerender(<PhotoThumbnail src="https://example.com/a.jpg" alt="a" eager />);
    expect(screen.getByRole("img")).not.toHaveAttribute("loading");
  });
});
