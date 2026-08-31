"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

// The single URL-sync implementation for a paginated/searchable/sortable
// list (AD-5) — every converted list page reads/writes this same shape
// instead of hand-rolling its own searchParams plumbing. The URL is the
// source of truth: reload or share the link, get the same view back.
export interface ListQueryState {
  q: string;
  page: number;
  sort?: string;
  order?: "asc" | "desc";
  setQuery: (q: string) => void;
  setPage: (page: number) => void;
  setSort: (key: string) => void;
  setFilter: (name: string, value: string | null) => void;
  getFilter: (name: string) => string | null;
  /**
   * Drops this list's own q/page/sort/order, plus any extra filter param
   * names the caller passes (e.g. Sites' "status", Movements' "type"/
   * "siteId") — the "Clear filters" empty-state action. Never a blind
   * full-path wipe: an unrelated param tracked by different page state
   * (e.g. RMC's independent `?report=` groupBy tab) is always left alone.
   */
  clearAll: (extraFilterNames?: string[]) => void;
}

// A page hosting two independent lists (e.g. Machinery & Vehicles) passes a
// distinct `prefix` per list so their query params don't collide in one
// shared URL — "m" -> mq/mpage/msort/morder, "v" -> vq/vpage/... A bare
// call with no prefix keeps the original unprefixed q/page/sort/order keys
// (every single-list page already converted uses this default).
export function useListQueryState(prefix = ""): ListQueryState {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const key = (name: string) => `${prefix}${name}`;

  const q = searchParams.get(key("q")) ?? "";
  const pageParam = Number(searchParams.get(key("page")));
  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;
  const sort = searchParams.get(key("sort")) ?? undefined;
  const order = searchParams.get(key("order")) === "desc" ? "desc" : sort ? "asc" : undefined;

  function push(params: URLSearchParams) {
    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname);
  }

  function withoutPage(params: URLSearchParams) {
    params.delete(key("page"));
    return params;
  }

  return {
    q,
    page,
    sort,
    order,
    setQuery(value: string) {
      const params = withoutPage(new URLSearchParams(searchParams));
      if (value) {
        params.set(key("q"), value);
      } else {
        params.delete(key("q"));
      }
      push(params);
    },
    setPage(value: number) {
      const params = new URLSearchParams(searchParams);
      params.set(key("page"), String(value));
      push(params);
    },
    setSort(sortKey: string) {
      const params = withoutPage(new URLSearchParams(searchParams));
      const nextOrder = sort === sortKey && order === "asc" ? "desc" : "asc";
      params.set(key("sort"), sortKey);
      params.set(key("order"), nextOrder);
      push(params);
    },
    setFilter(name: string, value: string | null) {
      const params = withoutPage(new URLSearchParams(searchParams));
      if (value) {
        params.set(key(name), value);
      } else {
        params.delete(key(name));
      }
      push(params);
    },
    getFilter(name: string) {
      return searchParams.get(key(name));
    },
    clearAll(extraFilterNames: string[] = []) {
      // Only this namespace's well-known keys plus whatever extra filter
      // names the caller names explicitly — never a blind startsWith(prefix)
      // or a full-path replace, either of which could delete an unrelated
      // param tracked by different page state.
      const params = new URLSearchParams(searchParams);
      for (const name of ["q", "page", "sort", "order", ...extraFilterNames]) {
        params.delete(key(name));
      }
      push(params);
    },
  };
}
