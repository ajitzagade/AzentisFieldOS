"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Badge,
  Button,
  DataTable,
  DetailPanel,
  EmptyState,
  Pagination,
  PlusIcon,
  TextField,
  UserIcon,
  buttonVariants,
  cn,
  isPlainLeftClick,
  type DataTableColumn,
  type DataTableMobileCard,
} from "@azentisfieldos/ui";
import { useListQueryState } from "../../../lib/use-list-query-state";
import { useDebouncedSearch } from "../../../lib/use-debounced-search";
import { useDetailPanelState } from "../../../lib/use-detail-panel-state";
import { useAuthedFetch } from "../../../lib/use-authed-fetch";
import type { Subcontractor } from "./page";

const columns: DataTableColumn<Subcontractor>[] = [
  {
    header: "Name",
    cell: (subcontractor) => <span className="font-semibold">{subcontractor.name}</span>,
    sortKey: "name",
  },
  {
    header: "Contact person",
    cell: (subcontractor) => subcontractor.contactPerson ?? <span className="text-ink-500">—</span>,
    sortKey: "contactPerson",
  },
  {
    header: "Phone",
    cell: (subcontractor) => subcontractor.phone ?? <span className="text-ink-500">—</span>,
    sortKey: "phone",
  },
  {
    header: "Work categories",
    cell: (subcontractor) =>
      subcontractor.workCategories.length === 0 ? (
        <span className="text-ink-500">—</span>
      ) : (
        <div className="flex flex-wrap gap-1">
          {subcontractor.workCategories.map((tag) => (
            <Badge key={tag} variant="neutral">
              {tag}
            </Badge>
          ))}
        </div>
      ),
  },
];

const mobileCard: DataTableMobileCard<Subcontractor> = {
  primary: (subcontractor) => subcontractor.name,
  omitHeaders: ["Name"],
};

type SubcontractorDetailState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "not-found" }
  | { status: "error" }
  | { status: "success"; subcontractor: Subcontractor };

// A completed fetch, tagged with the id/attempt it answers — settled
// against the current (id, attempt) pair below rather than written
// eagerly, so "loading" is derived instead of a synchronous setState call
// in the effect body (same shape as use-global-search.ts's own settled
// check; react-hooks/set-state-in-effect flags the eager form).
type SubcontractorFetchResult =
  | { id: string; attempt: number; status: "not-found" }
  | { id: string; attempt: number; status: "error" }
  | { id: string; attempt: number; status: "success"; subcontractor: Subcontractor };

