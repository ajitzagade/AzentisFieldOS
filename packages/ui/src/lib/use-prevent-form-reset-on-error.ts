"use client";

import { useEffect, useRef, type RefObject } from "react";

// React 19's `<form action={formAction}>` (from `useActionState`) unconditionally
// native-`form.reset()`s during commit on every submission — success or failure
// alike (react-dom's `requestFormReset$1` / `recursivelyResetForms`). Invisible on
// success (those actions `redirect()` away, or the caller resets on purpose), but
// on a server-returned validation error it silently wipes everything the user
// typed. A plain JSX `onReset={preventDefault}` does NOT intercept this reset —
// only a native `addEventListener("reset", …)` attached via ref does.
//
// Gated on `hasError` (not an unconditional block) because some forms call
// `formRef.current?.reset()` themselves on success — that reset must still work.
export function usePreventFormResetOnError(
  formRef: RefObject<HTMLFormElement | null>,
  hasError: boolean,
) {
  const hasErrorRef = useRef(hasError);
  // Deliberately assigned during render, not in a `useEffect`: React's own
  // native `form.reset()` (`requestFormReset`) fires as part of the commit
  // itself, before passive effects flush — updating this ref from a
  // `useEffect(() => { hasErrorRef.current = hasError }, [hasError])`
  // arrives too late for a reset that lands in the very same commit as the
  // `hasError` flip, letting the reset through once and defeating the
  // fix. This is the standard "latest ref" pattern, read only from the
  // async event handler below, never during render.
  hasErrorRef.current = hasError;

  // No dependency array: a stable `[formRef]` dep only re-runs this once, on
  // mount. That's fine for a plain in-tree `<form>` (the ref is already
  // populated by then), but a form rendered inside a portal (e.g. a Base UI
  // Dialog) can attach its DOM in a *later* commit than this component's own
  // mount — a stable-dep effect would permanently miss it. Re-running on
  // every render (and re-attaching the listener each time) is the tradeoff:
  // a same-node identity check can't skip this, because React tears down the
  // previous effect's cleanup before every re-run of a dep-less effect, so
  // there's no "already attached" state left to compare against by the time
  // the body runs again. `addEventListener`/`removeEventListener` on the
  // same node are cheap, synchronous, and idempotent, so this is harmless.
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    const handler = (e: Event) => {
      if (hasErrorRef.current) e.preventDefault();
    };
    form.addEventListener("reset", handler);
    return () => form.removeEventListener("reset", handler);
  });
}
