import { authedFetch } from "@/lib/api";
import { type ReactNode } from "react";
import Link from "next/link";
import { AdvanceQuickEntryTrigger } from "./advance-quick-entry-trigger";
import { DashboardSearchButton } from "./dashboard-search-button";
import { RecentlyViewedChips } from "./recently-viewed-chips";
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
  PlusIcon,
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
//
// Rendered only for OWNER_ADMIN — a Site Supervisor's landing surface is the
// task-first Supervisor Home (supervisor-home.tsx), not this rollup.
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

interface ExpenseSummary {
  totalThisMonth: number;
  totalThisWeek: number;
  largestCategoryThisMonth: { name: string; total: number } | null;
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
  const res = await authedFetch(`${path}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load ${path} (${res.status})`);
  }
  return res.json();
}

// The Money row is additive context on top of the core dashboard — a
// transient failure on one of its reads renders an honest "—" on that
// card, never an error page over the Today/Overall figures that did load.
async function getJSONSafe<T>(path: string): Promise<T | null> {
  try {
    return await getJSON<T>(path);
  } catch {
    return null;
  }
}

// Vendor money outstanding = the sum of every Vendor's "not marked Paid"
// purchase total — the exact per-Vendor figure the Vendors list shows
// (GET /vendors/:id/purchase-summary), summed. If any single summary
// fails, the total would silently under-report what's owed, so the whole
// figure degrades to null ("—") instead of a wrong number.
async function getVendorOutstandingTotal(): Promise<number | null> {
  const vendors = await getJSONSafe<{ id: string }[]>("/vendors");
  if (!Array.isArray(vendors)) return null;
  const summaries = await Promise.all(
    vendors.map((vendor) => getJSONSafe<{ notFullyPaidTotal: number }>(`/vendors/${vendor.id}/purchase-summary`)),
  );
  if (summaries.some((summary) => typeof summary?.notFullyPaidTotal !== "number")) return null;
  return summaries.reduce((total, summary) => total + (summary?.notFullyPaidTotal ?? 0), 0);
}

// Story 19.5: only ever called when the count is exactly 1 — fetches that
// single unpriced-original Purchase's id via the same `pendingPricing`
// filter countPendingPricing() counts, so the gap-flag can deep-link
// straight to its pricing page instead of the filtered Movements list.
// Same additive-context, degrades-to-null-silently pattern as the Vendor/D7
// reads above: a failed/malformed read just falls back to the filtered
// Movements view rather than breaking the page.
async function getPendingPricingPurchaseId(): Promise<string | null> {
  const purchases = await getJSONSafe<{ id: string }[]>("/purchases?pendingPricing=true");
  return Array.isArray(purchases) && purchases.length > 0 ? purchases[0]!.id : null;
}

