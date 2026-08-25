import Link from "next/link";
import {
  AlertTriangleIcon,
  Badge,
  BarChart,
  BoxIcon,
  CheckCircleIcon,
  ClipboardIcon,
  Card,
  StatTile,
  UsersIcon,
  WalletIcon,
} from "@azentisfieldos/ui";

interface SiteRow {
  id: string;
  name: string;
  status: "ACTIVE" | "COMPLETED" | "ON_HOLD";
}

interface DsrRow {
  site: { id: string; name: string };
}

interface TeamSummary {
  totalTeamMembers: number;
  todaysWorkingHeadcount: number;
  weeklyPaymentTotal: number;
  monthlyPaymentTotal: number;
}

interface OutstandingAdvances {
  total: number;
  byTeamMember: { teamMemberId: string; name: string; outstandingAdvanceBalance: string }[];
}

interface LowStockItem {
  materialSize: { label: string; material: { name: string } };
  quantity: string;
}

interface GodownStockRow {
  quantity: string;
  materialSize: { material: { name: string; unit: { name: string } } };
}

async function getJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${process.env.API_URL}${path}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load ${path} (${res.status})`);
  }
  return res.json();
}

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

export default async function DashboardPage() {
  const date = todayDate();
  const [sites, todaysReports, teamSummary, outstandingAdvances, lowStock, purchasesThisMonth, pendingPayments, godownStock] =
    await Promise.all([
      getJSON<SiteRow[]>("/sites"),
      getJSON<DsrRow[]>(`/dsr?date=${date}`),
      getJSON<TeamSummary>("/team-members/team-summary"),
      getJSON<OutstandingAdvances>("/team-members/outstanding-advances"),
      getJSON<LowStockItem[]>("/stock/low-stock"),
      getJSON<number>("/purchases/count/this-month"),
      getJSON<number>("/payments/count/pending"),
      getJSON<GodownStockRow[]>("/stock/godown"),
    ]);

  const activeSites = sites.filter((s) => s.status === "ACTIVE");
  const reportedSiteIds = new Set(todaysReports.map((r) => r.site.id));
  const notReported = activeSites.filter((s) => !reportedSiteIds.has(s.id));

  const advanceChartRows = outstandingAdvances.byTeamMember
    .filter((m) => Number(m.outstandingAdvanceBalance) > 0)
    .map((m) => ({
      label: m.name,
      value: Number(m.outstandingAdvanceBalance),
      displayValue: `₹${Number(m.outstandingAdvanceBalance).toLocaleString("en-IN")}`,
    }));

  const stockByMaterial = new Map<string, { quantity: number; unit: string }>();
  for (const row of godownStock) {
    const key = row.materialSize.material.name;
    const existing = stockByMaterial.get(key);
    stockByMaterial.set(key, {
      quantity: (existing?.quantity ?? 0) + Number(row.quantity),
      unit: row.materialSize.material.unit.name,
    });
  }
  const stockChartRows = Array.from(stockByMaterial.entries())
    .map(([label, { quantity, unit }]) => ({ label, value: quantity, displayValue: `${quantity} ${unit}` }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  return (
    <>
      <div className="mb-8">
        <h1 className="text-page-title text-ink-900">Dashboard</h1>
        <p className="text-body-sm text-ink-500">
          {new Date(date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatTile
          icon={<ClipboardIcon />}
          value={`${todaysReports.length}/${activeSites.length}`}
          label="Sites reported today"
          tint={notReported.length === 0 ? "success" : "gold"}
          href="/daily-activity"
        />
        <StatTile icon={<CheckCircleIcon />} value={activeSites.length} label="Active sites" tint="teal" href="/sites" />
        <StatTile
          icon={<UsersIcon />}
          value={`${teamSummary.todaysWorkingHeadcount}/${teamSummary.totalTeamMembers}`}
          label="Crew on site today"
          tint="teal"
          href="/team"
        />
        <StatTile
          icon={<WalletIcon />}
          value={`₹${outstandingAdvances.total.toLocaleString("en-IN")}`}
          label="Outstanding advances"
          tint={outstandingAdvances.total > 0 ? "gold" : "success"}
          href="/payments"
        />
        <StatTile
          icon={<BoxIcon />}
          value={purchasesThisMonth}
          label="Purchases this month"
          tint="teal"
          href="/inventory"
        />
        <StatTile
          icon={<AlertTriangleIcon />}
          value={lowStock.length}
          label="Low stock alerts"
          tint={lowStock.length > 0 ? "danger" : "success"}
          href="/inventory"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-card-title text-ink-900">Today&apos;s reporting</h2>
            <Link href="/daily-activity" className="text-caption font-semibold text-accent-teal-700 hover:underline">
              View all →
            </Link>
          </div>
          {activeSites.length === 0 ? (
            <p className="text-body-sm text-ink-500">No active Sites yet.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {activeSites.map((site) => (
                <li key={site.id} className="flex items-center justify-between border-b border-border-hairline py-2 last:border-b-0">
                  <span className="text-body-sm font-medium text-ink-900">{site.name}</span>
                  {reportedSiteIds.has(site.id) ? (
                    <Badge variant="success" icon={<CheckCircleIcon />}>
                      Submitted
                    </Badge>
                  ) : (
                    <Badge variant="neutral">Not submitted</Badge>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-card-title text-ink-900">Advances outstanding</h2>
            <Link href="/payments" className="text-caption font-semibold text-accent-teal-700 hover:underline">
              View all →
            </Link>
          </div>
          {advanceChartRows.length === 0 ? (
            <p className="text-body-sm text-ink-500">No outstanding advances — everyone&apos;s settled up.</p>
          ) : (
            <BarChart rows={advanceChartRows} tint="gold" />
          )}
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-card-title text-ink-900">Godown stock on hand</h2>
            <Link href="/inventory" className="text-caption font-semibold text-accent-teal-700 hover:underline">
              View all →
            </Link>
          </div>
          {stockChartRows.length === 0 ? (
            <p className="text-body-sm text-ink-500">No stock in the godown right now.</p>
          ) : (
            <BarChart rows={stockChartRows} tint="teal" />
          )}
        </Card>
      </div>

      {pendingPayments > 0 ? (
        <p className="mt-6 text-caption text-ink-500">
          <Link href="/payments" className="font-semibold text-accent-teal-700 hover:underline">
            {pendingPayments} payment{pendingPayments === 1 ? "" : "s"}
          </Link>{" "}
          not yet marked paid.
        </p>
      ) : null}
    </>
  );
}
