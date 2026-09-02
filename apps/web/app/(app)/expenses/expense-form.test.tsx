import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("./actions", () => ({
  createExpenseAction: Object.assign(vi.fn(async () => ({})), { bind: vi.fn(() => vi.fn(async () => ({}))) }),
}));

import { ExpenseForm } from "./expense-form";

const sites = [{ id: "site1", name: "NH-48 Highway Widening" }];
const categories = [{ id: "cat1", name: "Fuel" }];

describe("ExpenseForm", () => {
  it("renders the core fields for a new Expense", () => {
    render(<ExpenseForm mode="new" sites={sites} categories={categories} />);

    expect(screen.getByLabelText("Site")).toBeInTheDocument();
    // SiteField is a searchable combobox — the labelled combobox proves the wiring.
    expect(screen.getByLabelText("Site")).toHaveAttribute("role", "combobox");
    expect(screen.getByLabelText("Category")).toBeInTheDocument();
    expect(screen.getByLabelText("Category")).toHaveAttribute("role", "combobox");
    expect(screen.getByLabelText("Amount")).toBeInTheDocument();
    expect(screen.getByLabelText("Date")).toBeInTheDocument();
    expect(screen.getByLabelText("Payment Method")).toBeInTheDocument();
    expect(screen.getByLabelText("Person / Vendor")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Record Expense" })).toBeInTheDocument();
  });

  it("shows a correction banner with a required reason field, and locks Site/Category in correct mode", () => {
    render(
      <ExpenseForm
        mode="correct"
        originalAmount={5000}
        correctsId="exp1"
        sites={sites}
        categories={categories}
        initial={{ siteId: "site1", categoryId: "cat1", incurredAt: "2026-08-05" }}
      />,
    );

    expect(screen.getByText("Filing a correction")).toBeInTheDocument();
    expect(screen.getByLabelText("Reason for this correction")).toBeRequired();
    expect(screen.getByLabelText("Site")).toBeDisabled();
    expect(screen.getByLabelText("Category")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Submit Correction" })).toBeInTheDocument();
  });

  it("labels the amount field as an adjustment with a delta hint in correct mode", () => {
    render(
      <ExpenseForm
        mode="correct"
        originalAmount={5000}
        correctsId="exp1"
        sites={sites}
        categories={categories}
        initial={{ siteId: "site1", categoryId: "cat1", incurredAt: "2026-08-05" }}
      />,
    );

    // D4: the user types the corrected amount; the delta is derived underneath.
    expect(screen.getByLabelText("Corrected amount")).toBeInTheDocument();
    expect(screen.getByText(/Currently recorded: ₹5,000/)).toBeInTheDocument();
  });
});
