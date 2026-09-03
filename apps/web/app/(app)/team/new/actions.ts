"use server";

import { authedFetch } from "@/lib/api";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { parseCreateTeamMemberForm } from "./parse";

export interface CreateTeamMemberFormState {
  errors?: Record<string, string[]>;
  formError?: string;
  /** Set only by createTeamMemberQuickAction's non-redirecting success path
   * — createTeamMemberAction never sets this since it redirects on success
   * instead (mirrors createAdvanceAction/createAdvanceQuickAction). */
  success?: boolean;
  id?: string;
  name?: string;
}

type SubmitTeamMemberResult =
  | { ok: true; id: string; name: string }
  | { ok: false; state: CreateTeamMemberFormState };

// The shared parse+POST+error-mapping path — both createTeamMemberAction
// (full-page /team/new, redirects) and createTeamMemberQuickAction (inline
// "+ Add Team Member" quick-create modal, returns success inline) call this
// so there is exactly one write path to POST /team-members.
async function submitTeamMember(formData: FormData): Promise<SubmitTeamMemberResult> {
  const parsed = parseCreateTeamMemberForm(formData);

  if (!parsed.success) {
    return { ok: false, state: { errors: parsed.error.flatten().fieldErrors } };
  }

  const res = await authedFetch(`/team-members`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });

  if (res.status === 400) {
    const body = (await res.json()) as { error?: { details?: { fieldErrors?: Record<string, string[]> }; message?: string } };
    if (body.error?.details?.fieldErrors) {
      return { ok: false, state: { errors: body.error.details.fieldErrors } };
    }
    return {
      ok: false,
      state: { formError: body.error?.message ?? "This Team Member references an Employment Type that does not exist." },
    };
  }

  if (!res.ok) {
    return { ok: false, state: { formError: "Something went wrong creating the Team Member. Please try again." } };
  }

  const created = (await res.json()) as { id: string; name: string };
  return { ok: true, id: created.id, name: created.name };
}

export async function createTeamMemberAction(
  _prevState: CreateTeamMemberFormState,
  formData: FormData,
): Promise<CreateTeamMemberFormState> {
  const result = await submitTeamMember(formData);
  if (!result.ok) return result.state;

  redirect(`/team?flash=${encodeURIComponent("Team Member added")}`);
}

// Every entry-form route with a Team Member picker (inline quick-create
// spec) — the admin list plus every combobox that lists Team Members by
// name.
function revalidateTeamMemberPaths() {
  revalidatePath("/team");
  revalidatePath("/payments/new");
  revalidatePath("/daily-activity");
  revalidatePath("/dsr/new");
  revalidatePath("/daily-activity/work-records/new");
}

// The inline "+ Add Team Member" quick-create modal never navigates away, so
// it can't confirm success via the ?flash= pattern (that only exists
// because a redirect unmounts the form). Same write path as
// createTeamMemberAction; the caller prepends { id, name } into the
// picker's local options and selects it once this resolves { success: true }.
export async function createTeamMemberQuickAction(
  _prevState: CreateTeamMemberFormState,
  formData: FormData,
): Promise<CreateTeamMemberFormState> {
  const result = await submitTeamMember(formData);
  if (!result.ok) return result.state;

  revalidateTeamMemberPaths();
  return { success: true, id: result.id, name: result.name };
}
