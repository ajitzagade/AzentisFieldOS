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

/** Opt-in mobile card rendering for a wide table. When passed to DataTable,
 * every row renders as a stacked card below the `md` breakpoint instead of a
 * horizontally-scrolling table row; at `md` and above the table renders
 * exactly as it always has. Detail rows are derived from the same `columns`
 * definition (header as the label, `cell(row)` as the value), so the card is
 * never a second hand-maintained field list. */
export interface DataTableMobileCard<T> {
  /** The 1–2 key fields that identify the row — rendered as the card's
   * bolder primary line. */
  primary: (row: T) => ReactNode;
  /** Column headers already represented in the primary line (or not worth
   * repeating on a phone) — excluded from the card's label/value detail
   * rows. Columns with an empty header (icon/action columns) are always
   * excluded; put their affordances in `action` or `footer` instead. */
  omitHeaders?: string[];
  /** The row's compact action affordances (Correct icon / chevron link),
   * rendered top-right of the card with a touch-size (44px min) target. */
  action?: (row: T) => ReactNode;
  /** Optional wider per-row affordance (e.g. a labelled status button) that
   * would not fit top-right — rendered full-width below the detail rows,
   * outside the card's rowHref link. */
  footer?: (row: T) => ReactNode;
}

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
  /** Opt-in: render each row as a card below the `md` breakpoint instead of
   * a sideways-scrolling table row. Omit it and the table renders
   * identically to before at every viewport width. Sort headers stay
   * desktop-only — cards carry no sort UI. */
  mobileCard?: DataTableMobileCard<T>;
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

const cardSurfaceClass = "bg-surface-1 border border-border-hairline rounded-lg shadow-2";

/** The below-`md` card rendering of a DataTable (AD-5/AD-6): a semantic list
 * whose items mirror the table's rows — same columns, same state machine
 * (pulsing card skeletons while loading, the shared empty/error panels
 * otherwise). Only rendered when a `mobileCard` config is passed. */
function DataTableCardList<T>({
  columns,
  state,
  rowKey,
  rowHref,
  mobileCard,
  className,
}: {
  columns: DataTableColumn<T>[];
  state: DataTableState<T>;
  rowKey: (row: T) => string;
  rowHref?: (row: T) => string | undefined;
  mobileCard: DataTableMobileCard<T>;
  className?: string;
}) {
  const detailColumns = columns.filter(
    (column) => column.header !== "" && !mobileCard.omitHeaders?.includes(column.header),
  );

  if (state.status === "loading") {
    return (
      <ul aria-hidden className={cn("flex flex-col gap-3 md:hidden", className)}>
        {Array.from({ length: 5 }, (_, index) => (
          <li key={index} className={cn(cardSurfaceClass, "animate-pulse p-4")}>
            <div className="h-4 w-1/2 rounded-sm bg-surface-2" />
            <div className="mt-3 flex flex-col gap-2">
              <div className="h-3 w-full rounded-sm bg-surface-2" />
              <div className="h-3 w-2/3 rounded-sm bg-surface-2" />
            </div>
          </li>
        ))}
      </ul>
    );
  }

  if (state.status === "empty" || state.status === "error") {
    return (
      <div className={cn(cardSurfaceClass, "px-6 py-16 text-center text-body-sm text-ink-500 md:hidden", className)}>
        {state.status === "empty" && state.icon ? (
          <div className="mb-3 flex justify-center opacity-50 [&>svg]:size-10">{state.icon}</div>
        ) : null}
        <p>{state.message}</p>
        {state.status === "empty" && state.action ? (
          <div className="mt-4 flex justify-center">{state.action}</div>
        ) : null}
        {state.status === "error" ? (
          <button
            type="button"
            onClick={state.onRetry}
            className="mt-4 text-accent-teal-700 underline-offset-2 hover:underline"
          >
            {state.retryLabel}
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <ul className={cn("flex flex-col gap-3 md:hidden", className)}>
      {state.rows.map((row) => {
        const href = rowHref?.(row);
        const action = mobileCard.action?.(row);
        const footer = mobileCard.footer?.(row);
        const primary = (
          <span className="text-body-sm font-semibold text-ink-900">{mobileCard.primary(row)}</span>
        );
        return (
          <li
            key={rowKey(row)}
            className={cn(
              cardSurfaceClass,
              "relative p-4 transition-shadow duration-(--default-transition-duration) ease-(--ease-standard) hover:shadow-2-hover",
            )}
          >
            <div className="flex items-start justify-between gap-2">
              {href ? (
                /* Stretched link: the anchor's ::after covers the whole card,
                   so the full card is the link (same as the whole-row link on
                   desktop) while `action` stays a sibling — never an
                   interactive element nested inside another. */
                <a href={href} className="min-w-0 flex-1 after:absolute after:inset-0 after:content-['']">
                  {primary}
                </a>
              ) : (
                <div className="min-w-0 flex-1">{primary}</div>
              )}
              {action ? (
                <div className="relative z-10 -me-2 -mt-2 flex shrink-0 items-center gap-1 [&_a]:min-h-11 [&_a]:min-w-11 [&_button]:min-h-11 [&_button]:min-w-11">
                  {action}
                </div>
              ) : null}
            </div>
            {detailColumns.length > 0 ? (
              <dl className="mt-3 flex flex-col gap-1.5 text-body-sm">
                {detailColumns.map((column) => (
                  <div key={column.header} className="flex items-baseline justify-between gap-3">
                    <dt className="shrink-0 text-ink-500">{column.header}</dt>
                    <dd className={cn("text-right text-ink-900", column.align === "right" && "tabular-nums")}>
                      {column.cell(row)}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : null}
            {footer ? <div className="relative z-10 mt-3">{footer}</div> : null}
          </li>
        );
      })}
    </ul>
  );
}

export function DataTable<T>({
  columns,
  state,
  rowKey,
  rowHref,
  className,
  sort,
  onSortChange,
  mobileCard,
}: DataTableProps<T>) {
  const table = (
    <div
      className={cn(
        "bg-surface-1 border border-border-hairline rounded-lg shadow-2 overflow-hidden",
        mobileCard && "max-md:hidden",
        className,
      )}
    >
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

  if (!mobileCard) {
    return table;
  }

  return (
    <>
      {table}
      <DataTableCardList
        columns={columns}
        state={state}
        rowKey={rowKey}
        rowHref={rowHref}
        mobileCard={mobileCard}
        className={className}
      />
    </>
  );
}
