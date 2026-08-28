"use client";

import { type ChangeEvent, forwardRef, useState } from "react";
import { TextField, type TextFieldProps } from "./field";
import { amountInWords } from "../lib/amount-in-words";

// The single ₹-amount input (AD-5): a TextField preconfigured as a numeric
// rupee field that reads the entered amount back in words underneath —
// the cheque-book habit that catches an extra zero before it's submitted.
// Works controlled or uncontrolled (server-action forms pass defaultValue
// and rely on FormData), tracking its own copy of the value only to drive
// the words line.
export type AmountFieldProps = Omit<TextFieldProps, "type" | "icon">;

export const AmountField = forwardRef<HTMLInputElement, AmountFieldProps>(
  ({ hint, onChange, value, defaultValue, ...props }, ref) => {
    const [internalValue, setInternalValue] = useState(defaultValue != null ? String(defaultValue) : "");
    const currentValue = value != null ? String(value) : internalValue;
    const words = currentValue.trim() === "" ? "" : amountInWords(currentValue);

    function handleChange(event: ChangeEvent<HTMLInputElement>) {
      setInternalValue(event.target.value);
      onChange?.(event);
    }

    return (
      <TextField
        ref={ref}
        type="number"
        step="any"
        inputMode="decimal"
        icon={<span className="text-body-sm font-semibold">₹</span>}
        hint={words || hint}
        onChange={handleChange}
        value={value}
        defaultValue={defaultValue}
        {...props}
      />
    );
  },
);
AmountField.displayName = "AmountField";
