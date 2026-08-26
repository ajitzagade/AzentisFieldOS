import Link from "next/link";
import {
  AlertTriangleIcon,
  BoxIcon,
  DropletIcon,
  GapFlag,
  LayersIcon,
  MapPinIcon,
  ReceiptIcon,
  StatTile,
  TruckIcon,
  UsersIcon,
  buttonVariants,
  cn,
} from "@azentisfieldos/ui";

// Story 12.1 (SM-3, FR-35): the Owner/Admin Dashboard's cross-Site "Today"
// rollup. Every figure is a same-day aggregate from GET /dashboard/today
// (apps/api owns the timezone-correct day boundary — AD-3, apps/web never
// queries the DB directly). A zero-activity day renders 0 on every tile, not
// an error (AD-6). Story 12.2 owns the explicit zero-Site empty state for the
// page as a whole.
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

async function getJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${process.env.API_URL}${path}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load ${path} (${res.status})`);
  }
  return res.json();
}

export default async function DashboardPage() {
  const today = await getJSON<TodayActivity>("/dashboard/today");

  const heading = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });

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
    </>
  );
}
