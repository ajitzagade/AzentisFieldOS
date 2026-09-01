"use client";

import { type ChangeEvent, useState } from "react";
import { TextField } from "./field";
import { cn } from "../lib/cn";

// The single corrected-value entry (AD-5), approved by the 2026-09-01
// simplicity review (decision D4): on a correction form the user types the
// value that is actually right — never a signed delta they had to compute in
// their head. The component derives the signed adjustment, shows it back in
// plain words ("Was 100 bags → change of −20 bags will be recorded"), and
// submits ONLY the delta through a hidden input under `name`, so the server
// action, shared Zod schema, API contract, and append-only ledger (AD-9)
// are byte-for-byte untouched.
export interface CorrectedValueFieldProps {
  /** Field label, e.g. "Correct quantity (bags)" */
  label: string;
  /** FormData field the signed delta is submitted under (e.g. "quantity") */
  name: string;
  /** The value currently on the ledger being corrected */
  originalValue: number;
  /** Unit spoken in the readback line, e.g. "bags"; use "₹" for amounts */
  unit?: string;
  required?: boolean;
  error?: string;
}

function formatNumber(value: number) {
  return value.toLocaleString("en-IN", { maximumFractionDigits: 4 });
}

export function CorrectedValueField({ label, name, originalValue, unit, required, error }: CorrectedValueFieldProps) {
  const [entered, setEntered] = useState("");

  const parsed = entered.trim() === "" ? null : Number(entered);
  const valid = parsed !== null && Number.isFinite(parsed);
  // Round away float noise (0.1 + 0.2 style) — quantities and ₹ amounts in
  // this product never need more than 4 decimal places.
  const delta = valid ? Math.round((parsed - originalValue) * 10000) / 10000 : null;

  const isCurrency = unit === "₹";
  const speak = (value: number) => (isCurrency ? `₹${formatNumber(value)}` : `${formatNumber(value)}${unit ? ` ${unit}` : ""}`);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setEntered(event.target.value);
  }

  return (
    <div>
      <TextField
        label={label}
        type="number"
        step="any"
        inputMode="decimal"
        required={required}
        value={entered}
        onChange={handleChange}
        icon={isCurrency ? <span className="text-body-sm font-semibold">₹</span> : undefined}
        error={error}
        hint={delta === null ? `Currently recorded: ${speak(originalValue)}` : undefined}
      />
      {/* The server only ever sees the signed delta — same contract as before. */}
      <input type="hidden" name={name} value={delta === null ? "" : String(delta)} />
      {delta !== null ? (
        <p
          role="status"
          className={cn(
            "-mt-2 mb-4 rounded-md px-3 py-2 text-caption font-semibold tabular-nums",
            delta === 0 ? "bg-warning-100 text-warning-700" : "bg-accent-teal-100 text-accent-teal-700",
          )}
        >
          {delta === 0
            ? `Same as the recorded ${speak(originalValue)} — nothing to correct yet.`
            : `Was ${speak(originalValue)} → change of ${delta > 0 ? "+" : "−"}${speak(Math.abs(delta))} will be recorded.`}
        </p>
      ) : null}
    </div>
  );
}
