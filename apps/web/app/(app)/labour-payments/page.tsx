import { authedFetch } from "@/lib/api";
import Link from "next/link";
import type { PaginatedResult } from "@azentisfieldos/shared";
import { PlusIcon, buttonVariants, cn } from "@azentisfieldos/ui";
import { LabourersListClient } from "./labourers-list-client";

export interface DailyLabourerListItem {
  id: string;
  name: string;
  category: string;
  defaultPerDayAmount: number | null;
  isActive: boolean;
  outstandingAdvanceBalance: number;
}

interface LabourPaymentsPageSearchParams {
  q?: string;
  page?: string;
  pageSize?: string;
  sort?: string;
  order?: string;
}

const DEFAULT_PAGE_SIZE = 25;

async function getLabourers(
  params: LabourPaymentsPageSearchParams,
): Promise<PaginatedResult<DailyLabourerListItem>> {
  const query = new URLSearchParams();
  query.set("page", params.page ?? "1");
  query.set("pageSize", params.pageSize ?? String(DEFAULT_PAGE_SIZE));
  if (params.q) query.set("q", params.q);
  if (params.sort) query.set("sort", params.sort);
  if (params.order) query.set("order", params.order);

  const res = await authedFetch(`/daily-labourers?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Labourers (${res.status})`);
  }
  return res.json();
}

export default async function LabourPaymentsPage({
  searchParams,
}: {
  searchParams?: Promise<LabourPaymentsPageSearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const labourersResult = await getLabourers(params);

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-page-title text-ink-900">Labour Payment</h1>
          <p className="text-body-sm text-ink-500">
            Daily-wage labour — attendance, advances, and weekly settlement, tracked separately from Team &amp; Labour
          </p>
        </div>
        <Link href="/labour-payments/new" className={cn(buttonVariants({ variant: "primary" }))}>
          <PlusIcon className="size-4" />
          Add Labourer
        </Link>
      </div>

      <LabourersListClient
        rows={labourersResult.rows}
        total={labourersResult.total}
        page={labourersResult.page}
        pageSize={labourersResult.pageSize}
      />
    </>
  );
}
