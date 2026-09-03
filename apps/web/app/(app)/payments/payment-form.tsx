"use client";

import { useActionState, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { ConfirmDialog, ConfirmDialogRow, formValue, useSubmitConfirmation, AmountField, Button, CalendarIcon, Card, CheckCircleIcon, ComboboxField, HelpBubble, PencilIcon, RotateCcwIcon, SelectField, TextField, UserIcon, WalletIcon } from "@azentisfieldos/ui";
import { HELP_CONTENT } from "@azentisfieldos/shared";
import { useClientValidation } from "@/lib/use-client-validation";
import { usePreventFormResetOnError } from "@/lib/use-prevent-form-reset-on-error";
import { TeamMemberQuickCreateModal } from "@/app/(app)/team/_components/team-member-quick-create-modal";
import { createPaymentAction, type CreatePaymentFormState } from "./actions";
import { parseCreatePaymentForm } from "./parse";

// The same explanation Help & Guides and the Client Presentation show for
// this concept — one shared content source, read here inline.
const NET_PAYABLE_HELP = HELP_CONTENT.contextualHelp.find((h) => h.key === "net-payable");

interface TeamMemberOption {
  id: string;
  name: string;
  outstandingAdvanceBalance: string;
}

interface AdvanceOption {
  id: string;
  teamMemberId: string;
  label: string;
}

export interface PaymentFormInitialValues {
  basePay?: string;
  additionalAmount?: string;
  deductions?: string;
  payPeriod?: string;
  advanceAdjustment?: { advanceId: string; amount: string; note?: string };
}

function SubmitButton({ label, correcting }: { label: string; correcting: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending}>
      {correcting ? <RotateCcwIcon className="size-4" /> : <CheckCircleIcon className="size-4" />}
      {label}
    </Button>
  );
}

const initialState: CreatePaymentFormState = {};

function formatMoney(amount: number) {
  const sign = amount < 0 ? "−" : "";
  return `${sign}₹${Math.abs(amount).toLocaleString("en-IN")}`;
}

