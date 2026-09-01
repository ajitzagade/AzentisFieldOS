import { authedFetch } from "@/lib/api";
import { currentRole } from "@/lib/current-role";
import type { PaginatedResult } from "@azentisfieldos/shared";
import { MovementsListClient, type MovementLogRow } from "./movements-list-client";

interface SiteOption {
  id: string;
  name: string;
}

interface MovementsLogSearchParams {
  q?: string;
  page?: string;
  pageSize?: string;
  type?: string;
  siteId?: string;
  from?: string;
  to?: string;
}

const DEFAULT_PAGE_SIZE = 25;

async function getMovementsLog(params: MovementsLogSearchParams): Promise<PaginatedResult<MovementLogRow>> {
  const query = new URLSearchParams();
  query.set("page", params.page ?? "1");
  query.set("pageSize", params.pageSize ?? String(DEFAULT_PAGE_SIZE));
  if (params.q) query.set("q", params.q);
  if (params.type) query.set("type", params.type);
  if (params.siteId) query.set("siteId", params.siteId);
  if (params.from) query.set("from", params.from);
  if (params.to) query.set("to", params.to);

  const res = await authedFetch(`/movements-log?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Movements (${res.status})`);
  }
  return res.json();
}

async function getSites(): Promise<SiteOption[]> {
  const res = await authedFetch(`/sites`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Sites (${res.status})`);
  }
  return res.json();
}

export default async function MovementsPage({
  searchParams,
}: {
  searchParams?: Promise<MovementsLogSearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const [log, sites, role] = await Promise.all([getMovementsLog(params), getSites(), currentRole()]);

  return (
    <MovementsListClient
      rows={log.rows}
      total={log.total}
      page={log.page}
      pageSize={log.pageSize}
      sites={sites}
      // D7: only the Owner/Admin completes pricing (the API PATCH is
      // role-guarded; this just keeps a dead-end button off the Supervisor's list).
      canPrice={role === "OWNER_ADMIN"}
    />
  );
}
