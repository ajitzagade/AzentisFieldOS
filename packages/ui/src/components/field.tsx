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

// Hints are usually neutral guidance, but some carry live data the user must
// act on (e.g. available Site Stock next to a Material picker). The tone
// keeps that one hint slot instead of growing ad-hoc status paragraphs per
// screen: "positive" = data confirms the entry is safe, "warning" = data is
// missing or zero, "danger" = the entered values conflict with the data.
export type FieldHintTone = "default" | "positive" | "warning" | "danger";

export const hintToneClass: Record<FieldHintTone, string> = {
  default: "text-ink-500",
  positive: "text-success-700",
  warning: "text-warning-700",
  danger: "text-danger-700",
};

function FieldHint({ id, hint, tone = "default" }: { id: string; hint: string; tone?: FieldHintTone }) {
  return (
    <p
      id={id}
      // A danger-toned hint is a live conflict (not a submit-blocking error) —
      // announce it politely so screen-reader users hear it as they type.
      role={tone === "danger" ? "status" : undefined}
      className={cn("mt-1 text-eyebrow", hintToneClass[tone])}
    >
      {hint}
    </p>
  );
}

// Required marker rendered as a sibling of the <label>, not inside it —
// the control's accessible name stays exactly `label` (the native
// `required` attribute already conveys required-ness to assistive tech),
// and the marker is purely a sighted-user affordance.
function FieldLabel({ htmlFor, label, required }: { htmlFor: string; label: string; required?: boolean }) {
  return (
    <span className="mb-1 flex items-baseline gap-0.5">
      <label htmlFor={htmlFor} className="block text-caption font-semibold text-ink-700">
        {label}
      </label>
      {required ? (
        <span aria-hidden="true" className="text-caption font-semibold text-danger-700">
          *
        </span>
      ) : null}
    </span>
  );
}

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  hintTone?: FieldHintTone;
  icon?: ReactNode;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, hint, hintTone, icon, id, className, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;

    return (
      <div className="mb-4">
        <FieldLabel htmlFor={inputId} label={label} required={props.required} />
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
        {hint && !error ? <FieldHint id={hintId} hint={hint} tone={hintTone} /> : null}
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
        <FieldLabel htmlFor={textareaId} label={label} required={props.required} />
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
  hintTone?: FieldHintTone;
  icon?: ReactNode;
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ label, options, error, hint, hintTone, icon, id, className, children, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id ?? generatedId;
    const errorId = `${selectId}-error`;
    const hintId = `${selectId}-hint`;

    return (
      <div className="mb-4">
        <FieldLabel htmlFor={selectId} label={label} required={props.required} />
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
        {hint && !error ? <FieldHint id={hintId} hint={hint} tone={hintTone} /> : null}
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
