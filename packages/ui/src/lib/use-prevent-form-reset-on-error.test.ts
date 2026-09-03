// @vitest-environment jsdom
import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { RefObject } from "react";
import { usePreventFormResetOnError } from "./use-prevent-form-reset-on-error";

// React 19's `<form action={formAction}>` native-resets on every commit,
// success or failure alike — this hook is the only thing standing between a
// server-returned validation error and every typed field being wiped. Pin
// both branches: reset is cancelled while `hasError` is true (field
// survives), and proceeds normally once `hasError` is false (the 8 forms'
// own success `.reset()` calls still work).
function makeFormWithInput(defaultValue: string) {
  const form = document.createElement("form");
  const input = document.createElement("input");
  input.name = "name";
  input.defaultValue = defaultValue;
  form.appendChild(input);
  document.body.appendChild(form);
  const formRef: RefObject<HTMLFormElement | null> = { current: form };
  return { form, input, formRef };
}

describe("usePreventFormResetOnError", () => {
  it("cancels the native reset while hasError is true, so typed values survive", () => {
    const { form, input, formRef } = makeFormWithInput("");
    input.value = "typed value";

    renderHook(({ hasError }) => usePreventFormResetOnError(formRef, hasError), {
      initialProps: { hasError: true },
    });

    form.reset();

    expect(input.value).toBe("typed value");
  });

  it("lets the native reset proceed when hasError is false", () => {
    const { form, input, formRef } = makeFormWithInput("original");
    input.value = "typed value";

    renderHook(({ hasError }) => usePreventFormResetOnError(formRef, hasError), {
      initialProps: { hasError: false },
    });

    form.reset();

    expect(input.value).toBe("original");
  });

  it("re-checks hasError at reset time, not at attach time (state updates without re-attaching)", () => {
    const { form, input, formRef } = makeFormWithInput("");
    input.value = "typed value";

    const { rerender } = renderHook(({ hasError }) => usePreventFormResetOnError(formRef, hasError), {
      initialProps: { hasError: false },
    });
    rerender({ hasError: true });

    form.reset();

    expect(input.value).toBe("typed value");
  });

  it("attaches on a later render if the form wasn't in the ref yet on mount (portal timing)", () => {
    // Regression: a form rendered inside a portal (e.g. a Base UI Dialog) can
    // attach its DOM in a commit *after* this hook's owning component mounts.
    // A `useEffect` keyed on the stable `formRef` object would only ever run
    // once and permanently miss it. Simulate that by rendering with an empty
    // ref, then populating it and re-rendering.
    const form = document.createElement("form");
    const input = document.createElement("input");
    input.name = "name";
    form.appendChild(input);
    document.body.appendChild(form);
    const formRef: RefObject<HTMLFormElement | null> = { current: null };

    const { rerender } = renderHook(({ hasError }) => usePreventFormResetOnError(formRef, hasError), {
      initialProps: { hasError: true },
    });

    formRef.current = form;
    input.value = "typed value";
    rerender({ hasError: true });

    form.reset();

    expect(input.value).toBe("typed value");
  });
});
