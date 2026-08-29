import { authedFetch } from "@/lib/api";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { FeedItem } from "@azentisfieldos/shared";
import {
  Badge,
  CameraIcon,
  ClipboardIcon,
  DataTable,
  MapPinIcon,
  PencilIcon,
  buttonVariants,
  cn,
  type DataTableColumn,
} from "@azentisfieldos/ui";
import type { Site } from "../page";
import { FEED_TYPE_CONFIG } from "./feed-type-config";

interface SiteDetail extends Site {
  feed: FeedItem[];
}

async function getSiteDetail(id: string): Promise<SiteDetail | null> {
  const res = await authedFetch(`/sites/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to load Site (${res.status})`);
  }
  return res.json();
}

// FR-28's daily loop starts from the Site, not from a separate form:
// "Site → Today's DSR". If today's report exists, the action opens it;
// otherwise it deep-links the DSR form with this Site pre-selected.
async function getTodaysDsrId(siteId: string): Promise<string | null> {
  const today = new Date().toISOString().slice(0, 10);
  try {
    const res = await authedFetch(`/dsr?date=${today}`, { cache: "no-store" });
    if (!res.ok) return null;
    const reports = (await res.json()) as { id: string; site: { id: string } }[];
    return reports.find((report) => report.site.id === siteId)?.id ?? null;
  } catch {
    return null;
  }
}

const STATUS_BADGE: Record<Site["status"], { variant: "success" | "warning" | "neutral"; label: string }> = {
  ACTIVE: { variant: "success", label: "Active" },
  ON_HOLD: { variant: "warning", label: "On Hold" },
  COMPLETED: { variant: "neutral", label: "Completed" },
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

const feedColumns: DataTableColumn<FeedItem>[] = [
  { header: "Date", cell: (item) => <span className="text-ink-500">{formatDateTime(item.occurredAt)}</span> },
  {
    header: "Type",
    cell: (item) => {
      const config = FEED_TYPE_CONFIG[item.type];
      const Icon = config.icon;
      return (
        <Badge variant={config.badgeVariant} icon={<Icon />}>
          {config.label}
        </Badge>
      );
    },
  },
  { header: "Description", cell: (item) => item.summary },
  {
    header: "Amount",
    align: "right",
    cell: (item) =>
      item.amount !== null ? (
        <span className="font-semibold text-gold-700 tabular-nums">₹{item.amount.toLocaleString("en-IN")}</span>
      ) : (
        <span className="text-ink-500">—</span>
      ),
  },
];

export default async function SiteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [site, todaysDsrId] = await Promise.all([getSiteDetail(id), getTodaysDsrId(id)]);

  if (!site) {
    notFound();
  }

  const status = STATUS_BADGE[site.status];

  return (
    <>
      <div className="mb-2 text-eyebrow text-ink-500">
        <Link href="/sites" className="hover:text-accent-teal-700 hover:underline">
          Sites
        </Link>{" "}
        / {site.name}
      </div>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="mb-2 flex items-center gap-3 text-page-title text-ink-900">
            {site.name}
            <Badge variant={status.variant}>{status.label}</Badge>
          </h1>
          <div className="flex flex-wrap gap-4 text-body-sm text-ink-500">
            <span className="flex items-center gap-1.5">
              <MapPinIcon className="size-3.5" />
              {site.location}
            </span>
            {site.contractReference ? (
              <span className="flex items-center gap-1.5">
                <ClipboardIcon className="size-3.5" />
                Contract ref: {site.contractReference}
              </span>
            ) : null}
          </div>
          {site.description ? (
            <p className="mt-2 max-w-160 text-body-sm text-ink-700">{site.description}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Link
            href={todaysDsrId ? `/daily-activity/${todaysDsrId}` : `/dsr/new?siteId=${site.id}`}
            className={cn(buttonVariants({ variant: "primary" }))}
          >
            <ClipboardIcon className="size-4" />
            Today&apos;s DSR
          </Link>
          <Link href={`/sites/${site.id}/photos`} className={cn(buttonVariants({ variant: "secondary" }))}>
            <CameraIcon className="size-4" />
            Site Photos
          </Link>
          <Link href={`/sites/${site.id}/edit`} className={cn(buttonVariants({ variant: "secondary" }))}>
            <PencilIcon className="size-4" />
            Edit Site
          </Link>
        </div>
      </div>

      <div className="mb-4 text-section-header text-ink-900">Activity Feed</div>
      <DataTable
        columns={feedColumns}
        rowKey={(item) => item.id}
        state={
          site.feed.length === 0
            ? {
                status: "empty",
                icon: <ClipboardIcon />,
                message: "No activity logged yet for this Site.",
              }
            : { status: "success", rows: site.feed }
        }
      />
    </>
  );
}
