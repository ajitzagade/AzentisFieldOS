"use server";

import { authedFetch } from "@/lib/api";
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
    challanPhotoUrl: formData.get("challanPhotoUrl") || undefined,
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

  let res: Response;
  try {
    res = await authedFetch(`/purchases`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
  } catch {
    return { formError: "Something went wrong recording the Purchase. Please try again." };
  }

  if (res.status === 400) {
    // Two distinct 400 shapes reach here: ZodValidationPipe's own body
    // (`{ error: { details: { fieldErrors } } }`) for schema failures, and
    // Nest's default body for a plain `BadRequestException('<string>')`
    // (`{ statusCode, message, error: 'Bad Request' }`, where `error` is a
    // string) for translateWriteError's FK-violation message — read
    // `body.message` for the latter, not `body.error.message`.
    const body = (await res.json().catch(() => undefined)) as
      | { error?: { details?: { fieldErrors?: Record<string, string[]> } }; message?: string }
      | undefined;
    if (body?.error?.details?.fieldErrors) {
      return { errors: body.error.details.fieldErrors };
    }
    return { formError: body?.message ?? "This Purchase references a Vendor, Material Size, or Site that does not exist." };
  }

  if (!res.ok) {
    return { formError: "Something went wrong recording the Purchase. Please try again." };
  }

  redirect(
    `/movements?flash=${encodeURIComponent(formData.get("correctsId") ? "Purchase correction recorded" : "Purchase recorded")}`,
  );
}
