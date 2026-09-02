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

  it("shows a duplicate notice instead of silently dropping a case-insensitive repeat", async () => {
    const user = userEvent.setup();
    render(<TagsField label="Work categories" name="workCategories" defaultValue={["Pipe laying"]} />);

    await user.type(screen.getByRole("textbox"), "pipe laying{Enter}");

    expect(screen.getByText('"pipe laying" is already added')).toBeInTheDocument();
    expect(document.querySelectorAll('input[type="hidden"][name="workCategories"]')).toHaveLength(1);
  });

  it("splits pasted comma-separated text into separate tags", async () => {
    const user = userEvent.setup();
    render(<TagsField label="Work categories" name="workCategories" />);

    const input = screen.getByPlaceholderText("Type and press Enter");
    await user.click(input);
    await user.paste("Excavation,Trenching");

    expect(screen.getByText("Excavation")).toBeInTheDocument();
    expect(screen.getByText("Trenching")).toBeInTheDocument();
    expect(document.querySelectorAll('input[type="hidden"][name="workCategories"]')).toHaveLength(2);
  });

  it("caps a single tag at 100 characters via maxLength", () => {
    render(<TagsField label="Work categories" name="workCategories" />);

    expect(screen.getByPlaceholderText("Type and press Enter")).toHaveAttribute("maxLength", "100");
  });

  it("wires aria-invalid and aria-describedby to the error message when present", () => {
    render(<TagsField label="Work categories" name="workCategories" error="At least one category is required" />);

    const input = screen.getByPlaceholderText("Type and press Enter");
    expect(input).toHaveAttribute("aria-invalid", "true");
    const describedBy = input.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy!)).toHaveTextContent("At least one category is required");
  });
});
