"use client";

import { useEffect, useState } from "react";
import type { SearchResponse } from "@azentisfieldos/shared";
import { useAuthedFetch } from "./use-authed-fetch";

export interface GlobalSearchState {
  data: SearchResponse | null;
  loading: boolean;
  error: string | null;
}

// Takes an already-debounced query (debouncing lives at the call site, a UI
// concern — same split every Story 16.1 list-client uses). Never calls the
// endpoint for a blank/whitespace query (AC #6 — empty search shows nothing,
// never a spinner with nothing to load). A stale in-flight request for a
// query the caller has since moved on from is ignored via a cancellation
// flag, mirroring use-site-stock.ts's useStock.
export function useGlobalSearch(query: string): GlobalSearchState {
  const authedFetch = useAuthedFetch();
  const trimmed = query.trim();
  const [state, setState] = useState<{
    query: string;
    data: SearchResponse | null;
    error: string | null;
  }>({ query: "", data: null, error: null });

  useEffect(() => {
    // A blank query has nothing to fetch — handled below without touching
    // state, so this branch never needs a synchronous setState-in-effect.
    if (!trimmed) return;
    let cancelled = false;
    authedFetch(`/search?q=${encodeURIComponent(trimmed)}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Search failed (${res.status})`);
        return res.json() as Promise<SearchResponse>;
      })
      .then((data) => {
        if (!cancelled) setState({ query: trimmed, data, error: null });
      })
      .catch(() => {
        if (!cancelled) {
          setState({ query: trimmed, data: null, error: "Search failed — try again" });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [trimmed, authedFetch]);

  if (!trimmed) {
    return { data: null, loading: false, error: null };
  }

  const settled = state.query === trimmed;
  return {
    data: settled ? state.data : null,
    loading: !settled,
    error: settled ? state.error : null,
  };
}
