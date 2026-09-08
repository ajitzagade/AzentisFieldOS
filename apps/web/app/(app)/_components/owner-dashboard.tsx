import { authedFetch } from "@/lib/api";
import { type ReactNode } from "react";
import Link from "next/link";
import { AdvanceQuickEntryTrigger } from "./advance-quick-entry-trigger";
import { DashboardSearchButton } from "./dashboard-search-button";
import { RecentlyViewedChips } from "./recently-viewed-chips";
import { SiteOperationsTable, type SiteBreakdown } from "./site-operations-table";
import {
  AlertTriangleIcon,
  BoxIcon,
  BuildingIcon,
  Card,
  ChevronRightIcon,
  EmptyState,
  GapFlag,
  GapFlagList,
  MapPinIcon,
  PlusIcon,
  ReceiptIcon,
  Sparkline,
  UsersIcon,
  WalletIcon,
  buttonVariants,
  cn,
} from "@azentisfieldos/ui";

// Story 12.1 (SM-3, FR-35) + Story 12.2 (FR-34), recomposed 2026-09-08 as
// the approved "Command Center" (mockup 26-owner-dashboard-command-center):
// one navy instrument band (date, quick actions, seven Today KPIs with
// 7-day sparklines on the three trended ones), a ranked "Needs your
// attention" queue, the per-Site operations table, an inline low-stock
// strip, and a Money strip anchored by Cash Tied Up. Every figure still
// comes from apps/api's composition endpoints (apps/web never queries the
// DB directly — AD-3); each is a direct read from the epic that owns it,
// so it reconciles with its source screen by construction. A Tenant with
// no Sites at all gets one whole-page empty state (AC #1), never a wall of
// 0-valued tiles.
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

// GET /dashboard/trends — 7 local days, oldest first, today last; feeds the
// band's three sparklines.
interface TrendDay {
  date: string;
  sitesReporting: number;
  labourWorking: number;
  expensesTotal: number;
}

// GET /stock/low-stock (Story 5.7's existing endpoint) — quantities travel
// as strings (Decimal-safe), formatted here for display.
interface LowStockMaterial {
  id: string;
  name: string;
  unit: { name: string };
  godownQuantity: string;
}

