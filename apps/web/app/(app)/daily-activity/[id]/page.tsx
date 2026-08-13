import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import type { DsrEquipmentUsed } from "@azentisfieldos/shared";
import { AlertTriangleIcon, Card, RotateCcwIcon, buttonVariants, cn } from "@azentisfieldos/ui";

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
  totalAmount: number;
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
  const res = await fetch(`${process.env.API_URL}/dsr/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to load Daily Site Report (${res.status})`);
  }
  return res.json();
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
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

  return (
    <>
      <div className="mb-2 text-eyebrow text-ink-500">
        <Link href="/daily-activity" className="hover:text-accent-teal-700 hover:underline">
          Daily Activity
        </Link>{" "}
        / {dsr.site.name}
      </div>
      <div className="mb-6 flex items-start justify-between gap-4">
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
          <h2 className="mb-3 text-card-title text-ink-900">RMC used</h2>
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
                    {r.quantityM3} m³ · <span className="font-semibold text-gold-700">₹{r.totalAmount.toLocaleString("en-IN")}</span>
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
              {dsr.equipmentUsed.map((e) => (
                <li key={e.id} className="rounded-md border border-border-hairline bg-surface-2 px-3 py-1 text-body-sm text-ink-900">
                  {e.name}
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
                      presigned R2 URL with a dynamic per-request signature,
                      same reasoning as story 3.3's gallery page. */}
                  <img src={photo.url} alt="" className="size-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
