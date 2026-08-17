import { Badge, Card, CorrectAction, RotateCcwIcon } from "@azentisfieldos/ui";
import type { AssetLocationStatus } from "./status-badge";

export interface MovementHistoryItem {
  id: string;
  toStatus: AssetLocationStatus;
  site: { id: string; name: string } | null;
  movedAt: string;
}

function movementLabel(movement: MovementHistoryItem) {
  if (movement.toStatus === "AT_SITE") {
    // "Recorded at X" — a manually recorded fact, never live-tracking copy
    // (AC #3).
    return `Recorded at ${movement.site?.name ?? "—"}`;
  }
  if (movement.toStatus === "MAINTENANCE") {
    return "Sent to Maintenance";
  }
  return "Available";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

// AC #2: every prior Movement remains visible — a reverse-chronological
// timeline, never overwritten to show only the latest state. AC #4: each
// entry's "Correct" action, never Edit/Delete. Shared by the Machinery and
// Vehicle detail pages (AD-5) — only basePath ("machinery" | "vehicles")
// differs.
export function MovementTimeline({
  movements,
  basePath,
  assetId,
}: {
  movements: MovementHistoryItem[];
  basePath: "machinery" | "vehicles";
  assetId: string;
}) {
  if (movements.length === 0) {
    return (
      <Card>
        <p className="text-body-sm text-ink-500">No Movements recorded yet.</p>
      </Card>
    );
  }

  return (
    <Card>
      <p className="mb-5 text-body-sm text-ink-500">
        Full lifecycle retained — every location and maintenance change is a new dated record, never overwritten.
      </p>
      <div className="flex flex-col">
        {movements.map((movement, index) => {
          const isCurrent = index === 0;
          const isLast = index === movements.length - 1;
          return (
            <div key={movement.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={
                    "size-3 rounded-full " +
                    (movement.toStatus === "MAINTENANCE" ? "bg-warning-700" : "bg-accent-teal-700") +
                    (isCurrent ? " ring-3 ring-accent-teal-100" : "")
                  }
                />
                {isLast ? null : <div className="min-h-8 w-0.5 flex-1 bg-border-strong" />}
              </div>
              <div className={isLast ? "" : "pb-5"}>
                <div className="flex items-center gap-2 font-semibold text-ink-900">
                  {movementLabel(movement)}
                  {isCurrent ? <Badge variant="success">Current</Badge> : null}
                </div>
                <div className="mt-0.5 flex items-center gap-3 text-body-sm text-ink-500">
                  <span>{formatDate(movement.movedAt)}</span>
                  <CorrectAction
                    icon={<RotateCcwIcon className="size-4" />}
                    href={`/machinery-vehicles/${basePath}/${assetId}/movements/${movement.id}/correct`}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
