import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BarChart } from "./bar-chart";

describe("BarChart", () => {
  it("renders a label and value for every row", () => {
    render(
      <BarChart
        rows={[
          { label: "Cement", value: 400 },
          { label: "Sand", value: 20 },
        ]}
      />,
    );
    expect(screen.getByText("Cement")).toBeInTheDocument();
    expect(screen.getByText("400")).toBeInTheDocument();
    expect(screen.getByText("Sand")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();
  });

  it("renders a custom displayValue when provided", () => {
    render(<BarChart rows={[{ label: "Purchases", value: 567500, displayValue: "₹5,67,500" }]} />);
    expect(screen.getByText("₹5,67,500")).toBeInTheDocument();
  });
});
