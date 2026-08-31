import { type ReactNode } from "react";
import { cn } from "../lib/cn";

// The single Data Table implementation (AD-5). Row-linking is deliberately
// an accessor prop (rowHref), never onClick + cursor-pointer styling — a
// row with no rowHref is provably free of both link markup and a pointer
// cursor. This is what makes the class of bug UX review caught in
// mockups/18-daily-activities.html (a cursor:pointer row with no real
// link) structurally impossible here, not just avoided by convention.
export interface DataTableColumn<T> {
  header: string;
  cell: (row: T) => ReactNode;
  align?: "left" | "right";
  /** Present only on a sortable column — the key reported to onSortChange
   * when this header is clicked. A column with no sortKey renders as a
   * plain, unclickable header even when the table as a whole is sortable. */
  sortKey?: string;
}

export type DataTableState<T> =
  | { status: "loading" }
  | { status: "error"; message: ReactNode; retryLabel: string; onRetry: () => void }
  | { status: "empty"; icon?: ReactNode; message: ReactNode; action?: ReactNode }
  | { status: "success"; rows: T[] };

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  state: DataTableState<T>;
  rowKey: (row: T) => string;
  /** Returns the destination for a row, or undefined for a row with no
   * detail surface to open. Rows without an href render with no
   * cursor-pointer and no link semantics at all — never an onClick
   * substitute. */
  rowHref?: (row: T) => string | undefined;
  className?: string;
  /** The currently active sort, if any. Omit entirely for an unsorted table. */
  sort?: { key: string; order: "asc" | "desc" };
  /** Called with a column's sortKey when its header is clicked. Only
   * columns with a sortKey become clickable. */
  onSortChange?: (key: string) => void;
}

// Cells are `whitespace-nowrap` so columns keep their natural, readable width
// instead of wrapping into cramped multi-line stacks on a narrow (mobile)
// viewport — the table then grows past the container and the `overflow-x-auto`
// wrapper lets it scroll horizontally, per EXPERIENCE.md's "Owner on mobile:
// tables scroll horizontally" contract, rather than the old `overflow-hidden`
// squeeze.
function headerCellClass(align: DataTableColumn<unknown>["align"]) {
  return cn(
    "px-4 py-3 text-left text-eyebrow uppercase text-ink-500 bg-surface-2 border-b border-border-hairline whitespace-nowrap",
    align === "right" && "text-right",
  );
}

function bodyCellClass(align: DataTableColumn<unknown>["align"]) {
  return cn(
    "px-4 py-3 align-middle text-ink-900 whitespace-nowrap",
    align === "right" && "text-right tabular-nums",
  );
}

export function DataTable<T>({ columns, state, rowKey, rowHref, className, sort, onSortChange }: DataTableProps<T>) {
  return (
    <div className={cn("bg-surface-1 border border-border-hairline rounded-lg shadow-2 overflow-hidden", className)}>
      {/* Horizontal scroll container: on a phone a wide table scrolls sideways
          instead of clipping or cramming its columns. */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-body-sm">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.header} className={headerCellClass(column.align)}>
                {column.sortKey && onSortChange ? (
                  <button
                    type="button"
                    onClick={() => onSortChange(column.sortKey!)}
                    className="inline-flex items-center gap-1 hover:text-ink-700"
                  >
                    {column.header}
                    {sort?.key === column.sortKey ? <span aria-hidden>{sort.order === "asc" ? "▲" : "▼"}</span> : null}
                  </button>
                ) : (
                  column.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {state.status === "loading" ? (
            Array.from({ length: 5 }, (_, rowIndex) => (
              <tr key={rowIndex} className="border-b border-border-hairline last:border-b-0">
                {columns.map((column) => (
                  <td key={column.header} className={bodyCellClass(column.align)}>
                    <div className="h-4 w-full max-w-40 animate-pulse rounded-sm bg-surface-2" />
                  </td>
                ))}
              </tr>
            ))
          ) : state.status === "empty" ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-16 text-center text-ink-500">
                {state.icon ? (
                  <div className="mb-3 flex justify-center opacity-50 [&>svg]:size-10">{state.icon}</div>
                ) : null}
                <p>{state.message}</p>
                {state.action ? <div className="mt-4 flex justify-center">{state.action}</div> : null}
              </td>
            </tr>
          ) : state.status === "error" ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-16 text-center text-ink-500">
                <p>{state.message}</p>
                <button
                  type="button"
                  onClick={state.onRetry}
                  className="mt-4 text-accent-teal-700 underline-offset-2 hover:underline"
                >
                  {state.retryLabel}
                </button>
              </td>
            </tr>
          ) : (
            state.rows.map((row) => {
              const href = rowHref?.(row);
              return (
                <tr
                  key={rowKey(row)}
                  className="border-b border-border-hairline last:border-b-0 transition-colors duration-fast ease-(--ease-standard) even:bg-surface-2 hover:bg-accent-teal-100"
                >
                  {columns.map((column) =>
                    href ? (
                      <td key={column.header} className={cn(bodyCellClass(column.align), "p-0")}>
                        <a href={href} className="block px-4 py-3">
                          {column.cell(row)}
                        </a>
                      </td>
                    ) : (
                      <td key={column.header} className={bodyCellClass(column.align)}>
                        {column.cell(row)}
                      </td>
                    ),
                  )}
                </tr>
              );
            })
          )}
        </tbody>
        </table>
      </div>
    </div>
  );
}
