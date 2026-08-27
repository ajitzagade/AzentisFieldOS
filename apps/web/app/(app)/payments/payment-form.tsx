"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Button, CalendarIcon, Card, CheckCircleIcon, PencilIcon, RotateCcwIcon, SelectField, TextField, UserIcon, WalletIcon } from "@azentisfieldos/ui";
import { createPaymentAction, type CreatePaymentFormState } from "./actions";

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
  teamMembers,
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

  const [teamMemberId, setTeamMemberId] = useState(fixedTeamMemberId ?? "");
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
    <form action={formAction} noValidate>
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
          <TextField label="Reason for this correction" name="reason" required icon={<PencilIcon className="size-4" />} error={state.errors?.reason?.[0]} />
        </Card>
      ) : null}

      <Card className="mb-4">
        <SelectField
          label="Team Member"
          name="teamMemberId"
          required
          icon={<UserIcon className="size-4" />}
          disabled={mode === "correct"}
          value={teamMemberId}
          onChange={(e) => setTeamMemberId(e.target.value)}
          options={[{ value: "", label: "Select a Team Member" }, ...teamMembers.map((t) => ({ value: t.id, label: t.name }))]}
          error={state.errors?.teamMemberId?.[0]}
        />
        {mode === "correct" ? <input type="hidden" name="teamMemberId" value={teamMemberId} /> : null}

        <TextField
          label="Base Pay"
          name="basePay"
          type="number"
          step="any"
          min={0}
          required
          icon={<span className="text-body-sm font-semibold">₹</span>}
          value={basePay}
          onChange={(e) => setBasePay(e.target.value)}
          error={state.errors?.basePay?.[0]}
        />
        <TextField
          label="Additional Amount"
          name="additionalAmount"
          type="number"
          step="any"
          min={0}
          icon={<span className="text-body-sm font-semibold">₹</span>}
          value={additionalAmount}
          onChange={(e) => setAdditionalAmount(e.target.value)}
          error={state.errors?.additionalAmount?.[0]}
        />
        <TextField
          label="Deductions"
          name="deductions"
          type="number"
          step="any"
          min={0}
          icon={<span className="text-body-sm font-semibold">₹</span>}
          value={deductions}
          onChange={(e) => setDeductions(e.target.value)}
          error={state.errors?.deductions?.[0]}
        />
        <TextField
          label="Period"
          name="payPeriod"
          icon={<CalendarIcon className="size-4" />}
          hint="Optional — e.g. 1-15 Aug 2026"
          defaultValue={initial?.payPeriod}
          error={state.errors?.payPeriod?.[0]}
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
              error={state.errors?.advanceId?.[0]}
            />
            <TextField
              label="Adjustment Amount"
              name="adjustmentAmount"
              type="number"
              step="any"
              required
              icon={<span className="text-body-sm font-semibold">₹</span>}
              value={adjustmentAmount}
              onChange={(e) => setAdjustmentAmount(e.target.value)}
              hint={
                selectedTeamMember
                  ? `Cannot exceed ${formatMoney(Number(selectedTeamMember.outstandingAdvanceBalance))} (current Outstanding Balance)`
                  : undefined
              }
              error={state.errors?.adjustmentAmount?.[0]}
            />
            <TextField label="Adjustment Note" name="adjustmentNote" hint="Optional" icon={<PencilIcon className="size-4" />} error={state.errors?.adjustmentNote?.[0]} />
          </>
        ) : null}
      </Card>

      <Card className="mb-4 flex items-center justify-between">
        <span className="text-body-sm text-ink-500">Net Payable</span>
        <span className="text-card-title font-bold text-gold-700 tabular-nums">{formatMoney(netPayable)}</span>
      </Card>

      {state.formError ? (
        <p role="alert" className="mb-4 text-caption text-danger-700">
          {state.formError}
        </p>
      ) : null}

      <SubmitButton label={mode === "correct" ? "Submit Correction" : "Record Payment"} correcting={mode === "correct"} />
    </form>
  );
}
