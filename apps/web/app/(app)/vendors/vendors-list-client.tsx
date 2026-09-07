"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Badge,
  BuildingIcon,
  Button,
  DataTable,
  DetailPanel,
  EmptyState,
  Pagination,
  PlusIcon,
  TextField,
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
import type { Vendor, VendorPurchaseSummary } from "./page";

export interface VendorRow extends Vendor {
  summary: VendorPurchaseSummary | null;
}

const columns: DataTableColumn<VendorRow>[] = [
  {
    header: "Vendor",
    cell: (vendor) => <span className="font-semibold">{vendor.name}</span>,
    sortKey: "name",
  },
  {
    header: "Contact person",
    cell: (vendor) => vendor.contactPerson ?? <span className="text-ink-500">—</span>,
    sortKey: "contactPerson",
  },
  {
    header: "Phone",
    cell: (vendor) => vendor.phone ?? <span className="text-ink-500">—</span>,
    sortKey: "phone",
  },
  {
    header: "Materials / services supplied",
    cell: (vendor) =>
      vendor.materialsSupplied.length === 0 ? (
        <span className="text-ink-500">—</span>
      ) : (
        <div className="flex flex-wrap gap-1">
          {vendor.materialsSupplied.map((tag) => (
            <Badge key={tag} variant="neutral">
              {tag}
            </Badge>
          ))}
        </div>
      ),
  },
  {
    header: "Total purchase (this year)",
    align: "right",
    cell: (vendor) =>
      vendor.summary === null ? (
        <span className="text-ink-500">—</span>
      ) : (
        <span className="font-semibold text-gold-700 tabular-nums">
          ₹{vendor.summary.totalThisYear.toLocaleString("en-IN")}
        </span>
      ),
  },
  {
    header: "Payment status",
    cell: (vendor) =>
      vendor.summary === null ? (
        <span className="text-ink-500">—</span>
      ) : vendor.summary.notFullyPaidTotal === 0 ? (
        <Badge variant="success">Fully Paid</Badge>
      ) : (
        <Badge variant="warning">₹{vendor.summary.notFullyPaidTotal.toLocaleString("en-IN")} not marked Paid</Badge>
      ),
  },
];

const mobileCard: DataTableMobileCard<VendorRow> = {
  primary: (vendor) => vendor.name,
  omitHeaders: ["Vendor"],
};

type VendorDetailState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "not-found" }
  | { status: "error" }
  | { status: "success"; vendor: Vendor };

// A completed fetch, tagged with the id/attempt it answers — settled
// against the current (id, attempt) pair below rather than written
// eagerly, so "loading" is derived instead of a synchronous setState call
// in the effect body (same shape as use-global-search.ts's own settled
// check; react-hooks/set-state-in-effect flags the eager form).
type VendorFetchResult =
  | { id: string; attempt: number; status: "not-found" }
  | { id: string; attempt: number; status: "error" }
  | { id: string; attempt: number; status: "success"; vendor: Vendor };

