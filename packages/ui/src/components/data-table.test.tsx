import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DataTable, type DataTableColumn } from "./data-table";

interface Row {
  id: string;
  name: string;
  qty: number;
}

const columns: DataTableColumn<Row>[] = [
  { header: "Material", cell: (row) => row.name },
  { header: "Qty", cell: (row) => row.qty, align: "right" },
];

const rows: Row[] = [
  { id: "1", name: "Cement", qty: 120 },
  { id: "2", name: "TMT Steel", qty: 48 },
];

describe("DataTable", () => {
  it("zebra-stripes and hover-highlights body rows", () => {
    render(<DataTable columns={columns} rowKey={(r) => r.id} state={{ status: "success", rows }} />);
    const row = screen.getByText("Cement").closest("tr") as HTMLElement;
    expect(row.className).toContain("even:bg-surface-2");
    expect(row.className).toContain("hover:bg-accent-teal-100");
  });

  it("renders a row as a real link when rowHref is defined", () => {
    render(
      <DataTable
        columns={columns}
        rowKey={(r) => r.id}
        state={{ status: "success", rows }}
        rowHref={(r) => `/materials/${r.id}`}
      />,
    );
    const link = screen.getByText("Cement").closest("a");
    expect(link).not.toBeNull();
    expect(link).toHaveAttribute("href", "/materials/1");
  });

  it("renders no link and no cursor-pointer when rowHref returns undefined for a row", () => {
    render(
      <DataTable
        columns={columns}
        rowKey={(r) => r.id}
        state={{ status: "success", rows }}
        rowHref={() => undefined}
      />,
    );
    expect(screen.getByText("Cement").closest("a")).toBeNull();
    const row = screen.getByText("Cement").closest("tr") as HTMLElement;
    expect(row.className).not.toContain("cursor-pointer");
  });

  it("renders skeleton rows matching the column count while loading", () => {
    const { container } = render(
      <DataTable columns={columns} rowKey={(r) => r.id} state={{ status: "loading" }} />,
    );
    const skeletonRows = container.querySelectorAll("tbody tr");
    expect(skeletonRows).toHaveLength(5);
    expect(skeletonRows[0]?.querySelectorAll("td")).toHaveLength(columns.length);
  });

  it("renders an empty-state message and action, not a bare header-only table", () => {
    render(
      <DataTable
        columns={columns}
        rowKey={(r) => r.id}
        state={{ status: "empty", message: "No materials yet.", action: <button>Add material</button> }}
      />,
    );
    expect(screen.getByText("No materials yet.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add material" })).toBeInTheDocument();
  });

  it("renders a plain-language retry affordance on error, not a raw status", () => {
    const onRetry = vi.fn();
    render(
      <DataTable
        columns={columns}
        rowKey={(r) => r.id}
        state={{ status: "error", message: "Couldn't load materials.", retryLabel: "Try again", onRetry }}
      />,
    );
    const retryButton = screen.getByRole("button", { name: "Try again" });
    retryButton.click();
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