// A 30-material tenant must not get a wall of chips — show the first few
// and fold the rest into a "+N more" on the Inventory link.
const LOW_STOCK_CHIP_LIMIT = 6;

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
// The same rule covers the band's sparklines (KPIs render without them)
// and the Site operations table (shared DataTable error state).
async function getJSONSafe<T>(path: string): Promise<T | null> {
  try {
    return await getJSON<T>(path);
  } catch {
    return null;
  }
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

// On-navy button restyles: className overrides on the shared buttonVariants
// output (AD-5 — never a new Button variant for this one surface). The
// band is theme-constant navy, so these pairs hold WCAG AA in both themes.
const onNavySecondaryClass =
  "border-navy-panel-border bg-transparent text-ink-on-navy hover:bg-navy-panel hover:border-ink-on-navy-faint hover:text-ink-on-navy";
const onNavyGhostClass =
  "border border-navy-panel-border text-ink-on-navy-muted hover:bg-navy-panel hover:text-ink-on-navy";

export async function OwnerDashboard() {
  const [
    today,
    overall,
    sitesPreview,
    rawExpenseSummary,
    rawVendorOutstanding,
    pendingPricingCount,
    subcontractorOutstandingSummary,
    draftPendingTermsCount,
    rawTrends,
    siteBreakdown,
    rawLowStock,
  ] = await Promise.all([
    getJSON<TodayActivity>("/dashboard/today"),
    getJSON<OverallRollup>("/dashboard/overall"),
    getJSON<SitePreview[]>("/dashboard/sites-preview"),
    getJSONSafe<ExpenseSummary>("/expenses/summary"),
    // Vendor money outstanding — one DB-side groupBy aggregate
    // (PurchasesService.outstandingAcrossVendors), not one HTTP round trip
    // per Vendor. Same additive-context, degrades-to-null-silently pattern
    // as the Subcontractor read below.
    getJSONSafe<{ totalOutstanding: number }>("/purchases/outstanding-summary"),
    // D7: additive context like the Money row — degrades to null silently.
    getJSONSafe<number>("/purchases/count/pending-pricing"),
    // Epic 18 (Subcontractor Management): same additive-context,
    // degrades-to-null-silently pattern as the Vendor/D7 reads above.
    getJSONSafe<{ totalOutstanding: number }>("/site-contracts/outstanding-summary"),
    getJSONSafe<number>("/site-contracts/count/draft-pending-terms"),
    // Command Center additions — both additive context: a failed trends
    // read drops the sparklines, a failed breakdown read degrades the Site
    // operations table to its shared error state; nothing else moves.
    getJSONSafe<{ days: TrendDay[] }>("/dashboard/trends"),
    getJSONSafe<SiteBreakdown>("/dashboard/site-breakdown"),
    getJSONSafe<LowStockMaterial[]>("/stock/low-stock"),
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
  const vendorOutstanding =
    typeof rawVendorOutstanding?.totalOutstanding === "number"
      ? rawVendorOutstanding.totalOutstanding
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

  // Sparkline series — only when the trends read produced a well-formed
  // 7-day array (a truncated body would render a misleading short trend);
  // otherwise the KPIs simply render without sparklines.
  const trendDays =
    rawTrends !== null &&
    Array.isArray(rawTrends.days) &&
    rawTrends.days.length === 7 &&
    rawTrends.days.every(
      (day) =>
        typeof day?.sitesReporting === "number" &&
        typeof day?.labourWorking === "number" &&
        typeof day?.expensesTotal === "number",
    )
      ? rawTrends.days
      : null;

  // Same malformed-body guard for the low-stock strip: a bad read omits the
  // strip entirely (it's additive context, not a core figure).
  const lowStock = Array.isArray(rawLowStock)
    ? rawLowStock.filter(
        (material) =>
          typeof material?.id === "string" &&
          typeof material?.name === "string" &&
          typeof material?.godownQuantity === "string" &&
          typeof material?.unit?.name === "string",
      )
    : [];
  const lowStockShown = lowStock.slice(0, LOW_STOCK_CHIP_LIMIT);
  const lowStockOverflow = lowStock.length - lowStockShown.length;

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
  // Gate the entire layout behind this one check rather than rendering a
  // 0-valued instrument band above an empty table, which is precisely the
  // broken-looking layout AC #1 rules out.
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

  const hasAttention =
    today.sitesMissingDsrToday.length > 0 ||
    (typeof pendingPricingCount === "number" && pendingPricingCount > 0) ||
    (typeof draftPendingTermsCount === "number" && draftPendingTermsCount > 0);

  return (
    <>
      {/* ---- Navy hero band — the one sanctioned dark surface on a light
          page (DESIGN.md "Dashboard hero band", 2026-09-08). Theme-constant
          like the sidebar: accent-navy-800 and every on-navy token keep one
          value in both themes. ---- */}
      <section className="mb-8 rounded-xl bg-accent-navy-800 p-5 shadow-3 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            {/* The page identity is the eyebrow; the date is the visual
                hero — the Owner opens this page asking "what happened
                today?", not "what page is this?". (Keeps the e2e
                "Dashboard"-containing accessible heading.) */}
            <h1 className="text-eyebrow uppercase text-sparkline-on-navy">Owner Dashboard</h1>
            <p className="mt-1 text-page-title text-white">{heading}</p>
            <p className="mt-1 text-body-sm text-ink-on-navy-muted">
              Overview across all sites — {overall.activeSites.count} active{" "}
              {overall.activeSites.count === 1 ? "Site" : "Sites"} + Godown
            </p>
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
            <Link
              href="/payments/new"
              className={cn(buttonVariants({ variant: "secondary" }), onNavySecondaryClass)}
            >
              <WalletIcon className="size-4" />
              Employee Payment
            </Link>
            <AdvanceQuickEntryTrigger size="md" className={onNavySecondaryClass} />
            <Link
              href="/movements/purchases/new"
              className={cn(buttonVariants({ variant: "secondary" }), onNavySecondaryClass)}
            >
              <BoxIcon className="size-4" />
              Add Purchase
            </Link>
            <DashboardSearchButton className={onNavyGhostClass} />
          </div>
        </div>

        <h2 className="mt-6 mb-3 text-eyebrow uppercase text-ink-on-navy-faint">{"Today's Pulse"}</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
          <BandKpi
            label="Sites Reporting"
            href="/daily-activity"
            value={
              <>
                {today.sitesReportingToday}{" "}
                <span className="text-body-sm font-semibold text-ink-on-navy-muted">
                  of {overall.activeSites.count}
                </span>
              </>
            }
            spark={trendDays?.map((day) => day.sitesReporting)}
          />
          <BandKpi
            label="Labour Working"
            href="/team"
            value={today.labourWorkingToday}
            spark={trendDays?.map((day) => day.labourWorking)}
          />
          <BandKpi
            label="Materials Received"
            href="/movements"
            value={today.materialsReceivedToday}
            note={
              typeof pendingPricingCount === "number" && pendingPricingCount > 0
                ? `${pendingPricingCount} awaiting pricing`
                : undefined
            }
          />
          <BandKpi label="Materials Consumed" href="/movements" value={today.materialsConsumedToday} />
          <BandKpi
            label="RMC Used"
            href="/rmc"
            value={`${today.rmcUsedTodayM3.toLocaleString("en-IN")} m³`}
          />
          <BandKpi label="Machinery In Use" href="/machinery-vehicles" value={today.machineryInUse} />
          <BandKpi
            label="Expenses Today"
            href="/expenses"
            money
            value={`₹${today.expensesToday.toLocaleString("en-IN")}`}
            spark={trendDays?.map((day) => day.expensesTotal)}
          />
        </div>
      </section>

      {/* ---- Needs your attention — every flag inline and individually
          actionable, exact same strings and links as before the redesign. ---- */}
      {hasAttention ? (
        <section className="mb-8">
          <h2 className="mb-4 text-section-header text-ink-900">Needs your attention</h2>
          <div className="flex flex-col gap-3">
            {today.sitesMissingDsrToday.length > 0 ? (
              /* One GapFlag per missing Site — never a single flag naming all
                 of them at once (FR-35: "never a silent absence in a list").
                 Below GapFlagList's threshold every flag still renders
                 inline; above it they fold behind a defaults-open summary
                 line so a Tenant with many Sites doesn't get a wall of
                 warning rows — each Site is still individually named and
                 actionable once expanded. */
              <GapFlagList
                count={today.sitesMissingDsrToday.length}
                summary={`${today.sitesMissingDsrToday.length} sites have not submitted a Daily Report yet today`}
              >
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
              </GapFlagList>
            ) : null}

            {/* D7: inward entries recorded at the gate without pricing wait
                for the Owner here — an explicit count, never money figures
                silently short. */}
            {typeof pendingPricingCount === "number" && pendingPricingCount > 0 ? (
              <GapFlag
                icon={<WalletIcon />}
                message={`${pendingPricingCount} inward ${pendingPricingCount === 1 ? "entry is" : "entries are"} waiting for pricing.`}
                action={
                  <Link
                    href={pendingPricingHref}
                    className={cn(buttonVariants({ variant: "primary", size: "sm" }))}
                  >
                    <WalletIcon className="size-4" />
                    Add Pricing
                  </Link>
                }
              />
            ) : null}

            {/* Same D7-shaped gap-flag for Site Contracts still Draft with
                missing commercial terms — never silently forgotten in a list. */}
            {typeof draftPendingTermsCount === "number" && draftPendingTermsCount > 0 ? (
              <GapFlag
                icon={<UsersIcon />}
                message={`${draftPendingTermsCount} Site ${draftPendingTermsCount === 1 ? "Contract is" : "Contracts are"} still Draft, missing commercial terms.`}
                action={
                  <Link
                    href="/subcontractors"
                    className={cn(buttonVariants({ variant: "primary", size: "sm" }))}
                  >
                    <UsersIcon className="size-4" />
                    Review Subcontractors
                  </Link>
                }
              />
            ) : null}
          </div>
        </section>
      ) : null}

      {/* ---- Per-site operations — what the flat tile wall never showed:
          today's reality Site by Site, reconciling to the band's totals. ---- */}
      <section className="mb-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-section-header text-ink-900">Site operations</h2>
          <Link href="/sites" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
            View all sites
            <ChevronRightIcon className="size-4" />
          </Link>
        </div>
        <SiteOperationsTable breakdown={siteBreakdown} labourToday={today.labourWorkingToday} />
      </section>

      {/* ---- Low-stock strip — inline restock context from the existing
          Story 5.7 endpoint; omitted entirely when nothing is low (or the
          read failed — additive context, never a false all-clear panel). ---- */}
      {lowStock.length > 0 ? (
        <section className="mb-8">
          <Card className="flex flex-wrap items-center gap-3 p-4">
            <span className="flex items-center gap-2 text-body-sm font-semibold text-warning-700">
              <AlertTriangleIcon className="size-4 shrink-0" aria-hidden />
              {lowStock.length} {lowStock.length === 1 ? "material" : "materials"} low
            </span>
            {lowStockShown.map((material) => (
              <span
                key={material.id}
                className="rounded-full border border-border-hairline bg-surface-2 px-3 py-0.5 text-caption text-ink-700"
              >
                <span className="font-semibold text-ink-900">{material.name}</span> —{" "}
                {formatQuantity(material.godownQuantity)} {material.unit.name}
              </span>
            ))}
            <Link
              href="/inventory"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "ms-auto")}
            >
              {lowStockOverflow > 0 ? `+${lowStockOverflow} more · ` : ""}View Inventory
              <ChevronRightIcon className="size-4" />
            </Link>
          </Card>
        </section>
      ) : null}

      {/* ---- Money — month spend, vendor dues, subcontractor payables, and
          the one Cash Tied Up number the strip leads to. Outstanding
          Advances and Pending Payments fold into the Cash Tied Up card
          (its meta names every component), keeping the /payments link and
          the Record Advance quick entry reachable right there. ---- */}
      <section className="mb-8">
        <h2 className="mb-4 text-section-header text-ink-900">Money</h2>
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
              vendorOutstanding === null
                ? "Couldn't load right now"
                : `Purchases not yet marked Paid, across all Vendors${
                    typeof pendingPricingCount === "number" && pendingPricingCount > 0
                      ? ` · excludes ${pendingPricingCount} ${
                          pendingPricingCount === 1 ? "entry" : "entries"
                        } pending pricing`
                      : ""
                  }`
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
            emphasis
            icon={<WalletIcon />}
            label="Cash Tied Up"
            value={cashTiedUp === null ? <span className="text-ink-500">—</span> : `₹${cashTiedUp.toLocaleString("en-IN")}`}
            meta={
              cashTiedUp === null
                ? "Couldn't load right now"
                : `Vendor dues ₹${vendorOutstanding!.toLocaleString("en-IN")} + Outstanding Advances ₹${overall.outstandingAdvances.total.toLocaleString(
                    "en-IN",
                  )} (${overall.outstandingAdvances.teamMemberCount} Team ${
                    overall.outstandingAdvances.teamMemberCount === 1 ? "Member" : "Members"
                  }) + Subcontractor payables ₹${subcontractorOutstanding!.toLocaleString("en-IN")} · ${
                    overall.pendingPayments.count
                  } Pending ${overall.pendingPayments.count === 1 ? "Payment" : "Payments"}`
            }
            link={{ href: "/payments", label: "View Payments" }}
            actions={<AdvanceQuickEntryTrigger />}
          />
        </div>
      </section>

      {/* Story 19.6: device-local "pick up where you left off" shortcuts —
          reads localStorage client-side, so it's a client island (renders
          nothing when the list is empty, per Boundaries: Never an
          empty-state placeholder here). */}
      <RecentlyViewedChips />
    </>
  );
}

