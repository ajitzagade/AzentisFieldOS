"use client";

import { useId, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { cn } from "../lib/cn";

const MAX_TAG_LENGTH = 100;

// A small, self-contained tag input (AD-5). Originally built local to the
// Vendor route for `materialsSupplied`; promoted here once Subcontractor's
// `workCategories` became a second consumer of the identical pattern — the
// exact threshold Story 9.1's own dev notes named for generalizing it.
export interface TagsFieldProps {
  /** Field label, e.g. "Materials / services supplied" */
  label: string;
  name: string;
  defaultValue?: string[];
  error?: string;
}

export function TagsField({ label, name, defaultValue = [], error }: TagsFieldProps) {
  const inputId = useId();
  const errorId = useId();
  const [tags, setTags] = useState<string[]>(defaultValue);
  const [draft, setDraft] = useState("");
  const [duplicateNotice, setDuplicateNotice] = useState<string | null>(null);

  function addTag(value: string): boolean {
    const trimmed = value.trim().slice(0, MAX_TAG_LENGTH);
    if (!trimmed) return false;
    if (tags.some((tag) => tag.toLowerCase() === trimmed.toLowerCase())) {
      setDuplicateNotice(`"${trimmed}" is already added`);
      return false;
    }
    setTags((prev) => [...prev, trimmed]);
    return true;
  }

  function commitDraft() {
    if (draft.trim()) addTag(draft);
    setDraft("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (duplicateNotice) setDuplicateNotice(null);
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      commitDraft();
    } else if (event.key === "Backspace" && draft === "" && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1));
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    const pasted = event.clipboardData.getData("text");
    if (!pasted.includes(",")) return;
    event.preventDefault();
    for (const part of pasted.split(",")) addTag(part);
    setDraft("");
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag));
  }

  const describedBy = [error ? errorId : null, duplicateNotice ? `${errorId}-duplicate` : null]
    .filter(Boolean)
    .join(" ") || undefined;

  return (
    <div className="mb-4">
      <label htmlFor={inputId} className="mb-1 block text-caption font-semibold text-ink-700">
        {label}
      </label>
      <div
        className={cn(
          "flex flex-wrap items-center gap-1.5 rounded-md border border-border-strong bg-surface-1 px-3 py-2 focus-within:border-accent-teal-700 focus-within:outline-none focus-within:ring-3 focus-within:ring-accent-teal-100",
          error && "border-danger-700",
        )}
      >
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-surface-3 px-2 py-0.5 text-eyebrow font-semibold text-ink-700"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              aria-label={`Remove ${tag}`}
              className="text-ink-500 hover:text-ink-900"
            >
              ×
            </button>
            <input type="hidden" name={name} value={tag} />
          </span>
        ))}
        <input
          id={inputId}
          type="text"
          value={draft}
          maxLength={MAX_TAG_LENGTH}
          onChange={(event) => {
            setDraft(event.target.value);
            if (duplicateNotice) setDuplicateNotice(null);
          }}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onBlur={commitDraft}
          placeholder={tags.length === 0 ? "Type and press Enter" : ""}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className="min-w-32 flex-1 border-none bg-transparent text-body text-ink-900 outline-none"
        />
      </div>
      {duplicateNotice ? (
        <p id={`${errorId}-duplicate`} className="mt-1 text-eyebrow text-ink-500">
          {duplicateNotice}
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
