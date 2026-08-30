"use server";

import { authedFetch } from "@/lib/api";
import { redirect } from "next/navigation";

// Soft delete (Owner/Admin only, enforced by the API): the Vendor disappears
// from the app; its row and purchase history stay in the database.
export async function deleteVendorAction(vendorId: string): Promise<void> {
  let res: Response;
  try {
    res = await authedFetch(`/vendors/${vendorId}`, { method: "DELETE" });
  } catch {
    redirect(`/vendors/${vendorId}?flash=${encodeURIComponent("Couldn't delete this Vendor — please try again.")}`);
  }
  if (!res.ok) {
    const message =
      res.status === 403
        ? "Only an Owner/Admin can delete a Vendor."
        : "Couldn't delete this Vendor — please try again.";
    redirect(`/vendors/${vendorId}?flash=${encodeURIComponent(message)}`);
  }
  redirect(`/vendors?flash=${encodeURIComponent("Vendor deleted. Its records remain in the database.")}`);
}
