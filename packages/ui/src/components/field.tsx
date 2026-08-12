import { type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, forwardRef, useId } from "react";
import { cn } from "../lib/cn";

// The single form-field implementation (AD-5) — extracted once a second
// screen (Sites create/edit) needed the same input styling story 1.5's
// Sign In form established locally. Label, input/select, and inline
// error/hint slots share one layout and one focus-ring/error treatment.
const fieldControlClass =
  "w-full rounded-md border border-border-strong bg-surface-1 px-3 py-2 text-body text-ink-900 focus:border-accent-teal-700 focus:outline-none focus:ring-3 focus:ring-accent-teal-100";

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, hint, id, className, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;

    return (
      <div className="mb-4">
        <label htmlFor={inputId} className="mb-1 block text-caption font-semibold text-ink-700">
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className={cn(fieldControlClass, error && "border-danger-700", className)}
          {...props}
        />
        {hint && !error ? (
          <p id={hintId} className="mt-1 text-eyebrow text-ink-500">
            {hint}
          </p>
        ) : null}
        {error ? (
          <p id={errorId} role="alert" className="mt-1 text-eyebrow text-danger-700">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);
TextField.displayName = "TextField";

export interface SelectFieldOption {
  value: string;
  label: string;
}

export interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectFieldOption[];
  error?: string;
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ label, options, error, id, className, children, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id ?? generatedId;
    const errorId = `${selectId}-error`;

    return (
      <div className="mb-4">
        <label htmlFor={selectId} className="mb-1 block text-caption font-semibold text-ink-700">
          {label}
        </label>
        <select
          ref={ref}
          id={selectId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(fieldControlClass, error && "border-danger-700", className)}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
          {children as ReactNode}
        </select>
        {error ? (
          <p id={errorId} role="alert" className="mt-1 text-eyebrow text-danger-700">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);
SelectField.displayName = "SelectField";
