import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("./actions", () => ({
  createVendorAction: vi.fn(async () => ({})),
}));

import NewVendorPage from "./page";

describe("NewVendorPage", () => {
  it("renders the Create Vendor form with all fields", () => {
    render(<NewVendorPage />);

    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Contact person")).toBeInTheDocument();
    expect(screen.getByLabelText("Phone")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Address")).toBeInTheDocument();
    expect(screen.getByText("Materials / services supplied")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create Vendor" })).toBeInTheDocument();
  });
});
