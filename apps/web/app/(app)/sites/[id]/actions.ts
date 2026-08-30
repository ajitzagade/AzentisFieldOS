"use server";

import { authedFetch } from "@/lib/api";
import { redirect } from "next/navigation";

// Soft delete (Owner/Admin only, enforced by the API): the Site disappears
// from the app; its row and transaction history stay in the database.
export async function deleteSiteAction(siteId: string): Promise<void> {
  let res: Response | null = null;
  try {
    res = await authedFetch(`/sites/${siteId}`, { method: "DELETE" });
  } catch {
    res = null;
  }
  if (!res) {
    redirect(`/sites/${siteId}?flash=${encodeURIComponent("Couldn't delete this Site — please try again.")}`);
  } else if (res.status === 404) {
    // Concurrent-delete race: another admin already deleted it — the detail
    // page no longer exists, so land on the list, not a 404 page.
    redirect(`/sites?flash=${encodeURIComponent("This Site was already deleted.")}`);
  } else if (!res.ok) {
    const message =
      res.status === 403
        ? "Only an Owner/Admin can delete a Site."
        : "Couldn't delete this Site — please try again.";
    redirect(`/sites/${siteId}?flash=${encodeURIComponent(message)}`);
  } else {
    redirect(`/sites?flash=${encodeURIComponent("Site deleted. Its records remain in the database.")}`);
  }
}
