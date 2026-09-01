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

  it("wraps the table in a horizontal-scroll container with nowrap cells for mobile", () => {
    const { container } = render(
      <DataTable columns={columns} rowKey={(r) => r.id} state={{ status: "success", rows }} />,
    );
    // A wide table must scroll sideways on a narrow viewport, not clip/cram.
    const scroll = container.querySelector(".overflow-x-auto");
    expect(scroll).not.toBeNull();
    expect(scroll?.querySelector("table")).not.toBeNull();
    const cell = screen.getByText("Cement").closest("td") as HTMLElement;
    expect(cell.className).toContain("whitespace-nowrap");
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

  it("renders a plain header for a column with no sortKey, even when the table is sortable", () => {
    render(
      <DataTable
        columns={columns}
        rowKey={(r) => r.id}
        state={{ status: "success", rows }}
        sort={{ key: "qty", order: "asc" }}
        onSortChange={vi.fn()}
      />,
    );
    expect(screen.queryByRole("button", { name: "Material" })).not.toBeInTheDocument();
  });

  it("renders a sortable column's header as a clickable control that reports its sortKey", () => {
    const sortableColumns: DataTableColumn<Row>[] = [
      { header: "Material", cell: (row) => row.name },
      { header: "Qty", cell: (row) => row.qty, align: "right", sortKey: "qty" },
    ];
    const onSortChange = vi.fn();
    render(
      <DataTable
        columns={sortableColumns}
        rowKey={(r) => r.id}
        state={{ status: "success", rows }}
        onSortChange={onSortChange}
      />,
    );
    screen.getByRole("button", { name: "Qty" }).click();
    expect(onSortChange).toHaveBeenCalledWith("qty");
  });

  it("shows an indicator only on the column currently active in sort", () => {
    const sortableColumns: DataTableColumn<Row>[] = [
      { header: "Material", cell: (row) => row.name, sortKey: "name" },
      { header: "Qty", cell: (row) => row.qty, align: "right", sortKey: "qty" },
    ];
    render(
      <DataTable
        columns={sortableColumns}
        rowKey={(r) => r.id}
        state={{ status: "success", rows }}
        sort={{ key: "qty", order: "desc" }}
        onSortChange={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: "Qty" }).textContent).toContain("▼");
    expect(screen.getByRole("button", { name: "Material" }).textContent).not.toContain("▼");
    expect(screen.getByRole("button", { name: "Material" }).textContent).not.toContain("▲");
  });

  describe("mobileCard mode", () => {
    const mobileCard = {
      primary: (row: Row) => row.name,
      omitHeaders: ["Material"],
      action: (row: Row) => (
        <a href={`/materials/${row.id}/correct`} aria-label={`Correct ${row.name}`}>
          fix
        </a>
      ),
    };

    it("renders no card list at all when mobileCard is not provided", () => {
      const { container } = render(
        <DataTable columns={columns} rowKey={(r) => r.id} state={{ status: "success", rows }} />,
      );
      expect(container.querySelector("ul")).toBeNull();
      // The table wrapper is not viewport-hidden when there is no card mode.
      expect(container.firstElementChild?.className).not.toContain("max-md:hidden");
    });

    it("renders each row as a list-item card below md while keeping the desktop table intact", () => {
      const { container } = render(
        <DataTable columns={columns} rowKey={(r) => r.id} state={{ status: "success", rows }} mobileCard={mobileCard} />,
      );
      // Desktop: the table still renders, hidden only below md.
      expect(container.querySelector("table")).not.toBeNull();
      expect(container.firstElementChild?.className).toContain("max-md:hidden");
      // Mobile: a semantic list, hidden at md and up, one item per row.
      const list = container.querySelector("ul") as HTMLElement;
      expect(list.className).toContain("md:hidden");
      expect(list.querySelectorAll("li")).toHaveLength(rows.length);
    });

    it("renders the primary line and label/value detail rows, excluding omitted and empty headers", () => {
      const withAction: DataTableColumn<Row>[] = [...columns, { header: "", cell: () => <button>row action</button> }];
      const { container } = render(
        <DataTable
          columns={withAction}
          rowKey={(r) => r.id}
          state={{ status: "success", rows }}
          mobileCard={mobileCard}
        />,
      );
      const card = container.querySelector("li") as HTMLElement;
      // Primary line carries the key field, bolder.
      expect(card.textContent).toContain("Cement");
      expect((card.querySelector(".font-semibold") as HTMLElement).textContent).toContain("Cement");
      // Detail rows: Qty appears as a dt/dd pair; the omitted "Material"
      // header and the empty-header action column produce no detail row.
      const labels = Array.from(card.querySelectorAll("dt")).map((dt) => dt.textContent);
      expect(labels).toEqual(["Qty"]);
      expect(card.querySelector("dd")?.textContent).toBe("120");
    });

    it("keeps the row action top-right with a touch-size target and an accessible name", () => {
      render(
        <DataTable columns={columns} rowKey={(r) => r.id} state={{ status: "success", rows }} mobileCard={mobileCard} />,
      );
      const action = screen.getByRole("link", { name: "Correct Cement" });
      expect(action.parentElement?.className).toContain("min-w-11");
      expect(action.parentElement?.className).toContain("min-h-11");
    });

    it("makes the whole card a link when rowHref is defined, without nesting the action inside it", () => {
      const { container } = render(
        <DataTable
          columns={columns}
          rowKey={(r) => r.id}
          state={{ status: "success", rows }}
          rowHref={(r) => `/materials/${r.id}`}
          mobileCard={mobileCard}
        />,
      );
      const card = container.querySelector("li") as HTMLElement;
      const cardLink = card.querySelector('a[href="/materials/1"]') as HTMLElement;
      // Stretched-link pattern: the anchor's ::after covers the card.
      expect(cardLink.className).toContain("after:absolute");
      expect(cardLink.className).toContain("after:inset-0");
      // The action link is a sibling, never a descendant, of the card link.
      expect(cardLink.querySelector("a")).toBeNull();
      expect(card.querySelector('a[href="/materials/1/correct"]')).not.toBeNull();
    });

    it("renders pulsing card skeletons, not a table skeleton, for the mobile loading state", () => {
      const { container } = render(
        <DataTable columns={columns} rowKey={(r) => r.id} state={{ status: "loading" }} mobileCard={mobileCard} />,
      );
      const list = container.querySelector("ul") as HTMLElement;
      const skeletonCards = list.querySelectorAll("li");
      expect(skeletonCards).toHaveLength(5);
      expect(skeletonCards[0]?.className).toContain("animate-pulse");
      expect(list.querySelector("table")).toBeNull();
      // The table's own skeleton still exists for md and up.
      expect(container.querySelectorAll("tbody tr")).toHaveLength(5);
    });

    it("renders the empty state and its action as a mobile panel too", () => {
      const { container } = render(
        <DataTable
          columns={columns}
          rowKey={(r) => r.id}
          state={{ status: "empty", message: "No materials yet.", action: <button>Add material</button> }}
          mobileCard={mobileCard}
        />,
      );
      const panels = screen.getAllByText("No materials yet.");
      expect(panels).toHaveLength(2);
      const mobilePanel = container.querySelector("div.md\\:hidden") as HTMLElement;
      expect(mobilePanel.textContent).toContain("No materials yet.");
      expect(mobilePanel.querySelector("button")?.textContent).toBe("Add material");
    });

    it("renders the error retry affordance as a mobile panel too", () => {
      const onRetry = vi.fn();
      const { container } = render(
        <DataTable
          columns={columns}
          rowKey={(r) => r.id}
          state={{ status: "error", message: "Couldn't load materials.", retryLabel: "Try again", onRetry }}
          mobileCard={mobileCard}
        />,
      );
      const mobilePanel = container.querySelector("div.md\\:hidden") as HTMLElement;
      const retry = mobilePanel.querySelector("button") as HTMLButtonElement;
      expect(retry.textContent).toBe("Try again");
      retry.click();
      expect(onRetry).toHaveBeenCalledOnce();
    });
  });
});
