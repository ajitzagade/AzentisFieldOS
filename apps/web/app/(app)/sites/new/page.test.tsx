import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("./actions", () => ({
  createSiteAction: vi.fn(async () => ({})),
}));

import NewSitePage from "./page";

describe("NewSitePage", () => {
  it("renders the Create Site form with all fields", () => {
    render(<NewSitePage />);

    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Location")).toBeInTheDocument();
    expect(screen.getByLabelText("Status")).toBeInTheDocument();
    expect(screen.getByLabelText("Contract reference")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create Site" })).toBeInTheDocument();
  });

  it("defaults Status to Active", () => {
    render(<NewSitePage />);
    expect(screen.getByLabelText("Status")).toHaveValue("ACTIVE");
  });

  it("offers all three status options", () => {
    render(<NewSitePage />);
    expect(screen.getByRole("option", { name: "Active" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "On Hold" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Completed" })).toBeInTheDocument();
  });
});
