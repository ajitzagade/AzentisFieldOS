"use server";

import { authedFetch } from "@/lib/api";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

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
    // Code review 2026-09-04: /vendors now carries a short revalidate
    // window — revalidate before landing there so the list doesn't still
    // show a row that's actually gone.
    revalidatePath("/vendors");
    redirect(`/vendors?flash=${encodeURIComponent("This Vendor was already deleted.")}`);
  } else if (!res.ok) {
    const message =
      res.status === 403
        ? "Only an Owner/Admin can delete a Vendor."
        : "Couldn't delete this Vendor — please try again.";
    redirect(`/vendors/${vendorId}?flash=${encodeURIComponent(message)}`);
  } else {
    // Same reasoning as the 404 branch above — this Vendor was just
    // soft-deleted, and the list must reflect that immediately.
    revalidatePath("/vendors");
    redirect(`/vendors?flash=${encodeURIComponent("Vendor deleted. Its records remain in the database.")}`);
  }
}
