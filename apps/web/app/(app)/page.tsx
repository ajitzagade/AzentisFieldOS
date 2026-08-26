import { type ReactNode } from "react";
import Link from "next/link";
import {
  AlertTriangleIcon,
  Badge,
  BoxIcon,
  BuildingIcon,
  Card,
  ChevronRightIcon,
  DropletIcon,
  EmptyState,
  GapFlag,
  LayersIcon,
  MapPinIcon,
  ReceiptIcon,
  StatTile,
  TruckIcon,
  UsersIcon,
  WalletIcon,
  buttonVariants,
  cn,
} from "@azentisfieldos/ui";

// Story 12.1 (SM-3, FR-35) + Story 12.2 (FR-34): the Owner/Admin Dashboard's
// cross-Site rollup. Every figure comes from apps/api's composition endpoints
// (apps/web never queries the DB directly — AD-3); each is a direct read from
// the epic that owns it, so it reconciles with its source screen by
// construction. A zero-activity day renders 0 on every tile, not an error
// (AD-6); a Tenant with no Sites at all gets one whole-page empty state
// (AC #1), never a wall of 0-valued tiles above an empty grid.
interface TodayActivity {
  sitesReportingToday: number;
  labourWorkingToday: number;
  materialsReceivedToday: number;
  materialsConsumedToday: number;
  rmcUsedTodayM3: number;
  machineryInUse: number;
  expensesToday: number;
  sitesMissingDsrToday: { siteId: string; name: string }[];
}

interface OverallRollup {
  activeSites: { count: number; names: string[] };
  inventory: { lowStockCount: number };
  outstandingAdvances: { total: number; teamMemberCount: number };
  pendingPayments: { count: number };
}

interface SitePreview {
  id: string;
  name: string;
  location: string;
  status: "ACTIVE" | "COMPLETED" | "ON_HOLD";
}

const SITE_STATUS_BADGE: Record<
  SitePreview["status"],
  { variant: "success" | "warning" | "neutral"; label: string }
> = {
  ACTIVE: { variant: "success", label: "Active" },
  ON_HOLD: { variant: "warning", label: "On Hold" },
  COMPLETED: { variant: "neutral", label: "Completed" },
};