// Panel v1's own client-side fetch (Boundaries & Constraints: no new API
// endpoint — this calls the same GET /vendors/:id the full detail page's
// getVendor already calls). Keyed off the panel's URL-sourced id, so
// navigating between rows (id changes while the panel stays open) re-fetches
// rather than showing the previous Vendor's content.
function useVendorDetail(id: string | null): { state: VendorDetailState; retry: () => void } {
  const authedFetch = useAuthedFetch();
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<VendorFetchResult | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    authedFetch(`/vendors/${encodeURIComponent(id)}`)
      .then(async (res) => {
        if (res.status === 404) {
          if (!cancelled) setResult({ id, attempt, status: "not-found" });
          return;
        }
        if (!res.ok) {
          throw new Error(`Failed to load Vendor (${res.status})`);
        }
        const vendor = (await res.json()) as Vendor;
        if (!cancelled) setResult({ id, attempt, status: "success", vendor });
      })
      .catch(() => {
        if (!cancelled) setResult({ id, attempt, status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [id, attempt, authedFetch]);

  const settled = result && result.id === id && result.attempt === attempt;
  const state: VendorDetailState = !id ? { status: "idle" } : settled ? result : { status: "loading" };

  return { state, retry: () => setAttempt((n) => n + 1) };
}

function VendorDetailPanelContent({ state, onRetry, onClose }: { state: VendorDetailState; onRetry: () => void; onClose: () => void }) {
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
    return <EmptyState icon={<BuildingIcon />} message="This Vendor could not be found." />;
  }

  if (state.status === "error") {
    return (
      <div className="px-2 py-8 text-center text-ink-500">
        <p>Couldn&apos;t load this Vendor.</p>
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

  const { vendor } = state;
  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="mb-0.5 text-eyebrow uppercase text-ink-500">Contact person</div>
        <div className="text-body-sm text-ink-900">{vendor.contactPerson ?? "—"}</div>
      </div>
      <div>
        <div className="mb-0.5 text-eyebrow uppercase text-ink-500">Phone</div>
        <div className="text-body-sm text-ink-900">{vendor.phone ?? "—"}</div>
      </div>
      <div>
        <div className="mb-0.5 text-eyebrow uppercase text-ink-500">Email</div>
        <div className="text-body-sm text-ink-900">{vendor.email ?? "—"}</div>
      </div>
      <div>
        <div className="mb-0.5 text-eyebrow uppercase text-ink-500">Address</div>
        <div className="text-body-sm text-ink-900">{vendor.address ?? "—"}</div>
      </div>
      <div>
        <div className="mb-1 text-eyebrow uppercase text-ink-500">Materials &amp; services supplied</div>
        {vendor.materialsSupplied.length === 0 ? (
          <span className="text-body-sm text-ink-500">—</span>
        ) : (
          <div className="flex flex-wrap gap-1">
            {vendor.materialsSupplied.map((tag) => (
              <Badge key={tag} variant="neutral">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
      <Link
        href={`/vendors/${vendor.id}`}
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

export function VendorsListClient({
  rows,
  total,
  page,
  pageSize,
}: {
  rows: VendorRow[];
  total: number;
  page: number;
  pageSize: number;
}) {
  const query = useListQueryState();
  const search = useDebouncedSearch(query.q, query.setQuery);
  const panel = useDetailPanelState("vendorId");
  const { state: detailState, retry } = useVendorDetail(panel.id);

  const hasActiveSearch = Boolean(query.q);

  return (
    <>
      <div className="mb-4">
        <TextField
          label="Search"
          placeholder="Vendor name…"
          value={search.value}
          onChange={(e) => search.onChange(e.target.value)}
          className="mb-0 max-w-80"
        />
      </div>

      <DataTable
        columns={columns}
        mobileCard={mobileCard}
        rowKey={(vendor) => vendor.id}
        rowHref={(vendor) => `/vendors/${vendor.id}`}
        onRowClick={(vendor) => panel.open(vendor.id)}
        sort={query.sort ? { key: query.sort, order: query.order ?? "asc" } : undefined}
        onSortChange={query.setSort}
        state={
          rows.length === 0
            ? hasActiveSearch
              ? {
                  status: "empty",
                  icon: <BuildingIcon />,
                  message: "No Vendors match your search.",
                  action: (
                    <Button type="button" variant="secondary" onClick={() => query.clearAll()}>
                      Clear filters
                    </Button>
                  ),
                }
              : {
                  status: "empty",
                  icon: <BuildingIcon />,
                  message: "No Vendors yet.",
                  action: (
                    <Link href="/vendors/new" className={cn(buttonVariants({ variant: "primary" }))}>
                      <PlusIcon className="size-4" />
                      Add your first Vendor
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
        title={detailState.status === "success" ? detailState.vendor.name : "Vendor"}
      >
        <VendorDetailPanelContent state={detailState} onRetry={retry} onClose={panel.close} />
      </DetailPanel>
    </>
  );
}
