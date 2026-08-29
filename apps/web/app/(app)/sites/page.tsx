import { authedFetch } from "@/lib/api";
import Link from "next/link";
import {
  Badge,
  CheckCircleIcon,
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
  description: string | null;
}

interface SiteRow extends Site {
  /** true = DSR submitted today, false = not yet, null = status unknown
   * (the DSR lookup failed — rendered as an honest "—", never "Not yet"). */
  dsrToday: boolean | null;
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

const columns: DataTableColumn<SiteRow>[] = [
  { header: "Site", cell: (site) => <span className="font-semibold">{site.name}</span> },
  { header: "Location", cell: (site) => site.location },
  {
    header: "Status",
    cell: (site) => {
      const badge = STATUS_BADGE[site.status];
      return <Badge variant={badge.variant}>{badge.label}</Badge>;
    },
  },
  {
    header: "DSR today",
    cell: (site) =>
      site.dsrToday === null ? (
        <span className="text-ink-500">—</span>
      ) : site.dsrToday ? (
        <Badge variant="success" icon={<CheckCircleIcon />}>
          Submitted
        </Badge>
      ) : (
        <span className="text-ink-500">Not yet</span>
      ),
  },
  {
    header: "Contract ref",
    cell: (site) => site.contractReference ?? <span className="text-ink-500">—</span>,
  },
];

export default async function SitesPage() {
  const [sites, reportedToday] = await Promise.all([getSites(), getTodaysReportedSiteIds()]);
  const rows: SiteRow[] = sites.map((site) => ({
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

      <DataTable
        columns={columns}
        rowKey={(site) => site.id}
        rowHref={(site) => `/sites/${site.id}`}
        state={
          rows.length === 0
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
            : { status: "success", rows }
        }
      />
    </>
  );
}
