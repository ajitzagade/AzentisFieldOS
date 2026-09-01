"use client";

import { useState, type FormEvent } from "react";

// Client-side pre-submit validation for server-action forms (simplicity
// review 2026-09-01, decision D5/E). Each form extracts its FormData→schema
// coercion into a shared `parse.ts` used by BOTH its Server Action and this
// hook — one validator, two run sites (AD-7), so the inline errors a user
// sees while typing can never disagree with what the server would say.
//
// The server remains the source of truth: this hook only short-circuits the
// round-trip for input the shared schema already rejects. Anything it can't
// know client-side (stock floors, FK existence) still comes back through the
// action's `state.errors` exactly as before.
interface ParseOutcome {
  success: boolean;
  error?: { flatten(): { fieldErrors: Record<string, string[]> } };
}

export function useClientValidation(parse: (formData: FormData) => ParseOutcome) {
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  /** Wrap the form's onSubmit; `next` runs only when the input parses (e.g.
   * a correction's ConfirmDialog guard). */
  function guard(next?: (event: FormEvent<HTMLFormElement>) => void) {
    return (event: FormEvent<HTMLFormElement>) => {
      const result = parse(new FormData(event.currentTarget));
      if (!result.success) {
        event.preventDefault();
        setErrors(result.error?.flatten().fieldErrors ?? {});
        return;
      }
      setErrors({});
      next?.(event);
    };
  }

  return { errors, guard };
}
