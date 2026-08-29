import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("./actions", () => ({
  updateSiteAction: Object.assign(vi.fn(async () => ({})), { bind: vi.fn(() => vi.fn(async () => ({}))) }),
}));

import { EditSiteForm } from "./edit-site-form";
import type { Site } from "../../page";

const site: Site = {
  id: "site-1",
  name: "NH-48 Highway Widening",
  location: "Nashik",
  status: "ON_HOLD",
  contractReference: "REF-118",
  description: "Package 3 of the highway widening contract.",
};

describe("EditSiteForm", () => {
  it("pre-fills every field with the Site's current values", () => {
    render(<EditSiteForm site={site} />);

    expect(screen.getByLabelText("Name")).toHaveValue("NH-48 Highway Widening");
    expect(screen.getByLabelText("Location")).toHaveValue("Nashik");
    expect(screen.getByLabelText("Status")).toHaveValue("ON_HOLD");
    expect(screen.getByLabelText("Contract reference")).toHaveValue("REF-118");
    expect(screen.getByLabelText("Description")).toHaveValue("Package 3 of the highway widening contract.");
  });

  it("pre-fills an empty contract reference when the Site has none", () => {
    render(<EditSiteForm site={{ ...site, contractReference: null }} />);
    expect(screen.getByLabelText("Contract reference")).toHaveValue("");
  });

  it("renders a Save Changes submit button", () => {
    render(<EditSiteForm site={site} />);
    expect(screen.getByRole("button", { name: "Save Changes" })).toBeInTheDocument();
  });
});
