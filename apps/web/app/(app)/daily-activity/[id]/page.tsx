import { authedFetch } from "@/lib/api";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import type { DsrEquipmentUsed } from "@azentisfieldos/shared";
import { AlertTriangleIcon, Card, RotateCcwIcon, buttonVariants, cn } from "@azentisfieldos/ui";
import { formatDate } from "@/lib/format";

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

interface PhotoDetail {
  id: string;
  url: string;
  createdAt: string;
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
  subcontractorEntries?: { subcontractorId: string; workNote?: string }[];
  labourEntries?: { category: string; men: number; women: number }[];
  workRecords: WorkRecordDetail[];
  consumptions: ConsumptionDetail[];
  rmcEntries: RmcEntryDetail[];
  expenses: ExpenseDetail[];
  photos: PhotoDetail[];
  // Story 3.5 (AD-9, FR-54): corrections are a new linked row, never an
  // edit — correctsId/reason are set when this DSR *is* a correction;
  // correctedById is set when a later correction supersedes this one.
  correctsId: string | null;
  reason: string | null;
  correctedById: string | null;
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
  const expensesTotal = dsr.expenses.reduce((sum, e) => sum + e.amount, 0);
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

        <Card>
          <h2 className="mb-3 text-card-title text-ink-900">Materials consumed</h2>
          {dsr.consumptions.length === 0 ? (
            <p className="text-body-sm text-ink-500">No materials logged for this report.</p>
          ) : (
            <ul className="flex flex-col gap-1 text-body-sm text-ink-900">
              {dsr.consumptions.map((c) => (
                <li key={c.id} className="flex justify-between border-b border-border-hairline py-1.5 last:border-b-0">
                  <span>
                    {c.materialSize.material.name} ({c.materialSize.label})
                  </span>
                  <span className="text-ink-500">{c.quantity}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="mb-3 text-card-title text-ink-900">RMC (ready-mix concrete) used</h2>
          {dsr.rmcEntries.length === 0 ? (
            <p className="text-body-sm text-ink-500">No RMC delivery logged for this report.</p>
          ) : (
            <ul className="flex flex-col gap-1 text-body-sm text-ink-900">
              {dsr.rmcEntries.map((r) => (
                <li key={r.id} className="flex justify-between border-b border-border-hairline py-1.5 last:border-b-0">
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
          {subcontractorEntries.length === 0 ? (
            <p className="text-body-sm text-ink-500">No Subcontractors tagged for this report.</p>
          ) : (
            <ul className="flex flex-col gap-1 text-body-sm text-ink-900">
              {subcontractorEntries.map((s, index) => (
                <li key={`${s.subcontractorId}-${index}`} className="flex justify-between border-b border-border-hairline py-1.5 last:border-b-0">
                  <span>{subcontractorNames.get(s.subcontractorId) ?? "Subcontractor"}</span>
                  <span className="text-ink-500">{s.workNote ?? "—"}</span>
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
            {dsr.expenses.length > 0 ? (
              <span className="font-semibold text-gold-700">— ₹{expensesTotal.toLocaleString("en-IN")}</span>
            ) : null}
          </h2>
          {dsr.expenses.length === 0 ? (
            <p className="text-body-sm text-ink-500">No expenses logged for this report.</p>
          ) : (
            <ul className="flex flex-col gap-1 text-body-sm text-ink-900">
              {dsr.expenses.map((e) => (
                <li key={e.id} className="flex justify-between border-b border-border-hairline py-1.5 last:border-b-0">
                  <span>{e.description ?? e.category.name}</span>
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
                  {/* eslint-disable-next-line @next/next/no-img-element -- a
                      durable Cloudinary CDN URL, same reasoning as story
                      3.3's gallery page. */}
                  <img
                    src={photo.url}
                    alt=""
                    loading="lazy"
                    className="size-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
