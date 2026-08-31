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

async function getVendors(params: VendorsPageSearchParams): Promise<PaginatedResult<Vendor>> {
  const query = new URLSearchParams();
  query.set("page", params.page ?? "1");
  query.set("pageSize", params.pageSize ?? String(DEFAULT_PAGE_SIZE));
  if (params.q) query.set("q", params.q);

  const res = await authedFetch(`/vendors?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Vendors (${res.status})`);
  }
  return res.json();
}

export async function getVendorPurchaseSummary(id: string): Promise<VendorPurchaseSummary> {
  const res = await authedFetch(`/vendors/${id}/purchase-summary`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Vendor purchase summary (${res.status})`);
  }
  return res.json();
}

// A single Vendor's summary fetch failing (deleted mid-request, transient
// 5xx) must not blank the whole table — every other row still loaded fine.
// `null` means "couldn't load," rendered as an honest "—", never
// defaulted to 0/Fully Paid, which would misrepresent what's actually owed.
async function getVendorPurchaseSummarySafe(id: string): Promise<VendorPurchaseSummary | null> {
  try {
    return await getVendorPurchaseSummary(id);
  } catch {
    return null;
  }
}

export default async function VendorsPage({
  searchParams,
}: {
  searchParams?: Promise<VendorsPageSearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const vendorsResult = await getVendors(params);
  const summaries = await Promise.all(vendorsResult.rows.map((vendor) => getVendorPurchaseSummarySafe(vendor.id)));
  const rows: VendorRow[] = vendorsResult.rows.map((vendor, index) => ({ ...vendor, summary: summaries[index]! }));

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
