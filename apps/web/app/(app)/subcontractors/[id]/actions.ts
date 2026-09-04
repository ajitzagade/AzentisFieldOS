"use server";

import { authedFetch } from "@/lib/api";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

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
    // Code review 2026-09-04: /subcontractors now carries a short
    // revalidate window — revalidate before landing there so the list
    // doesn't still show a row that's actually gone.
    revalidatePath("/subcontractors");
    redirect(`/subcontractors?flash=${encodeURIComponent("This Subcontractor was already deleted.")}`);
  } else if (!res.ok) {
    const message =
      res.status === 403
        ? "Only an Owner/Admin can delete a Subcontractor."
        : "Couldn't delete this Subcontractor — please try again.";
    redirect(`/subcontractors/${subcontractorId}?flash=${encodeURIComponent(message)}`);
  } else {
    // Same reasoning as the 404 branch above — this Subcontractor was
    // just soft-deleted, and the list must reflect that immediately.
    revalidatePath("/subcontractors");
    redirect(`/subcontractors?flash=${encodeURIComponent("Subcontractor deleted. Its records remain in the database.")}`);
  }
}
