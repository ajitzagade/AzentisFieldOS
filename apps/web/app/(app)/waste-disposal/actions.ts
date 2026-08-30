"use server";

import { authedFetch } from "@/lib/api";
import { redirect } from "next/navigation";
import { createWasteDisposalSchema } from "@azentisfieldos/shared";

export interface CreateWasteDisposalFormState {
  errors?: Record<string, string[]>;
  formError?: string;
}

// One Server Action for both a plain Waste Disposal entry and a correction
// of one — the API has a single POST /waste-disposals that branches on
// correctsId (same shape as createExpenseAction). `totalAmount` is never
// sent: apps/api computes trips × rate + other charges itself.
export async function createWasteDisposalAction(
  _prevState: CreateWasteDisposalFormState,
  formData: FormData,
): Promise<CreateWasteDisposalFormState> {
  const otherChargesRaw = formData.get("otherCharges");
  const parsed = createWasteDisposalSchema.safeParse({
    siteId: formData.get("siteId"),
    wasteType: formData.get("wasteType"),
    quantityDetails: formData.get("quantityDetails") || undefined,
    ownership: formData.get("ownership"),
    vendorId: formData.get("vendorId") || undefined,
    machineryId: formData.get("machineryId") || undefined,
    vehicleId: formData.get("vehicleId") || undefined,
    vehicleDetails: formData.get("vehicleDetails") || undefined,
    tripCount: Number(formData.get("tripCount")),
    ratePerTrip: Number(formData.get("ratePerTrip")),
    otherCharges: otherChargesRaw ? Number(otherChargesRaw) : undefined,
    disposalLocation: formData.get("disposalLocation") || undefined,
    paymentStatus: formData.get("paymentStatus") || undefined,
    notes: formData.get("notes") || undefined,
    disposedAt: formData.get("disposedAt"),
    correctsId: formData.get("correctsId") || undefined,
    reason: formData.get("reason") || undefined,
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  let res: Response;
  try {
    res = await authedFetch(`/waste-disposals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
  } catch {
    return { formError: "Something went wrong recording this disposal. Please try again." };
  }

  if (res.status === 400) {
    // Same two 400 shapes as createExpenseAction: ZodValidationPipe field
    // errors vs a plain BadRequestException string.
    const body = (await res.json().catch(() => undefined)) as
      | { error?: { details?: { fieldErrors?: Record<string, string[]> } }; message?: string }
      | undefined;
    if (body?.error?.details?.fieldErrors) {
      return { errors: body.error.details.fieldErrors };
    }
    return {
      formError: body?.message ?? "This entry references a Site, Vendor or asset that does not exist.",
    };
  }

  if (!res.ok) {
    return { formError: "Something went wrong recording this disposal. Please try again." };
  }

  redirect(
    `/waste-disposal?flash=${encodeURIComponent(
      formData.get("correctsId") ? "Disposal correction recorded" : "Disposal recorded",
    )}`,
  );
}
