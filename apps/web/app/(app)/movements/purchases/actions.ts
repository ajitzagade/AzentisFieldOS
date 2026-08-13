"use server";

import { redirect } from "next/navigation";
import { createPurchaseSchema } from "@azentisfieldos/shared";

export interface CreatePurchaseFormState {
  errors?: Record<string, string[]>;
  formError?: string;
}

// One Server Action for both a plain Purchase and a correction of one —
// the API has a single POST /purchases that branches on correctsId
// (story 5.1 Dev Notes), so the form layer mirrors that rather than
// maintaining two separate submit paths.
export async function createPurchaseAction(
  _prevState: CreatePurchaseFormState,
  formData: FormData,
): Promise<CreatePurchaseFormState> {
  const parsed = createPurchaseSchema.safeParse({
    vendorId: formData.get("vendorId"),
    materialSizeId: formData.get("materialSizeId"),
    destination: formData.get("destination"),
    siteId: formData.get("siteId") || undefined,
    quantity: Number(formData.get("quantity")),
    rate: Number(formData.get("rate")),
    totalAmount: Number(formData.get("totalAmount")),
    invoiceOrChallanNo: formData.get("invoiceOrChallanNo") || undefined,
    paymentStatus: formData.get("paymentStatus"),
    deliveryLocation: formData.get("deliveryLocation") || undefined,
    vehicleDetails: formData.get("vehicleDetails") || undefined,
    receiverName: formData.get("receiverName") || undefined,
    notes: formData.get("notes") || undefined,
    purchasedAt: formData.get("purchasedAt"),
    correctsId: formData.get("correctsId") || undefined,
    reason: formData.get("reason") || undefined,
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const res = await fetch(`${process.env.API_URL}/purchases`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });

  if (res.status === 400) {
    const body = (await res.json()) as { error?: { details?: { fieldErrors?: Record<string, string[]> }; message?: string } };
    if (body.error?.details?.fieldErrors) {
      return { errors: body.error.details.fieldErrors };
    }
    return { formError: body.error?.message ?? "This Purchase references a Vendor, Material Size, or Site that does not exist." };
  }

  if (!res.ok) {
    return { formError: "Something went wrong recording the Purchase. Please try again." };
  }

  redirect("/movements");
}
