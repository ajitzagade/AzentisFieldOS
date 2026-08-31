import { authedFetch } from "@/lib/api";
import Link from "next/link";
import type { PaginatedResult } from "@azentisfieldos/shared";
import { PlusIcon, buttonVariants, cn } from "@azentisfieldos/ui";
import { SitesListClient, type SiteRow } from "./sites-list-client";

export interface Site {
  id: string;
  name: string;
  location: string;
  status: "ACTIVE" | "COMPLETED" | "ON_HOLD";
  contractReference: string | null;
  description: string | null;
}

const DEFAULT_PAGE_SIZE = 25;

interface SitesPageSearchParams {
  q?: string;
  page?: string;
  pageSize?: string;
  sort?: string;
  order?: string;
  status?: string;
}

// Always requests page/pageSize — this call site opts into the paginated
// envelope response; the many bare `GET /sites` callers elsewhere (pickers)
// never pass these params and keep getting the plain-array response.
async function getSites(params: SitesPageSearchParams): Promise<PaginatedResult<Site>> {
  const query = new URLSearchParams();
  query.set("page", params.page ?? "1");
  query.set("pageSize", params.pageSize ?? String(DEFAULT_PAGE_SIZE));
  if (params.q) query.set("q", params.q);
  if (params.sort) query.set("sort", params.sort);
  if (params.order) query.set("order", params.order);
  if (params.status) query.set("status", params.status);

  const res = await authedFetch(`/sites?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load sites (${res.status})`);
  }
  return res.json();
}

// One extra read answers "has this Site reported today?" for every row —
// the same GET /dsr?date= the Daily Activity log uses, so the two screens
// agree by construction. Its failure must not blank the Sites list itself.
async function getTodaysReportedSiteIds(): Promise<Set<string> | null> {
  const today = new Date().toISOString().slice(0, 10);
  try {
    const res = await authedFetch(`/dsr?date=${today}`, { cache: "no-store" });
    if (!res.ok) return null;
    const reports = (await res.json()) as { site?: { id: string } }[];
    if (!Array.isArray(reports)) return null;
    return new Set(reports.flatMap((report) => (report.site?.id ? [report.site.id] : [])));
  } catch {
    return null;
  }
}

export default async function SitesPage({
  searchParams,
}: {
  searchParams?: Promise<SitesPageSearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const [sitesResult, reportedToday] = await Promise.all([getSites(params), getTodaysReportedSiteIds()]);
  const rows: SiteRow[] = sitesResult.rows.map((site) => ({
    ...site,
    dsrToday: reportedToday === null ? null : reportedToday.has(site.id),
  }));

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-page-title text-ink-900">Sites</h1>
          <p className="text-body-sm text-ink-500">All sites across the organization</p>
        </div>
        <Link href="/sites/new" className={cn(buttonVariants({ variant: "primary" }))}>
          <PlusIcon className="size-4" />
          Add Site
        </Link>
      </div>

      <SitesListClient rows={rows} total={sitesResult.total} page={sitesResult.page} pageSize={sitesResult.pageSize} />
    </>
  );
}
