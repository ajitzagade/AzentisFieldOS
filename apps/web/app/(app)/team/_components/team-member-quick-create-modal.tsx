"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ClipboardIcon,
  DetailsDisclosure,
  LayersIcon,
  PhoneIcon,
  PlusIcon,
  QuickCreateModal,
  SelectField,
  TextField,
  UserIcon,
  type QuickCreateResult,
} from "@azentisfieldos/ui";
import { useAuthedFetch } from "@/lib/use-authed-fetch";
import { useClientValidation } from "@/lib/use-client-validation";
import { createTeamMemberQuickAction } from "../new/actions";
import { parseCreateTeamMemberForm } from "../new/parse";

interface EmploymentTypeOption {
  id: string;
  name: string;
  isActive: boolean;
}

export interface TeamMemberQuickCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Fires once the Team Member is created — the caller prepends
   * { id, name } into its picker's local options and selects it. */
  onSuccess: (teamMember: QuickCreateResult) => void;
}

// Thin wrapper over the generic QuickCreateModal shell (AD-5) — the inline
// "+ Add Team Member" affordance every Team Member picker gets. Employment
// Type is still required and picked from a plain (non-creatable) list — no
// "+ Add Employment Type" affordance here (deferred, see deferred-work.md).
// Name is required by default; designation/contact fold behind
// DetailsDisclosure (D5).
export function TeamMemberQuickCreateModal({ open, onOpenChange, onSuccess }: TeamMemberQuickCreateModalProps) {
  // useActionState's internal state would otherwise outlive a close/reopen
  // cycle (Base UI's Dialog keeps this subtree mounted while closing) — bump
  // a remount key the moment `open` flips true, adjusted during render
  // (React's documented "adjusting state when a prop changes" pattern) like
  // the DSR form's photoResetKey — no ref (refs can't be read/written during
  // render) and no extra visible render from an effect.
  const [formKey, setFormKey] = useState(0);
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setFormKey((key) => key + 1);
  }

  const validation = useClientValidation(parseCreateTeamMemberForm);
  const authedFetch = useAuthedFetch();
  const [employmentTypesState, setEmploymentTypesState] = useState<{
    status: "loading" | "loaded" | "failed";
    types: EmploymentTypeOption[];
  }>({ status: "loading", types: [] });

  const loadEmploymentTypes = useCallback(
    async (signal: AbortSignal) => {
      setEmploymentTypesState((prev) => ({ ...prev, status: "loading" }));
      try {
        const res = await authedFetch("/employment-types", { signal });
        if (!res.ok) throw new Error(`Failed to load Employment Types (${res.status})`);
        const data: unknown = await res.json();
        if (!Array.isArray(data)) throw new Error("Malformed Employment Types response");
        if (!signal.aborted) setEmploymentTypesState({ status: "loaded", types: data as EmploymentTypeOption[] });
      } catch {
        if (!signal.aborted) setEmploymentTypesState({ status: "failed", types: [] });
      }
    },
    [authedFetch],
  );

  // Fetches only while the modal is open, aborts on close (matches
  // AdvanceQuickEntryTrigger's Team Member fetch precedent).
  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- see note above
    loadEmploymentTypes(controller.signal);
    return () => controller.abort();
  }, [open, loadEmploymentTypes]);

  const activeEmploymentTypes = employmentTypesState.types.filter((t) => t.isActive);

  return (
    <QuickCreateModal
      key={formKey}
      open={open}
      onOpenChange={onOpenChange}
      title="Add Team Member"
      description="Creates the same Team Member record as the full form — available in every Team Member picker immediately."
      action={createTeamMemberQuickAction}
      onSubmit={validation.guard()}
      validationErrors={validation.errors}
      onSuccess={onSuccess}
      submitLabel="Create Team Member"
      submitIcon={<PlusIcon className="size-4" />}
    >
      {(errorFor) => (
        <>
          <TextField
            label="Name"
            name="name"
            required
            maxLength={200}
            icon={<UserIcon className="size-4" />}
            error={errorFor("name")}
          />
          <DetailsDisclosure summary="More details — role, contact">
            <TextField
              label="Role / Designation"
              name="designation"
              hint="Optional"
              maxLength={200}
              icon={<ClipboardIcon className="size-4" />}
              placeholder="e.g. Site Supervisor, Mason, Helper"
              error={errorFor("designation")}
            />
            <TextField
              label="Contact"
              name="contact"
              type="tel"
              hint="Optional"
              maxLength={100}
              icon={<PhoneIcon className="size-4" />}
              error={errorFor("contact")}
            />
          </DetailsDisclosure>

          {employmentTypesState.status === "loaded" && activeEmploymentTypes.length === 0 ? (
            <p className="mb-4 text-body-sm text-ink-500">
              No Employment Types yet —{" "}
              <Link href="/team/employment-types" className="font-semibold text-accent-teal-700 underline">
                create one first
              </Link>
              .
            </p>
          ) : (
            <SelectField
              label="Employment Type"
              name="employmentTypeId"
              required
              icon={<LayersIcon className="size-4" />}
              defaultValue=""
              disabled={employmentTypesState.status !== "loaded"}
              options={[
                {
                  value: "",
                  label:
                    employmentTypesState.status === "loading"
                      ? "Loading…"
                      : employmentTypesState.status === "failed"
                        ? "Couldn't load Employment Types"
                        : "Select an Employment Type",
                },
                ...activeEmploymentTypes.map((e) => ({ value: e.id, label: e.name })),
              ]}
              error={
                employmentTypesState.status === "failed" ? "Couldn't load Employment Types — try again" : errorFor("employmentTypeId")
              }
            />
          )}
        </>
      )}
    </QuickCreateModal>
  );
}
