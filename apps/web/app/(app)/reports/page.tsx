import { BarChart, BoxIcon, Card, TruckIcon, UsersIcon, WalletIcon } from "@azentisfieldos/ui";

interface GodownStockRow {
  quantity: string;
  materialSize: { label: string; material: { name: string; unit: { name: string } } };
}
interface PurchaseRow {
  totalAmount: string;
  paymentStatus: "PAID" | "PARTIAL" | "UNPAID";
  purchasedAt: string;
}
interface RmcRow {
  totalAmount: string;
  deliveredAt: string;
}
interface ExpenseRow {
  amount: string;
  incurredAt: string;
}
interface MachineryRow {
  name: string;
  assetNumber: string;
  currentStatus: "AVAILABLE" | "AT_SITE" | "MAINTENANCE";
  currentSite: { name: string } | null;
  type: { name: string };
}
interface VehicleRow {
  number: string;
  currentStatus: "AVAILABLE" | "AT_SITE" | "MAINTENANCE";
  currentSite: { name: string } | null;
  type: { name: string };
}
interface TeamSummary {
  totalTeamMembers: number;
  todaysWorkingHeadcount: number;
  monthlyPaymentTotal: number;
}

async function getJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${process.env.API_URL}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load ${path} (${res.status})`);
  return res.json();
}

function isThisMonth(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

function statusTint(status: "AVAILABLE" | "AT_SITE" | "MAINTENANCE") {
  if (status === "AT_SITE") return "text-accent-teal-700 bg-accent-teal-100";
  if (status === "MAINTENANCE") return "text-danger-700 bg-danger-100";
  return "text-ink-500 bg-surface-2";
}

export default async function ReportsPage() {
  const [godownStock, purchases, rmcEntries, expenses, machinery, vehicles, teamSummary] = await Promise.all([
    getJSON<GodownStockRow[]>("/stock/godown"),
    getJSON<PurchaseRow[]>("/purchases"),
    getJSON<RmcRow[]>("/rmc-entries"),
    getJSON<ExpenseRow[]>("/expenses"),
    getJSON<MachineryRow[]>("/machinery"),
    getJSON<VehicleRow[]>("/vehicles"),
    getJSON<TeamSummary>("/team-members/team-summary"),
  ]);

  const purchasesThisMonth = purchases.filter((p) => isThisMonth(p.purchasedAt));
  const purchaseSpendThisMonth = purchasesThisMonth.reduce((s, p) => s + Number(p.totalAmount), 0);
  const unpaidTotal = purchases
    .filter((p) => p.paymentStatus !== "PAID")
    .reduce((s, p) => s + Number(p.totalAmount), 0);
  const rmcSpendThisMonth = rmcEntries
    .filter((r) => isThisMonth(r.deliveredAt))
    .reduce((s, r) => s + Number(r.totalAmount), 0);
  const expenseSpendThisMonth = expenses
    .filter((e) => isThisMonth(e.incurredAt))
    .reduce((s, e) => s + Number(e.amount), 0);
  const totalSpendThisMonth = purchaseSpendThisMonth + rmcSpendThisMonth + expenseSpendThisMonth;

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
    .sort((a, b) => b.value - a.value);

  const spendChartRows = [
    { label: "Purchases", value: purchaseSpendThisMonth, displayValue: `₹${purchaseSpendThisMonth.toLocaleString("en-IN")}` },
    { label: "RMC", value: rmcSpendThisMonth, displayValue: `₹${rmcSpendThisMonth.toLocaleString("en-IN")}` },
    { label: "Expenses", value: expenseSpendThisMonth, displayValue: `₹${expenseSpendThisMonth.toLocaleString("en-IN")}` },
  ].sort((a, b) => b.value - a.value);

  return (
    <>
      <div className="mb-8">
        <h1 className="text-page-title text-ink-900">Reports</h1>
        <p className="text-body-sm text-ink-500">
          Site inventory, labour &amp; machinery, and financial summaries — computed live from current records.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Site Inventory */}
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <BoxIcon className="size-4 text-accent-teal-700" />
            <h2 className="text-card-title text-ink-900">Site Inventory — Godown Stock</h2>
          </div>
          {godownStock.length === 0 ? (
            <p className="text-body-sm text-ink-500">No stock in the godown right now.</p>
          ) : (
            <>
            <BarChart rows={stockChartRows} tint="teal" className="mb-5" />
            <div className="overflow-x-auto">
              <table className="w-full text-body-sm">
                <thead>
                  <tr className="border-b border-border-hairline text-left text-eyebrow uppercase text-ink-500">
                    <th className="py-2 pr-4">Material</th>
                    <th className="py-2 pr-4">Size</th>
                    <th className="py-2 text-right">Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {godownStock.map((row) => (
                    <tr key={`${row.materialSize.material.name}-${row.materialSize.label}`} className="border-b border-border-hairline last:border-b-0">
                      <td className="py-2 pr-4 font-medium text-ink-900">{row.materialSize.material.name}</td>
                      <td className="py-2 pr-4 text-ink-700">{row.materialSize.label}</td>
                      <td className="py-2 text-right tabular-nums">
                        {row.quantity} {row.materialSize.material.unit.name}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </>
          )}
        </Card>

        {/* Labour & Machinery */}
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <UsersIcon className="size-4 text-accent-teal-700" />
            <h2 className="text-card-title text-ink-900">Labour &amp; Machinery</h2>
          </div>
          <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <div className="text-kpi-numeral tabular-nums text-ink-900">{teamSummary.totalTeamMembers}</div>
              <div className="text-caption text-ink-500">Team members</div>
            </div>
            <div>
              <div className="text-kpi-numeral tabular-nums text-ink-900">{teamSummary.todaysWorkingHeadcount}</div>
              <div className="text-caption text-ink-500">Working today</div>
            </div>
            <div>
              <div className="text-kpi-numeral tabular-nums text-ink-900">{machinery.length}</div>
              <div className="text-caption text-ink-500">Machinery units</div>
            </div>
            <div>
              <div className="text-kpi-numeral tabular-nums text-ink-900">{vehicles.length}</div>
              <div className="text-caption text-ink-500">Vehicles</div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {[...machinery.map((m) => ({ label: m.name, sub: m.type.name, status: m.currentStatus, site: m.currentSite })),
              ...vehicles.map((v) => ({ label: v.number, sub: v.type.name, status: v.currentStatus, site: v.currentSite }))]
              .map((asset) => (
                <div key={`${asset.label}-${asset.sub}`} className="flex items-center justify-between border-b border-border-hairline py-2 last:border-b-0">
                  <div>
                    <span className="text-body-sm font-medium text-ink-900">{asset.label}</span>
                    <span className="ml-2 text-caption text-ink-500">{asset.sub}</span>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-caption font-semibold ${statusTint(asset.status)}`}>
                    {asset.status === "AT_SITE" && asset.site ? asset.site.name : asset.status.replace("_", " ")}
                  </span>
                </div>
              ))}
          </div>
        </Card>

        {/* Financial */}
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <WalletIcon className="size-4 text-accent-teal-700" />
            <h2 className="text-card-title text-ink-900">Financial Summary — This Month</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <div className="text-kpi-numeral tabular-nums text-ink-900">₹{totalSpendThisMonth.toLocaleString("en-IN")}</div>
              <div className="text-caption text-ink-500">Total spend</div>
            </div>
            <div>
              <div className="text-kpi-numeral tabular-nums text-ink-900">₹{purchaseSpendThisMonth.toLocaleString("en-IN")}</div>
              <div className="text-caption text-ink-500">Material purchases ({purchasesThisMonth.length})</div>
            </div>
            <div>
              <div className="text-kpi-numeral tabular-nums text-ink-900">₹{rmcSpendThisMonth.toLocaleString("en-IN")}</div>
              <div className="text-caption text-ink-500">RMC deliveries</div>
            </div>
            <div>
              <div className="text-kpi-numeral tabular-nums text-gold-700">₹{unpaidTotal.toLocaleString("en-IN")}</div>
              <div className="text-caption text-ink-500">Unpaid to vendors</div>
            </div>
          </div>
          {totalSpendThisMonth > 0 ? (
            <div className="mt-6 border-t border-border-hairline pt-5">
              <div className="mb-3 text-eyebrow uppercase text-ink-500">Spend breakdown</div>
              <BarChart rows={spendChartRows} tint="gold" />
            </div>
          ) : null}
        </Card>
      </div>

      <p className="mt-6 flex items-center gap-2 text-caption text-ink-500">
        <TruckIcon className="size-3.5 shrink-0" />
        These are live computed summaries, not scheduled/auto-delivered reports — Automated Report Generation &amp;
        Delivery is planned separately.
      </p>
    </>
  );
}
