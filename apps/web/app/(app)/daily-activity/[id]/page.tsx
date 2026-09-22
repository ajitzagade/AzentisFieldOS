import { authedFetch } from "@/lib/api";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import type { DsrEquipmentUsed, FeedItem } from "@azentisfieldos/shared";
import { AlertTriangleIcon, Badge, Card, PhotoThumbnail, RotateCcwIcon, buttonVariants, cn } from "@azentisfieldos/ui";
import { formatDate, formatDateTime, formatMoney } from "@/lib/format";
import { FEED_TYPE_CONFIG } from "../../sites/[id]/feed-type-config";

interface WorkRecordDetail {
  id: string;
  teamMember: { name: string };
  attended: boolean;
  hours: number | null;
  overtimeHours: number | null;
}

interface ConsumptionDetail {
  id: string;
  materialSize: { label: string; material: { name: string } };
  quantity: number;
  activityReference: string | null;
}

interface RmcEntryDetail {
  id: string;
  vendor: { name: string };
  quantityM3: number;
  grade: string;
  // Nullable (goal 1) — a delivery may be recorded before pricing exists.
  totalAmount: number | null;
}

interface ExpenseDetail {
  id: string;
  category: { name: string };
  amount: number;
  description: string | null;
}

// Client-readiness batch (2026-09-20), goal 3: a DSR-embedded Waste
// Material entry, now a real WasteDisposal row (mirrors RmcEntryDetail's
// exact "delivery may be recorded before pricing is known" nullability).
interface WasteDisposalDetail {
  id: string;
  wasteType: string;
  ownership: string;
  tripCount: number;
  vendor: { name: string } | null;
  totalAmount: number | null;
}


interface PhotoDetail {
  id: string;
  url: string;
  createdAt: string;
}

// Inventory→DSR sync fix (2026-09-21): material activity recorded outside
// this DSR's own form — Purchase/Movement (never DSR-form-materializable at
// all) and standalone Consumption/RMC/Waste Material/Wastage-Return (this
// DSR's own materialized rows, and this DSR itself, are already excluded
// server-side, same as otherActivity below).
interface MaterialRowDetail {
  id: string;
  occurredAt: string;
  materialName: string;
  sizeLabel: string;
  unitName: string;
  quantity: number;
  amount: number | null;
  summary: string;
}

interface MaterialsReceivedRowDetail extends MaterialRowDetail {
  source: "PURCHASE" | "MOVEMENT";
  // A Movement not yet confirmed at the destination Site — quantity is the
  // sent amount (SiteStock itself isn't incremented until confirmed, and the
  // confirmed amount can differ from what was sent).
  pending: boolean;
}

interface WastageReturnRowDetail extends MaterialRowDetail {
  kind: "WASTAGE" | "RETURN";
}

interface StandaloneRmcRowDetail {
  id: string;
  occurredAt: string;
  vendorName: string;
  grade: string;
  quantityM3: number;
  totalAmount: number | null;
}

interface StandaloneWasteRowDetail {
  id: string;
  occurredAt: string;
  wasteType: string;
  tripCount: number;
  vendorName: string | null;
  totalAmount: number | null;
}

interface StandaloneExpenseRowDetail {
  id: string;
  occurredAt: string;
  categoryName: string;
  description: string | null;
  amount: number;
}

interface StandaloneWorkEntryRowDetail {
  id: string;
  occurredAt: string;
  subcontractorName: string;
  quantity: number;
  note: string | null;
}

