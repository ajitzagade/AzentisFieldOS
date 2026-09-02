import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { TagsField } from "./tags-field";

describe("TagsField", () => {
  it("renders pre-filled tags as removable chips with a hidden input each", () => {
    render(<TagsField label="Work categories" name="workCategories" defaultValue={["Pipe laying", "Trenching"]} />);

    expect(screen.getByText("Pipe laying")).toBeInTheDocument();
    expect(screen.getByText("Trenching")).toBeInTheDocument();
    expect(document.querySelectorAll('input[type="hidden"][name="workCategories"]')).toHaveLength(2);
  });

  it("adds a new tag as a chip when Enter is pressed", async () => {
    const user = userEvent.setup();
    render(<TagsField label="Work categories" name="workCategories" />);

    await user.type(screen.getByPlaceholderText("Type and press Enter"), "Excavation{Enter}");

    expect(screen.getByText("Excavation")).toBeInTheDocument();
    expect(document.querySelectorAll('input[type="hidden"][name="workCategories"]')).toHaveLength(1);
  });

  it("removes a tag when its remove button is clicked", async () => {
    const user = userEvent.setup();
    render(<TagsField label="Work categories" name="workCategories" defaultValue={["Pipe laying"]} />);

    await user.click(screen.getByRole("button", { name: "Remove Pipe laying" }));

    expect(screen.queryByText("Pipe laying")).not.toBeInTheDocument();
  });

  it("renders the provided label", () => {
    render(<TagsField label="Materials / services supplied" name="materialsSupplied" />);

    expect(screen.getByText("Materials / services supplied")).toBeInTheDocument();
  });
});
