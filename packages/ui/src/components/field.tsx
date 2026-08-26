import { type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes, forwardRef, useId } from "react";
import { cn } from "../lib/cn";

// The single form-field implementation (AD-5) — extracted once a second
// screen (Sites create/edit) needed the same input styling story 1.5's
// Sign In form established locally. Label, input/select, and inline
// error/hint slots share one layout and one focus-ring/error treatment.
const fieldControlClass =
  "w-full rounded-md border border-border-strong bg-surface-1 px-3 py-2 text-body text-ink-900 focus:border-accent-teal-700 focus:outline-none focus:ring-3 focus:ring-accent-teal-100";

// Leading icon is optional and purely additive — every existing call site
// with no `icon` prop renders byte-for-byte the same as before. Icon
// speeds recognition of the field's *kind* at a glance (email, phone,
// currency, ...); it is never decorative filler (DESIGN.md Brand & Style).
const iconWrapperClass = "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-500";

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, hint, icon, id, className, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;

    return (
      <div className="mb-4">
        <label htmlFor={inputId} className="mb-1 block text-caption font-semibold text-ink-700">
          {label}
        </label>
        <div className="relative">
          {icon ? <span className={iconWrapperClass}>{icon}</span> : null}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : hint ? hintId : undefined}
            className={cn(fieldControlClass, icon && "pl-9", error && "border-danger-700", className)}
            {...props}
          />
        </div>
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

// Multiline sibling of TextField — same label / error / hint layout and the
// same focus-ring + error treatment, only the control is a <textarea>. Added
// (AD-5: extend the shared field primitive, never hand-roll a raw <textarea>
// per screen) once Story 14.1's Branding form needed a multiline registered
// address. No leading-icon slot: an icon reads oddly against a multi-row box.
export interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  ({ label, error, hint, id, className, rows = 3, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id ?? generatedId;
    const errorId = `${textareaId}-error`;
    const hintId = `${textareaId}-hint`;

    return (
      <div className="mb-4">
        <label htmlFor={textareaId} className="mb-1 block text-caption font-semibold text-ink-700">
          {label}
        </label>
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className={cn(fieldControlClass, "resize-y", error && "border-danger-700", className)}
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
TextareaField.displayName = "TextareaField";

export interface SelectFieldOption {
  value: string;
  label: string;
}

export interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectFieldOption[];
  error?: string;
  hint?: string;
  icon?: ReactNode;
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ label, options, error, hint, icon, id, className, children, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id ?? generatedId;
    const errorId = `${selectId}-error`;
    const hintId = `${selectId}-hint`;

    return (
      <div className="mb-4">
        <label htmlFor={selectId} className="mb-1 block text-caption font-semibold text-ink-700">
          {label}
        </label>
        <div className="relative">
          {icon ? <span className={iconWrapperClass}>{icon}</span> : null}
          <select
            ref={ref}
            id={selectId}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : hint ? hintId : undefined}
            className={cn(fieldControlClass, icon && "pl-9", error && "border-danger-700", className)}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
            {children as ReactNode}
          </select>
        </div>
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
SelectField.displayName = "SelectField";
