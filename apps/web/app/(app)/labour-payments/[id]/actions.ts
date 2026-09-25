"use server";

import { authedFetch } from "@/lib/api";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { parseCreateAttendanceForm, parseCreateWeeklyPaymentForm } from "./parse";

export interface LabourPaymentFormState {
  errors?: Record<string, string[]>;
  formError?: string;
  success?: boolean;
}

async function postJson(path: string, body: unknown): Promise<LabourPaymentFormState> {
  const res = await authedFetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (res.status === 400) {
    const responseBody = (await res.json()) as {
      error?: { details?: { fieldErrors?: Record<string, string[]> }; message?: string };
      message?: string;
    };
    if (responseBody.error?.details?.fieldErrors) {
      return { errors: responseBody.error.details.fieldErrors };
    }
    return {
      formError:
        responseBody.error?.message ?? responseBody.message ?? "Something went wrong. Please try again.",
    };
  }
  if (!res.ok) {
    return { formError: "Something went wrong. Please try again." };
  }
  return { success: true };
}

// Both attendance entry and weekly settlement are modals the Labourer
// detail page reopens repeatedly without navigating away — success is
// reported inline (never a redirect/?flash=), so the caller revalidates
// this one path itself on every successful submit.
export async function createAttendanceAction(
  _prevState: LabourPaymentFormState,
  formData: FormData,
): Promise<LabourPaymentFormState> {
  const parsed = parseCreateAttendanceForm(formData);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }
  const result = await postJson(`/daily-labour-attendance`, parsed.data);
  if (result.success) {
    revalidatePath(`/labour-payments/${parsed.data.labourerId}`);
  }
  return result;
}

export async function createWeeklyPaymentAction(
  _prevState: LabourPaymentFormState,
  formData: FormData,
): Promise<LabourPaymentFormState> {
  const parsed = parseCreateWeeklyPaymentForm(formData);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }
  const result = await postJson(`/daily-labour-weekly-payments`, parsed.data);
  if (result.success) {
    revalidatePath(`/labour-payments/${parsed.data.labourerId}`);
  }
  return result;
}

// "Delete Labourer" (deactivate) / Reactivate — never a real DELETE:
// attendance/advance/weekly-payment history all keep their labourerId FK
// either way, so this only flips isActive. Stays on this same detail page
// (unlike deleteSubcontractorAction, which navigates away) since the page
// remains a valid "future reference" view of a deactivated Labourer's
// history — the Delete/Reactivate button and "Deactivated" badge just
// reflect the new state on the next render.
export async function setDailyLabourerActiveAction(labourerId: string, isActive: boolean): Promise<void> {
  let res: Response | null = null;
  try {
    res = await authedFetch(`/daily-labourers/${labourerId}/active`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive }),
    });
  } catch {
    res = null;
  }

  const verb = isActive ? "reactivate" : "deactivate";
  if (!res) {
    redirect(
      `/labour-payments/${labourerId}?flash=${encodeURIComponent(`Couldn't ${verb} this Labourer — please try again.`)}`,
    );
  } else if (res.status === 404) {
    redirect(`/labour-payments?flash=${encodeURIComponent("This Labourer no longer exists.")}`);
  } else if (!res.ok) {
    const message =
      res.status === 403 ? `Only an Owner/Admin can ${verb} a Labourer.` : `Couldn't ${verb} this Labourer — please try again.`;
    redirect(`/labour-payments/${labourerId}?flash=${encodeURIComponent(message)}`);
  } else {
    revalidatePath("/labour-payments");
    revalidatePath(`/labour-payments/${labourerId}`);
    redirect(
      `/labour-payments/${labourerId}?flash=${encodeURIComponent(
        isActive ? "Labourer reactivated." : "Labourer deleted. Their records remain in the database.",
      )}`,
    );
  }
}
