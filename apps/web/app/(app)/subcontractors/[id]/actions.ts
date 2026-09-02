"use server";

import { authedFetch } from "@/lib/api";
import { redirect } from "next/navigation";

// Soft delete (Owner/Admin only, enforced by the API): the Subcontractor
// disappears from the app; its row and Site Contract/work/payment history
// stay in the database.
export async function deleteSubcontractorAction(subcontractorId: string): Promise<void> {
  let res: Response | null = null;
  try {
    res = await authedFetch(`/subcontractors/${subcontractorId}`, { method: "DELETE" });
  } catch {
    res = null;
  }
  if (!res) {
    redirect(
      `/subcontractors/${subcontractorId}?flash=${encodeURIComponent("Couldn't delete this Subcontractor — please try again.")}`,
    );
  } else if (res.status === 404) {
    // Concurrent-delete race: another admin already deleted it — the detail
    // page no longer exists, so land on the list, not a 404 page.
    redirect(`/subcontractors?flash=${encodeURIComponent("This Subcontractor was already deleted.")}`);
  } else if (!res.ok) {
    const message =
      res.status === 403
        ? "Only an Owner/Admin can delete a Subcontractor."
        : "Couldn't delete this Subcontractor — please try again.";
    redirect(`/subcontractors/${subcontractorId}?flash=${encodeURIComponent(message)}`);
  } else {
    redirect(`/subcontractors?flash=${encodeURIComponent("Subcontractor deleted. Its records remain in the database.")}`);
  }
}
