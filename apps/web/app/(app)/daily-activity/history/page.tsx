import { authedFetch } from "@/lib/api";
import Link from "next/link";
import type { PaginatedResult } from "@azentisfieldos/shared";
import { ChevronRightIcon, buttonVariants, cn } from "@azentisfieldos/ui";
import type { Site } from "../../sites/page";
import { HistoryListClient, type DsrHistoryRow } from "../history-list-client";

interface DsrHistorySearchParams {
  siteId?: string;
  from?: string;
  to?: string;
  q?: string;
  page?: string;
  pageSize?: string;
  sort?: string;
  order?: string;
}

const DEFAULT_PAGE_SIZE = 25;

async function getHistory(params: DsrHistorySearchParams): Promise<PaginatedResult<DsrHistoryRow>> {
  const query = new URLSearchParams();
  query.set("page", params.page ?? "1");
  query.set("pageSize", params.pageSize ?? String(DEFAULT_PAGE_SIZE));
  if (params.q) query.set("q", params.q);
  if (params.siteId) query.set("siteId", params.siteId);
  if (params.from) query.set("from", params.from);
  if (params.to) query.set("to", params.to);
  if (params.sort) query.set("sort", params.sort);
  if (params.order) query.set("order", params.order);

  const res = await authedFetch(`/dsr/history?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Submitted Daily Reports (${res.status})`);
  }
  return res.json();
}

async function getSites(): Promise<Site[]> {
  const res = await authedFetch(`/sites`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Sites (${res.status})`);
  }
  return res.json();
}

// spec-daily-reports-list-and-edit: the cross-Site "Submitted Daily
// Reports" history — every date, every Site, one filterable/sortable/
// paginated list (Story 16.1's list platform), linked from /daily-activity.
// The existing per-day per-Site status board (/daily-activity) is additive
// and unchanged — this is a new view, not a replacement.
export default async function DsrHistoryPage({
  searchParams,
}: {
  searchParams?: Promise<DsrHistorySearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const [result, sites] = await Promise.all([getHistory(params), getSites()]);

  return (
    <>
      <div className="mb-2 text-eyebrow text-ink-500">
        <Link href="/daily-activity" className="hover:text-accent-teal-700 hover:underline">
          Daily Reports
        </Link>{" "}
        / History
      </div>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-page-title text-ink-900">Submitted Daily Reports</h1>
          <p className="text-body-sm text-ink-500">
            Every submitted Daily Report, across every Site — searchable, filterable, and linked to its full edit
            history
          </p>
        </div>
        <Link href="/daily-activity" className={cn(buttonVariants({ variant: "secondary" }))}>
          <ChevronRightIcon className="size-4 rotate-180" />
          Back to today&apos;s board
        </Link>
      </div>

      <HistoryListClient rows={result.rows} total={result.total} page={result.page} pageSize={result.pageSize} sites={sites} />
    </>
  );
}
