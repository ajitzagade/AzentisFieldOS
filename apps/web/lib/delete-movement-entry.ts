import { authedFetch } from "@/lib/api";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// AD-9 exception (approved 2026-10-05): the single server-side write path
// for soft-deleting a Purchase/Movement/Consumption/Waste Material/RMC
// entry — same DELETE /<resource>/:id contract on every one of the five
// (ZodValidationPipe(deleteMovementEntrySchema) server-side). Each entity's
// own Server Action wraps this with its own list path and entity-specific
// error copy, mirroring deleteVendorAction's redirect-with-flash pattern
// (apps/web/app/(app)/vendors/[id]/actions.ts) — the action itself handles
// success/failure via redirect, so DeleteMovementEntryButton's `action`
// prop never needs its own error state.
export async function deleteMovementEntry(
  resourcePath: string,
  id: string,
  reason: string,
  listPath: string,
  entityLabel: string,
  // Purchase/Movement/Consumption deletes reverse their stock effect
  // server-side (floor-checked, split-aware for Consumption) — the
  // Inventory page depends on that reversal and must be revalidated too,
  // same as the create/correct paths. RMC and Waste Material deletes
  // don't touch Site/Godown Material stock, so they leave this false.
  affectsInventory = false,
): Promise<never> {
  let res: Response | null = null;
  try {
    res = await authedFetch(`${resourcePath}/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
  } catch {
    res = null;
  }

  if (!res) {
    redirect(
      `${listPath}?flash=${encodeURIComponent(`Couldn't delete this ${entityLabel} — please try again.`)}`,
    );
  } else if (!res.ok) {
    const body = (await res.json().catch(() => undefined)) as
      | { message?: string }
      | undefined;
    const message =
      res.status === 404
        ? `This ${entityLabel} was already deleted.`
        : (body?.message ?? `Couldn't delete this ${entityLabel} — please try again.`);
    revalidatePath(listPath);
    if (affectsInventory) {
      revalidatePath("/inventory");
      // The Dashboard's low-stock/pending-pricing reads depend on this too.
      revalidatePath("/");
    }
    redirect(`${listPath}?flash=${encodeURIComponent(message)}`);
  }

  revalidatePath(listPath);
  if (affectsInventory) {
    revalidatePath("/inventory");
    revalidatePath("/");
  }
  redirect(`${listPath}?flash=${encodeURIComponent(`${entityLabel} deleted`)}`);
}
