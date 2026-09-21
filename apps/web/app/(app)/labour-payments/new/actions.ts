"use server";

import { authedFetch } from "@/lib/api";
import { redirect } from "next/navigation";
import { parseCreateDailyLabourerForm } from "./parse";

export interface CreateDailyLabourerFormState {
  errors?: Record<string, string[]>;
  formError?: string;
}

export async function createDailyLabourerAction(
  _prevState: CreateDailyLabourerFormState,
  formData: FormData,
): Promise<CreateDailyLabourerFormState> {
  const parsed = parseCreateDailyLabourerForm(formData);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const res = await authedFetch(`/daily-labourers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });

  if (res.status === 400) {
    const body = (await res.json()) as { error?: { details?: { fieldErrors?: Record<string, string[]> }; message?: string } };
    if (body.error?.details?.fieldErrors) {
      return { errors: body.error.details.fieldErrors };
    }
    return { formError: body.error?.message ?? "Something went wrong creating this Labourer." };
  }
  if (!res.ok) {
    return { formError: "Something went wrong creating this Labourer. Please try again." };
  }

  const created = (await res.json()) as { id: string };
  redirect(`/labour-payments/${created.id}?flash=${encodeURIComponent("Labourer added")}`);
}
