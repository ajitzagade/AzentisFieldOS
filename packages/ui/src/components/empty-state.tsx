import { type ReactElement, type ReactNode } from "react";
import { cn } from "../lib/cn";

// The single Empty State implementation (AD-5, AD-6). Used both for a
// data-bearing component with zero rows (e.g. story 1.3's DataTable) and
// for a whole route with no real screen implemented yet — one shared
// "nothing here" treatment rather than each screen inventing its own.
export interface EmptyStateProps {
  icon?: ReactNode;
  message: ReactNode;
  action?: ReactElement;
  className?: string;
}

export function EmptyState({ icon, message, action, className }: EmptyStateProps) {
  return (
    <div className={cn("px-6 py-16 text-center text-ink-500", className)}>
      {icon ? <div className="mb-3 flex justify-center opacity-50 [&>svg]:size-10">{icon}</div> : null}
      <p>{message}</p>
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}