// AC #1: a complete new Payment row with the full, correct set of inputs
// re-entered — not a signed delta like Purchase/Advance/AdvanceAdjustment
// (Story 7.3's Dev Notes). Every field below stays editable in correct
// mode except the Team Member.
export function PaymentForm({
  mode,
  teamMembers: initialTeamMembers,
  advances,
  teamMemberId: fixedTeamMemberId,
  correctsId,
  initial,
}: {
  mode: "new" | "correct";
  teamMembers: TeamMemberOption[];
  advances: AdvanceOption[];
  teamMemberId?: string;
  correctsId?: string;
  initial?: PaymentFormInitialValues;
}) {
  const [state, formAction] = useActionState(createPaymentAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  usePreventFormResetOnError(formRef, !!(state.errors || state.formError));
  // Hard-to-take-back submission (FR-54 / money movement) — held for
  // re-verification of the entered details before it goes to the ledger.
  const confirmation = useSubmitConfirmation();
  // Inline pre-submit validation via the same parse the Server Action runs
  // (AD-7) — the confirmation dialog only opens once the input parses.
  const validation = useClientValidation(parseCreatePaymentForm);
  const errorFor = (field: string) => validation.errors[field]?.[0] ?? state.errors?.[field]?.[0];

  const [teamMembers, setTeamMembers] = useState(initialTeamMembers);
  const [teamMemberId, setTeamMemberId] = useState(fixedTeamMemberId ?? "");
  const [teamMemberQuickCreateOpen, setTeamMemberQuickCreateOpen] = useState(false);
  const [basePay, setBasePay] = useState(initial?.basePay ?? "");
  const [additionalAmount, setAdditionalAmount] = useState(initial?.additionalAmount ?? "0");
  const [deductions, setDeductions] = useState(initial?.deductions ?? "0");
  const [includeAdjustment, setIncludeAdjustment] = useState(Boolean(initial?.advanceAdjustment));
  const [advanceId, setAdvanceId] = useState(initial?.advanceAdjustment?.advanceId ?? "");
  const [adjustmentAmount, setAdjustmentAmount] = useState(initial?.advanceAdjustment?.amount ?? "");

  const selectedTeamMember = teamMembers.find((t) => t.id === teamMemberId);
  const teamMemberAdvances = advances.filter((a) => a.teamMemberId === teamMemberId);

  // AC #1's "computes automatically": a live preview only — the persisted
  // value always comes from PaymentsService's own server-side computation,
  // never trusted from this client math.
  const netPayable =
    (Number(basePay) || 0) +
    (Number(additionalAmount) || 0) -
    (Number(deductions) || 0) -
    (includeAdjustment ? Number(adjustmentAmount) || 0 : 0);

  return (
    <form ref={formRef} action={formAction} onSubmit={validation.guard(confirmation.guard())} noValidate>
      <input type="hidden" name="includeAdjustment" value={includeAdjustment ? "true" : "false"} />

      {mode === "correct" ? (
        <Card className="mb-4 border-warning-700 bg-warning-100">
          <h2 className="mb-1 flex items-center gap-2 text-card-title text-warning-700">
            <RotateCcwIcon className="size-4" />
            Filing a correction
          </h2>
          <p className="mb-3 text-body-sm text-warning-700">
            This creates a new, linked Payment — the original is never edited or deleted (AD-9). Re-enter the full,
            correct set of values below, not a delta.
          </p>
          <input type="hidden" name="correctsId" value={correctsId} />
          <TextField label="Reason for this correction" name="reason" required icon={<PencilIcon className="size-4" />} error={errorFor("reason")} />
        </Card>
      ) : null}

      <Card className="mb-4">
        <ComboboxField
          label="Team Member"
          required
          icon={<UserIcon className="size-4" />}
          disabled={mode === "correct" || Boolean(fixedTeamMemberId)}
          options={teamMembers.map((t) => ({ value: t.id, label: t.name }))}
          value={teamMemberId || null}
          onValueChange={(value) => setTeamMemberId(value ?? "")}
          placeholder="Type a name…"
          emptyMessage="No matching Team Member"
          error={errorFor("teamMemberId")}
          onCreateNew={
            mode === "correct" || Boolean(fixedTeamMemberId) ? undefined : () => setTeamMemberQuickCreateOpen(true)
          }
          createNewLabel="+ Add Team Member"
        />
        <input type="hidden" name="teamMemberId" value={teamMemberId} />

        <AmountField
          label="Base Pay"
          name="basePay"
          min={0}
          required
          value={basePay}
          onChange={(e) => setBasePay(e.target.value)}
          error={errorFor("basePay")}
        />
        <AmountField
          label="Additional Amount"
          name="additionalAmount"
          min={0}
          value={additionalAmount}
          onChange={(e) => setAdditionalAmount(e.target.value)}
          error={errorFor("additionalAmount")}
        />
        <AmountField
          label="Deductions"
          name="deductions"
          min={0}
          value={deductions}
          onChange={(e) => setDeductions(e.target.value)}
          error={errorFor("deductions")}
        />
        <TextField
          label="Period"
          name="payPeriod"
          icon={<CalendarIcon className="size-4" />}
          hint="Optional — e.g. 1-15 Aug 2026"
          defaultValue={initial?.payPeriod}
          error={errorFor("payPeriod")}
        />
      </Card>

      <Card className="mb-4">
        <label className="mb-3 flex items-center gap-2 text-body-sm text-ink-900">
          <input
            type="checkbox"
            checked={includeAdjustment}
            onChange={(e) => setIncludeAdjustment(e.target.checked)}
            className="size-4 accent-accent-teal-700"
          />
          Include an Advance Adjustment
        </label>

        {includeAdjustment ? (
          <>
            <SelectField
              label="Advance"
              name="advanceId"
              required
              icon={<WalletIcon className="size-4" />}
              value={advanceId}
              onChange={(e) => setAdvanceId(e.target.value)}
              disabled={!teamMemberId}
              options={[
                { value: "", label: teamMemberId ? "Select an Advance" : "Select a Team Member first" },
                ...teamMemberAdvances.map((a) => ({ value: a.id, label: a.label })),
              ]}
              error={errorFor("advanceId")}
            />
            <AmountField
              label="Adjustment Amount"
              name="adjustmentAmount"
              required
              value={adjustmentAmount}
              onChange={(e) => setAdjustmentAmount(e.target.value)}
              hint={
                selectedTeamMember
                  ? `Cannot exceed ${formatMoney(Number(selectedTeamMember.outstandingAdvanceBalance))} (current Outstanding Balance)`
                  : undefined
              }
              error={errorFor("adjustmentAmount")}
            />
            <TextField label="Adjustment Note" name="adjustmentNote" hint="Optional" icon={<PencilIcon className="size-4" />} error={errorFor("adjustmentNote")} />
          </>
        ) : null}
      </Card>

      <Card className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <span className="flex items-center gap-1 text-body-sm text-ink-500">
          Net Payable
          {NET_PAYABLE_HELP ? <HelpBubble>{NET_PAYABLE_HELP.explanation}</HelpBubble> : null}
        </span>
        <span className="text-card-title font-bold text-gold-700 tabular-nums">{formatMoney(netPayable)}</span>
      </Card>

      {state.formError ? (
        <p role="alert" className="mb-4 text-caption text-danger-700">
          {state.formError}
        </p>
      ) : null}

      <SubmitButton label={mode === "correct" ? "Submit Correction" : "Record Payment"} correcting={mode === "correct"} />

      <ConfirmDialog
        open={confirmation.open}
        onOpenChange={confirmation.onOpenChange}
        title={mode === "correct" ? "Submit this correction?" : "Record this Payment?"}
        description={mode === "correct" ? "A correction is a new, permanent ledger entry — please re-verify the details." : "A Payment is a permanent ledger entry — please re-verify the amounts."}
        confirmLabel={"Confirm & Submit"}
        onConfirm={confirmation.confirm}
      >
        <ConfirmDialogRow label="Base Pay" value={formValue(confirmation.values, "basePay")} />
        <ConfirmDialogRow label="Additional Amount" value={formValue(confirmation.values, "additionalAmount")} />
        <ConfirmDialogRow label="Deductions" value={formValue(confirmation.values, "deductions")} />
        <ConfirmDialogRow label="Adjustment amount" value={formValue(confirmation.values, "adjustmentAmount")} />
        {mode === "correct" ? <ConfirmDialogRow label="Reason" value={formValue(confirmation.values, "reason")} /> : null}
      </ConfirmDialog>

      <TeamMemberQuickCreateModal
        open={teamMemberQuickCreateOpen}
        onOpenChange={setTeamMemberQuickCreateOpen}
        onSuccess={(teamMember) => {
          setTeamMembers((prev) => [{ ...teamMember, outstandingAdvanceBalance: "0" }, ...prev]);
          setTeamMemberId(teamMember.id);
          setTeamMemberQuickCreateOpen(false);
        }}
      />
    </form>
  );
}
