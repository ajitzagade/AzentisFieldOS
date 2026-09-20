"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { FeedItem, FeedItemType } from "@azentisfieldos/shared";
import {
  ClipboardIcon,
  Badge,
  DataTable,
  DetailPanel,
  EmptyState,
  isPlainLeftClick,
  type DataTableColumn,
  type DataTableMobileCard,
} from "@azentisfieldos/ui";
import { useAuthedFetch } from "../../../../../lib/use-authed-fetch";
import { useDetailPanelState } from "../../../../../lib/use-detail-panel-state";
import { formatDateTime, formatMoney } from "../../../../../lib/format";
import { FEED_TYPE_CONFIG } from "../feed-type-config";

// spec-dsr-activity-sync-detail-panel, goal 5: extracted from sites/[id]/
// page.tsx's inline DataTable — mirrors vendors-list-client.tsx's split
// from its server-component parent exactly, so the Activity Feed can carry
// its own client-side click/panel state without turning the whole Site
// detail page into a Client Component.
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
        // Review fix (finding #9): a Waste Material correction-delta row
        // can carry a negative amount.
        <span className="font-semibold text-gold-700 tabular-nums">{formatMoney(item.amount)}</span>
      ) : (
        <span className="text-ink-500">—</span>
      ),
  },
];

const feedMobileCard: DataTableMobileCard<FeedItem> = {
  primary: (item) => formatDateTime(item.occurredAt),
  omitHeaders: ["Date"],
};

// Boundaries & Constraints: lazy on click only — no new list endpoint, no
// eager/prefetch-all. Maps a feed item's type to the exact existing
// `GET :id` endpoint that answers it (9 pre-existing + 5 new, all the same
// findUnique + shallow include + NotFoundException shape).
function feedItemPath(type: FeedItemType, id: string): string {
  switch (type) {
    case "PURCHASE":
      return `/purchases/${id}`;
    case "MOVEMENT":
      return `/movements/${id}`;
    case "CONSUMPTION":
      return `/consumption/${id}`;
    case "RETURN_WASTAGE":
      return `/return-wastage/${id}`;
    case "WORK_RECORD":
      return `/work-records/${id}`;
    case "EXPENSE":
      return `/expenses/${id}`;
    case "RMC":
      return `/rmc-entries/${id}`;
    case "DSR":
      return `/dsr/${id}`;
    case "MACHINERY_MOVEMENT":
      return `/asset-movements/${id}?assetType=MACHINERY`;
    case "VEHICLE_MOVEMENT":
      return `/asset-movements/${id}?assetType=VEHICLE`;
    case "WASTE_DISPOSAL":
      return `/waste-disposals/${id}`;
    case "SITE_CONTRACT":
      return `/site-contracts/${id}`;
    case "WORK_ENTRY":
      return `/subcontractor-work-entries/${id}`;
    case "SUBCONTRACTOR_PAYMENT":
      return `/subcontractor-payments/${id}`;
  }
}

type FeedItemDetail = Record<string, unknown>;

type DetailState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "not-found" }
  | { status: "error" }
  | { status: "success"; item: FeedItemDetail };

type FetchResult =
  | { compoundId: string; attempt: number; status: "not-found" }
  | { compoundId: string; attempt: number; status: "error" }
  | { compoundId: string; attempt: number; status: "success"; item: FeedItemDetail };