export async function OwnerDashboard() {
  const [
    today,
    overall,
    sitesPreview,
    rawExpenseSummary,
    vendorOutstanding,
    pendingPricingCount,
    subcontractorOutstandingSummary,
    draftPendingTermsCount,
  ] = await Promise.all([
    getJSON<TodayActivity>("/dashboard/today"),
    getJSON<OverallRollup>("/dashboard/overall"),
    getJSON<SitePreview[]>("/dashboard/sites-preview"),
    getJSONSafe<ExpenseSummary>("/expenses/summary"),
    getVendorOutstandingTotal(),
    // D7: additive context like the Money row — degrades to null silently.
    getJSONSafe<number>("/purchases/count/pending-pricing"),
    // Epic 18 (Subcontractor Management): same additive-context,
    // degrades-to-null-silently pattern as the Vendor/D7 reads above.
    getJSONSafe<{ totalOutstanding: number }>("/site-contracts/outstanding-summary"),
    getJSONSafe<number>("/site-contracts/count/draft-pending-terms"),
  ]);
  // Story 19.5: only fire the extra read when it can actually be used —
  // exactly one pending Purchase. >1 or 0 skip it entirely and the gap-flag
  // (which doesn't render at all for 0) falls back to the filtered list.
  const pendingPricingPurchaseId =
    pendingPricingCount === 1 ? await getPendingPricingPurchaseId() : null;
  const pendingPricingHref =
    pendingPricingCount === 1 && pendingPricingPurchaseId
      ? `/movements/purchases/${pendingPricingPurchaseId}/pricing`
      : "/movements?type=PURCHASE_PENDING_PRICING";
  // Same honesty rule as the Vendors list: a malformed/missing summary is
  // "—", never NaN rendered as a rupee figure.
  const expenseSummary =
    typeof rawExpenseSummary?.totalThisMonth === "number" && typeof rawExpenseSummary?.totalThisWeek === "number"
      ? rawExpenseSummary
      : null;
  const subcontractorOutstanding =
    typeof subcontractorOutstandingSummary?.totalOutstanding === "number"
      ? subcontractorOutstandingSummary.totalOutstanding
      : null;

  // "How much money is currently tied up?" — Vendor purchases not marked
  // Paid, Labour advances still outstanding, and now Subcontractor
  // payables. Any unknown component ⇒ the whole total is unknown, never a
  // partial figure presented as the answer (same rule extended, not
  // relaxed, by this addition).
  const cashTiedUp =
    vendorOutstanding === null || subcontractorOutstanding === null
      ? null
      : vendorOutstanding + overall.outstandingAdvances.total + subcontractorOutstanding;

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
      <div className="mb-8 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-page-title text-ink-900">Dashboard</h1>
          <p className="text-body-sm text-ink-500">{heading} — overview across all sites</p>
        </div>
        {/* Story 19.3: the Owner's most frequent tasks in one row, so none
            of them require a sidebar detour first — "New Daily Report"
            stays the hero-primary action (simplicity review 2026-09-01);
            Record Payment/Add Purchase are plain navigation, Record
            Advance reuses 19.1's modal trigger unchanged, and the Search
            chip opens 19.2's singleton palette via app-shell.tsx's
            GlobalSearchContext (never a second controller instance). Uses
            the same action-button-row rule (story 19.7) as every other
            multi-button header on narrow viewports. */}
        <div className="action-button-row">
          <Link href="/dsr/new" className={cn(buttonVariants({ variant: "primary" }))}>
            <PlusIcon className="size-4" />
            New Daily Report
          </Link>
          <Link href="/payments/new" className={cn(buttonVariants({ variant: "secondary" }))}>
            <WalletIcon className="size-4" />
            Record Payment
          </Link>
          <AdvanceQuickEntryTrigger size="md" />
          <Link href="/movements/purchases/new" className={cn(buttonVariants({ variant: "secondary" }))}>
            <BoxIcon className="size-4" />
            Add Purchase
          </Link>
          <DashboardSearchButton />
        </div>
      </div>

      {/* Story 19.6: device-local "pick up where you left off" shortcuts —
          reads localStorage client-side, so it's a client island between
          the header block and Today (renders nothing when the list is
          empty, per Boundaries: Never an empty-state placeholder here). */}
      <RecentlyViewedChips />

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
              message={`${site.name} has not submitted a Daily Report yet today.`}
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

      {/* D7: inward entries recorded at the gate without pricing wait for the
          Owner here — an explicit count, never money figures silently short. */}
      {typeof pendingPricingCount === "number" && pendingPricingCount > 0 ? (
        <div className="mt-6">
          <GapFlag
            icon={<WalletIcon />}
            message={`${pendingPricingCount} inward ${pendingPricingCount === 1 ? "entry is" : "entries are"} waiting for pricing.`}
            action={
              <Link href={pendingPricingHref} className={cn(buttonVariants({ variant: "primary", size: "sm" }))}>
                <WalletIcon className="size-4" />
                Add Pricing
              </Link>
            }
          />
        </div>
      ) : null}

      {/* Same D7-shaped gap-flag for Site Contracts still Draft with
          missing commercial terms — never silently forgotten in a list. */}
      {typeof draftPendingTermsCount === "number" && draftPendingTermsCount > 0 ? (
        <div className="mt-6">
          <GapFlag
            icon={<UsersIcon />}
            message={`${draftPendingTermsCount} Site ${draftPendingTermsCount === 1 ? "Contract is" : "Contracts are"} still Draft, missing commercial terms.`}
            action={
              <Link href="/subcontractors" className={cn(buttonVariants({ variant: "primary", size: "sm" }))}>
                <UsersIcon className="size-4" />
                Review Subcontractors
              </Link>
            }
          />
        </div>
      ) : null}

      {/* Money — month spend, vendor dues, and the one tied-up-cash number,
          all from live reads that already exist (/expenses/summary and the
          Vendors list's per-Vendor purchase summaries). */}
      <h2 className="mt-10 mb-4 text-section-header text-ink-900">Money</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <OverallCard
          icon={<ReceiptIcon />}
          label="Expenses This Month"
          value={
            expenseSummary === null ? (
              <span className="text-ink-500">—</span>
            ) : (
              `₹${expenseSummary.totalThisMonth.toLocaleString("en-IN")}`
            )
          }
          meta={
            expenseSummary === null
              ? "Couldn't load right now"
              : `₹${expenseSummary.totalThisWeek.toLocaleString("en-IN")} this week${
                  expenseSummary.largestCategoryThisMonth
                    ? ` — largest: ${expenseSummary.largestCategoryThisMonth.name}`
                    : ""
                }`
          }
          link={{ href: "/expenses", label: "View Expenses" }}
        />
        <OverallCard
          icon={<BuildingIcon />}
          label="Vendor Outstanding"
          value={
            vendorOutstanding === null ? (
              <span className="text-ink-500">—</span>
            ) : (
              `₹${vendorOutstanding.toLocaleString("en-IN")}`
            )
          }
          meta={
            vendorOutstanding === null ? "Couldn't load right now" : "Purchases not yet marked Paid, across all Vendors"
          }
          link={{ href: "/vendors", label: "View Vendors" }}
        />
        <OverallCard
          icon={<UsersIcon />}
          label="Outstanding to Subcontractors"
          value={
            subcontractorOutstanding === null ? (
              <span className="text-ink-500">—</span>
            ) : (
              `₹${subcontractorOutstanding.toLocaleString("en-IN")}`
            )
          }
          meta={
            subcontractorOutstanding === null
              ? "Couldn't load right now"
              : "Across every Site Contract's payable minus paid"
          }
          link={{ href: "/subcontractors", label: "View Subcontractors" }}
        />
        <OverallCard
          icon={<WalletIcon />}
          label="Cash Tied Up"
          value={cashTiedUp === null ? <span className="text-ink-500">—</span> : `₹${cashTiedUp.toLocaleString("en-IN")}`}
          meta={
            cashTiedUp === null
              ? "Couldn't load right now"
              : "Vendor dues + Labour advances + Subcontractor payables still outstanding"
          }
        />
      </div>

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
          actions={<AdvanceQuickEntryTrigger />}
        />
        <OverallCard
          icon={<ReceiptIcon />}
          label="Pending Payments"
          value={overall.pendingPayments.count}
          meta="Payments recorded but not yet marked paid"
          link={{ href: "/payments", label: "View Payments" }}
        />
      </div>

      <div className="mt-10 mb-4 flex flex-wrap items-center justify-between gap-3">
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
                <div className="flex flex-wrap items-start justify-between gap-2">
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
  actions,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  meta: string;
  link?: { href: string; label: string };
  /** Extra client-side action (e.g. Story 19.1's "Record Advance" quick-entry
   * trigger) rendered alongside the drill-down link. */
  actions?: ReactNode;
}) {
  return (
    <Card className="flex h-full flex-col gap-2">
      <div className="flex items-center gap-2 text-caption font-semibold uppercase tracking-wide text-ink-500">
        <span className="[&>svg]:size-4">{icon}</span>
        {label}
      </div>
      <div className="text-kpi-numeral tabular-nums text-ink-900">{value}</div>
      <p className="text-body-sm text-ink-700">{meta}</p>
      {link || actions ? (
        <div className="mt-auto flex flex-wrap items-center gap-2">
          {link ? (
            <Link href={link.href} className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "self-start")}>
              {link.label}
              <ChevronRightIcon className="size-4" />
            </Link>
          ) : null}
          {actions}
        </div>
      ) : null}
    </Card>
  );
}