interface DsrDetail {
  id: string;
  site: { id: string; name: string };
  submittedBy: { name: string };
  reportDate: string;
  workCompleted: string | null;
  workInProgress: string | null;
  plannedWork: string | null;
  issuesBlockers: string | null;
  safetyObservations: string | null;
  notes: string | null;
  equipmentUsed: DsrEquipmentUsed[];
  // Client-readiness batch (2026-09-20), goal 4: siteContractId/quantity are
  // additive optional fields — present only when the entry picked a real
  // Site Contract (which then also has a real, materialized
  // SubcontractorWorkEntry — see dsr.service.ts). A historical row without
  // them renders exactly as before.
  subcontractorEntries?: {
    subcontractorId: string;
    workNote?: string;
    siteContractId?: string;
    quantity?: number;
  }[];
  labourEntries?: { category: string; men: number; women: number }[];
  workRecords: WorkRecordDetail[];
  consumptions: ConsumptionDetail[];
  rmcEntries: RmcEntryDetail[];
  expenses: ExpenseDetail[];
  wasteDisposalEntries: WasteDisposalDetail[];
  photos: PhotoDetail[];
  // Story 3.5 (AD-9, FR-54): corrections are a new linked row, never an
  // edit — correctsId/reason are set when this DSR *is* a correction;
  // correctedById is set when a later correction supersedes this one.
  correctsId: string | null;
  reason: string | null;
  correctedById: string | null;
  // Client-readiness batch (2026-09-20), goal 2: same-day Site activity
  // recorded outside this DSR (this DSR's own materialized rows, and this
  // DSR itself, are already excluded server-side) — so "did my entries
  // sync" is answerable without leaving this page. Narrowed (2026-09-21) to
  // non-material types only — material activity now has its own sections
  // below instead of hiding in this generic list.
  otherActivity: FeedItem[];
  materialsReceived: MaterialsReceivedRowDetail[];
  standaloneConsumptions: MaterialRowDetail[];
  standaloneRmcEntries: StandaloneRmcRowDetail[];
  standaloneWasteDisposals: StandaloneWasteRowDetail[];
  standaloneWastageReturns: WastageReturnRowDetail[];
  standaloneExpenses: StandaloneExpenseRowDetail[];
  standaloneWorkEntries: StandaloneWorkEntryRowDetail[];
}

async function getDsrDetail(id: string): Promise<DsrDetail | null> {
  const res = await authedFetch(`/dsr/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to load Daily Report (${res.status})`);
  }
  return res.json();
}

// subcontractorEntries is plain denormalized JSON (goal 5, same reasoning
// as equipmentUsed) — it carries only the Subcontractor's id, so this page
// resolves a display name itself rather than the API doing a per-row join.
async function getSubcontractorNames(): Promise<Map<string, string>> {
  try {
    const res = await authedFetch(`/subcontractors`, { cache: "no-store" });
    if (!res.ok) return new Map();
    const rows = (await res.json()) as { id: string; name: string }[];
    return new Map(rows.map((r) => [r.id, r.name]));
  } catch {
    return new Map();
  }
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-border-hairline py-2 last:border-b-0">
      <span className="w-40 shrink-0 text-caption text-ink-500">{label}</span>
      <span className="text-body-sm text-ink-900">{value}</span>
    </div>
  );
}