async function getJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${process.env.API_URL}${path}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load ${path} (${res.status})`);
  }
  return res.json();
}

export default async function DashboardPage() {
  const [today, overall, sitesPreview] = await Promise.all([
    getJSON<TodayActivity>("/dashboard/today"),
    getJSON<OverallRollup>("/dashboard/overall"),
    getJSON<SitePreview[]>("/dashboard/sites-preview"),
  ]);

  const heading = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });

  // AC #1 (FR-34): the empty state is the whole-page state, not a per-tile one.
  // sitesPreview is drawn from the full Site roster, so its emptiness means
  // this Tenant has no Sites at all — the exact "zero Sites" AC #1 names.
  // Gate the entire Today/Overall/Sites layout behind this one check rather
  // than rendering seven 0-valued tiles and four 0-valued Overall cards above
  // an empty grid, which is precisely the broken-looking layout AC #1 rules
  // out.
  if (sitesPreview.length === 0) {
    return (
      <>
        <div className="mb-8">
          <h1 className="text-page-title text-ink-900">Dashboard</h1>
          <p className="text-body-sm text-ink-500">{heading}</p>
        </div>
        <EmptyState
          icon={<BuildingIcon />}
          message={
            <span>
              <span className="block text-section-header text-ink-900">No Sites yet</span>
              <span className="mt-2 block">
                Every report and figure on this Dashboard starts with your first Site.
              </span>
            </span>
          }
          action={
            <Link href="/sites/new" className={cn(buttonVariants({ variant: "primary" }))}>
              <MapPinIcon className="size-4" />
              Create your first Site
            </Link>
          }
        />
      </>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-page-title text-ink-900">Dashboard</h1>
        <p className="text-body-sm text-ink-500">{heading} — overview across all sites</p>
      </div>

      <h2 className="mb-4 text-section-header text-ink-900">Today</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        <StatTile
          icon={<MapPinIcon />}
          value={today.sitesReportingToday}
          label="Sites Reporting Today"
          href="/daily-activity"
        />
        <StatTile
          icon={<UsersIcon />}
          value={today.labourWorkingToday}
          label="Labour Working Today"
          href="/team"
        />
        <StatTile
          icon={<BoxIcon />}
          value={today.materialsReceivedToday}
          label="Materials Received Today"
          href="/movements"
        />
        <StatTile
          icon={<LayersIcon />}
          value={today.materialsConsumedToday}
          label="Materials Consumed Today"
          href="/movements"
        />
        <StatTile
          icon={<DropletIcon />}
          value={`${today.rmcUsedTodayM3.toLocaleString("en-IN")} m³`}
          label="RMC Used Today"
          href="/rmc"
        />
        <StatTile
          icon={<TruckIcon />}
          value={today.machineryInUse}
          label="Machinery In Use"
          href="/machinery-vehicles"
        />
        <StatTile
          icon={<ReceiptIcon />}
          value={`₹${today.expensesToday.toLocaleString("en-IN")}`}
          label="Expenses Today"
          tint="gold"
          href="/expenses"
        />
      </div>

      {today.sitesMissingDsrToday.length > 0 ? (
        // One GapFlag per missing Site — never a single flag naming all of
        // them at once (FR-35: "never a silent absence in a list").
        <div className="mt-6 flex flex-col gap-3">
          {today.sitesMissingDsrToday.map((site) => (
            <GapFlag
              key={site.siteId}
              icon={<AlertTriangleIcon />}
              message={`${site.name} has not submitted a Daily Site Report yet today.`}
              action={
                <Link
                  href={`/sites/${site.siteId}`}
                  className={cn(buttonVariants({ variant: "primary", size: "sm" }))}
                >
                  <MapPinIcon className="size-4" />
                  View Site
                </Link>
              }
            />
          ))}
        </div>
      ) : null}

      <h2 className="mt-10 mb-4 text-section-header text-ink-900">Overall</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <OverallCard
          icon={<BuildingIcon />}
          label="Active Sites"
          value={overall.activeSites.count}
          meta={
            overall.activeSites.names.length > 0
              ? overall.activeSites.names.join(", ")
              : "No active sites right now"
          }
        />
        <OverallCard
          icon={<BoxIcon />}
          label="Inventory Status"
          value={
            <>
              {overall.inventory.lowStockCount}{" "}
              <span className="text-body-sm font-semibold text-ink-500">materials low</span>
            </>
          }
          meta="Godown and site-wise stock across all sites"
          link={{ href: "/inventory", label: "View Inventory" }}
        />
        <OverallCard
          icon={<WalletIcon />}
          label="Outstanding Advances"
          value={`₹${overall.outstandingAdvances.total.toLocaleString("en-IN")}`}
          meta={`Across ${overall.outstandingAdvances.teamMemberCount} Team ${
            overall.outstandingAdvances.teamMemberCount === 1 ? "Member" : "Members"
          }`}
          link={{ href: "/payments", label: "View Payments" }}
        />
        <OverallCard
          icon={<ReceiptIcon />}
          label="Pending Payments"
          value={overall.pendingPayments.count}
          meta="Payments recorded but not yet marked paid"
          link={{ href: "/payments", label: "View Payments" }}
        />
      </div>

      <div className="mt-10 mb-4 flex items-center justify-between">
        <h2 className="text-section-header text-ink-900">Sites</h2>
        <Link href="/sites" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
          View all sites
          <ChevronRightIcon className="size-4" />
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {sitesPreview.map((site) => {
          const badge = SITE_STATUS_BADGE[site.status];
          return (
            <Link key={site.id} href={`/sites/${site.id}`} className="block">
              <Card interactive className="h-full">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-body font-semibold text-ink-900">{site.name}</h3>
                    <div className="mt-1 flex items-center gap-1.5 text-caption text-ink-500">
                      <MapPinIcon className="size-3.5 shrink-0" />
                      {site.location}
                    </div>
                  </div>
                  <Badge variant={badge.variant}>{badge.label}</Badge>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </>
  );
}

// A single Overall figure card — label, value, optional drill-down link. Built
// on the shared Card primitive (AD-5); the mockup's overall-grid shows three,
// this story's AC adds Pending Payments as a fourth (see Dev Notes).
function OverallCard({
  icon,
  label,
  value,
  meta,
  link,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  meta: string;
  link?: { href: string; label: string };
}) {
  return (
    <Card className="flex h-full flex-col gap-2">
      <div className="flex items-center gap-2 text-caption font-semibold uppercase tracking-wide text-ink-500">
        <span className="[&>svg]:size-4">{icon}</span>
        {label}
      </div>
      <div className="text-kpi-numeral tabular-nums text-ink-900">{value}</div>
      <p className="text-body-sm text-ink-700">{meta}</p>
      {link ? (
        <Link
          href={link.href}
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mt-auto self-start")}
        >
          {link.label}
          <ChevronRightIcon className="size-4" />
        </Link>
      ) : null}
    </Card>
  );
}
