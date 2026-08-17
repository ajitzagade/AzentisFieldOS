import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { MaterialsSuppliedField } from "./materials-supplied-field";

describe("MaterialsSuppliedField", () => {
  it("renders pre-filled tags as removable chips with a hidden input each", () => {
    render(<MaterialsSuppliedField name="materialsSupplied" defaultValue={["Cement", "Steel"]} />);

    expect(screen.getByText("Cement")).toBeInTheDocument();
    expect(screen.getByText("Steel")).toBeInTheDocument();
    expect(document.querySelectorAll('input[type="hidden"][name="materialsSupplied"]')).toHaveLength(2);
  });

  it("adds a new tag as a chip when Enter is pressed", async () => {
    const user = userEvent.setup();
    render(<MaterialsSuppliedField name="materialsSupplied" />);

    await user.type(screen.getByPlaceholderText("Type and press Enter"), "Aggregates{Enter}");

    expect(screen.getByText("Aggregates")).toBeInTheDocument();
    expect(document.querySelectorAll('input[type="hidden"][name="materialsSupplied"]')).toHaveLength(1);
  });

  it("removes a tag when its remove button is clicked", async () => {
    const user = userEvent.setup();
    render(<MaterialsSuppliedField name="materialsSupplied" defaultValue={["Cement"]} />);

    await user.click(screen.getByRole("button", { name: "Remove Cement" }));

    expect(screen.queryByText("Cement")).not.toBeInTheDocument();
  });
});
