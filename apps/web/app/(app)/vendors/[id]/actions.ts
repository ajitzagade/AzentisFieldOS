"use server";

import { authedFetch } from "@/lib/api";
import { redirect } from "next/navigation";

// Soft delete (Owner/Admin only, enforced by the API): the Vendor disappears
// from the app; its row and purchase history stay in the database.
export async function deleteVendorAction(vendorId: string): Promise<void> {
  let res: Response | null = null;
  try {
    res = await authedFetch(`/vendors/${vendorId}`, { method: "DELETE" });
  } catch {
    res = null;
  }
  if (!res) {
    redirect(`/vendors/${vendorId}?flash=${encodeURIComponent("Couldn't delete this Vendor — please try again.")}`);
  } else if (res.status === 404) {
    // Concurrent-delete race: another admin already deleted it — the detail
    // page no longer exists, so land on the list, not a 404 page.
    redirect(`/vendors?flash=${encodeURIComponent("This Vendor was already deleted.")}`);
  } else if (!res.ok) {
    const message =
      res.status === 403
        ? "Only an Owner/Admin can delete a Vendor."
        : "Couldn't delete this Vendor — please try again.";
    redirect(`/vendors/${vendorId}?flash=${encodeURIComponent(message)}`);
  } else {
    redirect(`/vendors?flash=${encodeURIComponent("Vendor deleted. Its records remain in the database.")}`);
  }
}