// Panel v1's own client-side fetch (Boundaries & Constraints: no new API
// endpoint — this calls the same GET /subcontractors/:id the full detail
// page's getSubcontractor already calls). Keyed off the panel's
// URL-sourced id, so navigating between rows (id changes while the panel
// stays open) re-fetches rather than showing the previous Subcontractor's
// content.
function useSubcontractorDetail(id: string | null): { state: SubcontractorDetailState; retry: () => void } {
  const authedFetch = useAuthedFetch();
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<SubcontractorFetchResult | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    authedFetch(`/subcontractors/${encodeURIComponent(id)}`)
      .then(async (res) => {
        if (res.status === 404) {
          if (!cancelled) setResult({ id, attempt, status: "not-found" });
          return;
        }
        if (!res.ok) {
          throw new Error(`Failed to load Subcontractor (${res.status})`);
        }
        const subcontractor = (await res.json()) as Subcontractor;
        if (!cancelled) setResult({ id, attempt, status: "success", subcontractor });
      })
      .catch(() => {
        if (!cancelled) setResult({ id, attempt, status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [id, attempt, authedFetch]);

  const settled = result && result.id === id && result.attempt === attempt;
  const state: SubcontractorDetailState = !id ? { status: "idle" } : settled ? result : { status: "loading" };

  return { state, retry: () => setAttempt((n) => n + 1) };
}

function SubcontractorDetailPanelContent({
  state,
  onRetry,
  onClose,
}: {
  state: SubcontractorDetailState;
  onRetry: () => void;
  onClose: () => void;
}) {
  if (state.status === "loading" || state.status === "idle") {
    return (
      <div aria-hidden="true" className="flex flex-col gap-3">
        <div className="h-4 w-2/3 animate-pulse rounded-sm bg-surface-2" />
        <div className="h-4 w-1/2 animate-pulse rounded-sm bg-surface-2" />
        <div className="h-4 w-full animate-pulse rounded-sm bg-surface-2" />
        <div className="h-4 w-5/6 animate-pulse rounded-sm bg-surface-2" />
      </div>
    );
  }

  if (state.status === "not-found") {
    return <EmptyState icon={<UserIcon />} message="This Subcontractor could not be found." />;
  }

  if (state.status === "error") {
    return (
      <div className="px-2 py-8 text-center text-ink-500">
        <p>Couldn&apos;t load this Subcontractor.</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 text-accent-teal-700 underline-offset-2 hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  const { subcontractor } = state;
  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="mb-0.5 text-eyebrow uppercase text-ink-500">Contact person</div>
        <div className="text-body-sm text-ink-900">{subcontractor.contactPerson ?? "—"}</div>
      </div>
      <div>
        <div className="mb-0.5 text-eyebrow uppercase text-ink-500">Phone</div>
        <div className="text-body-sm text-ink-900">{subcontractor.phone ?? "—"}</div>
      </div>
      <div>
        <div className="mb-0.5 text-eyebrow uppercase text-ink-500">Email</div>
        <div className="text-body-sm text-ink-900">{subcontractor.email ?? "—"}</div>
      </div>
      <div>
        <div className="mb-0.5 text-eyebrow uppercase text-ink-500">Address</div>
        <div className="text-body-sm text-ink-900">{subcontractor.address ?? "—"}</div>
      </div>
      <div>
        <div className="mb-1 text-eyebrow uppercase text-ink-500">Work categories</div>
        {subcontractor.workCategories.length === 0 ? (
          <span className="text-body-sm text-ink-500">—</span>
        ) : (
          <div className="flex flex-wrap gap-1">
            {subcontractor.workCategories.map((tag) => (
              <Badge key={tag} variant="neutral">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
      <Link
        href={`/subcontractors/${subcontractor.id}`}
        // Only close the panel (a router.replace on this tab) on a plain
        // click — a modifier/middle-click opens the full page in a new tab
        // and must leave this tab's panel/URL untouched, same guard as
        // DataTable's own row links.
        onClick={(event) => {
          if (isPlainLeftClick(event)) onClose();
        }}
        className="text-body-sm font-medium text-accent-teal-700 hover:underline"
      >
        View full details →
      </Link>
    </div>
  );
}

export function SubcontractorsListClient({
  rows,
  total,
  page,
  pageSize,
}: {
  rows: Subcontractor[];
  total: number;
  page: number;
  pageSize: number;
}) {
  const query = useListQueryState();
  const search = useDebouncedSearch(query.q, query.setQuery);
  const panel = useDetailPanelState("subcontractorId");
  const { state: detailState, retry } = useSubcontractorDetail(panel.id);

  const hasActiveSearch = Boolean(query.q);

  return (
    <>
      <div className="mb-4">
        <TextField
          label="Search"
          placeholder="Subcontractor name…"
          value={search.value}
          onChange={(e) => search.onChange(e.target.value)}
          className="mb-0 max-w-80"
        />
      </div>

      <DataTable
        columns={columns}
        mobileCard={mobileCard}
        rowKey={(subcontractor) => subcontractor.id}
        rowHref={(subcontractor) => `/subcontractors/${subcontractor.id}`}
        onRowClick={(subcontractor) => panel.open(subcontractor.id)}
        sort={query.sort ? { key: query.sort, order: query.order ?? "asc" } : undefined}
        onSortChange={query.setSort}
        state={
          rows.length === 0
            ? hasActiveSearch
              ? {
                  status: "empty",
                  icon: <UserIcon />,
                  message: "No Subcontractors match your search.",
                  action: (
                    <Button type="button" variant="secondary" onClick={() => query.clearAll()}>
                      Clear filters
                    </Button>
                  ),
                }
              : {
                  status: "empty",
                  icon: <UserIcon />,
                  message: "No Subcontractors yet.",
                  action: (
                    <Link href="/subcontractors/new" className={cn(buttonVariants({ variant: "primary" }))}>
                      <PlusIcon className="size-4" />
                      Add your first Subcontractor
                    </Link>
                  ),
                }
            : { status: "success", rows }
        }
      />

      <div className="mt-4">
        <Pagination page={page} pageSize={pageSize} total={total} onPageChange={query.setPage} />
      </div>

      <DetailPanel
        open={panel.id !== null}
        onOpenChange={(open) => {
          if (!open) panel.close();
        }}
        title={detailState.status === "success" ? detailState.subcontractor.name : "Subcontractor"}
      >
        <SubcontractorDetailPanelContent state={detailState} onRetry={retry} onClose={panel.close} />
      </DetailPanel>
    </>
  );
}