export default async function DsrDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dsr = await getDsrDetail(id);
  if (!dsr) {
    notFound();
  }

  const presentCount = dsr.workRecords.filter((w) => w.attended).length;
  // Auto-sync Expenses (2026-09-22): a standalone Expense (the /expenses
  // module, not this DSR's own form) counts toward the same total — the
  // whole point being the Owner sees one true figure without the
  // Supervisor re-entering it here.
  const expensesTotal =
    dsr.expenses.reduce((sum, e) => sum + e.amount, 0) +
    dsr.standaloneExpenses.reduce((sum, e) => sum + e.amount, 0);
  const subcontractorEntries = dsr.subcontractorEntries ?? [];
  const labourEntries = dsr.labourEntries ?? [];
  const subcontractorNames =
    subcontractorEntries.length > 0 ? await getSubcontractorNames() : new Map<string, string>();

  return (
    <>
      <div className="mb-2 text-eyebrow text-ink-500">
        <Link href="/daily-activity" className="hover:text-accent-teal-700 hover:underline">
          Daily Reports
        </Link>{" "}
        / {dsr.site.name}
      </div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-page-title text-ink-900">
            {dsr.site.name} — {formatDate(dsr.reportDate)}
          </h1>
          <p className="text-body-sm text-ink-500">Submitted by {dsr.submittedBy.name}</p>
        </div>
        {!dsr.correctedById ? (
          <Link href={`/daily-activity/${dsr.id}/correct`} className={cn(buttonVariants({ variant: "ghost" }))}>
            <RotateCcwIcon className="size-4" />
            Correct
          </Link>
        ) : null}
      </div>

      {dsr.correctsId ? (
        <p className="mb-4 flex items-center gap-2 rounded-md bg-warning-100 p-3 text-body-sm text-warning-700">
          <AlertTriangleIcon className="size-5 shrink-0" />
          This is a correction{dsr.reason ? `: ${dsr.reason}` : "."}
        </p>
      ) : null}

      {dsr.correctedById ? (
        <p className="mb-4 flex items-center gap-2 rounded-md bg-warning-100 p-3 text-body-sm text-warning-700">
          <AlertTriangleIcon className="size-5 shrink-0" />
          This report was corrected —{" "}
          <Link href={`/daily-activity/${dsr.correctedById}`} className="font-semibold underline">
            view the latest version
          </Link>
          .
        </p>
      ) : null}

      <div className="flex flex-col gap-4">
        <Card>
          <h2 className="mb-3 text-card-title text-ink-900">Report</h2>
          <DetailRow label="Work completed" value={dsr.workCompleted ?? <span className="text-ink-500">—</span>} />
          <DetailRow label="Work in progress" value={dsr.workInProgress ?? <span className="text-ink-500">—</span>} />
          <DetailRow label="Planned work" value={dsr.plannedWork ?? <span className="text-ink-500">—</span>} />
          <DetailRow label="Issues / blockers" value={dsr.issuesBlockers ?? <span className="text-ink-500">—</span>} />
          <DetailRow
            label="Safety observations"
            value={dsr.safetyObservations ?? <span className="text-ink-500">—</span>}
          />
          <DetailRow label="Notes" value={dsr.notes ?? <span className="text-ink-500">—</span>} />
        </Card>

        <Card>
          <h2 className="mb-3 text-card-title text-ink-900">
            Crew ({presentCount} of {dsr.workRecords.length} present)
          </h2>
          {dsr.workRecords.length === 0 ? (
            <p className="text-body-sm text-ink-500">No crew recorded for this report.</p>
          ) : (
            <ul className="flex flex-col gap-1 text-body-sm text-ink-900">
              {dsr.workRecords.map((w) => (
                <li key={w.id} className="flex justify-between border-b border-border-hairline py-1.5 last:border-b-0">
                  <span>{w.teamMember.name}</span>
                  <span className="text-ink-500">
                    {w.attended ? (w.hours ? `Present — ${w.hours} hrs` : "Present") : "Absent"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Inventory→DSR sync fix (2026-09-21): the DSR form never had a
            "materials received" concept — Purchases and inbound/outbound
            Movements touching this Site on this date are always live-queried,
            never DSR-materialized. */}
        <Card>
          <h2 className="mb-3 text-card-title text-ink-900">Materials Received</h2>
          {dsr.materialsReceived.length === 0 ? (
            <p className="text-body-sm text-ink-500">No materials received logged for this Site on this date.</p>
          ) : (
            <ul className="flex flex-col gap-1 text-body-sm text-ink-900">
              {dsr.materialsReceived.map((m) => (
                <li key={m.id} className="flex justify-between border-b border-border-hairline py-1.5 last:border-b-0">
                  <span>
                    {m.materialName} ({m.sizeLabel}){" "}
                    <span className="text-caption text-ink-500">
                      via {m.source === "PURCHASE" ? "Purchase" : "Movement"} — {m.summary}
                    </span>{" "}
                    {/* Sent, not yet confirmed received at this Site — the
                        number shown is what was sent and may still change. */}
                    {m.pending ? <Badge variant="warning">Pending confirmation</Badge> : null}
                  </span>
                  <span className="text-ink-500">{m.quantity} {m.unitName}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="mb-3 text-card-title text-ink-900">Materials Used</h2>
          {dsr.consumptions.length === 0 && dsr.standaloneConsumptions.length === 0 ? (
            <p className="text-body-sm text-ink-500">No materials logged for this report.</p>
          ) : (
            <ul className="flex flex-col gap-1 text-body-sm text-ink-900">
              {dsr.consumptions.map((c) => (
                <li key={`dsr-${c.id}`} className="flex justify-between border-b border-border-hairline py-1.5 last:border-b-0">
                  <span>
                    {c.materialSize.material.name} ({c.materialSize.label})
                  </span>
                  <span className="text-ink-500">{c.quantity}</span>
                </li>
              ))}
              {dsr.standaloneConsumptions.map((c) => (
                <li key={`standalone-${c.id}`} className="flex justify-between border-b border-border-hairline py-1.5 last:border-b-0">
                  <span>
                    {c.materialName} ({c.sizeLabel}){" "}
                    <span className="text-caption text-ink-500">via Material Used</span>
                  </span>
                  <span className="text-ink-500">{c.quantity}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="mb-3 text-card-title text-ink-900">RMC (ready-mix concrete) used</h2>
          {dsr.rmcEntries.length === 0 && dsr.standaloneRmcEntries.length === 0 ? (
            <p className="text-body-sm text-ink-500">No RMC delivery logged for this report.</p>
          ) : (
            <ul className="flex flex-col gap-1 text-body-sm text-ink-900">
              {dsr.rmcEntries.map((r) => (
                <li key={`dsr-${r.id}`} className="flex justify-between border-b border-border-hairline py-1.5 last:border-b-0">
                  <span>
                    {r.vendor.name} — {r.grade}
                  </span>
                  <span className="text-ink-500">
                    {r.quantityM3} m³ ·{" "}
                    <span className="font-semibold text-gold-700">
                      {/* D7: an unpriced delivery has no amount yet — pending, never ₹0. */}
                      {r.totalAmount === null ? <span className="text-ink-500">Pricing pending</span> : `₹${r.totalAmount.toLocaleString("en-IN")}`}
                    </span>
                  </span>
                </li>
              ))}
              {dsr.standaloneRmcEntries.map((r) => (
                <li key={`standalone-${r.id}`} className="flex justify-between border-b border-border-hairline py-1.5 last:border-b-0">
                  <span>
                    {r.vendorName} — {r.grade} <span className="text-caption text-ink-500">via RMC</span>
                  </span>
                  <span className="text-ink-500">
                    {r.quantityM3} m³ ·{" "}
                    <span className="font-semibold text-gold-700">
                      {r.totalAmount === null ? <span className="text-ink-500">Pricing pending</span> : `₹${r.totalAmount.toLocaleString("en-IN")}`}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="mb-3 text-card-title text-ink-900">Waste Material</h2>
          {dsr.wasteDisposalEntries.length === 0 && dsr.standaloneWasteDisposals.length === 0 ? (
            <p className="text-body-sm text-ink-500">No Waste Material logged for this report.</p>
          ) : (
            <ul className="flex flex-col gap-1 text-body-sm text-ink-900">
              {dsr.wasteDisposalEntries.map((w) => (
                <li key={`dsr-${w.id}`} className="flex justify-between border-b border-border-hairline py-1.5 last:border-b-0">
                  <span>
                    {w.wasteType} — {w.tripCount} trip{Math.abs(w.tripCount) === 1 ? "" : "s"}
                    {w.vendor ? ` (${w.vendor.name})` : " (own vehicle)"}
                  </span>
                  <span className="text-ink-500">
                    {/* D7: an unpriced trip has no amount yet — pending, never ₹0. */}
                    {w.totalAmount === null ? (
                      <span className="text-ink-500">Pricing pending</span>
                    ) : (
                      // Review fix (finding #9): a correction-delta row can
                      // be negative — formatMoney puts the sign before the
                      // ₹ symbol ("−₹2,000"), not "₹-2,000".
                      <span className="font-semibold text-gold-700">{formatMoney(w.totalAmount)}</span>
                    )}
                  </span>
                </li>
              ))}
              {dsr.standaloneWasteDisposals.map((w) => (
                <li key={`standalone-${w.id}`} className="flex justify-between border-b border-border-hairline py-1.5 last:border-b-0">
                  <span>
                    {w.wasteType} — {w.tripCount} trip{Math.abs(w.tripCount) === 1 ? "" : "s"}
                    {w.vendorName ? ` (${w.vendorName})` : " (own vehicle)"}{" "}
                    <span className="text-caption text-ink-500">via Waste Material</span>
                  </span>
                  <span className="text-ink-500">
                    {w.totalAmount === null ? (
                      <span className="text-ink-500">Pricing pending</span>
                    ) : (
                      <span className="font-semibold text-gold-700">{formatMoney(w.totalAmount)}</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Inventory→DSR sync fix (2026-09-21): the DSR form has no wastage/
            return concept at all — every row here is always live-queried. */}
        <Card>
          <h2 className="mb-3 text-card-title text-ink-900">Material Wastage / Returns</h2>
          {dsr.standaloneWastageReturns.length === 0 ? (
            <p className="text-body-sm text-ink-500">No material wastage or returns logged for this Site on this date.</p>
          ) : (
            <ul className="flex flex-col gap-1 text-body-sm text-ink-900">
              {dsr.standaloneWastageReturns.map((r) => (
                <li key={r.id} className="flex justify-between border-b border-border-hairline py-1.5 last:border-b-0">
                  <span>
                    {r.materialName} ({r.sizeLabel}){" "}
                    <span className="text-caption text-ink-500">{r.kind === "WASTAGE" ? "Wastage" : "Return"}</span>
                  </span>
                  <span className="text-ink-500">{r.quantity} {r.unitName}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="mb-3 text-card-title text-ink-900">Equipment used</h2>
          {dsr.equipmentUsed.length === 0 ? (
            <p className="text-body-sm text-ink-500">No machinery or vehicles tagged for this report.</p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {dsr.equipmentUsed.map((e, index) => (
                <li
                  key={e.id ?? `${e.type}-${index}`}
                  className="rounded-md border border-border-hairline bg-surface-2 px-3 py-1 text-body-sm text-ink-900"
                >
                  {e.type === "OTHER" ? (e.description ?? "Other Vehicle") : e.name}
                  {e.type !== "OTHER" && e.description ? <span className="text-ink-500"> — {e.description}</span> : null}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="mb-3 text-card-title text-ink-900">Subcontractors on site</h2>
          {subcontractorEntries.length === 0 && dsr.standaloneWorkEntries.length === 0 ? (
            <p className="text-body-sm text-ink-500">No Subcontractors tagged for this report.</p>
          ) : (
            <ul className="flex flex-col gap-1 text-body-sm text-ink-900">
              {subcontractorEntries.map((s, index) => (
                <li key={`dsr-${s.subcontractorId}-${index}`} className="flex justify-between border-b border-border-hairline py-1.5 last:border-b-0">
                  <span>
                    {subcontractorNames.get(s.subcontractorId) ?? "Subcontractor"}
                    {/* goal 4: a picked Site Contract + quantity created a real
                        Work Entry (dsr.service.ts) — shown here so the DSR
                        detail page reflects it, not just the standalone
                        Site Contract's ledger. */}
                    {s.quantity !== undefined ? (
                      <span className="ml-2 text-ink-500">— {s.quantity} logged</span>
                    ) : null}
                  </span>
                  <span className="text-ink-500">{s.workNote ?? "—"}</span>
                </li>
              ))}
              {/* Inventory→DSR sync fix, extended (2026-09-22): a Work Entry
                  recorded directly on the Site Contract page (Epic 18), not
                  through this DSR form, used to be invisible here — every
                  other activity type recorded outside the DSR already had
                  this merge, this one didn't. */}
              {dsr.standaloneWorkEntries.map((w) => (
                <li key={`standalone-${w.id}`} className="flex justify-between border-b border-border-hairline py-1.5 last:border-b-0">
                  <span>
                    {w.subcontractorName}
                    <span className="ml-2 text-ink-500">— {w.quantity} logged</span>{" "}
                    <span className="text-caption text-ink-500">via Site Contract</span>
                  </span>
                  <span className="text-ink-500">{w.note ?? "—"}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="mb-3 text-card-title text-ink-900">Labour</h2>
          {labourEntries.length === 0 ? (
            <p className="text-body-sm text-ink-500">No labour logged for this report.</p>
          ) : (
            <ul className="flex flex-col gap-1 text-body-sm text-ink-900">
              {labourEntries.map((l, index) => (
                <li key={`${l.category}-${index}`} className="flex justify-between border-b border-border-hairline py-1.5 last:border-b-0">
                  <span>{l.category}</span>
                  <span className="text-ink-500">
                    {l.men} men · {l.women} women · {l.men + l.women} total
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="mb-3 text-card-title text-ink-900">
            Expenses{" "}
            {dsr.expenses.length > 0 || dsr.standaloneExpenses.length > 0 ? (
              <span className="font-semibold text-gold-700">— ₹{expensesTotal.toLocaleString("en-IN")}</span>
            ) : null}
          </h2>
          {dsr.expenses.length === 0 && dsr.standaloneExpenses.length === 0 ? (
            <p className="text-body-sm text-ink-500">No expenses logged for this report.</p>
          ) : (
            <ul className="flex flex-col gap-1 text-body-sm text-ink-900">
              {dsr.expenses.map((e) => (
                <li key={`dsr-${e.id}`} className="flex justify-between border-b border-border-hairline py-1.5 last:border-b-0">
                  <span>{e.description ?? e.category.name}</span>
                  <span className="font-semibold text-gold-700">₹{e.amount.toLocaleString("en-IN")}</span>
                </li>
              ))}
              {dsr.standaloneExpenses.map((e) => (
                <li key={`standalone-${e.id}`} className="flex justify-between border-b border-border-hairline py-1.5 last:border-b-0">
                  <span>
                    {e.description ?? e.categoryName} <span className="text-caption text-ink-500">via Expense</span>
                  </span>
                  <span className="font-semibold text-gold-700">₹{e.amount.toLocaleString("en-IN")}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="mb-3 text-card-title text-ink-900">Photos ({dsr.photos.length})</h2>
          {dsr.photos.length === 0 ? (
            <p className="text-body-sm text-ink-500">No photos attached to this report.</p>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
              {dsr.photos.map((photo) => (
                <div key={photo.id} className="aspect-square overflow-hidden rounded-md border border-border-hairline bg-surface-2">
                  <PhotoThumbnail src={photo.url} alt="" className="size-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Goal 2 (client-readiness batch): read-only, no click-through —
            Goal 5's clickable detail panel is Site-Details-page-only per the
            user's ask. Reuses the exact same Site Activity Feed
            getSiteActivityFeed() powers, narrowed to this DSR's own
            Site+date and filtered to exclude this DSR's own materialized
            rows, so "did my entries sync" is answerable without leaving
            this page. Narrowed further (2026-09-21, inventory→DSR sync fix):
            material activity types (Purchase/Movement/Consumption/RMC/Waste
            Material/Wastage-Return) are excluded here — they have their own
            sections above now — so this card only ever shows non-material
            same-day activity (Work Record, Expense, machinery/vehicle
            movement, Site Contract, Work Entry, Subcontractor Payment,
            another DSR). */}
        <Card>
          <h2 className="mb-3 text-card-title text-ink-900">Other activity at this Site on this date</h2>
          {dsr.otherActivity.length === 0 ? (
            <p className="text-body-sm text-ink-500">No other activity recorded for this Site on this date.</p>
          ) : (
            <ul className="flex flex-col gap-1 text-body-sm text-ink-900">
              {dsr.otherActivity.map((item) => {
                const config = FEED_TYPE_CONFIG[item.type];
                const Icon = config.icon;
                return (
                  <li
                    key={`${item.type}-${item.id}`}
                    className="flex flex-wrap items-center justify-between gap-2 border-b border-border-hairline py-1.5 last:border-b-0"
                  >
                    <span className="flex items-center gap-2">
                      <Badge variant={config.badgeVariant} icon={<Icon />}>
                        {config.label}
                      </Badge>
                      <span>{item.summary}</span>
                    </span>
                    <span className="text-ink-500">
                      {formatDateTime(item.occurredAt)}
                      {item.amount !== null ? (
                        // Review fix (finding #9): a Waste Material
                        // correction-delta row can carry a negative amount.
                        <span className="ml-2 font-semibold text-gold-700">{formatMoney(item.amount)}</span>
                      ) : null}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
