import { authedFetch } from "@/lib/api";
import Link from "next/link";
import type { PaginatedResult } from "@azentisfieldos/shared";
import { PlusIcon, buttonVariants, cn } from "@azentisfieldos/ui";
import { SubcontractorsListClient } from "./subcontractors-list-client";

export interface Subcontractor {
  id: string;
  name: string;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  workCategories: string[];
}

interface SubcontractorsPageSearchParams {
  q?: string;
  page?: string;
  pageSize?: string;
}

const DEFAULT_PAGE_SIZE = 25;

async function getSubcontractors(
  params: SubcontractorsPageSearchParams,
): Promise<PaginatedResult<Subcontractor>> {
  const query = new URLSearchParams();
  query.set("page", params.page ?? "1");
  query.set("pageSize", params.pageSize ?? String(DEFAULT_PAGE_SIZE));
  if (params.q) query.set("q", params.q);

  const res = await authedFetch(`/subcontractors?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load Subcontractors (${res.status})`);
  }
  return res.json();
}

export default async function SubcontractorsPage({
  searchParams,
}: {
  searchParams?: Promise<SubcontractorsPageSearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const result = await getSubcontractors(params);

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-page-title text-ink-900">Subcontractors</h1>
          <p className="text-body-sm text-ink-500">
            Everyone you outsource site work to, and every Site Contract you&apos;ve engaged them for
          </p>
        </div>
        <Link href="/subcontractors/new" className={cn(buttonVariants({ variant: "primary" }))}>
          <PlusIcon className="size-4" />
          Add Subcontractor
        </Link>
      </div>

      <SubcontractorsListClient
        rows={result.rows}
        total={result.total}
        page={result.page}
        pageSize={result.pageSize}
      />
    </>
  );
}
