"use client";

import { type ReactNode, useId, useMemo } from "react";
import { Combobox } from "@base-ui-components/react/combobox";
import { cn } from "../lib/cn";
import { type FieldHintTone, hintToneClass } from "./field";
import { CheckIcon } from "../icons/check-icon";
import { ChevronsUpDownIcon } from "../icons/chevrons-up-down-icon";
import { XIcon } from "../icons/x-icon";

// The single searchable-select implementation (AD-5), for choosing an
// existing record (Material, Team Member, Vendor, ...) by typing part of
// its name — the user never sees or types a database id. Built on Base UI's
// Combobox so the WAI-ARIA combobox contract (keyboard navigation, focus
// handling, screen-reader announcements) is not hand-maintained here.
// Shares the label / hint / error layout and control styling of the other
// `field.tsx` primitives so it reads as the same form system.
const fieldControlClass =
  "w-full rounded-md border border-border-strong bg-surface-1 px-3 py-2 text-body text-ink-900 focus:border-accent-teal-700 focus:outline-none focus:ring-3 focus:ring-accent-teal-100";

const iconWrapperClass = "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-500";

export interface ComboboxFieldOption {
  /** Internal identifier submitted to the API — never rendered as text. */
  value: string;
  /** Primary human-readable text, e.g. "Cement" or "RCC Pipe — 300mm". */
  label: string;
  /** Secondary context shown under the label, e.g. a unit or vehicle number. */
  description?: string;
  /**
   * Live per-option data shown right-aligned in the list, e.g. the option's
   * current available stock ("1,200 bags"). Not searched by the filter —
   * typing matches names, not balances.
   */
  meta?: string;
  metaTone?: FieldHintTone;
}

export interface ComboboxFieldProps {
  label: string;
  options: ComboboxFieldOption[];
  /** Selected option's `value`, or null when nothing is selected. */
  value: string | null;
  onValueChange: (value: string | null) => void;
  placeholder?: string;
  hint?: string;
  hintTone?: FieldHintTone;
  error?: string;
  icon?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  /** True while the options list is still being fetched. */
  loading?: boolean;
  /** Shown when typing filters every option out. */
  emptyMessage?: string;
  id?: string;
  className?: string;
}

function matchesQuery(option: ComboboxFieldOption, query: string) {
  const haystack = `${option.label} ${option.description ?? ""}`.toLowerCase();
  return haystack.includes(query.trim().toLowerCase());
}

export function ComboboxField({
  label,
  options,
  value,
  onValueChange,
  placeholder = "Type to search…",
  hint,
  hintTone = "default",
  error,
  icon,
  required,
  disabled,
  loading,
  emptyMessage = "No matches found",
  id,
  className,
}: ComboboxFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;

  const selected = useMemo(() => options.find((option) => option.value === value) ?? null, [options, value]);

  return (
    <div className={cn("mb-4", className)}>
      <span className="mb-1 flex items-baseline gap-0.5">
        <label htmlFor={inputId} className="block text-caption font-semibold text-ink-700">
          {label}
        </label>
        {required ? (
          <span aria-hidden="true" className="text-caption font-semibold text-danger-700">
            *
          </span>
        ) : null}
      </span>
      <Combobox.Root<ComboboxFieldOption>
        items={options}
        // rc.0's `value` type omits null, but its own onValueChange hands
        // null back on clear and the runtime handles it — cast, don't fork
        // into an uncontrolled mode by passing undefined.
        value={selected as ComboboxFieldOption}
        onValueChange={(option) => onValueChange(option?.value ?? null)}
        isItemEqualToValue={(a, b) => a.value === b.value}
        filter={matchesQuery}
        disabled={disabled || loading}
      >
        <div className="relative">
          {icon ? <span className={iconWrapperClass}>{icon}</span> : null}
          <Combobox.Input
            id={inputId}
            required={required}
            placeholder={loading ? "Loading…" : placeholder}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : hint ? hintId : undefined}
            className={cn(fieldControlClass, icon && "pl-9", selected ? "pr-20" : "pr-11", error && "border-danger-700")}
          />
          {/* size-8 (32px) tap targets — the clear/open affordances are used
              on phones with gloves on; a 24px hit area misses too easily. */}
          <div className="absolute top-1/2 right-1 flex -translate-y-1/2 items-center text-ink-500">
            {selected ? (
              <Combobox.Clear
                aria-label={`Clear ${label}`}
                className="flex size-8 items-center justify-center rounded-sm hover:bg-surface-2 hover:text-ink-900 focus-visible:ring-2 focus-visible:ring-accent-teal-100 focus-visible:outline-none"
              >
                <XIcon className="size-4" />
              </Combobox.Clear>
            ) : null}
            <Combobox.Trigger
              aria-label={`Open ${label} options`}
              className="flex size-8 items-center justify-center rounded-sm hover:bg-surface-2 hover:text-ink-900 focus-visible:ring-2 focus-visible:ring-accent-teal-100 focus-visible:outline-none"
            >
              <ChevronsUpDownIcon className="size-4" />
            </Combobox.Trigger>
          </div>
        </div>

        <Combobox.Portal>
          <Combobox.Positioner sideOffset={4} className="z-50">
            <Combobox.Popup className="max-h-72 w-(--anchor-width) overflow-y-auto rounded-md border border-border-hairline bg-surface-1 py-1 shadow-3">
              {loading ? (
                <Combobox.Status className="px-3 py-2 text-body-sm text-ink-500">Loading…</Combobox.Status>
              ) : (
                <Combobox.Empty className="px-3 py-2 text-body-sm text-ink-500">{emptyMessage}</Combobox.Empty>
              )}
              <Combobox.List>
                {(option: ComboboxFieldOption) => (
                  <Combobox.Item
                    key={option.value}
                    value={option}
                    className="flex cursor-default items-start justify-between gap-2 px-3 py-2 select-none data-highlighted:bg-surface-2"
                  >
                    <span className="flex min-w-0 flex-col">
                      <span className="text-body-sm text-ink-900">{option.label}</span>
                      {option.description ? <span className="text-eyebrow text-ink-500">{option.description}</span> : null}
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      {option.meta ? (
                        <span className={cn("text-eyebrow", hintToneClass[option.metaTone ?? "default"])}>{option.meta}</span>
                      ) : null}
                      <Combobox.ItemIndicator className="mt-0.5 text-accent-teal-700">
                        <CheckIcon className="size-4" />
                      </Combobox.ItemIndicator>
                    </span>
                  </Combobox.Item>
                )}
              </Combobox.List>
            </Combobox.Popup>
          </Combobox.Positioner>
        </Combobox.Portal>
      </Combobox.Root>

      {hint && !error ? (
        <p
          id={hintId}
          role={hintTone === "danger" ? "status" : undefined}
          className={cn("mt-1 text-eyebrow", hintToneClass[hintTone])}
        >
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
}
