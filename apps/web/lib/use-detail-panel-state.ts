"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

// Backs a DetailPanel (packages/ui) with a single URL query param as its
// only source of open/closed state — same `router.replace`/`URLSearchParams`
// idiom as useListQueryState, just a single named param instead of that
// hook's q/page/sort/order shape. There is deliberately no separate React
// `open` boolean: reloading or sharing `/vendors?vendorId=<id>` reopens the
// panel on mount because the URL itself is the state, not a mirror of it.
export interface DetailPanelState {
  id: string | null;
  open: (id: string) => void;
  close: () => void;
}

export function useDetailPanelState(paramName: string): DetailPanelState {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  // A malformed/hand-edited URL (`?vendorId=` with no value) resolves to
  // "", not null — normalize it away so callers' `!id` guards and `id !==
  // null` open-checks agree, instead of one treating it as "no id" and the
  // other as "an id", which would open an empty panel that never fetches.
  const id = searchParams.get(paramName) || null;

  function push(params: URLSearchParams) {
    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname);
  }

  return {
    id,
    open(nextId: string) {
      const params = new URLSearchParams(searchParams);
      params.set(paramName, nextId);
      push(params);
    },
    close() {
      const params = new URLSearchParams(searchParams);
      params.delete(paramName);
      push(params);
    },
  };
}
