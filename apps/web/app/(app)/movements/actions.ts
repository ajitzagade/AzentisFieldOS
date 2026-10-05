"use server";

import { deleteMovementEntry } from "@/lib/delete-movement-entry";

// AD-9 exception (approved 2026-10-05): one thin wrapper per entity around
// the shared deleteMovementEntry helper — only the resource path and
// entity label differ. All three land back on /movements, the unified
// list every one of them renders in (ReturnWastage, the fourth row type
// that list shows, is a separate entity outside this feature's scope and
// has no delete action).
export async function deletePurchaseAction(id: string, reason: string) {
  await deleteMovementEntry("/purchases", id, reason, "/movements", "Purchase");
}

export async function deleteMovementAction(id: string, reason: string) {
  await deleteMovementEntry("/movements", id, reason, "/movements", "Movement");
}

export async function deleteConsumptionAction(id: string, reason: string) {
  await deleteMovementEntry("/consumption", id, reason, "/movements", "Material Used entry");
}
