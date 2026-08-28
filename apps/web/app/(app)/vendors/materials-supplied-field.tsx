"use client";

import { useId, useState, type KeyboardEvent } from "react";
import { cn } from "@azentisfieldos/ui";

// A small, self-contained tag input — not promoted to packages/ui since
// this is its only consumer so far (create + edit Vendor forms share this
// one file). A second consumer outside apps/web/app/(app)/vendors would
// justify generalizing it into a shared primitive.
export interface MaterialsSuppliedFieldProps {
  name: string;
  defaultValue?: string[];
  error?: string;
}

export function MaterialsSuppliedField({ name, defaultValue = [], error }: MaterialsSuppliedFieldProps) {
  const inputId = useId();
  const [tags, setTags] = useState<string[]>(defaultValue);
  const [draft, setDraft] = useState("");

  function commitDraft() {
    const value = draft.trim();
    if (value && !tags.some((tag) => tag.toLowerCase() === value.toLowerCase())) {
      setTags((prev) => [...prev, value]);
    }
    setDraft("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      commitDraft();
    } else if (event.key === "Backspace" && draft === "" && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1));
    }
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag));
  }

  return (
    <div className="mb-4">
      <label htmlFor={inputId} className="mb-1 block text-caption font-semibold text-ink-700">
        Materials / services supplied
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
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commitDraft}
          placeholder={tags.length === 0 ? "Type and press Enter" : ""}
          className="min-w-32 flex-1 border-none bg-transparent text-body text-ink-900 outline-none"
        />
      </div>
      {error ? (
        <p role="alert" className="mt-1 text-eyebrow text-danger-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
