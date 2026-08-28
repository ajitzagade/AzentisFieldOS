import { authedFetch } from "@/lib/api";
import Link from "next/link";
import {
  Badge,
  DataTable,
  MapPinIcon,
  PlusIcon,
  buttonVariants,
  cn,
  type DataTableColumn,
} from "@azentisfieldos/ui";

export interface Site {
  id: string;
  name: string;
  location: string;
  status: "ACTIVE" | "COMPLETED" | "ON_HOLD";
  contractReference: string | null;
}

const STATUS_BADGE: Record<Site["status"], { variant: "success" | "warning" | "neutral"; label: string }> = {
  ACTIVE: { variant: "success", label: "Active" },
  ON_HOLD: { variant: "warning", label: "On Hold" },
  COMPLETED: { variant: "neutral", label: "Completed" },
};

async function getSites(): Promise<Site[]> {
  const res = await authedFetch(`/sites`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load sites (${res.status})`);
  }
  return res.json();
}

const columns: DataTableColumn<Site>[] = [
  { header: "Site", cell: (site) => <span className="font-semibold">{site.name}</span> },
  { header: "Location", cell: (site) => site.location },
  {
    header: "Status",
    cell: (site) => {
      const badge = STATUS_BADGE[site.status];
      return <Badge variant={badge.variant}>{badge.label}</Badge>;
    },
  },
  // Last DSR activity isn't wired yet — no DSR data exists until Epic 3
  // ships. Kept as a column (matching mockups/02-sites.html's layout) with
  // an honest "not available yet" placeholder rather than fabricated data.
  { header: "Last DSR activity", cell: () => <span className="text-ink-500">—</span> },
  {
    header: "Contract ref",
    cell: (site) => site.contractReference ?? <span className="text-ink-500">—</span>,
  },
];

export default async function SitesPage() {
  const sites = await getSites();

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

      <DataTable
        columns={columns}
        rowKey={(site) => site.id}
        rowHref={(site) => `/sites/${site.id}`}
        state={
          sites.length === 0
            ? {
                status: "empty",
                icon: <MapPinIcon />,
                message: "No Sites yet.",
                action: (
                  <Link href="/sites/new" className={cn(buttonVariants({ variant: "primary" }))}>
                    <PlusIcon className="size-4" />
                    Create your first Site
                  </Link>
                ),
              }
            : { status: "success", rows: sites }
        }
      />
    </>
  );
}