// Decimal-safe display of a Story 5.7 quantity string — formatted en-IN
// when genuinely numeric, passed through verbatim otherwise. An
// empty/whitespace string must not become a confident "0"
// (`Number("") === 0`), and a non-numeric string must never render NaN.
function formatQuantity(quantity: string): string {
  if (quantity.trim() === "") {
    return quantity;
  }
  const parsed = Number(quantity);
  return Number.isFinite(parsed) ? parsed.toLocaleString("en-IN") : quantity;
}

// One KPI panel on the navy band (DESIGN.md "Dashboard hero band" — this
// treatment is Owner-Dashboard-only, so it lives here, not in packages/ui).
// The whole panel is a real link into the figure's source screen, same
// contract the old StatTiles carried. Sparklines render on exactly the
// trended KPIs whose 7-day series loaded; they're decorative (aria-hidden)
// — the numeral carries the value.
function BandKpi({
  label,
  value,
  href,
  money,
  note,
  spark,
}: {
  label: string;
  value: ReactNode;
  href: string;
  money?: boolean;
  note?: string;
  spark?: number[];
}) {
  return (
    <Link
      href={href}
      prefetch={false}
      className="flex min-h-28 flex-col gap-1.5 rounded-md border border-navy-panel-border bg-navy-panel p-3.5 transition-colors duration-(--default-transition-duration) ease-(--ease-standard) hover:border-ink-on-navy-faint"
    >
      <div className="text-eyebrow uppercase text-ink-on-navy-muted">{label}</div>
      {/* Plain className strings, not cn(): tailwind-merge would treat the
          custom text-kpi-compact role and the text color as conflicting
          `text-*` classes and drop one. */}
      <div className={money ? "text-kpi-compact tabular-nums text-gold-on-navy" : "text-kpi-compact text-ink-on-navy"}>
        {value}
      </div>
      {spark && spark.length > 0 ? (
        <Sparkline
          points={spark}
          className="mt-auto h-8 w-full text-sparkline-on-navy [--sparkline-ring:var(--navy-panel)]"
        />
      ) : note ? (
        <div className="mt-auto text-caption text-ink-on-navy-muted">{note}</div>
      ) : null}
    </Link>
  );
}

// A single Money figure card — label, value, optional drill-down link. Built
// on the shared Card primitive (AD-5). `emphasis` is the mockup's Cash Tied
// Up treatment: a gold top edge marking the one number the strip leads to —
// one per view, never a second.
function OverallCard({
  icon,
  label,
  value,
  meta,
  link,
  actions,
  emphasis,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  meta: string;
  link?: { href: string; label: string };
  /** Extra client-side action (e.g. Story 19.1's "Record Advance" quick-entry
   * trigger) rendered alongside the drill-down link. */
  actions?: ReactNode;
  emphasis?: boolean;
}) {
  return (
    <Card className={cn("flex h-full flex-col gap-2", emphasis && "border-t-4 border-t-gold-500")}>
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
