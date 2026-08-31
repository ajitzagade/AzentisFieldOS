import { Button } from "./button";

// The single pagination control (AD-5) for every list this product paginates
// — Previous/Next only, never infinite scroll (banned per EXPERIENCE.md's
// interaction contract). Renders nothing once every row already fits on one
// page, so a small list looks exactly as it did before pagination existed.
export interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ page, pageSize, total, onPageChange, className }: PaginationProps) {
  const lastPage = Math.max(1, Math.ceil(total / pageSize));
  if (lastPage <= 1) {
    return null;
  }

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className={`flex items-center justify-between gap-3 ${className ?? ""}`}>
      <span className="text-caption text-ink-500">
        Showing {start}–{end} of {total}
      </span>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={page >= lastPage}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
