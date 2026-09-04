import { authedFetch } from "@/lib/api";
import Link from "next/link";
import type { PaginatedResult } from "@azentisfieldos/shared";
import { PlusIcon, buttonVariants, cn } from "@azentisfieldos/ui";
import { VendorsListClient, type VendorRow } from "./vendors-list-client";

export interface Vendor {
  id: string;
  name: string;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  materialsSupplied: string[];
}

export interface VendorPurchaseSummary {
  totalThisYear: number;
  notFullyPaidTotal: number;
}

interface VendorsPageSearchParams {
  q?: string;
  page?: string;
  pageSize?: string;
}

const DEFAULT_PAGE_SIZE = 25;

// Perf review 2026-09-03: Vendor master data changes rarely, and
// vendors/new, vendors/[id]/edit, and vendors/[id] (delete) actions.ts all
// call revalidatePath("/vendors") on their respective mutation — so a
// short time-based revalidate window never shows stale data after one.
// Code review 2026-09-04 correction: Next's fetch Data Cache key includes
// request headers, and authedFetch attaches a per-user Authorization
// header — so this cache entry is per-user, not shared tenant-wide. It
// still avoids a re-fetch when the SAME user re-opens this tab within the
// window (the reported symptom), just not concurrent different users
// sharing one DB round trip. Purchase summary below stays no-store — it's
// a money figure derived from transaction data (Purchases), not master data.
const VENDOR_LIST_REVALIDATE_SECONDS = 10;

async function getVendors(params: VendorsPageSearchParams): Promise<PaginatedResult<Vendor>> {
  const query = new URLSearchParams();
  query.set("page", params.page ?? "1");
  query.set("pageSize", params.pageSize ?? String(DEFAULT_PAGE_SIZE));
  if (params.q) query.set("q", params.q);

  const res = await authedFetch(`/vendors?${query.toString()}`, {
    next: { revalidate: VENDOR_LIST_REVALIDATE_SECONDS },
  });
  if (!res.ok) {
    throw new Error(`Failed to load Vendors (${res.status})`);
  }
  return res.json();
}

// Used by the Vendor detail page (vendors/[id]/page.tsx) for its own
// single-Vendor view — the list page below uses the batched sibling
// instead, never a fan-out of this per row.
export async function getVendorPurchaseSummary(id: string): Promise<VendorPurchaseSummary> {
  const res = await authedFetch(`/vendors/${id}/purchase-summary`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Vendor purchase summary (${res.status})`);
  }
  return res.json();
}

// Perf review 2026-09-03: the Vendors list used to call
// getVendorPurchaseSummary once per row (up to 25 concurrent HTTP round
// trips just to open the tab). One batched call now covers the whole page.
async function getVendorPurchaseSummaries(
  ids: string[],
): Promise<Record<string, VendorPurchaseSummary>> {
  if (ids.length === 0) return {};
  const res = await authedFetch(`/vendors/purchase-summary?ids=${ids.join(",")}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to load Vendor purchase summaries (${res.status})`);
  }
  return res.json();
}

// The batch fetch failing (transient 5xx) must not blank the whole table —
// every row just shows the honest "—" fallback below, same as before this
// was a single request instead of one per row.
async function getVendorPurchaseSummariesSafe(
  ids: string[],
): Promise<Record<string, VendorPurchaseSummary>> {
  try {
    return await getVendorPurchaseSummaries(ids);
  } catch {
    return {};
  }
}

export default async function VendorsPage({
  searchParams,
}: {
  searchParams?: Promise<VendorsPageSearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const vendorsResult = await getVendors(params);
  const summaries = await getVendorPurchaseSummariesSafe(vendorsResult.rows.map((vendor) => vendor.id));
  const rows: VendorRow[] = vendorsResult.rows.map((vendor) => ({
    ...vendor,
    summary: summaries[vendor.id] ?? null,
  }));

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-page-title text-ink-900">Vendors</h1>
          <p className="text-body-sm text-ink-500">Materials, RMC and services suppliers across all sites</p>
        </div>
        <Link href="/vendors/new" className={cn(buttonVariants({ variant: "primary" }))}>
          <PlusIcon className="size-4" />
          Add Vendor
        </Link>
      </div>

      <VendorsListClient rows={rows} total={vendorsResult.total} page={vendorsResult.page} pageSize={vendorsResult.pageSize} />
    </>
  );
}
