"use server";

import { authedFetch } from "@/lib/api";
import { revalidatePath } from "next/cache";
import { createReportScheduleSchema } from "@azentisfieldos/shared";

export interface CreateReportScheduleFormState {
  errors?: Record<string, string[]>;
  formError?: string;
  ok?: boolean;
}

export async function createReportScheduleAction(
  _prevState: CreateReportScheduleFormState,
  formData: FormData,
): Promise<CreateReportScheduleFormState> {
  const siteId = formData.get("siteId");
  const parsed = createReportScheduleSchema.safeParse({
    reportType: formData.get("reportType"),
    frequency: formData.get("frequency"),
    // A multi-checkbox recipient picker submits repeated fields.
    recipientUserIds: formData.getAll("recipientUserIds").map(String),
    // An empty Site select means "all Sites" — omit rather than send "".
    siteId: siteId ? String(siteId) : undefined,
    enabled: true,
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const res = await authedFetch(`/report-schedules`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });

  if (res.status === 400) {
    const body = (await res.json().catch(() => undefined)) as
      | { error?: { details?: { fieldErrors?: Record<string, string[]> } } }
      | undefined;
    return { errors: body?.error?.details?.fieldErrors ?? {} };
  }

  if (!res.ok) {
    return { formError: "Could not create that schedule. Please try again." };
  }

  revalidatePath("/reports/schedules");
  return { ok: true };
}

export interface ToggleReportScheduleFormState {
  formError?: string;
}

export async function toggleReportScheduleAction(
  id: string,
  nextEnabled: boolean,
): Promise<ToggleReportScheduleFormState> {
  const res = await authedFetch(`/report-schedules/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ enabled: nextEnabled }),
  });

  if (!res.ok) {
    return {
      formError: nextEnabled
        ? "Could not resume this schedule. Please try again."
        : "Could not pause this schedule. Please try again.",
    };
  }

  revalidatePath("/reports/schedules");
  return {};
}