// Same shape as vendors-list-client.tsx's useVendorDetail — keyed off the
// panel's URL-sourced `type:id` compound id, so navigating between rows
// (id changes while the panel stays open) re-fetches rather than showing
// the previous row's content.
function useFeedItemDetail(compoundId: string | null): { state: DetailState; retry: () => void } {
  const authedFetch = useAuthedFetch();
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<FetchResult | null>(null);

  const [rawType, id] = compoundId ? (compoundId.split(":") as [string, string]) : [undefined, undefined];
  // Review fix (finding #8): an invalid/unknown `type` in the URL (a
  // hand-edited or stale `feedItem` query param) must resolve to a clean
  // "not found," not a generic error/retry state — feedItemPath's switch
  // has no fallback branch to degrade to, so this is validated against
  // FEED_TYPE_CONFIG's own keys BEFORE ever calling it, and derived
  // straight into the render output below rather than a setState call
  // inside the effect (which would fire on every render of an invalid id).
  const isValidType = !!rawType && rawType in FEED_TYPE_CONFIG;
  const type = isValidType ? (rawType as FeedItemType) : undefined;

  useEffect(() => {
    if (!compoundId || !type || !id) return;
    let cancelled = false;
    authedFetch(feedItemPath(type, id))
      .then(async (res) => {
        if (res.status === 404) {
          if (!cancelled) setResult({ compoundId, attempt, status: "not-found" });
          return;
        }
        if (!res.ok) {
          throw new Error(`Failed to load activity (${res.status})`);
        }
        const item = (await res.json()) as FeedItemDetail;
        if (!cancelled) setResult({ compoundId, attempt, status: "success", item });
      })
      .catch(() => {
        if (!cancelled) setResult({ compoundId, attempt, status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [compoundId, type, id, attempt, authedFetch]);

  const settled = result && result.compoundId === compoundId && result.attempt === attempt;
  const state: DetailState = !compoundId
    ? { status: "idle" }
    : !isValidType || !id
      ? { status: "not-found" }
      : settled
        ? result
        : { status: "loading" };

  return { state, retry: () => setAttempt((n) => n + 1) };
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="mb-0.5 text-eyebrow uppercase text-ink-500">{label}</div>
      <div className="text-body-sm text-ink-900">{value ?? "—"}</div>
    </div>
  );
}

function money(value: unknown): string {
  if (value === null || value === undefined) return "—";
  const n = Number(value);
  return Number.isFinite(n) ? `₹${n.toLocaleString("en-IN")}` : "—";
}

function qty(value: unknown): string {
  if (value === null || value === undefined) return "—";
  return String(value);
}

// Boundaries & Constraints: "View Full Details" only for types with a
// confirmed existing target route — every other type omits the link
// rather than guessing one (see the spec's Ask-First boundary).
function viewFullDetailsHref(type: FeedItemType, id: string, item: FeedItemDetail): string | null {
  switch (type) {
    case "PURCHASE":
      return `/movements/purchases/${id}/correct`;
    case "CONSUMPTION":
      return `/movements/consumption/${id}/correct`;
    case "RETURN_WASTAGE":
      return `/movements/return-wastage/${id}/correct`;
    case "EXPENSE":
      return `/expenses/${id}/correct`;
    case "RMC":
      return `/rmc/${id}/correct`;
    case "WASTE_DISPOSAL":
      return `/waste-disposal/${id}/correct`;
    case "SITE_CONTRACT": {
      const siteId = (item.siteId as string | undefined) ?? (item.site as { id?: string } | undefined)?.id;
      return siteId ? `/sites/${siteId}/contracts/${id}` : null;
    }
    case "DSR":
      return `/daily-activity/${id}`;
    // MOVEMENT: only godown-to-site/[id]/correct exists among the 3 Movement
    // subtypes (site-to-site/vendor-to-site have no [id]/correct folder) —
    // omit rather than guess.
    case "MOVEMENT":
    case "WORK_RECORD":
    case "MACHINERY_MOVEMENT":
    case "VEHICLE_MOVEMENT":
    case "WORK_ENTRY":
    case "SUBCONTRACTOR_PAYMENT":
      return null;
  }
}

// Per-type field rendering (label/value pairs) covering the fields each
// source table has beyond FeedItem's 5 — see site-activity-feed.ts's
// per-type include/summary construction for the field lists this mirrors.
function feedItemFields(type: FeedItemType, item: FeedItemDetail): { label: string; value: React.ReactNode }[] {
  const g = <T = unknown,>(path: string): T | undefined =>
    path.split(".").reduce<unknown>((acc, key) => (acc && typeof acc === "object" ? (acc as Record<string, unknown>)[key] : undefined), item) as
      | T
      | undefined;

  switch (type) {
    case "PURCHASE":
      return [
        { label: "Vendor", value: g<string>("vendor.name") },
        { label: "Material", value: `${g<string>("materialSize.material.name") ?? ""} (${g<string>("materialSize.label") ?? ""})` },
        { label: "Quantity", value: `${qty(g("quantity"))} ${g<string>("materialSize.material.unit.name") ?? ""}` },
        { label: "Destination", value: g<string>("destination") },
        { label: "Rate", value: money(g("rate")) },
        { label: "Total amount", value: g("totalAmount") === null ? "Pricing pending" : money(g("totalAmount")) },
        { label: "Payment status", value: g<string>("paymentStatus") ?? "Pricing pending" },
      ];
    case "MOVEMENT":
      return [
        { label: "Material", value: `${g<string>("materialSize.material.name") ?? ""} (${g<string>("materialSize.label") ?? ""})` },
        { label: "From", value: g<string>("sourceSite.name") ?? "Godown" },
        { label: "To", value: g<string>("destinationSite.name") ?? "Godown" },
        { label: "Quantity sent", value: qty(g("sentQuantity")) },
        { label: "Quantity received", value: qty(g("receivedQuantity")) },
      ];
    case "CONSUMPTION":
      return [
        { label: "Site", value: g<string>("site.name") },
        { label: "Material", value: `${g<string>("materialSize.material.name") ?? ""} (${g<string>("materialSize.label") ?? ""})` },
        { label: "Quantity", value: `${qty(g("quantity"))} ${g<string>("materialSize.material.unit.name") ?? ""}` },
        { label: "Activity reference", value: g<string>("activityReference") },
      ];
    case "RETURN_WASTAGE":
      return [
        { label: "Site", value: g<string>("site.name") },
        { label: "Kind", value: g<string>("kind") },
        { label: "Material", value: `${g<string>("materialSize.material.name") ?? ""} (${g<string>("materialSize.label") ?? ""})` },
        { label: "Quantity", value: qty(g("quantity")) },
      ];
    case "WORK_RECORD":
      return [
        { label: "Team Member", value: g<string>("teamMember.name") },
        { label: "Site", value: g<string>("site.name") },
        { label: "Attended", value: g<boolean>("attended") ? "Present" : "Absent" },
        { label: "Hours", value: qty(g("hours")) },
        { label: "Overtime hours", value: qty(g("overtimeHours")) },
      ];
    case "EXPENSE":
      return [
        { label: "Site", value: g<string>("site.name") },
        { label: "Category", value: g<string>("category.name") },
        { label: "Amount", value: money(g("amount")) },
        { label: "Description", value: g<string>("description") },
        { label: "Payment method", value: g<string>("paymentMethod") },
        { label: "Person / Vendor", value: g<string>("personOrVendor") },
      ];
    case "RMC":
      return [
        { label: "Site", value: g<string>("site.name") },
        { label: "Vendor", value: g<string>("vendor.name") },
        { label: "Grade", value: g<string>("grade") },
        { label: "Quantity", value: `${qty(g("quantityM3"))} m³` },
        { label: "Total amount", value: g("totalAmount") === null ? "Pricing pending" : money(g("totalAmount")) },
        { label: "Invoice / Challan no.", value: g<string>("invoiceOrChallanNo") },
      ];
    case "DSR":
      return [
        { label: "Site", value: g<string>("site.name") },
        { label: "Submitted by", value: g<string>("submittedBy.name") },
        { label: "Work completed", value: g<string>("workCompleted") },
        { label: "Work in progress", value: g<string>("workInProgress") },
      ];
    case "MACHINERY_MOVEMENT":
      return [
        { label: "Machinery", value: `${g<string>("machinery.name") ?? ""} (${g<string>("machinery.assetNumber") ?? ""})` },
        { label: "Status", value: g<string>("toStatus") },
        { label: "Site", value: g<string>("site.name") ?? "Not at a Site" },
      ];
    case "VEHICLE_MOVEMENT":
      return [
        { label: "Vehicle", value: `${g<string>("vehicle.type.name") ?? ""} ${g<string>("vehicle.number") ?? ""}` },
        { label: "Status", value: g<string>("toStatus") },
        { label: "Site", value: g<string>("site.name") ?? "Not at a Site" },
      ];
    case "WASTE_DISPOSAL":
      return [
        { label: "Site", value: g<string>("site.name") },
        { label: "Waste type", value: g<string>("wasteType") },
        { label: "Ownership", value: g<string>("ownership") },
        { label: "Vendor", value: g<string>("vendor.name") ?? "Own vehicle" },
        { label: "Trips", value: qty(g("tripCount")) },
        { label: "Total amount", value: g("totalAmount") === null ? "Pricing pending" : money(g("totalAmount")) },
        { label: "Disposal location", value: g<string>("disposalLocation") },
      ];
    case "SITE_CONTRACT":
      return [
        { label: "Subcontractor", value: g<string>("subcontractor.name") },
        { label: "Work category", value: g<string>("workCategory") },
        { label: "Status", value: g<string>("status") },
        { label: "Quantity completed", value: qty(g("quantityCompleted")) },
        { label: "Amount paid", value: money(g("amountPaid")) },
      ];
    case "WORK_ENTRY":
      return [
        { label: "Subcontractor", value: g<string>("siteContract.subcontractor.name") },
        { label: "Site", value: g<string>("siteContract.site.name") },
        { label: "Quantity", value: qty(g("quantity")) },
        { label: "Note", value: g<string>("note") },
      ];
    case "SUBCONTRACTOR_PAYMENT":
      return [
        { label: "Subcontractor", value: g<string>("siteContract.subcontractor.name") },
        { label: "Type", value: g<string>("type") },
        { label: "Amount", value: money(g("amount")) },
        { label: "Payment method", value: g<string>("paymentMethod") },
        { label: "Note", value: g<string>("note") },
      ];
  }
}

function FeedItemDetailPanelContent({
  compoundId,
  state,
  onRetry,
  onClose,
}: {
  compoundId: string | null;
  state: DetailState;
  onRetry: () => void;
  onClose: () => void;
}) {
  if (state.status === "loading" || state.status === "idle") {
    return (
      <div aria-hidden="true" className="flex flex-col gap-3">
        <div className="h-4 w-2/3 animate-pulse rounded-sm bg-surface-2" />
        <div className="h-4 w-1/2 animate-pulse rounded-sm bg-surface-2" />
        <div className="h-4 w-full animate-pulse rounded-sm bg-surface-2" />
        <div className="h-4 w-5/6 animate-pulse rounded-sm bg-surface-2" />
      </div>
    );
  }

  if (state.status === "not-found") {
    return <EmptyState icon={<ClipboardIcon />} message="This record could not be found." />;
  }

  if (state.status === "error") {
    return (
      <div className="px-2 py-8 text-center text-ink-500">
        <p>Couldn&apos;t load this record.</p>
        <button type="button" onClick={onRetry} className="mt-4 text-accent-teal-700 underline-offset-2 hover:underline">
          Try again
        </button>
      </div>
    );
  }

  const [type, id] = (compoundId ?? "").split(":") as [FeedItemType, string];
  const fields = feedItemFields(type, state.item);
  const href = viewFullDetailsHref(type, id, state.item);

  return (
    <div className="flex flex-col gap-4">
      {fields.map((field) => (
        <Field key={field.label} label={field.label} value={field.value as React.ReactNode} />
      ))}
      {href ? (
        <Link
          href={href}
          // Only close the panel on a plain click — a modifier/middle-click
          // opens the full page in a new tab and must leave this tab's
          // panel/URL untouched, same guard as DataTable's own row links.
          onClick={(event) => {
            if (isPlainLeftClick(event)) onClose();
          }}
          className="text-body-sm font-medium text-accent-teal-700 hover:underline"
        >
          View Full Details →
        </Link>
      ) : null}
    </div>
  );
}

export function SiteActivityFeedClient({ feed }: { feed: FeedItem[] }) {
  const panel = useDetailPanelState("feedItem");
  const { state: detailState, retry } = useFeedItemDetail(panel.id);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Mirrors useDetailPanelState's own URL-building exactly, but read-only
  // (no navigation) — DataTable only attaches onRowClick/keyboard handling
  // to a row that also has a real href (see data-table.tsx), so every row
  // needs one; a modifier/middle-click then correctly opens this same
  // shareable panel-open URL in a new tab instead of a per-type page that
  // may not exist for every feed item type.
  function panelHref(item: FeedItem): string {
    const params = new URLSearchParams(searchParams);
    params.set("feedItem", `${item.type}:${item.id}`);
    return `${pathname}?${params.toString()}`;
  }

  return (
    <>
      <DataTable
        columns={feedColumns}
        mobileCard={feedMobileCard}
        rowKey={(item) => `${item.type}:${item.id}`}
        rowHref={panelHref}
        onRowClick={(item) => panel.open(`${item.type}:${item.id}`)}
        state={
          feed.length === 0
            ? {
                status: "empty",
                icon: <ClipboardIcon />,
                message: "No activity logged yet for this Site.",
              }
            : { status: "success", rows: feed }
        }
      />

      <DetailPanel
        open={panel.id !== null}
        onOpenChange={(open) => {
          if (!open) panel.close();
        }}
        title={panel.id ? (FEED_TYPE_CONFIG[panel.id.split(":")[0] as FeedItemType]?.label ?? "Activity") : "Activity"}
      >
        <FeedItemDetailPanelContent compoundId={panel.id} state={detailState} onRetry={retry} onClose={panel.close} />
      </DetailPanel>
    </>
  );
}
