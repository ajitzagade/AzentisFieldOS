"use client";

import { useEffect, useRef, useState } from "react";

const SEARCH_DEBOUNCE_MS = 300;

export interface DebouncedSearch {
  /** The value to render in the search input right now. */
  value: string;
  /** Call on every keystroke — updates `value` immediately, calls `onDebouncedChange` after the delay. */
  onChange: (value: string) => void;
}

// The single debounced-search implementation (AD-5) — every list-client's
// search box shares this instead of re-implementing the same
// state/timer/cleanup boilerplate per screen. `value` is the URL-sourced
// current query (e.g. `query.q`); this hook resyncs its local echo to it
// whenever it changes externally (a "Clear filters" click, browser
// back/forward), so the input never shows stale typed text after the
// underlying filter has actually changed.
export function useDebouncedSearch(
  value: string,
  onDebouncedChange: (value: string) => void,
): DebouncedSearch {
  const [inputValue, setInputValue] = useState(value);
  // The last external `value` seen, so a genuine external change (Clear
  // filters, browser back/forward) can be told apart from `value` merely
  // catching up to what was just typed once the debounce fires. Adjusted
  // during render, not in an effect — the React-endorsed way to sync state
  // to a prop change without an extra render round-trip.
  const [lastValue, setLastValue] = useState(value);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  if (value !== lastValue) {
    setLastValue(value);
    setInputValue(value);
  }

  useEffect(() => {
    return () => clearTimeout(debounceRef.current);
  }, []);

  function onChange(next: string) {
    setInputValue(next);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onDebouncedChange(next), SEARCH_DEBOUNCE_MS);
  }

  return { value: inputValue, onChange };
}
