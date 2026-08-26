import { Badge, CheckCircleIcon } from "@azentisfieldos/ui";

// Story 13.1 (AC #3, UX-DR19): the visible delivery status for a compiled
// report, derived from its per-channel ReportDelivery rows.
//   success "Delivered" — every enabled channel is SENT
//   warning "Pending"   — at least one channel is still retrying (PENDING)
//   danger  "Failed"    — a channel has exhausted retries (FAILED)
// A FAILED channel dominates: an owner must see a hard failure even if other
// channels delivered. This is AC #3's in-app surface — failures are never
// silently dropped.
export interface DeliverySummary {
  channel: string;
  status: string;
}

export type OverallDeliveryStatus = "delivered" | "pending" | "failed";

export function overallDeliveryStatus(
  deliveries: DeliverySummary[],
): OverallDeliveryStatus {
  if (deliveries.some((delivery) => delivery.status === "FAILED")) {
    return "failed";
  }
  if (
    deliveries.length > 0 &&
    deliveries.every((delivery) => delivery.status === "SENT")
  ) {
    return "delivered";
  }
  return "pending";
}

export function DeliveryStatusBadge({
  deliveries,
}: {
  deliveries: DeliverySummary[];
}) {
  const status = overallDeliveryStatus(deliveries);

  if (status === "delivered") {
    return (
      <Badge variant="success" icon={<CheckCircleIcon />}>
        Delivered
      </Badge>
    );
  }
  if (status === "failed") {
    return <Badge variant="danger">Failed</Badge>;
  }
  return <Badge variant="warning">Pending</Badge>;
}
