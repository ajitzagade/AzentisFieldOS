import { Badge } from "@azentisfieldos/ui";

export type AssetLocationStatus = "AVAILABLE" | "AT_SITE" | "MAINTENANCE";

// Current location is manually recorded at each Movement (Story 8.2), not
// live GPS tracking — currentSite/currentStatus are read-only derived
// state everywhere this is used, never edited via a list or Edit form
// (AC #3). Shared by the register list and both Machinery/Vehicle detail
// pages so the status -> Badge mapping lives in exactly one place.
export function statusBadge(status: AssetLocationStatus) {
  if (status === "AT_SITE") return <Badge variant="warning">In Use</Badge>;
  if (status === "MAINTENANCE") return <Badge variant="neutral">Maintenance</Badge>;
  return <Badge variant="success">Available</Badge>;
}
