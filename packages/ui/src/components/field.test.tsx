import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SelectField, TextField, TextareaField } from "./field";

describe("TextField", () => {
  it("associates the label with the input", () => {
    render(<TextField label="Name" />);
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
  });

  it("renders a hint when there is no error", () => {
    render(<TextField label="Name" hint="Up to 200 characters" />);
    expect(screen.getByText("Up to 200 characters")).toBeInTheDocument();
  });

  it("renders an accessible inline error and marks the input invalid", () => {
    render(<TextField label="Name" error="Name is required" />);
    const input = screen.getByLabelText("Name");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("Name is required");
    expect(input).toHaveAttribute("aria-describedby", expect.stringContaining("error"));
  });

  it("hides the hint when an error is present", () => {
    render(<TextField label="Name" hint="A hint" error="An error" />);
    expect(screen.queryByText("A hint")).not.toBeInTheDocument();
  });

  it("colors a toned hint and politely announces the danger tone", () => {
    const { rerender } = render(<TextField label="Quantity" hint="80 Bag available" hintTone="positive" />);
    expect(screen.getByText("80 Bag available")).toHaveClass("text-success-700");

    rerender(<TextField label="Quantity" hint="Exceeds available stock" hintTone="danger" />);
    const hint = screen.getByText("Exceeds available stock");
    expect(hint).toHaveClass("text-danger-700");
    expect(hint).toHaveAttribute("role", "status");
  });
});

describe("SelectField", () => {
  const options = [
    { value: "ACTIVE", label: "Active" },
    { value: "ON_HOLD", label: "On Hold" },
  ];

  it("renders all options and associates the label", () => {
    render(<SelectField label="Status" options={options} />);
    const select = screen.getByLabelText("Status");
    expect(select).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Active" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "On Hold" })).toBeInTheDocument();
  });

  it("renders an accessible inline error", () => {
    render(<SelectField label="Status" options={options} error="Status is required" />);
    expect(screen.getByLabelText("Status")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("Status is required");
  });
});

describe("TextareaField", () => {
  it("associates the label with a textarea control", () => {
    render(<TextareaField label="Registered address" />);
    const control = screen.getByLabelText("Registered address");
    expect(control.tagName).toBe("TEXTAREA");
  });

  it("renders an accessible inline error and marks the field invalid", () => {
    render(<TextareaField label="Registered address" error="Address is too long" />);
    expect(screen.getByLabelText("Registered address")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("Address is too long");
  });
});
